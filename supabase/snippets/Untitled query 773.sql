create table public.profiles (
  id uuid not null,
  full_name text null,
  email text null,
  avatar_url text null,
  company_name text null,
  programme TEXT null,
  university text null,
  degree text null,
  year text null,
  company_unit text null,
  job_title text null,
  github text null,
  "linkedIn" text null,
  description text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;