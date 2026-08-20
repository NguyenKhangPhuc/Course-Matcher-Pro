drop function if exists "public"."match_courses"(query_embedding public.vector, source_id uuid, match_count integer, match_threshold double precision, filter_programme text);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.match_courses(query_embedding public.vector, source_id uuid, match_count integer DEFAULT 10, match_threshold double precision DEFAULT 0.5, filter_programme text DEFAULT NULL::text, start_filter date DEFAULT NULL::date, end_filter date DEFAULT NULL::date)
 RETURNS TABLE(id uuid, code text, name text, title text, programme text, degree_type text, study_option text, credits text, description text, learning_outcomes text, content text, prerequisites text, assessment text, instructor text, url text, timing jsonb, start_date date, end_date date, enrollment_start_date date, enrollment_end_date date, similarity double precision)
 LANGUAGE sql
 STABLE
AS $function$
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
$function$
;


