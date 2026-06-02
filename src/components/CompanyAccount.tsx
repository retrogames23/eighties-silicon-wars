import React, { memo } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown, Calculator, Landmark, PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { useTranslation } from 'react-i18next';
import { useEconomyTranslation } from '@/utils/i18nHelpers';

interface CompanyAccountProps {
  gameState: {
    company: {
      cash: number;
      monthlyIncome: number;
      monthlyExpenses: number;
      hardwareIncome?: number;
      outstandingDebt?: number;
      equityGivenAwayPct?: number;
      additionalRevenue?: {
        softwareLicenses: { games: number; office: number };
        supportService: { b2c: number; b2b: number };
      };
      lastQuarterExpenses?: Record<string, number>;
    };
    budget: {
      marketing: number;
      development: number;
      research: number;
      support?: number;
    };
  };
}

export const CompanyAccount = memo<CompanyAccountProps>(({ gameState }) => {
  const { t } = useTranslation(['ui', 'common']);
  const { formatRevenue, formatProfit } = useEconomyTranslation();

  // Engine-Werte sind die Source of Truth (siehe GameMechanics.processQuarter)
  const totalIncome = Math.max(0, Math.round(gameState.company.monthlyIncome ?? 0));
  const totalExpenses = Math.max(0, Math.round(gameState.company.monthlyExpenses ?? 0));
  const monthlyProfit = totalIncome - totalExpenses;

  // Zusätzliche Einnahmen (falls vom Engine geliefert)
  const additionalRevenue = gameState.company.additionalRevenue || {
    softwareLicenses: { games: 0, office: 0 },
    supportService: { b2c: 0, b2b: 0 }
  };
  const softwareGamesMonthly = Math.round(additionalRevenue.softwareLicenses.games / 3);
  const softwareOfficeMonthly = Math.round(additionalRevenue.softwareLicenses.office / 3);
  const supportB2cMonthly = Math.round(additionalRevenue.supportService.b2c / 3);
  const supportB2bMonthly = Math.round(additionalRevenue.supportService.b2b / 3);

  // Hardware-Anteil als Rest aus Gesamt-Income (engine-authoritativ)
  const otherIncomeSum = softwareGamesMonthly + softwareOfficeMonthly + supportB2cMonthly + supportB2bMonthly;
  const hardwareIncome = Math.max(0, totalIncome - otherIncomeSum);

  const income = [
    { name: t('ui:account.income.computerSales'), amount: hardwareIncome, category: t('ui:account.categories.hardware') },
    { name: t('ui:account.income.gameSoftwareLicenses'), amount: softwareGamesMonthly, category: t('ui:account.categories.software') },
    { name: t('ui:account.income.officeSoftwareLicenses'), amount: softwareOfficeMonthly, category: t('ui:account.categories.software') },
    { name: t('ui:account.income.b2cSupport'), amount: supportB2cMonthly, category: t('ui:account.categories.service') },
    { name: t('ui:account.income.b2bSupport'), amount: supportB2bMonthly, category: t('ui:account.categories.service') },
  ].filter(item => item.amount > 0);

  const lastQuarterExpenses = gameState.company.lastQuarterExpenses;
  const monthlyExpense = (key: string, fallback = 0) => Math.round((lastQuarterExpenses?.[key] ?? fallback) / 3);

  const productCosts = monthlyExpense('productCosts');
  const salaries = monthlyExpense('salaries');
  const portfolioMaintenance = monthlyExpense('portfolioMaintenance');
  const fixedOverhead = monthlyExpense('fixedOverhead');
  const loanPayments = monthlyExpense('loanPayments');
  const reportedBudgetExpenses = monthlyExpense('marketing', gameState.budget.marketing)
    + monthlyExpense('development', gameState.budget.development)
    + monthlyExpense('research', gameState.budget.research)
    + monthlyExpense('support', gameState.budget.support ?? 0);
  const knownExpenseBreakdown = productCosts + reportedBudgetExpenses + salaries + portfolioMaintenance + fixedOverhead + loanPayments;
  const otherOperating = Math.max(0, totalExpenses - knownExpenseBreakdown);

  const expenses = [
    { name: t('ui:account.expenses.productCosts'), amount: productCosts, category: t('ui:account.categories.hardware') },
    { name: t('ui:account.expenses.marketingBudget'), amount: monthlyExpense('marketing', gameState.budget.marketing), category: t('ui:account.categories.marketing') },
    { name: t('ui:account.expenses.developmentCosts'), amount: monthlyExpense('development', gameState.budget.development), category: t('ui:account.categories.rnd') },
    { name: t('ui:account.expenses.researchBudget'), amount: monthlyExpense('research', gameState.budget.research), category: t('ui:account.categories.rnd') },
    { name: t('ui:account.expenses.supportBudget'), amount: monthlyExpense('support', gameState.budget.support ?? 0), category: t('ui:account.categories.service') },
    { name: t('ui:account.expenses.salaries'), amount: salaries, category: t('ui:account.categories.operations') },
    { name: t('ui:account.expenses.portfolioMaintenance'), amount: portfolioMaintenance, category: t('ui:account.categories.operations') },
    { name: t('ui:account.expenses.fixedOverhead'), amount: fixedOverhead, category: t('ui:account.categories.operations') },
    { name: t('ui:account.expenses.loanPayments'), amount: loanPayments, category: t('ui:account.categories.operations') },
    { name: t('ui:account.expenses.otherOperating'), amount: otherOperating, category: t('ui:account.categories.operations') },
  ].filter(item => item.amount > 0);


  return (
    <div className="space-y-6">
      {/* Übersicht */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('ui:account.labels.accountBalance')}</p>
              <p className="text-xl font-bold text-neon-green neon-text font-mono">
                {formatCurrency(gameState.company.cash)}
              </p>
            </div>
            <DollarSign className="w-6 h-6 text-neon-green" />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('ui:account.labels.monthlyIncome')}</p>
              <p className="text-xl font-bold text-neon-cyan neon-text font-mono">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-neon-cyan" />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('ui:account.labels.monthlyExpenses')}</p>
              <p className="text-xl font-bold text-red-400 font-mono">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <TrendingDown className="w-6 h-6 text-red-400" />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('ui:account.labels.monthlyProfit')}</p>
              <p className={`text-xl font-bold font-mono ${monthlyProfit >= 0 ? 'text-neon-green neon-text' : 'text-red-400'}`}>
                {formatCurrency(monthlyProfit)}
              </p>
            </div>
            <Calculator className="w-6 h-6 text-muted-foreground" />
          </div>
        </Card>
        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Schulden</p>
              <p className={`text-xl font-bold font-mono ${(gameState.company.outstandingDebt ?? 0) > 0 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                {formatCurrency(Math.round(gameState.company.outstandingDebt ?? 0))}
              </p>
            </div>
            <Landmark className={`w-6 h-6 ${(gameState.company.outstandingDebt ?? 0) > 0 ? 'text-orange-400' : 'text-muted-foreground'}`} />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Equity-frei</p>
              <p className="text-xl font-bold text-neon-magenta neon-text font-mono">
                {(100 - (gameState.company.equityGivenAwayPct ?? 0)).toFixed(1)}%
              </p>
              {(gameState.company.equityGivenAwayPct ?? 0) > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  −{(gameState.company.equityGivenAwayPct ?? 0).toFixed(1)}% an VCs
                </p>
              )}
            </div>
            <PieChart className="w-6 h-6 text-neon-magenta" />
          </div>
        </Card>
      </div>

      {/* Detaillierte Aufschlüsselung */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Einnahmen */}
        <Card className="retro-border bg-card/50 backdrop-blur-sm p-6">
          <h3 className="text-xl font-bold text-neon-cyan neon-text mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {t('ui:account.sections.income')}
          </h3>
          <div className="space-y-4">
            {income.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-primary">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <p className="font-mono text-neon-cyan font-semibold">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center font-bold">
                <span className="text-primary">{t('ui:account.labels.total')}</span>
                <span className="font-mono text-neon-cyan neon-text">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Ausgaben */}
        <Card className="retro-border bg-card/50 backdrop-blur-sm p-6">
          <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2" />
            {t('ui:account.sections.expenses')}
          </h3>
          <div className="space-y-4">
            {expenses.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-primary">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <p className="font-mono text-red-400 font-semibold">
                  -{formatCurrency(item.amount)}
                </p>
              </div>
            ))}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center font-bold">
                <span className="text-primary">{t('ui:account.labels.total')}</span>
                <span className="font-mono text-red-400">
                  -{formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});

CompanyAccount.displayName = 'CompanyAccount';
