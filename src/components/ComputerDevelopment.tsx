import { useState } from "react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  Cpu,
  HardDrive,
  MemoryStick,
  Volume2,
  Monitor,
  Disc,
  Zap,
  Package,
  Gamepad2,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Lock
} from "lucide-react";
import { TestReport } from "./TestReport";
import { EnhancedTestReportGenerator } from "./EnhancedTestReportGenerator";
import { GameMechanics } from "@/lib/game";
import { HardwareManager, type HardwareComponent } from "@/utils/HardwareManager";
import { PriceRecommendationManager } from "@/services/PriceRecommendationManager";
import { useTranslation } from 'react-i18next';

// Use HardwareComponent from HardwareManager instead of local Component interface

// Removed duplicate hardware logic - now using HardwareManager

// Case-Daten
const getComputerCases = (t: any) => [
  {
    id: 'beige-tower',
    name: t('hardware:cases.beigeTower.name'),
    type: 'office' as const,
    quality: 65,
    design: 40,
    price: 80,
    description: t('hardware:cases.beigeTower.description')
  },
  {
    id: 'black-desktop',
    name: t('hardware:cases.blackDesktop.name'),
    type: 'office' as const,
    quality: 70,
    design: 55,
    price: 120,
    description: t('hardware:cases.blackDesktop.description')
  },
  {
    id: 'gamer-rgb',
    name: t('hardware:cases.gamerRgb.name'),
    type: 'gamer' as const,
    quality: 85,
    design: 90,
    price: 200,
    description: t('hardware:cases.gamerRgb.description')
  },
  {
    id: 'retro-wood',
    name: t('hardware:cases.retroWood.name'),
    type: 'gamer' as const,
    quality: 60,
    design: 80,
    price: 150,
    description: t('hardware:cases.retroWood.description')
  },
  {
    id: 'premium-metal',
    name: t('hardware:cases.premiumMetal.name'),
    type: 'office' as const,
    quality: 95,
    design: 85,
    price: 300,
    description: t('hardware:cases.premiumMetal.description')
  },
  {
    id: 'compact-mini',
    name: t('hardware:cases.compactMini.name'),
    type: 'office' as const,
    quality: 75,
    design: 65,
    price: 100,
    description: t('hardware:cases.compactMini.description')
  }
];

import { ComputerModel, ComponentsSnapshot, ModelRevisionManager } from '@/types/ComputerModel';

interface LocalComputerModel extends ComputerModel {
  case?: {
    id: string;
    name: string;
    type: 'gamer' | 'office';
    quality: number;
    design: number;
    price: number;
  };
  price: number;
  developmentCost: number;
  performance: number;
  unitsSold: number;
  status: 'development' | 'released';
  releaseQuarter: number;
  releaseYear: number;
  developmentTime: number;
  developmentProgress: number;
  complexity: number;
}

interface ComputerDevelopmentProps {
  onBack: () => void;
  onModelComplete: (model: ComputerModel) => void;
  existingModels?: ComputerModel[]; // For revision checking
  editingModel?: ComputerModel; // Model being edited for revision
  currentYear: number;
  currentQuarter: number;
  customChips: any[];
}

