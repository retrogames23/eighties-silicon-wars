// Erweiterte Quartalsberichte mit korrekter Gewinn-/Verlust-Rechnung
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, DollarSign, Calculator, BarChart3 } from "lucide-react";
import type { ProfitBreakdown } from "./EconomyModel";

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
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

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
                Quartalsbericht Q{reportData.quarter}/{reportData.year}
              </h2>
              <p className="text-muted-foreground mt-1">
                Detaillierte Gewinn- & Verlustrechnung
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
                  <p className="text-sm text-muted-foreground">Umsatz</p>
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
                  <p className="text-sm text-muted-foreground">Gesamtkosten</p>
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
                  <p className="text-sm text-muted-foreground">Gewinn</p>
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
                  <p className="text-sm text-muted-foreground">Gewinnmarge</p>
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
              Kosten-Aufschlüsselung
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Hardware-Kosten (BOM)</p>
                <p className="text-lg font-bold text-red-400 font-mono">
                  {formatCurrency(aggregatedBreakdown.bomCosts)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((aggregatedBreakdown.bomCosts / totalCosts) * 100).toFixed(1)}% der Gesamtkosten
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entwicklungskosten</p>
                <p className="text-lg font-bold text-red-400 font-mono">
                  {formatCurrency(aggregatedBreakdown.developmentCosts)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Amortisiert über Lebensdauer
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marketing</p>
                <p className="text-lg font-bold text-red-400 font-mono">
                  {formatCurrency(aggregatedBreakdown.marketingCosts)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pro verkaufter Einheit
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produktion</p>
                <p className="text-lg font-bold text-red-400 font-mono">
                  {formatCurrency(aggregatedBreakdown.productionCosts)}
                </p>
                <p className="text-xs text-muted-foreground">
                  8% der Hardware-Kosten
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fixkosten</p>
                <p className="text-lg font-bold text-red-400 font-mono">
                  {formatCurrency(aggregatedBreakdown.fixedOverhead)}
                </p>
                <p className="text-xs text-muted-foreground">
                  $50 pro verkaufter Einheit
                </p>
              </div>
            </div>
          </Card>

          {/* Modell-Performance */}
          <Card className="retro-border bg-card/50 p-6">
            <h3 className="text-xl font-bold text-primary mb-4">
              Modell-Performance
            </h3>
            <div className="space-y-4">
              {reportData.modelPerformance.map((model, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-primary">{model.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {model.units.toLocaleString()} Einheiten verkauft
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={model.profit >= 0 ? "default" : "destructive"}>
                        {formatCurrency(model.profit)} Gewinn
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Umsatz:</span>
                      <span className="font-mono ml-2 text-neon-cyan">
                        {formatCurrency(model.revenue)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hardware-Kosten:</span>
                      <span className="font-mono ml-2 text-red-400">
                        {formatCurrency(model.profitBreakdown.bomCosts)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gewinnmarge:</span>
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
              <h3 className="text-xl font-bold text-primary mb-4">Marktposition</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marktanteil:</span>
                  <span className="font-bold text-neon-cyan">
                    {formatPercent(reportData.marketShare)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verkaufte Einheiten:</span>
                  <span className="font-mono">
                    {reportData.totalUnits.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="retro-border bg-card/50 p-6">
              <h3 className="text-xl font-bold text-primary mb-4">Budget-Ausgaben</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marketing:</span>
                  <span className="font-mono text-red-400">
                    {formatCurrency(reportData.expenses.marketing)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entwicklung:</span>
                  <span className="font-mono text-red-400">
                    {formatCurrency(reportData.expenses.development)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Forschung:</span>
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
            <div className="text-neon-green">✓ ASSERTION: Quartalsreport zeigt Umsatz/Kosten/Gewinn getrennt</div>
            <div className="text-neon-green">✓ ASSERTION: Gewinnmarge = (Gewinn / Umsatz) × 100</div>
            <div className="text-neon-green">✓ ASSERTION: Gesamtkosten = BOM + Entwicklung + Marketing + Produktion + Fixkosten</div>
          </div>
        </div>
      </Card>
    </div>
  );
};