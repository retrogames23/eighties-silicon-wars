// VC-Pitch Service: Kommunikation mit Edge Function + DB-Persistenz.

import { supabase } from '@/integrations/supabase/client';
import type { VcRound, VcPitchMessage } from '@/types/financing';

export interface PitchSetup {
  offeredEquityPct: number;
  proposedValuation: number;
  useOfFunds: string;
  vcPersona?: string;
}

export interface CompanySnapshot {
  companyName: string;
  cash: number;
  reputation: number;
  marketShare: number;
  brandAwareness: number;
  outstandingDebt: number;
  equityGivenAwayPct: number;
  year: number;
  quarter: number;
  activeModels: Array<{ name: string; price: number; cpu: string; releaseYear: number }>;
  quarterlyRevenue: number;
  quarterlyProfit: number;
}

export interface EvaluationResult {
  accepted: boolean;
  negotiated_valuation_multiplier: number;
  feedback: string;
  weaknesses: string[];
}

async function invoke<T>(action: 'questions' | 'evaluate', payload: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke('vc-pitch', {
    body: { action, ...payload },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export const VcPitchService = {
  async listRounds(userId: string): Promise<VcRound[]> {
    const { data, error } = await supabase
      .from('vc_rounds')
      .select('*')
      .eq('user_id', userId)
      .order('round_number', { ascending: true });
    if (error) {
      console.error('VcPitchService.listRounds', error);
      return [];
    }
    return (data as VcRound[]) ?? [];
  },

  async getMessages(roundId: string): Promise<VcPitchMessage[]> {
    const { data, error } = await supabase
      .from('vc_pitch_messages')
      .select('*')
      .eq('round_id', roundId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('VcPitchService.getMessages', error);
      return [];
    }
    return (data as VcPitchMessage[]) ?? [];
  },

  async startRound(params: {
    userId: string; setup: PitchSetup; company: CompanySnapshot;
    language: 'de' | 'en';
  }): Promise<{ round: VcRound; questions: string[] }> {
    const existing = await this.listRounds(params.userId);
    const nextRoundNumber = (existing.length ?? 0) + 1;
    if (nextRoundNumber > 3) throw new Error('Maximal 3 VC-Runden erlaubt');

    // 1. LLM: Fragen generieren
    const { questions } = await invoke<{ questions: string[] }>('questions', {
      setup: params.setup,
      company: params.company,
      roundNumber: nextRoundNumber,
      language: params.language,
    });

    // 2. Runde anlegen
    const { data: round, error } = await supabase
      .from('vc_rounds')
      .insert({
        user_id: params.userId,
        round_number: nextRoundNumber,
        offered_equity_pct: params.setup.offeredEquityPct,
        proposed_valuation: params.setup.proposedValuation,
        use_of_funds: params.setup.useOfFunds,
        game_year: params.company.year,
        game_quarter: params.company.quarter,
      })
      .select('*')
      .single();
    if (error || !round) throw error ?? new Error('Konnte VC-Runde nicht anlegen');

    // 3. Fragen als Messages speichern
    const inserts = questions.map((q, i) => ({
      round_id: round.id,
      user_id: params.userId,
      role: 'vc' as const,
      content: q,
      question_index: i,
    }));
    await supabase.from('vc_pitch_messages').insert(inserts);

    return { round: round as VcRound, questions };
  },

  async submitAnswers(params: {
    userId: string; roundId: string;
    qna: Array<{ question: string; answer: string }>;
    setup: PitchSetup; company: CompanySnapshot;
    roundNumber: number; language: 'de' | 'en';
  }): Promise<EvaluationResult> {
    // Antworten speichern
    const inserts = params.qna.map((q, i) => ({
      round_id: params.roundId,
      user_id: params.userId,
      role: 'founder' as const,
      content: q.answer,
      question_index: i,
    }));
    await supabase.from('vc_pitch_messages').insert(inserts);

    // LLM bewerten lassen
    const evalResult = await invoke<EvaluationResult>('evaluate', {
      setup: params.setup,
      company: params.company,
      roundNumber: params.roundNumber,
      qna: params.qna,
      language: params.language,
    });

    const cashReceived = evalResult.accepted
      ? Math.round(params.setup.proposedValuation * evalResult.negotiated_valuation_multiplier * (params.setup.offeredEquityPct / 100))
      : 0;

    await supabase.from('vc_rounds').update({
      accepted: evalResult.accepted,
      negotiated_valuation_multiplier: evalResult.negotiated_valuation_multiplier,
      cash_received: cashReceived,
      feedback: evalResult.feedback,
      status: evalResult.accepted ? 'accepted' : 'rejected',
    }).eq('id', params.roundId);

    return evalResult;
  },

  async getEquityGivenAway(userId: string): Promise<number> {
    const rounds = await this.listRounds(userId);
    return rounds
      .filter(r => r.status === 'accepted')
      .reduce((s, r) => s + Number(r.offered_equity_pct), 0);
  },
};
