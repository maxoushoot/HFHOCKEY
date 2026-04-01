-- Migration: Add Event Reactions & Unique Constraints for Stable IDs

-- 1. Truncate game_events to avoid conflicts when adding unique constraint
-- This data will be re-synced from the API automatically
TRUNCATE TABLE public.game_events CASCADE;

-- 2. Add Unique Constraint to game_events
-- This allows us to use UPSERT and keep stable IDs
ALTER TABLE public.game_events
ADD CONSTRAINT game_events_unique_event UNIQUE (match_api_id, period, minute, event_type, team_api_id, player_name, comment);

-- 3. Create Event Reactions Table
CREATE TABLE IF NOT EXISTS public.event_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id BIGINT REFERENCES public.game_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), -- Nullable for anonymous/simulated users
    reaction_type TEXT NOT NULL, -- '🔥', '👏', '⚡', etc.
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Realtime
ALTER TABLE public.event_reactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Allow anyone to read reactions
CREATE POLICY "Enable read access for all users" ON public.event_reactions
FOR SELECT USING (true);

-- Allow anyone to insert reactions (for now, can be restricted later)
CREATE POLICY "Enable insert access for all users" ON public.event_reactions
FOR INSERT WITH CHECK (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_reactions;
