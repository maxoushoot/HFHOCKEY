-- Create glossary_terms table
CREATE TABLE IF NOT EXISTS public.glossary_terms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    term TEXT NOT NULL UNIQUE,
    definition TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON public.glossary_terms
    FOR SELECT USING (true);

CREATE POLICY "Allow admin full access" ON public.glossary_terms
    FOR ALL USING (auth.role() = 'service_role'); -- Simplified for now, typically checks user role

-- Add stats columns to players table
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS goals INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS assists INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS matches_played INT DEFAULT 0;

-- Seed Glossary Data
INSERT INTO public.glossary_terms (term, definition, category) VALUES
    ('Icing', 'Dégagement interdit. Lorsqu''un joueur tire le palet depuis sa moitié de terrain jusqu''à derrière la ligne de but adverse.', 'Règles'),
    ('Slapshot', 'Tir frappé. Tir puissant où la crosse frappe la glace juste avant le palet pour utiliser la flexion du manche.', 'Tactique'),
    ('Zamboni', 'Surfaceuse. Machine utilisée pour resurfacer la glace entre les tiers-temps.', 'Matériel'),
    ('Power Play', 'Supériorité numérique. Situation où une équipe a plus de joueurs sur la glace suite à une pénalité adverse.', 'Tactique'),
    ('Shutout', 'Blanchissage. Lorsqu''un gardien termine le match sans encaisser de but.', 'Statistiques'),
    ('Hat Trick', 'Coup du chapeau. Lorsqu''un joueur marque 3 buts dans le même match.', 'Statistiques'),
    ('Offside', 'Hors-jeu. Un joueur offensif entre dans la zone adverse avant le palet.', 'Règles')
ON CONFLICT (term) DO NOTHING;

-- Seed Random Stats for Players (Just to have some data to show)
-- Random goals between 0 and 15
UPDATE public.players SET goals = floor(random() * 15)::int;
-- Random assists between 0 and 20
UPDATE public.players SET assists = floor(random() * 20)::int;
-- Random matches_played between 5 and 20
UPDATE public.players SET matches_played = floor(random() * 15 + 5)::int;
