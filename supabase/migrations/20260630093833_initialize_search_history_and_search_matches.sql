
  create table "public"."search_history" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "source_id" uuid not null,
    "company_name" text not null,
    "job_description" text,
    "technical_requirements" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."search_history" enable row level security;


  create table "public"."search_matches" (
    "id" uuid not null default gen_random_uuid(),
    "search_id" uuid not null,
    "course_id" uuid not null,
    "similarity" double precision not null,
    "rank" integer,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."search_matches" enable row level security;

CREATE INDEX idx_search_history_user ON public.search_history USING btree (user_id, created_at DESC);

CREATE INDEX idx_search_matches_search_id ON public.search_matches USING btree (search_id);

CREATE UNIQUE INDEX search_history_pkey ON public.search_history USING btree (id);

CREATE UNIQUE INDEX search_matches_pkey ON public.search_matches USING btree (id);

alter table "public"."search_history" add constraint "search_history_pkey" PRIMARY KEY using index "search_history_pkey";

alter table "public"."search_matches" add constraint "search_matches_pkey" PRIMARY KEY using index "search_matches_pkey";

alter table "public"."search_history" add constraint "search_history_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE CASCADE not valid;

alter table "public"."search_history" validate constraint "search_history_source_id_fkey";

alter table "public"."search_history" add constraint "search_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."search_history" validate constraint "search_history_user_id_fkey";

alter table "public"."search_matches" add constraint "search_matches_course_id_fkey" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE not valid;

alter table "public"."search_matches" validate constraint "search_matches_course_id_fkey";

alter table "public"."search_matches" add constraint "search_matches_search_id_fkey" FOREIGN KEY (search_id) REFERENCES public.search_history(id) ON DELETE CASCADE not valid;

alter table "public"."search_matches" validate constraint "search_matches_search_id_fkey";

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

grant delete on table "public"."search_history" to "anon";

grant insert on table "public"."search_history" to "anon";

grant references on table "public"."search_history" to "anon";

grant select on table "public"."search_history" to "anon";

grant trigger on table "public"."search_history" to "anon";

grant truncate on table "public"."search_history" to "anon";

grant update on table "public"."search_history" to "anon";

grant delete on table "public"."search_history" to "authenticated";

grant insert on table "public"."search_history" to "authenticated";

grant references on table "public"."search_history" to "authenticated";

grant select on table "public"."search_history" to "authenticated";

grant trigger on table "public"."search_history" to "authenticated";

grant truncate on table "public"."search_history" to "authenticated";

grant update on table "public"."search_history" to "authenticated";

grant delete on table "public"."search_history" to "postgres";

grant insert on table "public"."search_history" to "postgres";

grant references on table "public"."search_history" to "postgres";

grant select on table "public"."search_history" to "postgres";

grant trigger on table "public"."search_history" to "postgres";

grant truncate on table "public"."search_history" to "postgres";

grant update on table "public"."search_history" to "postgres";

grant delete on table "public"."search_history" to "service_role";

grant insert on table "public"."search_history" to "service_role";

grant references on table "public"."search_history" to "service_role";

grant select on table "public"."search_history" to "service_role";

grant trigger on table "public"."search_history" to "service_role";

grant truncate on table "public"."search_history" to "service_role";

grant update on table "public"."search_history" to "service_role";

grant delete on table "public"."search_matches" to "anon";

grant insert on table "public"."search_matches" to "anon";

grant references on table "public"."search_matches" to "anon";

grant select on table "public"."search_matches" to "anon";

grant trigger on table "public"."search_matches" to "anon";

grant truncate on table "public"."search_matches" to "anon";

grant update on table "public"."search_matches" to "anon";

grant delete on table "public"."search_matches" to "authenticated";

grant insert on table "public"."search_matches" to "authenticated";

grant references on table "public"."search_matches" to "authenticated";

grant select on table "public"."search_matches" to "authenticated";

grant trigger on table "public"."search_matches" to "authenticated";

grant truncate on table "public"."search_matches" to "authenticated";

grant update on table "public"."search_matches" to "authenticated";

grant delete on table "public"."search_matches" to "postgres";

grant insert on table "public"."search_matches" to "postgres";

grant references on table "public"."search_matches" to "postgres";

grant select on table "public"."search_matches" to "postgres";

grant trigger on table "public"."search_matches" to "postgres";

grant truncate on table "public"."search_matches" to "postgres";

grant update on table "public"."search_matches" to "postgres";

grant delete on table "public"."search_matches" to "service_role";

grant insert on table "public"."search_matches" to "service_role";

grant references on table "public"."search_matches" to "service_role";

grant select on table "public"."search_matches" to "service_role";

grant trigger on table "public"."search_matches" to "service_role";

grant truncate on table "public"."search_matches" to "service_role";

grant update on table "public"."search_matches" to "service_role";

grant delete on table "public"."sources" to "postgres";

grant insert on table "public"."sources" to "postgres";

grant references on table "public"."sources" to "postgres";

grant select on table "public"."sources" to "postgres";

grant trigger on table "public"."sources" to "postgres";

grant truncate on table "public"."sources" to "postgres";

grant update on table "public"."sources" to "postgres";


  create policy "Enable delete for users based on user_id"
  on "public"."search_history"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Enable insert for authenticated users only"
  on "public"."search_history"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."search_history"
  as permissive
  for select
  to public
using (true);



  create policy "Enable delete for users based on user_id"
  on "public"."search_matches"
  as permissive
  for delete
  to public
using (true);



  create policy "Enable insert for authenticated users only"
  on "public"."search_matches"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."search_matches"
  as permissive
  for select
  to public
using (true);



