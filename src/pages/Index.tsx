import { useState } from "react";
import { GameIntro } from "@/components/GameIntro";
import { CompanySetup, CompanySetupData } from "@/components/CompanySetup";
import { GameDashboard } from "@/components/GameDashboard";
import { ComputerDevelopment } from "@/components/ComputerDevelopment";
import { CaseSelection } from "@/components/CaseSelection";
import { QuarterResults } from "@/components/QuarterResults";
import { GameMechanics, INITIAL_COMPETITORS, type Competitor, type MarketEvent } from "@/components/GameMechanics";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  description: string;
  startingCash: number;
  speciality: string;
  icon: React.ReactNode;
}

interface ComputerModel {
  id: string;
  name: string;
  cpu: string;
  ram: string;
  gpu?: string;
  soundchip?: string;
  accessories?: string[];
  case?: {
    id: string;
    name: string;
    type: 'gamer' | 'office';
    quality: number;
    design: number;
    price: number;
  };
  price: number;
  unitsSold: number;
  developmentCost: number;
  releaseQuarter: number;
  releaseYear: number;
  status: 'development' | 'released' | 'discontinued';
  developmentTime: number;
  developmentProgress: number;
  complexity: number;
}

interface Budget {
  marketing: number;
  development: number;
  research: number;
}

interface GameState {
  company: {
    name: string;
    logo: string;
    cash: number;
    employees: number;
    reputation: number;
    marketShare: number;
    monthlyIncome: number;
    monthlyExpenses: number;
  };
  quarter: number;
  year: number;
  models: ComputerModel[];
  budget: Budget;
  competitors: Competitor[];
  marketEvents: MarketEvent[];
  totalMarketSize: number;
}

type GameScreen = 'intro' | 'company-setup' | 'dashboard' | 'development' | 'case-selection' | 'quarter-results';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('intro');
  const [quarterResults, setQuarterResults] = useState<any>(null);
  const [tempModel, setTempModel] = useState<ComputerModel | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    company: {
      name: '',
      logo: '',
      cash: 3000000, // Startkapital: 3 Millionen $
      employees: 8, // Kleines Team
      reputation: 50, // Startwert für Reputation
      marketShare: 0, // Kein Marktanteil
      monthlyIncome: 0, // Noch keine Einnahmen
      monthlyExpenses: 45000 // Laufende Kosten für 8 Mitarbeiter
    },
    quarter: 1,
    year: 1983,
    models: [],
    budget: {
      marketing: 15000,
      development: 25000, 
      research: 5000
    },
    competitors: INITIAL_COMPETITORS,
    marketEvents: [],
    totalMarketSize: 1000000 // 1 Million $ Gesamtmarkt 1983
  });

  const handleIntroComplete = () => {
    setCurrentScreen('company-setup');
  };

  const handleCompanySetup = (setup: CompanySetupData) => {
    setGameState(prev => ({
      ...prev,
      company: {
        ...prev.company,
        name: setup.name,
        logo: setup.logo
      }
    }));
    setCurrentScreen('dashboard');
  };

  const handleBudgetChange = (newBudget: Budget) => {
    setGameState(prev => ({
      ...prev,
      budget: newBudget
    }));
  };

  const handleDevelopNewModel = () => {
    setCurrentScreen('development');
  };

  const handleCaseSelection = (model: ComputerModel) => {
    setTempModel(model);
    setCurrentScreen('case-selection');
  };

  const handleCaseSelected = (computerCase: any) => {
    if (tempModel) {
      const finalModel: ComputerModel = {
        ...tempModel,
        case: computerCase,
        price: tempModel.price + computerCase.price, // Add case price to total
        developmentCost: tempModel.developmentCost + computerCase.price
      };
      
      setGameState(prev => ({
        ...prev,
        models: [...prev.models, finalModel],
        company: {
          ...prev.company,
          cash: prev.company.cash - finalModel.developmentCost
        }
      }));
      
      setTempModel(null);
      setCurrentScreen('dashboard');
      
      toast.success(`${finalModel.name} mit ${computerCase.name} Case entwickelt!`);
    }
  };

  const handleModelComplete = (model: ComputerModel) => {
    // This is now just for legacy - should not be called
    setGameState(prev => ({
      ...prev,
      models: [...prev.models, model],
      company: {
        ...prev.company,
        cash: prev.company.cash - model.developmentCost
      }
    }));
    setCurrentScreen('dashboard');
  };

  const handleNextTurn = () => {
    // Verarbeite das Quartal mit der neuen GameMechanics Logik
    const result = GameMechanics.processQuarterTurn(gameState, gameState.competitors);
    
    // Zeige Quartalsresultate
    setQuarterResults({
      quarter: gameState.quarter,
      year: gameState.year,
      results: result.quarterResults
    });
    
    // Aktualisiere den Spielzustand für das nächste Quartal
    const nextQuarter = gameState.quarter === 4 ? 1 : gameState.quarter + 1;
    const nextYear = gameState.quarter === 4 ? gameState.year + 1 : gameState.year;
    
    setGameState({
      ...result.updatedGameState,
      quarter: nextQuarter,
      year: nextYear,
      competitors: result.updatedCompetitors
    });
    
    setCurrentScreen('quarter-results');
  };

  const handleContinueFromResults = () => {
    setCurrentScreen('dashboard');
    setQuarterResults(null);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'intro':
        return <GameIntro onComplete={handleIntroComplete} />;
      
      case 'company-setup':
        return <CompanySetup onSetupComplete={handleCompanySetup} />;
      
      case 'dashboard':
        return (
          <GameDashboard 
            gameState={gameState}
            onNextTurn={handleNextTurn}
            onBudgetChange={handleBudgetChange}
            onDevelopNewModel={handleDevelopNewModel}
          />
        );
      
      case 'development':
        return (
          <ComputerDevelopment 
            onBack={() => setCurrentScreen('dashboard')}
            onModelComplete={handleModelComplete}
            onCaseSelection={handleCaseSelection}
          />
        );
      
      case 'case-selection':
        return tempModel ? (
          <CaseSelection
            onBack={() => setCurrentScreen('development')}
            onCaseSelected={handleCaseSelected}
            computerSpecs={tempModel}
          />
        ) : null;
      
      case 'quarter-results':
        return quarterResults ? (
          <QuarterResults 
            quarter={quarterResults.quarter}
            year={quarterResults.year}
            results={quarterResults.results}
            onContinue={handleContinueFromResults}
          />
        ) : null;
      
      default:
        return <GameIntro onComplete={handleIntroComplete} />;
    }
  };

  return renderCurrentScreen();
};

export default Index;