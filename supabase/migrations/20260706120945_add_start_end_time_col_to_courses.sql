alter table "public"."courses" add column "end_date" timestamp without time zone;

alter table "public"."courses" add column "enrollment_end_date" timestamp without time zone;

alter table "public"."courses" add column "enrollment_start_date" timestamp without time zone;

alter table "public"."courses" add column "start_date" timestamp without time zone;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    null,
    lower(new.raw_user_meta_data->>'email')
  );
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_usage (user_id)
  VALUES (new.id);
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_search_usage(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    updated_rows INTEGER;
BEGIN
    -- Chỉ update nếu searches_today < searches_limit
    -- Atomic: check và increment trong 1 query, không có race condition
    UPDATE user_usage
    SET 
        searches_today = searches_today + 1,
        updated_at = NOW()
    WHERE 
        user_id = p_user_id
        AND searches_today < searches_limit;

    GET DIAGNOSTICS updated_rows = ROW_COUNT;

    -- 0 rows updated = đã đạt limit
    IF updated_rows = 0 THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.match_courses(query_embedding public.vector, source_id uuid, match_count integer DEFAULT 10, match_threshold double precision DEFAULT 0.5)
 RETURNS TABLE(id uuid, code text, name text, title text, programme text, degree_type text, study_option text, credits text, description text, learning_outcomes text, content text, prerequisites text, assessment text, instructor text, url text, timing jsonb, similarity double precision)
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
$function$
;

grant delete on table "public"."courses" to "postgres";

grant insert on table "public"."courses" to "postgres";

grant references on table "public"."courses" to "postgres";

grant select on table "public"."courses" to "postgres";

grant trigger on table "public"."courses" to "postgres";

grant truncate on table "public"."courses" to "postgres";

grant update on table "public"."courses" to "postgres";

grant delete on table "public"."profiles" to "postgres";

grant insert on table "public"."profiles" to "postgres";

grant references on table "public"."profiles" to "postgres";

grant select on table "public"."profiles" to "postgres";

grant trigger on table "public"."profiles" to "postgres";

grant truncate on table "public"."profiles" to "postgres";

grant update on table "public"."profiles" to "postgres";

grant delete on table "public"."search_history" to "postgres";

grant insert on table "public"."search_history" to "postgres";

grant references on table "public"."search_history" to "postgres";

grant select on table "public"."search_history" to "postgres";

grant trigger on table "public"."search_history" to "postgres";

grant truncate on table "public"."search_history" to "postgres";

grant update on table "public"."search_history" to "postgres";

grant delete on table "public"."search_matches" to "postgres";

grant insert on table "public"."search_matches" to "postgres";

grant references on table "public"."search_matches" to "postgres";

grant select on table "public"."search_matches" to "postgres";

grant trigger on table "public"."search_matches" to "postgres";

grant truncate on table "public"."search_matches" to "postgres";

grant update on table "public"."search_matches" to "postgres";

grant delete on table "public"."sources" to "postgres";

grant insert on table "public"."sources" to "postgres";

grant references on table "public"."sources" to "postgres";

grant select on table "public"."sources" to "postgres";

grant trigger on table "public"."sources" to "postgres";

grant truncate on table "public"."sources" to "postgres";

grant update on table "public"."sources" to "postgres";

grant delete on table "public"."user_usage" to "postgres";

grant insert on table "public"."user_usage" to "postgres";

grant references on table "public"."user_usage" to "postgres";

grant select on table "public"."user_usage" to "postgres";

grant trigger on table "public"."user_usage" to "postgres";

grant truncate on table "public"."user_usage" to "postgres";

grant update on table "public"."user_usage" to "postgres";


