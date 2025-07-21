import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Load environment variables
const apiKey = process.env.VITE_GEMINI_API_KEY || 'AIzaSyAJ9Q8cd04YaanhJ7SlWLjlkDsNq0AvLQA';

console.log('🔍 Gemini API Diagnostics\n');
console.log('─'.repeat(60));

// Check API key format
console.log('🔑 API Key Validation:');
console.log('  Format:', apiKey ? '✅ Present' : '❌ Missing');
console.log('  Length:', apiKey ? `${apiKey.length} characters` : 'N/A');
console.log('  Starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
console.log('  Valid format:', apiKey && apiKey.startsWith('AIza') ? '✅ Yes' : '❌ No');
console.log('');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(apiKey);

// Test different models with simple requests
async function testModel(modelName) {
  try {
    console.log(`🔧 Testing ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Simple test request
    const result = await model.generateContent("Hello");
    const response = await result.response;
    const text = response.text();
    
    console.log(`  ✅ ${modelName}: Working`);
    console.log(`  📝 Response: "${text}"`);
    return { model, working: true };
  } catch (error) {
    console.log(`  ❌ ${modelName}: ${error.message}`);
    return { model: null, working: false, error: error.message };
  }
}

async function runDiagnostics() {
  try {
    // Test available models
    console.log('🤖 Model Availability Test:');
    console.log('─'.repeat(40));
    
    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-pro', 
      'gemini-pro',
      'gemini-1.0-pro'
    ];
    
    const results = {};
    
    for (const modelName of models) {
      results[modelName] = await testModel(modelName);
      console.log('');
    }
    
    // Summary
    console.log('📊 Test Summary:');
    console.log('─'.repeat(40));
    
    const workingModels = Object.entries(results).filter(([name, result]) => result.working);
    const failedModels = Object.entries(results).filter(([name, result]) => !result.working);
    
    console.log(`✅ Working models: ${workingModels.length}`);
    workingModels.forEach(([name]) => console.log(`  - ${name}`));
    
    console.log(`❌ Failed models: ${failedModels.length}`);
    failedModels.forEach(([name, result]) => console.log(`  - ${name}: ${result.error}`));
    
    console.log('');
    
    // If we have working models, test JSON processing
    if (workingModels.length > 0) {
      console.log('📋 JSON Processing Test:');
      console.log('─'.repeat(40));
      
      const testData = JSON.parse(fs.readFileSync('./test-data.json', 'utf8'));
      console.log('📄 Test data loaded successfully');
      console.log('  Title:', testData.title);
      console.log('  Content length:', testData.content.length, 'characters');
      
      // Use the first working model
      const [modelName, modelResult] = workingModels[0];
      const model = modelResult.model;
      
      console.log(`\n🚀 Testing JSON processing with ${modelName}...`);
      
      const jsonPrompt = `
Please analyze this JSON data and provide a brief summary:

${JSON.stringify(testData, null, 2)}

Respond with a simple summary in 2-3 sentences.
`;

      try {
        const result = await model.generateContent(jsonPrompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ JSON processing successful!');
        console.log('📝 Response:', text);
        
      } catch (error) {
        console.log('❌ JSON processing failed:', error.message);
      }
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('─'.repeat(40));
    
    if (workingModels.length > 0) {
      console.log('✅ Your Gemini API is working!');
      console.log(`🎯 Recommended model: ${workingModels[0][0]}`);
      console.log('📝 You can now use Gemini for JSON processing and analysis');
    } else {
      console.log('❌ No models are currently working');
      console.log('🔧 Possible solutions:');
      console.log('  1. Check your internet connection');
      console.log('  2. Verify your API key is valid');
      console.log('  3. Check your API quota at https://makersuite.google.com/app/apikey');
      console.log('  4. Try again later if service is overloaded');
      console.log('  5. Contact Google support if issues persist');
    }
    
  } catch (error) {
    console.error('❌ Diagnostics failed:', error.message);
    console.error('🔧 Error details:', error);
  }
}

// Run diagnostics
runDiagnostics(); 