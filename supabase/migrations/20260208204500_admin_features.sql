-- Create News table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for News
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Policies for News (Readable by everyone, Writable by Admins only)
CREATE POLICY "News are viewable by everyone" ON public.news FOR SELECT USING (true);
CREATE POLICY "News are insertable by admins" ON public.news FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "News are updatable by admins" ON public.news FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "News are deletable by admins" ON public.news FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create Quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of {id, label, votes}
    correct_option_id TEXT, -- Optional (if it's a quiz with a right answer)
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Policies for Quizzes (Readable by everyone, Writable by Admins)
CREATE POLICY "Quizzes are viewable by everyone" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Quizzes are writable by admins" ON public.quizzes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Note: Voting on quizzes might need a separate table or just updating the JSONB (less secure but simpler for MVP)

-- Create Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id), -- If null, it's a broadcast notification
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB, -- Optional navigation data
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for Notifications
CREATE POLICY "Users can view their own notifications or broadcasts" ON public.notifications FOR SELECT USING (
    (user_id = auth.uid()) OR (user_id IS NULL)
);
CREATE POLICY "Admins can create notifications" ON public.notifications FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);
-- Users can mark as read (update)
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (
    user_id = auth.uid()
);
