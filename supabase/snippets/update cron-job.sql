-- Xóa job cũ
SELECT cron.unschedule('reset-daily-usage');

-- Tạo lại với giờ đúng
-- 00:00 Finland time (UTC+3 summer) = 21:00 UTC ngày hôm trước
SELECT cron.schedule(
    'reset-daily-usage',
    '0 21 * * *',    -- 21:00 UTC = 00:00 Finland (UTC+3)
    $$
        UPDATE public.user_usage
        SET searches_today = 0,
            last_reset_date = current_date,
            updated_at = now()
        WHERE last_reset_date < current_date;
    $$
);