import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown, Calculator } from "lucide-react";

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

export const CompanyAccount = ({ gameState }: CompanyAccountProps) => {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const monthlyProfit = gameState.company.monthlyIncome - gameState.company.monthlyExpenses;

  // Nur die drei Budgets als monatliche Ausgaben
  const monthlyMarketing = Math.round(gameState.budget.marketing / 3);
  const monthlyDevelopment = Math.round(gameState.budget.development / 3);
  const monthlyResearch = Math.round(gameState.budget.research / 3);

  const expenses = [
    { name: "Marketing Budget", amount: monthlyMarketing, category: "Marketing" },
    { name: "Entwicklungskosten", amount: monthlyDevelopment, category: "F&E" },
    { name: "Forschungsbudget", amount: monthlyResearch, category: "F&E" },
  ];

  // Berechne zusätzliche Einnahmen aus den Komponenten (falls vorhanden)
  const additionalRevenue = gameState.company.additionalRevenue || {
    softwareLicenses: { games: 0, office: 0 },
    supportService: { b2c: 0, b2b: 0 }
  };

  const hardwareIncome = gameState.company.hardwareIncome || gameState.company.monthlyIncome;
  const softwareIncome = (additionalRevenue.softwareLicenses.games + additionalRevenue.softwareLicenses.office) / 3; // Quartalseinnahmen auf Monat
  const serviceIncome = (additionalRevenue.supportService.b2c + additionalRevenue.supportService.b2b) / 3;

  const income = [
    { name: "Computer-Verkäufe", amount: hardwareIncome, category: "Hardware" },
    { name: "Spiele-Software", amount: Math.round(additionalRevenue.softwareLicenses.games / 3), category: "Software" },
    { name: "Büro-Software", amount: Math.round(additionalRevenue.softwareLicenses.office / 3), category: "Software" },
    { name: "B2C Support", amount: Math.round(additionalRevenue.supportService.b2c / 3), category: "Service" },
    { name: "B2B Support", amount: Math.round(additionalRevenue.supportService.b2b / 3), category: "Service" },
  ];

  return (
    <div className="space-y-6">
      {/* Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Kontosaldo</p>
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
              <p className="text-sm text-muted-foreground">Monatl. Einnahmen</p>
              <p className="text-xl font-bold text-neon-cyan neon-text font-mono">
                {formatCurrency(gameState.company.monthlyIncome)}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-neon-cyan" />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monatl. Ausgaben</p>
              <p className="text-xl font-bold text-red-400 font-mono">
                {formatCurrency(gameState.company.monthlyExpenses)}
              </p>
            </div>
            <TrendingDown className="w-6 h-6 text-red-400" />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monatl. Gewinn</p>
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
            Einnahmen
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
                  {formatCurrency(gameState.company.monthlyIncome)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Ausgaben */}
        <Card className="retro-border bg-card/50 backdrop-blur-sm p-6">
          <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2" />
            Ausgaben
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
                  -{formatCurrency(gameState.company.monthlyExpenses)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Cashflow-Trend */}
      <Card className="retro-border bg-card/50 backdrop-blur-sm p-6">
        <h3 className="text-xl font-bold text-primary neon-text mb-4">
          Cashflow-Entwicklung
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Liquidität</span>
              <span className="text-sm font-mono">
                {Math.round((gameState.company.cash / 500000) * 100)}%
              </span>
            </div>
            <Progress 
              value={Math.min(100, (gameState.company.cash / 500000) * 100)} 
              className="h-3" 
            />
          </div>
        </div>
      </Card>
    </div>
  );
};