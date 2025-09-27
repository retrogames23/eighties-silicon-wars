/**
 * Manages price recommendations without automatically overwriting model prices
 * Ensures recommendations remain locked until user explicitly adopts them
 */

export interface PriceRecommendation {
  modelId: string;
  originalPrice: number;
  recommendedPrice: number;
  reasoning: string;
  testScore: number;
  generatedAt: number;
  adopted: boolean;
}

export class PriceRecommendationManager {
  private static recommendations = new Map<string, PriceRecommendation>();

  /**
   * Store a price recommendation without changing the model's actual price
   */
  static storePriceRecommendation(
    modelId: string,
    originalPrice: number,
    recommendedPrice: number,
    reasoning: string,
    testScore: number
  ): void {
    const recommendation: PriceRecommendation = {
      modelId,
      originalPrice,
      recommendedPrice,
      reasoning,
      testScore,
      generatedAt: Date.now(),
      adopted: false
    };

    this.recommendations.set(modelId, recommendation);
  }

  /**
   * Get price recommendation for a model
   */
  static getPriceRecommendation(modelId: string): PriceRecommendation | null {
    return this.recommendations.get(modelId) || null;
  }

  /**
   * Adopt a price recommendation (apply to model)
   */
  static adoptPriceRecommendation(modelId: string): { newPrice: number; success: boolean } {
    const recommendation = this.recommendations.get(modelId);
    
    if (!recommendation) {
      return { newPrice: 0, success: false };
    }

    recommendation.adopted = true;
    
    return {
      newPrice: recommendation.recommendedPrice,
      success: true
    };
  }

  /**
   * Reject a price recommendation (keep original)
   */
  static rejectPriceRecommendation(modelId: string): boolean {
    const recommendation = this.recommendations.get(modelId);
    
    if (!recommendation) {
      return false;
    }

    // Mark as rejected but keep for reference
    this.recommendations.delete(modelId);
    return true;
  }

  /**
   * Check if model has a pending price recommendation
   */
  static hasPendingRecommendation(modelId: string): boolean {
    const recommendation = this.recommendations.get(modelId);
    return recommendation ? !recommendation.adopted : false;
  }

  /**
   * Get all pending recommendations
   */
  static getPendingRecommendations(): PriceRecommendation[] {
    return Array.from(this.recommendations.values())
      .filter(rec => !rec.adopted);
  }

  /**
   * Clear all recommendations (for game reset)
   */
  static clearAllRecommendations(): void {
    this.recommendations.clear();
  }

  /**
   * Generate safe price recommendation that doesn't auto-apply
   */
  static generateSafePriceRecommendation(
    modelId: string,
    currentPrice: number,
    gamingPriceValue: number,
    businessPriceValue: number,
    workstationPriceValue: number
  ): {
    currentPrice: number;
    recommendedPrice: number;
    reasoning: string;
    hasRecommendation: boolean;
  } {
    const avgPriceValue = (gamingPriceValue + businessPriceValue + workstationPriceValue) / 3;
    
    // Only generate recommendation if significant price adjustment needed
    if (avgPriceValue < 60) {
      const priceAdjustment = currentPrice * (avgPriceValue < 40 ? -0.2 : -0.1);
      const recommendedPrice = Math.round(currentPrice + priceAdjustment);
      
      const reasoning = avgPriceValue < 40 ? 
        'Der Preis ist deutlich zu hoch für die gebotene Leistung. Eine Preissenkung um 20% würde die Marktchancen erheblich verbessern.' :
        'Der Preis liegt über dem optimalen Punkt. Eine moderate Preissenkung um 10% wäre empfehlenswert.';

      // Store recommendation but don't auto-apply
      this.storePriceRecommendation(
        modelId,
        currentPrice,
        recommendedPrice,
        reasoning,
        avgPriceValue
      );

      return {
        currentPrice,
        recommendedPrice,
        reasoning,
        hasRecommendation: true
      };
    } else if (avgPriceValue > 85) {
      const priceAdjustment = currentPrice * 0.15;
      const recommendedPrice = Math.round(currentPrice + priceAdjustment);
      
      const reasoning = 'Exzellentes Preis-Leistungs-Verhältnis ermöglicht eine Preiserhöhung um 15% ohne Verkaufseinbußen.';

      // Store recommendation but don't auto-apply
      this.storePriceRecommendation(
        modelId,
        currentPrice,
        recommendedPrice,
        reasoning,
        avgPriceValue
      );

      return {
        currentPrice,
        recommendedPrice,
        reasoning,
        hasRecommendation: true
      };
    }
    
    // Price is optimal - no recommendation needed
    return {
      currentPrice,
      recommendedPrice: currentPrice,
      reasoning: 'Der aktuelle Preis liegt im optimalen Bereich für die gebotene Leistung.',
      hasRecommendation: false
    };
  }

  /**
   * Update model price only if user has explicitly adopted recommendation
   */
  static applyPriceIfAdopted(modelId: string, currentModel: any): any {
    const recommendation = this.getPriceRecommendation(modelId);
    
    if (recommendation && recommendation.adopted) {
      return {
        ...currentModel,
        price: recommendation.recommendedPrice,
        priceHistory: [
          ...(currentModel.priceHistory || []),
          {
            oldPrice: recommendation.originalPrice,
            newPrice: recommendation.recommendedPrice,
            reason: 'Test recommendation adopted',
            timestamp: Date.now()
          }
        ]
      };
    }
    
    return currentModel;
  }

  /**
   * Get price recommendation display data for UI
   */
  static getPriceRecommendationDisplay(modelId: string): {
    show: boolean;
    current: number;
    recommended: number;
    reasoning: string;
    canAdopt: boolean;
    canReject: boolean;
  } {
    const recommendation = this.getPriceRecommendation(modelId);
    
    if (!recommendation || recommendation.adopted) {
      return {
        show: false,
        current: 0,
        recommended: 0,
        reasoning: '',
        canAdopt: false,
        canReject: false
      };
    }

    return {
      show: true,
      current: recommendation.originalPrice,
      recommended: recommendation.recommendedPrice,
      reasoning: recommendation.reasoning,
      canAdopt: true,
      canReject: true
    };
  }
}
