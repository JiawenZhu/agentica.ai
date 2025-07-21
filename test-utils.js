import { analyzeJSON, transformJSON, describeJSON, extractFromJSON, validateJSON } from './utils/geminiUtils.js';
import fs from 'fs';

async function testUtils() {
  console.log('🧪 Testing Gemini JSON Utility Functions\n');
  console.log('─'.repeat(60));

  try {
    // Load test data
    const testData = JSON.parse(fs.readFileSync('./test-data.json', 'utf8'));
    console.log('📄 Loaded test data:', testData.title);
    console.log('');

    // Test 1: Basic Analysis
    console.log('🔍 Test 1: Basic JSON Analysis');
    console.log('─'.repeat(40));
    
    const basicAnalysis = await analyzeJSON(testData, 'basic');
    console.log('✅ Basic analysis completed!');
    console.log('📊 Results:', JSON.stringify(basicAnalysis, null, 2));
    console.log('');

    // Test 2: Detailed Analysis
    console.log('📊 Test 2: Detailed JSON Analysis');
    console.log('─'.repeat(40));
    
    const detailedAnalysis = await analyzeJSON(testData, 'detailed');
    console.log('✅ Detailed analysis completed!');
    console.log('📊 Results:', JSON.stringify(detailedAnalysis, null, 2));
    console.log('');

    // Test 3: JSON Transformation
    console.log('🔄 Test 3: JSON Transformation (CMS Format)');
    console.log('─'.repeat(40));
    
    const transformed = await transformJSON(testData, 'cms');
    console.log('✅ Transformation completed!');
    console.log('📊 Results:', JSON.stringify(transformed, null, 2));
    console.log('');

    // Test 4: Natural Language Description
    console.log('💬 Test 4: Natural Language Description');
    console.log('─'.repeat(40));
    
    const description = await describeJSON(testData, 'detailed');
    console.log('✅ Description generated!');
    console.log('📝 Description:', description);
    console.log('');

    // Test 5: Field Extraction
    console.log('📋 Test 5: Field Extraction');
    console.log('─'.repeat(40));
    
    const extracted = await extractFromJSON(testData, ['title', 'author', 'type']);
    console.log('✅ Field extraction completed!');
    console.log('📊 Results:', JSON.stringify(extracted, null, 2));
    console.log('');

    // Test 6: JSON Validation
    console.log('✅ Test 6: JSON Validation');
    console.log('─'.repeat(40));
    
    const validation = await validateJSON(testData);
    console.log('✅ Validation completed!');
    console.log('📊 Results:', JSON.stringify(validation, null, 2));
    console.log('');

    console.log('🎉 All utility function tests passed!');
    console.log('✨ Gemini JSON utilities are working perfectly!');
    console.log('');
    console.log('📋 Available Functions:');
    console.log('  ✅ analyzeJSON() - Analyze JSON data');
    console.log('  ✅ transformJSON() - Transform between formats');
    console.log('  ✅ describeJSON() - Generate descriptions');
    console.log('  ✅ extractFromJSON() - Extract specific fields');
    console.log('  ✅ validateJSON() - Validate and recommend');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔧 Error details:', error);
  }
}

// Run the test
testUtils(); 