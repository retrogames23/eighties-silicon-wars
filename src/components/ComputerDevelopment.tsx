import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  Cpu,
  HardDrive,
  MemoryStick,
  Volume2,
  Monitor,
  Disc,
  Zap,
  Package,
  Gamepad2,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  DollarSign
} from "lucide-react";
import { TestReport } from "./TestReport";
import { TestReportGenerator } from "./TestReportGenerator";

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

// Case-Daten
const computerCases = [
  {
    id: 'beige-tower',
    name: 'Beige Tower',
    type: 'office' as const,
    quality: 65,
    design: 40,
    price: 80,
    description: 'Klassisches Business-Gehäuse in beigem Kunststoff'
  },
  {
    id: 'black-desktop',
    name: 'Black Desktop',
    type: 'office' as const,
    quality: 70,
    design: 55,
    price: 120,
    description: 'Elegantes schwarzes Desktop-Gehäuse für den Bürobereich'
  },
  {
    id: 'gamer-rgb',
    name: 'RGB Gaming Case',
    type: 'gamer' as const,
    quality: 85,
    design: 90,
    price: 200,
    description: 'Stylisches Gaming-Gehäuse mit LED-Beleuchtung'
  },
  {
    id: 'retro-wood',
    name: 'Holz-Optik Retro',
    type: 'gamer' as const,
    quality: 60,
    design: 80,
    price: 150,
    description: 'Nostalgisches Gehäuse in Holzoptik für Retro-Liebhaber'
  },
  {
    id: 'premium-metal',
    name: 'Premium Metall',
    type: 'office' as const,
    quality: 95,
    design: 85,
    price: 300,
    description: 'Hochwertiges Vollmetall-Gehäuse für professionelle Anwendungen'
  },
  {
    id: 'compact-mini',
    name: 'Compact Mini',
    type: 'office' as const,
    quality: 75,
    design: 65,
    price: 100,
    description: 'Platzsparendes Mini-Gehäuse für den Schreibtisch'
  }
];

interface ComputerModel {
  id: string;
  name: string;
  cpu: string;
  gpu: string;
  ram: string;
  sound: string;
  accessories: string[];
  case?: {
    id: string;
    name: string;
    type: 'gamer' | 'office';
    quality: number;
    design: number;
    price: number;
  };
  price: number;
  developmentCost: number;
  performance: number;
  unitsSold: number;
  status: 'development' | 'released';
  releaseQuarter: number;
  releaseYear: number;
  developmentTime: number;
  developmentProgress: number;
  complexity: number;
}

interface ComputerDevelopmentProps {
  onBack: () => void;
  onModelComplete: (model: ComputerModel) => void;
  onCaseSelection: (model: ComputerModel) => void;
}

