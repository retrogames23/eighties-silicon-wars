import React, { memo } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown, Calculator } from "lucide-react";
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
      additionalRevenue?: {
        softwareLicenses: { games: number; office: number };
        supportService: { b2c: number; b2b: number };
      };
    };
    budget: {
      marketing: number;
      development: number;
      research: number;
    };
  };
}

export const CompanyAccount = memo<CompanyAccountProps>(({ gameState }) => {
  const { t } = useTranslation(['ui', 'common']);
  const { formatRevenue, formatProfit } = useEconomyTranslation();
  
  // Nur die drei Budgets als monatliche Ausgaben
  const monthlyMarketing = Math.round(gameState.budget.marketing / 3);
  const monthlyDevelopment = Math.round(gameState.budget.development / 3);
  const monthlyResearch = Math.round(gameState.budget.research / 3);

  const expenses = [
    { name: t('ui.account.expenses.marketingBudget'), amount: monthlyMarketing, category: t('ui.account.categories.marketing') },
    { name: t('ui.account.expenses.developmentCosts'), amount: monthlyDevelopment, category: t('ui.account.categories.rnd') },
    { name: t('ui.account.expenses.researchBudget'), amount: monthlyResearch, category: t('ui.account.categories.rnd') },
  ];

  // Berechne zusätzliche Einnahmen aus den Komponenten (falls vorhanden)
  const additionalRevenue = gameState.company.additionalRevenue || {
    softwareLicenses: { games: 0, office: 0 },
    supportService: { b2c: 0, b2b: 0 }
  };

  const hardwareIncome = gameState.company.hardwareIncome ?? 0;
  const softwareIncome = (additionalRevenue.softwareLicenses.games + additionalRevenue.softwareLicenses.office) / 3; // Quartalseinnahmen auf Monat
  const serviceIncome = (additionalRevenue.supportService.b2c + additionalRevenue.supportService.b2b) / 3;

  const income = [
    { name: t('ui.account.income.computerSales'), amount: hardwareIncome, category: t('ui.account.categories.hardware') },
    { name: t('ui.account.income.gameSoftwareLicenses'), amount: Math.round(additionalRevenue.softwareLicenses.games / 3), category: t('ui.account.categories.software') },
    { name: t('ui.account.income.officeSoftwareLicenses'), amount: Math.round(additionalRevenue.softwareLicenses.office / 3), category: t('ui.account.categories.software') },
    { name: t('ui.account.income.b2cSupport'), amount: Math.round(additionalRevenue.supportService.b2c / 3), category: t('ui.account.categories.service') },
    { name: t('ui.account.income.b2bSupport'), amount: Math.round(additionalRevenue.supportService.b2b / 3), category: t('ui.account.categories.service') },
  ];

  // Korrekte Gewinnberechnung: Gesamteinnahmen minus Gesamtausgaben
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const monthlyProfit = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('ui.account.labels.accountBalance')}</p>
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
              <p className="text-sm text-muted-foreground">{t('ui.account.labels.monthlyIncome')}</p>
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
              <p className="text-sm text-muted-foreground">{t('ui.account.labels.monthlyExpenses')}</p>
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
              <p className="text-sm text-muted-foreground">{t('ui.account.labels.monthlyProfit')}</p>
              <p className={`text-xl font-bold font-mono ${monthlyProfit >= 0 ? 'text-neon-green neon-text' : 'text-red-400'}`}>
                {formatCurrency(monthlyProfit)}
              </p>
            </div>
            <Calculator className="w-6 h-6 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Detaillierte Aufschlüsselung */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Einnahmen */}
        <Card className="retro-border bg-card/50 backdrop-blur-sm p-6">
          <h3 className="text-xl font-bold text-neon-cyan neon-text mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {t('ui.account.sections.income')}
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
                <span className="text-primary">Gesamt</span>
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
            {t('ui.account.sections.expenses')}
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
                <span className="text-primary">Gesamt</span>
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