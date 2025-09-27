import { supabase } from "@/integrations/supabase/client";

export interface MarketEventData {
  id: string;
  event_name: string;
  description: string;
  event_type: 'price_shock' | 'shortage' | 'surplus' | 'demand_shift' | 'tech_breakthrough';
  affected_categories: string[];
  price_multiplier: number;
  market_impact: number;
  start_quarter: number;
  start_year: number;
  duration_quarters: number;
  end_quarter: number;
  end_year: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_global: boolean;
  trigger_probability: number;
  is_active: boolean;
}

export interface ActiveMarketEvent {
  id: string;
  user_id: string;
  market_event_id: string;
  game_quarter: number;
  game_year: number;
  remaining_quarters: number;
  current_price_multiplier: number;
  is_visible_to_player: boolean;
  event_details: MarketEventData;
}

export class MarketEventsService {

  /**
   * Get all active market events for the current user
   */
  static async getActiveMarketEvents(userId: string): Promise<ActiveMarketEvent[]> {
    const { data, error } = await supabase
      .from('active_market_events')
      .select(`
        *,
        event_details:market_events(*)
      `)
      .eq('user_id', userId)
      .gt('remaining_quarters', 0);

    if (error) {
      console.error('Error fetching active market events:', error);
      return [];
    }

    return (data || []).map(event => ({
      ...event,
      event_details: { 
        ...event.event_details as any,
        event_type: (event.event_details as any).event_type as MarketEventData['event_type']
      }
    }));
  }

  /**
   * Process quarter turn - check for new events and update existing ones
   */
  static async processQuarterEvents(
    userId: string,
    currentQuarter: number,
    currentYear: number
  ): Promise<{
    newEvents: ActiveMarketEvent[];
    expiredEvents: string[];
    continuingEvents: ActiveMarketEvent[];
  }> {
    
    // Get all possible market events
    const { data: allEvents, error: fetchError } = await supabase
      .from('market_events')
      .select('*')
      .eq('is_active', true);

    if (fetchError) {
      console.error('Error fetching market events:', fetchError);
      return { newEvents: [], expiredEvents: [], continuingEvents: [] };
    }

    // Check for new events based on probability
    const newEvents: ActiveMarketEvent[] = [];
    for (const event of allEvents || []) {
      if (Math.random() < event.trigger_probability) {
        const activeEvent = await this.activateMarketEvent(userId, event as any, currentQuarter, currentYear);
        if (activeEvent) {
          newEvents.push(activeEvent);
        }
      }
    }

    // Update existing events - decrease remaining quarters
    const { data: existingEvents } = await supabase
      .from('active_market_events')
      .select(`
        *,
        event_details:market_events(*)
      `)
      .eq('user_id', userId)
      .gt('remaining_quarters', 0);

    const expiredEvents: string[] = [];
    const continuingEvents: ActiveMarketEvent[] = [];

    for (const event of existingEvents || []) {
      const newRemainingQuarters = event.remaining_quarters - 1;
      
      if (newRemainingQuarters <= 0) {
        // Event expired
        await supabase
          .from('active_market_events')
          .update({ remaining_quarters: 0 })
          .eq('id', event.id);
        
        expiredEvents.push(event.id);
      } else {
        // Event continues
        await supabase
          .from('active_market_events')
          .update({ 
            remaining_quarters: newRemainingQuarters,
            game_quarter: currentQuarter,
            game_year: currentYear
          })
          .eq('id', event.id);
        
        continuingEvents.push({
          ...event,
          remaining_quarters: newRemainingQuarters,
          game_quarter: currentQuarter,
          game_year: currentYear,
          event_details: event.event_details as MarketEventData
        });
      }
    }

    return { newEvents, expiredEvents, continuingEvents };
  }

  /**
   * Activate a market event for a specific user
   */
  private static async activateMarketEvent(
    userId: string,
    marketEvent: MarketEventData,
    currentQuarter: number,
    currentYear: number
  ): Promise<ActiveMarketEvent | null> {
    
    const activeEventData = {
      user_id: userId,
      market_event_id: marketEvent.id,
      game_quarter: currentQuarter,
      game_year: currentYear,
      remaining_quarters: marketEvent.duration_quarters,
      current_price_multiplier: marketEvent.price_multiplier,
      is_visible_to_player: true
    };

    const { data, error } = await supabase
      .from('active_market_events')
      .insert([activeEventData])
      .select(`
        *,
        event_details:market_events(*)
      `)
      .single();

    if (error) {
      console.error('Error activating market event:', error);
      return null;
    }

    return {
      ...data,
      event_details: data.event_details as MarketEventData
    };
  }

