import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GameIntroProps {
  onComplete: () => void;
}

export const GameIntro = ({ onComplete }: GameIntroProps) => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageToggle = () => {
    const newLanguage = language === 'de' ? 'en' : 'de';
    setLanguage(newLanguage);
  };
  return (
    <div className="min-h-screen bg-gradient-crt p-6 flex items-center justify-center">
      <div className="crt-screen">
        <div className="scanline" />
        
        <div className="flex items-center justify-center">
          <Card className="w-96 bg-card/95 backdrop-blur-sm border-2 border-primary/50 shadow-2xl">
            <div className="p-8 text-center space-y-4">
              {/* Language Selection Button */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLanguageToggle}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {language === 'de' ? t('intro.switchToEnglish') : t('intro.switchToGerman')}
                </Button>
              </div>

              {/* Titel */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold neon-text text-primary font-mono mb-2">
                  {t('intro.title')}
                </h1>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
              </div>

              {/* Stimmungsvoller Intro-Text */}
              <div className="space-y-3 text-sm text-muted-foreground font-mono leading-relaxed">
                <p className="text-accent">
                  {t('intro.description')}
                </p>
              </div>

              {/* Terminal-Style Eingabeaufforderung */}
              <div className="mt-8 p-3 bg-black/80 rounded border border-primary/30 font-mono text-xs">
                <div className="text-terminal-green">
                  {t('intro.prompt')}
                </div>
                <div className="text-terminal-green opacity-75 animate-pulse">
                  _
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-4">
                <Button 
                  onClick={onComplete}
                  className="glow-button w-full bg-primary hover:bg-primary/80 text-primary-foreground font-mono"
                  variant="default"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  {t('intro.button')}
                </Button>
              </div>

              {/* Copyright Footer */}
              <div className="pt-4 text-xs text-muted-foreground/70 font-mono">
                © 1983 RETRO GAMES CORP.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};