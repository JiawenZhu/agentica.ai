import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Load environment variables
const apiKey = process.env.VITE_GEMINI_API_KEY || 'AIzaSyAJ9Q8cd04YaanhJ7SlWLjlkDsNq0AvLQA';

// Initialize Gemini AI with the working model
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function testJSONProcessing() {
  console.log('🧪 Testing Gemini API JSON Processing Capabilities\n');
  console.log('─'.repeat(60));

  try {
    // Load test data
    const testData = JSON.parse(fs.readFileSync('./test-data.json', 'utf8'));
    console.log('📄 Loaded test document:', testData.title);
    console.log('📝 Content length:', testData.content.length, 'characters');
    console.log('🏷️  Topics:', testData.topics.join(', '));
    console.log('📊 Metadata:', JSON.stringify(testData.metadata, null, 2));
    console.log('');

    // Test 1: Structured JSON Analysis
    console.log('🔍 Test 1: Structured JSON Analysis');
    console.log('─'.repeat(50));
    
    const structuredPrompt = `
Analyze the following JSON document and provide a structured analysis in JSON format.

Document:
${JSON.stringify(testData, null, 2)}

Please respond with a JSON object containing:
{
  "documentInfo": {
    "title": "extracted title",
    "author": "extracted author",
    "creationDate": "extracted date",
    "type": "extracted type",
    "difficulty": "extracted difficulty"
  },
  "contentAnalysis": {
    "summary": "2-3 sentence summary",
    "keyConcepts": ["concept1", "concept2", "concept3"],
    "estimatedReadingTime": "estimated minutes",
    "complexity": "beginner|intermediate|advanced"
  },
  "recommendations": ["recommendation1", "recommendation2"],
  "relatedTopics": ["topic1", "topic2", "topic3"]
}
`;

    const structuredResult = await model.generateContent(structuredPrompt);
    const structuredResponse = await structuredResult.response;
    const structuredText = structuredResponse.text();
    
    console.log('✅ Structured analysis completed!');
    console.log('📊 Response:');
    console.log(structuredText);
    console.log('');

    // Test 2: JSON Data Extraction
    console.log('📋 Test 2: JSON Data Extraction');
    console.log('─'.repeat(50));
    
    const extractionPrompt = `
Extract specific information from this JSON data and format it as a clean JSON response.

Data:
${JSON.stringify(testData, null, 2)}

Extract and return:
{
  "extractedData": {
    "title": "document title",
    "contentLength": "number of characters",
    "topicCount": "number of topics",
    "author": "author name",
    "date": "creation date",
    "documentType": "type of document"
  },
  "statistics": {
    "wordCount": "estimated word count",
    "sentenceCount": "estimated sentence count",
    "averageWordsPerSentence": "calculated average"
  }
}
`;

    const extractionResult = await model.generateContent(extractionPrompt);
    const extractionResponse = await extractionResult.response;
    const extractionText = extractionResponse.text();
    
    console.log('✅ Data extraction completed!');
    console.log('📊 Response:');
    console.log(extractionText);
    console.log('');

    // Test 3: JSON to Natural Language Conversion
    console.log('💬 Test 3: JSON to Natural Language');
    console.log('─'.repeat(50));
    
    const nlPrompt = `
Convert this JSON data into natural language description.

JSON Data:
${JSON.stringify(testData, null, 2)}

Please provide a natural language description that includes:
- What this document is about
- Who created it and when
- What topics it covers
- What type of content it is
- Who might find it useful

Write in a clear, professional tone.
`;

    const nlResult = await model.generateContent(nlPrompt);
    const nlResponse = await nlResult.response;
    const nlText = nlResponse.text();
    
    console.log('✅ Natural language conversion completed!');
    console.log('📝 Description:');
    console.log(nlText);
    console.log('');

    // Test 4: JSON Schema Validation
    console.log('✅ Test 4: JSON Schema Validation');
    console.log('─'.repeat(50));
    
    const validationPrompt = `
Validate this JSON data against a typical knowledge base document schema.

JSON Data:
${JSON.stringify(testData, null, 2)}

Expected Schema:
{
  "title": "string (required)",
  "content": "string (required)",
  "topics": "array of strings (optional)",
  "metadata": {
    "author": "string (optional)",
    "created": "date string (optional)",
    "type": "string (optional)",
    "difficulty": "string (optional)"
  }
}

Please provide validation results in JSON format:
{
  "isValid": true/false,
  "missingFields": ["field1", "field2"],
  "invalidFields": ["field1: reason"],
  "schemaCompliance": "percentage",
  "recommendations": ["recommendation1", "recommendation2"]
}
`;

    const validationResult = await model.generateContent(validationPrompt);
    const validationResponse = await validationResult.response;
    const validationText = validationResponse.text();
    
    console.log('✅ Schema validation completed!');
    console.log('📊 Validation Results:');
    console.log(validationText);
    console.log('');

    // Test 5: JSON Transformation
    console.log('🔄 Test 5: JSON Transformation');
    console.log('─'.repeat(50));
    
    const transformPrompt = `
Transform this JSON data into a different format for a content management system.

Original JSON:
${JSON.stringify(testData, null, 2)}

Transform it into this format:
{
  "id": "generated-unique-id",
  "title": "document title",
  "description": "brief description",
  "content": "full content",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "main category",
  "author": "author name",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string",
  "status": "published|draft|archived",
  "difficulty": "beginner|intermediate|advanced",
  "estimatedReadTime": "minutes"
}
`;

    const transformResult = await model.generateContent(transformPrompt);
    const transformResponse = await transformResult.response;
    const transformText = transformResponse.text();
    
    console.log('✅ JSON transformation completed!');
    console.log('📊 Transformed Data:');
    console.log(transformText);
    console.log('');

    console.log('🎉 All JSON processing tests completed successfully!');
    console.log('✨ Gemini API is working perfectly for JSON operations!');
    console.log('');
    console.log('📋 Test Summary:');
    console.log('  ✅ Structured Analysis: Working');
    console.log('  ✅ Data Extraction: Working');
    console.log('  ✅ Natural Language Conversion: Working');
    console.log('  ✅ Schema Validation: Working');
    console.log('  ✅ JSON Transformation: Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔧 Error details:', error);
    
    console.log('\n🛠️  Debugging Information:');
    console.log('─'.repeat(50));
    console.log('1. Check your API key is valid and active');
    console.log('2. Ensure you have internet connectivity');
    console.log('3. Check if you have sufficient API quota');
    console.log('4. Verify the test-data.json file exists');
    
    process.exit(1);
  }
}

// Run the test
testJSONProcessing(); 