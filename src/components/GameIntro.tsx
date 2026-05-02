import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { IntroFooter } from "./IntroFooter";

interface GameIntroProps {
  onComplete: () => void;
}

export const GameIntro = ({ onComplete }: GameIntroProps) => {
  const { t } = useTranslation(['game']);

  return (
    <div className="min-h-screen bg-gradient-crt p-6 flex flex-col items-center justify-center">
      <div className="crt-screen">
        <div className="scanline" />
        
        <div className="flex items-center justify-center w-full">
          <Card className="w-full max-w-md lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl bg-card/95 backdrop-blur-sm border-2 border-primary/50 shadow-2xl">
            <div className="p-8 lg:p-12 space-y-6">
              {/* Language Switcher */}
              <div className="flex justify-end">
                <LanguageSwitcher variant="toggle" size="sm" />
              </div>

              {/* Titel */}
              <div className="text-center">
                <h1 className="text-2xl lg:text-4xl xl:text-5xl font-bold neon-text text-primary font-mono mb-3">
                  {t('game:intro.title')}
                </h1>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
              </div>

              {/* Hauptbereich: einspaltig auf mobile, zweispaltig ab lg */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Stimmungsvoller Intro-Text */}
                <div className="space-y-4 text-sm lg:text-base text-muted-foreground font-mono leading-relaxed text-center lg:text-left">
                  <p className="text-accent">
                    {t('game:intro.description')}
                  </p>
                  <p className="text-accent">
                    {t('game:intro.question')}
                  </p>
                </div>

                {/* Terminal + Start-Button */}
                <div className="space-y-4">
                  <div className="p-4 bg-black/80 rounded border border-primary/30 font-mono text-xs lg:text-sm">
                    <div className="text-terminal-green">
                      {t('game:intro.prompt')}
                    </div>
                    <div className="text-terminal-green opacity-75 animate-pulse">
                      _
                    </div>
                  </div>

                  <Button
                    onClick={onComplete}
                    className="glow-button w-full bg-primary hover:bg-primary/80 text-primary-foreground font-mono lg:text-base lg:py-6"
                    variant="default"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    {t('game:intro.button')}
                  </Button>
                </div>
              </div>

              {/* Copyright Footer */}
              <div className="pt-2 text-center text-xs text-muted-foreground/70 font-mono">
                © 1983 RETRO GAMES CORP.
              </div>
            </div>
          </Card>
        </div>
      </div>
      <IntroFooter />
    </div>
  );
};