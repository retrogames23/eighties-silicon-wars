import React, { memo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useRenderTracking } from "@/lib/dev-tools";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  TrendingUp, 
  Cpu, 
  Users, 
  DollarSign, 
  Target,
  Lightbulb,
  Megaphone
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface Budget {
  marketing: number;
  development: number;
  research: number;
}

interface CompanyManagementProps {
  budget: Budget;
  totalBudget: number;
  onBudgetChange: (newBudget: Budget) => void;
}

export const CompanyManagement = memo<CompanyManagementProps>(({ 
  budget, 
  totalBudget, 
  onBudgetChange 
}) => {
  const isMobile = useIsMobile();
  
  // Development-only render tracking
  useRenderTracking('CompanyManagement');
  
  const usedBudget = budget.marketing + budget.development + budget.research;
  const remainingBudget = totalBudget - usedBudget;

  const updateBudget = (category: keyof Budget, value: number) => {
    const newBudget = { ...budget, [category]: value };
    onBudgetChange(newBudget);
  };

  const budgetCategories = [
    {
      key: 'marketing' as keyof Budget,
      name: 'Marketing',
      icon: Megaphone,
      color: 'text-neon-magenta',
      description: 'Werbung, PR und Markenaufbau',
      effects: [
        'Erhöht Markenbekanntheit',
        'Steigert Verkaufszahlen', 
        'Verbessert Marktposition'
      ]
    },
    {
      key: 'development' as keyof Budget,
      name: 'Entwicklung',
      icon: Cpu,
      color: 'text-neon-cyan',
      description: 'Hardware- und Software-Entwicklung',
      effects: [
        'Schnellere Produktentwicklung',
        'Bessere technische Features',
        'Kürzere Time-to-Market'
      ]
    },
    {
      key: 'research' as keyof Budget,
      name: 'Forschung',
      icon: Lightbulb,
      color: 'text-neon-green',
      description: 'Grundlagenforschung und Innovation',
      effects: [
        'Zukunftstechnologien',
        'Patente und IP',
        'Langfristige Wettbewerbsvorteile'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Budget-Übersicht */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-4 gap-4'}`}>
        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gesamtbudget</p>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-neon-green neon-text font-mono`}>
                {formatCurrency(totalBudget)}
              </p>
            </div>
            <DollarSign className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-neon-green`} />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Verwendet</p>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-neon-cyan neon-text font-mono`}>
                {formatCurrency(usedBudget)}
              </p>
            </div>
            <TrendingUp className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-neon-cyan`} />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Verfügbar</p>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold font-mono ${
                remainingBudget >= 0 ? 'text-neon-green neon-text' : 'text-red-400'
              }`}>
                {formatCurrency(remainingBudget)}
              </p>
            </div>
            <Target className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-muted-foreground`} />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Auslastung</p>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-amber neon-text font-mono`}>
                {Math.round((usedBudget / totalBudget) * 100)}%
              </p>
            </div>
            <Users className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-amber`} />
          </div>
        </Card>
      </div>

      {/* Budget-Warnung */}
      {remainingBudget < 0 && (
        <Card className="retro-border bg-red-500/20 border-red-500/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <p className="text-red-400 font-semibold">
              Budget überschritten! Reduziere die Ausgaben um {formatCurrency(Math.abs(remainingBudget))}.
            </p>
          </div>
        </Card>
      )}

      {/* Budget-Aufteilung */}
      <Card className="retro-border bg-card/50 backdrop-blur-sm p-6">
        <h3 className="text-xl font-bold text-primary neon-text mb-6">Budget-Allokation</h3>
        
        <div className="space-y-8">
          {budgetCategories.map((category) => {
            const IconComponent = category.icon;
            const percentage = totalBudget > 0 ? (budget[category.key] / totalBudget) * 100 : 0;
            
            return (
              <div key={category.key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`w-6 h-6 ${category.color}`} />
                    <div>
                      <h4 className="font-bold text-primary">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold font-mono ${category.color} neon-text`}>
                      {formatCurrency(budget[category.key])}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Slider
                    value={[budget[category.key]]}
                    max={totalBudget}
                    step={5000}
                    onValueChange={(value) => updateBudget(category.key, value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>{formatCurrency(totalBudget)}</span>
                  </div>
                </div>

                <div className="bg-card/30 rounded-lg p-3">
                  <p className="text-sm font-semibold text-primary mb-2">Auswirkungen:</p>
                  <ul className="text-sm space-y-1">
                    {category.effects.map((effect, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                        <span className="text-muted-foreground">{effect}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Budget-Verteilung Visualisierung */}
      <Card className="retro-border bg-card/50 backdrop-blur-sm p-6">
        <h3 className="text-xl font-bold text-primary neon-text mb-4">Budget-Verteilung</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Gesamtauslastung</span>
            <span className="text-sm font-mono">
              {Math.round((usedBudget / totalBudget) * 100)}%
            </span>
          </div>
          <Progress value={(usedBudget / totalBudget) * 100} className="h-3" />
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            {budgetCategories.map((category) => {
              const percentage = totalBudget > 0 ? (budget[category.key] / totalBudget) * 100 : 0;
              const IconComponent = category.icon;
              
              return (
                <div key={category.key} className="text-center">
                  <IconComponent className={`w-8 h-8 mx-auto mb-2 ${category.color}`} />
                  <p className="font-semibold text-sm text-primary">{category.name}</p>
                  <p className={`text-lg font-mono font-bold ${category.color}`}>
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Aktionen */}
      <div className={`${isMobile ? 'space-y-2' : 'flex gap-4'}`}>
        <Button 
          onClick={() => onBudgetChange({ marketing: 50000, development: 75000, research: 25000 })}
          variant="secondary"
          className={`${isMobile ? 'w-full mobile-touch-button' : 'flex-1'}`}
        >
          Ausgewogene Verteilung
        </Button>
        <Button 
          onClick={() => onBudgetChange({ marketing: 25000, development: 100000, research: 25000 })}
          variant="secondary"
          className={`${isMobile ? 'w-full mobile-touch-button' : 'flex-1'}`}
        >
          Fokus Entwicklung
        </Button>
        <Button 
          onClick={() => onBudgetChange({ marketing: 75000, development: 50000, research: 25000 })}
          variant="secondary"
          className={`${isMobile ? 'w-full mobile-touch-button' : 'flex-1'}`}
        >
          Fokus Marketing
        </Button>
      </div>
    </div>
  );
});

CompanyManagement.displayName = 'CompanyManagement';