import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Load environment variables
const apiKey = process.env.VITE_GEMINI_API_KEY || 'AIzaSyAJ9Q8cd04YaanhJ7SlWLjlkDsNq0AvLQA';

if (!apiKey) {
  console.error('❌ Missing Gemini API key. Please set VITE_GEMINI_API_KEY environment variable.');
  process.exit(1);
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(apiKey);

// Retry function with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isRetryableError = error?.message?.includes('overloaded') || 
                              error?.message?.includes('503') ||
                              error?.message?.includes('429') ||
                              error?.message?.includes('Service Unavailable');
      
      if (isLastAttempt || !isRetryableError) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`⚠️  Attempt ${attempt + 1} failed (${error.message}), retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

async function testGeminiWithJSON() {
  console.log('🧪 Testing Gemini API with JSON file...\n');

  try {
    // Load test data
    const testData = JSON.parse(fs.readFileSync('./test-data.json', 'utf8'));
    console.log('📄 Loaded test document:', testData.title);
    console.log('📝 Content length:', testData.content.length, 'characters');
    console.log('🏷️  Topics:', testData.topics.join(', '));
    console.log('📊 Metadata:', JSON.stringify(testData.metadata, null, 2));
    console.log('');

    // Try different models
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    let workingModel = null;
    let model = null;

    for (const modelName of models) {
      try {
        console.log(`🔧 Trying model: ${modelName}...`);
        model = genAI.getGenerativeModel({ model: modelName });
        
        // Test with a simple prompt first
        const testResult = await retryWithBackoff(async () => {
          return await model.generateContent("Say hello");
        });
        
        workingModel = modelName;
        console.log(`✅ Model ${modelName} is working!`);
        break;
      } catch (error) {
        console.log(`❌ Model ${modelName} failed: ${error.message}`);
        continue;
      }
    }

    if (!workingModel) {
      throw new Error('All Gemini models are currently unavailable');
    }

    console.log(`🚀 Using model: ${workingModel}\n`);

    // Test 1: Simple content analysis
    console.log('🔍 Test 1: Simple Content Analysis');
    console.log('─'.repeat(50));
    
    const analysisPrompt = `
Please analyze the following document and provide a brief summary in JSON format.

Document Title: ${testData.title}
Content: ${testData.content}

Please respond with a JSON object containing:
{
  "summary": "2-3 sentence summary",
  "mainTopics": ["topic1", "topic2", "topic3"],
  "complexity": "beginner|intermediate|advanced",
  "wordCount": estimated_count
}
`;

    const analysisResult = await retryWithBackoff(async () => {
      return await model.generateContent(analysisPrompt);
    });
    
    const analysisResponse = await analysisResult.response;
    const analysisText = analysisResponse.text();
    
    console.log('✅ Analysis completed!');
    console.log('📊 Response:', analysisText);
    console.log('');

    // Test 2: JSON processing
    console.log('📋 Test 2: JSON Processing');
    console.log('─'.repeat(50));
    
    const jsonPrompt = `
Please process the following JSON data and extract key information.

JSON Data:
${JSON.stringify(testData, null, 2)}

Please provide a structured analysis in JSON format:
{
  "documentInfo": {
    "title": "extracted title",
    "author": "extracted author",
    "creationDate": "extracted date",
    "type": "extracted type"
  },
  "contentAnalysis": {
    "keyConcepts": ["concept1", "concept2", "concept3"],
    "difficulty": "extracted difficulty",
    "estimatedReadingTime": "estimated minutes"
  },
  "recommendations": ["recommendation1", "recommendation2"]
}
`;

    const jsonResult = await retryWithBackoff(async () => {
      return await model.generateContent(jsonPrompt);
    });
    
    const jsonResponse = await jsonResult.response;
    const jsonText = jsonResponse.text();
    
    console.log('✅ JSON processing completed!');
    console.log('📊 Response:', jsonText);
    console.log('');

    // Test 3: Question answering
    console.log('❓ Test 3: Question Answering');
    console.log('─'.repeat(50));
    
    const question = "What are the main topics covered in this document and how do they relate to each other?";
    console.log('❓ Question:', question);
    
    const qaPrompt = `
Based on the following document, please answer the question.

Document:
${JSON.stringify(testData, null, 2)}

Question: ${question}

Please provide a clear, concise answer.
`;

    const qaResult = await retryWithBackoff(async () => {
      return await model.generateContent(qaPrompt);
    });
    
    const qaResponse = await qaResult.response;
    const qaText = qaResponse.text();
    
    console.log('✅ Question answered!');
    console.log('💡 Answer:', qaText);
    console.log('');

    console.log('🎉 All Gemini API tests passed successfully!');
    console.log('✨ Your Gemini integration is working perfectly!');
    console.log(`🔧 Model used: ${workingModel}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔧 Error details:', error);
    
    // Provide helpful debugging information
    console.log('\n🛠️  Debugging Information:');
    console.log('─'.repeat(50));
    console.log('1. Check your API key is valid and active');
    console.log('2. Ensure you have internet connectivity');
    console.log('3. Check if you have sufficient API quota');
    console.log('4. Verify the test-data.json file exists');
    console.log('5. Try again later if service is overloaded');
    
    process.exit(1);
  }
}

// Run the test
testGeminiWithJSON();