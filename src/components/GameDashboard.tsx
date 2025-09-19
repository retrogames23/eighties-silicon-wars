import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Cpu, 
  Calendar,
  ChevronRight,
  Monitor,
  Zap
} from "lucide-react";

interface GameState {
  company: {
    name: string;
    cash: number;
    employees: number;
    reputation: number;
    marketShare: number;
  };
  quarter: number;
  year: number;
}

interface GameDashboardProps {
  gameState: GameState;
  onNextTurn: () => void;
  onDevelopComputer: () => void;
  onViewMarket: () => void;
  onManageTeam: () => void;
}

export const GameDashboard = ({ 
  gameState, 
  onNextTurn, 
  onDevelopComputer,
  onViewMarket,
  onManageTeam 
}: GameDashboardProps) => {
  const formatCurrency = (amount: number) => 
    `$${amount.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-gradient-crt p-6">
      <div className="crt-screen">
        <div className="scanline" />
        
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold neon-text text-neon-green">
                {gameState.company.name} CEO Terminal
              </h1>
              <p className="text-neon-cyan font-mono">
                Q{gameState.quarter} {gameState.year} - Status: OPERATIONAL
              </p>
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="retro-border bg-card/50 backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bargeld</p>
                    <p className="text-2xl font-bold text-neon-green neon-text font-mono">
                      {formatCurrency(gameState.company.cash)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-neon-green" />
                </div>
              </div>
            </Card>

            <Card className="retro-border bg-card/50 backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mitarbeiter</p>
                    <p className="text-2xl font-bold text-neon-cyan neon-text font-mono">
                      {gameState.company.employees}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-neon-cyan" />
                </div>
              </div>
            </Card>

            <Card className="retro-border bg-card/50 backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reputation</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xl font-bold text-neon-magenta neon-text font-mono">
                        {gameState.company.reputation}%
                      </p>
                    </div>
                    <Progress 
                      value={gameState.company.reputation} 
                      className="mt-2 h-2" 
                    />
                  </div>
                  <TrendingUp className="w-8 h-8 text-neon-magenta" />
                </div>
              </div>
            </Card>

            <Card className="retro-border bg-card/50 backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Marktanteil</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xl font-bold text-amber neon-text font-mono">
                        {gameState.company.marketShare}%
                      </p>
                    </div>
                    <Progress 
                      value={gameState.company.marketShare} 
                      className="mt-2 h-2" 
                    />
                  </div>
                  <Monitor className="w-8 h-8 text-amber" />
                </div>
              </div>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="retro-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all group">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Cpu className="w-8 h-8 text-neon-green mr-3" />
                  <h3 className="text-xl font-bold text-primary neon-text">
                    Computer entwickeln
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Entwickle neue Computer mit modernster 80er-Technologie
                </p>
                <Button 
                  onClick={onDevelopComputer}
                  className="w-full glow-button"
                  variant="default"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  R&D Labor betreten
                </Button>
              </div>
            </Card>

            <Card className="retro-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all group">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-8 h-8 text-neon-cyan mr-3" />
                  <h3 className="text-xl font-bold text-primary neon-text">
                    Markt analysieren
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Untersuche die Konkurrenz und Markttrends
                </p>
                <Button 
                  onClick={onViewMarket}
                  className="w-full glow-button"
                  variant="secondary"
                >
                  Marktdaten abrufen
                </Button>
              </div>
            </Card>

            <Card className="retro-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all group">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-neon-magenta mr-3" />
                  <h3 className="text-xl font-bold text-primary neon-text">
                    Team verwalten
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Stelle Ingenieure und Designer ein oder befördere sie
                </p>
                <Button 
                  onClick={onManageTeam}
                  className="w-full glow-button"
                  variant="secondary"
                >
                  HR-System öffnen
                </Button>
              </div>
            </Card>
          </div>

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