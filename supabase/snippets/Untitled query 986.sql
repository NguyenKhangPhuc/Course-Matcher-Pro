SELECT jobid, runid, job_pid, database, username, command, status, return_message, start_time, end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'reset-daily-usage')
ORDER BY start_time DESC
LIMIT 10;