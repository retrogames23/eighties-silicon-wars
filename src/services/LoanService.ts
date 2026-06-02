// Loan-Service: DB-Operationen + Annuitäten-Logik.
// Reine Datenzugriffsschicht — Geschäftslogik (Bonität, Defaults) sitzt im Caller
// (GameMechanics/FinancingPanel), damit alles deterministisch testbar bleibt.

import { supabase } from '@/integrations/supabase/client';
import {
  type Loan, type LoanPayment, calcQuarterlyAnnuity,
} from '@/types/financing';

export const LoanService = {
  async listActive(userId: string): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('LoanService.listActive', error);
      return [];
    }
    return (data as Loan[]) ?? [];
  },

  async getOutstandingDebt(userId: string): Promise<number> {
    const loans = await this.listActive(userId);
    return loans.reduce((s, l) => s + Number(l.outstanding_balance), 0);
  },

  async create(params: {
    userId: string; principal: number; annualRate: number; quartersTotal: number;
    year: number; quarter: number;
  }): Promise<Loan | null> {
    const quarterly = calcQuarterlyAnnuity(params.principal, params.annualRate, params.quartersTotal);
    const { data, error } = await supabase
      .from('loans')
      .insert({
        user_id: params.userId,
        principal: params.principal,
        annual_interest_rate: params.annualRate,
        quarters_total: params.quartersTotal,
        quarterly_payment: Math.round(quarterly),
        outstanding_balance: params.principal,
        taken_year: params.year,
        taken_quarter: params.quarter,
      })
      .select('*')
      .single();
    if (error) {
      console.error('LoanService.create', error);
      return null;
    }
    return data as Loan;
  },

  /**
   * Quartalsweise Verbuchung aller aktiven Kredite. Zieht Annuität, schreibt Payment-Log,
   * markiert Defaults. Liefert Summe der gezahlten Beträge + Reputations-Schaden.
   * Wird in GameMechanics.processQuarterTurn aufgerufen.
   */
  async processQuarterPayments(params: {
    userId: string; availableCash: number; year: number; quarter: number;
  }): Promise<{ totalPaid: number; defaults: number; cancellations: number; reputationDelta: number; logs: string[] }> {
    const loans = await this.listActive(params.userId);
    let cash = params.availableCash;
    let totalPaid = 0;
    let defaults = 0;
    let cancellations = 0;
    let reputationDelta = 0;
    const logs: string[] = [];

    for (const loan of loans) {
      const due = Number(loan.quarterly_payment);
      const balance = Number(loan.outstanding_balance);
      const quarterlyInterestRate = Number(loan.annual_interest_rate) / 4;
      const interestPortion = balance * quarterlyInterestRate;
      const principalPortion = Math.max(0, due - interestPortion);

      if (cash >= due) {
        // Reguläre Zahlung
        cash -= due;
        totalPaid += due;
        const newBalance = Math.max(0, balance - principalPortion);
        const newPaid = loan.quarters_paid + 1;
        const paidOff = newBalance <= 1 || newPaid >= loan.quarters_total;
        await supabase.from('loans').update({
          outstanding_balance: paidOff ? 0 : newBalance,
          quarters_paid: newPaid,
          consecutive_defaults: 0,
          status: paidOff ? 'paid_off' : 'active',
        }).eq('id', loan.id);
        await supabase.from('loan_payments').insert({
          loan_id: loan.id, user_id: params.userId,
          game_year: params.year, game_quarter: params.quarter,
          amount_paid: Math.round(due),
          interest_portion: Math.round(interestPortion),
          principal_portion: Math.round(principalPortion),
          is_default: false,
        });
        if (paidOff) logs.push(`Kredit abbezahlt: $${Math.round(loan.principal).toLocaleString()}`);
      } else {
        // Default
        defaults++;
        reputationDelta -= 15;
        const penaltyInterest = balance * 0.05;
        const newBalance = balance + penaltyInterest;
        const newConsec = loan.consecutive_defaults + 1;
        const cancelled = newConsec >= 3;
        if (cancelled) {
          cancellations++;
          reputationDelta -= 30;
          logs.push(`Kredit gekündigt nach 3 Ausfällen: $${Math.round(newBalance).toLocaleString()} fällig`);
        } else {
          logs.push(`Kreditrate verpasst (${newConsec}/3 vor Kündigung), 5% Strafzins`);
        }
        await supabase.from('loans').update({
          outstanding_balance: newBalance,
          consecutive_defaults: newConsec,
          status: cancelled ? 'defaulted' : 'active',
        }).eq('id', loan.id);
        await supabase.from('loan_payments').insert({
          loan_id: loan.id, user_id: params.userId,
          game_year: params.year, game_quarter: params.quarter,
          amount_paid: 0,
          interest_portion: Math.round(interestPortion + penaltyInterest),
          principal_portion: 0,
          is_default: true,
        });
      }
    }
    return { totalPaid, defaults, cancellations, reputationDelta, logs };
  },

  async listPayments(userId: string, limit = 50): Promise<LoanPayment[]> {
    const { data, error } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('LoanService.listPayments', error);
      return [];
    }
    return (data as LoanPayment[]) ?? [];
  },
};
