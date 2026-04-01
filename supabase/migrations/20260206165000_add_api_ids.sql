-- Add API Sports ID columns to track synchronization
ALTER TABLE teams ADD COLUMN IF NOT EXISTS api_id INTEGER UNIQUE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS api_id INTEGER UNIQUE;

-- Create index for faster lookups during sync
CREATE INDEX IF NOT EXISTS idx_teams_api_id ON teams(api_id);
CREATE INDEX IF NOT EXISTS idx_matches_api_id ON matches(api_id);
