import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Monitor, Users, DollarSign } from "lucide-react";

interface CompetitorModel {
  name: string;
  company: string;
  price: number;
  unitsSold: number;
  marketShare: number;
  releaseYear: number;
  cpu: string;
  ram: string;
}

interface MarketData {
  totalMarketSize: number;
  quarterlyGrowth: number;
  competitors: CompetitorModel[];
}

export const MarketTab = () => {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  const marketData: MarketData = {
    totalMarketSize: 2500000,
    quarterlyGrowth: 12.5,
    competitors: [
      {
        name: "Commodore 64",
        company: "Commodore",
        price: 595,
        unitsSold: 890000,
        marketShare: 35.6,
        releaseYear: 1982,
        cpu: "MOS 6510",
        ram: "64KB"
      },
      {
        name: "Atari 800XL",
        company: "Atari",
        price: 899,
        unitsSold: 425000,
        marketShare: 17.0,
        releaseYear: 1983,
        cpu: "MOS 6502C",
        ram: "64KB"
      },
      {
        name: "Apple IIc",
        company: "Apple",
        price: 1295,
        unitsSold: 350000,
        marketShare: 14.0,
        releaseYear: 1984,
        cpu: "65C02",
        ram: "128KB"
      },
      {
        name: "Amstrad CPC 464",
        company: "Amstrad",
        price: 399,
        unitsSold: 275000,
        marketShare: 11.0,
        releaseYear: 1984,
        cpu: "Z80A",
        ram: "64KB"
      },
      {
        name: "MSX",
        company: "Various",
        price: 699,
        unitsSold: 185000,
        marketShare: 7.4,
        releaseYear: 1983,
        cpu: "Z80A",
        ram: "8KB-64KB"
      },
      {
        name: "IBM PCjr",
        company: "IBM",
        price: 1269,
        unitsSold: 125000,
        marketShare: 5.0,
        releaseYear: 1984,
        cpu: "8088",
        ram: "64KB"
      }
    ]
  };

  const getCompanyColor = (company: string) => {
    switch (company.toLowerCase()) {
      case 'commodore': return 'text-neon-cyan';
      case 'atari': return 'text-neon-magenta';
      case 'apple': return 'text-amber';
      case 'amstrad': return 'text-neon-green';
      case 'ibm': return 'text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Marktübersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Marktgröße</p>
              <p className="text-2xl font-bold text-neon-green neon-text font-mono">
                {(marketData.totalMarketSize / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground">Einheiten</p>
            </div>
            <Users className="w-6 h-6 text-neon-green" />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Marktwachstum</p>
              <p className="text-2xl font-bold text-neon-cyan neon-text font-mono flex items-center">
                +{marketData.quarterlyGrowth}%
                <TrendingUp className="w-4 h-4 ml-1" />
              </p>
              <p className="text-xs text-muted-foreground">pro Quartal</p>
            </div>
            <TrendingUp className="w-6 h-6 text-neon-cyan" />
          </div>
        </Card>

        <Card className="retro-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Durchschnittspreis</p>
              <p className="text-2xl font-bold text-amber neon-text font-mono">
                {formatCurrency(
                  marketData.competitors.reduce((sum, comp) => sum + comp.price, 0) / marketData.competitors.length
                )}
              </p>
            </div>
            <DollarSign className="w-6 h-6 text-amber" />
          </div>
        </Card>
      </div>

      {/* Marktanteile */}
      <Card className="retro-border bg-card/50 backdrop-blur-sm p-6">
        <h3 className="text-xl font-bold text-primary neon-text mb-4 flex items-center">
          <Monitor className="w-5 h-5 mr-2" />
          Marktanteile der Konkurrenten
        </h3>
        
        <div className="space-y-4">
          {marketData.competitors
            .sort((a, b) => b.marketShare - a.marketShare)
            .map((competitor, index) => (
              <div key={competitor.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-semibold text-primary">{competitor.name}</p>
                      <p className={`text-sm font-mono ${getCompanyColor(competitor.company)}`}>
                        {competitor.company}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neon-green neon-text font-mono">
                      {competitor.marketShare}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {competitor.unitsSold.toLocaleString()} Einheiten
                    </p>
                  </div>
                </div>
                <Progress value={competitor.marketShare} className="h-2" />
              </div>
            ))}
        </div>
      </Card>

      {/* Detaillierte Konkurrenzanalyse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {marketData.competitors.map((competitor) => (
          <Card key={competitor.name} className="retro-border bg-card/50 backdrop-blur-sm p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-primary neon-text">{competitor.name}</h4>
                <p className={`text-sm font-mono ${getCompanyColor(competitor.company)}`}>
                  {competitor.company} • {competitor.releaseYear}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {competitor.marketShare}%
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <p className="text-muted-foreground">CPU</p>
                <p className="font-mono text-neon-cyan">{competitor.cpu}</p>
              </div>
              <div>
                <p className="text-muted-foreground">RAM</p>
                <p className="font-mono text-neon-cyan">{competitor.ram}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Preis</p>
                <p className="font-mono text-amber">{formatCurrency(competitor.price)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Verkäufe</p>
                <p className="font-mono text-neon-green">
                  {(competitor.unitsSold / 1000).toFixed(0)}K
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Marktposition</span>
                <span className="font-mono">{competitor.marketShare}%</span>
              </div>
              <Progress value={competitor.marketShare} className="h-1" />
            </div>
          </Card>
        ))}
      </div>

      {/* Markttrends */}
      <Card className="retro-border bg-card/50 backdrop-blur-sm p-6">
        <h3 className="text-xl font-bold text-primary neon-text mb-4">Markttrends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-neon-green mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Wachsende Segmente
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>16-Bit Systeme</span>
                <span className="text-neon-green font-mono">+23%</span>
              </li>
              <li className="flex justify-between">
                <span>Gaming-orientierte Computer</span>
                <span className="text-neon-green font-mono">+18%</span>
              </li>
              <li className="flex justify-between">
                <span>Farbmonitore</span>
                <span className="text-neon-green font-mono">+31%</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-400 mb-2 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              Schrumpfende Segmente
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>8-Bit nur-Text Systeme</span>
                <span className="text-red-400 font-mono">-15%</span>
              </li>
              <li className="flex justify-between">
                <span>Kassettenlaufwerke</span>
                <span className="text-red-400 font-mono">-28%</span>
              </li>
              <li className="flex justify-between">
                <span>Monochrome Displays</span>
                <span className="text-red-400 font-mono">-12%</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};