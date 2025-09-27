import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Cpu, 
  Users, 
  Clock,
  Lightbulb,
  Trophy,
  X
} from "lucide-react";

interface GameTutorialProps {
  onClose: () => void;
}

export const GameTutorial = ({ onClose }: GameTutorialProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="retro-border bg-card/95 backdrop-blur-sm max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-neon-green neon-text flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              Spielanleitung - Computer Tycoon
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Spielziel */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-neon-cyan flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              🎯 Spielziel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-accent/10 border-neon-green/30">
                <div className="text-center">
                  <Target className="w-8 h-8 text-neon-green mx-auto mb-2" />
                  <h4 className="font-bold text-neon-green">Marktführer werden</h4>
                  <p className="text-sm text-muted-foreground">
                    Erobere den größten Marktanteil bis 1992
                  </p>
                  <Badge className="mt-2 bg-neon-green/20 text-neon-green">
                    Hauptziel
                  </Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-accent/10 border-blue-500/30">
                <div className="text-center">
                  <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="font-bold text-blue-400">Reich werden</h4>
                  <p className="text-sm text-muted-foreground">
                    Sammle über $50M Gesamtumsatz
                  </p>
                  <Badge className="mt-2 bg-blue-500/20 text-blue-400">
                    Bonusziel
                  </Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-accent/10 border-purple-500/30">
                <div className="text-center">
                  <Cpu className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="font-bold text-purple-400">Innovator sein</h4>
                  <p className="text-sm text-muted-foreground">
                    Entwickle 5+ Custom Hardware-Chips
                  </p>
                  <Badge className="mt-2 bg-purple-500/20 text-purple-400">
                    Prestigeziel
                  </Badge>
                </div>
              </Card>
            </div>
          </div>

          {/* Grundlagen */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-neon-cyan flex items-center gap-2">
              <Clock className="w-5 h-5" />
              ⚡ Spielablauf (1983-1992)
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-accent/10 rounded">
                <div className="bg-neon-green text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-bold">Computer entwickeln</h4>
                  <p className="text-sm text-muted-foreground">
                    Wähle CPU, RAM, Grafik und ein stylisches Case. Dauert 1-2 Quartale.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-accent/10 rounded">
                <div className="bg-neon-green text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-bold">Budget verteilen</h4>
                  <p className="text-sm text-muted-foreground">
                    Marketing = mehr Verkäufe | Entwicklung = schnellere Computer | Forschung = Custom Chips
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-accent/10 rounded">
                <div className="bg-neon-green text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-bold">Quartale abschließen</h4>
                  <p className="text-sm text-muted-foreground">
                    Schaue deine Verkäufe, Marktposition und Konkurrenz-Moves an.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Erfolgsstrategien */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-neon-cyan flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              💡 Erfolgsstrategien
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-bold text-yellow-400">🎮 Gamer-Markt (75%)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Starke Grafik (VIC-II, GTIA)</li>
                  <li>• Guter Sound (SID, YM2149)</li>
                  <li>• RGB Monitor</li>
                  <li>• Stylisches Gamer-Case</li>
                  <li>• Preis unter $1200</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-blue-400">💼 Business-Markt (25%)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Schnelle CPU (68000, 80286)</li>
                  <li>• Viel RAM (256KB+)</li>
                  <li>• Festplatte oder Diskette</li>
                  <li>• Professionelles Office-Case</li>
                  <li>• Höherer Preis = mehr Vertrauen</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Budget-Tipps */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-neon-cyan flex items-center gap-2">
              <Users className="w-5 h-5" />
              💰 Budget-Management
            </h3>
            <div className="bg-accent/10 p-4 rounded space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-bold text-green-400">Marketing-Budget</h4>
                  <p className="text-muted-foreground">
                    Direkt proportional zu Verkäufen. Mehr Marketing = mehr Kunden erreichen.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-blue-400">Entwicklung Budget</h4>
                  <p className="text-muted-foreground">
                    Beschleunigt Computer-Entwicklung. 2x Budget = 2x schneller.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-purple-400">Forschung Budget</h4>
                  <p className="text-muted-foreground">
                    5% Chance pro Quartal auf Custom Chip. Mehr Budget = höhere Chance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warnung */}
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded">
            <h4 className="font-bold text-red-400 mb-2">⚠️ Achtung!</h4>
            <p className="text-sm text-muted-foreground">
              Du startest mit $5M und hast laufende Kosten von $30k/Monat. 
              Ohne Einnahmen gehst du nach ~13 Jahren bankrott. 
              Entwickle schnell profitable Computer!
            </p>
          </div>

          {/* Konkurrenz */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-neon-cyan">🏆 Deine Konkurrenz</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="text-center p-2 bg-blue-500/10 rounded">
                <div className="font-bold text-blue-400">Apple</div>
                <div className="text-muted-foreground">Premium, Business</div>
              </div>
              <div className="text-center p-2 bg-red-500/10 rounded">
                <div className="font-bold text-red-400">Commodore</div>
                <div className="text-muted-foreground">Masse, Gamer</div>
              </div>
              <div className="text-center p-2 bg-green-500/10 rounded">
                <div className="font-bold text-green-400">IBM</div>
                <div className="text-muted-foreground">Teuer, Professional</div>
              </div>
              <div className="text-center p-2 bg-yellow-500/10 rounded">
                <div className="font-bold text-yellow-400">Atari</div>
                <div className="text-muted-foreground">Günstig, Gaming</div>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button onClick={onClose} className="glow-button px-8">
              Los geht's! 🚀
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};