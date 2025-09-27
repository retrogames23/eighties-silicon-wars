// Centralized ComputerModel interface with revision support
export interface ComponentsSnapshot {
  cpu: string;
  gpu: string;
  memory: string;
  sound?: string;
  accessories?: string[];
  case: string;
}

export interface ComputerModel {
  // Core identifiers
  id: string;
  name: string; // Legacy field - becomes displayName
  displayName: string; // Current display name with revision info
  baseName: string; // Original name without revision suffix
  
  // Revision system
  revision: number; // 1, 2, 3, ...
  revisedAtQuarter: number;
  revisedAtYear: number;
  componentsSnapshot: ComponentsSnapshot;
  parentModelId?: string; // ID of original model for revision chain
  
  // Hardware specifications
  cpu: string;
  gpu?: string;
  ram: string;
  sound?: string;
  soundchip?: string; // Legacy compatibility
  accessories?: string[];
  case?: {
    id: string;
    name: string;
    type: string;
    quality: number;
    design: number;
    price: number;
  };
  
  // Business data
  status: 'development' | 'released' | 'discontinued';
  price: number;
  sellingPrice?: number; // Alternative price field
  performance: number;
  developmentCost: number;
  developmentTime?: number;
  developmentProgress?: number;
  complexity?: number;
  
  // Sales data
  unitsSold: number;
  releaseQuarter: number;
  releaseYear: number;
  
  // Market dynamics
  obsolescenceFactorCurrent?: number;
  quartersSinceRelease?: number;
  marketShare?: number;
  
  // Features
  hasMouseSupport?: boolean;
  hasNetworkSupport?: boolean;
  
  // Additional metadata
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper functions for revision management
export class ModelRevisionManager {
  /**
   * Creates a new revision of an existing model with updated components
   */
  static createRevision(
    originalModel: ComputerModel,
    newComponents: ComponentsSnapshot,
    currentQuarter: number,
    currentYear: number
  ): ComputerModel {
    const newRevision = originalModel.revision + 1;
    const parentId = originalModel.parentModelId || originalModel.id;
    
    return {
      ...originalModel,
      id: `${parentId}-rev${newRevision}`,
      revision: newRevision,
      displayName: `${originalModel.baseName} (Revision ${newRevision})`,
      componentsSnapshot: newComponents,
      revisedAtQuarter: currentQuarter,
      revisedAtYear: currentYear,
      parentModelId: parentId,
      status: 'development', // New revision starts in development
      developmentProgress: 0, // Reset development progress
      unitsSold: 0, // Reset sales data
      obsolescenceFactorCurrent: undefined,
      quartersSinceRelease: undefined,
      updatedAt: new Date()
    };
  }
  
  /**
   * Migrates existing models to revision system (revision = 1)
   */
  static migrateExistingModels(models: any[]): ComputerModel[] {
    return models.map(model => ({
      ...model,
      revision: 1,
      baseName: model.name,
      displayName: model.name,
      revisedAtQuarter: model.releaseQuarter || 1,
      revisedAtYear: model.releaseYear || 1983,
      componentsSnapshot: {
        cpu: model.cpu || 'Unknown',
        gpu: model.gpu || model.soundchip || 'Unknown',
        memory: model.ram || 'Unknown',
        sound: model.sound || model.soundchip || 'PC Speaker',
        accessories: model.accessories || [],
        case: model.case?.name || 'Standard Case'
      },
      parentModelId: null,
      updatedAt: new Date()
    }));
  }
  
  /**
   * Gets the latest revision of each model family
   */
  static getLatestRevisions(models: ComputerModel[]): ComputerModel[] {
    const modelFamilies = new Map<string, ComputerModel>();
    
    models.forEach(model => {
      const familyId = model.parentModelId || model.id;
      const existing = modelFamilies.get(familyId);
      
      if (!existing || model.revision > existing.revision) {
        modelFamilies.set(familyId, model);
      }
    });
    
    return Array.from(modelFamilies.values());
  }
  
  /**
   * Gets all revisions of a specific model family
   */
  static getModelRevisions(models: ComputerModel[], modelId: string): ComputerModel[] {
    const baseModel = models.find(m => m.id === modelId);
    if (!baseModel) return [];
    
    const familyId = baseModel.parentModelId || baseModel.id;
    
    return models
      .filter(m => (m.parentModelId || m.id) === familyId)
      .sort((a, b) => b.revision - a.revision); // Latest first
  }
  
  /**
   * Checks if components have changed significantly enough to warrant a revision
   */
  static shouldCreateRevision(
    currentComponents: ComponentsSnapshot,
    newComponents: ComponentsSnapshot
  ): boolean {
    // Create revision if core components (CPU, GPU, Memory) change
    return (
      currentComponents.cpu !== newComponents.cpu ||
      currentComponents.gpu !== newComponents.gpu ||
      currentComponents.memory !== newComponents.memory
    );
  }
  
  /**
   * Gets market-relevant models (released, latest revisions only)
   */
  static getMarketRelevantModels(models: ComputerModel[]): ComputerModel[] {
    const latestRevisions = this.getLatestRevisions(models);
    return latestRevisions.filter(model => model.status === 'released');
  }
}