-- Add sample stats to finished matches
UPDATE matches 
SET stats = '{
  "home": {"shots": 32, "saves": 28, "faceoffs": 34, "powerplay": "1/4", "penalties": 8},
  "away": {"shots": 29, "saves": 29, "faceoffs": 28, "powerplay": "0/3", "penalties": 12}
}'::jsonb
WHERE status = 'finished';

-- Specific stats for a recent game (Rouen vs Angers example)
UPDATE matches 
SET stats = '{
  "home": {"shots": 45, "saves": 22, "faceoffs": 40, "powerplay": "2/5", "penalties": 6},
  "away": {"shots": 23, "saves": 42, "faceoffs": 30, "powerplay": "1/4", "penalties": 10}
}'::jsonb
WHERE home_team_id = (SELECT id FROM teams WHERE slug='rouen') 
  AND away_team_id = (SELECT id FROM teams WHERE slug='angers');
