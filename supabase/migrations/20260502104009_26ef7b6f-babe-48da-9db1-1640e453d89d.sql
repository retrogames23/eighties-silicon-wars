
-- Tighten RLS: restrict user-owned tables to the authenticated role explicitly.

-- save_games
DROP POLICY IF EXISTS "Users can view their own saves" ON public.save_games;
DROP POLICY IF EXISTS "Users can insert their own saves" ON public.save_games;
DROP POLICY IF EXISTS "Users can update their own saves" ON public.save_games;
DROP POLICY IF EXISTS "Users can delete their own saves" ON public.save_games;
DROP POLICY IF EXISTS "Users view own saves" ON public.save_games;
DROP POLICY IF EXISTS "Users insert own saves" ON public.save_games;
DROP POLICY IF EXISTS "Users update own saves" ON public.save_games;
DROP POLICY IF EXISTS "Users delete own saves" ON public.save_games;

CREATE POLICY "Users view own saves" ON public.save_games
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saves" ON public.save_games
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own saves" ON public.save_games
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own saves" ON public.save_games
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- research_projects
DROP POLICY IF EXISTS "Users view own projects" ON public.research_projects;
DROP POLICY IF EXISTS "Users insert own projects" ON public.research_projects;
DROP POLICY IF EXISTS "Users update own projects" ON public.research_projects;
DROP POLICY IF EXISTS "Users delete own projects" ON public.research_projects;

CREATE POLICY "Users view own projects" ON public.research_projects
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own projects" ON public.research_projects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON public.research_projects
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own projects" ON public.research_projects
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- exclusive_components
DROP POLICY IF EXISTS "Users view own components" ON public.exclusive_components;
DROP POLICY IF EXISTS "Users insert own components" ON public.exclusive_components;
DROP POLICY IF EXISTS "Users update own components" ON public.exclusive_components;
DROP POLICY IF EXISTS "Users delete own components" ON public.exclusive_components;

CREATE POLICY "Users view own components" ON public.exclusive_components
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own components" ON public.exclusive_components
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own components" ON public.exclusive_components
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own components" ON public.exclusive_components
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- active_market_events
DROP POLICY IF EXISTS "Users view own active events" ON public.active_market_events;
DROP POLICY IF EXISTS "Users insert own active events" ON public.active_market_events;
DROP POLICY IF EXISTS "Users update own active events" ON public.active_market_events;
DROP POLICY IF EXISTS "Users delete own active events" ON public.active_market_events;

CREATE POLICY "Users view own active events" ON public.active_market_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own active events" ON public.active_market_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own active events" ON public.active_market_events
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own active events" ON public.active_market_events
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- market_events: read-only for authenticated; no write policies (default-deny).
-- Explicitly ensure SELECT scoped to authenticated role only.
DROP POLICY IF EXISTS "Authenticated read market events" ON public.market_events;
CREATE POLICY "Authenticated read market events" ON public.market_events
  FOR SELECT TO authenticated USING (true);
