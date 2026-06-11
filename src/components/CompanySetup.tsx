import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Zap, Cpu, Monitor, ChevronRight, Sprout, Briefcase, Skull } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { DIFFICULTY_PROFILES, DEFAULT_DIFFICULTY, type DifficultyId } from "@/lib/game/Difficulty";

interface CompanySetupProps {
  onSetupComplete: (setup: CompanySetupData) => void;
}

export interface CompanySetupData {
  name: string;
  logo: string;
  difficulty: DifficultyId;
}

export const CompanySetup = ({ onSetupComplete }: CompanySetupProps) => {
  const { toast } = useToast();
  const { t } = useTranslation(['company', 'toast', 'common']);
  const [companyName, setCompanyName] = useState("");
  const [selectedLogo, setSelectedLogo] = useState("cpu");
  const [difficulty, setDifficulty] = useState<DifficultyId>(DEFAULT_DIFFICULTY);

  const logos = [
    { id: 'building', icon: Building2, name: t('company:logo.corporate') },
    { id: 'cpu', icon: Cpu, name: t('company:logo.cpu') },
    { id: 'monitor', icon: Monitor, name: t('company:logo.computer') },
    { id: 'zap', icon: Zap, name: t('company:logo.innovation') },
  ];

  const difficultyCards: Array<{ id: DifficultyId; icon: typeof Sprout; accent: string }> = [
    { id: 'easy',   icon: Sprout,    accent: 'text-neon-green'  },
    { id: 'normal', icon: Briefcase, accent: 'text-neon-cyan'   },
    { id: 'hard',   icon: Skull,     accent: 'text-destructive' },
  ];

  const handleSubmit = () => {
    if (companyName.trim()) {
      onSetupComplete({
        name: companyName.trim(),
        logo: selectedLogo,
        difficulty,
      });
    } else {
      toast({
        title: t('common:error'),
        description: t('toast:auth.missingFields'),
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-crt p-6 flex items-center justify-center">
      <div className="crt-screen">
        <div className="scanline" />

        <Card className="retro-border bg-card/80 backdrop-blur-sm p-8 max-w-3xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold neon-text text-neon-green mb-4">
              {t('company:title')}
            </h1>
            <p className="text-neon-cyan font-mono">
              {t('company:subtitle')}
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <Label htmlFor="company-name" className="text-lg font-semibold text-primary mb-4 block">
                {t('company:nameLabel')}
              </Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t('company:namePlaceholder')}
                className="text-lg p-4 retro-border bg-background/50"
              />
            </div>

            <div>
              <Label className="text-lg font-semibold text-primary mb-4 block">
                {t('company:logoLabel')}
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
                          className={`w-12 h-12 mx-auto ${
                            selectedLogo === logo.id ? 'text-neon-green' : 'text-muted-foreground'
                          }`}
                          aria-label={logo.name}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-lg font-semibold text-primary mb-4 block">
                {t('company:difficulty.label')}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {difficultyCards.map(({ id, icon: Icon, accent }) => {
                  const profile = DIFFICULTY_PROFILES[id];
                  const selected = difficulty === id;
                  return (
                    <Card
                      key={id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected}
                      onClick={() => setDifficulty(id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDifficulty(id); }}
                      className={`retro-border p-5 cursor-pointer transition-all hover:bg-card/70 ${
                        selected ? 'bg-primary/20 border-neon-green shadow-lg' : 'bg-card/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className={`w-8 h-8 ${selected ? 'text-neon-green' : accent}`} />
                        <div className="font-bold text-lg">
                          {t(`company:difficulty.${id}.label`)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {t(`company:difficulty.${id}.tagline`)}
                      </p>
                      <ul className="text-xs space-y-1 font-mono text-muted-foreground">
                        <li>{t('company:difficulty.startingCash')}: ${profile.startingCash.toLocaleString('en-US')}</li>
                        <li>
                          {t('company:difficulty.aiPressure')}:{' '}
                          {profile.aiPressureCeiling === 0
                            ? t('company:difficulty.aiPressureNone')
                            : `${Math.round(profile.aiPressureCeiling * 100)}%`}
                        </li>
                        <li>
                          {t('company:difficulty.bankruptcy')}:{' '}
                          {profile.bankruptcyMode === 'emergency_loan_then_game_over'
                            ? t('company:difficulty.bankruptcyLoan')
                            : t('company:difficulty.bankruptcyOver')}
                        </li>
                      </ul>
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
                {t('company:submit')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
