import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const apiKey = process.env.VITE_GEMINI_API_KEY || 'AIzaSyAJ9Q8cd04YaanhJ7SlWLjlkDsNq0AvLQA';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
      console.log(`⚠️  Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Analyze JSON document and extract structured information
 * @param {Object} jsonData - The JSON data to analyze
 * @param {string} analysisType - Type of analysis ('basic', 'detailed', 'schema')
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeJSON(jsonData, analysisType = 'basic') {
  try {
    const prompts = {
      basic: `
Analyze this JSON data and provide a basic summary:
${JSON.stringify(jsonData, null, 2)}

Return a JSON response with:
{
  "summary": "brief summary",
  "keyFields": ["field1", "field2"],
  "dataType": "type of data",
  "estimatedSize": "size estimate"
}
`,
      detailed: `
Provide a detailed analysis of this JSON data:
${JSON.stringify(jsonData, null, 2)}

Return a JSON response with:
{
  "documentInfo": {
    "title": "extracted title",
    "author": "extracted author",
    "creationDate": "extracted date",
    "type": "extracted type"
  },
  "contentAnalysis": {
    "summary": "detailed summary",
    "keyConcepts": ["concept1", "concept2"],
    "complexity": "beginner|intermediate|advanced",
    "estimatedReadingTime": "minutes"
  },
  "recommendations": ["recommendation1", "recommendation2"]
}
`,
      schema: `
Validate this JSON data against common schemas:
${JSON.stringify(jsonData, null, 2)}

Return a JSON response with:
{
  "isValid": true/false,
  "schemaType": "detected schema type",
  "missingFields": ["field1", "field2"],
  "invalidFields": ["field1: reason"],
  "compliance": "percentage",
  "suggestions": ["suggestion1", "suggestion2"]
}
`
    };

    const prompt = prompts[analysisType] || prompts.basic;
    
    const result = await retryWithBackoff(async () => {
      return await model.generateContent(prompt);
    });
    
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Could not parse JSON response, returning raw text');
    }
    
    return { rawResponse: text };
    
  } catch (error) {
    console.error('JSON analysis failed:', error.message);
    throw error;
  }
}

/**
 * Transform JSON data between different formats
 * @param {Object} jsonData - Source JSON data
 * @param {string} targetFormat - Target format ('cms', 'api', 'database', 'export')
 * @returns {Promise<Object>} Transformed data
 */
export async function transformJSON(jsonData, targetFormat = 'cms') {
  try {
    const formatPrompts = {
      cms: `
Transform this JSON data into a CMS format:
${JSON.stringify(jsonData, null, 2)}

Transform to:
{
  "id": "unique-id",
  "title": "document title",
  "description": "brief description",
  "content": "full content",
  "tags": ["tag1", "tag2"],
  "category": "main category",
  "author": "author name",
  "createdAt": "ISO date",
  "updatedAt": "ISO date",
  "status": "published|draft|archived",
  "difficulty": "beginner|intermediate|advanced"
}
`,
      api: `
Transform this JSON data into an API response format:
${JSON.stringify(jsonData, null, 2)}

Transform to:
{
  "success": true,
  "data": {
    "id": "unique-id",
    "attributes": { /* original data */ },
    "meta": {
      "created": "timestamp",
      "updated": "timestamp",
      "version": "1.0"
    }
  },
  "links": {
    "self": "api-url",
    "related": ["related-urls"]
  }
}
`,
      database: `
Transform this JSON data into a database record format:
${JSON.stringify(jsonData, null, 2)}

Transform to:
{
  "table_name": "suggested_table",
  "columns": {
    "id": "uuid",
    "title": "varchar(255)",
    "content": "text",
    "metadata": "jsonb",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "data": {
    "id": "generated-uuid",
    "title": "extracted title",
    "content": "extracted content",
    "metadata": { /* original metadata */ },
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
`,
      export: `
Transform this JSON data into an export format:
${JSON.stringify(jsonData, null, 2)}

Transform to:
{
  "export_info": {
    "format": "json",
    "version": "1.0",
    "exported_at": "timestamp",
    "source": "original source"
  },
  "data": { /* original data */ },
  "metadata": {
    "record_count": "number",
    "file_size": "estimated size",
    "checksum": "calculated checksum"
  }
}
`
    };

    const prompt = formatPrompts[targetFormat] || formatPrompts.cms;
    
    const result = await retryWithBackoff(async () => {
      return await model.generateContent(prompt);
    });
    
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Could not parse JSON response, returning raw text');
    }
    
    return { rawResponse: text };
    
  } catch (error) {
    console.error('JSON transformation failed:', error.message);
    throw error;
  }
}

/**
 * Generate natural language description from JSON data
 * @param {Object} jsonData - The JSON data to describe
 * @param {string} style - Description style ('brief', 'detailed', 'technical', 'casual')
 * @returns {Promise<string>} Natural language description
 */
export async function describeJSON(jsonData, style = 'brief') {
  try {
    const stylePrompts = {
      brief: `
Provide a brief, 2-3 sentence description of this JSON data:
${JSON.stringify(jsonData, null, 2)}
`,
      detailed: `
Provide a detailed description of this JSON data including:
- What the data represents
- Key information contained
- Structure and organization
- Potential use cases

Data:
${JSON.stringify(jsonData, null, 2)}
`,
      technical: `
Provide a technical description of this JSON data including:
- Data structure analysis
- Field types and relationships
- Schema validation notes
- Technical considerations

Data:
${JSON.stringify(jsonData, null, 2)}
`,
      casual: `
Describe this JSON data in a casual, conversational tone:
${JSON.stringify(jsonData, null, 2)}
`
    };

    const prompt = stylePrompts[style] || stylePrompts.brief;
    
    const result = await retryWithBackoff(async () => {
      return await model.generateContent(prompt);
    });
    
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('JSON description failed:', error.message);
    throw error;
  }
}

/**
 * Extract specific information from JSON data
 * @param {Object} jsonData - The JSON data to extract from
 * @param {Array<string>} fields - Array of field names to extract
 * @returns {Promise<Object>} Extracted data
 */
export async function extractFromJSON(jsonData, fields = []) {
  try {
    const fieldList = fields.length > 0 ? fields.join(', ') : 'all available fields';
    
    const prompt = `
Extract the following fields from this JSON data: ${fieldList}

JSON Data:
${JSON.stringify(jsonData, null, 2)}

Return only the extracted data in JSON format.
`;

    const result = await retryWithBackoff(async () => {
      return await model.generateContent(prompt);
    });
    
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Could not parse JSON response, returning raw text');
    }
    
    return { rawResponse: text };
    
  } catch (error) {
    console.error('JSON extraction failed:', error.message);
    throw error;
  }
}

/**
 * Validate JSON data and provide recommendations
 * @param {Object} jsonData - The JSON data to validate
 * @returns {Promise<Object>} Validation results
 */
export async function validateJSON(jsonData) {
  try {
    const prompt = `
Validate this JSON data and provide recommendations:

${JSON.stringify(jsonData, null, 2)}

Provide validation results in JSON format:
{
  "isValid": true/false,
  "issues": ["issue1", "issue2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "quality_score": "percentage",
  "compliance": {
    "json_schema": true/false,
    "data_integrity": true/false,
    "best_practices": true/false
  }
}
`;

    const result = await retryWithBackoff(async () => {
      return await model.generateContent(prompt);
    });
    
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Could not parse JSON response, returning raw text');
    }
    
    return { rawResponse: text };
    
  } catch (error) {
    console.error('JSON validation failed:', error.message);
    throw error;
  }
}

// Export utility functions
export default {
  analyzeJSON,
  transformJSON,
  describeJSON,
  extractFromJSON,
  validateJSON,
  retryWithBackoff
}; 