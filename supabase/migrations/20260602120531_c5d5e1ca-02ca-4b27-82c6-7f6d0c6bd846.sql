-- Loans (Bankkredite)
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  principal NUMERIC NOT NULL,
  annual_interest_rate NUMERIC NOT NULL,
  quarters_total INTEGER NOT NULL,
  quarters_paid INTEGER NOT NULL DEFAULT 0,
  quarterly_payment NUMERIC NOT NULL,
  outstanding_balance NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  consecutive_defaults INTEGER NOT NULL DEFAULT 0,
  taken_year INTEGER NOT NULL,
  taken_quarter INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.loans TO authenticated;
GRANT ALL ON public.loans TO service_role;

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own loans" ON public.loans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own loans" ON public.loans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own loans" ON public.loans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own loans" ON public.loans FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_loans_user_status ON public.loans(user_id, status);

-- Loan-Zahlungs-Log
CREATE TABLE public.loan_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  game_year INTEGER NOT NULL,
  game_quarter INTEGER NOT NULL,
  amount_paid NUMERIC NOT NULL,
  interest_portion NUMERIC NOT NULL,
  principal_portion NUMERIC NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.loan_payments TO authenticated;
GRANT ALL ON public.loan_payments TO service_role;

ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own loan payments" ON public.loan_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own loan payments" ON public.loan_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_loan_payments_loan ON public.loan_payments(loan_id);

-- VC-Runden
CREATE TABLE public.vc_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  round_number INTEGER NOT NULL,
  offered_equity_pct NUMERIC NOT NULL,
  proposed_valuation NUMERIC NOT NULL,
  use_of_funds TEXT NOT NULL DEFAULT '',
  vc_persona TEXT NOT NULL DEFAULT 'skeptisch',
  accepted BOOLEAN,
  negotiated_valuation_multiplier NUMERIC,
  cash_received NUMERIC,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress',
  game_year INTEGER NOT NULL,
  game_quarter INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vc_rounds TO authenticated;
GRANT ALL ON public.vc_rounds TO service_role;

ALTER TABLE public.vc_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own vc rounds" ON public.vc_rounds FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own vc rounds" ON public.vc_rounds FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own vc rounds" ON public.vc_rounds FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own vc rounds" ON public.vc_rounds FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_vc_rounds_user ON public.vc_rounds(user_id, round_number);

-- Pitch-Transkripte (Q&A)
CREATE TABLE public.vc_pitch_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES public.vc_rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  question_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.vc_pitch_messages TO authenticated;
GRANT ALL ON public.vc_pitch_messages TO service_role;

ALTER TABLE public.vc_pitch_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pitch messages" ON public.vc_pitch_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own pitch messages" ON public.vc_pitch_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_vc_pitch_messages_round ON public.vc_pitch_messages(round_id);

-- updated_at-Trigger nur wenn Funktion bereits existiert; sonst inline anlegen.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER loans_updated_at BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER vc_rounds_updated_at BEFORE UPDATE ON public.vc_rounds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
