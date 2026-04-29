-- migration_v2.sql

-- Create the activity_history table to persist review sessions, heatmap data, and retention modeling
CREATE TABLE IF NOT EXISTS public.activity_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uid UUID NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    stability_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    
    -- Optional metadata or notes for this specific review session
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.activity_history ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for user access
-- 1. Users can view their own activity history
CREATE POLICY "Users can view their own activity history" 
    ON public.activity_history 
    FOR SELECT 
    USING (auth.uid() = uid);

-- 2. Users can insert their own activity history
CREATE POLICY "Users can insert their own activity history" 
    ON public.activity_history 
    FOR INSERT 
    WITH CHECK (auth.uid() = uid);

-- 3. Users can update their own activity history (e.g. extending duration)
CREATE POLICY "Users can update their own activity history" 
    ON public.activity_history 
    FOR UPDATE 
    USING (auth.uid() = uid);

-- 4. Users can delete their own activity history
CREATE POLICY "Users can delete their own activity history" 
    ON public.activity_history 
    FOR DELETE 
    USING (auth.uid() = uid);

-- Create indexes for performance optimization
-- Useful for generating heatmaps by querying user activity over time ranges
CREATE INDEX IF NOT EXISTS idx_activity_history_uid_date ON public.activity_history(uid, session_start);

-- Useful for looking up the history of a specific topic for spaced repetition calculations
CREATE INDEX IF NOT EXISTS idx_activity_history_topic_id ON public.activity_history(topic_id);
