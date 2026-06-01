
CREATE TABLE public.ai_world_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game_quarter int NOT NULL,
  game_year int NOT NULL,
  category text NOT NULL,
  headline text NOT NULL,
  body text NOT NULL,
  affected_segments text[] NOT NULL DEFAULT '{}',
  magnitude int NOT NULL CHECK (magnitude BETWEEN 1 AND 5),
  duration_quarters int NOT NULL DEFAULT 1,
  remaining_quarters int NOT NULL DEFAULT 0,
  applied_effects jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_world_events TO authenticated;
GRANT ALL ON public.ai_world_events TO service_role;

ALTER TABLE public.ai_world_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own ai events" ON public.ai_world_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ai events" ON public.ai_world_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ai events" ON public.ai_world_events
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own ai events" ON public.ai_world_events
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX ai_world_events_user_quarter_idx
  ON public.ai_world_events (user_id, game_year, game_quarter);

CREATE TABLE public.ai_press_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game_quarter int NOT NULL,
  game_year int NOT NULL,
  kind text NOT NULL,
  category text NOT NULL DEFAULT 'world',
  headline text NOT NULL,
  body text NOT NULL,
  source_event_id uuid REFERENCES public.ai_world_events(id) ON DELETE SET NULL,
  era text,
  tone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_press_articles TO authenticated;
GRANT ALL ON public.ai_press_articles TO service_role;

ALTER TABLE public.ai_press_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own ai press" ON public.ai_press_articles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ai press" ON public.ai_press_articles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ai press" ON public.ai_press_articles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own ai press" ON public.ai_press_articles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX ai_press_articles_user_quarter_idx
  ON public.ai_press_articles (user_id, game_year, game_quarter);
