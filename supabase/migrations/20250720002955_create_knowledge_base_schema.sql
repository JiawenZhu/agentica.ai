-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create users table (if not exists from auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agents table to store agent configurations
CREATE TABLE public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    retell_agent_id VARCHAR(255) NOT NULL, -- The actual Retell AI agent ID
    name VARCHAR(255) NOT NULL,
    description TEXT,
    custom_instructions TEXT,
    voice_settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_base_documents table
CREATE TABLE public.knowledge_base_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'pdf', 'txt', 'url', etc.
    file_size INTEGER,
    content TEXT NOT NULL, -- Extracted text content
    url TEXT, -- If uploaded from URL
    metadata JSONB DEFAULT '{}', -- Additional metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_chunks table for vector search
CREATE TABLE public.document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.knowledge_base_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,
    embedding VECTOR(1536), -- OpenAI ada-002 embedding dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_knowledge_base junction table
CREATE TABLE public.agent_knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.knowledge_base_documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, document_id)
);

-- Create conversation_logs table for analytics
CREATE TABLE public.conversation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    retell_call_id VARCHAR(255),
    duration_seconds INTEGER,
    transcript JSONB,
    knowledge_base_used BOOLEAN DEFAULT false,
    relevant_chunks UUID[], -- Array of chunk IDs that were used
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_retell_agent_id ON public.agents(retell_agent_id);
CREATE INDEX idx_knowledge_base_documents_user_id ON public.knowledge_base_documents(user_id);
CREATE INDEX idx_knowledge_base_documents_agent_id ON public.knowledge_base_documents(agent_id);
CREATE INDEX idx_document_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX idx_agent_knowledge_base_agent_id ON public.agent_knowledge_base(agent_id);
CREATE INDEX idx_conversation_logs_user_id ON public.conversation_logs(user_id);
CREATE INDEX idx_conversation_logs_agent_id ON public.conversation_logs(agent_id);

-- Create vector similarity search index
CREATE INDEX idx_document_chunks_embedding ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Agents policies
CREATE POLICY "Users can view own agents" ON public.agents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agents" ON public.agents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents" ON public.agents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents" ON public.agents
    FOR DELETE USING (auth.uid() = user_id);

-- Knowledge base documents policies
CREATE POLICY "Users can view own documents" ON public.knowledge_base_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.knowledge_base_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.knowledge_base_documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.knowledge_base_documents
    FOR DELETE USING (auth.uid() = user_id);

-- Document chunks policies (inherit from parent document)
CREATE POLICY "Users can view chunks of own documents" ON public.document_chunks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.knowledge_base_documents 
            WHERE id = document_chunks.document_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert chunks for own documents" ON public.document_chunks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.knowledge_base_documents 
            WHERE id = document_chunks.document_id 
            AND user_id = auth.uid()
        )
    );

-- Agent knowledge base junction policies
CREATE POLICY "Users can manage own agent knowledge base" ON public.agent_knowledge_base
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.agents 
            WHERE id = agent_knowledge_base.agent_id 
            AND user_id = auth.uid()
        )
    );

-- Conversation logs policies
CREATE POLICY "Users can view own conversation logs" ON public.conversation_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversation logs" ON public.conversation_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for vector similarity search
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.78,
    match_count INT DEFAULT 10,
    filter_agent_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.content,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    JOIN knowledge_base_documents kbd ON dc.document_id = kbd.id
    WHERE 
        (filter_agent_id IS NULL OR kbd.agent_id = filter_agent_id)
        AND 1 - (dc.embedding <=> query_embedding) > match_threshold
        AND kbd.user_id = auth.uid()
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_documents_updated_at BEFORE UPDATE ON public.knowledge_base_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- This will be populated by your application