import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Building2, Cpu, Users, DollarSign } from "lucide-react";
import { type Competitor, type MarketEvent } from "@/lib/game";

interface MarketTabProps {
  competitors: Competitor[];
  marketEvents: MarketEvent[];
  totalMarketSize: number;
  playerMarketShare: number;
}

export const MarketTab = ({ competitors, marketEvents, totalMarketSize, playerMarketShare }: MarketTabProps) => {
  const { t } = useTranslation(['economy', 'common']);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCompanyColor = (companyName: string) => {
    switch (companyName) {
      case 'Apple Computer': return 'text-blue-400';
      case 'Commodore': return 'text-red-400';
      case 'IBM': return 'text-green-400';
      case 'Atari': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  // Calculate market data
  const averagePrice = competitors.length > 0 ? competitors.reduce((sum, comp) => {
    const compPrice = comp.models.length > 0 ? comp.models.reduce((compSum, model) => compSum + model.price, 0) / comp.models.length : 0;
    return sum + compPrice;
  }, 0) / competitors.length : 1000;

  const quarterlyGrowth = 8.5; // Fixed for now, could be dynamic
  
  // Sort competitors by market share
  const sortedCompetitors = [...competitors].sort((a, b) => b.marketShare - a.marketShare);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold neon-text text-neon-green">{t('economy:market.marketAnalysis')}</h2>
          <p className="text-neon-cyan font-mono">{t('economy:market.currentMarketSituation')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="retro-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-neon-green flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {t('economy:market.totalMarket')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-neon-cyan">
                {formatCurrency(totalMarketSize)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t('economy:market.estimatedMarketVolume')}
              </p>
            </CardContent>
          </Card>

          <Card className="retro-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-neon-green flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t('economy:market.growth')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-neon-cyan">
                +{quarterlyGrowth}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t('economy:market.quarterlyGrowth')}
              </p>
            </CardContent>
          </Card>

          <Card className="retro-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-neon-green flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                {t('economy:market.avgPrice')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-neon-cyan">
                {formatCurrency(averagePrice)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t('economy:market.averagePrice')}
              </p>
            </CardContent>
          </Card>
        </div>


        {/* Market Events */}
        {marketEvents.length > 0 && (
          <Card className="retro-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-neon-green">{t('economy:market.marketEvents')}</CardTitle>
              <CardDescription>{t('economy:market.marketEventsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketEvents.slice(-3).map((event, index) => (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-neon-cyan">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    <Badge variant="outline" className="mt-2">
                      {event.effect}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Competitor Analysis */}
        <Card className="retro-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-neon-green">{t('economy:market.competitorAnalysis')}</CardTitle>
            <CardDescription>{t('economy:market.competitorAnalysisDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sortedCompetitors.slice(0, 4).map((competitor) => (
                <div key={competitor.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className={`font-semibold text-lg ${getCompanyColor(competitor.name)}`}>
                        {competitor.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {competitor.models.length} {t('economy:market.activeModels', { count: competitor.models.length })}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2">
                        {t('economy:market.reputation')}: {competitor.reputation}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {t('economy:market.marketShare')}: <span className="font-mono text-neon-cyan">{competitor.marketShare.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Modell-Details */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-neon-cyan">{t('economy:market.currentModels')}:</h5>
                    {competitor.models.slice(0, 3).map((model, idx) => (
                      <div key={idx} className="bg-card/20 p-3 rounded border border-terminal-green/20">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h6 className="font-medium text-terminal-green">{model.name}</h6>
                            <p className="text-xs text-muted-foreground">
                              {t('economy:market.released')}: Q{model.releaseQuarter} {model.releaseYear}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold font-mono text-yellow-400">
                              {formatCurrency(model.price)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {t('economy:market.performance')}: {model.performance}/100
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{t('economy:market.sold')}:</span>
                          <span className="font-mono text-neon-green">
                            {model.unitsSold.toLocaleString()} {t('economy:market.units')}
                          </span>
                        </div>
                        
                        {/* Preis-Leistungs-Verhältnis */}
                        <div className="mt-2 pt-2 border-t border-terminal-green/20">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{t('economy:market.pricePerformance')}:</span>
                            <span className={`font-mono ${
                              (model.price / model.performance) < 50 ? 'text-green-400' :
                              (model.price / model.performance) < 100 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              ${Math.round(model.price / model.performance)}/{t('economy:market.point')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Marktposition */}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm mb-2">
                      <span>{t('economy:market.marketShare')}:</span>
                      <span className="font-mono">{competitor.marketShare.toFixed(1)}%</span>
                    </div>
                    <Progress value={competitor.marketShare} className="h-1" />
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span>{t('economy:market.averagePrice')}: </span>
                      <span className="text-neon-cyan font-mono">
                        {formatCurrency(
                          competitor.models.length > 0 
                            ? competitor.models.reduce((sum, m) => sum + m.price, 0) / competitor.models.length 
                            : 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Trends & Price Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Trends */}
          <Card className="retro-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-neon-green">{t('economy:market.marketTrends')}</CardTitle>
              <CardDescription>{t('economy:market.marketTrendsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">{t('economy:market.growingSegments')}</span>
                  </div>
                  <ul className="space-y-1 text-sm">
                    <li>• {t('economy:market.homeComputers')} (+25%)</li>
                    <li>• {t('economy:market.gamingSoftwareLicenses')} (+40%)</li>
                    <li>• {t('economy:market.educationMarket')} (+18%)</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-red-400">{t('economy:market.shrinkingSegments')}</span>
                  </div>
                  <ul className="space-y-1 text-sm">
                    <li>• {t('economy:market.videoGameConsoles')} (-15%)</li>
                    <li>• {t('economy:market.calculators')} (-8%)</li>
                    <li>• {t('economy:market.arcadeMachines')} (-22%)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Price Analysis */}
          <Card className="retro-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-neon-green">{t('economy:market.priceAnalysis')}</CardTitle>
              <CardDescription>{t('economy:market.priceAnalysisDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-neon-cyan mb-2">{t('economy:market.budgetSegment')}</h4>
                  <p className="text-2xl font-mono text-green-400">$300 - $800</p>
                  <p className="text-xs text-muted-foreground">
                    {t('economy:market.budgetSegmentDescription')}
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-neon-cyan mb-2">{t('economy:market.midrange')}</h4>
                  <p className="text-2xl font-mono text-yellow-400">$800 - $2,500</p>
                  <p className="text-xs text-muted-foreground">
                    {t('economy:market.midrangeDescription')}
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-neon-cyan mb-2">{t('economy:market.premiumWorkstation')}</h4>
                  <p className="text-2xl font-mono text-red-400">$2,500+</p>
                  <p className="text-xs text-muted-foreground">
                    {t('economy:market.premiumWorkstationDescription')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
