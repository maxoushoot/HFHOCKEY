-- ============================================
-- API-Sports Hockey Integration - Schema
-- ============================================

-- 1. Enrichir la table teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS api_logo_url TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS league_id INTEGER;

-- 2. Enrichir la table players
ALTER TABLE players ADD COLUMN IF NOT EXISTS api_id INTEGER UNIQUE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS age INTEGER;

-- 3. Enrichir la table matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS status_short TEXT DEFAULT 'NS';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS status_long TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS league_id INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS season INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS period_1 TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS period_2 TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS period_3 TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS overtime TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS penalties TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS has_events BOOLEAN DEFAULT false;

-- 4. Table game_events (buts, pénalités)
CREATE TABLE IF NOT EXISTS public.game_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_api_id INTEGER NOT NULL,
    period TEXT NOT NULL,
    minute TEXT NOT NULL,
    team_api_id INTEGER,
    team_name TEXT,
    player_name TEXT,
    assists TEXT[],
    event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'penalty')),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Table api_sync_config
CREATE TABLE IF NOT EXISTS public.api_sync_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Table api_sync_log
CREATE TABLE IF NOT EXISTS public.api_sync_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
    records_synced INTEGER DEFAULT 0,
    requests_used INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Index de performance
CREATE INDEX IF NOT EXISTS idx_game_events_match_api_id ON game_events(match_api_id);
CREATE INDEX IF NOT EXISTS idx_game_events_type ON game_events(event_type);
CREATE INDEX IF NOT EXISTS idx_matches_status_short ON matches(status_short);
CREATE INDEX IF NOT EXISTS idx_matches_season ON matches(season);
CREATE INDEX IF NOT EXISTS idx_matches_league_id ON matches(league_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_created ON api_sync_log(created_at DESC);

-- 8. RLS
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_sync_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_sync_log ENABLE ROW LEVEL SECURITY;

-- Events: lisibles par tous
CREATE POLICY "Events viewable by everyone" ON public.game_events
    FOR SELECT USING (true);

-- Config: lecture/écriture admin uniquement
CREATE POLICY "Config viewable by admins" ON public.api_sync_config
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Config writable by service role" ON public.api_sync_config
    FOR ALL USING (auth.role() = 'service_role');

-- Sync logs: lecture admin, écriture service
CREATE POLICY "Sync logs viewable by admins" ON public.api_sync_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Sync logs writable by service role" ON public.api_sync_log
    FOR ALL USING (auth.role() = 'service_role');

-- Events writable by service role
CREATE POLICY "Events writable by service role" ON public.game_events
    FOR ALL USING (auth.role() = 'service_role');