export const ComputerDevelopment = ({ onBack, onModelComplete, currentYear, currentQuarter, customChips, existingModels = [], editingModel }: ComputerDevelopmentProps) => {
  const { t } = useTranslation(['hardware', 'common']);
  const computerCases = getComputerCases(t);
  
  const [selectedComponents, setSelectedComponents] = useState<HardwareComponent[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [modelName, setModelName] = useState('');
  const [sellingPrice, setSellingPrice] = useState(0);
  const [currentStep, setCurrentStep] = useState<'components' | 'case' | 'name' | 'pricing' | 'testreport'>('components');
  const [developedModel, setDevelopedModel] = useState<ComputerModel | null>(null);

  // Debug logging
  console.log('ComputerDevelopment State:', {
    currentStep,
    selectedCase: selectedCase?.name || 'none',
    selectedComponents: selectedComponents.map(c => c.name),
    canProceedToCase: selectedComponents.some(c => c.type === 'cpu') && 
                      selectedComponents.some(c => c.type === 'gpu') && 
                      selectedComponents.some(c => c.type === 'memory')
  });

  // Lade verfügbare Komponenten über zentralen HardwareManager
  const allComponents = HardwareManager.getAvailableComponents(currentYear, currentQuarter, customChips);

  const totalCost = selectedComponents.reduce((sum, comp) => sum + comp.cost, 0) + (selectedCase?.price || 0);
  const averagePerformance = selectedComponents.length > 0 
    ? Math.round(selectedComponents.reduce((sum, comp) => sum + comp.performance, 0) / selectedComponents.length)
    : 0;
    
  // Preisempfehlung auf Basis der Test-Logik (ohne Testlauf)
  const modelId = editingModel?.id || `temp_${currentYear}_${currentQuarter}`;
  const existingRecommendation = PriceRecommendationManager.getPriceRecommendation(modelId);
  
  let suggestedPrice: number;
  if (existingRecommendation && !existingRecommendation.adopted) {
    suggestedPrice = existingRecommendation.recommendedPrice;
  } else {
    // 1) Erwartete Preise gemäß Test-Logik
    const expectedGamerPrice = 600 + (currentYear - 1983) * 150;
    const expectedBusinessPrice = 1200 + (currentYear - 1983) * 300;
    const expectedWorkstationPrice = currentYear >= 1987 ? 3000 + (currentYear - 1987) * 1000 : undefined;
    
    // 2) Basiskandidat als gewichteter Mix (Business stärker gewichtet)
    const candidatePrice = Math.round(
      expectedBusinessPrice * 0.6 + expectedGamerPrice * 0.4
    );
    
    // 3) Preiswert-Score wie im Test
    const priceValue = (expected: number, price: number) => {
      return Math.max(0, Math.min(100, 100 - Math.abs(price - expected) / expected * 100));
    };
    const gamingPriceValue = priceValue(expectedGamerPrice, candidatePrice);
    const businessPriceValue = priceValue(expectedBusinessPrice, candidatePrice);
    const workstationPriceValue = expectedWorkstationPrice ? priceValue(expectedWorkstationPrice, candidatePrice) : 0;
    
    // 4) Empfehlung generieren und speichern (einzige Quelle)
    const rec = PriceRecommendationManager.generateSafePriceRecommendation(
      modelId,
      candidatePrice,
      gamingPriceValue,
      businessPriceValue,
      workstationPriceValue
    );
    suggestedPrice = rec.recommendedPrice;
  }
  
  // Mindest- und Maximalpreis (konsistent mit EconomicModel)
  const minPrice = Math.round(totalCost * 1.1); // 10% Mindestmarge
  const maxPrice = Math.round(totalCost * 4.0); // 300% Maximalmarge
  
  // Setze Verkaufspreis automatisch auf empfohlenen Preis wenn noch nicht gesetzt
  if (sellingPrice === 0 && suggestedPrice > 0) {
    setSellingPrice(suggestedPrice);
  }

  // Initialize state from editing model if provided
  React.useEffect(() => {
    if (editingModel) {
      setCurrentStep('components');
      setModelName(editingModel.baseName);
      setSellingPrice(editingModel.price);
      
      // Load components from snapshot
      const snapshot = editingModel.componentsSnapshot;
      const loadedComponents: HardwareComponent[] = [];
      
      // Find components by name from available components
      const cpu = allComponents.find(c => c.name === snapshot.cpu);
      const gpu = allComponents.find(c => c.name === snapshot.gpu);
      const memory = allComponents.find(c => c.name === snapshot.memory);
      const sound = allComponents.find(c => c.name === snapshot.sound);
      
      if (cpu) loadedComponents.push(cpu);
      if (gpu) loadedComponents.push(gpu);
      if (memory) loadedComponents.push(memory);
      if (sound) loadedComponents.push(sound);
      
      setSelectedComponents(loadedComponents);
      
      // Load case
      const caseItem = computerCases.find(c => c.name === snapshot.case);
      if (caseItem) setSelectedCase(caseItem);
    }
  }, [editingModel, allComponents]);

  const handleCaseSelection = (computerCase: any) => {
    console.log('Selecting case:', computerCase.name);
    setSelectedCase(computerCase);
  };

  const toggleComponent = (component: HardwareComponent) => {
    const isSelected = selectedComponents.some(c => c.id === component.id);
    const isSameType = selectedComponents.some(c => c.type === component.type);
    
    if (isSelected) {
      setSelectedComponents(prev => prev.filter(c => c.id !== component.id));
    } else if (isSameType && !['sound', 'storage', 'display'].includes(component.type)) {
      // Ersetze Komponente des gleichen Typs (außer optionale)
      setSelectedComponents(prev => [
        ...prev.filter(c => c.type !== component.type),
        component
      ]);
    } else if (!isSameType || ['sound', 'storage', 'display'].includes(component.type)) {
      setSelectedComponents(prev => [...prev, component]);
    }
  };

  const startDevelopment = () => {
    if (!modelName.trim() || !selectedCase || sellingPrice === 0) return;

    const cpu = selectedComponents.find(c => c.type === 'cpu');
    const gpu = selectedComponents.find(c => c.type === 'gpu');
    const memory = selectedComponents.find(c => c.type === 'memory');
    const sound = selectedComponents.find(c => c.type === 'sound') || { name: 'PC Speaker' };
    const accessories = selectedComponents.filter(c => ['storage', 'display'].includes(c.type));

    const complexity = Math.max(20, averagePerformance);
    
    // Create components snapshot
    const newComponentsSnapshot: ComponentsSnapshot = {
      cpu: cpu?.name || 'Unknown',
      gpu: gpu?.name || 'Unknown', 
      memory: memory?.name || 'Unknown',
      sound: sound?.name || 'PC Speaker',
      accessories: accessories.map(a => a.name),
      case: selectedCase.name
    };

    // Check if this is a revision (editing existing model with changed components)
    if (editingModel && ModelRevisionManager.shouldCreateRevision(editingModel.componentsSnapshot, newComponentsSnapshot)) {
      console.log(`🔄 Creating revision for ${editingModel.baseName} due to component changes`);
      
      const newRevision = ModelRevisionManager.createRevision(
        editingModel,
        newComponentsSnapshot,
        currentQuarter,
        currentYear
      );
      
      // Update with new components and calculated values
      const completedRevision: ComputerModel = {
        ...newRevision,
        cpu: cpu?.name || 'Unknown',
        gpu: gpu?.name,
        ram: memory?.name || 'Unknown',
        sound: sound?.name,
        accessories: accessories.map(a => a.name),
        case: selectedCase,
        price: sellingPrice,
        performance: averagePerformance,
        complexity,
        developmentCost: totalCost,
        developmentTime: GameMechanics.calculateDevelopmentTime(complexity)
      };
      
      console.log(`✅ ASSERTION: Revision ${completedRevision.revision} created with name "${completedRevision.displayName}"`);
      onModelComplete(completedRevision);
      return;
    }

    const developmentTime = GameMechanics.calculateDevelopmentTime(complexity);

    // Create new model (first revision)
    const newModel: ComputerModel = {
      id: `model-${Date.now()}`,
      name: modelName,
      displayName: modelName,
      baseName: modelName,
      revision: 1,
      revisedAtQuarter: currentQuarter,
      revisedAtYear: currentYear,
      componentsSnapshot: newComponentsSnapshot,
      cpu: cpu?.name || 'Unknown',
      gpu: gpu?.name,
      ram: memory?.name || 'Unknown',
      sound: sound?.name,
      accessories: accessories.map(a => a.name),
      case: selectedCase,
      status: 'development',
      price: sellingPrice,
      performance: averagePerformance,
      developmentCost: totalCost,
      developmentTime,
      developmentProgress: 0,
      complexity,
      unitsSold: 0,
      releaseQuarter: currentQuarter,
      releaseYear: currentYear,
      hasMouseSupport: accessories.some(a => a.name.toLowerCase().includes('mouse')),
      hasNetworkSupport: accessories.some(a => a.name.toLowerCase().includes('network')),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log(`✅ ASSERTION: New model "${newModel.displayName}" created as Revision 1`);

    // Zeige Testbericht vor dem finalen Abschluss
    setCurrentStep('testreport');
    setDevelopedModel(newModel);
    setDevelopedModel(newModel);
  };

  const finalizeModel = () => {
    if (!developedModel) return;

    // Prüfe ob Preisempfehlung adoptiert werden soll
    const recommendation = PriceRecommendationManager.getPriceRecommendation(modelId);
    let finalPrice = sellingPrice;
    
    if (recommendation && !recommendation.adopted && sellingPrice === recommendation.recommendedPrice) {
      // User hat Empfehlung übernommen - markiere als adoptiert
      PriceRecommendationManager.adoptPriceRecommendation(modelId);
      finalPrice = recommendation.recommendedPrice;
    }

    const finalModel = {
      ...developedModel,
      price: finalPrice,
      id: modelId
    };

    onModelComplete(finalModel);
  };

  const canProceedToCase = selectedComponents.some(c => c.type === 'cpu') && 
                          selectedComponents.some(c => c.type === 'gpu') && 
                          selectedComponents.some(c => c.type === 'memory');
                          
  const canProceedToName = canProceedToCase && selectedCase;
  const canProceedToPricing = canProceedToName && modelName.trim();
  const canFinish = canProceedToPricing && sellingPrice > 0;

  const getComponentIcon = (type: HardwareComponent['type']) => {
    switch (type) {
      case 'cpu': return Cpu;
      case 'gpu': return Monitor;
      case 'memory': return MemoryStick;
      case 'sound': return Volume2;
      case 'storage': return HardDrive;
      case 'display': return Monitor;
      default: return Zap;
    }
  };

  const getTypeColor = (type: HardwareComponent['type']) => {
    switch (type) {
      case 'cpu': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'gpu': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'memory': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'sound': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'storage': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'display': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-crt p-6">
      <div className="crt-screen">
        <div className="scanline" />
        
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onBack}
                variant="outline"
                className="retro-border bg-card/20 hover:bg-card/40"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('ui:development.sections.backToDashboard')}
              </Button>
              <h1 className="text-4xl font-bold neon-text text-neon-green">
                {t('ui:development.sections.computerDevelopment')}
              </h1>
            </div>
          </div>

          {/* Step Progress */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded ${
                currentStep === 'components' ? 'bg-neon-green/20 text-neon-green' : 
                canProceedToCase ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-500/20 text-gray-600'
              }`}>
                <Cpu className="w-4 h-4" />
                <span className="font-mono">{t('hardware:components.step1')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center space-x-2 px-4 py-2 rounded ${
                currentStep === 'case' ? 'bg-neon-green/20 text-neon-green' : 
                selectedCase ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-500/20 text-gray-600'
              }`}>
                <Package className="w-4 h-4" />
                <span className="font-mono">{t('ui:development.steps.case')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center space-x-2 px-4 py-2 rounded ${
                currentStep === 'name' ? 'bg-neon-green/20 text-neon-green' : 
                modelName ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-500/20 text-gray-600'
              }`}>
                <Zap className="w-4 h-4" />
                <span className="font-mono">{t('ui:development.steps.name')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center space-x-2 px-4 py-2 rounded ${
                currentStep === 'pricing' ? 'bg-neon-green/20 text-neon-green' : 
                sellingPrice > 0 ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-500/20 text-gray-600'
              }`}>
                <DollarSign className="w-4 h-4" />
                <span className="font-mono">{t('ui:development.steps.pricing')}</span>
              </div>
            </div>
          </div>

          <div className={`grid gap-6 ${currentStep === 'testreport' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
            {/* Hauptbereich */}
            <div className={currentStep === 'testreport' ? '' : 'lg:col-span-2 space-y-6'}>
              
              {/* SCHRITT 1: {t('hardware.components.selection')} */}
              {currentStep === 'components' && (
                <>
                  {['cpu', 'gpu', 'memory', 'sound', 'storage', 'display'].map(type => (
                    <Card key={type} className="retro-border bg-card/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-neon-cyan flex items-center space-x-2">
                          {(() => {
                            const IconComponent = getComponentIcon(type as HardwareComponent['type']);
                            return <IconComponent className="w-5 h-5" />;
                          })()}
                          <span>
                            {type === 'cpu' && t('hardware:types.cpuRequired')}
                            {type === 'gpu' && t('hardware:types.gpuRequired')}
                            {type === 'memory' && t('hardware:types.memoryRequired')}
                            {type === 'sound' && t('hardware:types.soundOptional')}
                            {type === 'storage' && t('hardware:types.storageOptional')}
                            {type === 'display' && t('hardware:types.displayOptional')}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {allComponents
                            .filter(comp => comp.type === type)
                            .map(component => {
                              const isSelected = selectedComponents.some(c => c.id === component.id);
                              const IconComponent = getComponentIcon(component.type);
                              const isAvailable = component.available;
                              const isCustomChip = component.name.includes('⭐');
                              
                              return (
                                <div
                                  key={component.id}
                                  onClick={() => isAvailable && toggleComponent(component)}
                                  className={`
                                    p-3 rounded-lg border transition-all relative
                                    ${!isAvailable 
                                      ? 'border-gray-600/30 bg-gray-800/10 cursor-not-allowed opacity-50' 
                                      : isSelected 
                                        ? `border-neon-green bg-neon-green/10 shadow-lg shadow-neon-green/20 cursor-pointer hover:scale-105 ${isCustomChip ? 'ring-2 ring-yellow-400/50' : ''}` 
                                        : `border-terminal-green/30 bg-card/10 hover:border-terminal-green/50 cursor-pointer hover:scale-105 ${isCustomChip ? 'border-yellow-400/50' : ''}`
                                    }
                                  `}
                                >
                                  {!isAvailable && (
                                    <div className="absolute top-2 right-2">
                                      <Lock className="w-4 h-4 text-red-400" />
                                    </div>
                                  )}
                                  {isCustomChip && (
                                    <div className="absolute top-2 right-2">
                                      <span className="text-yellow-400 text-lg">⭐</span>
                                    </div>
                                  )}
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-2">
                                      <IconComponent className={`w-4 h-4 ${isAvailable ? (isCustomChip ? 'text-yellow-400' : 'text-terminal-green') : 'text-gray-500'}`} />
                                      <div>
                                        <h4 className={`font-semibold ${isAvailable ? (isCustomChip ? 'text-yellow-400' : 'text-terminal-green') : 'text-gray-500'}`}>
                                          {component.name}
                                        </h4>
                                        <p className={`text-xs ${isAvailable ? 'text-muted-foreground' : 'text-gray-600'}`}>
                                          {component.description}
                                        </p>
                                        {!isAvailable && (
                                          <p className="text-xs text-yellow-400 mt-1">
                                            {t('hardware:availability.availableAt', { year: component.year, quarter: component.quarter || 1 })}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <Badge className={isAvailable ? (isCustomChip ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : getTypeColor(component.type)) : 'bg-gray-500/20 text-gray-500 border-gray-500/30'}>
                                        {component.performance}/100
                                      </Badge>
                                      <p className={`text-xs mt-1 ${isAvailable ? (isCustomChip ? 'text-yellow-400' : 'text-terminal-green') : 'text-gray-500'}`}>
                                        ${component.cost.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          }
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}

              {/* SCHRITT 2: Case-Auswahl */}
              {currentStep === 'case' && (
                <>
                  {/* Gaming Cases */}
                  <Card className="retro-border bg-card/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-neon-cyan flex items-center space-x-2">
                        <Gamepad2 className="w-5 h-5" />
                        <span>{t('ui:caseSelection.gamerCases')}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {computerCases.filter(c => c.type === 'gamer').map(computerCase => (
                          <div
                            key={computerCase.id}
                            onClick={() => handleCaseSelection(computerCase)}
                            className={`
                              p-4 rounded-lg border cursor-pointer transition-all hover:scale-105
                              ${selectedCase?.id === computerCase.id 
                                ? 'border-neon-green bg-neon-green/10 shadow-lg shadow-neon-green/20' 
                                : 'border-terminal-green/30 bg-card/10 hover:border-terminal-green/50'
                              }
                            `}
                          >
                            <h4 className="font-semibold text-neon-cyan mb-2">{computerCase.name}</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Qualität:</span>
                                <span className="text-neon-green">{computerCase.quality}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Design:</span>
                                <span className="text-purple-400">{computerCase.design}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Preis:</span>
                                <span className="text-yellow-400">${computerCase.price}</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {computerCase.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Office Cases */}
                  <Card className="retro-border bg-card/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-400 flex items-center space-x-2">
                        <Briefcase className="w-5 h-5" />
                        <span>{t('ui:caseSelection.officeCases')}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {computerCases.filter(c => c.type === 'office').map(computerCase => (
                          <div
                            key={computerCase.id}
                            onClick={() => handleCaseSelection(computerCase)}
                            className={`
                              p-4 rounded-lg border cursor-pointer transition-all hover:scale-105
                              ${selectedCase?.id === computerCase.id 
                                ? 'border-neon-green bg-neon-green/10 shadow-lg shadow-neon-green/20' 
                                : 'border-terminal-green/30 bg-card/10 hover:border-terminal-green/50'
                              }
                            `}
                          >
                            <h4 className="font-semibold text-gray-300 mb-2">{computerCase.name}</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Qualität:</span>
                                <span className="text-neon-green">{computerCase.quality}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Design:</span>
                                <span className="text-blue-400">{computerCase.design}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Preis:</span>
                                <span className="text-yellow-400">${computerCase.price}</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {computerCase.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* SCHRITT 3: Name eingeben */}
              {currentStep === 'name' && (
                <Card className="retro-border bg-card/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-neon-cyan">Computer benennen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Label htmlFor="model-name" className="text-muted-foreground">
                      Geben Sie Ihrem Computer einen Namen:
                    </Label>
                    <Input
                      id="model-name"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      placeholder="z.B. HomeComputer Pro 1985"
                      className="bg-background border-terminal-green/30 focus:border-terminal-green"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('ui:development.descriptions.developmentDuration', {
                        quarters: averagePerformance <= 40 ? '1' : '2',
                        plural: averagePerformance <= 40 ? '' : 'e'
                      })}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* SCHRITT 4: Preissetzung */}
              {currentStep === 'pricing' && (
                <Card className="retro-border bg-card/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-neon-cyan flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Verkaufspreis festlegen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 border border-terminal-green/30">
                        <h4 className="font-semibold text-red-400 mb-2">Mindestpreis</h4>
                        <p className="text-2xl font-mono text-red-400">${minPrice.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">10% Marge</p>
                      </Card>
                      
                      <Card className="p-4 border border-neon-green">
                        <h4 className="font-semibold text-neon-green mb-2">Empfohlen</h4>
                        <p className="text-2xl font-mono text-neon-green">${suggestedPrice.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">80% Marge (Standard)</p>
                      </Card>
                      
                      <Card className="p-4 border border-terminal-green/30">
                        <h4 className="font-semibold text-yellow-400 mb-2">Maximaler Preis</h4>
                        <p className="text-2xl font-mono text-yellow-400">${maxPrice.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">300% Marge</p>
                      </Card>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Button 
                          onClick={() => setSellingPrice(suggestedPrice)}
                          className="glow-button"
                          variant={sellingPrice === suggestedPrice ? "default" : "outline"}
                        >
                          Empfohlenen Preis übernehmen
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="custom-price" className="text-muted-foreground">
                          Oder eigenen Preis festlegen:
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-terminal-green font-mono">$</span>
                          <Input
                            id="custom-price"
                            type="number"
                            value={sellingPrice || ''}
                            onChange={(e) => setSellingPrice(parseInt(e.target.value) || 0)}
                            placeholder={suggestedPrice.toString()}
                            className="bg-background border-terminal-green/30 focus:border-terminal-green font-mono"
                            min={minPrice}
                            max={maxPrice}
                          />
                        </div>
                        
                        {sellingPrice > 0 && (
                          <div className="mt-4 p-4 border rounded-lg">
                            <h4 className="font-semibold text-neon-cyan mb-3">Preisanalyse</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Gewinn pro Einheit:</span>
                                <p className="font-mono text-neon-green">
                                  ${(sellingPrice - totalCost).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Gewinnmarge:</span>
                                <p className="font-mono text-neon-green">
                                  {Math.round(((sellingPrice - totalCost) / totalCost) * 100)}%
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-xs text-muted-foreground">
                                {sellingPrice < minPrice && (
                                  <p className="text-red-400">⚠️ Preis unter Mindestmarge - Verlustrisiko!</p>
                                )}
                                {sellingPrice >= minPrice && sellingPrice <= suggestedPrice && (
                                  <p className="text-yellow-400">💡 Aggressiver Preis - Mehr Verkäufe, weniger Gewinn</p>
                                )}
                                {sellingPrice > suggestedPrice && sellingPrice <= maxPrice && (
                                  <p className="text-neon-green">🎯 Premium-Preis - Weniger Verkäufe, höhere Marge</p>
                                )}
                                {sellingPrice > maxPrice && (
                                  <p className="text-red-400">⚠️ Sehr hoher Preis - Verkaufsrisiko!</p>
                                 )}
                               </div>
                             </div>
                           </div>
                         )}
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               )}
               
                {/* SCHRITT 5: Testbericht */}
                {currentStep === 'testreport' && developedModel && (
                  <TestReport
                    model={{...developedModel, id: modelId}}
                    testResult={EnhancedTestReportGenerator.generateTestReport({...developedModel, id: modelId}, currentYear)}
                    onContinue={finalizeModel}
                    onRevise={() => setCurrentStep('pricing')}
                  />
                )}
            </div>

            {/* Seitenleiste - nur wenn nicht im Testbericht */}
            {currentStep !== 'testreport' && (
              <div className="space-y-6">
                <Card className="retro-border bg-card/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-neon-cyan">Computer-Konfiguration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedComponents.length === 0 && !selectedCase ? (
                      <p className="text-muted-foreground text-center py-8">
                        {t('hardware:components.selectPrompt')}
                      </p>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {selectedComponents.map(comp => (
                            <div key={comp.id} className="flex justify-between items-center text-sm">
                              <span className="text-terminal-green">{comp.name}</span>
                              <Badge className={getTypeColor(comp.type)}>
                                {comp.performance}/100
                              </Badge>
                            </div>
                          ))}
                          
                          {selectedCase && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-terminal-green">{selectedCase.name}</span>
                              <Badge className="bg-gray-500/20 text-gray-300">
                                Case
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="border-t border-terminal-green/30 pt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('ui:development.labels.averagePerformance')}:</span>
                            <span className="text-neon-green font-bold">{averagePerformance}/100</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('ui:development.labels.complexity')}:</span>
                            <span className="text-neon-cyan font-bold">
                              {averagePerformance <= 40 
                                ? t('ui:development.descriptions.complexitySimple')
                                : t('ui:development.descriptions.complexityMedium')}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('ui:development.labels.developmentCost')}:</span>
                            <span className="text-neon-cyan font-bold">${totalCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('ui:development.labels.sellingPrice')}:</span>
                            <span className="text-yellow-400 font-bold">
                              {sellingPrice > 0 
                                ? `$${sellingPrice.toLocaleString()}` 
                                : `$${suggestedPrice.toLocaleString()} (${t('ui:development.labels.recommended')})`}
                            </span>
                          </div>
                        </div>
                        
                        {/* Navigation */}
                        <div className="pt-4 space-y-2">
                          {currentStep === 'components' && (
                            <Button
                              onClick={() => setCurrentStep('case')}
                              disabled={!canProceedToCase}
                              className="w-full glow-button"
                            >
                              <ChevronRight className="w-4 h-4 mr-2" />
                              Weiter zu Gehäuse
                            </Button>
                          )}
                          
                          {currentStep === 'case' && (
                            <div className="space-y-2">
                              <Button
                                onClick={() => setCurrentStep('components')}
                                variant="outline"
                                className="w-full retro-border bg-card/20"
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                {t('hardware.components.backToComponents')}
                              </Button>
                              <Button
                                onClick={() => setCurrentStep('name')}
                                disabled={!selectedCase}
                                className="w-full glow-button"
                              >
                                <ChevronRight className="w-4 h-4 mr-2" />
                                Weiter zu Name
                              </Button>
                            </div>
                          )}
                          
                          {currentStep === 'name' && (
                            <div className="space-y-2">
                              <Button
                                onClick={() => setCurrentStep('case')}
                                variant="outline"
                                className="w-full retro-border bg-card/20"
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Zurück zu Gehäuse
                              </Button>
                              <Button
                                onClick={() => setCurrentStep('pricing')}
                                disabled={!canProceedToPricing}
                                className="w-full glow-button"
                              >
                                <ChevronRight className="w-4 h-4 mr-2" />
                                Weiter zu Preissetzung
                              </Button>
                            </div>
                          )}
                          
                          {currentStep === 'pricing' && (
                            <div className="space-y-2">
                              <Button
                                onClick={() => setCurrentStep('name')}
                                variant="outline"
                                className="w-full retro-border bg-card/20"
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Zurück zu Name
                              </Button>
                              <Button
                                onClick={startDevelopment}
                                disabled={!canFinish}
                                className="w-full glow-button"
                              >
                                <Zap className="w-4 h-4 mr-2" />
                                Computer testen
                              </Button>
                            </div>
                          )}
                          
                          {!canProceedToCase && currentStep === 'components' && (
                            <p className="text-xs text-red-400 text-center">
                              {t('hardware:components.required')}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};