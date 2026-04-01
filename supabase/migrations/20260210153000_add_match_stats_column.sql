-- Add stats column to matches to store game summaries (shots, faceoffs, etc.)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS stats jsonb;
