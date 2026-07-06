-- 1. BẮT BUỘC: Xóa phiên bản cũ có cấu trúc tham số này trước
DROP FUNCTION IF EXISTS match_courses(vector, uuid, integer, double precision);

-- 2. TẠO LẠI HÀM MỚI VỚI CẤU TRÚC CHUẨN CỦA BẠN
CREATE OR REPLACE FUNCTION match_courses(
    query_embedding  VECTOR(1536),
    source_id        UUID,
    match_count      INT     DEFAULT 10,
    match_threshold  FLOAT   DEFAULT 0.5,
    filter_programme TEXT    DEFAULT NULL   -- NULL = không filter, lấy tất cả programme
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
STABLE
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
        1 - (c.embedding <=> query_embedding) AS similarity
    FROM courses c
    WHERE
        c.source_id = match_courses.source_id
        AND 1 - (c.embedding <=> query_embedding) > match_threshold
        AND c.embedding IS NOT NULL
        AND (filter_programme IS NULL OR c.programme = filter_programme)
    ORDER BY
        c.embedding <=> query_embedding ASC
    LIMIT match_count;
$$;

-- 3. CẤP LẠI QUYỀN TRUY CẬP
GRANT EXECUTE ON FUNCTION match_courses TO authenticated;
GRANT EXECUTE ON FUNCTION match_courses TO anon;