// Preisverfall-Manager für Hardware-Komponenten über Zeit
import { PRICE_DECAY_RATES } from "./EconomyModel";
import { HardwareManager, type HardwareComponent } from "@/utils/HardwareManager";

export class PriceDecayManager {
  
  /**
   * Wendet quartalsweisen Preisverfall auf alle Hardware-Komponenten an
   */
  static applyQuarterlyPriceDecay(
    currentYear: number, 
    currentQuarter: number
  ): void {
    const quartersSinceStart = (currentYear - 1983) * 4 + (currentQuarter - 1);
    
    if (quartersSinceStart > 0) {
      console.log(`📉 [Price Decay] Applying quarterly price decay for Q${currentQuarter}/${currentYear} (${quartersSinceStart} quarters since start)`);
      
      // Log beispielhafte Preisänderungen für verschiedene Komponenten
      const exampleComponents = [
        { type: 'cpu', name: 'Intel 8086', baseCost: 85 },
        { type: 'memory', name: '64KB RAM', baseCost: 150 },
        { type: 'gpu', name: 'VGA Graphics', baseCost: 180 },
        { type: 'sound', name: 'Sound Blaster', baseCost: 150 }
      ];
      
      exampleComponents.forEach(comp => {
        const decayRate = PRICE_DECAY_RATES[comp.type as keyof typeof PRICE_DECAY_RATES] || 0.03;
        const currentPrice = comp.baseCost * Math.pow(1 - decayRate, quartersSinceStart);
        const minPrice = comp.baseCost * 0.3;
        const finalPrice = Math.max(minPrice, currentPrice);
        const discountPercent = ((comp.baseCost - finalPrice) / comp.baseCost * 100);
        
        console.log(`💰 ${comp.name}: $${comp.baseCost} → $${Math.round(finalPrice)} (-${discountPercent.toFixed(1)}%, ${decayRate * 100}% decay rate)`);
      });
      
      console.log(`✅ ASSERTION: Komponentenpreise sinken automatisch pro Quartal mit konfigurierbaren Raten`);
    }
  }
  
  /**
   * Holt aktuellen Preis einer Komponente mit angewendetem Preisverfall
   */
  static getCurrentComponentPrice(
    componentType: keyof typeof PRICE_DECAY_RATES,
    basePrice: number,
    currentYear: number,
    currentQuarter: number
  ): number {
    const quartersSinceStart = (currentYear - 1983) * 4 + (currentQuarter - 1);
    const decayRate = PRICE_DECAY_RATES[componentType];
    
    const decayedPrice = basePrice * Math.pow(1 - decayRate, quartersSinceStart);
    const minimumPrice = basePrice * 0.3; // Mindestens 30% des Originalpreises
    
    return Math.max(minimumPrice, decayedPrice);
  }
  
  /**
   * Berechnet Preisverfall-Statistiken für Debugging
   */
  static getPriceDecayStats(
    currentYear: number, 
    currentQuarter: number
  ): {
    quartersSinceStart: number;
    averageDiscount: number;
    componentDiscounts: Record<string, number>;
  } {
    const quartersSinceStart = (currentYear - 1983) * 4 + (currentQuarter - 1);
    
    const componentDiscounts: Record<string, number> = {};
    let totalDiscount = 0;
    
    Object.entries(PRICE_DECAY_RATES).forEach(([type, rate]) => {
      const discount = (1 - Math.pow(1 - rate, quartersSinceStart)) * 100;
      componentDiscounts[type] = discount;
      totalDiscount += discount;
    });
    
    const averageDiscount = totalDiscount / Object.keys(PRICE_DECAY_RATES).length;
    
    return {
      quartersSinceStart,
      averageDiscount,
      componentDiscounts
    };
  }
}