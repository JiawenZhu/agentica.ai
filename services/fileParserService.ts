import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Set up PDF.js worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface ParsedFileResult {
  content: string;
  metadata: {
    fileType: string;
    originalName: string;
    size: number;
    pageCount?: number;
    sheetCount?: number;
    wordCount: number;
    hasImages?: boolean;
    extractedImages?: string[];
    tables?: any[];
    structure?: any;
  };
  success: boolean;
  error?: string;
}

export class FileParserService {
  
  /**
   * Parse any supported file type and extract text content
   */
  async parseFile(file: File): Promise<ParsedFileResult> {
    const fileType = this.getFileType(file);
    
    try {
      switch (fileType) {
        case 'pdf':
          return await this.parsePDF(file);
        case 'docx':
        case 'doc':
          return await this.parseWord(file);
        case 'xlsx':
        case 'xls':
          return await this.parseExcel(file);
        case 'pptx':
        case 'ppt':
          return await this.parsePowerPoint(file);
        case 'txt':
        case 'md':
        case 'markdown':
          return await this.parseText(file);
        case 'csv':
          return await this.parseCSV(file);
        case 'json':
          return await this.parseJSON(file);
        case 'xml':
          return await this.parseXML(file);
        case 'html':
        case 'htm':
          return await this.parseHTML(file);
        case 'rtf':
          return await this.parseRTF(file);
        default:
          // Try to parse as text for unknown types
          return await this.parseText(file);
      }
    } catch (error) {
      return {
        content: '',
        metadata: {
          fileType,
          originalName: file.name,
          size: file.size,
          wordCount: 0,
        },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parsing error'
      };
    }
  }

  /**
   * Determine file type from extension and MIME type
   */
  private getFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type.toLowerCase();
    
    console.log('File type detection:', { 
      name: file.name, 
      extension, 
      mimeType, 
      size: file.size 
    });

    // Check by extension first for common file types
    if (extension === 'docx' || extension === 'doc') return 'docx';
    if (extension === 'xlsx' || extension === 'xls') return 'xlsx';
    if (extension === 'pptx' || extension === 'ppt') return 'pptx';
    if (extension === 'pdf') return 'pdf';
    if (extension === 'txt') return 'txt';
    if (extension === 'md' || extension === 'markdown') return 'md';
    if (extension === 'csv') return 'csv';
    if (extension === 'json') return 'json';
    if (extension === 'xml') return 'xml';
    if (extension === 'html' || extension === 'htm') return 'html';
    if (extension === 'rtf') return 'rtf';

