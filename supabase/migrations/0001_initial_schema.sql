-- 1. Create tables

CREATE TABLE public.profiles_public (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  display_name text,
  city text,
  sport text,
  level text,
  preferred_time text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.buddy_pairs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a uuid REFERENCES auth.users(id) NOT NULL,
  user_b uuid REFERENCES auth.users(id) NOT NULL,
  slot_days text,
  slot_time text,
  spot_id uuid, -- Reference to spots table
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.checkins_public (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  day_key text NOT NULL,
  blocks_done integer DEFAULT 0,
  minutes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, day_key)
);

CREATE TABLE public.spots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  public_area text,
  city text,
  sport_tags text[],
  tip text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid REFERENCES auth.users(id) NOT NULL,
  target_id uuid, -- could be user or spot
  reason text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) on ALL tables
ALTER TABLE public.profiles_public ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buddy_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins_public ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 3. Define RLS Policies

-- profiles_public
-- Read: Own profile, or profile of a buddy.
CREATE POLICY "Users can read their own profile" 
ON public.profiles_public FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can read their buddy's profile" 
ON public.profiles_public FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.buddy_pairs 
    WHERE active = true 
    AND (
      (user_a = auth.uid() AND user_b = profiles_public.id) OR 
      (user_b = auth.uid() AND user_a = profiles_public.id)
    )
  )
);

-- Write/Update: Only own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles_public FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles_public FOR UPDATE 
USING (auth.uid() = id);


-- buddy_pairs
-- Read: Only pairs where user is a participant
CREATE POLICY "Users can read their own buddy pairs" 
ON public.buddy_pairs FOR SELECT 
USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Write: Users can insert pairs if they are one of the users
CREATE POLICY "Users can insert buddy pairs" 
ON public.buddy_pairs FOR INSERT 
WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can update their buddy pairs" 
ON public.buddy_pairs FOR UPDATE 
USING (auth.uid() = user_a OR auth.uid() = user_b);


-- checkins_public
-- Read: Own checkins, or buddy's checkins
CREATE POLICY "Users can read own checkins" 
ON public.checkins_public FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can read buddy's checkins" 
ON public.checkins_public FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.buddy_pairs 
    WHERE active = true 
    AND (
      (user_a = auth.uid() AND user_b = checkins_public.user_id) OR 
      (user_b = auth.uid() AND user_a = checkins_public.user_id)
    )
  )
);

-- Write: Only own checkins
CREATE POLICY "Users can insert own checkins" 
ON public.checkins_public FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins" 
ON public.checkins_public FOR UPDATE 
USING (auth.uid() = user_id);


-- spots
-- Read: Anyone can read spots (public directory)
CREATE POLICY "Anyone can read spots" 
ON public.spots FOR SELECT 
USING (true);

-- Write: Users can insert their own spots
CREATE POLICY "Users can insert spots" 
ON public.spots FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own spots" 
ON public.spots FOR UPDATE 
USING (auth.uid() = created_by);


-- reports
-- Read: Users cannot read reports (only admins can read them from a dashboard via service_role)
-- Write: Users can only insert reports
CREATE POLICY "Users can insert reports" 
ON public.reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);
