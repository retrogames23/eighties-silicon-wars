
-- save_games
CREATE TABLE IF NOT EXISTS public.save_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  slot_number INTEGER NOT NULL,
  save_name TEXT NOT NULL,
  game_state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, slot_number)
);
ALTER TABLE public.save_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own saves" ON public.save_games FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saves" ON public.save_games FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own saves" ON public.save_games FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own saves" ON public.save_games FOR DELETE USING (auth.uid() = user_id);

-- market_events (catalog)
CREATE TABLE IF NOT EXISTS public.market_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL,
  affected_categories TEXT[] NOT NULL DEFAULT '{}',
  price_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  market_impact NUMERIC NOT NULL DEFAULT 0,
  start_quarter INTEGER NOT NULL DEFAULT 1,
  start_year INTEGER NOT NULL DEFAULT 1983,
  duration_quarters INTEGER NOT NULL DEFAULT 1,
  end_quarter INTEGER NOT NULL DEFAULT 1,
  end_year INTEGER NOT NULL DEFAULT 1983,
  severity TEXT NOT NULL DEFAULT 'low',
  is_global BOOLEAN NOT NULL DEFAULT true,
  trigger_probability NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.market_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read market events" ON public.market_events FOR SELECT TO authenticated USING (true);

-- active_market_events
CREATE TABLE IF NOT EXISTS public.active_market_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  market_event_id UUID NOT NULL REFERENCES public.market_events(id) ON DELETE CASCADE,
  game_quarter INTEGER NOT NULL,
  game_year INTEGER NOT NULL,
  remaining_quarters INTEGER NOT NULL DEFAULT 0,
  current_price_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  is_visible_to_player BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.active_market_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own active events" ON public.active_market_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own active events" ON public.active_market_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own active events" ON public.active_market_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own active events" ON public.active_market_events FOR DELETE USING (auth.uid() = user_id);

-- research_projects
CREATE TABLE IF NOT EXISTS public.research_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  cost_invested NUMERIC NOT NULL DEFAULT 0,
  total_cost_required NUMERIC NOT NULL DEFAULT 0,
  start_quarter INTEGER NOT NULL,
  start_year INTEGER NOT NULL,
  completion_quarter INTEGER,
  completion_year INTEGER,
  exclusive_until_quarter INTEGER,
  exclusive_until_year INTEGER,
  component_specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own projects" ON public.research_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own projects" ON public.research_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON public.research_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own projects" ON public.research_projects FOR DELETE USING (auth.uid() = user_id);

-- exclusive_components
CREATE TABLE IF NOT EXISTS public.exclusive_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  research_project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  component_type TEXT NOT NULL,
  performance NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  available_from_quarter INTEGER NOT NULL,
  available_from_year INTEGER NOT NULL,
  exclusive_until_quarter INTEGER NOT NULL,
  exclusive_until_year INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.exclusive_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own components" ON public.exclusive_components FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own components" ON public.exclusive_components FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own components" ON public.exclusive_components FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own components" ON public.exclusive_components FOR DELETE USING (auth.uid() = user_id);