    // Then check by MIME type as fallback
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('wordprocessingml') || 
        mimeType.includes('msword') || 
        mimeType.includes('officedocument.word') ||
        mimeType.includes('application/docx') ||
        mimeType.includes('application/doc')) return 'docx';
    if (mimeType.includes('spreadsheetml') || 
        mimeType.includes('excel') ||
        mimeType.includes('application/xlsx') ||
        mimeType.includes('application/xls')) return 'xlsx';
    if (mimeType.includes('presentationml') || 
        mimeType.includes('powerpoint') ||
        mimeType.includes('application/pptx') ||
        mimeType.includes('application/ppt')) return 'pptx';
    if (mimeType.includes('text/plain')) return 'txt';
    if (mimeType.includes('text/markdown')) return 'md';
    if (mimeType.includes('text/csv') || mimeType.includes('application/csv')) return 'csv';
    if (mimeType.includes('application/json')) return 'json';
    if (mimeType.includes('text/xml') || mimeType.includes('application/xml')) return 'xml';
    if (mimeType.includes('text/html')) return 'html';
    if (mimeType.includes('application/rtf')) return 'rtf';
    
    // Special handling for Office documents with generic MIME types
    if (mimeType === 'application/octet-stream') {
      if (extension === 'docx' || extension === 'doc') return 'docx';
      if (extension === 'xlsx' || extension === 'xls') return 'xlsx';
      if (extension === 'pptx' || extension === 'ppt') return 'pptx';
    }
    
    // Handle vnd.openxmlformats-officedocument types
    if (mimeType.includes('vnd.openxmlformats-officedocument')) {
      if (mimeType.includes('wordprocessing')) return 'docx';
      if (mimeType.includes('spreadsheet')) return 'xlsx';
      if (mimeType.includes('presentation')) return 'pptx';
    }

    // Fallback to extension or generic text
    return extension || 'txt';
  }

  /**
   * Parse PDF files
   */
  private async parsePDF(file: File): Promise<ParsedFileResult> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const pageCount = pdf.numPages;
    
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return {
      content: fullText.trim(),
      metadata: {
        fileType: 'pdf',
        originalName: file.name,
        size: file.size,
        pageCount,
        wordCount: fullText.split(/\s+/).length,
      },
      success: true
    };
  }

  /**
   * Parse Word documents (.docx, .doc)
   */
  private async parseWord(file: File): Promise<ParsedFileResult> {
    try {
      console.log('Parsing Word document:', file.name);
      const arrayBuffer = await file.arrayBuffer();
      
      // Log the array buffer size to verify we have data
      console.log('Word document array buffer size:', arrayBuffer.byteLength);
      
      // Use mammoth to extract text from Word document
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      console.log('Mammoth extraction result:', {
        textLength: result.value.length,
        messageCount: result.messages.length,
        success: result.value.length > 0
      });
      
      // Check if we got any content
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('No text content could be extracted from the Word document');
      }
      
      return {
        content: result.value,
        metadata: {
          fileType: 'docx',
          originalName: file.name,
          size: file.size,
          wordCount: result.value.split(/\s+/).length,
          hasImages: result.messages.some(msg => msg.type === 'warning' && msg.message.includes('image')),
        },
        success: true
      };
    } catch (error) {
      console.error('Error parsing Word document:', error);
      
      // Fallback to basic text extraction
      try {
        const text = await file.text();
        return {
          content: text || `[Word document: ${file.name}] - Content extraction failed. Please convert to plain text format.`,
          metadata: {
            fileType: 'docx',
            originalName: file.name,
            size: file.size,
            wordCount: 0,
          },
          success: true
        };
      } catch (fallbackError) {
        return {
          content: `[Word document: ${file.name}] - Content extraction failed. Please convert to plain text format.`,
          metadata: {
            fileType: 'docx',
            originalName: file.name,
            size: file.size,
            wordCount: 0,
          },
          success: false,
          error: error instanceof Error ? error.message : 'Failed to parse Word document'
        };
      }
    }
  }

  /**
   * Parse Excel files (.xlsx, .xls)
   */
  private async parseExcel(file: File): Promise<ParsedFileResult> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    let fullText = '';
    const tables: any[] = [];
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Convert to text
      const sheetText = jsonData
        .map((row: any[]) => row.join('\t'))
        .join('\n');
      
      fullText += `Sheet: ${sheetName}\n${sheetText}\n\n`;
      
      // Store structured data
      tables.push({
        sheetName,
        data: jsonData,
        range: worksheet['!ref']
      });
    });

    return {
      content: fullText.trim(),
      metadata: {
        fileType: 'xlsx',
        originalName: file.name,
        size: file.size,
        sheetCount: workbook.SheetNames.length,
        wordCount: fullText.split(/\s+/).length,
        tables,
      },
      success: true
    };
  }

  /**
   * Parse PowerPoint files (.pptx, .ppt)
   */
  private async parsePowerPoint(file: File): Promise<ParsedFileResult> {
    // For now, we'll try to extract as zip and parse XML
    // This is a simplified approach - for full PPTX support, you'd need a dedicated library
    try {
      const text = await this.parseText(file);
      return {
        ...text,
        metadata: {
          ...text.metadata,
          fileType: 'pptx',
        }
      };
    } catch (error) {
      return {
        content: `PowerPoint file: ${file.name}\n\nContent extraction not fully supported yet. Please convert to PDF or text format for better processing.`,
        metadata: {
          fileType: 'pptx',
          originalName: file.name,
          size: file.size,
          wordCount: 0,
        },
        success: true
      };
    }
  }

  /**
   * Parse text files (.txt, .md)
   */
  private async parseText(file: File): Promise<ParsedFileResult> {
    const text = await file.text();
    
    return {
      content: text,
      metadata: {
        fileType: this.getFileType(file),
        originalName: file.name,
        size: file.size,
        wordCount: text.split(/\s+/).length,
      },
      success: true
    };
  }

  /**
   * Parse CSV files
   */
  private async parseCSV(file: File): Promise<ParsedFileResult> {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0]?.split(',') || [];
    
    // Convert CSV to readable format
    let formattedText = `CSV Data from ${file.name}\n\n`;
    formattedText += `Headers: ${headers.join(', ')}\n\n`;
    
    // Add first few rows as sample
    const sampleRows = lines.slice(1, 6);
    sampleRows.forEach((row, index) => {
      if (row.trim()) {
        formattedText += `Row ${index + 1}: ${row}\n`;
      }
    });
    
    if (lines.length > 6) {
      formattedText += `\n... and ${lines.length - 6} more rows`;
    }

    return {
      content: formattedText,
      metadata: {
        fileType: 'csv',
        originalName: file.name,
        size: file.size,
        wordCount: formattedText.split(/\s+/).length,
        structure: {
          headers,
          rowCount: lines.length - 1,
          columnCount: headers.length
        }
      },
      success: true
    };
  }

  /**
   * Parse JSON files
   */
  private async parseJSON(file: File): Promise<ParsedFileResult> {
    const text = await file.text();
    
    try {
      const jsonData = JSON.parse(text);
      const formattedText = `JSON Data from ${file.name}\n\n${JSON.stringify(jsonData, null, 2)}`;
      
      return {
        content: formattedText,
        metadata: {
          fileType: 'json',
          originalName: file.name,
          size: file.size,
          wordCount: formattedText.split(/\s+/).length,
          structure: {
            type: Array.isArray(jsonData) ? 'array' : typeof jsonData,
            keys: typeof jsonData === 'object' ? Object.keys(jsonData) : []
          }
        },
        success: true
      };
    } catch (error) {
      return {
        content: `Invalid JSON file: ${file.name}\n\nRaw content:\n${text}`,
        metadata: {
          fileType: 'json',
          originalName: file.name,
          size: file.size,
          wordCount: text.split(/\s+/).length,
        },
        success: true
      };
    }
  }

  /**
   * Parse XML files
   */
  private async parseXML(file: File): Promise<ParsedFileResult> {
    const text = await file.text();
    
    // Extract text content from XML (remove tags)
    const textContent = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    return {
      content: `XML Content from ${file.name}\n\n${textContent}`,
      metadata: {
        fileType: 'xml',
        originalName: file.name,
        size: file.size,
        wordCount: textContent.split(/\s+/).length,
      },
      success: true
    };
  }

  /**
   * Parse HTML files
   */
  private async parseHTML(file: File): Promise<ParsedFileResult> {
    const text = await file.text();
    
    // Extract text content from HTML (remove tags)
    const textContent = text
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return {
      content: textContent,
      metadata: {
        fileType: 'html',
        originalName: file.name,
        size: file.size,
        wordCount: textContent.split(/\s+/).length,
      },
      success: true
    };
  }

  /**
   * Parse RTF files
   */
  private async parseRTF(file: File): Promise<ParsedFileResult> {
    const text = await file.text();
    
    // Basic RTF parsing (remove RTF control codes)
    const textContent = text
      .replace(/\\[a-z]+\d*\s?/g, '')
      .replace(/[{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return {
      content: textContent,
      metadata: {
        fileType: 'rtf',
        originalName: file.name,
        size: file.size,
        wordCount: textContent.split(/\s+/).length,
      },
      success: true
    };
  }

  /**
   * Get supported file types
   */
  getSupportedFileTypes(): string[] {
    return [
      'pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt',
      'txt', 'md', 'markdown', 'csv', 'json', 'xml', 'html', 'htm', 'rtf'
    ];
  }

  /**
   * Check if file type is supported
   */
  isFileTypeSupported(file: File): boolean {
    // First check by extension
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'pdf', 'txt', 'md', 'markdown', 
         'csv', 'json', 'xml', 'html', 'htm', 'rtf'].includes(extension)) {
      return true;
    }
    
    // Then check by MIME type
    const mimeType = file.type.toLowerCase();
    if (mimeType.includes('pdf') || 
        mimeType.includes('word') || 
        mimeType.includes('excel') || 
        mimeType.includes('powerpoint') ||
        mimeType.includes('text/') ||
        mimeType.includes('application/json') ||
        mimeType.includes('application/xml') ||
        mimeType.includes('application/rtf') ||
        mimeType.includes('vnd.openxmlformats-officedocument')) {
      return true;
    }
    
    // Finally check by our getFileType method
    const fileType = this.getFileType(file);
    return this.getSupportedFileTypes().includes(fileType);
  }

  /**
   * Get file type description
   */
  getFileTypeDescription(fileType: string): string {
    const descriptions: { [key: string]: string } = {
      pdf: 'PDF Document',
      docx: 'Word Document',
      doc: 'Word Document (Legacy)',
      xlsx: 'Excel Spreadsheet',
      xls: 'Excel Spreadsheet (Legacy)',
      pptx: 'PowerPoint Presentation',
      ppt: 'PowerPoint Presentation (Legacy)',
      txt: 'Text File',
      md: 'Markdown File',
      markdown: 'Markdown File',
      csv: 'CSV Spreadsheet',
      json: 'JSON Data',
      xml: 'XML Document',
      html: 'HTML Document',
      htm: 'HTML Document',
      rtf: 'Rich Text Format'
    };
    
    return descriptions[fileType] || 'Unknown File Type';
  }
}

// Export singleton instance
export const fileParserService = new FileParserService();