-- Create Trophies Table
create table public.trophies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon text not null, -- Lucide icon name
  color text not null, -- Hex color
  condition_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create User Trophies Table (Unlock status)
create table public.user_trophies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  trophy_id uuid references public.trophies(id) on delete cascade not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, trophy_id)
);

-- Enable RLS
alter table public.trophies enable row level security;
alter table public.user_trophies enable row level security;

-- Policies for Trophies (Public Read, Admin Write)
create policy "Trophies are viewable by everyone" on public.trophies
  for select using (true);

create policy "Trophies are editable by authenticated users" on public.trophies
  for all using (auth.role() = 'authenticated'); -- Ideally restricted to admin, but 'authenticated' for now per user context

-- Policies for User Trophies (User Read Own, User/Admin Write)
create policy "Users can view their own trophies" on public.user_trophies
  for select using (auth.uid() = user_id);

create policy "Users can unlock trophies" on public.user_trophies
  for insert with check (auth.uid() = user_id);

-- Seed Initial Trophies
insert into public.trophies (name, description, icon, color, condition_description) values
('Supporter', '1er Match', 'Ticket', '#3B82F6', 'Assister à votre premier match'),
('Fidèle', '3 Connexions', 'Flame', '#EF4444', 'Se connecter 3 jours de suite'),
('Oracle', 'Quiz 10/10', 'Brain', '#8B5CF6', 'Obtenir un score parfait au quiz'),
('Buteur', 'Puck Runner 50pts', 'Target', '#10B981', 'Marquer 50 points au mini-jeu'),
('Expert', 'Niveau 5', 'Award', '#EAB308', 'Atteindre le niveau 5'),
('VIP', 'Premium', 'Crown', '#F59E0B', 'Devenir membre Premium');
