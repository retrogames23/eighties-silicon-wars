// Floating advisor "Karl Klammer"-style companion.
// Bottom-right fixed avatar with contextual tips for the new budget system.
// State persists in localStorage so it doesn't nag.

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, MessageCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { supabase } from '@/integrations/supabase/client';
import { StaffService, type StaffAggregate } from '@/services/StaffService';
import {
  summarize,
  type Budget,
  type BudgetArea,
  AREA_TO_ROLE,
} from '@/lib/game/BudgetRules';

interface AdvisorCompanionProps {
  budget: Budget;
  cash: number;
  lastQuarterRevenue: number;
  hasActiveModels: boolean;
  companyName?: string;
  quarter: number;
  year: number;
  onOpenChat?: () => void;
}

interface Tip {
  id: string;        // for dedupe + dismissal
  text: string;
  priority: number;  // higher = more important
}

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
  try { localStorage.setItem(LS_DISMISSED, JSON.stringify([...s])); } catch {}
}

const EMPTY_AGG: StaffAggregate = {
  totalSalary: 0,
  headcount: 0,
  byRole: { engineer: 0, marketer: 0, support: 0, researcher: 0 },
  engineerBonusPct: 0, marketerBonusPct: 0, supportBonusPct: 0, researcherBonusPct: 0,
  averageMorale: 0,
};

export const AdvisorCompanion = ({
  budget, cash, lastQuarterRevenue, hasActiveModels,
  companyName, quarter, year, onOpenChat,
}: AdvisorCompanionProps) => {
  const { t } = useTranslation(['advisor', 'economy']);
  const [open, setOpen] = useState(false);
  const [agg, setAgg] = useState<StaffAggregate>(EMPTY_AGG);
  const [dismissed, setDismissed] = useState<Set<string>>(() => loadDismissed());
  const [tourStep, setTourStep] = useState<number>(() =>
    localStorage.getItem(LS_TOUR_DONE) === '1' ? -1 : 0,
  );

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

  const summary = useMemo(() =>
    summarize(budget, agg, { cash, lastQuarterRevenue, hasActiveModels }),
  [budget, agg, cash, lastQuarterRevenue, hasActiveModels]);

  // Build contextual tips
  const tips: Tip[] = useMemo(() => {
    const out: Tip[] = [];
    // 1. Gate violations — money spent without team
    (Object.keys(summary.areas) as BudgetArea[]).forEach(area => {
      const s = summary.areas[area];
      if (!s.hasGate && s.currentBudget > 0) {
        out.push({
          id: `gate-${area}-q${year}-${quarter}`,
          priority: 100,
          text: t('advisor:companion.tips.needRole', {
            amount: formatCurrency(s.currentBudget),
            area: t(`economy:budget.${area}`),
            role: t(`economy:budget.rolesLabel.${s.role}`),
          }),
        });
      }
      if (s.hasGate && s.saturation === 'saturated') {
        out.push({
          id: `sat-${area}-q${year}-${quarter}`,
          priority: 50,
          text: t('advisor:companion.tips.saturated', {
            area: t(`economy:budget.${area}`),
          }),
        });
      }
    });
    // 2. Revenue-based marketing nudge
    if (lastQuarterRevenue > 0 && summary.areas.marketing.hasGate) {
      const rec = summary.areas.marketing.recommended;
      if (rec > 0 && budget.marketing < rec * 0.5) {
        out.push({
          id: `mkt-low-q${year}-${quarter}`,
          priority: 70,
          text: t('advisor:companion.tips.revenueGrew', {
            revenue: formatCurrency(lastQuarterRevenue),
            amount: formatCurrency(rec),
          }),
        });
      }
    }
    // 3. Low morale
    if (agg.headcount > 0 && agg.averageMorale > 0 && agg.averageMorale < 40) {
      out.push({
        id: `morale-q${year}-${quarter}`,
        priority: 80,
        text: t('advisor:companion.tips.lowMorale', { morale: agg.averageMorale }),
      });
    }
    // 4. Cash low
    if (cash > 0 && cash < summary.totalOutflow * 1.5 && summary.totalOutflow > 0) {
      out.push({
        id: `cash-q${year}-${quarter}`,
        priority: 90,
        text: t('advisor:companion.tips.cashLow'),
      });
    }
    return out
      .filter(t => !dismissed.has(t.id))
      .sort((a, b) => b.priority - a.priority);
  }, [summary, budget, lastQuarterRevenue, cash, agg, year, quarter, t, dismissed]);

  // Tour content
  const tourSteps = useMemo(() => {
    const rec = summary.areas;
    return [
      t('advisor:companion.tour.welcome', { name: companyName ?? '' }),
      t('advisor:companion.tour.personnel'),
      t('advisor:companion.tour.marketing', {
        amount: formatCurrency(rec.marketing.recommended || 10_000),
      }),
      t('advisor:companion.tour.development', {
        amount: formatCurrency(rec.development.recommended || 20_000),
      }),
      t('advisor:companion.tour.research', {
        amount: formatCurrency(rec.research.recommended || 5_000),
      }),
    ];
  }, [t, companyName, summary]);

  const inTour = tourStep >= 0 && tourStep < tourSteps.length;
  const activeTip = !inTour && tips.length > 0 ? tips[0] : null;
  const hasBubble = inTour || activeTip;

  const dismissTip = (id: string, forever = true) => {
    if (!forever) return;
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    saveDismissed(next);
  };

  const advanceTour = () => {
    if (tourStep + 1 >= tourSteps.length) {
      localStorage.setItem(LS_TOUR_DONE, '1');
      setTourStep(-1);
    } else {
      setTourStep(tourStep + 1);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 pointer-events-none">
      {open && hasBubble && (
        <Card className="pointer-events-auto retro-border bg-card/95 backdrop-blur-sm p-4 max-w-xs shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neon-magenta" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">
                {t('advisor:companion.title')}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-primary"
              aria-label="close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {inTour ? tourSteps[tourStep] : activeTip?.text}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 justify-end">
            {inTour ? (
              <Button size="sm" onClick={advanceTour}>
                {tourStep + 1 >= tourSteps.length
                  ? t('advisor:companion.dismiss')
                  : '→'}
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => activeTip && dismissTip(activeTip.id, true)}
                >
                  {t('advisor:companion.doNotShow')}
                </Button>
                <Button size="sm" onClick={() => setOpen(false)}>
                  {t('advisor:companion.dismiss')}
                </Button>
              </>
            )}
            {onOpenChat && !inTour && (
              <Button size="sm" variant="secondary" onClick={onOpenChat} className="gap-1">
                <MessageCircle className="w-3 h-3" />
                {t('advisor:companion.openChat')}
              </Button>
            )}
          </div>
        </Card>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        className="pointer-events-auto relative w-14 h-14 rounded-full bg-gradient-to-br from-neon-magenta to-neon-cyan border-2 border-primary/40 shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="advisor"
      >
        <Sparkles className="w-6 h-6 text-background" />
        {hasBubble && !open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber border-2 border-background animate-pulse" />
        )}
      </button>
    </div>
  );
};

export default AdvisorCompanion;
