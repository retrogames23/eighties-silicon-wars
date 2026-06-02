import React, { memo, useEffect, useState, useCallback, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useRenderTracking } from "@/lib/dev-tools";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from 'react-i18next';
import {
  Cpu,
  Users,
  DollarSign,
  Lightbulb,
  Megaphone,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  Wand2,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { StaffService, type StaffAggregate } from "@/services/StaffService";
import {
  type Budget,
  type BudgetArea,
  summarize,
  AREA_TO_ROLE,
} from "@/lib/game/BudgetRules";

interface CompanyManagementProps {
  budget: Budget;
  /** Unused now — kept for API back-compat. */
  totalBudget?: number;
  onBudgetChange: (newBudget: Budget) => void;
  /** Optional last-quarter revenue for recommendation heuristic. */
  lastQuarterRevenue?: number;
  cash?: number;
  hasActiveModels?: boolean;
  onOpenTeam?: () => void;
}

const EMPTY_AGG: StaffAggregate = {
  totalSalary: 0,
  headcount: 0,
  byRole: { engineer: 0, marketer: 0, support: 0, researcher: 0 },
  engineerBonusPct: 0,
  marketerBonusPct: 0,
  supportBonusPct: 0,
  researcherBonusPct: 0,
  averageMorale: 0,
};

const AREA_META: Record<BudgetArea, { icon: typeof Cpu; color: string }> = {
  marketing:   { icon: Megaphone,     color: 'text-neon-magenta' },
  development: { icon: Cpu,           color: 'text-neon-cyan' },
  research:    { icon: Lightbulb,     color: 'text-neon-green' },
  support:     { icon: HeartHandshake, color: 'text-amber' },
};

const AREAS: BudgetArea[] = ['development', 'marketing', 'research', 'support'];

export const CompanyManagement = memo<CompanyManagementProps>(({
  budget,
  onBudgetChange,
  lastQuarterRevenue = 0,
  cash = 0,
  hasActiveModels = false,
  onOpenTeam,
}) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation(['economy', 'common']);
  useRenderTracking('CompanyManagement');

  const [agg, setAgg] = useState<StaffAggregate>(EMPTY_AGG);

  // Load staff aggregate from DB so gates & caps reflect the real team.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const team = await StaffService.list(user.id);
        if (cancelled) return;
        setAgg(StaffService.aggregate(team));
      } catch (e) {
        console.warn('[CompanyManagement] staff load failed', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const summary = useMemo(() =>
    summarize(budget, agg, { cash, lastQuarterRevenue, hasActiveModels }),
  [budget, agg, cash, lastQuarterRevenue, hasActiveModels]);

  const updateArea = useCallback((area: BudgetArea, value: number) => {
    onBudgetChange({ ...budget, [area]: Math.max(0, Math.round(value)) });
  }, [budget, onBudgetChange]);

  const applyRecommendation = useCallback((area: BudgetArea) => {
    updateArea(area, summary.areas[area].recommended);
  }, [summary, updateArea]);

  return (
    <div className="space-y-6">
      {/* Header summary card */}
      <Card className="retro-border bg-card/50 backdrop-blur-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-primary neon-text">{t('economy:budget.title')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('economy:budget.subtitle')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-muted-foreground">{t('economy:budget.totalOutflow')}</p>
            <p className="text-2xl font-bold font-mono text-neon-green neon-text">
              {formatCurrency(summary.totalOutflow)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('economy:budget.totalOutflowHint', {
                budget: formatCurrency(summary.totalBudget),
                salaries: formatCurrency(summary.totalSalaries),
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Personnel card (read-only) */}
      <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-neon-cyan" />
            <div>
              <p className="font-bold text-primary">{t('economy:budget.personnel')}</p>
              <p className="text-sm text-muted-foreground">
                {t('economy:budget.personnelDescription')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {agg.headcount === 0
                  ? t('economy:budget.personnelEmpty')
                  : t('economy:budget.personnelCount', { count: agg.headcount })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-mono font-bold text-neon-cyan neon-text">
              {formatCurrency(agg.totalSalary)}
            </p>
            {onOpenTeam && (
              <Button size="sm" variant="ghost" className="mt-1" onClick={onOpenTeam}>
                {t('economy:budget.goToTeam')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Per-area cards */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-4'}`}>
        {AREAS.map(area => {
          const state = summary.areas[area];
          const meta = AREA_META[area];
          const Icon = meta.icon;
          const roleLabel = t(`economy:budget.rolesLabel.${state.role}`);
          const sliderMax = Math.max(
            10_000,
            Math.max(state.cap * 2, state.recommended * 4, state.currentBudget * 1.2),
          );

          return (
            <Card key={area} className="retro-border bg-card/50 backdrop-blur-sm p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Icon className={`w-6 h-6 ${meta.color} shrink-0 mt-0.5`} />
                  <div>
                    <h4 className="font-bold text-primary">{t(`economy:budget.${area}`)}</h4>
                    <p className="text-xs text-muted-foreground">
                      {t(`economy:budget.areaDesc${area.charAt(0).toUpperCase() + area.slice(1)}`)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-mono font-bold ${meta.color} neon-text`}>
                    {formatCurrency(state.currentBudget)}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    {t('economy:budget.efficiency', { pct: state.efficiencyPct })}
                  </Badge>
                </div>
              </div>

              {/* Gate warning */}
              {!state.hasGate ? (
                <div className="flex items-center justify-between gap-3 rounded-md border border-amber/40 bg-amber/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber" />
                    <span className="text-xs text-amber">
                      {t('economy:budget.needRole', { role: roleLabel })}
                    </span>
                  </div>
                  {onOpenTeam && (
                    <Button size="sm" variant="outline" onClick={onOpenTeam}>
                      {t('economy:budget.hireNow')}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-neon-green" />
                  <span>{t('economy:budget.cap')}: {formatCurrency(state.cap)}</span>
                </div>
              )}

              {/* Slider */}
              <div className="space-y-2">
                <Slider
                  value={[state.currentBudget]}
                  max={sliderMax}
                  step={1_000}
                  disabled={!state.hasGate}
                  onValueChange={(v) => updateArea(area, v[0] ?? 0)}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>$0</span>
                  <span>{formatCurrency(sliderMax)}</span>
                </div>
              </div>

              {/* Saturation hint */}
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className={
                    state.saturation === 'in-cap' ? 'text-neon-green border-neon-green/50' :
                    state.saturation === 'saturated' ? 'text-amber border-amber/50' :
                    'text-muted-foreground'
                  }
                >
                  {state.saturation === 'in-cap' && t('economy:budget.saturationInCap')}
                  {state.saturation === 'saturated' && t('economy:budget.saturationSaturated')}
                  {state.saturation === 'below' && t('economy:budget.saturationBelow')}
                </Badge>

                {state.hasGate && state.recommended > 0 && state.recommended !== state.currentBudget && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => applyRecommendation(area)}
                    className="gap-1"
                  >
                    <Wand2 className="w-3 h-3" />
                    {t('economy:budget.recommended')}: {formatCurrency(state.recommended)}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

CompanyManagement.displayName = 'CompanyManagement';
