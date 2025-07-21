import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { 
  Upload, 
  File, 
  FileText, 
  Link, 
  X, 
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { geminiService, DocumentAnalysis } from '../services/geminiService';
import { fileParserService, ParsedFileResult } from '../services/fileParserService';
import pLimit from 'p-limit';

interface KnowledgeBaseUploadProps {
  agentId: string;
  onUploadComplete?: (document: any) => void;
  className?: string;
}

interface UploadedFile {
  file: File;
  content: string;
  analysis?: DocumentAnalysis;
  status: 'pending' | 'extracting' | 'analyzing' | 'chunking' | 'storing' | 'completed' | 'error';
  error?: string;
  progress?: number;
}

export function KnowledgeBaseUpload({ 
  agentId, 
  onUploadComplete, 
  className = '' 
}: KnowledgeBaseUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  // Process selected files
  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      // Log file details for debugging
      console.log('Processing file:', { 
        name: file.name, 
        type: file.type, 
        size: file.size,
        extension: file.name.split('.').pop()?.toLowerCase()
      });
      
      // Check if file type is supported
      const fileType = fileParserService.getFileType(file);
      const isSupported = fileParserService.isFileTypeSupported(file);
      
      console.log('File type detection:', { 
        detectedType: fileType, 
        isSupported 
      });
      
      if (!isSupported) {
        const supportedTypes = fileParserService.getSupportedFileTypes().join(', ');
        toast.error(
          <div>
            <div className="font-medium">{file.name}: Unsupported file type</div>
            <div className="text-sm mt-1">Supported: {supportedTypes}</div>
          </div>
        );
        return false;
      }
      
      // Check file size (50MB limit for larger files like presentations)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large. Maximum size is 50MB.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      content: '',
      status: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Process files with concurrency control to prevent Gemini API overload
    const limit = pLimit(1); // Limit to 1 concurrent Gemini API call to avoid 503 errors
    const processPromises = newFiles.map((uploadedFile, index) => 
      limit(() => processFile(uploadedFile, uploadedFiles.length + index))
    );

    try {
      await Promise.all(processPromises);
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Some files failed to process. Please try again later.');
    }
  };

  // Parse file content using the enhanced file parser
  const parseFileContent = async (file: File): Promise<ParsedFileResult> => {
    try {
      console.log(`Starting to parse file: ${file.name} (${file.type})`);
      const result = await fileParserService.parseFile(file);
      console.log('File parsing result:', {
        success: result.success,
        contentLength: result.content.length,
        fileType: result.metadata.fileType,
        wordCount: result.metadata.wordCount
      });
      return result;
    } catch (error) {
      console.error('Error in parseFileContent:', error);
      return {
        content: `Failed to parse ${file.name}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          fileType: file.name.split('.').pop()?.toLowerCase() || 'unknown',
          originalName: file.name,
          size: file.size,
          wordCount: 0
        },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parsing error'
      };
    }
  };

  // Process individual file with enhanced parsing and Gemini AI analysis
  const processFile = async (uploadedFile: UploadedFile, index: number) => {
    const updateStatus = (status: UploadedFile['status'], progress?: number, analysis?: DocumentAnalysis, parsedResult?: ParsedFileResult) => {
      setUploadedFiles(prev => 
        prev.map((f, i) => 
          i === index ? { ...f, status, progress, analysis, parsedResult } : f
        )
      );
    };

    try {
      // Step 1: Parse file content using enhanced parser
      updateStatus('parsing', 10);
      const parsedResult = await parseFileContent(uploadedFile.file);
      
      if (!parsedResult.success || !parsedResult.content || parsedResult.content.trim().length === 0) {
        throw new Error(parsedResult.error || 'No text content could be extracted from the file');
      }

      const content = parsedResult.content;
      updateStatus('extracting', 20, undefined, parsedResult);

      // Step 2: Analyze with Gemini AI
      updateStatus('analyzing', 40);
      const analysis = await geminiService.analyzeDocument(content, uploadedFile.file.name);
      
      // Step 3: Create intelligent chunks
      updateStatus('chunking', 60);
      const chunks = await geminiService.createIntelligentChunks(content, 1000);
      
      // Step 4: Generate searchable content for each chunk
      updateStatus('storing', 80);
      const enhancedChunks = await Promise.all(
        chunks.map(async (chunk) => ({
          ...chunk,
          searchable_content: await geminiService.generateSearchableText(chunk.content, analysis)
        }))
      );

      // Step 5: Upload to Supabase (fallback to basic upload if enhanced schema not available)
      let document, docError;
      try {
        const result = await supabaseService.uploadDocument(
          agentId,
          uploadedFile.file,
          content,
          analysis,
          {
            originalSize: uploadedFile.file.size,
            uploadedAt: new Date().toISOString(),
            processingMethod: 'enhanced-parser-gemini-ai',
            chunksCount: enhancedChunks.length,
            fileType: parsedResult.metadata.fileType,
            fileTypeDescription: fileParserService.getFileTypeDescription(parsedResult.metadata.fileType),
            ...parsedResult.metadata,
          }
        );
        document = result.data;
        docError = result.error;
      } catch (error) {
        console.warn('Enhanced upload failed, falling back to basic upload:', error);
        // Fallback to basic upload without analysis data
        const result = await supabaseService.uploadDocumentBasic(
          agentId,
          uploadedFile.file,
          content,
          {
            originalSize: uploadedFile.file.size,
            uploadedAt: new Date().toISOString(),
            processingMethod: 'enhanced-parser-gemini-ai',
            fileType: parsedResult.metadata.fileType,
            fileTypeDescription: fileParserService.getFileTypeDescription(parsedResult.metadata.fileType),
            ...parsedResult.metadata,
          }
        );
        document = result.data;
        docError = result.error;
      }

      if (docError) throw docError;

      // Step 6: Store chunks
      if (document && enhancedChunks.length > 0) {
        const { error: chunksError } = await supabaseService.createDocumentChunks(
          document.id,
          enhancedChunks.map(chunk => ({
            content: chunk.content,
            chunk_index: chunk.chunkIndex,
            summary: chunk.summary,
            keywords: chunk.keywords,
            importance: chunk.importance,
            searchable_content: chunk.searchable_content,
            token_count: chunk.content.split(' ').length,
          }))
        );

        if (chunksError) {
          console.warn('Failed to store chunks:', chunksError);
        }
      }

      // Step 7: Complete
      updateStatus('completed', 100, analysis, parsedResult);
      
      toast.success(
        <div>
          <div className="font-medium">{uploadedFile.file.name} processed successfully!</div>
          <div className="text-sm text-muted-foreground mt-1">
            {fileParserService.getFileTypeDescription(parsedResult.metadata.fileType)} • {analysis.keyTopics.length} topics • {enhancedChunks.length} chunks
          </div>
        </div>
      );
      
      onUploadComplete?.(document);

    } catch (error) {
      console.error('Error processing file:', error);
      
      // Enhanced error logging for debugging
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Error details:', {
          message: error.message,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint,
          file: uploadedFile.file.name,
          contentLength: content?.length || 0,
          analysisKeys: analysis ? Object.keys(analysis) : []
        });
      }
      
      updateStatus('error', 0);
      setUploadedFiles(prev => 
        prev.map((f, i) => 
          i === index ? { 
            ...f, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Processing failed'
          } : f
        )
      );

      // Provide more specific error messages
      let errorMessage = 'Processing failed';
      if (error instanceof Error) {
        if (error.message.includes('503') || error.message.includes('overloaded')) {
          errorMessage = 'AI service is temporarily overloaded. Please try again later.';
        } else if (error.message.includes('400') || error.message.includes('constraint')) {
          errorMessage = 'Data validation error. Please check the file content and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(`Failed to process ${uploadedFile.file.name}: ${errorMessage}`);
    }
  };

  // Handle URL upload with Gemini AI analysis
  const handleUrlUpload = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Fetch content from URL
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(urlInput)}`);
      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('Failed to fetch content from URL');
      }

      // Extract text content (basic HTML stripping)
      const content = data.contents.replace(/<[^>]*>/g, '').trim();
      
      if (!content) {
        throw new Error('No text content found at URL');
      }

      // Analyze with Gemini AI
      const filename = new URL(urlInput).pathname.split('/').pop() || 'webpage';
      const analysis = await geminiService.analyzeDocument(content, filename);
      
      // Create intelligent chunks
      const chunks = await geminiService.createIntelligentChunks(content, 1000);
      
      // Generate searchable content for each chunk
      const enhancedChunks = await Promise.all(
        chunks.map(async (chunk) => ({
          ...chunk,
          searchable_content: await geminiService.generateSearchableText(chunk.content, analysis)
        }))
      );

      // Upload to Supabase
      const { data: document, error } = await supabaseService.uploadFromUrl(
        agentId,
        urlInput,
        content,
        filename,
        analysis,
        {
          fetchedAt: new Date().toISOString(),
          contentLength: content.length,
          processingMethod: 'gemini-ai',
          chunksCount: enhancedChunks.length,
        }
      );

      if (error) throw error;

      // Store chunks
      if (document && enhancedChunks.length > 0) {
        await supabaseService.createDocumentChunks(
          document.id,
          enhancedChunks.map(chunk => ({
            content: chunk.content,
            chunk_index: chunk.chunkIndex,
            summary: chunk.summary,
            keywords: chunk.keywords,
            importance: chunk.importance,
            searchable_content: chunk.searchable_content,
            token_count: chunk.content.split(' ').length,
          }))
        );
      }

      toast.success(
        <div>
          <div className="font-medium">URL content processed successfully!</div>
          <div className="text-sm text-muted-foreground mt-1">
            Found {analysis.keyTopics.length} topics, {enhancedChunks.length} chunks
          </div>
        </div>
      );
      
      setUrlInput('');
      onUploadComplete?.(document);

    } catch (error) {
      console.error('Error uploading URL:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload URL content');
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove file from list
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Get status icon
  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return <File className="w-4 h-4 text-muted-foreground" />;
      case 'parsing':
      case 'extracting':
      case 'analyzing':
      case 'chunking':
      case 'storing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  // Get status color and text
  const getStatusInfo = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-gray-100 text-gray-700', text: 'Pending' };
      case 'parsing':
        return { color: 'bg-orange-100 text-orange-700', text: 'Parsing...' };
      case 'extracting':
        return { color: 'bg-blue-100 text-blue-700', text: 'Extracting...' };
      case 'analyzing':
        return { color: 'bg-purple-100 text-purple-700', text: 'AI Analysis...' };
      case 'chunking':
        return { color: 'bg-indigo-100 text-indigo-700', text: 'Chunking...' };
      case 'storing':
        return { color: 'bg-blue-100 text-blue-700', text: 'Storing...' };
      case 'completed':
        return { color: 'bg-green-100 text-green-700', text: 'Completed' };
      case 'error':
        return { color: 'bg-red-100 text-red-700', text: 'Error' };
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Knowledge Base
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">
            Drag & drop documents or paste URLs
          </h3>
          <p className="text-muted-foreground mb-4">
            Supported: PDF, Word, Excel, PowerPoint, Text, Markdown, CSV, JSON, XML, HTML (max 50MB each)
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" asChild>
              <label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.md,.csv,.json,.xml,.html,.htm,.rtf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                Choose Files
              </label>
            </Button>
          </div>
        </div>

        {/* URL Upload */}
        <div className="space-y-3">
          <Label htmlFor="url-input">Or paste a URL</Label>
          <div className="flex gap-2">
            <Input
              id="url-input"
              placeholder="https://example.com/article"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUrlUpload()}
            />
            <Button 
              onClick={handleUrlUpload}
              disabled={!urlInput.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Link className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <Label>Uploaded Files</Label>
            <div className="space-y-2">
              {uploadedFiles.map((uploadedFile, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(uploadedFile.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        <div>{(uploadedFile.file.size / 1024).toFixed(1)} KB</div>
                        {uploadedFile.parsedResult && (
                          <div className="mt-1">
                            <div>{fileParserService.getFileTypeDescription(uploadedFile.parsedResult.metadata.fileType)}</div>
                            {uploadedFile.parsedResult.metadata.pageCount && (
                              <div>{uploadedFile.parsedResult.metadata.pageCount} pages</div>
                            )}
                            {uploadedFile.parsedResult.metadata.sheetCount && (
                              <div>{uploadedFile.parsedResult.metadata.sheetCount} sheets</div>
                            )}
                            <div>{uploadedFile.parsedResult.metadata.wordCount} words</div>
                          </div>
                        )}
                      </div>
                      {uploadedFile.analysis && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <div>Topics: {uploadedFile.analysis.keyTopics.slice(0, 3).join(', ')}</div>
                          <div>Language: {uploadedFile.analysis.language} • {uploadedFile.analysis.sentiment}</div>
                        </div>
                      )}
                      {uploadedFile.error && (
                        <p className="text-xs text-red-500 mt-1">
                          {uploadedFile.error}
                        </p>
                      )}
                      {uploadedFile.progress !== undefined && uploadedFile.status !== 'completed' && (
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                          <div 
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadedFile.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getStatusInfo(uploadedFile.status).color}
                    >
                      {getStatusInfo(uploadedFile.status).text}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {uploadedFiles.some(f => ['parsing', 'extracting', 'analyzing', 'chunking', 'storing'].includes(f.status)) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing with enhanced parsing & AI analysis...</span>
              <span>
                {uploadedFiles.filter(f => f.status === 'completed').length} / {uploadedFiles.length}
              </span>
            </div>
            <Progress 
              value={(uploadedFiles.filter(f => f.status === 'completed').length / uploadedFiles.length) * 100} 
            />
            <div className="text-xs text-muted-foreground">
              Parsing documents → AI analysis → Topic extraction → Intelligent chunking
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}