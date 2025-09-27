import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Cpu, Monitor, Zap, TrendingUp, Plus } from "lucide-react";
import type { ComputerModel } from '@/types/ComputerModel';

interface DevelopmentTabProps {
  models: ComputerModel[];
  onDevelopNewModel: () => void;
  onDiscontinueModel?: (modelId: string) => void;
}

export const DevelopmentTab = ({ models, onDevelopNewModel, onDiscontinueModel }: DevelopmentTabProps) => {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  const totalRevenue = models.reduce((sum, model) => sum + (model.unitsSold * model.price), 0);
  const totalUnitsSold = models.reduce((sum, model) => sum + model.unitsSold, 0);
  const totalDevelopmentCosts = models.reduce((sum, model) => sum + model.developmentCost, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'development': return 'text-amber-400';
      case 'released': return 'text-neon-green';
      case 'discontinued': return 'text-red-400';
      default: return 'text-muted-foreground';
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
      {/* Übersichtskarten */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
              <p className="text-2xl font-bold text-neon-green neon-text font-mono">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-neon-green" />
          </div>
        </Card>

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
              <p className="text-sm text-muted-foreground">Verkaufte Einheiten</p>
              <p className="text-2xl font-bold text-neon-cyan neon-text font-mono">
                {totalUnitsSold.toLocaleString()}
              </p>
            </div>
            <Zap className="w-6 h-6 text-neon-cyan" />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Entwicklung</p>
              <p className="text-2xl font-bold text-amber-400 neon-text font-mono">
                {models.filter(m => m.status === 'development').length}
              </p>
            </div>
            <Cpu className="w-6 h-6 text-amber-400" />
          </div>
        </Card>
      </div>

      {/* Neues Modell entwickeln Button */}
      <Card className="retro-border bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-primary neon-text">Neues Computer-Modell entwickeln</h3>
            <p className="text-muted-foreground mt-1">
              Entwickle innovative Computer für verschiedene Zielgruppen
            </p>
          </div>
          <Button 
            onClick={onDevelopNewModel}
            className="retro-button bg-neon-green text-black hover:bg-neon-green/80 font-bold"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Entwicklung starten
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
              Klicke auf "Entwicklung starten", um dein erstes Computer-Modell zu entwickeln.
            </p>
          </Card>
        ) : (
          models.map((model) => (
            <Card key={model.id} className="retro-border bg-card/50 backdrop-blur-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-primary">{model.displayName || model.name}</h4>
                    {model.revision > 1 && (
                      <Badge variant="outline" className="text-xs">
                        Rev. {model.revision}
                      </Badge>
                    )}
                    <Badge variant="outline" className={getStatusColor(model.status)}>
                      {getStatusText(model.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">CPU:</span>
                      <span className="ml-2 text-primary font-medium">{model.cpu}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">RAM:</span>
                      <span className="ml-2 text-primary font-medium">{model.ram}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Preis:</span>
                      <span className="ml-2 text-neon-cyan font-mono font-bold">
                        {formatCurrency(model.price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Verkäufe:</span>
                      <span className="ml-2 text-neon-green font-mono font-bold">
                        {model.unitsSold.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {model.status === 'development' && model.developmentProgress !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Entwicklungsfortschritt</span>
                        <span className="text-sm font-mono text-amber-400">
                          {model.developmentProgress.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={model.developmentProgress} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {model.status === 'released' && onDiscontinueModel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDiscontinueModel(model.id)}
                      className="text-red-400 border-red-400/50 hover:bg-red-400/10"
                    >
                      Einstellen
                    </Button>
                  )}
                </div>
              </div>

              {/* Zusätzliche Details für Released/Discontinued Modelle */}
              {model.status !== 'development' && (
                <div className="border-t border-border pt-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Entwicklungskosten:</span>
                      <span className="ml-2 font-mono text-red-400">
                        {formatCurrency(model.developmentCost)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Umsatz:</span>
                      <span className="ml-2 font-mono text-neon-cyan">
                        {formatCurrency(model.unitsSold * model.price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Release:</span>
                      <span className="ml-2 font-medium">
                        Q{model.releaseQuarter}/{model.releaseYear}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ROI:</span>
                      <span className={`ml-2 font-mono font-bold ${
                        (model.unitsSold * model.price) > model.developmentCost ? 'text-neon-green' : 'text-red-400'
                      }`}>
                        {model.developmentCost > 0 ? 
                          `${(((model.unitsSold * model.price) / model.developmentCost - 1) * 100).toFixed(1)}%` 
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};