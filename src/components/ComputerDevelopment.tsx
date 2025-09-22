import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  Cpu,
  HardDrive,
  MemoryStick,
  Volume2,
  Monitor,
  Disc,
  Zap
} from "lucide-react";

interface Component {
  id: string;
  name: string;
  type: 'cpu' | 'gpu' | 'memory' | 'sound' | 'storage' | 'display';
  performance: number;
  cost: number;
  description: string;
  year: number;
}

const components: Component[] = [
  // CPUs
  { id: 'cpu1', name: 'MOS 6502', type: 'cpu', performance: 15, cost: 25, description: '8-bit Prozessor, 1 MHz', year: 1975 },
  { id: 'cpu2', name: 'Zilog Z80', type: 'cpu', performance: 20, cost: 35, description: '8-bit Prozessor, 2,5 MHz', year: 1976 },
  { id: 'cpu3', name: 'Motorola 68000', type: 'cpu', performance: 45, cost: 120, description: '16/32-bit Prozessor, 8 MHz', year: 1979 },
  { id: 'cpu4', name: 'Intel 8086', type: 'cpu', performance: 35, cost: 85, description: '16-bit Prozessor, 5 MHz', year: 1978 },
  { id: 'cpu5', name: 'Intel 80286', type: 'cpu', performance: 65, cost: 200, description: '16-bit Prozessor, 12 MHz', year: 1982 },
  
  // GPUs
  { id: 'gpu1', name: 'MOS VIC', type: 'gpu', performance: 10, cost: 15, description: '160x200 Pixel, 16 Farben', year: 1977 },
  { id: 'gpu2', name: 'TI TMS9918', type: 'gpu', performance: 25, cost: 45, description: '256x192 Pixel, 16 Farben', year: 1979 },
  { id: 'gpu3', name: 'Atari GTIA', type: 'gpu', performance: 30, cost: 60, description: '320x192 Pixel, 256 Farben', year: 1979 },
  { id: 'gpu4', name: 'Commodore VIC-II', type: 'gpu', performance: 35, cost: 70, description: '320x200 Pixel, Sprites', year: 1981 },
  
  // Speicher
  { id: 'mem1', name: '4KB RAM', type: 'memory', performance: 5, cost: 20, description: '4096 Byte Arbeitsspeicher', year: 1975 },
  { id: 'mem2', name: '16KB RAM', type: 'memory', performance: 15, cost: 60, description: '16384 Byte Arbeitsspeicher', year: 1977 },
  { id: 'mem3', name: '64KB RAM', type: 'memory', performance: 35, cost: 150, description: '65536 Byte Arbeitsspeicher', year: 1980 },
  { id: 'mem4', name: '256KB RAM', type: 'memory', performance: 55, cost: 300, description: '262144 Byte Arbeitsspeicher', year: 1983 },
  
  // Sound (optional)
  { id: 'sound1', name: 'PC Speaker', type: 'sound', performance: 5, cost: 5, description: 'Einfache Pieptöne', year: 1975 },
  { id: 'sound2', name: 'AY-3-8910', type: 'sound', performance: 25, cost: 35, description: '3-Kanal Synthesizer', year: 1978 },
  { id: 'sound3', name: 'SID 6581', type: 'sound', performance: 45, cost: 80, description: '3-Kanal Synthesizer + Filter', year: 1982 },
  { id: 'sound4', name: 'Yamaha YM2149', type: 'sound', performance: 35, cost: 50, description: '3-Kanal PSG Synthesizer', year: 1983 },
  
  // Zubehör (optional)
  { id: 'storage1', name: 'Kassettenlaufwerk', type: 'storage', performance: 10, cost: 40, description: 'Datenspeicherung auf Kassette', year: 1977 },
  { id: 'storage2', name: 'Diskettenlaufwerk 5.25"', type: 'storage', performance: 35, cost: 150, description: '160KB Disketten', year: 1976 },
  { id: 'storage3', name: 'Festplatte 5MB', type: 'storage', performance: 60, cost: 1500, description: '5 Megabyte Festplatte', year: 1980 },
  { id: 'storage4', name: 'Diskettenlaufwerk 3.5"', type: 'storage', performance: 50, cost: 120, description: '720KB Disketten', year: 1982 },
  
  { id: 'display1', name: 'RF Modulator', type: 'display', performance: 15, cost: 25, description: 'Anschluss an TV-Gerät', year: 1975 },
  { id: 'display2', name: 'Composite Monitor', type: 'display', performance: 35, cost: 200, description: 'Monochrom Monitor', year: 1978 },
  { id: 'display3', name: 'RGB Monitor', type: 'display', performance: 65, cost: 500, description: 'Farb-Monitor RGB', year: 1981 },
];

interface ComputerDevelopmentProps {
  onBack: () => void;
}

