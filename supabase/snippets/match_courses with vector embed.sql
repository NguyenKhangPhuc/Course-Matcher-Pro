-- 1. Xóa phiên bản cũ
-- Lưu ý: Nếu phiên bản cũ có số lượng tham số khác, hãy điều chỉnh cho khớp
DROP FUNCTION IF EXISTS match_courses(vector, uuid, integer, double precision, text, date, date);

-- 2. Tạo hàm mới với các cột enrollment
CREATE OR REPLACE FUNCTION match_courses(
    query_embedding  VECTOR(1536),
    source_id        UUID,
    match_count      INT     DEFAULT 10,
    match_threshold  FLOAT   DEFAULT 0.5,
    filter_programme TEXT    DEFAULT NULL,
    start_filter     DATE    DEFAULT NULL,
    end_filter       DATE    DEFAULT NULL
)
RETURNS TABLE (
    id                    UUID,
    code                  TEXT,
    name                  TEXT,
    title                 TEXT,
    programme             TEXT,
    degree_type           TEXT,
    study_option          TEXT,
    credits               TEXT,
    description           TEXT,
    learning_outcomes     TEXT,
    content               TEXT,
    prerequisites         TEXT,
    assessment            TEXT,
    instructor            TEXT,
    url                   TEXT,
    timing                JSONB,
    start_date            DATE,
    end_date              DATE,
    enrollment_start_date DATE,   -- Thêm cột mới
    enrollment_end_date   DATE,   -- Thêm cột mới
    similarity            FLOAT
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
        c.start_date,
        c.end_date,
        c.enrollment_start_date, -- Chọn từ bảng
        c.enrollment_end_date,   -- Chọn từ bảng
        1 - (c.embedding <=> query_embedding) AS similarity
    FROM courses c
    WHERE
        c.source_id = match_courses.source_id
        AND 1 - (c.embedding <=> query_embedding) > match_threshold
        AND c.embedding IS NOT NULL
        AND (filter_programme IS NULL OR c.programme = filter_programme)
        AND (start_filter IS NULL OR c.start_date >= start_filter)
        AND (end_filter IS NULL OR c.end_date <= end_filter)
    ORDER BY
        c.embedding <=> query_embedding ASC
    LIMIT match_count;
$$;

-- 3. Cấp quyền
GRANT EXECUTE ON FUNCTION match_courses TO authenticated;
GRANT EXECUTE ON FUNCTION match_courses TO anon;