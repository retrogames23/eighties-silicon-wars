import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Zap, Cpu, Monitor, ChevronRight } from "lucide-react";

interface CompanySetupProps {
  onSetupComplete: (setup: CompanySetupData) => void;
}

export interface CompanySetupData {
  name: string;
  logo: string;
}

const logos = [
  { id: 'building', icon: Building2, name: 'Corporate' },
  { id: 'cpu', icon: Cpu, name: 'Tech' },
  { id: 'monitor', icon: Monitor, name: 'Computer' },
  { id: 'zap', icon: Zap, name: 'Innovation' },
];

export const CompanySetup = ({ onSetupComplete }: CompanySetupProps) => {
  const [companyName, setCompanyName] = useState("");
  const [selectedLogo, setSelectedLogo] = useState("cpu");

  const handleSubmit = () => {
    if (companyName.trim()) {
      onSetupComplete({
        name: companyName.trim(),
        logo: selectedLogo
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-crt p-6 flex items-center justify-center">
      <div className="crt-screen">
        <div className="scanline" />
        
        <Card className="retro-border bg-card/80 backdrop-blur-sm p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold neon-text text-neon-green mb-4">
              FIRMEN-SETUP
            </h1>
            <p className="text-neon-cyan font-mono">
              Gründe dein Heimcomputer-Imperium
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <Label htmlFor="company-name" className="text-lg font-semibold text-primary mb-4 block">
                Firmenname
              </Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="z.B. MegaTech Systems"
                className="text-lg p-4 retro-border bg-background/50"
              />
            </div>

            <div>
              <Label className="text-lg font-semibold text-primary mb-4 block">
                Logo auswählen
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {logos.map((logo) => {
                  const IconComponent = logo.icon;
                  return (
                    <Card
                      key={logo.id}
                      className={`retro-border p-6 cursor-pointer transition-all hover:bg-card/70 ${
                        selectedLogo === logo.id 
                          ? 'bg-primary/20 border-neon-green shadow-lg' 
                          : 'bg-card/50'
                      }`}
                      onClick={() => setSelectedLogo(logo.id)}
                    >
                      <div className="text-center">
                        <IconComponent 
                          className={`w-12 h-12 mx-auto mb-2 ${
                            selectedLogo === logo.id ? 'text-neon-green' : 'text-muted-foreground'
                          }`} 
                        />
                        <p className="text-sm font-mono">{logo.name}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="text-center pt-6">
              <Button
                onClick={handleSubmit}
                disabled={!companyName.trim()}
                className="glow-button px-8 py-4 text-lg"
                size="lg"
              >
                <ChevronRight className="w-5 h-5 mr-2" />
                Firma gründen
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};