import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('Missing Gemini API key. Please add VITE_GEMINI_API_KEY to your .env.local file.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export interface DocumentAnalysis {
  summary: string;
  keyTopics: string[];
  entities: string[];
  categories: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  language: string;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  wordCount: number;
  keyPhrases: string[];
  questions: string[];
  actionItems: string[];
}

export interface ChunkData {
  content: string;
  summary: string;
  keywords: string[];
  importance: number; // 1-10 scale
  chunkIndex: number;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  /**
   * Retry function with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        const isLastAttempt = attempt === maxRetries - 1;
        const isRetryableError = error?.message?.includes('overloaded') || 
                                error?.message?.includes('503') ||
                                error?.message?.includes('429');
        
        if (isLastAttempt || !isRetryableError) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`Gemini API attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Analyze document content and extract structured information
   */
  async analyzeDocument(content: string, filename: string): Promise<DocumentAnalysis> {
    try {
      const prompt = `
Analyze the following document content and provide a structured analysis in JSON format.

Document: ${filename}
Content: ${content.substring(0, 8000)} ${content.length > 8000 ? '...[truncated]' : ''}

Please provide analysis in this exact JSON structure:
{
  "summary": "Brief 2-3 sentence summary of the document",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "entities": ["person1", "company1", "location1"],
  "categories": ["category1", "category2"],
  "sentiment": "positive|negative|neutral",
  "language": "detected language",
  "readingLevel": "beginner|intermediate|advanced",
  "wordCount": estimated_word_count,
  "keyPhrases": ["phrase1", "phrase2", "phrase3"],
  "questions": ["question1", "question2"],
  "actionItems": ["action1", "action2"]
}

Focus on extracting practical, useful information that would help an AI agent understand and use this content effectively.
`;

      const result = await this.retryWithBackoff(async () => {
        return await this.model.generateContent(prompt);
      });
      
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from Gemini response');
      }

      const analysis = JSON.parse(jsonMatch[0]) as DocumentAnalysis;
      
      // Validate and sanitize the response
      return {
        summary: analysis.summary || 'No summary available',
        keyTopics: Array.isArray(analysis.keyTopics) ? analysis.keyTopics.slice(0, 10) : [],
        entities: Array.isArray(analysis.entities) ? analysis.entities.slice(0, 10) : [],
        categories: Array.isArray(analysis.categories) ? analysis.categories.slice(0, 5) : [],
        sentiment: ['positive', 'negative', 'neutral'].includes(analysis.sentiment) ? analysis.sentiment : 'neutral',
        language: analysis.language || 'unknown',
        readingLevel: ['beginner', 'intermediate', 'advanced'].includes(analysis.readingLevel) ? analysis.readingLevel : 'intermediate',
        wordCount: typeof analysis.wordCount === 'number' ? analysis.wordCount : content.split(' ').length,
        keyPhrases: Array.isArray(analysis.keyPhrases) ? analysis.keyPhrases.slice(0, 10) : [],
        questions: Array.isArray(analysis.questions) ? analysis.questions.slice(0, 5) : [],
        actionItems: Array.isArray(analysis.actionItems) ? analysis.actionItems.slice(0, 5) : []
      };

    } catch (error) {
      console.error('Error analyzing document with Gemini:', error);
      
      // Fallback analysis
      return {
        summary: 'Document analysis failed. Content has been stored for basic search.',
        keyTopics: [],
        entities: [],
        categories: ['uncategorized'],
        sentiment: 'neutral',
        language: 'unknown',
        readingLevel: 'intermediate',
        wordCount: content.split(' ').length,
        keyPhrases: [],
        questions: [],
        actionItems: []
      };
    }
  }

  /**
   * Split document into intelligent chunks based on content structure
   */
  async createIntelligentChunks(content: string, maxChunkSize: number = 1000): Promise<ChunkData[]> {
    try {
      const prompt = `
Split the following content into logical chunks for a knowledge base. Each chunk should be self-contained and meaningful.

Content: ${content}

Requirements:
- Maximum ${maxChunkSize} characters per chunk
- Split at natural boundaries (paragraphs, sections, topics)
- Each chunk should be understandable on its own
- Provide a summary and keywords for each chunk
- Rate importance from 1-10 (10 being most important)

Return JSON array in this format:
[
  {
    "content": "chunk content here",
    "summary": "brief summary of this chunk",
    "keywords": ["keyword1", "keyword2"],
    "importance": 8,
    "chunkIndex": 0
  }
]
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // Fallback to simple chunking
        return this.createSimpleChunks(content, maxChunkSize);
      }

      const chunks = JSON.parse(jsonMatch[0]) as ChunkData[];
      
      // Validate and sanitize chunks
      return chunks.map((chunk, index) => ({
        content: chunk.content || '',
        summary: chunk.summary || 'No summary available',
        keywords: Array.isArray(chunk.keywords) ? chunk.keywords.slice(0, 10) : [],
        importance: typeof chunk.importance === 'number' ? Math.max(1, Math.min(10, chunk.importance)) : 5,
        chunkIndex: index
      })).filter(chunk => chunk.content.length > 0);

    } catch (error) {
      console.error('Error creating intelligent chunks:', error);
      return this.createSimpleChunks(content, maxChunkSize);
    }
  }

  /**
   * Fallback method for simple content chunking
   */
  private createSimpleChunks(content: string, maxChunkSize: number): ChunkData[] {
    const chunks: ChunkData[] = [];
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          summary: currentChunk.substring(0, 100) + '...',
          keywords: this.extractSimpleKeywords(currentChunk),
          importance: 5,
          chunkIndex: chunkIndex++
        });
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    // Add the last chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        summary: currentChunk.substring(0, 100) + '...',
        keywords: this.extractSimpleKeywords(currentChunk),
        importance: 5,
        chunkIndex: chunkIndex
      });
    }

    return chunks;
  }

  /**
   * Simple keyword extraction for fallback
   */
  private extractSimpleKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Generate embeddings-ready text for vector search
   */
  async generateSearchableText(content: string, analysis: DocumentAnalysis): Promise<string> {
    try {
      const prompt = `
Create a search-optimized version of this content that includes the original text plus relevant context and keywords.

Original Content: ${content.substring(0, 4000)} ${content.length > 4000 ? '...[truncated]' : ''}

Analysis: ${JSON.stringify(analysis)}

Create a version that:
1. Includes the original content
2. Adds relevant synonyms and related terms
3. Includes context from the analysis
4. Makes it more discoverable for semantic search

Return only the enhanced searchable text.
`;

      const result = await this.retryWithBackoff(async () => {
        return await this.model.generateContent(prompt);
      });
      
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Error generating searchable text:', error);
      // Fallback: combine original content with analysis
      return `${content}\n\nKeywords: ${analysis.keyTopics.join(', ')}\nCategories: ${analysis.categories.join(', ')}\nSummary: ${analysis.summary}`;
    }
  }

  /**
   * Generate an answer based on search results from the knowledge base
   */
  async generateAnswer(question: string, searchResults: any[]): Promise<string> {
    try {
      // Prepare context from search results
      const context = searchResults
        .slice(0, 5) // Use top 5 most relevant results
        .map((result, index) => `
Source ${index + 1} (${result.filename}):
${result.content}
${result.summary ? `Summary: ${result.summary}` : ''}
${result.keywords ? `Keywords: ${result.keywords.join(', ')}` : ''}
---`)
        .join('\n');

      const prompt = `
You are a helpful AI assistant answering questions based on a knowledge base. 
Use the provided context to answer the user's question accurately and comprehensively.

Question: ${question}

Context from knowledge base:
${context}

Instructions:
- Answer based ONLY on the provided context
- If the context doesn't contain enough information, say so clearly
- Be specific and cite relevant details from the sources
- Keep the answer concise but complete
- If multiple sources provide different perspectives, acknowledge this
- Don't make up information not present in the context

Answer:`;

      const result = await this.retryWithBackoff(async () => {
        return await this.model.generateContent(prompt);
      });
      
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Error generating answer:', error);
      throw new Error('Failed to generate answer. Please try again.');
    }
  }

  /**
   * Generate questions that can be answered by this document
   */
  async generateAnswerableQuestions(content: string): Promise<string[]> {
    try {
      const prompt = `
Based on the following content, generate 5-10 questions that this document can answer.
Make the questions specific and practical - the kind of questions users might ask an AI agent.

Content: ${content}

Return only a JSON array of questions:
["question1", "question2", "question3"]
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return [];
      }

      const questions = JSON.parse(jsonMatch[0]);
      return Array.isArray(questions) ? questions.slice(0, 10) : [];

    } catch (error) {
      console.error('Error generating questions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();