import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, DollarSign } from "lucide-react";

interface ComputerCase {
  id: string;
  name: string;
  type: 'gamer' | 'office';
  quality: number; // 1-100
  design: number; // 1-100  
  price: number;
  description: string;
  pixelArt: string; // CSS for pixel art representation
}

const computerCases: ComputerCase[] = [
  // Gamer Cases
  {
    id: 'gamer-basic',
    name: 'Standard Tower',
    type: 'gamer',
    quality: 40,
    design: 30,
    price: 50,
    description: 'Einfacher beiger Kasten',
    pixelArt: 'bg-gradient-to-b from-yellow-100 to-yellow-200 border-2 border-yellow-600'
  },
  {
    id: 'gamer-colorful',
    name: 'Color Tower',
    type: 'gamer', 
    quality: 55,
    design: 70,
    price: 120,
    description: 'Bunte Plastik-Front mit LED-Akzenten',
    pixelArt: 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 border-2 border-blue-800 shadow-lg shadow-blue-500/50'
  },
  {
    id: 'gamer-premium',
    name: 'Neon Master',
    type: 'gamer',
    quality: 75,
    design: 95,
    price: 280,
    description: 'Schwarzes Gehäuse mit Neon-Streifen',
    pixelArt: 'bg-gradient-to-b from-gray-900 to-black border-2 border-cyan-400 shadow-lg shadow-cyan-400/70'
  },
  {
    id: 'gamer-ultimate',
    name: 'Crystal Beast',
    type: 'gamer',
    quality: 90,
    design: 100,
    price: 450,
    description: 'Durchsichtiges Gehäuse mit RGB-Beleuchtung',
    pixelArt: 'bg-gradient-to-br from-purple-900/30 via-blue-800/40 to-pink-900/30 border-4 border-rainbow shadow-2xl shadow-rainbow/80'
  },

  // Office Cases  
  {
    id: 'office-basic',
    name: 'Economy Box',
    type: 'office',
    quality: 35,
    design: 20,
    price: 30,
    description: 'Günstigstes graues Gehäuse',
    pixelArt: 'bg-gradient-to-b from-gray-300 to-gray-400 border-2 border-gray-600'
  },
  {
    id: 'office-standard',
    name: 'Professional',
    type: 'office',
    quality: 60,
    design: 35,
    price: 80,
    description: 'Solides graues Metallgehäuse',
    pixelArt: 'bg-gradient-to-b from-gray-400 to-gray-500 border-2 border-gray-700 shadow-md'
  },
  {
    id: 'office-premium',
    name: 'Corporate Elite',
    type: 'office', 
    quality: 85,
    design: 50,
    price: 180,
    description: 'Hochwertiges Gehäuse mit Edelstahl',
    pixelArt: 'bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 border-2 border-gray-800 shadow-xl'
  },
  {
    id: 'office-ultimate',
    name: 'Executive Tower',
    type: 'office',
    quality: 95,
    design: 65,
    price: 320,
    description: 'Premium Aluminium-Gehäuse',
    pixelArt: 'bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 border-3 border-gray-900 shadow-2xl'
  }
];

interface CaseSelectionProps {
  onBack: () => void;
  onCaseSelected: (computerCase: ComputerCase) => void;
  computerSpecs?: any;
}

