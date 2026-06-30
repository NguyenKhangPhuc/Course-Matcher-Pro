create extension if not exists "vector" with schema "public";

create type "public"."DEGREE" as enum ('Bachelor', 'Master', 'Ph.D');

create type "public"."PROGRAMME" as enum ('Information Processing Science', 'Electronics and Communications Engineering', 'Computer Science and Engineering', 'Biomedical Engineering');

create type "public"."UNIVERSITY" as enum ('University of Oulu', 'Oulu University of Applied Science');

create type "public"."YEAR" as enum ('First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Other');


  create table "public"."courses" (
    "id" uuid not null default gen_random_uuid(),
    "source_id" uuid not null,
    "code" text,
    "name" text not null,
    "title" text,
    "programme" text,
    "degree_type" text,
    "study_option" text,
    "timing" jsonb,
    "description" text,
    "learning_outcomes" text,
    "content" text,
    "prerequisites" text,
    "assessment" text,
    "instructor" text,
    "credits" text,
    "url" text,
    "embedding" public.vector(1536),
    "searchable_text" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."courses" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text,
    "email" text,
    "avatar_url" text,
    "company_name" text,
    "programme" text,
    "university" text,
    "degree" text,
    "year" text,
    "company_unit" text,
    "job_title" text,
    "github" text,
    "linkedIn" text,
    "description" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."sources" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" text not null,
    "file_type" text not null,
    "is_default" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."sources" enable row level security;

CREATE INDEX courses_code_idx ON public.courses USING btree (code);

CREATE INDEX courses_embedding_idx ON public.courses USING ivfflat (embedding public.vector_cosine_ops) WITH (lists='100');

CREATE UNIQUE INDEX courses_pkey ON public.courses USING btree (id);

CREATE INDEX courses_source_id_idx ON public.courses USING btree (source_id);

CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX sources_pkey ON public.sources USING btree (id);

CREATE UNIQUE INDEX unique_default_per_user ON public.sources USING btree (user_id) WHERE (is_default = true);

alter table "public"."courses" add constraint "courses_pkey" PRIMARY KEY using index "courses_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."sources" add constraint "sources_pkey" PRIMARY KEY using index "sources_pkey";

alter table "public"."courses" add constraint "courses_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE CASCADE not valid;

alter table "public"."courses" validate constraint "courses_source_id_fkey";

alter table "public"."profiles" add constraint "profiles_email_key" UNIQUE using index "profiles_email_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."sources" add constraint "sources_file_type_check" CHECK ((file_type = ANY (ARRAY['excel'::text, 'csv'::text, 'json'::text, 'pdf'::text]))) not valid;

alter table "public"."sources" validate constraint "sources_file_type_check";

alter table "public"."sources" add constraint "sources_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."sources" validate constraint "sources_user_id_fkey";

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

grant delete on table "public"."courses" to "anon";

grant insert on table "public"."courses" to "anon";

grant references on table "public"."courses" to "anon";

grant select on table "public"."courses" to "anon";

grant trigger on table "public"."courses" to "anon";

grant truncate on table "public"."courses" to "anon";

grant update on table "public"."courses" to "anon";

grant delete on table "public"."courses" to "authenticated";

grant insert on table "public"."courses" to "authenticated";

grant references on table "public"."courses" to "authenticated";

grant select on table "public"."courses" to "authenticated";

grant trigger on table "public"."courses" to "authenticated";

grant truncate on table "public"."courses" to "authenticated";

grant update on table "public"."courses" to "authenticated";

grant delete on table "public"."courses" to "postgres";

grant insert on table "public"."courses" to "postgres";

grant references on table "public"."courses" to "postgres";

grant select on table "public"."courses" to "postgres";

grant trigger on table "public"."courses" to "postgres";

grant truncate on table "public"."courses" to "postgres";

grant update on table "public"."courses" to "postgres";

grant delete on table "public"."courses" to "service_role";

grant insert on table "public"."courses" to "service_role";

grant references on table "public"."courses" to "service_role";

grant select on table "public"."courses" to "service_role";

grant trigger on table "public"."courses" to "service_role";

grant truncate on table "public"."courses" to "service_role";

grant update on table "public"."courses" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "postgres";

grant insert on table "public"."profiles" to "postgres";

grant references on table "public"."profiles" to "postgres";

grant select on table "public"."profiles" to "postgres";

grant trigger on table "public"."profiles" to "postgres";

grant truncate on table "public"."profiles" to "postgres";

grant update on table "public"."profiles" to "postgres";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."sources" to "anon";

grant insert on table "public"."sources" to "anon";

grant references on table "public"."sources" to "anon";

grant select on table "public"."sources" to "anon";

grant trigger on table "public"."sources" to "anon";

grant truncate on table "public"."sources" to "anon";

grant update on table "public"."sources" to "anon";

grant delete on table "public"."sources" to "authenticated";

grant insert on table "public"."sources" to "authenticated";

grant references on table "public"."sources" to "authenticated";

grant select on table "public"."sources" to "authenticated";

grant trigger on table "public"."sources" to "authenticated";

grant truncate on table "public"."sources" to "authenticated";

grant update on table "public"."sources" to "authenticated";

grant delete on table "public"."sources" to "postgres";

grant insert on table "public"."sources" to "postgres";

grant references on table "public"."sources" to "postgres";

grant select on table "public"."sources" to "postgres";

grant trigger on table "public"."sources" to "postgres";

grant truncate on table "public"."sources" to "postgres";

grant update on table "public"."sources" to "postgres";

grant delete on table "public"."sources" to "service_role";

grant insert on table "public"."sources" to "service_role";

grant references on table "public"."sources" to "service_role";

grant select on table "public"."sources" to "service_role";

grant trigger on table "public"."sources" to "service_role";

grant truncate on table "public"."sources" to "service_role";

grant update on table "public"."sources" to "service_role";


  create policy "Users delete own courses"
  on "public"."courses"
  as permissive
  for delete
  to public
using ((source_id IN ( SELECT sources.id
   FROM public.sources
  WHERE (sources.user_id = auth.uid()))));



  create policy "Users insert courses to own sources"
  on "public"."courses"
  as permissive
  for insert
  to public
with check ((source_id IN ( SELECT sources.id
   FROM public.sources
  WHERE (sources.user_id = auth.uid()))));



  create policy "Users see own courses and defaults"
  on "public"."courses"
  as permissive
  for select
  to public
using (true);



  create policy "Enable insert for authenticated users only"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Policy with table joins"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using (true);



  create policy "Users delete own sources"
  on "public"."sources"
  as permissive
  for delete
  to public
using (((user_id = auth.uid()) AND (is_default = false)));



  create policy "Users insert own sources"
  on "public"."sources"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "Users see own sources and defaults"
  on "public"."sources"
  as permissive
  for select
  to public
using (((user_id = auth.uid()) OR (is_default = true)));


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


