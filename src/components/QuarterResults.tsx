import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Package, DollarSign, Users, Target } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { useTranslation } from "react-i18next";
import { formatters } from "@/lib/i18n";
import { WhyPanel } from "@/components/WhyPanel";
import type { AiWorldEvent } from "@/services/LivingWorldService";

interface QuarterResultsProps {
  quarter: number;
  year: number;
  results: {
    modelSales?: {
      modelName: string;
      unitsSold: number;
      revenue: number;
      price: number;
    }[];
    modelResults?: any[]; // NEW: Support new structure from GameMechanics
    totalRevenue: number;
    totalProfit?: number; // NEW: Support profit tracking
    totalUnitsSold: number;
    marketShare: number;
    marketShareChange: number;
    reputation: number;
    reputationChange: number;
    expenses: {
      productCosts?: number;
      marketing: number;
      development: number;
      research: number;
      support?: number;
      salaries?: number;
      portfolioMaintenance?: number;
      fixedOverhead?: number;
      loanPayments?: number;
    };
    netProfit: number;
    netCashFlow?: number;
    competitorActions?: string[]; // Make optional
    marketEvent?: {
      title: string;
      description: string;
      effect: string;
    };
  };
  onContinue: () => void;
  aiEvents?: AiWorldEvent[];
}

export const QuarterResults = ({ quarter, year, results, onContinue, aiEvents = [] }: QuarterResultsProps) => {
  const { t } = useTranslation(['reports', 'common']);
  
  // Handle both old and new data structures from GameMechanics
  const modelSales = results.modelSales || results.modelResults || [];
  const competitorActions = results.competitorActions || [];
  const expenseRows = [
    { key: 'productCosts', amount: results?.expenses?.productCosts ?? 0 },
    { key: 'marketing', amount: results?.expenses?.marketing ?? 0 },
    { key: 'development', amount: results?.expenses?.development ?? 0 },
    { key: 'research', amount: results?.expenses?.research ?? 0 },
    { key: 'support', amount: results?.expenses?.support ?? 0 },
    { key: 'salaries', amount: results?.expenses?.salaries ?? 0 },
    { key: 'portfolioMaintenance', amount: results?.expenses?.portfolioMaintenance ?? 0 },
    { key: 'fixedOverhead', amount: results?.expenses?.fixedOverhead ?? 0 },
    { key: 'loanPayments', amount: results?.expenses?.loanPayments ?? 0 },
  ].filter(row => row.amount > 0);
  const expensesTotal = expenseRows.reduce((sum, row) => sum + row.amount, 0);
  const revenue = results.totalRevenue ?? 0;
  const hasRevenue = typeof results.totalRevenue === 'number';
  const hasExpenses = !!results?.expenses;
  const computedProfit = revenue - expensesTotal;
  const totalProfit = (hasRevenue || hasExpenses)
    ? computedProfit
    : (results.totalProfit ?? results.netProfit ?? 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto retro-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-neon-green font-mono">
            {formatters.quarter(quarter, year)} - {t('title')}
          </CardTitle>
          <CardDescription>
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Verkaufte Modelle */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t('models.title')}
            </h3>
            {modelSales && modelSales.length > 0 ? (
              <div className="grid gap-3">
                {modelSales.map((model, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-mono font-medium">{model.modelName}</div>
                      <div className="text-sm text-muted-foreground">
                        {model.unitsSold} {t('models.unitsLabel')} × {formatCurrency(model.price || 0)}
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {formatCurrency(model.revenue)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4 border rounded-lg">
                {t('models.noSales')}
              </div>
            )}
          </div>

          {/* Finanzübersicht */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {t('financial.revenue.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t('financial.revenue.total')}:</span>
                    <span className="font-mono text-green-400">{formatCurrency(results.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('financial.revenue.unitsSold')}:</span>
                    <span className="font-mono">{results.totalUnitsSold}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {t('financial.expenses.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {expenseRows.map(row => (
                    <div key={row.key} className="flex justify-between gap-3">
                      <span>{t(`financial.expenses.${row.key}`)}:</span>
                      <span className="font-mono text-red-400">{formatCurrency(row.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border pt-2 font-semibold">
                    <span>{t('financial.expenses.total')}:</span>
                    <span className="font-mono text-red-400">{formatCurrency(expensesTotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nettogewinn */}
          <Card className={totalProfit >= 0 ? "border-green-500/20" : "border-red-500/20"}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">{t('financial.netProfit')}:</span>
                <Badge 
                  variant={totalProfit >= 0 ? "default" : "destructive"} 
                  className="text-lg px-4 py-2 font-mono"
                >
                  {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Marktposition */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('market.marketShare')}:</span>
                <div className="flex items-center gap-2">
                  {results.marketShareChange > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : results.marketShareChange < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  ) : null}
                  <Badge variant="outline">
                    {results.marketShare.toFixed(1)}% ({results.marketShareChange > 0 ? '+' : ''}{results.marketShareChange.toFixed(1)}%)
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('market.reputation')}:</span>
                <div className="flex items-center gap-2">
                  {results.reputationChange > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : results.reputationChange < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  ) : null}
                  <Badge variant="outline">
                    {results.reputation.toFixed(0)} ({results.reputationChange > 0 ? '+' : ''}{results.reputationChange.toFixed(0)})
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Marktereignis */}
          {results.marketEvent && (
            <Card className="border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-400">{t('marketEvent.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold">{results.marketEvent.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{results.marketEvent.description}</p>
                  <Badge variant="outline">{results.marketEvent.effect}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KI-Welt: Warum-Panel */}
          <WhyPanel events={aiEvents} />

          {/* Konkurrenz-Aktivitäten */}
          {competitorActions && competitorActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('competitors.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {competitorActions.map((action, index) => (
                    <p key={index} className="text-sm font-mono">• {action}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center pt-4">
            <Button 
              onClick={onContinue}
              className="px-8 py-2 font-mono"
            >
              {t('continue')} {formatters.quarter(quarter === 4 ? 1 : quarter + 1, quarter === 4 ? year + 1 : year)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};