export const ComputerDevelopment = ({ onBack, onModelComplete }: ComputerDevelopmentProps) => {
  const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [modelName, setModelName] = useState('');
  const [sellingPrice, setSellingPrice] = useState(0);
  const [currentStep, setCurrentStep] = useState<'components' | 'case' | 'name' | 'pricing' | 'testreport'>('components');
  const [developedModel, setDevelopedModel] = useState<ComputerModel | null>(null);

  const totalCost = selectedComponents.reduce((sum, comp) => sum + comp.cost, 0) + (selectedCase?.price || 0);
  const averagePerformance = selectedComponents.length > 0 
    ? Math.round(selectedComponents.reduce((sum, comp) => sum + comp.performance, 0) / selectedComponents.length)
    : 0;
    
  // Preisvorschlag berechnen (80% Aufschlag wie bisher)
  const suggestedPrice = Math.round(totalCost * 1.8);
  
  // Mindest- und Maximalpreis
  const minPrice = Math.round(totalCost * 1.1); // 10% Mindestmarge
  const maxPrice = Math.round(totalCost * 4.0); // 300% Maximalmarge
  
  // Setze Verkaufspreis automatisch auf empfohlenen Preis wenn noch nicht gesetzt
  if (sellingPrice === 0 && suggestedPrice > 0) {
    setSellingPrice(suggestedPrice);
  }

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

  const startDevelopment = () => {
    if (!modelName.trim() || !selectedCase || sellingPrice === 0) return;

    const cpu = selectedComponents.find(c => c.type === 'cpu');
    const gpu = selectedComponents.find(c => c.type === 'gpu');
    const memory = selectedComponents.find(c => c.type === 'memory');
    const sound = selectedComponents.find(c => c.type === 'sound') || { name: 'PC Speaker' };
    const accessories = selectedComponents.filter(c => ['storage', 'display'].includes(c.type));

    const complexity = Math.max(20, averagePerformance);
    const developmentTime = complexity <= 40 ? 1 : 2;

    const newModel: ComputerModel = {
      id: Date.now().toString(),
      name: modelName.trim(),
      cpu: cpu?.name || '',
      gpu: gpu?.name || '',
      ram: memory?.name || '',
      sound: sound.name,
      accessories: accessories.map(a => a.name),
      case: selectedCase,
      price: sellingPrice, // Vom User gesetzter Preis
      developmentCost: totalCost,
      performance: averagePerformance,
      unitsSold: 0,
      status: 'development',
      releaseQuarter: Math.floor(Math.random() * 4) + 1,
      releaseYear: 1985 + Math.floor(Math.random() * 5),
      complexity: complexity,
      developmentTime: developmentTime,
      developmentProgress: 0
    };

    // Zeige Testbericht vor dem finalen Abschluss
    setCurrentStep('testreport');
    setDevelopedModel(newModel);
  };

  const finalizeModel = () => {
    if (developedModel) {
      onModelComplete(developedModel);
    }
  };

  const canProceedToCase = selectedComponents.some(c => c.type === 'cpu') && 
                          selectedComponents.some(c => c.type === 'gpu') && 
                          selectedComponents.some(c => c.type === 'memory');
                          
  const canProceedToName = canProceedToCase && selectedCase;
  const canProceedToPricing = canProceedToName && modelName.trim();
  const canFinish = canProceedToPricing && sellingPrice > 0;

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

          {/* Step Progress */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded ${
                currentStep === 'components' ? 'bg-neon-green/20 text-neon-green' : 
                canProceedToCase ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-500/20 text-gray-600'
              }`}>
                <Cpu className="w-4 h-4" />
                <span className="font-mono">1. Komponenten</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center space-x-2 px-4 py-2 rounded ${
                currentStep === 'case' ? 'bg-neon-green/20 text-neon-green' : 
                selectedCase ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-500/20 text-gray-600'
              }`}>
                <Package className="w-4 h-4" />
                <span className="font-mono">2. Gehäuse</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center space-x-2 px-4 py-2 rounded ${
                currentStep === 'name' ? 'bg-neon-green/20 text-neon-green' : 
                modelName ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-500/20 text-gray-600'
              }`}>
                <Zap className="w-4 h-4" />
                <span className="font-mono">3. Name</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center space-x-2 px-4 py-2 rounded ${
                currentStep === 'pricing' ? 'bg-neon-green/20 text-neon-green' : 
                sellingPrice > 0 ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-500/20 text-gray-600'
              }`}>
                <DollarSign className="w-4 h-4" />
                <span className="font-mono">4. Preis</span>
              </div>
            </div>
          </div>

          <div className={`grid gap-6 ${currentStep === 'testreport' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
            {/* Hauptbereich */}
            <div className={currentStep === 'testreport' ? '' : 'lg:col-span-2 space-y-6'}>
              
              {/* SCHRITT 1: Komponenten-Auswahl */}
              {currentStep === 'components' && (
                <>
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
                </>
              )}

              {/* SCHRITT 2: Case-Auswahl */}
              {currentStep === 'case' && (
                <>
                  {/* Gaming Cases */}
                  <Card className="retro-border bg-card/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-neon-cyan flex items-center space-x-2">
                        <Gamepad2 className="w-5 h-5" />
                        <span>Gaming Gehäuse</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {computerCases.filter(c => c.type === 'gamer').map(computerCase => (
                          <div
                            key={computerCase.id}
                            onClick={() => setSelectedCase(computerCase)}
                            className={`
                              p-4 rounded-lg border cursor-pointer transition-all hover:scale-105
                              ${selectedCase?.id === computerCase.id 
                                ? 'border-neon-green bg-neon-green/10 shadow-lg shadow-neon-green/20' 
                                : 'border-terminal-green/30 bg-card/10 hover:border-terminal-green/50'
                              }
                            `}
                          >
                            <h4 className="font-semibold text-neon-cyan mb-2">{computerCase.name}</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Qualität:</span>
                                <span className="text-neon-green">{computerCase.quality}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Design:</span>
                                <span className="text-purple-400">{computerCase.design}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Preis:</span>
                                <span className="text-yellow-400">${computerCase.price}</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {computerCase.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Office Cases */}
                  <Card className="retro-border bg-card/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-400 flex items-center space-x-2">
                        <Briefcase className="w-5 h-5" />
                        <span>Büro Gehäuse</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {computerCases.filter(c => c.type === 'office').map(computerCase => (
                          <div
                            key={computerCase.id}
                            onClick={() => setSelectedCase(computerCase)}
                            className={`
                              p-4 rounded-lg border cursor-pointer transition-all hover:scale-105
                              ${selectedCase?.id === computerCase.id 
                                ? 'border-neon-green bg-neon-green/10 shadow-lg shadow-neon-green/20' 
                                : 'border-terminal-green/30 bg-card/10 hover:border-terminal-green/50'
                              }
                            `}
                          >
                            <h4 className="font-semibold text-gray-300 mb-2">{computerCase.name}</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Qualität:</span>
                                <span className="text-neon-green">{computerCase.quality}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Design:</span>
                                <span className="text-blue-400">{computerCase.design}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Preis:</span>
                                <span className="text-yellow-400">${computerCase.price}</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {computerCase.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* SCHRITT 3: Name eingeben */}
              {currentStep === 'name' && (
                <Card className="retro-border bg-card/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-neon-cyan">Computer benennen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Label htmlFor="model-name" className="text-muted-foreground">
                      Geben Sie Ihrem Computer einen Namen:
                    </Label>
                    <Input
                      id="model-name"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      placeholder="z.B. HomeComputer Pro 1985"
                      className="bg-background border-terminal-green/30 focus:border-terminal-green"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Die Entwicklung dauert {averagePerformance <= 40 ? '1 Quartal' : '2 Quartale'} und wird durch das Entwicklungsbudget beschleunigt.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* SCHRITT 4: Preissetzung */}
              {currentStep === 'pricing' && (
                <Card className="retro-border bg-card/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-neon-cyan flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Verkaufspreis festlegen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 border border-terminal-green/30">
                        <h4 className="font-semibold text-red-400 mb-2">Mindestpreis</h4>
                        <p className="text-2xl font-mono text-red-400">${minPrice.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">10% Marge</p>
                      </Card>
                      
                      <Card className="p-4 border border-neon-green">
                        <h4 className="font-semibold text-neon-green mb-2">Empfohlen</h4>
                        <p className="text-2xl font-mono text-neon-green">${suggestedPrice.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">80% Marge (Standard)</p>
                      </Card>
                      
                      <Card className="p-4 border border-terminal-green/30">
                        <h4 className="font-semibold text-yellow-400 mb-2">Maximaler Preis</h4>
                        <p className="text-2xl font-mono text-yellow-400">${maxPrice.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">300% Marge</p>
                      </Card>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Button 
                          onClick={() => setSellingPrice(suggestedPrice)}
                          className="glow-button"
                          variant={sellingPrice === suggestedPrice ? "default" : "outline"}
                        >
                          Empfohlenen Preis übernehmen
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="custom-price" className="text-muted-foreground">
                          Oder eigenen Preis festlegen:
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-terminal-green font-mono">$</span>
                          <Input
                            id="custom-price"
                            type="number"
                            value={sellingPrice || ''}
                            onChange={(e) => setSellingPrice(parseInt(e.target.value) || 0)}
                            placeholder={suggestedPrice.toString()}
                            className="bg-background border-terminal-green/30 focus:border-terminal-green font-mono"
                            min={minPrice}
                            max={maxPrice}
                          />
                        </div>
                        
                        {sellingPrice > 0 && (
                          <div className="mt-4 p-4 border rounded-lg">
                            <h4 className="font-semibold text-neon-cyan mb-3">Preisanalyse</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Gewinn pro Einheit:</span>
                                <p className="font-mono text-neon-green">
                                  ${(sellingPrice - totalCost).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Gewinnmarge:</span>
                                <p className="font-mono text-neon-green">
                                  {Math.round(((sellingPrice - totalCost) / totalCost) * 100)}%
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-xs text-muted-foreground">
                                {sellingPrice < minPrice && (
                                  <p className="text-red-400">⚠️ Preis unter Mindestmarge - Verlustrisiko!</p>
                                )}
                                {sellingPrice >= minPrice && sellingPrice <= suggestedPrice && (
                                  <p className="text-yellow-400">💡 Aggressiver Preis - Mehr Verkäufe, weniger Gewinn</p>
                                )}
                                {sellingPrice > suggestedPrice && sellingPrice <= maxPrice && (
                                  <p className="text-neon-green">🎯 Premium-Preis - Weniger Verkäufe, höhere Marge</p>
                                )}
                                {sellingPrice > maxPrice && (
                                  <p className="text-red-400">⚠️ Sehr hoher Preis - Verkaufsrisiko!</p>
                                 )}
                               </div>
                             </div>
                           </div>
                         )}
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               )}
               
                {/* SCHRITT 5: Testbericht */}
                {currentStep === 'testreport' && developedModel && (
                  <TestReport
                    model={developedModel}
                    testResult={TestReportGenerator.generateTestReport(developedModel, 1985)}
                    onContinue={finalizeModel}
                    onRevise={() => setCurrentStep('pricing')}
                  />
                )}
            </div>

            {/* Seitenleiste - nur wenn nicht im Testbericht */}
            {currentStep !== 'testreport' && (
              <div className="space-y-6">
                <Card className="retro-border bg-card/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-neon-cyan">Computer-Konfiguration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedComponents.length === 0 && !selectedCase ? (
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
                          
                          {selectedCase && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-terminal-green">{selectedCase.name}</span>
                              <Badge className="bg-gray-500/20 text-gray-300">
                                Case
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="border-t border-terminal-green/30 pt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Durchschnittliche Leistung:</span>
                            <span className="text-neon-green font-bold">{averagePerformance}/100</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Komplexität:</span>
                            <span className="text-neon-cyan font-bold">
                              {averagePerformance <= 40 ? 'Einfach (1 Quartal)' : 'Mittel (2 Quartale)'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Entwicklungskosten:</span>
                            <span className="text-neon-cyan font-bold">${totalCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Verkaufspreis:</span>
                            <span className="text-yellow-400 font-bold">
                              {sellingPrice > 0 ? `$${sellingPrice.toLocaleString()}` : `$${suggestedPrice.toLocaleString()} (Vorschlag)`}
                            </span>
                          </div>
                        </div>
                        
                        {/* Navigation */}
                        <div className="pt-4 space-y-2">
                          {currentStep === 'components' && (
                            <Button
                              onClick={() => setCurrentStep('case')}
                              disabled={!canProceedToCase}
                              className="w-full glow-button"
                            >
                              <ChevronRight className="w-4 h-4 mr-2" />
                              Weiter zu Gehäuse
                            </Button>
                          )}
                          
                          {currentStep === 'case' && (
                            <div className="space-y-2">
                              <Button
                                onClick={() => setCurrentStep('components')}
                                variant="outline"
                                className="w-full retro-border bg-card/20"
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Zurück zu Komponenten
                              </Button>
                              <Button
                                onClick={() => setCurrentStep('name')}
                                disabled={!selectedCase}
                                className="w-full glow-button"
                              >
                                <ChevronRight className="w-4 h-4 mr-2" />
                                Weiter zu Name
                              </Button>
                            </div>
                          )}
                          
                          {currentStep === 'name' && (
                            <div className="space-y-2">
                              <Button
                                onClick={() => setCurrentStep('case')}
                                variant="outline"
                                className="w-full retro-border bg-card/20"
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Zurück zu Gehäuse
                              </Button>
                              <Button
                                onClick={() => setCurrentStep('pricing')}
                                disabled={!canProceedToPricing}
                                className="w-full glow-button"
                              >
                                <ChevronRight className="w-4 h-4 mr-2" />
                                Weiter zu Preissetzung
                              </Button>
                            </div>
                          )}
                          
                          {currentStep === 'pricing' && (
                            <div className="space-y-2">
                              <Button
                                onClick={() => setCurrentStep('name')}
                                variant="outline"
                                className="w-full retro-border bg-card/20"
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Zurück zu Name
                              </Button>
                              <Button
                                onClick={startDevelopment}
                                disabled={!canFinish}
                                className="w-full glow-button"
                              >
                                <Zap className="w-4 h-4 mr-2" />
                                Computer testen
                              </Button>
                            </div>
                          )}
                          
                          {!canProceedToCase && currentStep === 'components' && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};