  /**
   * Get price multipliers for specific component categories
   */
  static async getPriceMultipliers(
    userId: string,
    componentTypes: string[]
  ): Promise<Record<string, number>> {
    const activeEvents = await this.getActiveMarketEvents(userId);
    
    const multipliers: Record<string, number> = {};
    
    // Initialize all requested types to 1.0 (no change)
    componentTypes.forEach(type => {
      multipliers[type] = 1.0;
    });

    // Apply active event multipliers
    activeEvents.forEach(event => {
      event.event_details.affected_categories.forEach(category => {
        if (componentTypes.includes(category)) {
          // Multiply effects if multiple events affect the same category
          multipliers[category] *= event.current_price_multiplier;
        }
      });
    });

    return multipliers;
  }

  /**
   * Get formatted event display information
   */
  static formatEventForDisplay(event: ActiveMarketEvent): {
    title: string;
    description: string;
    impact: string;
    severity: string;
    timeRemaining: string;
    affectedComponents: string;
    priceImpact: string;
  } {
    const { event_details: details } = event;
    
    const priceChange = ((details.price_multiplier - 1) * 100).toFixed(0);
    const priceImpactText = details.price_multiplier > 1 
      ? `+${priceChange}% teurer` 
      : `${priceChange}% günstiger`;

    return {
      title: details.event_name,
      description: details.description,
      impact: this.getEventTypeDescription(details.event_type),
      severity: this.getSeverityDescription(details.severity),
      timeRemaining: `${event.remaining_quarters} Quartal${event.remaining_quarters !== 1 ? 'e' : ''}`,
      affectedComponents: details.affected_categories.join(', '),
      priceImpact: priceImpactText
    };
  }

  /**
   * Get event type description in German
   */
  private static getEventTypeDescription(eventType: MarketEventData['event_type']): string {
    const descriptions = {
      price_shock: 'Plötzlicher Preisschock',
      shortage: 'Komponenten-Knappheit',
      surplus: 'Markt-Überangebot',
      demand_shift: 'Nachfrage-Verschiebung',
      tech_breakthrough: 'Technologie-Durchbruch'
    };
    
    return descriptions[eventType] || eventType;
  }

  /**
   * Get severity description with appropriate styling
   */
  private static getSeverityDescription(severity: MarketEventData['severity']): string {
    const descriptions = {
      low: 'Gering',
      medium: 'Mittel',
      high: 'Hoch',
      critical: 'Kritisch'
    };
    
    return descriptions[severity] || severity;
  }

  /**
   * Get color class for severity level
   */
  static getSeverityColor(severity: MarketEventData['severity']): string {
    const colors = {
      low: 'text-neon-green',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      critical: 'text-red-400'
    };
    
    return colors[severity] || 'text-gray-400';
  }

  /**
   * Check if a component type is affected by any active events
   */
  static async isComponentAffected(
    userId: string,
    componentType: string
  ): Promise<{ isAffected: boolean; priceMultiplier: number; activeEvents: ActiveMarketEvent[] }> {
    const activeEvents = await this.getActiveMarketEvents(userId);
    
    const affectingEvents = activeEvents.filter(event =>
      event.event_details.affected_categories.includes(componentType)
    );

    if (affectingEvents.length === 0) {
      return { isAffected: false, priceMultiplier: 1.0, activeEvents: [] };
    }

    // Calculate combined price multiplier
    let combinedMultiplier = 1.0;
    affectingEvents.forEach(event => {
      combinedMultiplier *= event.current_price_multiplier;
    });

    return {
      isAffected: true,
      priceMultiplier: combinedMultiplier,
      activeEvents: affectingEvents
    };
  }

  /**
   * Create a custom market event (for testing or admin purposes)
   */
  static async createCustomEvent(
    eventName: string,
    description: string,
    affectedCategories: string[],
    priceMultiplier: number,
    durationQuarters: number
  ): Promise<{ success: boolean; eventId?: string }> {
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
    
    const endQuarter = ((currentQuarter + durationQuarters - 1) % 4) + 1;
    const endYear = currentYear + Math.floor((currentQuarter + durationQuarters - 1) / 4);

    const eventData = {
      event_name: eventName,
      description: description,
      event_type: 'price_shock' as const,
      affected_categories: affectedCategories,
      price_multiplier: priceMultiplier,
      market_impact: (priceMultiplier - 1) * 0.1, // Rough market impact estimation
      start_quarter: currentQuarter,
      start_year: currentYear,
      duration_quarters: durationQuarters,
      end_quarter: endQuarter,
      end_year: endYear,
      severity: priceMultiplier > 1.2 || priceMultiplier < 0.8 ? 'high' : 'medium' as const,
      is_global: true,
      trigger_probability: 1.0, // 100% chance since it's manually created
      is_active: true
    };

    const { data, error } = await supabase
      .from('market_events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      console.error('Error creating custom market event:', error);
      return { success: false };
    }

    return { success: true, eventId: data.id };
  }
}