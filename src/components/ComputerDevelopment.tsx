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
import { TestScoringMatrix } from "@/services/TestScoringMatrix";
import { useTranslation } from 'react-i18next';
import { Workbench } from './development/Workbench';
import type { SlotType } from './development/partTokens';
import type { PresetKind } from './development/QuickBuildPresets';


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
  const [currentStep, setCurrentStep] = useState<'build' | 'testreport'>('build');
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
    
  // Era-relative preview score (what the test report will likely show)
  const cpuName = selectedComponents.find(c => c.type === 'cpu')?.name || '';
  const gpuName = selectedComponents.find(c => c.type === 'gpu')?.name || '';
  const ramName = selectedComponents.find(c => c.type === 'memory')?.name || '';
  const soundName = selectedComponents.find(c => c.type === 'sound')?.name || 'PC Speaker';
  
  const eraRelativeScore = cpuName && gpuName && ramName
    ? TestScoringMatrix.getEraRelativeOverallScore(cpuName, gpuName, ramName, soundName, currentYear, currentQuarter)
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

  // Empfehlung muss mindestens die Standard-Marge (80%) abdecken und
  // im erlaubten Band [minPrice, maxPrice] liegen. Vorher konnte der
  // marktbasierte Vorschlag unter dem Mindestpreis landen.
  const costBasedRecommended = Math.round(totalCost * 1.8); // 80% Standardmarge
  suggestedPrice = Math.min(
    maxPrice,
    Math.max(minPrice, costBasedRecommended, suggestedPrice)
  );

  // Setze Verkaufspreis automatisch auf empfohlenen Preis wenn noch nicht gesetzt
  if (sellingPrice === 0 && suggestedPrice > 0) {
    setSellingPrice(suggestedPrice);
  }

  // Initialize state from editing model if provided
  React.useEffect(() => {
    if (editingModel) {
      setCurrentStep('build');
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

  // --- Workbench helpers (presentation only, no game logic changes) ---
  const selectedBySlot = selectedComponents.reduce((acc, comp) => {
    acc[comp.type as SlotType] = comp;
    return acc;
  }, {} as Partial<Record<SlotType, HardwareComponent>>);

  const clearSlot = (slot: SlotType) => {
    if (slot === 'case') {
      setSelectedCase(null);
      return;
    }
    setSelectedComponents(prev => prev.filter(c => c.type !== slot));
  };

  const applyPreset = (kind: PresetKind) => {
    const pick = (type: HardwareComponent['type']) => {
      const options = allComponents
        .filter(c => c.type === type && c.available)
        .sort((a, b) => a.performance - b.performance);
      if (options.length === 0) return undefined;
      if (kind === 'budget') return options[0];
      if (kind === 'highend') return options[options.length - 1];
      return options[Math.floor((options.length - 1) / 2)];
    };

    const picked = (['cpu', 'gpu', 'memory', 'sound'] as HardwareComponent['type'][])
      .map(pick)
      .filter((c): c is HardwareComponent => !!c);
    setSelectedComponents(picked);

    const caseOptions = [...computerCases].sort((a, b) => a.price - b.price);
    const caseItem = kind === 'budget'
      ? caseOptions[0]
      : kind === 'highend'
        ? caseOptions[caseOptions.length - 1]
        : caseOptions[Math.floor((caseOptions.length - 1) / 2)];
    setSelectedCase(caseItem);
    setSellingPrice(0);
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
    <div className="min-h-screen bg-gradient-crt p-4 md:p-6">
      <div className="crt-screen">
        <div className="scanline" />

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button
              onClick={onBack}
              variant="outline"
              className="retro-border bg-card/20 hover:bg-card/40 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('ui:development.sections.backToDashboard')}
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold neon-text text-neon-green">
              {t('ui:development.sections.computerDevelopment')}
            </h1>
          </div>

          {currentStep === 'build' && (
            <Workbench
              components={allComponents}
              cases={computerCases}
              selected={selectedBySlot}
              selectedCase={selectedCase}
              onPickComponent={toggleComponent}
              onPickCase={handleCaseSelection}
              onClearSlot={clearSlot}
              onApplyPreset={applyPreset}
              modelName={modelName}
              onModelNameChange={setModelName}
              sellingPrice={sellingPrice}
              onPriceChange={setSellingPrice}
              suggestedPrice={suggestedPrice}
              minPrice={minPrice}
              maxPrice={maxPrice}
              totalCost={totalCost}
              performance={averagePerformance}
              eraScore={eraRelativeScore}
              currentYear={currentYear}
              canFinish={canFinish}
              onFinish={startDevelopment}
            />
          )}

          {currentStep === 'testreport' && developedModel && (
            <TestReport
              model={{ ...developedModel, id: modelId }}
              testResult={EnhancedTestReportGenerator.generateTestReport({ ...developedModel, id: modelId }, currentYear, currentQuarter)}
              onContinue={finalizeModel}
              onRevise={() => setCurrentStep('build')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
