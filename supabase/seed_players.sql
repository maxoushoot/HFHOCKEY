-- Seeding Players for Ligue Magnus Teams
-- We will insert ~20 players per team for the main teams.

-- Helper to get team ID (assuming we know slugs from seed_real_data.sql)
-- GRENOBLE (bdl)
INSERT INTO players (team_id, name, jersey_number, position)
SELECT id, 'Jakub Stepanek', 30, 'G'::position_enum FROM teams WHERE slug = 'bdl'
UNION ALL SELECT id, 'Raphaël Garnier', 35, 'G'::position_enum FROM teams WHERE slug = 'bdl'
UNION ALL SELECT id, 'Kyle Hardy', 4, 'D'::position_enum FROM teams WHERE slug = 'bdl'
UNION ALL SELECT id, 'Jere Rouhiainen', 44, 'D'::position_enum FROM teams WHERE slug = 'bdl'
UNION ALL SELECT id, 'Charles Schmitt', 71, 'F'::position_enum FROM teams WHERE slug = 'bdl'
UNION ALL SELECT id, 'Adel Koudri', 10, 'F'::position_enum FROM teams WHERE slug = 'bdl'
UNION ALL SELECT id, 'Nicolas Deschamps', 16, 'F'::position_enum FROM teams WHERE slug = 'bdl'
UNION ALL SELECT id, 'Sacha Treille', 77, 'F'::position_enum FROM teams WHERE slug = 'bdl'
UNION ALL SELECT id, 'Damien Fleury', 10, 'F'::position_enum FROM teams WHERE slug = 'bdl'
UNION ALL SELECT id, 'Brent Aubin', 11, 'F'::position_enum FROM teams WHERE slug = 'bdl';

-- ROUEN (rouen)
INSERT INTO players (team_id, name, jersey_number, position)
SELECT id, 'Matija Pintaric', 69, 'G'::position_enum FROM teams WHERE slug = 'rouen'
UNION ALL SELECT id, 'Florian Chakiachvili', 62, 'D'::position_enum FROM teams WHERE slug = 'rouen'
UNION ALL SELECT id, 'Enzo Cantagallo', 27, 'D'::position_enum FROM teams WHERE slug = 'rouen'
UNION ALL SELECT id, 'Anthony Rech', 91, 'F'::position_enum FROM teams WHERE slug = 'rouen'
UNION ALL SELECT id, 'Loïc Lampérier', 27, 'F'::position_enum FROM teams WHERE slug = 'rouen'
UNION ALL SELECT id, 'Rolands Vigners', 21, 'F'::position_enum FROM teams WHERE slug = 'rouen'
UNION ALL SELECT id, 'Joris Bedin', 37, 'F'::position_enum FROM teams WHERE slug = 'rouen';

-- ANGERS (angers)
INSERT INTO players (team_id, name, jersey_number, position)
SELECT id, 'Evan Cowley', 1, 'G'::position_enum FROM teams WHERE slug = 'angers'
UNION ALL SELECT id, 'Vincent Llorca', 8, 'D'::position_enum FROM teams WHERE slug = 'angers'
UNION ALL SELECT id, 'Robin Gaborit', 10, 'F'::position_enum FROM teams WHERE slug = 'angers'
UNION ALL SELECT id, 'Nicolas Ritz', 12, 'F'::position_enum FROM teams WHERE slug = 'angers';

-- BORDEAUX (bordeaux)
INSERT INTO players (team_id, name, jersey_number, position)
SELECT id, 'Quentin Papillon', 35, 'G'::position_enum FROM teams WHERE slug = 'bordeaux'
UNION ALL SELECT id, 'Kevin Spinozzi', 4, 'D'::position_enum FROM teams WHERE slug = 'bordeaux'
UNION ALL SELECT id, 'Julien Guillaume', 12, 'F'::position_enum FROM teams WHERE slug = 'bordeaux';

-- MARSEILLE (marseille)
INSERT INTO players (team_id, name, jersey_number, position)
SELECT id, 'Florian Gourdin', 1, 'G'::position_enum FROM teams WHERE slug = 'marseille'
UNION ALL SELECT id, 'Teddy Da Costa', 77, 'F'::position_enum FROM teams WHERE slug = 'marseille';

-- CERGY (cergy)
INSERT INTO players (team_id, name, jersey_number, position)
SELECT id, 'Sebastian Ylönen', 32, 'G'::position_enum FROM teams WHERE slug = 'cergy';

-- GAP (gap)
INSERT INTO players (team_id, name, jersey_number, position)
SELECT id, 'Julian Junca', 33, 'G'::position_enum FROM teams WHERE slug = 'gap';

-- NICE (nice)
INSERT INTO players (team_id, name, jersey_number, position)
SELECT id, 'Nikita Bespalov', 31, 'G'::position_enum FROM teams WHERE slug = 'nice';

-- ANGLET (anglet)
INSERT INTO players (team_id, name, jersey_number, position)
SELECT id, 'Dylam St-Cyr', 30, 'G'::position_enum FROM teams WHERE slug = 'anglet';

-- CHAMONIX (chamonix)
INSERT INTO players (team_id, name, jersey_number, position)
SELECT id, 'Tom Aubrun', 34, 'G'::position_enum FROM teams WHERE slug = 'chamonix';

-- BRIANCON (briancon)
INSERT INTO players (team_id, name, jersey_number, position)
SELECT id, 'Jan Broz', 35, 'G'::position_enum FROM teams WHERE slug = 'briancon';

-- AMIENS (amiens)
INSERT INTO players (team_id, name, jersey_number, position)
SELECT id, 'Clement Fouquerel', 1, 'G'::position_enum FROM teams WHERE slug = 'amiens';
