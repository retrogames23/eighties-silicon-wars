import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Cpu, Monitor, Zap, TrendingUp, Plus } from "lucide-react";

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

interface DevelopmentTabProps {
  models: ComputerModel[];
  onDevelopNewModel: () => void;
}

export const DevelopmentTab = ({ models, onDevelopNewModel }: DevelopmentTabProps) => {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  const totalRevenue = models.reduce((sum, model) => sum + (model.unitsSold * model.price), 0);
  const totalUnitsSold = models.reduce((sum, model) => sum + model.unitsSold, 0);
  const totalDevelopmentCosts = models.reduce((sum, model) => sum + model.developmentCost, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'development': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'released': return 'bg-neon-green/20 text-neon-green border-neon-green/30';
      case 'discontinued': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'development': return 'In Entwicklung';
      case 'released': return 'Verfügbar';
      case 'discontinued': return 'Eingestellt';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Modelle</p>
              <p className="text-2xl font-bold text-neon-green neon-text font-mono">
                {models.length}
              </p>
            </div>
            <Monitor className="w-6 h-6 text-neon-green" />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Verkauft</p>
              <p className="text-2xl font-bold text-neon-cyan neon-text font-mono">
                {totalUnitsSold.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-neon-cyan" />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Umsatz</p>
              <p className="text-2xl font-bold text-neon-green neon-text font-mono">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <Zap className="w-6 h-6 text-neon-green" />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Entwicklung</p>
              <p className="text-2xl font-bold text-red-400 font-mono">
                {formatCurrency(totalDevelopmentCosts)}
              </p>
            </div>
            <Cpu className="w-6 h-6 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Neue Entwicklung */}
      <Card className="retro-border bg-card/50 backdrop-blur-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-primary neon-text">Neue Entwicklung</h3>
            <p className="text-muted-foreground">Starte die Entwicklung eines neuen Computer-Modells</p>
          </div>
          <Button onClick={onDevelopNewModel} className="glow-button">
            <Plus className="w-4 h-4 mr-2" />
            Neues Modell entwickeln
          </Button>
        </div>
      </Card>

      {/* Modell-Liste */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-primary neon-text">Deine Computer-Modelle</h3>
        
        {models.length === 0 ? (
          <Card className="retro-border bg-card/50 backdrop-blur-sm p-8 text-center">
            <Monitor className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Noch keine Modelle entwickelt</p>
            <p className="text-sm text-muted-foreground mt-2">
              Starte mit der Entwicklung deines ersten Computers!
            </p>
          </Card>
        ) : (
          models.map((model) => (
            <Card key={model.id} className="retro-border bg-card/50 backdrop-blur-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-bold text-primary neon-text">{model.name}</h4>
                    <Badge className={getStatusColor(model.status)}>
                      {getStatusText(model.status)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">CPU</p>
                      <p className="font-mono text-neon-cyan">{model.cpu}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">RAM</p>
                      <p className="font-mono text-neon-cyan">{model.ram}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Preis</p>
                      <p className="font-mono text-neon-green">{formatCurrency(model.price)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Release</p>
                      <p className="font-mono">Q{model.releaseQuarter} {model.releaseYear}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Verkaufte Einheiten</p>
                  <p className="text-xl font-bold text-neon-cyan neon-text font-mono">
                    {model.unitsSold.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Umsatz</p>
                  <p className="text-xl font-bold text-neon-green neon-text font-mono">
                    {formatCurrency(model.unitsSold * model.price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ROI</p>
                  <p className={`text-xl font-bold font-mono ${
                    (model.unitsSold * model.price) > model.developmentCost 
                      ? 'text-neon-green neon-text' 
                      : 'text-red-400'
                  }`}>
                    {model.developmentCost > 0 
                      ? `${Math.round(((model.unitsSold * model.price) / model.developmentCost - 1) * 100)}%`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {model.status === 'released' && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Marktdurchdringung</span>
                    <span className="text-sm font-mono">
                      {Math.min(100, Math.round((model.unitsSold / 100000) * 100))}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (model.unitsSold / 100000) * 100)} 
                    className="h-2" 
                  />
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};