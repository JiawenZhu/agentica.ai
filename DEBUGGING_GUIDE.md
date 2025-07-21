# Debugging Guide: Gemini API & Supabase Issues

## 🚨 **Common Issues & Solutions**

### **1. Gemini API 503 "Service Unavailable" Error**

#### **Problem:**
```
[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent: [503 Service Unavailable] The model is overloaded. Please try again later.
```

#### **Root Cause:**
- **Concurrency Overload**: Too many simultaneous API calls
- **Rate Limiting**: Exceeding API quota or rate limits
- **Service Overload**: Google's servers are temporarily overloaded

#### **Solutions Implemented:**

##### **A. Concurrency Control**
```javascript
import pLimit from 'p-limit';

// Limit to 1 concurrent Gemini API call
const limit = pLimit(1);

const processPromises = files.map((file, index) => 
  limit(() => processFile(file, index))
);

await Promise.all(processPromises);
```

##### **B. Retry Logic with Exponential Backoff**
```javascript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryableError = error?.message?.includes('overloaded') || 
                              error?.message?.includes('503') ||
                              error?.message?.includes('429');
      
      if (isLastAttempt || !isRetryableError) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

##### **C. User-Friendly Error Messages**
```javascript
if (error.message.includes('503') || error.message.includes('overloaded')) {
  errorMessage = 'AI service is temporarily overloaded. Please try again later.';
}
```

### **2. Supabase 400 "Bad Request" Error**

#### **Problem:**
```
Failed to load resource: the server responded with a status of 400 ()
Error processing file: Object
```

#### **Root Cause:**
- **Null Values**: Trying to insert null into NOT NULL columns
- **Data Type Mismatch**: Wrong data types for columns
- **Missing Required Fields**: Required columns not provided
- **Constraint Violations**: Unique constraints, foreign keys, etc.

#### **Solutions Implemented:**

##### **A. Enhanced Data Validation**
```javascript
// Ensure content is not null or empty
if (!content || content.trim().length === 0) {
  throw new Error('Document content cannot be empty');
}

// Prepare data with proper null handling
const insertData = {
  content: content.trim(),
  summary: analysis?.summary || null,
  key_topics: analysis?.keyTopics || [],
  entities: analysis?.entities || [],
  // ... other fields with defaults
};
```

##### **B. Fallback Upload Function**
```javascript
async uploadDocumentBasic(agentId, file, content, metadata) {
  // Simplified upload without analysis data
  const insertData = {
    content: content.trim(),
    analysis: {},
    summary: null,
    key_topics: [],
    // ... minimal required fields
  };
}
```

##### **C. Enhanced Error Logging**
```javascript
if (error) {
  console.error('Supabase upload error:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  });
}
```

## 🔍 **Debugging Steps**

### **Step 1: Check Browser Network Tab**

1. **Open Developer Tools** (F12)
2. **Go to Network Tab**
3. **Trigger the file upload**
4. **Look for failed requests**:
   - `generativelanguage.googleapis.com` (Gemini API)
   - `your-project.supabase.co` (Supabase)

### **Step 2: Analyze Request Details**

#### **For Gemini API Errors:**
- **Status**: 503, 429, 400
- **Response**: Check error message in response body
- **Headers**: Check rate limiting headers

#### **For Supabase Errors:**
- **Status**: 400, 401, 403, 500
- **Request Payload**: Check what data is being sent
- **Response**: Look for detailed error message

### **Step 3: Check Console Logs**

Look for these log messages:
```javascript
// Concurrency control
"🔄 Starting Task X (delay)..."
"⚠️ Attempt X failed, retrying in Xms..."

// Supabase upload
"Uploading document with data: {...}"
"Supabase upload error: {...}"

// Error handling
"Error details: {...}"
```

### **Step 4: Verify Environment Variables**

```bash
# Check if these are set in .env.local
VITE_GEMINI_API_KEY=your_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## 🛠️ **Troubleshooting Commands**

### **Test Gemini API Connection:**
```bash
node test-gemini-diagnostics.js
```

### **Test JSON Processing:**
```bash
node test-json-processing.js
```

### **Test Concurrency Control:**
```bash
node test-fixes.js
```

### **Check API Key Validity:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models
```

## 📊 **Monitoring & Prevention**

### **1. Rate Limiting Dashboard**
- Monitor API usage in Google Cloud Console
- Set up alerts for quota limits
- Track request patterns

### **2. Error Tracking**
```javascript
// Enhanced error logging
console.error('Error details:', {
  message: error.message,
  code: error.code,
  details: error.details,
  hint: error.hint,
  file: fileName,
  contentLength: content?.length || 0,
  timestamp: new Date().toISOString()
});
```

### **3. Performance Monitoring**
```javascript
// Track processing times
const startTime = Date.now();
await processFile(file);
const endTime = Date.now();
console.log(`Processing time: ${endTime - startTime}ms`);
```

## 🎯 **Best Practices**

### **1. Concurrency Management**
- **Start with 1 concurrent request**
- **Gradually increase** if stable
- **Monitor for 503 errors**
- **Implement circuit breaker** for persistent failures

### **2. Data Validation**
- **Validate content** before upload
- **Handle null values** properly
- **Check data types** match schema
- **Use fallback functions** for failures

### **3. User Experience**
- **Show progress indicators**
- **Provide specific error messages**
- **Offer retry options**
- **Graceful degradation**

### **4. Error Recovery**
- **Implement retry logic**
- **Use exponential backoff**
- **Fallback to simpler processing**
- **Cache successful results**

## 🚀 **Quick Fixes**

### **Immediate Actions:**
1. **Reduce concurrency** to 1 request at a time
2. **Add retry logic** with exponential backoff
3. **Validate data** before Supabase upload
4. **Implement fallback** upload functions
5. **Enhance error logging** for debugging

### **Long-term Improvements:**
1. **Implement caching** for API responses
2. **Add circuit breaker** pattern
3. **Set up monitoring** and alerts
4. **Optimize data processing** pipeline
5. **Add comprehensive testing**

---

**Remember**: The key to resolving these issues is **concurrency control** for Gemini API and **data validation** for Supabase. The fixes implemented should resolve both the 503 and 400 errors you're experiencing. 