export const ComputerDevelopment = ({ onBack }: ComputerDevelopmentProps) => {
  const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);
  const [developmentProgress, setDevelopmentProgress] = useState(0);

  const totalCost = selectedComponents.reduce((sum, comp) => sum + comp.cost, 0);
  const averagePerformance = selectedComponents.length > 0 
    ? Math.round(selectedComponents.reduce((sum, comp) => sum + comp.performance, 0) / selectedComponents.length)
    : 0;

  const toggleComponent = (component: Component) => {
    const isSelected = selectedComponents.some(c => c.id === component.id);
    const isSameType = selectedComponents.some(c => c.type === component.type);
    
    if (isSelected) {
      setSelectedComponents(prev => prev.filter(c => c.id !== component.id));
    } else if (isSameType && !['sound', 'storage', 'display'].includes(component.type)) {
      // Ersetze Komponente des gleichen Typs (außer optionale)
      setSelectedComponents(prev => [
        ...prev.filter(c => c.type !== component.type),
        component
      ]);
    } else if (!isSameType || ['sound', 'storage', 'display'].includes(component.type)) {
      setSelectedComponents(prev => [...prev, component]);
    }
  };

  const getComponentIcon = (type: Component['type']) => {
    switch (type) {
      case 'cpu': return Cpu;
      case 'gpu': return Monitor;
      case 'memory': return MemoryStick;
      case 'sound': return Volume2;
      case 'storage': return HardDrive;
      case 'display': return Monitor;
      default: return Zap;
    }
  };

  const getTypeColor = (type: Component['type']) => {
    switch (type) {
      case 'cpu': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'gpu': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'memory': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'sound': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'storage': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'display': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const startDevelopment = () => {
    if (selectedComponents.length === 0) return;
    
    setDevelopmentProgress(0);
    const interval = setInterval(() => {
      setDevelopmentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const canDevelop = selectedComponents.some(c => c.type === 'cpu') && 
                    selectedComponents.some(c => c.type === 'gpu') && 
                    selectedComponents.some(c => c.type === 'memory');

  return (
    <div className="min-h-screen bg-gradient-crt p-6">
      <div className="crt-screen">
        <div className="scanline" />
        
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onBack}
                variant="outline"
                className="retro-border bg-card/20 hover:bg-card/40"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zum Dashboard
              </Button>
              <h1 className="text-4xl font-bold neon-text text-neon-green">
                Computer-Entwicklung
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Komponenten-Auswahl */}
            <div className="lg:col-span-2 space-y-6">
              {['cpu', 'gpu', 'memory', 'sound', 'storage', 'display'].map(type => (
                <Card key={type} className="retro-border bg-card/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-neon-cyan flex items-center space-x-2">
                      {(() => {
                        const IconComponent = getComponentIcon(type as Component['type']);
                        return <IconComponent className="w-5 h-5" />;
                      })()}
                      <span>
                        {type === 'cpu' && 'Prozessor (CPU) *'}
                        {type === 'gpu' && 'Grafik (GPU) *'}
                        {type === 'memory' && 'Arbeitsspeicher *'}
                        {type === 'sound' && 'Soundchip (Optional)'}
                        {type === 'storage' && 'Speicher-Laufwerk (Optional)'}
                        {type === 'display' && 'Bildschirm (Optional)'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {components
                        .filter(comp => comp.type === type)
                        .map(component => {
                          const isSelected = selectedComponents.some(c => c.id === component.id);
                          const IconComponent = getComponentIcon(component.type);
                          
                          return (
                            <div
                              key={component.id}
                              onClick={() => toggleComponent(component)}
                              className={`
                                p-3 rounded-lg border cursor-pointer transition-all hover:scale-105
                                ${isSelected 
                                  ? 'border-neon-green bg-neon-green/10 shadow-lg shadow-neon-green/20' 
                                  : 'border-terminal-green/30 bg-card/10 hover:border-terminal-green/50'
                                }
                              `}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-2">
                                  <IconComponent className="w-4 h-4 text-terminal-green" />
                                  <div>
                                    <h4 className="font-semibold text-terminal-green">
                                      {component.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      {component.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge className={getTypeColor(component.type)}>
                                    {component.performance}/100
                                  </Badge>
                                  <p className="text-xs text-terminal-green mt-1">
                                    ${component.cost.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Entwicklungs-Panel */}
            <div className="space-y-6">
              <Card className="retro-border bg-card/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-neon-cyan">Computer-Konfiguration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedComponents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Wählen Sie Komponenten aus
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {selectedComponents.map(comp => (
                          <div key={comp.id} className="flex justify-between items-center text-sm">
                            <span className="text-terminal-green">{comp.name}</span>
                            <Badge className={getTypeColor(comp.type)}>
                              {comp.performance}/100
                            </Badge>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-terminal-green/30 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Durchschnittliche Leistung:</span>
                          <span className="text-neon-green font-bold">{averagePerformance}/100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Entwicklungskosten:</span>
                          <span className="text-neon-cyan font-bold">${totalCost.toLocaleString()}</span>
                        </div>
                      </div>

                      {developmentProgress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Entwicklungsfortschritt:</span>
                            <span className="text-neon-green">{developmentProgress}%</span>
                          </div>
                          <Progress value={developmentProgress} className="w-full" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Button
                          onClick={startDevelopment}
                          disabled={!canDevelop || developmentProgress > 0}
                          className="w-full glow-button"
                        >
                          {developmentProgress === 100 ? 'Entwicklung abgeschlossen!' : 
                           developmentProgress > 0 ? 'Entwicklung läuft...' : 
                           'Entwicklung starten'}
                        </Button>
                        
                        {!canDevelop && (
                          <p className="text-xs text-red-400 text-center">
                            CPU, GPU und Arbeitsspeicher sind erforderlich
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};