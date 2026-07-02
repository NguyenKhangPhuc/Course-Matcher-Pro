create extension if not exists "pg_cron" with schema "pg_catalog";


  create table "public"."user_usage" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "searches_today" integer default 0,
    "searches_limit" integer default 5,
    "last_reset_date" date default CURRENT_DATE,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."user_usage" enable row level security;

alter table "public"."search_history" add column "position" text not null;

alter table "public"."search_history" add column "summary" text;

alter table "public"."search_matches" drop column "rank";

CREATE UNIQUE INDEX user_usage_pkey ON public.user_usage USING btree (id);

CREATE UNIQUE INDEX user_usage_user_id_key ON public.user_usage USING btree (user_id);

alter table "public"."user_usage" add constraint "user_usage_pkey" PRIMARY KEY using index "user_usage_pkey";

alter table "public"."search_history" add constraint "search_history_user_id_fkey1" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."search_history" validate constraint "search_history_user_id_fkey1";

alter table "public"."user_usage" add constraint "user_usage_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_usage" validate constraint "user_usage_user_id_fkey";

alter table "public"."user_usage" add constraint "user_usage_user_id_key" UNIQUE using index "user_usage_user_id_key";

set check_function_bodies = off;

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

grant delete on table "public"."user_usage" to "anon";

grant insert on table "public"."user_usage" to "anon";

grant references on table "public"."user_usage" to "anon";

grant select on table "public"."user_usage" to "anon";

grant trigger on table "public"."user_usage" to "anon";

grant truncate on table "public"."user_usage" to "anon";

grant update on table "public"."user_usage" to "anon";

grant delete on table "public"."user_usage" to "authenticated";

grant insert on table "public"."user_usage" to "authenticated";

grant references on table "public"."user_usage" to "authenticated";

grant select on table "public"."user_usage" to "authenticated";

grant trigger on table "public"."user_usage" to "authenticated";

grant truncate on table "public"."user_usage" to "authenticated";

grant update on table "public"."user_usage" to "authenticated";

grant delete on table "public"."user_usage" to "postgres";

grant insert on table "public"."user_usage" to "postgres";

grant references on table "public"."user_usage" to "postgres";

grant select on table "public"."user_usage" to "postgres";

grant trigger on table "public"."user_usage" to "postgres";

grant truncate on table "public"."user_usage" to "postgres";

grant update on table "public"."user_usage" to "postgres";

grant delete on table "public"."user_usage" to "service_role";

grant insert on table "public"."user_usage" to "service_role";

grant references on table "public"."user_usage" to "service_role";

grant select on table "public"."user_usage" to "service_role";

grant trigger on table "public"."user_usage" to "service_role";

grant truncate on table "public"."user_usage" to "service_role";

grant update on table "public"."user_usage" to "service_role";


  create policy "Enable insert for users based on user_id"
  on "public"."user_usage"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable read access for all users"
  on "public"."user_usage"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Policy with table joins"
  on "public"."user_usage"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


CREATE TRIGGER on_auth_user_created_usage AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_usage();


