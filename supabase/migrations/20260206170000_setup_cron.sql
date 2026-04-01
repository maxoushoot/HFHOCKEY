-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the job to run every 15 minutes
-- NOTE: You must replace YOUR_PROJECT_REF and YOUR_ANON_KEY with actual values.
-- In a real migration, this is usually handled by configuration, but here is the raw SQL command.

SELECT cron.schedule(
    'sync-hockey-data-15min', -- Unique job name
    '*/15 * * * *',           -- Cron schedule (Every 15 mins)
    $$
    SELECT
      net.http_post(
          url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-hockey-data',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
);

-- Note: The Authorization header should use the SERVICE_ROLE_KEY to bypass RLS/Auth checks if needed, 
-- or use the ANON KEY if the function handles its own auth security.
-- Ideally, use a secure internal invocation.
