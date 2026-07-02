-- Bảng 1: Mỗi lần search là 1 record
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    
    company_name TEXT NOT NULL,
    job_description TEXT,
    technical_requirements TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng 2: Mỗi course match thuộc về 1 search
CREATE TABLE search_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_id UUID NOT NULL REFERENCES search_history(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    similarity FLOAT NOT NULL,
    rank INTEGER,  
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index cho query nhanh
CREATE INDEX idx_search_history_user ON search_history(user_id, created_at DESC);
CREATE INDEX idx_search_matches_search_id ON search_matches(search_id);