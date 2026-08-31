// Floating advisor "Norm Klemmler" — 80s-style Dilbert-ish consultant companion.
// Bottom-right fixed avatar with: contextual tips, intro tour (incl. financing modes),
// and freeform chat backed by the advisor-chat edge function (consultant_80s persona).
// State persists in localStorage.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, MessageCircle, Loader2, Send, Lightbulb, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';
import { supabase } from '@/integrations/supabase/client';
import { StaffService, type StaffAggregate } from '@/services/StaffService';
import advisorImg from '@/assets/advisor-dilbert.png';
import {
  summarize,
  recommendHiring,
  type Budget,
  type BudgetArea,
} from '@/lib/game/BudgetRules';
import type { ReadinessIssue, ReadinessTab, TurnReadinessResult } from '@/lib/game/TurnReadiness';

interface AdvisorCompanionProps {
  budget: Budget;
  cash: number;
  lastQuarterRevenue: number;
  hasActiveModels: boolean;
  companyName?: string;
  quarter: number;
  year: number;
  reputation?: number;
  marketShare?: number;
  activeModelsCount?: number;
  competitorAvgMarketShare?: number;
  /** Ergebnis der Runden-Bereitschaftsprüfung (nur gesetzt, wenn Checkliste offen). */
  readiness?: TurnReadinessResult | null;
  checklistOpen?: boolean;
  onCloseChecklist?: () => void;
  /** Nur verfügbar, wenn keine Blocker vorliegen. */
  onProceedAnyway?: () => void;
  onNavigateTab?: (tab: ReadinessTab) => void;
}

interface Tip {
  id: string;
  text: string;
  priority: number;
}

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

type Mode = 'tour' | 'tips' | 'chat';

const LS_DISMISSED = 'advisor.dismissedTips';
const LS_TOUR_DONE = 'advisor.tourDone';

function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_DISMISSED);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}
function saveDismissed(s: Set<string>) {
  try { localStorage.setItem(LS_DISMISSED, JSON.stringify([...s])); } catch { /* ignore */ }
}

const EMPTY_AGG: StaffAggregate = {
  totalSalary: 0,
  headcount: 0,
  byRole: { engineer: 0, marketer: 0, support: 0, researcher: 0 },
  byRoleSumSkill: { engineer: 0, marketer: 0, support: 0, researcher: 0 },
  engineerBonusPct: 0, marketerBonusPct: 0, supportBonusPct: 0, researcherBonusPct: 0,
  averageMorale: 0,
};

