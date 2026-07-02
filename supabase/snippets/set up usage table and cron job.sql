-- Enable pg_cron (chỉ cần 1 lần)
create extension if not exists pg_cron;

-- Tạo bảng usage
create table public.user_usage (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade unique,
    searches_today integer default 0,
    searches_limit integer default 5,
    last_reset_date date default current_date,
    updated_at timestamptz default now()
);

-- Cron job reset lúc 00:00 UTC mỗi ngày
select cron.schedule(
    'reset-daily-usage',       -- job name
    '0 0 * * *',               -- every day at 00:00 UTC
    $$
        update public.user_usage
        set searches_today = 0,
            last_reset_date = current_date,
            updated_at = now()
        where last_reset_date < current_date;
    $$
);