export const CaseSelection = ({ onBack, onCaseSelected, computerSpecs }: CaseSelectionProps) => {
  const [selectedCase, setSelectedCase] = useState<ComputerCase | null>(null);

  const handleCaseSelect = (computerCase: ComputerCase) => {
    setSelectedCase(computerCase);
  };

  const confirmSelection = () => {
    if (selectedCase) {
      onCaseSelected(selectedCase);
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return 'text-neon-green';
    if (quality >= 60) return 'text-neon-cyan';
    if (quality >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getDesignColor = (design: number) => {
    if (design >= 80) return 'text-purple-400';
    if (design >= 60) return 'text-blue-400';
    if (design >= 40) return 'text-green-400';
    return 'text-gray-400';
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
                Zurück
              </Button>
              <h1 className="text-4xl font-bold neon-text text-neon-green">
                Case Auswahl
              </h1>
            </div>
          </div>

          {computerSpecs && (
            <Card className="retro-border bg-card/20 backdrop-blur-sm mb-6">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Wählen Sie ein Gehäuse für: <span className="text-neon-cyan font-bold">{computerSpecs.name}</span>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Gamer Cases */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neon-cyan mb-4 flex items-center">
              <Star className="w-6 h-6 mr-2" />
              Gaming Gehäuse
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {computerCases.filter(c => c.type === 'gamer').map(computerCase => (
                <Card
                  key={computerCase.id}
                  className={`retro-border cursor-pointer transition-all hover:scale-105 ${
                    selectedCase?.id === computerCase.id 
                      ? 'border-neon-green bg-neon-green/10 shadow-lg shadow-neon-green/20' 
                      : 'bg-card/20 hover:bg-card/40'
                  }`}
                  onClick={() => handleCaseSelect(computerCase)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-neon-cyan">{computerCase.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Pixel Art Case */}
                    <div className="flex justify-center">
                      <div 
                        className={`w-20 h-24 ${computerCase.pixelArt} rounded-sm relative`}
                        style={{
                          imageRendering: 'pixelated',
                          filter: 'contrast(1.2) saturate(1.1)'
                        }}
                      >
                        {/* Front Panel Details */}
                        <div className="absolute top-2 left-2 w-1 h-1 bg-red-500 rounded-full opacity-80"></div>
                        <div className="absolute top-4 left-2 w-1 h-1 bg-green-500 rounded-full opacity-80"></div>
                        <div className="absolute bottom-3 left-1 right-1 h-1 bg-black/30 rounded-sm"></div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Qualität:</span>
                        <span className={`font-bold ${getQualityColor(computerCase.quality)}`}>
                          {computerCase.quality}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Design:</span>
                        <span className={`font-bold ${getDesignColor(computerCase.design)}`}>
                          {computerCase.design}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preis:</span>
                        <span className="font-bold text-yellow-400">
                          ${computerCase.price}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {computerCase.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        Design wichtig
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Office Cases */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-400 mb-4 flex items-center">
              <DollarSign className="w-6 h-6 mr-2" />
              Büro Gehäuse
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {computerCases.filter(c => c.type === 'office').map(computerCase => (
                <Card
                  key={computerCase.id}
                  className={`retro-border cursor-pointer transition-all hover:scale-105 ${
                    selectedCase?.id === computerCase.id 
                      ? 'border-neon-green bg-neon-green/10 shadow-lg shadow-neon-green/20' 
                      : 'bg-card/20 hover:bg-card/40'
                  }`}
                  onClick={() => handleCaseSelect(computerCase)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-300">{computerCase.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Pixel Art Case */}
                    <div className="flex justify-center">
                      <div 
                        className={`w-20 h-24 ${computerCase.pixelArt} rounded-sm relative`}
                        style={{
                          imageRendering: 'pixelated',
                          filter: 'contrast(1.1)'
                        }}
                      >
                        {/* Front Panel Details */}
                        <div className="absolute top-2 left-2 w-1 h-1 bg-red-600 rounded-full opacity-60"></div>
                        <div className="absolute top-4 left-2 w-1 h-1 bg-green-600 rounded-full opacity-60"></div>
                        <div className="absolute bottom-3 left-1 right-1 h-1 bg-black/20 rounded-sm"></div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Qualität:</span>
                        <span className={`font-bold ${getQualityColor(computerCase.quality)}`}>
                          {computerCase.quality}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Design:</span>
                        <span className={`font-bold ${getDesignColor(computerCase.design)}`}>
                          {computerCase.design}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preis:</span>
                        <span className="font-bold text-yellow-400">
                          ${computerCase.price}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {computerCase.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        Qualität wichtig
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Confirmation */}
          {selectedCase && (
            <Card className="retro-border bg-card/20 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-neon-green">
                      {selectedCase.name} ausgewählt
                    </h3>
                    <p className="text-muted-foreground">
                      Qualität: {selectedCase.quality}/100 | Design: {selectedCase.design}/100 | Preis: ${selectedCase.price}
                    </p>
                  </div>
                  <Button
                    onClick={confirmSelection}
                    className="glow-button"
                  >
                    Case bestätigen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};