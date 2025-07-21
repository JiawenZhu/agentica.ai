import { geminiService } from './services/geminiService.js';
import fs from 'fs';

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...\n');

  try {
    // Load test data
    const testData = JSON.parse(fs.readFileSync('./test-data.json', 'utf8'));
    console.log('📄 Loaded test document:', testData.title);
    console.log('📝 Content length:', testData.content.length, 'characters\n');

    // Test 1: Document Analysis
    console.log('🔍 Test 1: Document Analysis');
    console.log('─'.repeat(40));
    
    const analysis = await geminiService.analyzeDocument(testData.content, testData.title);
    console.log('✅ Analysis completed successfully!');
    console.log('📊 Summary:', analysis.summary);
    console.log('🏷️  Key Topics:', analysis.keyTopics.slice(0, 5).join(', '));
    console.log('🌍 Language:', analysis.language);
    console.log('📈 Word Count:', analysis.wordCount);
    console.log('');

    // Test 2: Intelligent Chunking
    console.log('🧩 Test 2: Intelligent Chunking');
    console.log('─'.repeat(40));
    
    const chunks = await geminiService.createIntelligentChunks(testData.content, 200);
    console.log('✅ Chunking completed successfully!');
    console.log('📦 Number of chunks:', chunks.length);
    
    chunks.forEach((chunk, index) => {
      console.log(`\n📄 Chunk ${index + 1}:`);
      console.log('  Content:', chunk.content.substring(0, 100) + '...');
      console.log('  Summary:', chunk.summary);
      console.log('  Keywords:', chunk.keywords?.join(', '));
      console.log('  Importance:', chunk.importance);
    });
    console.log('');

    // Test 3: Answer Generation
    console.log('💬 Test 3: Answer Generation');
    console.log('─'.repeat(40));
    
    const testQuestion = "What is artificial intelligence and how does it work?";
    console.log('❓ Question:', testQuestion);
    
    // Mock search results for testing
    const mockSearchResults = chunks.map((chunk, index) => ({
      content: chunk.content,
      summary: chunk.summary,
      keywords: chunk.keywords,
      filename: testData.title,
      chunk_index: index,
      similarity: 0.8 - (index * 0.1)
    }));
    
    const answer = await geminiService.generateAnswer(testQuestion, mockSearchResults);
    console.log('✅ Answer generated successfully!');
    console.log('💡 Answer:', answer);
    console.log('');

    // Test 4: Searchable Content Generation
    console.log('🔍 Test 4: Searchable Content Generation');
    console.log('─'.repeat(40));
    
    const searchableContent = await geminiService.generateSearchableText(
      chunks[0].content, 
      analysis
    );
    console.log('✅ Searchable content generated successfully!');
    console.log('🔎 Searchable content preview:', searchableContent.substring(0, 200) + '...');
    console.log('');

    // Test 5: Question Generation
    console.log('❓ Test 5: Question Generation');
    console.log('─'.repeat(40));
    
    const questions = await geminiService.generateAnswerableQuestions(testData.content);
    console.log('✅ Questions generated successfully!');
    console.log('📝 Generated questions:');
    questions.forEach((question, index) => {
      console.log(`  ${index + 1}. ${question}`);
    });
    console.log('');

    console.log('🎉 All Gemini API tests passed successfully!');
    console.log('✨ Your Gemini integration is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔧 Error details:', error);
    
    // Provide helpful debugging information
    console.log('\n🛠️  Debugging Information:');
    console.log('─'.repeat(40));
    console.log('1. Check your .env.local file for VITE_GEMINI_API_KEY');
    console.log('2. Verify your Gemini API key is valid and active');
    console.log('3. Ensure you have internet connectivity');
    console.log('4. Check if you have sufficient API quota');
    
    process.exit(1);
  }
}

// Run the test
testGeminiAPI();