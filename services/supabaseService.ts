import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Agent {
  id: string;
  user_id: string;
  retell_agent_id: string;
  name: string;
  description?: string;
  custom_instructions?: string;
  voice_settings?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseDocument {
  id: string;
  user_id: string;
  agent_id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size?: number;
  content: string;
  url?: string;
  metadata?: Record<string, any>;
  analysis?: Record<string, any>;
  summary?: string;
  key_topics?: string[];
  entities?: string[];
  categories?: string[];
  sentiment?: string;
  language?: string;
  reading_level?: string;
  key_phrases?: string[];
  answerable_questions?: string[];
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  summary?: string;
  keywords?: string[];
  importance?: number;
  searchable_content?: string;
  token_count?: number;
  embedding?: number[];
  created_at: string;
}

export interface ConversationLog {
  id: string;
  user_id: string;
  agent_id: string;
  retell_call_id?: string;
  duration_seconds?: number;
  transcript?: Record<string, any>;
  knowledge_base_used: boolean;
  relevant_chunks?: string[];
  created_at: string;
}

// Supabase Service Class
export class SupabaseService {
  
  // Authentication
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  // Profile Management
  async updateProfile(updates: { full_name?: string; avatar_url?: string }) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    return { data, error };
  }

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { data, error };
  }

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  }

  async uploadAvatar(file: File, userId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (error) return { data: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return { data: { path: filePath, url: publicUrl }, error: null };
  }

  async deleteAccount() {
    // Note: Supabase doesn't have a direct delete user method from client
    // This would typically be handled by a server-side function
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('No user found') };

    // For now, we'll just sign out and show a message
    // In production, you'd call a server function to delete the user
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  // Agent Management
  async createAgent(agentData: Omit<Agent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('agents')
      .insert({
        ...agentData,
        user_id: user.id,
      })
      .select()
      .single();

    return { data, error };
  }

  async getAgents() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  async getAgent(id: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  }

  async updateAgent(id: string, updates: Partial<Agent>) {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async deleteAgent(id: string) {
    const { error } = await supabase
      .from('agents')
      .update({ is_active: false })
      .eq('id', id);

    return { error };
  }

  // Knowledge Base Document Management
  async uploadDocument(
    agentId: string,
    file: File,
    content: string,
    analysis?: Record<string, any>,
    metadata?: Record<string, any>
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Ensure content is not null or empty
    if (!content || content.trim().length === 0) {
      throw new Error('Document content cannot be empty');
    }

    // Prepare data with proper null handling
    const insertData = {
      user_id: user.id,
      agent_id: agentId,
      filename: `${Date.now()}_${file.name}`,
      original_filename: file.name,
      file_type: file.type || 'text/plain',
      file_size: file.size,
      content: content.trim(),
      analysis: analysis || {},
      summary: analysis?.summary || null,
      key_topics: analysis?.keyTopics || [],
      entities: analysis?.entities || [],
      categories: analysis?.categories || [],
      sentiment: analysis?.sentiment || 'neutral',
      language: analysis?.language || 'en',
      reading_level: analysis?.readingLevel || 'intermediate',
      key_phrases: analysis?.keyPhrases || [],
      answerable_questions: analysis?.questions || [],
      processing_status: 'completed',
      metadata: metadata || {},
    };

    console.log('Uploading document with data:', {
      filename: insertData.filename,
      contentLength: insertData.content.length,
      analysisKeys: Object.keys(insertData.analysis),
      hasSummary: !!insertData.summary,
      keyTopicsCount: insertData.key_topics.length
    });

    const { data, error } = await supabase
      .from('knowledge_base_documents')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase upload error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }

    return { data, error };
  }

  // Basic upload function without analysis data (fallback)
  async uploadDocumentBasic(
    agentId: string,
    file: File,
    content: string,
    metadata?: Record<string, any>
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Ensure content is not null or empty
    if (!content || content.trim().length === 0) {
      throw new Error('Document content cannot be empty');
    }

    const { data, error } = await supabase
      .from('knowledge_base_documents')
      .insert({
        user_id: user.id,
        agent_id: agentId,
        filename: `${Date.now()}_${file.name}`,
        original_filename: file.name,
        file_type: file.type || 'text/plain',
        file_size: file.size,
        content: content.trim(),
        analysis: {},
        summary: null,
        key_topics: [],
        entities: [],
        categories: [],
        sentiment: 'neutral',
        language: 'en',
        reading_level: 'intermediate',
        key_phrases: [],
        answerable_questions: [],
        processing_status: 'completed',
        metadata: metadata || {},
      })
      .select()
      .single();

    return { data, error };
  }

  async uploadFromUrl(
    agentId: string,
    url: string,
    content: string,
    filename: string,
    analysis?: Record<string, any>,
    metadata?: Record<string, any>
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('knowledge_base_documents')
      .insert({
        user_id: user.id,
        agent_id: agentId,
        filename: `${Date.now()}_${filename}`,
        original_filename: filename,
        file_type: 'url',
        content,
        url,
        analysis: analysis || {},
        summary: analysis?.summary,
        key_topics: analysis?.keyTopics,
        entities: analysis?.entities,
        categories: analysis?.categories,
        sentiment: analysis?.sentiment,
        language: analysis?.language,
        reading_level: analysis?.readingLevel,
        key_phrases: analysis?.keyPhrases,
        answerable_questions: analysis?.questions,
        processing_status: 'completed',
        metadata: metadata || {},
      })
      .select()
      .single();

    return { data, error };
  }

  async getDocuments(agentId?: string) {
    let query = supabase
      .from('knowledge_base_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query;
    return { data, error };
  }

  async deleteDocument(id: string) {
    const { error } = await supabase
      .from('knowledge_base_documents')
      .delete()
      .eq('id', id);

    return { error };
  }

  // Document Chunks (for vector search)
  async createDocumentChunks(documentId: string, chunks: Array<{
    content: string;
    chunk_index: number;
    summary?: string;
    keywords?: string[];
    importance?: number;
    searchable_content?: string;
    token_count?: number;
    embedding?: number[];
  }>) {
    const { data, error } = await supabase
      .from('document_chunks')
      .insert(
        chunks.map(chunk => ({
          document_id: documentId,
          ...chunk,
        }))
      )
      .select();

    return { data, error };
  }

  // Search knowledge base for relevant chunks (simplified version for chat)
  async searchKnowledgeBase(agentId: string, query: string, limit: number = 10) {
    try {
      // First, try to use the enhanced search with embeddings if available
      const { data: chunks, error } = await supabase
        .from('knowledge_base_chunks')
        .select(`
          *,
          knowledge_base_documents!inner(
            id,
            filename,
            original_filename,
            agent_id
          )
        `)
        .eq('knowledge_base_documents.agent_id', agentId)
        .textSearch('searchable_content', query, {
          type: 'websearch',
          config: 'english'
        })
        .limit(limit);

      if (error) {
        console.warn('Enhanced search failed, falling back to basic search:', error);
        
        // Fallback to basic text search
        const { data: fallbackChunks, error: fallbackError } = await supabase
          .from('knowledge_base_chunks')
          .select(`
            *,
            knowledge_base_documents!inner(
              id,
              filename,
              original_filename,
              agent_id
            )
          `)
          .eq('knowledge_base_documents.agent_id', agentId)
          .or(`content.ilike.%${query}%,summary.ilike.%${query}%,keywords.cs.{${query}}`)
          .limit(limit);

        if (fallbackError) {
          console.error('All search methods failed:', fallbackError);
          return { data: [], error: fallbackError };
        }

        return { data: fallbackChunks || [], error: null };
      }

      return { data: chunks || [], error: null };
    } catch (searchError) {
      console.error('Search error:', searchError);
      return { data: [], error: searchError };
    }
  }

  // Enhanced search functionality (original method)
  async searchKnowledgeBaseAdvanced(
    query: string,
    agentId?: string,
    categories?: string[],
    minImportance: number = 1,
    limit: number = 20
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('search_knowledge_base', {
      search_query: query,
      user_id_filter: user.id,
      agent_id_filter: agentId || null,
      categories_filter: categories || null,
      min_importance: minImportance,
      limit_results: limit,
    });

    return { data, error };
  }

  // Get knowledge base statistics
  async getKnowledgeBaseStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('get_knowledge_base_stats', {
      user_id_param: user.id,
    });

    return { data: data?.[0] || null, error };
  }

  // Find similar documents
  async findSimilarDocuments(documentId: string, limit: number = 10) {
    const { data, error } = await supabase.rpc('find_similar_documents', {
      document_id_param: documentId,
      similarity_threshold: 0.3,
      limit_results: limit,
    });

    return { data, error };
  }

  // Update document processing status
  async updateDocumentStatus(documentId: string, status: 'pending' | 'processing' | 'completed' | 'failed') {
    const { data, error } = await supabase
      .from('knowledge_base_documents')
      .update({ processing_status: status })
      .eq('id', documentId)
      .select()
      .single();

    return { data, error };
  }

  // Vector Search
  async searchDocuments(
    query: string,
    queryEmbedding: number[],
    agentId?: string,
    matchThreshold: number = 0.78,
    matchCount: number = 10
  ) {
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_agent_id: agentId || null,
    });

    return { data, error };
  }

  // Conversation Logs
  async logConversation(logData: Omit<ConversationLog, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('conversation_logs')
      .insert({
        ...logData,
        user_id: user.id,
      })
      .select()
      .single();

    return { data, error };
  }

  async getConversationLogs(agentId?: string) {
    let query = supabase
      .from('conversation_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query;
    return { data, error };
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();