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
import { useTranslation } from "react-i18next";

interface GameTutorialProps {
  onClose: () => void;
}

export const GameTutorial = ({ onClose }: GameTutorialProps) => {
  const { t } = useTranslation(['tutorial']);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="retro-border bg-card/95 backdrop-blur-sm max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-neon-green neon-text flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              {t('tutorial:title')}
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
              {t('tutorial:goals.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-accent/10 border-neon-green/30">
                <div className="text-center">
                  <Target className="w-8 h-8 text-neon-green mx-auto mb-2" />
                  <h4 className="font-bold text-neon-green">{t('tutorial:goals.marketLeader.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('tutorial:goals.marketLeader.description')}
                  </p>
                  <Badge className="mt-2 bg-neon-green/20 text-neon-green">
                    {t('tutorial:goals.marketLeader.badge')}
                  </Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-accent/10 border-blue-500/30">
                <div className="text-center">
                  <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="font-bold text-blue-400">{t('tutorial:goals.wealthy.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('tutorial:goals.wealthy.description')}
                  </p>
                  <Badge className="mt-2 bg-blue-500/20 text-blue-400">
                    {t('tutorial:goals.wealthy.badge')}
                  </Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-accent/10 border-purple-500/30">
                <div className="text-center">
                  <Cpu className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="font-bold text-purple-400">{t('tutorial:goals.innovator.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('tutorial:goals.innovator.description')}
                  </p>
                  <Badge className="mt-2 bg-purple-500/20 text-purple-400">
                    {t('tutorial:goals.innovator.badge')}
                  </Badge>
                </div>
              </Card>
            </div>
          </div>

          {/* Grundlagen */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-neon-cyan flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t('tutorial:gameplay.title')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-accent/10 rounded">
                <div className="bg-neon-green text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-bold">{t('tutorial:gameplay.step1.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('tutorial:gameplay.step1.description')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-accent/10 rounded">
                <div className="bg-neon-green text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-bold">{t('tutorial:gameplay.step2.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('tutorial:gameplay.step2.description')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-accent/10 rounded">
                <div className="bg-neon-green text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-bold">{t('tutorial:gameplay.step3.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('tutorial:gameplay.step3.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Erfolgsstrategien */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-neon-cyan flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('tutorial:strategies.title')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-bold text-yellow-400">{t('tutorial:strategies.gamer.title')}</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {(t('tutorial:strategies.gamer.points', { returnObjects: true }) as string[]).map((point: string, i: number) => (
                    <li key={i}>• {point}</li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-blue-400">{t('tutorial:strategies.business.title')}</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {(t('tutorial:strategies.business.points', { returnObjects: true }) as string[]).map((point: string, i: number) => (
                    <li key={i}>• {point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Budget-Tipps */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-neon-cyan flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('tutorial:budget.title')}
            </h3>
            <div className="bg-accent/10 p-4 rounded space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-bold text-green-400">{t('tutorial:budget.marketing.title')}</h4>
                  <p className="text-muted-foreground">
                    {t('tutorial:budget.marketing.description')}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-blue-400">{t('tutorial:budget.development.title')}</h4>
                  <p className="text-muted-foreground">
                    {t('tutorial:budget.development.description')}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-purple-400">{t('tutorial:budget.research.title')}</h4>
                  <p className="text-muted-foreground">
                    {t('tutorial:budget.research.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warnung */}
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded">
            <h4 className="font-bold text-red-400 mb-2">{t('tutorial:warning.title')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('tutorial:warning.description')}
            </p>
          </div>

          {/* Konkurrenz */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-neon-cyan">{t('tutorial:competitors.title')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="text-center p-2 bg-blue-500/10 rounded">
                <div className="font-bold text-blue-400">{t('tutorial:competitors.apple.name')}</div>
                <div className="text-muted-foreground">{t('tutorial:competitors.apple.focus')}</div>
              </div>
              <div className="text-center p-2 bg-red-500/10 rounded">
                <div className="font-bold text-red-400">{t('tutorial:competitors.commodore.name')}</div>
                <div className="text-muted-foreground">{t('tutorial:competitors.commodore.focus')}</div>
              </div>
              <div className="text-center p-2 bg-green-500/10 rounded">
                <div className="font-bold text-green-400">{t('tutorial:competitors.ibm.name')}</div>
                <div className="text-muted-foreground">{t('tutorial:competitors.ibm.focus')}</div>
              </div>
              <div className="text-center p-2 bg-yellow-500/10 rounded">
                <div className="font-bold text-yellow-400">{t('tutorial:competitors.atari.name')}</div>
                <div className="text-muted-foreground">{t('tutorial:competitors.atari.focus')}</div>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button onClick={onClose} className="glow-button px-8">
              {t('tutorial:startButton')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};