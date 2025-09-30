// Erweiterte Quartalsberichte mit korrekter Gewinn-/Verlust-Rechnung
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, DollarSign, Calculator, BarChart3 } from "lucide-react";
import type { ProfitBreakdown } from "./EconomyModel";
import { useTranslation } from "react-i18next";
import { formatters } from "@/lib/i18n";

interface QuarterlyReportData {
  quarter: number;
  year: number;
  totalUnits: number;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  modelPerformance: {
    name: string;
    units: number;
    revenue: number;
    profit: number;
    profitBreakdown: ProfitBreakdown;
  }[];
  marketShare: number;
  expenses: {
    marketing: number;
    development: number;
    research: number;
  };
}

interface QuarterlyReportsProps {
  reportData: QuarterlyReportData;
  onClose: () => void;
}

export const QuarterlyReports = ({ reportData, onClose }: QuarterlyReportsProps) => {
  const { t } = useTranslation(['reports']);
  const formatCurrency = (amount: number) => formatters.currency(amount);
  const formatPercent = (value: number) => formatters.percentage(value / 100);

  // Berechne aggregierte Kosten-Aufschlüsselung
  const aggregatedBreakdown = reportData.modelPerformance.reduce((acc, model) => {
    acc.bomCosts += model.profitBreakdown.bomCosts;
    acc.developmentCosts += model.profitBreakdown.developmentCosts;
    acc.marketingCosts += model.profitBreakdown.marketingCosts;
    acc.productionCosts += model.profitBreakdown.productionCosts;
    acc.fixedOverhead += model.profitBreakdown.fixedOverhead;
    return acc;
  }, {
    bomCosts: 0,
    developmentCosts: 0,
    marketingCosts: 0,
    productionCosts: 0,
    fixedOverhead: 0
  });

  const totalCosts = Object.values(aggregatedBreakdown).reduce((sum, cost) => sum + cost, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="retro-border bg-card backdrop-blur-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-neon-cyan neon-text">
                {t('reports:quarterly.title')} Q{reportData.quarter}/{reportData.year}
              </h2>
              <p className="text-muted-foreground mt-1">
                {t('reports:quarterly.subtitle')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-primary"
            >
              ✕
            </button>
          </div>

          {/* Kernkennzahlen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="retro-border bg-card/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('reports:quarterly.coreMetrics.revenue')}</p>
                  <p className="text-xl font-bold text-neon-cyan neon-text font-mono">
                    {formatCurrency(reportData.totalRevenue)}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-neon-cyan" />
              </div>
            </Card>

            <Card className="retro-border bg-card/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('reports:quarterly.coreMetrics.totalCosts')}</p>
                  <p className="text-xl font-bold text-red-400 font-mono">
                    {formatCurrency(totalCosts)}
                  </p>
                </div>
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </Card>

            <Card className="retro-border bg-card/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('reports:quarterly.coreMetrics.profit')}</p>
                  <p className={`text-xl font-bold font-mono ${reportData.totalProfit >= 0 ? 'text-neon-green neon-text' : 'text-red-400'}`}>
                    {formatCurrency(reportData.totalProfit)}
                  </p>
                </div>
                <Calculator className="w-6 h-6 text-muted-foreground" />
              </div>
            </Card>

            <Card className="retro-border bg-card/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('reports:quarterly.coreMetrics.profitMargin')}</p>
                  <p className={`text-xl font-bold font-mono ${reportData.profitMargin >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                    {formatPercent(reportData.profitMargin)}
                  </p>
                </div>
                <BarChart3 className="w-6 h-6 text-muted-foreground" />
              </div>
            </Card>
          </div>

          {/* Kosten-Aufschlüsselung */}
          <Card className="retro-border bg-card/50 p-6">
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              {t('reports:quarterly.costBreakdown.title')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('reports:quarterly.costBreakdown.bomCosts')}</p>
                <p className="text-lg font-bold text-red-400 font-mono">
                  {formatCurrency(aggregatedBreakdown.bomCosts)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((aggregatedBreakdown.bomCosts / totalCosts) * 100).toFixed(1)}% {t('reports:quarterly.costBreakdown.bomDescription')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('reports:quarterly.costBreakdown.developmentCosts')}</p>
                <p className="text-lg font-bold text-red-400 font-mono">
                  {formatCurrency(aggregatedBreakdown.developmentCosts)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('reports:quarterly.costBreakdown.developmentDescription')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('reports:quarterly.costBreakdown.marketingCosts')}</p>
                <p className="text-lg font-bold text-red-400 font-mono">
                  {formatCurrency(aggregatedBreakdown.marketingCosts)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('reports:quarterly.costBreakdown.marketingDescription')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('reports:quarterly.costBreakdown.productionCosts')}</p>
                <p className="text-lg font-bold text-red-400 font-mono">
                  {formatCurrency(aggregatedBreakdown.productionCosts)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('reports:quarterly.costBreakdown.productionDescription')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('reports:quarterly.costBreakdown.fixedOverhead')}</p>
                <p className="text-lg font-bold text-red-400 font-mono">
                  {formatCurrency(aggregatedBreakdown.fixedOverhead)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('reports:quarterly.costBreakdown.fixedDescription')}
                </p>
              </div>
            </div>
          </Card>

          {/* Modell-Performance */}
          <Card className="retro-border bg-card/50 p-6">
            <h3 className="text-xl font-bold text-primary mb-4">
              {t('reports:quarterly.modelPerformance.title')}
            </h3>
            <div className="space-y-4">
              {reportData.modelPerformance.map((model, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-primary">{model.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {model.units.toLocaleString()} {t('reports:quarterly.modelPerformance.unitsSold')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={model.profit >= 0 ? "default" : "destructive"}>
                        {formatCurrency(model.profit)} {t('reports:quarterly.modelPerformance.profit')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('reports:quarterly.modelPerformance.revenue')}</span>
                      <span className="font-mono ml-2 text-neon-cyan">
                        {formatCurrency(model.revenue)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('reports:quarterly.modelPerformance.hardwareCosts')}</span>
                      <span className="font-mono ml-2 text-red-400">
                        {formatCurrency(model.profitBreakdown.bomCosts)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('reports:quarterly.modelPerformance.profitMargin')}</span>
                      <span className={`font-mono ml-2 ${model.profit >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                        {formatPercent((model.profit / model.revenue) * 100)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Markt-Daten */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="retro-border bg-card/50 p-6">
              <h3 className="text-xl font-bold text-primary mb-4">{t('reports:quarterly.marketData.marketPosition')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('reports:quarterly.marketData.marketShare')}</span>
                  <span className="font-bold text-neon-cyan">
                    {formatPercent(reportData.marketShare)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('reports:quarterly.marketData.unitsSold')}</span>
                  <span className="font-mono">
                    {reportData.totalUnits.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="retro-border bg-card/50 p-6">
              <h3 className="text-xl font-bold text-primary mb-4">{t('reports:quarterly.marketData.budgetExpenses')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('reports:quarterly.marketData.marketing')}</span>
                  <span className="font-mono text-red-400">
                    {formatCurrency(reportData.expenses.marketing)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('reports:quarterly.marketData.development')}</span>
                  <span className="font-mono text-red-400">
                    {formatCurrency(reportData.expenses.development)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('reports:quarterly.marketData.research')}</span>
                  <span className="font-mono text-red-400">
                    {formatCurrency(reportData.expenses.research)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Console Test Assertions */}
          <div className="text-xs text-muted-foreground font-mono bg-card/30 p-3 rounded">
            <div className="text-neon-green">{t('reports:quarterly.assertions.line1')}</div>
            <div className="text-neon-green">{t('reports:quarterly.assertions.line2')}</div>
            <div className="text-neon-green">{t('reports:quarterly.assertions.line3')}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};