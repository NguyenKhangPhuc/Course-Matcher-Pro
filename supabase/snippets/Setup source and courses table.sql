-- =====================
-- ENABLE EXTENSION
-- =====================
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =====================
-- TABLE: sources
-- =====================
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('excel', 'csv', 'json', 'pdf')),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mỗi user chỉ có 1 default source tại một thời điểm
CREATE UNIQUE INDEX unique_default_per_user 
ON sources (user_id) 
WHERE is_default = TRUE;


-- =====================
-- TABLE: courses
-- =====================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,

    -- Identification
    code TEXT,
    name TEXT NOT NULL,
    title TEXT,

    -- Programme info
    programme TEXT,
    degree_type TEXT,
    study_option TEXT,

    -- Schedule — lưu dạng JSONB cho linh hoạt
    -- Ví dụ: {"1st_YEAR_1P": 1, "1st_YEAR_2P": 0, "2nd_YEAR_3P": 1}
    time JSONB DEFAULT '{}',

    -- Content
    description TEXT,
    learning_outcomes TEXT,
    content TEXT,
    prerequisites TEXT,
    assessment TEXT,
    instructor TEXT,
    credits TEXT,
    url TEXT,

    -- Embedding vector (1536 chiều cho text-embedding-3-small)
    embedding VECTOR(1536),

    -- Text gộp dùng để embed — lưu lại để debug
    searchable_text TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index vector để search nhanh
CREATE INDEX courses_embedding_idx 
ON courses 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index thường để filter nhanh theo source_id
CREATE INDEX courses_source_id_idx ON courses(source_id);
CREATE INDEX courses_code_idx ON courses(code);


-- =====================
-- RLS (Row Level Security)
-- =====================

-- Bật RLS
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Sources: user chỉ thấy data của mình + default sources
CREATE POLICY "Users see own sources and defaults"
ON sources FOR SELECT
USING (
    user_id = auth.uid() 
    OR is_default = TRUE
);

CREATE POLICY "Users insert own sources"
ON sources FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own sources"
ON sources FOR DELETE
USING (user_id = auth.uid() AND is_default = FALSE);

-- Courses: user thấy courses thuộc sources của mình + default
CREATE POLICY "Users see own courses and defaults"
ON courses FOR SELECT
USING (
    source_id IN (
        SELECT id FROM sources
        WHERE user_id = auth.uid() OR is_default = TRUE
    )
);

CREATE POLICY "Users insert courses to own sources"
ON courses FOR INSERT
WITH CHECK (
    source_id IN (
        SELECT id FROM sources WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users delete own courses"
ON courses FOR DELETE
USING (
    source_id IN (
        SELECT id FROM sources WHERE user_id = auth.uid()
    )
);