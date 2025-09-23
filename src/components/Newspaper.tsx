import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Newspaper as NewspaperIcon, 
  TrendingUp, 
  Globe, 
  Monitor, 
  Users,
  Calendar,
  DollarSign
} from "lucide-react";
import { NewsEvent } from "@/data/NewsEvents";

interface NewspaperProps {
  isOpen: boolean;
  onClose: () => void;
  quarter: number;
  year: number;
  newsEvents: NewsEvent[];
  marketData: {
    totalMarketSize: number;
    marketGrowth: number;
    topComputers: Array<{
      name: string;
      company: string;
      unitsSold: number;
      marketShare: number;
    }>;
  };
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'tech': return Monitor;
    case 'market': return TrendingUp;
    case 'world': return Globe;
    case 'competitor': return Users;
    default: return NewspaperIcon;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'tech': return 'text-blue-400';
    case 'market': return 'text-green-400';
    case 'world': return 'text-yellow-400';
    case 'competitor': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'tech': return 'Technologie';
    case 'market': return 'Markt';
    case 'world': return 'Weltgeschehen';
    case 'competitor': return 'Konkurrenz';
    default: return 'News';
  }
};

export const Newspaper = ({ 
  isOpen, 
  onClose, 
  quarter, 
  year, 
  newsEvents, 
  marketData 
}: NewspaperProps) => {
  const formatCurrency = (amount: number) => `$${(amount / 1000000).toFixed(1)}M`;
  const formatUnits = (units: number) => {
    if (units >= 1000000) return `${(units / 1000000).toFixed(1)}M`;
    if (units >= 1000) return `${(units / 1000).toFixed(0)}k`;
    return units.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto retro-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-3xl text-neon-green font-mono flex items-center gap-3">
            <NewspaperIcon className="w-8 h-8" />
            Computer Gazette
          </DialogTitle>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Q{quarter} {year}
            </div>
            <Badge variant="outline" className="font-mono">
              Ausgabe #{(year - 1983) * 4 + quarter}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Market Overview */}
          <Card className="border-neon-blue/20">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Marktübersicht Q{quarter} {year}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Gesamtmarkt:</span>
                    <span className="font-mono text-green-400">
                      {formatCurrency(marketData.totalMarketSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wachstum:</span>
                    <Badge variant={marketData.marketGrowth > 0 ? "default" : "destructive"}>
                      {marketData.marketGrowth > 0 ? '+' : ''}{(marketData.marketGrowth * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Top Computer dieser Periode:</h4>
                  {marketData.topComputers.slice(0, 3).map((computer, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="truncate">{computer.name}</span>
                      <span className="font-mono text-xs">
                        {formatUnits(computer.unitsSold)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* News Articles */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <NewspaperIcon className="w-5 h-5" />
              Schlagzeilen
            </h3>
            
            <div className="grid gap-4">
              {newsEvents.map((event, index) => {
                const IconComponent = getCategoryIcon(event.category);
                return (
                  <Card key={event.id} className="border-l-4 border-l-neon-blue">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <IconComponent className={`w-5 h-5 mt-1 ${getCategoryColor(event.category)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(event.category)}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-neon-green mb-2">
                            {event.headline}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {event.content}
                          </p>
                          {event.impact && (
                            <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
                              <span className="font-semibold">Marktauswirkung:</span>
                              {event.impact.marketGrowth && (
                                <span className="ml-2 text-green-400">
                                  +{(event.impact.marketGrowth * 100).toFixed(0)}% Wachstum
                                </span>
                              )}
                              {event.impact.priceChange && (
                                <span className="ml-2 text-red-400">
                                  {(event.impact.priceChange * 100).toFixed(0)}% Preisdruck
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <Separator />
          <div className="text-center space-y-4">
            <p className="text-xs text-muted-foreground font-mono">
              "Die Zukunft liegt in der Mikroelektronik" - Computer Gazette, seit 1983
            </p>
            <Button 
              onClick={onClose}
              className="px-8 font-mono retro-border bg-neon-green text-black hover:bg-neon-green/80"
            >
              Zeitung schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};