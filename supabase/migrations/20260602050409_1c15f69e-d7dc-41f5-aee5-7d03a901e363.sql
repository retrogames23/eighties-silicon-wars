
CREATE TABLE public.ai_competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  persona_key text NOT NULL,
  name text NOT NULL,
  archetype text NOT NULL,
  description text NOT NULL DEFAULT '',
  market_share numeric NOT NULL DEFAULT 5,
  reputation numeric NOT NULL DEFAULT 50,
  cash_estimate numeric NOT NULL DEFAULT 1000000,
  relationship_score integer NOT NULL DEFAULT 0,
  last_action jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_action_year integer,
  last_action_quarter integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, persona_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_competitors TO authenticated;
GRANT ALL ON public.ai_competitors TO service_role;

ALTER TABLE public.ai_competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own competitors" ON public.ai_competitors
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own competitors" ON public.ai_competitors
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own competitors" ON public.ai_competitors
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own competitors" ON public.ai_competitors
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_ai_competitors_user ON public.ai_competitors(user_id);
