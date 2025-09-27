// Model Status Guards - Prevent development models from appearing in statistics
import { ComputerModel, ModelRevisionManager } from '@/types/ComputerModel';

export class ModelStatusGuard {
  /**
   * Filter out development models from sales statistics
   */
  static getMarketRelevantModels(models: ComputerModel[]): ComputerModel[] {
    // Get latest revisions only and exclude development status
    const latestRevisions = ModelRevisionManager.getLatestRevisions(models);
    return latestRevisions.filter(model => model.status === 'released');
  }

  /**
   * Filter models for revenue calculations
   */
  static getRevenueModels(models: ComputerModel[]): ComputerModel[] {
    return models.filter(model => 
      model.status === 'released' || model.status === 'discontinued'
    );
  }

  /**
   * Filter models for sales statistics
   */
  static getSalesModels(models: ComputerModel[]): ComputerModel[] {
    return this.getRevenueModels(models);
  }

  /**
   * Filter models for market share calculations
   */
  static getMarketShareModels(models: ComputerModel[]): ComputerModel[] {
    return ModelRevisionManager.getMarketRelevantModels(models);
  }

  /**
   * Calculate total revenue excluding development models
   */
  static calculateTotalRevenue(models: ComputerModel[]): number {
    return this.getRevenueModels(models)
      .reduce((sum, model) => sum + (model.unitsSold * model.price), 0);
  }

  /**
   * Calculate total units sold excluding development models
   */
  static calculateTotalUnitsSold(models: ComputerModel[]): number {
    return this.getSalesModels(models)
      .reduce((sum, model) => sum + model.unitsSold, 0);
  }

  /**
   * Get development models for development tracking
   */
  static getDevelopmentModels(models: ComputerModel[]): ComputerModel[] {
    return models.filter(model => model.status === 'development');
  }

  /**
   * Check if model should be excluded from public statistics
   */
  static shouldExcludeFromStats(model: ComputerModel): boolean {
    return model.status === 'development';
  }
}