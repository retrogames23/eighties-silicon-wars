import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Cpu, Gamepad2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
  description: string;
  startingCash: number;
  speciality: string;
  icon: React.ReactNode;
}

const companies: Company[] = [
  {
    id: "commodore",
    name: "Commodore",
    description: "Pionier der Heimcomputer mit dem legendären C64",
    startingCash: 500000,
    speciality: "8-Bit Consumer Markets",
    icon: <Cpu className="w-8 h-8" />
  },
  {
    id: "atari",
    name: "Atari",
    description: "Von Arcade-Spielen zu Heimcomputern",
    startingCash: 450000,
    speciality: "Gaming & Graphics",
    icon: <Gamepad2 className="w-8 h-8" />
  },
  {
    id: "custom",
    name: "Eigene Firma",
    description: "Starte deine eigene Computer-Revolution",
    startingCash: 300000,
    speciality: "Innovation & Risiko",
    icon: <Building2 className="w-8 h-8" />
  }
];

interface CompanySelectionProps {
  onSelectCompany: (company: Company) => void;
}

export const CompanySelection = ({ onSelectCompany }: CompanySelectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-crt p-8">
      <div className="crt-screen">
        <div className="scanline" />
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold neon-text text-neon-green mb-4 animate-glow-pulse">
              COMPUTER WARS
            </h1>
            <h2 className="text-2xl text-neon-cyan mb-2">
              Die 80er Heimcomputer Revolution
            </h2>
            <p className="text-lg text-muted-foreground">
              Wähle deine Firma und erobere den Markt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {companies.map((company) => (
              <Card 
                key={company.id}
                className="retro-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 group cursor-pointer"
                onClick={() => onSelectCompany(company)}
              >
                <div className="p-6 text-center">
                  <div className="mb-6 text-neon-cyan group-hover:text-neon-magenta transition-colors">
                    {company.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-primary mb-2 neon-text">
                    {company.name}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    {company.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Startkapital:</span>
                      <span className="text-neon-green font-mono">
                        ${company.startingCash.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spezialisierung:</span>
                      <span className="text-accent">{company.speciality}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6 glow-button"
                    variant="default"
                  >
                    Firma auswählen
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="retro-border inline-block p-4 bg-card/30 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground mb-2">
                {">>> SYSTEM ONLINE - READY FOR INPUT <<<"}
              </p>
              <p className="text-xs text-terminal-green font-mono">
                COMPUTER_WARS.EXE v1.0 - (C) 1985 RetroSoft Industries
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};