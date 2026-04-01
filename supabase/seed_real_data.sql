-- SEED DATA: SYNERGLACE LIGUE MAGNUS 2024-2025
-- Data source: Wikipedia / HockeyDB (Feb 2025)

-- 1. UPSERT TEAMS with current standings
-- Note: 'id' is looked up by slug or name if possible, but for seeding we often use known slugs.

-- Grenoble (Brûleurs de Loups)
UPDATE teams SET 
    points = 108, wins = 37, losses = 5, ot_losses = 2, goals_for = 212, goals_against = 93
WHERE slug = 'bdl';

-- Angers (Ducs)
UPDATE teams SET 
    points = 94, wins = 32, losses = 11, ot_losses = 1, goals_for = 177, goals_against = 111
WHERE slug = 'angers';

-- Bordeaux (Boxers)
UPDATE teams SET 
    points = 85, wins = 29, losses = 11, ot_losses = 1, goals_for = 142, goals_against = 98
WHERE slug = 'bordeaux';

-- Rouen (Dragons)
UPDATE teams SET 
    points = 83, wins = 27, losses = 14, ot_losses = 1, goals_for = 182, goals_against = 144
WHERE slug = 'rouen';

-- Amiens (Gothiques)
UPDATE teams SET 
    points = 68, wins = 23, losses = 16, ot_losses = 3, goals_for = 127, goals_against = 135
WHERE slug = 'amiens';

-- Marseille (Spartiates)
UPDATE teams SET 
    points = 60, wins = 20, losses = 20, ot_losses = 2, goals_for = 138, goals_against = 148
WHERE slug = 'marseille';

-- Chamonix (Pionniers)
UPDATE teams SET 
    points = 55, wins = 18, losses = 19, ot_losses = 5, goals_for = 126, goals_against = 134
WHERE slug = 'chamonix';

-- Nice (Aigles)
UPDATE teams SET 
    points = 52, wins = 15, losses = 22, ot_losses = 5, goals_for = 89, goals_against = 134
WHERE slug = 'nice';

-- Briançon (Diables Rouges)
UPDATE teams SET 
    points = 51, wins = 17, losses = 24, ot_losses = 2, goals_for = 115, goals_against = 153
WHERE slug = 'briancon';

-- Cergy-Pontoise (Jokers)
UPDATE teams SET 
    points = 50, wins = 16, losses = 22, ot_losses = 5, goals_for = 123, goals_against = 151
WHERE slug = 'cergy';

-- Gap (Rapaces)
UPDATE teams SET 
    points = 43, wins = 15, losses = 24, ot_losses = 2, goals_for = 111, goals_against = 180
WHERE slug = 'gap';

-- Anglet (Hormadi)
UPDATE teams SET 
    points = 43, wins = 15, losses = 24, ot_losses = 4, goals_for = 103, goals_against = 164
WHERE slug = 'anglet';


-- 2. INSERT RECENT MATCHES (Feb 2025)
-- We need IDs for teams. Assuming standard slugs -> subqueries.

INSERT INTO matches (home_team_id, away_team_id, date, status, home_score, away_score, current_period)
VALUES 
    -- 5 Février: Rouen vs Angers
    ((SELECT id FROM teams WHERE slug='rouen'), (SELECT id FROM teams WHERE slug='angers'), '2026-02-05 20:00:00', 'finished', 3, 1, 'FT'),
    
    -- 3 Février: Gap vs Cergy
    ((SELECT id FROM teams WHERE slug='gap'), (SELECT id FROM teams WHERE slug='cergy'), '2026-02-03 20:00:00', 'finished', 2, 1, 'FT'),
    
    -- 2 Février: Anglet vs Cergy
    ((SELECT id FROM teams WHERE slug='anglet'), (SELECT id FROM teams WHERE slug='cergy'), '2026-02-02 20:00:00', 'finished', 1, 2, 'FT'),

    -- MATCHS À VENIR (Exemples pour la démo)
    ((SELECT id FROM teams WHERE slug='bdl'), (SELECT id FROM teams WHERE slug='rouen'), NOW() + INTERVAL '1 day', 'scheduled', 0, 0, NULL),
    ((SELECT id FROM teams WHERE slug='bordeaux'), (SELECT id FROM teams WHERE slug='marseille'), NOW() + INTERVAL '2 day', 'scheduled', 0, 0, NULL);
