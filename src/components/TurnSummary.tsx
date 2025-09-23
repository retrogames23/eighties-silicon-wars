import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, DollarSign } from "lucide-react";

interface TurnSummaryProps {
  revenue: number;
  marketShareChange: number;
  reputationChange: number;
  marketEvent?: {
    title: string;
    description: string;
    effect: string;
  };
  competitorUpdates: string[];
}

export const TurnSummary = ({
  revenue,
  marketShareChange,
  reputationChange,
  marketEvent,
  competitorUpdates
}: TurnSummaryProps) => {
  return (
    <Card className="retro-border bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-neon-green flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Quartalsübersicht
        </CardTitle>
        <CardDescription>Ergebnisse der letzten 3 Monate</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Revenue */}
        <div className="flex justify-between items-center">
          <span className="font-mono">Umsatz:</span>
          <Badge variant={revenue > 0 ? "default" : "secondary"} className="font-mono">
            ${revenue.toLocaleString()}
          </Badge>
        </div>

        {/* Market Share Change */}
        <div className="flex justify-between items-center">
          <span className="font-mono">Marktanteil:</span>
          <div className="flex items-center gap-2">
            {marketShareChange > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : marketShareChange < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-400" />
            ) : null}
            <Badge variant={marketShareChange > 0 ? "default" : marketShareChange < 0 ? "destructive" : "secondary"}>
              {marketShareChange > 0 ? '+' : ''}{marketShareChange.toFixed(1)}%
            </Badge>
          </div>
        </div>

        {/* Reputation Change */}
        <div className="flex justify-between items-center">
          <span className="font-mono">Reputation:</span>
          <div className="flex items-center gap-2">
            {reputationChange > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : reputationChange < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-400" />
            ) : null}
            <Badge variant={reputationChange > 0 ? "default" : reputationChange < 0 ? "destructive" : "secondary"}>
              {reputationChange > 0 ? '+' : ''}{reputationChange.toFixed(1)}
            </Badge>
          </div>
        </div>

        {/* Market Event */}
        {marketEvent && (
          <div className="border-t pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">{marketEvent.title}</h4>
                <p className="text-xs text-muted-foreground mb-1">{marketEvent.description}</p>
                <Badge variant="outline" className="text-xs">
                  {marketEvent.effect}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Competitor Updates */}
        {competitorUpdates.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2">Konkurrenz-Updates:</h4>
            <div className="space-y-1">
              {competitorUpdates.map((update, index) => (
                <p key={index} className="text-xs text-muted-foreground font-mono">
                  • {update}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};