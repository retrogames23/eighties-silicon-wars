import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Building2, Cpu, Users, DollarSign } from "lucide-react";
import { type Competitor, type MarketEvent } from "@/components/GameMechanics";

interface MarketTabProps {
  competitors: Competitor[];
  marketEvents: MarketEvent[];
  totalMarketSize: number;
  playerMarketShare: number;
}

export const MarketTab = ({ competitors, marketEvents, totalMarketSize, playerMarketShare }: MarketTabProps) => {
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
          <h2 className="text-3xl font-bold neon-text text-neon-green">Marktanalyse</h2>
          <p className="text-neon-cyan font-mono">Aktuelle Marktlage und Konkurrenz</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="retro-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-neon-green flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Gesamtmarkt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-neon-cyan">
                {formatCurrency(totalMarketSize)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Geschätztes Marktvolumen
              </p>
            </CardContent>
          </Card>

          <Card className="retro-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-neon-green flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Wachstum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-neon-cyan">
                +{quarterlyGrowth}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Quartalswachstum
              </p>
            </CardContent>
          </Card>

          <Card className="retro-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-neon-green flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Ø Preis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-neon-cyan">
                {formatCurrency(averagePrice)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Durchschnittspreis
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Market Share Overview */}
        <Card className="retro-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-neon-green flex items-center gap-2">
              <Users className="w-6 h-6" />
              Marktanteile
            </CardTitle>
            <CardDescription>
              Aktuelle Marktverteilung der größten Anbieter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Player market share - nur anzeigen wenn > 0.1% */}
              {playerMarketShare > 0.1 && (
                <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-neon-green" />
                    <div>
                      <div className="font-semibold text-neon-green">Deine Firma</div>
                      <div className="text-sm text-muted-foreground">
                        #{playerMarketShare > sortedCompetitors[0]?.marketShare ? 1 : 
                          sortedCompetitors.filter(c => c.marketShare > playerMarketShare).length + 1}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="font-mono">
                      {playerMarketShare.toFixed(1)}%
                    </Badge>
                    <div className="w-24">
                      <Progress value={playerMarketShare} className="h-2" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Competitors */}
              {sortedCompetitors.map((competitor, index) => {
                // Berechne tatsächliche Position unter Berücksichtigung des Spielers
                const playerRank = playerMarketShare > competitor.marketShare ? 1 : 0;
                const actualRank = index + 1 + playerRank;
                
                return (
                  <div key={competitor.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">#{actualRank}</div>
                      <div>
                        <div className={`font-semibold ${getCompanyColor(competitor.name)}`}>
                          {competitor.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {competitor.models.length} Modell{competitor.models.length !== 1 ? 'e' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="font-mono">
                        {competitor.marketShare.toFixed(1)}%
                      </Badge>
                      <div className="w-24">
                        <Progress value={competitor.marketShare} className="h-2" />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Wenn der Spieler noch keinen Marktanteil hat */}
              {playerMarketShare <= 0.1 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">
                    Du erscheinst in der Rangliste sobald du Computer verkaufst.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Market Events */}
        {marketEvents.length > 0 && (
          <Card className="retro-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-neon-green">Marktereignisse</CardTitle>
              <CardDescription>Aktuelle Entwicklungen die den Markt beeinflussen</CardDescription>
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
            <CardTitle className="text-xl text-neon-green">Konkurrenz-Analyse</CardTitle>
            <CardDescription>Detaillierte Übersicht der wichtigsten Wettbewerber</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedCompetitors.slice(0, 4).map((competitor) => (
                <div key={competitor.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className={`font-semibold ${getCompanyColor(competitor.name)}`}>
                      {competitor.name}
                    </h4>
                    <Badge variant="secondary">
                      Reputation: {competitor.reputation}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {competitor.models.map((model, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-muted-foreground">{formatCurrency(model.price)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {model.unitsSold.toLocaleString()} Einheiten verkauft
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Marktanteil:</span>
                      <span className="font-mono">{competitor.marketShare.toFixed(1)}%</span>
                    </div>
                    <Progress value={competitor.marketShare} className="h-1 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Trends */}
        <Card className="retro-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-neon-green">Markttrends</CardTitle>
            <CardDescription>Aufkommende Entwicklungen im Computer-Markt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="font-semibold text-green-400">Wachsende Segmente</span>
                </div>
                <ul className="space-y-1 text-sm">
                  <li>• Heimcomputer (+25%)</li>
                  <li>• Spiele-Software (+40%)</li>
                  <li>• Bildungsmarkt (+18%)</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="font-semibold text-red-400">Schrumpfende Segmente</span>
                </div>
                <ul className="space-y-1 text-sm">
                  <li>• Videospielkonsolen (-15%)</li>
                  <li>• Taschenrechner (-8%)</li>
                  <li>• Arcade-Automaten (-22%)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};