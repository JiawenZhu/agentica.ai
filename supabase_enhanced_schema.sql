-- Enhanced knowledge base schema with Gemini AI analysis

-- Add analysis columns to knowledge_base_documents
ALTER TABLE public.knowledge_base_documents 
ADD COLUMN IF NOT EXISTS analysis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS key_topics TEXT[],
ADD COLUMN IF NOT EXISTS entities TEXT[],
ADD COLUMN IF NOT EXISTS categories TEXT[],
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20) DEFAULT 'neutral',
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS reading_level VARCHAR(20) DEFAULT 'intermediate',
ADD COLUMN IF NOT EXISTS key_phrases TEXT[],
ADD COLUMN IF NOT EXISTS answerable_questions TEXT[],
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(20) DEFAULT 'pending';

-- Add enhanced columns to document_chunks
ALTER TABLE public.document_chunks 
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT[],
ADD COLUMN IF NOT EXISTS importance INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS searchable_content TEXT;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_documents_categories ON public.knowledge_base_documents USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_documents_key_topics ON public.knowledge_base_documents USING GIN (key_topics);
CREATE INDEX IF NOT EXISTS idx_documents_entities ON public.knowledge_base_documents USING GIN (entities);
CREATE INDEX IF NOT EXISTS idx_documents_sentiment ON public.knowledge_base_documents(sentiment);
CREATE INDEX IF NOT EXISTS idx_documents_language ON public.knowledge_base_documents(language);
CREATE INDEX IF NOT EXISTS idx_documents_processing_status ON public.knowledge_base_documents(processing_status);

CREATE INDEX IF NOT EXISTS idx_chunks_keywords ON public.document_chunks USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_chunks_importance ON public.document_chunks(importance);
CREATE INDEX IF NOT EXISTS idx_chunks_searchable_content ON public.document_chunks USING GIN (to_tsvector('english', searchable_content));

-- Create function for advanced document search
CREATE OR REPLACE FUNCTION search_knowledge_base(
    search_query TEXT,
    user_id_filter UUID DEFAULT NULL,
    agent_id_filter UUID DEFAULT NULL,
    categories_filter TEXT[] DEFAULT NULL,
    min_importance INTEGER DEFAULT 1,
    limit_results INTEGER DEFAULT 20
)
RETURNS TABLE (
    document_id UUID,
    chunk_id UUID,
    title TEXT,
    content TEXT,
    summary TEXT,
    importance INTEGER,
    categories TEXT[],
    key_topics TEXT[],
    rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kbd.id as document_id,
        dc.id as chunk_id,
        kbd.filename as title,
        dc.content,
        dc.summary,
        dc.importance,
        kbd.categories,
        kbd.key_topics,
        ts_rank(to_tsvector('english', dc.searchable_content), plainto_tsquery('english', search_query)) as rank
    FROM document_chunks dc
    JOIN knowledge_base_documents kbd ON dc.document_id = kbd.id
    WHERE 
        (user_id_filter IS NULL OR kbd.user_id = user_id_filter)
        AND (agent_id_filter IS NULL OR kbd.agent_id = agent_id_filter)
        AND (categories_filter IS NULL OR kbd.categories && categories_filter)
        AND dc.importance >= min_importance
        AND (
            to_tsvector('english', dc.searchable_content) @@ plainto_tsquery('english', search_query)
            OR kbd.key_topics && string_to_array(search_query, ' ')
            OR kbd.entities && string_to_array(search_query, ' ')
        )
    ORDER BY rank DESC, dc.importance DESC
    LIMIT limit_results;
END;
$$;

-- Create function to get document statistics
CREATE OR REPLACE FUNCTION get_knowledge_base_stats(user_id_param UUID)
RETURNS TABLE (
    total_documents BIGINT,
    total_chunks BIGINT,
    categories TEXT[],
    languages TEXT[],
    avg_importance NUMERIC,
    processing_pending BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT kbd.id) as total_documents,
        COUNT(dc.id) as total_chunks,
        array_agg(DISTINCT unnest(kbd.categories)) FILTER (WHERE kbd.categories IS NOT NULL) as categories,
        array_agg(DISTINCT kbd.language) FILTER (WHERE kbd.language IS NOT NULL) as languages,
        AVG(dc.importance) as avg_importance,
        COUNT(DISTINCT kbd.id) FILTER (WHERE kbd.processing_status = 'pending') as processing_pending
    FROM knowledge_base_documents kbd
    LEFT JOIN document_chunks dc ON kbd.id = dc.document_id
    WHERE kbd.user_id = user_id_param;
END;
$$;

-- Create function to find similar documents
CREATE OR REPLACE FUNCTION find_similar_documents(
    document_id_param UUID,
    similarity_threshold FLOAT DEFAULT 0.3,
    limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    similar_document_id UUID,
    filename TEXT,
    similarity_score FLOAT,
    shared_topics TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    source_topics TEXT[];
    source_categories TEXT[];
BEGIN
    -- Get topics and categories from source document
    SELECT key_topics, categories INTO source_topics, source_categories
    FROM knowledge_base_documents 
    WHERE id = document_id_param;
    
    RETURN QUERY
    SELECT 
        kbd.id as similar_document_id,
        kbd.filename,
        (
            CASE 
                WHEN source_topics IS NULL OR kbd.key_topics IS NULL THEN 0.0
                ELSE (
                    array_length(source_topics & kbd.key_topics, 1)::FLOAT / 
                    GREATEST(array_length(source_topics, 1), array_length(kbd.key_topics, 1))::FLOAT
                )
            END +
            CASE 
                WHEN source_categories IS NULL OR kbd.categories IS NULL THEN 0.0
                ELSE (
                    array_length(source_categories & kbd.categories, 1)::FLOAT / 
                    GREATEST(array_length(source_categories, 1), array_length(kbd.categories, 1))::FLOAT
                )
            END
        ) / 2.0 as similarity_score,
        source_topics & kbd.key_topics as shared_topics
    FROM knowledge_base_documents kbd
    WHERE 
        kbd.id != document_id_param
        AND kbd.user_id = (SELECT user_id FROM knowledge_base_documents WHERE id = document_id_param)
        AND (
            (source_topics IS NOT NULL AND kbd.key_topics IS NOT NULL AND source_topics && kbd.key_topics)
            OR (source_categories IS NOT NULL AND kbd.categories IS NOT NULL AND source_categories && kbd.categories)
        )
    HAVING (
        CASE 
            WHEN source_topics IS NULL OR kbd.key_topics IS NULL THEN 0.0
            ELSE (
                array_length(source_topics & kbd.key_topics, 1)::FLOAT / 
                GREATEST(array_length(source_topics, 1), array_length(kbd.key_topics, 1))::FLOAT
            )
        END +
        CASE 
            WHEN source_categories IS NULL OR kbd.categories IS NULL THEN 0.0
            ELSE (
                array_length(source_categories & kbd.categories, 1)::FLOAT / 
                GREATEST(array_length(source_categories, 1), array_length(kbd.categories, 1))::FLOAT
            )
        END
    ) / 2.0 >= similarity_threshold
    ORDER BY similarity_score DESC
    LIMIT limit_results;
END;
$$;