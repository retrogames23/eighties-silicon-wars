import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Cpu, 
  HardDrive, 
  Monitor, 
  Gamepad2,
  Zap,
  DollarSign,
  Clock
} from "lucide-react";

interface Component {
  id: string;
  name: string;
  type: 'cpu' | 'memory' | 'storage' | 'graphics' | 'sound';
  performance: number;
  cost: number;
  description: string;
  year: number;
}

const components: Component[] = [
  {
    id: "mos6502",
    name: "MOS 6502",
    type: "cpu",
    performance: 60,
    cost: 25,
    description: "8-Bit Klassiker von Commodore & Apple",
    year: 1975
  },
  {
    id: "motorola68000",
    name: "Motorola 68000",
    type: "cpu",
    performance: 85,
    cost: 180,
    description: "16-Bit Powerhouse für Amiga & Atari ST",
    year: 1979
  },
  {
    id: "zilog80",
    name: "Zilog Z80",
    type: "cpu",
    performance: 50,
    cost: 20,
    description: "Beliebter 8-Bit Prozessor",
    year: 1976
  },
  {
    id: "ram64k",
    name: "64K RAM",
    type: "memory",
    performance: 70,
    cost: 150,
    description: "Großzügiger Arbeitsspeicher für die 80er",
    year: 1980
  },
  {
    id: "floppy525",
    name: '5.25" Floppy Drive',
    type: "storage",
    performance: 40,
    cost: 80,
    description: "Standard Datenspeicher der 80er",
    year: 1978
  }
];

interface ComputerDevelopmentProps {
  onBack: () => void;
}

export const ComputerDevelopment = ({ onBack }: ComputerDevelopmentProps) => {
  const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);
  const [developmentProgress, setDevelopmentProgress] = useState(0);

  const totalCost = selectedComponents.reduce((sum, comp) => sum + comp.cost, 0);
  const averagePerformance = selectedComponents.length > 0 
    ? selectedComponents.reduce((sum, comp) => sum + comp.performance, 0) / selectedComponents.length
    : 0;

  const toggleComponent = (component: Component) => {
    setSelectedComponents(prev => {
      const exists = prev.find(c => c.id === component.id);
      if (exists) {
        return prev.filter(c => c.id !== component.id);
      } else {
        return [...prev, component];
      }
    });
  };

  const getComponentIcon = (type: Component['type']) => {
    switch (type) {
      case 'cpu': return <Cpu className="w-5 h-5" />;
      case 'memory': return <HardDrive className="w-5 h-5" />;
      case 'storage': return <HardDrive className="w-5 h-5" />;
      case 'graphics': return <Monitor className="w-5 h-5" />;
      case 'sound': return <Gamepad2 className="w-5 h-5" />;
      default: return <Cpu className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: Component['type']) => {
    switch (type) {
      case 'cpu': return 'text-neon-green';
      case 'memory': return 'text-neon-cyan';
      case 'storage': return 'text-neon-magenta';
      case 'graphics': return 'text-amber';
      case 'sound': return 'text-secondary';
      default: return 'text-primary';
    }
  };

  const startDevelopment = () => {
    if (selectedComponents.length === 0) return;
    
    // Simulate development progress
    setDevelopmentProgress(0);
    const interval = setInterval(() => {
      setDevelopmentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-crt p-6">
      <div className="crt-screen">
        <div className="scanline" />
        
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button 
              onClick={onBack}
              variant="outline" 
              className="mr-6 glow-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            
            <div>
              <h1 className="text-4xl font-bold neon-text text-neon-green">
                R&D Labor
              </h1>
              <p className="text-neon-cyan font-mono">
                Computer Development System v3.2
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Components Selection */}
            <div className="lg:col-span-2">
              <Card className="retro-border bg-card/50 backdrop-blur-sm">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-primary neon-text mb-6">
                    Verfügbare Komponenten
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {components.map((component) => {
                      const isSelected = selectedComponents.find(c => c.id === component.id);
                      
                      return (
                        <Card 
                          key={component.id}
                          className={`cursor-pointer transition-all retro-border ${
                            isSelected 
                              ? 'bg-primary/20 border-neon-green' 
                              : 'bg-card/30 hover:bg-card/50'
                          }`}
                          onClick={() => toggleComponent(component)}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className={getTypeColor(component.type)}>
                                  {getComponentIcon(component.type)}
                                </div>
                                <h3 className="font-bold text-primary">{component.name}</h3>
                              </div>
                              <Badge variant="secondary" className="font-mono text-xs">
                                {component.year}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {component.description}
                            </p>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Performance:</span>
                                <span className="text-neon-green font-mono">
                                  {component.performance}%
                                </span>
                              </div>
                              
                              <div className="flex justify-between text-sm">
                                <span>Kosten:</span>
                                <span className="text-amber font-mono">
                                  ${component.cost}
                                </span>
                              </div>
                              
                              <Progress 
                                value={component.performance} 
                                className="h-1 mt-2"
                              />
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>

            {/* Development Panel */}
            <div>
              <Card className="retro-border bg-card/50 backdrop-blur-sm">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-primary neon-text mb-6">
                    Projekt Status
                  </h2>
                  
                  {selectedComponents.length > 0 ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-neon-cyan">
                          Gewählte Komponenten:
                        </h3>
                        {selectedComponents.map((comp) => (
                          <div key={comp.id} className="flex items-center space-x-2">
                            <div className={getTypeColor(comp.type)}>
                              {getComponentIcon(comp.type)}
                            </div>
                            <span className="text-sm">{comp.name}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t border-primary/30">
                        <div className="flex justify-between">
                          <span className="flex items-center">
                            <Zap className="w-4 h-4 mr-2 text-neon-green" />
                            Performance:
                          </span>
                          <span className="font-mono text-neon-green">
                            {Math.round(averagePerformance)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-amber" />
                            Gesamtkosten:
                          </span>
                          <span className="font-mono text-amber">
                            ${totalCost}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-neon-cyan" />
                            Entwicklungszeit:
                          </span>
                          <span className="font-mono text-neon-cyan">
                            {Math.ceil(selectedComponents.length * 1.5)} Runden
                          </span>
                        </div>
                      </div>
                      
                      {developmentProgress > 0 && (
                        <div className="pt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Entwicklungsfortschritt:</span>
                            <span className="font-mono">{developmentProgress}%</span>
                          </div>
                          <Progress value={developmentProgress} className="h-2" />
                        </div>
                      )}
                      
                      <Button 
                        onClick={startDevelopment}
                        disabled={developmentProgress > 0 && developmentProgress < 100}
                        className="w-full glow-button mt-6"
                        variant="default"
                      >
                        <Cpu className="w-4 h-4 mr-2" />
                        {developmentProgress === 100 ? 'Fertig!' : 
                         developmentProgress > 0 ? 'Entwicklung läuft...' : 
                         'Entwicklung starten'}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Wähle Komponenten aus, um mit der Entwicklung zu beginnen
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Terminal Info */}
              <div className="mt-6 retro-border p-4 bg-card/30 backdrop-blur-sm">
                <p className="text-xs text-terminal-green font-mono text-center">
                  {">>> R&D_TERMINAL ACTIVE <<<"}
                </p>
                <p className="text-xs text-muted-foreground font-mono text-center mt-1">
                  PROTOTYPE_ASSEMBLY.EXE ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};