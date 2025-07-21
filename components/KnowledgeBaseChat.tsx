import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { geminiService } from '../services/geminiService';
import { supabaseService } from '../services/supabaseService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    filename: string;
    chunk_index: number;
    relevance_score: number;
  }>;
}

interface KnowledgeBaseChatProps {
  agentId: string;
  agentName: string;
}

export default function KnowledgeBaseChat({ agentId, agentName }: KnowledgeBaseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Search for relevant chunks
      const searchResults = await supabaseService.searchKnowledgeBase(agentId, input.trim());
      
      if (!searchResults.data || searchResults.data.length === 0) {
        const noDataMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: "I don't have any relevant information in the knowledge base to answer your question. Please upload some documents first or try asking about different topics.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, noDataMessage]);
        return;
      }

      // Generate answer using Gemini
      const answer = await geminiService.generateAnswer(input.trim(), searchResults.data);
      
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: answer,
        timestamp: new Date(),
        sources: searchResults.data.map(result => ({
          filename: result.filename,
          chunk_index: result.chunk_index,
          relevance_score: result.similarity || 0,
        })),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating answer:', error);
      toast.error('Failed to generate answer. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while trying to answer your question. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        <Bot className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold">Ask {agentName}</h3>
        <Badge variant="secondary" className="ml-auto">
          Knowledge Base Q&A
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">Ask me anything!</p>
            <p className="text-sm mb-4">
              I can answer questions based on the documents you've uploaded to this agent's knowledge base.
            </p>
            
            <div className="text-left max-w-md mx-auto">
              <p className="text-xs font-medium mb-2">Try asking:</p>
              <div className="space-y-1 text-xs">
                <div className="bg-muted/50 rounded px-2 py-1">• "What are the main topics in my documents?"</div>
                <div className="bg-muted/50 rounded px-2 py-1">• "Summarize the key points about [topic]"</div>
                <div className="bg-muted/50 rounded px-2 py-1">• "What does the document say about [specific question]?"</div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            )}
            
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
              <Card className={message.type === 'user' ? 'bg-blue-600 text-white' : ''}>
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-muted-foreground mb-2">Sources:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.sources.map((source, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            {source.filename}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <p className="text-xs text-muted-foreground mt-1 px-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}