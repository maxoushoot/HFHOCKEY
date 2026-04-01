-- Seed Match Events for historical matches
-- Using match_api_id for matching with the fetch logic

-- Rouen vs Angers (Feb 5)
INSERT INTO game_events (match_api_id, period, minute, team_name, player_name, event_type, comment)
VALUES 
    (1, 'P1', '12:30', 'Rouen', 'Loïc Lampérier', 'goal', 'SN'),
    (1, 'P2', '08:15', 'Angers', 'Marius Serer', 'goal', 'EQ'),
    (1, 'P2', '15:45', 'Rouen', 'Anthony Rech', 'goal', 'EQ'),
    (1, 'P3', '19:20', 'Rouen', 'Rolands Vigners', 'goal', 'Cage vide'),
    (1, 'P1', '05:00', 'Angers', 'Nicolas Ritz', 'penalty', '2 min - Trébucher');

-- Gap vs Cergy (Feb 3)
INSERT INTO game_events (match_api_id, period, minute, team_name, player_name, event_type, comment)
VALUES 
    (2, 'P1', '04:10', 'Gap', 'Romain Gutierrez', 'goal', 'EQ'),
    (2, 'P2', '18:50', 'Cergy', 'Aleksi Hämäläinen', 'goal', 'SN'),
    (2, 'P3', '12:30', 'Gap', 'Julien Correia', 'goal', 'EQ'),
    (2, 'P3', '05:00', 'Cergy', 'Raphaël Faure', 'penalty', '2 min - Accrocher');
