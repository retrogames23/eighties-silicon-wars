import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, DollarSign, Cpu, TrendingUp } from "lucide-react";
import { GameEndCondition } from "@/lib/game";
import { useTranslation } from "react-i18next";
import { formatters } from "@/lib/i18n";

interface GameEndProps {
  gameEndCondition: GameEndCondition;
  gameState: any;
  competitors: any[];
  onRestart: () => void;
}

export const GameEnd = ({ gameEndCondition, gameState, competitors, onRestart }: GameEndProps) => {
  const { t } = useTranslation(['game', 'common']);
  const formatCurrency = (amount: number) => formatters.currency(amount);
  
  const playerRank = gameEndCondition.finalResults?.playerRank || 0;
  const finalMarketShare = gameEndCondition.finalResults?.finalMarketShare || 0;
  const totalRevenue = gameEndCondition.finalResults?.totalRevenue || gameState.totalRevenue || 0;
  const customChipsCount = gameEndCondition.finalResults?.customChipsCount || 0;
  
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank <= 3) return 'text-gray-300';
    return 'text-orange-400';
  };
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '📊';
  };

  return (
    <div className="min-h-screen bg-gradient-crt p-6">
      <div className="crt-screen">
        <div className="scanline" />
        
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{getRankIcon(playerRank)}</div>
            <h1 className="text-4xl font-bold neon-text text-neon-green mb-4">
              {t('game:end.title')}
            </h1>
            <p className="text-xl text-neon-cyan font-mono">
              1983 - 1992: {t('game:end.subtitle')}
            </p>
          </div>

          {/* Gewinner Banner */}
          <Card className="retro-border bg-card/20 backdrop-blur-sm mb-8">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <h2 className={`text-3xl font-bold mb-4 ${getRankColor(playerRank)}`}>
                  {gameEndCondition.winner}
                </h2>
                <div className="flex justify-center items-center gap-4 flex-wrap">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {t('game:end.rank')} {playerRank}
                  </Badge>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {finalMarketShare.toFixed(1)}% {t('game:end.marketShare')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiken */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Firmenstatistiken */}
            <Card className="retro-border bg-card/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-neon-green flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  {t('game:end.performance.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('game:end.performance.finalRank')}</span>
                  <span className={`font-bold text-xl ${getRankColor(playerRank)}`}>
                    #{playerRank}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('game:end.performance.finalMarketShare')}</span>
                  <span className="font-bold text-neon-cyan">
                    {finalMarketShare.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('game:end.performance.totalRevenue')}</span>
                  <span className="font-bold text-neon-cyan">
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('game:end.performance.customChips')}</span>
                  <span className="font-bold text-purple-400">
                    {customChipsCount} {t('game:end.performance.chipsDeveloped')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('game:end.performance.computerModels')}</span>
                  <span className="font-bold text-green-400">
                    {gameState.models?.length || 0} {t('game:end.performance.models')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('game:end.performance.cashBalance')}</span>
                  <span className="font-bold text-yellow-400">
                    {formatCurrency(gameState.company.cash)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Markt-Endstand */}
            <Card className="retro-border bg-card/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-neon-green flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  {t('game:end.rankings.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Spieler einordnen */}
                  {[...competitors, { 
                    name: gameState.company.name, 
                    marketShare: finalMarketShare,
                    isPlayer: true 
                  }]
                    .sort((a, b) => b.marketShare - a.marketShare)
                    .slice(0, 5)
                    .map((company, index) => (
                      <div 
                        key={company.name} 
                        className={`flex justify-between items-center p-2 rounded ${
                          company.isPlayer ? 'bg-neon-green/10 border border-neon-green/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getRankIcon(index + 1)}</span>
                          <span className={`font-semibold ${company.isPlayer ? 'text-neon-green' : 'text-foreground'}`}>
                            {company.name}
                          </span>
                        </div>
                        <span className="font-mono">
                          {company.marketShare.toFixed(1)}%
                        </span>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custom Chips Showcase */}
          {customChipsCount > 0 && (
            <Card className="retro-border bg-card/20 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle className="text-xl text-purple-400 flex items-center gap-2">
                  <Cpu className="w-6 h-6" />
                  {t('game:end.customChips.title')} ({customChipsCount} {t('game:end.customChips.chips')})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.customChips?.map((chip: any, index: number) => (
                    <div key={chip.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-purple-400">{chip.name}</h4>
                        <Badge variant="outline">{chip.type.toUpperCase()}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {chip.description}
                      </p>
                      <div className="flex justify-between text-sm">
                        <span>{t('game:end.customChips.performance')} {chip.performance}</span>
                        <span>{t('game:end.customChips.developed')} Q{chip.developedQuarter}/{chip.developedYear}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historischer Kontext */}
          <Card className="retro-border bg-card/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-neon-cyan flex items-center gap-2">
                <Star className="w-6 h-6" />
                {t('game:end.context.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {t('game:end.context.description')}
              </p>
            </CardContent>
          </Card>

          {/* Neustart Button */}
          <div className="text-center">
            <Button 
              onClick={onRestart}
              className="glow-button text-lg px-8 py-4"
              size="lg"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              {t('game:end.playAgain')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};