export const AdvisorCompanion = ({
  budget, cash, lastQuarterRevenue, hasActiveModels,
  companyName, quarter, year, reputation, marketShare,
  activeModelsCount, competitorAvgMarketShare,
  readiness = null, checklistOpen = false, onCloseChecklist, onProceedAnyway, onNavigateTab,
}: AdvisorCompanionProps) => {
  const { t, i18n } = useTranslation(['advisor', 'economy']);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(
    localStorage.getItem(LS_TOUR_DONE) === '1' ? 'tips' : 'tour',
  );
  const [agg, setAgg] = useState<StaffAggregate>(EMPTY_AGG);
  const [dismissed, setDismissed] = useState<Set<string>>(() => loadDismissed());
  const [tourStep, setTourStep] = useState<number>(() =>
    localStorage.getItem(LS_TOUR_DONE) === '1' ? -1 : 0,
  );

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const team = await StaffService.list(user.id);
      if (cancelled) return;
      setAgg(StaffService.aggregate(team));
    })();
    return () => { cancelled = true; };
  }, [quarter, year]);

  const showChecklist = Boolean(checklistOpen && readiness && (readiness.blockers.length > 0 || readiness.warnings.length > 0));

  // Rundencheckliste öffnet den Berater automatisch.
  useEffect(() => {
    if (checklistOpen) setOpen(true);
  }, [checklistOpen]);

  // Auto-scroll chat
  useEffect(() => {
    if (mode === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, mode, sending]);

  const summary = useMemo(() =>
    summarize(budget, agg, { cash, lastQuarterRevenue, hasActiveModels }),
  [budget, agg, cash, lastQuarterRevenue, hasActiveModels]);

  const hireSuggestions = useMemo(
    () => recommendHiring(summary, agg, {
      activeModelsCount: activeModelsCount ?? (hasActiveModels ? 1 : 0),
      reputation,
      competitorAvgMarketShare,
      ownMarketShare: marketShare,
    }),
    [summary, agg, activeModelsCount, hasActiveModels, reputation, competitorAvgMarketShare, marketShare],
  );

  const tips: Tip[] = useMemo(() => {
    const out: Tip[] = [];
    const tag = `q${year}-${quarter}`;

    // 1) Gate-missing tips (per area)
    (Object.keys(summary.areas) as BudgetArea[]).forEach(area => {
      const s = summary.areas[area];
      if (!s.hasGate && s.currentBudget > 0) {
        out.push({
          id: `gate-${area}-${tag}`,
          priority: 100,
          text: t('advisor:companion.tips.needRole', {
            amount: formatCurrency(s.currentBudget),
            area: t(`economy:budget.${area}`),
            role: t(`economy:budget.rolesLabel.${s.role}`),
          }),
        });
      }
    });

    // 2) Near-cap tips with concrete unlock estimate
    (Object.keys(summary.areas) as BudgetArea[]).forEach(area => {
      const s = summary.areas[area];
      if (s.hasGate && s.utilizationPct >= 80 && s.hireWouldUnlock >= 10_000) {
        out.push({
          id: `near-${area}-${tag}`,
          priority: 75,
          text: t('advisor:companion.tips.nearCap', {
            area: t(`economy:budget.${area}`),
            util: s.utilizationPct,
            role: t(`economy:budget.rolesLabel.${s.role}`),
            unlock: formatCurrency(s.hireWouldUnlock),
          }),
        });
      }
      if (s.hasGate && s.saturation === 'saturated') {
        out.push({
          id: `sat-${area}-${tag}`,
          priority: 55,
          text: t('advisor:companion.tips.saturated', {
            area: t(`economy:budget.${area}`),
          }),
        });
      }
    });

    // 3) Multi-model understaffed
    const activeModels = activeModelsCount ?? (hasActiveModels ? 1 : 0);
    if (activeModels >= 2 && agg.byRole.engineer <= 1) {
      out.push({
        id: `multi-eng-${tag}`,
        priority: 85,
        text: t('advisor:companion.tips.multiModelUnderstaffed', {
          count: activeModels,
          engineers: agg.byRole.engineer,
        }),
      });
    }

    // 4) Reputation slipping + no support
    if ((reputation ?? 100) < 55 && agg.byRole.support === 0) {
      out.push({
        id: `sup-missing-${tag}`,
        priority: 78,
        text: t('advisor:companion.tips.supportMissing', { rep: reputation ?? 0 }),
      });
    }

    // 5) Competition growing faster
    if (
      competitorAvgMarketShare != null &&
      marketShare != null &&
      marketShare + 1 < competitorAvgMarketShare &&
      agg.headcount < 4
    ) {
      const sug = hireSuggestions.find(h => h.reason === 'growth');
      const role = sug?.role ?? 'engineer';
      out.push({
        id: `comp-grow-${tag}`,
        priority: 65,
        text: t('advisor:companion.tips.competitionGrowing', {
          avg: Math.round(competitorAvgMarketShare),
          own: Math.round(marketShare),
          role: t(`economy:budget.rolesLabel.${role}`),
        }),
      });
    }

    // 6) Marketing under-spent vs. recommendation
    if (lastQuarterRevenue > 0 && summary.areas.marketing.hasGate) {
      const rec = summary.areas.marketing.recommended;
      if (rec > 0 && budget.marketing < rec * 0.5) {
        out.push({
          id: `mkt-low-${tag}`,
          priority: 70,
          text: t('advisor:companion.tips.revenueGrew', {
            revenue: formatCurrency(lastQuarterRevenue),
            amount: formatCurrency(rec),
          }),
        });
      }
    }

    // 7) Morale
    if (agg.headcount > 0 && agg.averageMorale > 0 && agg.averageMorale < 40) {
      out.push({
        id: `morale-${tag}`,
        priority: 80,
        text: t('advisor:companion.tips.lowMorale', { morale: agg.averageMorale }),
      });
    }

    // 8) Cash
    if (cash > 0 && cash < summary.totalOutflow * 1.5 && summary.totalOutflow > 0) {
      out.push({
        id: `cash-${tag}`,
        priority: 90,
        text: t('advisor:companion.tips.cashLow'),
      });
    }

    return out
      .filter(tip => !dismissed.has(tip.id))
      .sort((a, b) => b.priority - a.priority);
  }, [summary, budget, lastQuarterRevenue, cash, agg, year, quarter, t, dismissed,
      hireSuggestions, activeModelsCount, hasActiveModels, reputation, competitorAvgMarketShare, marketShare]);

  // Tour steps — onboarding walks through team, hardware, all budgets,
  // competition, the quarter loop, and finally the three financing modes.
  const tourSteps = useMemo(() => {
    const rec = summary.areas;
    return [
      t('advisor:companion.tour.welcome'),
      t('advisor:companion.tour.personnel'),
      t('advisor:companion.tour.hardwareDev'),
      t('advisor:companion.tour.marketing', {
        amount: formatCurrency(rec.marketing.recommended || 10_000),
      }),
      t('advisor:companion.tour.development', {
        amount: formatCurrency(rec.development.recommended || 20_000),
      }),
      t('advisor:companion.tour.research', {
        amount: formatCurrency(rec.research.recommended || 5_000),
      }),
      t('advisor:companion.tour.supportBudget'),
      t('advisor:companion.tour.moreRoles'),
      t('advisor:companion.tour.competition'),
      t('advisor:companion.tour.quarterAdvance'),
      t('advisor:companion.tour.financingIntro'),
      t('advisor:companion.tour.financingBootstrap'),
      t('advisor:companion.tour.financingLoan'),
      t('advisor:companion.tour.financingVc'),
      t('advisor:companion.tour.wrapUp'),
    ];
  }, [t, summary]);

  const inTour = mode === 'tour' && tourStep >= 0 && tourStep < tourSteps.length;

  // Auto-advance tour when the player has actually completed the step's action.
  // Step index: 0 welcome, 1 personnel, 2 hardwareDev (manual),
  // 3 marketing, 4 development, 5 research, 6 supportBudget,
  // 7 moreRoles (auto when 2+ hires), 8 competition (manual),
  // 9 quarterAdvance (auto when a quarter passes), 10+ financing & wrap-up (manual).
  useEffect(() => {
    if (mode !== 'tour' || tourStep < 0 || tourStep >= tourSteps.length) return;
    const done =
      (tourStep === 1 && agg.headcount >= 1) ||
      (tourStep === 3 && budget.marketing > 0) ||
      (tourStep === 4 && budget.development > 0) ||
      (tourStep === 5 && budget.research > 0) ||
      (tourStep === 6 && budget.support > 0) ||
      (tourStep === 7 && agg.headcount >= 2);
    if (done) {
      setTourStep(s => s + 1);
    }
  }, [mode, tourStep, tourSteps.length, agg.headcount, budget.marketing, budget.development, budget.research, budget.support]);

  const activeTip = mode === 'tips' && tips.length > 0 ? tips[0] : null;
  const hasBubble = inTour || activeTip || mode === 'chat';

  const dismissTip = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    saveDismissed(next);
  };

  const advanceTour = () => {
    if (tourStep + 1 >= tourSteps.length) {
      localStorage.setItem(LS_TOUR_DONE, '1');
      setTourStep(-1);
      setMode('tips');
    } else {
      setTourStep(tourStep + 1);
    }
  };

  const sendChat = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast({
        title: 'Login erforderlich',
        description: 'Bitte melde dich an, um den Berater zu fragen.',
        variant: 'destructive',
      });
      return;
    }

    const userMsg: ChatMsg = { role: 'user', content: text };
    const next = [...chatMessages, userMsg];
    setChatMessages(next);
    setDraft('');
    setSending(true);

    const language = (i18n.language || 'de').toLowerCase().startsWith('en') ? 'en' : 'de';
    const gameContext = {
      year, quarter,
      company: { name: companyName ?? 'Player Co', cash, reputation, marketShare },
      budget: { marketing: budget.marketing, development: budget.development, research: budget.research },
      team: { headcount: agg.headcount, averageMorale: agg.averageMorale, byRole: agg.byRole },
      lastQuarterRevenue,
    };

    try {
      const { data, error } = await supabase.functions.invoke('advisor-chat', {
        body: { advisor: 'consultant_80s', messages: next, gameContext, language },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      const reply = (data as { reply?: string })?.reply ?? '…';
      setChatMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: 'Berater nicht erreichbar', description: msg, variant: 'destructive' });
      setChatMessages(chatMessages);
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2 pointer-events-none md:bottom-4">
      {open && (
        <Card className="pointer-events-auto retro-border bg-card/95 backdrop-blur-sm p-4 w-[min(92vw,22rem)] shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <img
                src={advisorImg}
                alt="Norm Klemmler"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
                loading="lazy"
              />
              <div className="leading-tight">
                <div className="text-xs font-bold text-primary uppercase tracking-wide">
                  {t('advisor:companion.name')}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {t('advisor:companion.subtitle')}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-primary"
              aria-label="close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Rundencheckliste */}
          {showChecklist && readiness && (
            <div className="space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                {readiness.blockers.length > 0
                  ? t('advisor:companion.readiness.introBlocked')
                  : t('advisor:companion.readiness.introWarning')}
              </p>
              <ul className="space-y-2">
                {[...readiness.blockers, ...readiness.warnings].map((issue: ReadinessIssue) => (
                  <li
                    key={issue.id}
                    className="flex items-start gap-2 text-xs border rounded-md p-2 bg-muted/30"
                  >
                    <span
                      className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${issue.severity === 'blocker' ? 'bg-destructive' : 'bg-amber'}`}
                      aria-hidden
                    />
                    <span className="flex-1 leading-snug">
                      {t(`advisor:${issue.i18nKey}`, issue.params ?? {})}
                    </span>
                    {onNavigateTab && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px]"
                        onClick={() => {
                          onNavigateTab(issue.tab);
                          onCloseChecklist?.();
                        }}
                      >
                        {t(`advisor:companion.readiness.tabs.${issue.tab}`)}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => onCloseChecklist?.()}>
                  {t('advisor:companion.readiness.fixNow')}
                </Button>
                {readiness.blockers.length === 0 && onProceedAnyway && (
                  <Button size="sm" onClick={onProceedAnyway}>
                    {t('advisor:companion.readiness.proceedAnyway')}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Mode switcher — always visible so the chat is reachable, even mid-tour */}
          {!showChecklist && (
          <div className="flex gap-1 mb-3 text-xs">
            <button
              onClick={() => setMode('tips')}
              className={`px-2 py-1 rounded ${mode !== 'chat' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Lightbulb className="w-3 h-3 inline mr-1" />
              {t('advisor:companion.tabs.tips')}
            </button>
            <button
              onClick={() => setMode('chat')}
              className={`px-2 py-1 rounded ${mode === 'chat' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <MessageCircle className="w-3 h-3 inline mr-1" />
              {t('advisor:companion.tabs.chat')}
            </button>
          </div>
          )}

          {/* Tour or Tip view */}
          {!showChecklist && (inTour || mode === 'tips') && (
            <>
              <p className="text-sm text-foreground leading-relaxed min-h-[3.5rem]">
                {inTour
                  ? tourSteps[tourStep]
                  : activeTip
                    ? activeTip.text
                    : (
                      <span className="italic text-muted-foreground">
                        {t('advisor:companion.noTips')}
                      </span>
                    )}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-end">
                {inTour ? (
                  <Button size="sm" onClick={advanceTour}>
                    {tourStep + 1 >= tourSteps.length
                      ? t('advisor:companion.dismiss')
                      : <ArrowRight className="w-4 h-4" />}
                  </Button>
                ) : activeTip ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissTip(activeTip.id)}
                    >
                      {t('advisor:companion.doNotShow')}
                    </Button>
                    <Button size="sm" onClick={() => setOpen(false)}>
                      {t('advisor:companion.dismiss')}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setMode('tour'); setTourStep(0); }}
                  >
                    {t('advisor:companion.replayTour')}
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Chat view */}
          {!showChecklist && mode === 'chat' && !inTour && (
            <>
              <ScrollArea className="h-56 border rounded-md p-2 bg-muted/30 mb-2">
                <div ref={chatScrollRef} className="space-y-2 text-xs">
                  {chatMessages.length === 0 && (
                    <p className="text-muted-foreground italic">
                      {t('advisor:companion.chat.intro')}
                    </p>
                  )}
                  {chatMessages.map((m, i) => (
                    <div
                      key={i}
                      className={
                        m.role === 'user'
                          ? 'ml-6 bg-primary/10 rounded-md p-2 whitespace-pre-wrap'
                          : 'mr-6 bg-background border rounded-md p-2 whitespace-pre-wrap'
                      }
                    >
                      {m.content}
                    </div>
                  ))}
                  {sending && (
                    <div className="mr-6 text-muted-foreground flex items-center gap-2 text-xs italic">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {t('advisor:companion.chat.thinking')}
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-1">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t('advisor:companion.chat.placeholder')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChat();
                    }
                  }}
                  disabled={sending}
                  className="h-8 text-xs"
                />
                <Button
                  size="sm"
                  onClick={sendChat}
                  disabled={sending || !draft.trim()}
                  className="h-8 px-2"
                  aria-label={t('advisor:companion.chat.send')}
                >
                  {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Floating avatar button — replaces Sparkles with Dilbert-style cartoon */}
      <button
        onClick={() => setOpen(o => !o)}
        className="pointer-events-auto relative w-16 h-16 rounded-full bg-card border-2 border-primary/50 shadow-lg flex items-center justify-center hover:scale-105 transition-transform overflow-hidden"
        aria-label="advisor"
      >
        <img
          src={advisorImg}
          alt="Norm Klemmler"
          width={64}
          height={64}
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />
        {hasBubble && !open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber border-2 border-background animate-pulse" />
        )}
      </button>
    </div>
  );
};

export default AdvisorCompanion;
