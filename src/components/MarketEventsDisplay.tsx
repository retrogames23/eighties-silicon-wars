import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Info, 
  Clock, 
  Zap,
  DollarSign,
  Eye,
  EyeOff
} from "lucide-react";
import { MarketEventsService, type ActiveMarketEvent } from "@/services/MarketEventsService";
import { useToast } from "@/hooks/use-toast";

interface MarketEventsDisplayProps {
  userId: string;
  currentQuarter: number;
  currentYear: number;
  className?: string;
}

export const MarketEventsDisplay = ({ 
  userId, 
  currentQuarter, 
  currentYear, 
  className = "" 
}: MarketEventsDisplayProps) => {
  const [activeEvents, setActiveEvents] = useState<ActiveMarketEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadActiveEvents();
  }, [userId, currentQuarter, currentYear]);

  const loadActiveEvents = async () => {
    setLoading(true);
    try {
      const events = await MarketEventsService.getActiveMarketEvents(userId);
      setActiveEvents(events);
    } catch (error) {
      console.error('Error loading market events:', error);
      toast({
        title: "Fehler",
        description: "Konnte Marktereignisse nicht laden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleEventDetails = (eventId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'high':
        return <TrendingUp className="w-4 h-4 text-orange-400" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-400" />;
      case 'low':
        return <TrendingUp className="w-4 h-4 text-neon-green" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriceImpactIcon = (multiplier: number) => {
    if (multiplier > 1.1) {
      return <TrendingUp className="w-4 h-4 text-red-400" />;
    } else if (multiplier < 0.9) {
      return <TrendingDown className="w-4 h-4 text-neon-green" />;
    }
    return <DollarSign className="w-4 h-4 text-yellow-400" />;
  };

  const formatPriceImpact = (multiplier: number): string => {
    const change = ((multiplier - 1) * 100).toFixed(0);
    if (multiplier > 1) {
      return `+${change}% teurer`;
    } else if (multiplier < 1) {
      return `${change}% günstiger`;
    }
    return 'Keine Änderung';
  };

  const getEventTypeColor = (eventType: string): string => {
    const colors = {
      price_shock: 'bg-red-500/20 border-red-500/30 text-red-300',
      shortage: 'bg-orange-500/20 border-orange-500/30 text-orange-300',
      surplus: 'bg-neon-green/20 border-neon-green/30 text-neon-green',
      demand_shift: 'bg-neon-cyan/20 border-neon-cyan/30 text-neon-cyan',
      tech_breakthrough: 'bg-purple-500/20 border-purple-500/30 text-purple-300'
    };
    return colors[eventType as keyof typeof colors] || 'bg-gray-500/20 border-gray-500/30 text-gray-300';
  };

  if (loading) {
    return (
      <Card className={`retro-border bg-card/80 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Zap className="w-5 h-5 text-neon-cyan animate-pulse mr-2" />
            <span className="text-sm text-muted-foreground">Lade Marktereignisse...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeEvents.length === 0) {
    return (
      <Card className={`retro-border bg-card/80 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-cyan text-sm">
            <TrendingUp className="w-4 h-4" />
            Marktereignisse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Derzeit keine aktiven Marktereignisse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Der Markt ist stabil
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`retro-border bg-card/80 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-neon-cyan text-sm">
          <AlertTriangle className="w-4 h-4" />
          Aktive Marktereignisse ({activeEvents.length})
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Ereignisse beeinflussen Komponentenpreise transparent
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeEvents.map((event) => {
          const eventDisplay = MarketEventsService.formatEventForDisplay(event);
          const isDetailsVisible = showDetails[event.id] || false;
          
          return (
            <Alert key={event.id} className={`${getEventTypeColor(event.event_details.event_type)} border`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  {getSeverityIcon(event.event_details.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">{eventDisplay.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${MarketEventsService.getSeverityColor(event.event_details.severity)}`}
                        >
                          {eventDisplay.severity}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEventDetails(event.id)}
                          className="h-6 w-6 p-0"
                        >
                          {isDetailsVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    
                    <AlertDescription className="text-xs mb-2">
                      {eventDisplay.description}
                    </AlertDescription>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {getPriceImpactIcon(event.current_price_multiplier)}
                          <span className="font-mono">
                            {formatPriceImpact(event.current_price_multiplier)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{eventDisplay.timeRemaining}</span>
                        </div>
                      </div>
                    </div>

                    {isDetailsVisible && (
                      <div className="mt-3 pt-3 border-t border-current/20 space-y-2">
                        <div className="text-xs">
                          <p className="font-medium mb-1">Betroffene Komponenten:</p>
                          <div className="flex flex-wrap gap-1">
                            {event.event_details.affected_categories.map((category) => (
                              <Badge 
                                key={category} 
                                variant="outline" 
                                className="text-xs bg-background/20"
                              >
                                {category.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-xs">
                          <p className="font-medium">Auswirkung:</p>
                          <p className="text-muted-foreground">{eventDisplay.impact}</p>
                        </div>
                        
                        {event.event_details.market_impact !== 0 && (
                          <div className="text-xs">
                            <p className="font-medium">Markteinfluss:</p>
                            <p className="text-muted-foreground">
                              {event.event_details.market_impact > 0 ? '+' : ''}
                              {(event.event_details.market_impact * 100).toFixed(1)}% Marktwachstum
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Alert>
          );
        })}
        
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
          <Info className="w-3 h-3 inline mr-1" />
          Preisänderungen werden automatisch in Kalkulationen berücksichtigt
        </div>
      </CardContent>
    </Card>
  );
};

// Compact version for smaller spaces
export const MarketEventsCompact = ({ 
  userId, 
  currentQuarter, 
  currentYear, 
  className = "" 
}: MarketEventsDisplayProps) => {
  const [activeEvents, setActiveEvents] = useState<ActiveMarketEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const events = await MarketEventsService.getActiveMarketEvents(userId);
        setActiveEvents(events);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, [userId, currentQuarter, currentYear]);

  if (loading || activeEvents.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-xs">
        <AlertTriangle className="w-3 h-3 text-yellow-400" />
        <span className="font-medium">Aktive Marktereignisse:</span>
      </div>
      
      {activeEvents.slice(0, 3).map((event) => {
        const eventDisplay = MarketEventsService.formatEventForDisplay(event);
        
        return (
          <div key={event.id} className="text-xs bg-card/20 rounded p-2 border border-border/30">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{eventDisplay.title}</span>
              <span className="font-mono text-neon-cyan">
                {eventDisplay.priceImpact}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{eventDisplay.affectedComponents}</span>
              <span>{eventDisplay.timeRemaining}</span>
            </div>
          </div>
        );
      })}
      
      {activeEvents.length > 3 && (
        <div className="text-xs text-muted-foreground text-center">
          +{activeEvents.length - 3} weitere Ereignisse
        </div>
      )}
    </div>
  );
};