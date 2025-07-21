import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import { 
  Search, 
  FileText, 
  Trash2, 
  Eye, 
  Filter,
  BarChart3,
  Brain,
  Tags,
  Globe,
  Calendar,
  Loader2
} from 'lucide-react';
import { supabaseService, KnowledgeBaseDocument } from '../services/supabaseService';
import { fileParserService } from '../services/fileParserService';
import KnowledgeBaseChat from './KnowledgeBaseChat';

interface KnowledgeBaseManagerProps {
  agentId?: string;
  className?: string;
}

interface KnowledgeBaseStats {
  total_documents: number;
  total_chunks: number;
  categories: string[];
  languages: string[];
  avg_importance: number;
  processing_pending: number;
}

export function KnowledgeBaseManager({ agentId, className = '' }: KnowledgeBaseManagerProps) {
  const [documents, setDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [stats, setStats] = useState<KnowledgeBaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeBaseDocument | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<KnowledgeBaseDocument | null>(null);

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, [agentId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseService.getDocuments(agentId);
      
      if (error) {
        toast.error('Failed to load documents');
        console.error('Error loading documents:', error);
      } else {
        setDocuments(data || []);
      }
    } catch (error) {
      toast.error('Failed to load documents');
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabaseService.getKnowledgeBaseStats();
      
      if (error) {
        console.error('Error loading stats:', error);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDeleteDocument = async (document: KnowledgeBaseDocument) => {
    try {
      const { error } = await supabaseService.deleteDocument(document.id);
      
      if (error) {
        toast.error('Failed to delete document');
      } else {
        toast.success(`${document.original_filename} deleted successfully`);
        setDocuments(prev => prev.filter(d => d.id !== document.id));
        loadStats(); // Refresh stats
      }
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.key_topics?.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      doc.categories?.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (fileType: string) => {
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading knowledge base...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="chat" className="relative">
            Q&A Chat
            <Badge variant="secondary" className="ml-2 text-xs">
              AI
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents, topics, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Categories</option>
                {stats?.categories?.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Documents List */}
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                <p className="text-muted-foreground">
                  {documents.length === 0 
                    ? "Upload your first document to get started"
                    : "Try adjusting your search or filters"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-muted rounded-lg">
                          {getFileIcon(document.file_type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate mb-1">
                            {document.original_filename}
                          </h3>
                          
                          {document.summary && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {document.summary}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {document.categories?.slice(0, 3).map(category => (
                              <Badge key={category} variant="secondary" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                            {document.language && (
                              <Badge variant="outline" className="text-xs">
                                <Globe className="w-3 h-3 mr-1" />
                                {document.language}
                              </Badge>
                            )}
                            {document.sentiment && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  document.sentiment === 'positive' ? 'text-green-600' :
                                  document.sentiment === 'negative' ? 'text-red-600' :
                                  'text-gray-600'
                                }`}
                              >
                                {document.sentiment}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatFileSize(document.file_size || 0)}</span>
                            <span>{document.key_topics?.length || 0} topics</span>
                            <span>
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {formatDate(document.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDocument(document)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDocumentToDelete(document);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-6">
          <Card className="h-[600px]">
            <KnowledgeBaseChat 
              agentId={agentId || ''} 
              agentName="Knowledge Base Assistant"
            />
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.total_documents}</p>
                      <p className="text-sm text-muted-foreground">Documents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.total_chunks}</p>
                      <p className="text-sm text-muted-foreground">AI Chunks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Tags className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.categories?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Categories</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.avg_importance?.toFixed(1) || 0}</p>
                      <p className="text-sm text-muted-foreground">Avg Importance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {stats?.categories && stats.categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Content Categories</CardTitle>
                <CardDescription>Distribution of document categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.categories.map(category => {
                    const count = documents.filter(doc => doc.categories?.includes(category)).length;
                    const percentage = (count / documents.length) * 100;
                    
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span>{count} documents</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Document Detail Dialog */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDocument.original_filename}</DialogTitle>
              <DialogDescription>
                {fileParserService.getFileTypeDescription(selectedDocument.file_type)} • {formatFileSize(selectedDocument.file_size || 0)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedDocument.summary && (
                <div>
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">{selectedDocument.summary}</p>
                </div>
              )}
              
              {selectedDocument.key_topics && selectedDocument.key_topics.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Key Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.key_topics.map(topic => (
                      <Badge key={topic} variant="secondary">{topic}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedDocument.entities && selectedDocument.entities.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Entities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.entities.map(entity => (
                      <Badge key={entity} variant="outline">{entity}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold mb-2">Content Preview</h4>
                <div className="bg-muted p-4 rounded-lg text-sm max-h-60 overflow-y-auto">
                  {selectedDocument.content.substring(0, 1000)}
                  {selectedDocument.content.length > 1000 && '...'}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{documentToDelete?.original_filename}"? 
              This action cannot be undone and will remove all associated chunks and analysis.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => documentToDelete && handleDeleteDocument(documentToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}