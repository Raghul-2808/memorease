-- Initial Supabase Schema Setup for Neural Repository

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  rank TEXT DEFAULT 'Neophyte',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  "totalCards" INTEGER DEFAULT 0,
  "globalRank" INTEGER DEFAULT 0,
  "lastActive" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Subjects (Directories) Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid UUID NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "imageUrl" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Topics (Chapters) Table
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid UUID NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  "subjectId" UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  description TEXT,
  "imageUrl" TEXT,
  "lastReviewed" TEXT DEFAULT 'Never',
  "nextReview" TEXT DEFAULT 'Today',
  chapters INTEGER DEFAULT 1,
  "masteryLevel" INTEGER DEFAULT 1,
  assets JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid UUID NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT false,
  icon TEXT,
  "actionUrl" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);


-- SET UP ROW LEVEL SECURITY (RLS)

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = uid);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = uid);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = uid);

-- Subjects
CREATE POLICY "Users can manage their own subjects" ON public.subjects FOR ALL USING (auth.uid() = uid);

-- Topics
CREATE POLICY "Users can manage their own topics" ON public.topics FOR ALL USING (auth.uid() = uid);

-- Notifications
CREATE POLICY "Users can manage their own notifications" ON public.notifications FOR ALL USING (auth.uid() = uid);

-- Storage bucket for app-files
INSERT INTO storage.buckets (id, name, public) VALUES ('app-files', 'app-files', false) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'app-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own files" ON storage.objects FOR UPDATE USING (bucket_id = 'app-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE USING (bucket_id = 'app-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can read their own files" ON storage.objects FOR SELECT USING (bucket_id = 'app-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for avatar uploads if they are directly in the user id path: `uid/avatar/...` 
-- The above covers everything inside `<uid>/...`
