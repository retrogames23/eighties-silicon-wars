import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyAccount } from "@/components/CompanyAccount";
import { DevelopmentTab } from "@/components/DevelopmentTab";
import { MarketTab } from "@/components/MarketTab";
import { CompanyManagement } from "@/components/CompanyManagement";
import { 
  Calendar,
  ChevronRight,
  Building2,
  Cpu,
  Monitor,
  Zap
} from "lucide-react";

import { type Competitor, type MarketEvent } from "@/components/GameMechanics";

interface ComputerModel {
  id: string;
  name: string;
  cpu: string;
  ram: string;
  price: number;
  unitsSold: number;
  developmentCost: number;
  releaseQuarter: number;
  releaseYear: number;
  status: 'development' | 'released' | 'discontinued';
}

interface Budget {
  marketing: number;
  development: number;
  research: number;
}

interface GameState {
  company: {
    name: string;
    logo: string;
    cash: number;
    employees: number;
    reputation: number;
    marketShare: number;
    monthlyIncome: number;
    monthlyExpenses: number;
  };
  quarter: number;
  year: number;
  models: ComputerModel[];
  budget: Budget;
  competitors: Competitor[];
  marketEvents: MarketEvent[];
  totalMarketSize: number;
}

interface GameDashboardProps {
  gameState: GameState;
  onNextTurn: () => void;
  onBudgetChange: (newBudget: Budget) => void;
  onDevelopNewModel: () => void;
}

export const GameDashboard = ({ 
  gameState, 
  onNextTurn, 
  onBudgetChange,
  onDevelopNewModel
}: GameDashboardProps) => {
  const getCompanyIcon = () => {
    switch (gameState.company.logo) {
      case 'building': return Building2;
      case 'cpu': return Cpu;
      case 'monitor': return Monitor;
      case 'zap': return Zap;
      default: return Building2;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-crt p-6">
      <div className="crt-screen">
        <div className="scanline" />
        
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              {(() => {
                const IconComponent = getCompanyIcon();
                return <IconComponent className="w-12 h-12 text-neon-green" />;
              })()}
              <div>
                <h1 className="text-4xl font-bold neon-text text-neon-green">
                  {gameState.company.name}
                </h1>
                <p className="text-neon-cyan font-mono">
                  Q{gameState.quarter} {gameState.year} - CEO Terminal
                </p>
              </div>
            </div>
            
            <Button 
              onClick={onNextTurn}
              className="glow-button px-8 py-3 text-lg"
              variant="default"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Nächste Runde
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="retro-border bg-card/50 backdrop-blur-sm p-1 mb-6">
              <TabsTrigger value="account" className="retro-tab">
                Firmenkonto
              </TabsTrigger>
              <TabsTrigger value="development" className="retro-tab">
                Entwicklung
              </TabsTrigger>
              <TabsTrigger value="market" className="retro-tab">
                Markt
              </TabsTrigger>
              <TabsTrigger value="management" className="retro-tab">
                Unternehmen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <CompanyAccount gameState={gameState} />
            </TabsContent>

            <TabsContent value="development" className="space-y-6">
              <DevelopmentTab 
                models={gameState.models} 
                onDevelopNewModel={onDevelopNewModel} 
              />
            </TabsContent>

            <TabsContent value="market" className="space-y-6">
              <MarketTab 
                competitors={gameState.competitors}
                marketEvents={gameState.marketEvents}
                totalMarketSize={gameState.totalMarketSize}
                playerMarketShare={gameState.company.marketShare}
              />
            </TabsContent>

            <TabsContent value="management" className="space-y-6">
              <CompanyManagement 
                budget={gameState.budget}
                totalBudget={150000}
                onBudgetChange={onBudgetChange}
              />
            </TabsContent>
          </Tabs>

          {/* Terminal Footer */}
          <div className="mt-12 text-center">
            <div className="retro-border inline-block p-4 bg-card/30 backdrop-blur-sm">
              <p className="text-sm text-terminal-green font-mono">
                {">>> SYSTEM STATUS: ALL NETWORKS OPERATIONAL <<<"}
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                MAINFRAME_OS v2.1 - Last backup: Q{gameState.quarter} {gameState.year}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};