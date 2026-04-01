-- 1. Fix Match API IDs
UPDATE matches 
SET api_id = 1 
WHERE home_team_id = (SELECT id FROM teams WHERE slug='rouen') 
  AND away_team_id = (SELECT id FROM teams WHERE slug='angers');

UPDATE matches 
SET api_id = 2 
WHERE home_team_id = (SELECT id FROM teams WHERE slug='gap') 
  AND away_team_id = (SELECT id FROM teams WHERE slug='cergy');

-- 2. Standardize Periods in game_events
UPDATE game_events SET period = 'P1' WHERE period = '1';
UPDATE game_events SET period = 'P2' WHERE period = '2';
UPDATE game_events SET period = 'P3' WHERE period = '3';
UPDATE game_events SET period = 'OT' WHERE period IN ('4', 'Prolongations');
UPDATE game_events SET period = 'PT' WHERE period IN ('5', 'Tirs au but');

-- 3. Ensure events have correct team_api_id linked (for left/right alignment)
UPDATE game_events ge
SET team_api_id = t.api_id
FROM teams t
WHERE ge.team_name = t.name
AND ge.team_api_id IS NULL;
