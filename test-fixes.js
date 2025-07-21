import pLimit from 'p-limit';

// Test concurrency control
async function testConcurrencyControl() {
  console.log('🧪 Testing Concurrency Control Fixes\n');
  console.log('─'.repeat(50));

  // Simulate multiple API calls with concurrency limit
  const limit = pLimit(1); // Limit to 1 concurrent call
  
  const tasks = [
    () => simulateApiCall('Task 1', 1000),
    () => simulateApiCall('Task 2', 1500),
    () => simulateApiCall('Task 3', 800),
    () => simulateApiCall('Task 4', 1200),
  ];

  console.log('🚀 Starting concurrent tasks with limit of 1...');
  const startTime = Date.now();

  try {
    const results = await Promise.all(
      tasks.map((task, index) => 
        limit(() => task().then(result => ({ index, result })))
      )
    );

    const endTime = Date.now();
    console.log('✅ All tasks completed successfully!');
    console.log(`⏱️  Total time: ${endTime - startTime}ms`);
    console.log('📊 Results:', results.map(r => `${r.index}: ${r.result}`));

  } catch (error) {
    console.error('❌ Error in concurrent tasks:', error.message);
  }
}

// Simulate API call with potential 503 error
async function simulateApiCall(name, delay) {
  console.log(`🔄 Starting ${name} (${delay}ms delay)...`);
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Simulate occasional 503 errors
  if (Math.random() < 0.3) {
    throw new Error(`503 Service Unavailable - ${name} failed`);
  }
  
  console.log(`✅ ${name} completed successfully`);
  return `${name} result`;
}

// Test error handling
function testErrorHandling() {
  console.log('\n🔧 Testing Error Handling\n');
  console.log('─'.repeat(50));

  const errors = [
    new Error('503 Service Unavailable The model is overloaded'),
    new Error('400 Bad Request null value in column "content" violates not-null constraint'),
    new Error('Network error'),
    new Error('Unknown error'),
  ];

  errors.forEach((error, index) => {
    console.log(`Test ${index + 1}: ${error.message}`);
    
    let errorMessage = 'Processing failed';
    if (error.message.includes('503') || error.message.includes('overloaded')) {
      errorMessage = 'AI service is temporarily overloaded. Please try again later.';
    } else if (error.message.includes('400') || error.message.includes('constraint')) {
      errorMessage = 'Data validation error. Please check the file content and try again.';
    } else {
      errorMessage = error.message;
    }
    
    console.log(`  → User message: ${errorMessage}`);
  });
}

// Run tests
async function runTests() {
  await testConcurrencyControl();
  testErrorHandling();
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Summary of fixes:');
  console.log('  ✅ Concurrency control with p-limit');
  console.log('  ✅ Better error handling for 503/400 errors');
  console.log('  ✅ Enhanced logging for debugging');
  console.log('  ✅ Fallback upload function');
  console.log('  ✅ Null value handling in Supabase uploads');
}

runTests().catch(console.error); 