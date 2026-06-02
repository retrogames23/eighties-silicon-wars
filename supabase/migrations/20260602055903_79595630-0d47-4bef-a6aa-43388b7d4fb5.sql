CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('engineer','marketer','support','researcher')),
  specialty text NOT NULL DEFAULT '',
  skill integer NOT NULL DEFAULT 50 CHECK (skill BETWEEN 1 AND 100),
  salary_per_quarter numeric NOT NULL DEFAULT 0,
  morale integer NOT NULL DEFAULT 70 CHECK (morale BETWEEN 0 AND 100),
  hired_year integer NOT NULL,
  hired_quarter integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own staff" ON public.staff FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own staff" ON public.staff FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own staff" ON public.staff FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own staff" ON public.staff FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX staff_user_id_idx ON public.staff(user_id);