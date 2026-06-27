-- =====================
-- FUNCTION: match_courses
-- =====================
CREATE OR REPLACE FUNCTION match_courses(
    query_embedding  VECTOR(1536),  -- Vector từ query đã embed
    source_id        UUID,          -- Bắt buộc — chỉ search trong source này
    match_count      INT     DEFAULT 10,
    match_threshold  FLOAT   DEFAULT 0.5
)
RETURNS TABLE (
    id               UUID,
    code             TEXT,
    name             TEXT,
    title            TEXT,
    programme        TEXT,
    degree_type      TEXT,
    study_option     TEXT,
    credits          TEXT,
    description      TEXT,
    learning_outcomes TEXT,
    content          TEXT,
    prerequisites    TEXT,
    assessment       TEXT,
    instructor       TEXT,
    url              TEXT,
    timing           JSONB,
    similarity       FLOAT
)
LANGUAGE SQL
STABLE  -- Không modify data, cùng input → cùng output
AS $$
    SELECT
        c.id,
        c.code,
        c.name,
        c.title,
        c.programme,
        c.degree_type,
        c.study_option,
        c.credits,
        c.description,
        c.learning_outcomes,
        c.content,
        c.prerequisites,
        c.assessment,
        c.instructor,
        c.url,
        c.timing,
        -- Cosine similarity: 1 = identical, 0 = unrelated
        1 - (c.embedding <=> query_embedding) AS similarity
    FROM courses c
    WHERE
        -- Bắt buộc: chỉ search trong đúng source_id được truyền vào
        c.source_id = match_courses.source_id
        -- Chỉ lấy những course đủ relevant
        AND 1 - (c.embedding <=> query_embedding) > match_threshold
        -- Không lấy course chưa có embedding
        AND c.embedding IS NOT NULL
    ORDER BY
        c.embedding <=> query_embedding ASC  -- ASC = gần nhất lên đầu
    LIMIT match_count;
$$;

-- Cho phép function chạy với anonymous users (RLS vẫn áp dụng)
GRANT EXECUTE ON FUNCTION match_courses TO authenticated;
GRANT EXECUTE ON FUNCTION match_courses TO anon;