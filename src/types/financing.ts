// Finanzierungs-Domain-Types

export type LoanStatus = 'active' | 'paid_off' | 'defaulted' | 'cancelled';
export type VcRoundStatus = 'in_progress' | 'accepted' | 'rejected';

export interface Loan {
  id: string;
  user_id: string;
  principal: number;
  annual_interest_rate: number;
  quarters_total: number;
  quarters_paid: number;
  quarterly_payment: number;
  outstanding_balance: number;
  status: LoanStatus;
  consecutive_defaults: number;
  taken_year: number;
  taken_quarter: number;
  created_at: string;
  updated_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  user_id: string;
  game_year: number;
  game_quarter: number;
  amount_paid: number;
  interest_portion: number;
  principal_portion: number;
  is_default: boolean;
  created_at: string;
}

export interface VcRound {
  id: string;
  user_id: string;
  round_number: number;
  offered_equity_pct: number;
  proposed_valuation: number;
  use_of_funds: string;
  vc_persona: string;
  accepted: boolean | null;
  negotiated_valuation_multiplier: number | null;
  cash_received: number | null;
  feedback: string | null;
  status: VcRoundStatus;
  game_year: number;
  game_quarter: number;
  created_at: string;
  updated_at: string;
}

export interface VcPitchMessage {
  id: string;
  round_id: string;
  user_id: string;
  role: 'vc' | 'founder';
  content: string;
  question_index: number | null;
  created_at: string;
}

export interface LoanOffer {
  maxPrincipal: number;
  annualRate: number;
  quartersOptions: number[];
  eligible: boolean;
  reason?: string;
  avgQuarterlyRevenue: number;
}

/** Annuität (gleichmäßige Quartalsrate). */
export function calcQuarterlyAnnuity(principal: number, annualRate: number, quartersTotal: number): number {
  const q = annualRate / 4; // quartalszins
  if (q === 0) return principal / quartersTotal;
  return (principal * q) / (1 - Math.pow(1 + q, -quartersTotal));
}

/** Leitzins für gegebenes Jahr (historisch grob, 80er USA). */
export function baseInterestRateForYear(year: number): number {
  if (year <= 1983) return 0.11;
  if (year <= 1986) return 0.09;
  if (year <= 1988) return 0.07;
  return 0.08;
}

/** Reputations-Aufschlag aufs Zinssatz-Basisniveau. */
export function reputationSpread(reputation: number): number {
  if (reputation >= 70) return 0.01;
  if (reputation < 50) return 0.03;
  return 0.02;
}

/** Berechnet Loan-Offer aus Firma + Historie. */
export function calculateLoanOffer(
  reputation: number,
  year: number,
  recentQuarterlyRevenues: number[], // letzte bis zu 4 Quartale
  outstandingDebt: number,
): LoanOffer {
  const positiveQuarters = recentQuarterlyRevenues.filter(r => r > 0).length;
  const avg = recentQuarterlyRevenues.length > 0
    ? recentQuarterlyRevenues.reduce((a, b) => a + b, 0) / recentQuarterlyRevenues.length
    : 0;
  const annualRate = baseInterestRateForYear(year) + reputationSpread(reputation);
  const maxPrincipalRaw = Math.max(0, 4 * avg - outstandingDebt * 2);

  const reasons: string[] = [];
  if (positiveQuarters < 2) reasons.push('Mindestens 2 Quartale mit Umsatz nötig');
  if (reputation < 30) reasons.push('Reputation zu niedrig (Mindestens 30)');
  if (outstandingDebt > avg * 0.5 && avg > 0) reasons.push('Bestehende Schulden zu hoch');
  if (avg <= 0) reasons.push('Kein Umsatz nachgewiesen');

  return {
    maxPrincipal: reasons.length === 0 ? Math.round(maxPrincipalRaw) : 0,
    annualRate,
    quartersOptions: [8, 12, 16],
    eligible: reasons.length === 0 && maxPrincipalRaw > 50_000,
    reason: reasons.join(' · ') || undefined,
    avgQuarterlyRevenue: Math.round(avg),
  };
}
