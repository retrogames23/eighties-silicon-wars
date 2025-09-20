import { useState } from "react";
import { GameIntro } from "@/components/GameIntro";
import { CompanySetup, CompanySetupData } from "@/components/CompanySetup";
import { GameDashboard } from "@/components/GameDashboard";
import { ComputerDevelopment } from "@/components/ComputerDevelopment";

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
  price: number;
  unitsSold: number;
  developmentCost: number;
  releaseQuarter: number;
  releaseYear: number;
  status: 'development' | 'released' | 'discontinued';
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
}

type GameScreen = 'intro' | 'company-setup' | 'dashboard' | 'development' | 'market' | 'team';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('intro');
  const [gameState, setGameState] = useState<GameState>({
    company: {
      name: '',
      logo: '',
      cash: 500000, // Startkapital: 500.000 $
      employees: 8, // Kleines Team
      reputation: 0, // Noch unbekannt
      marketShare: 0, // Kein Marktanteil
      monthlyIncome: 0, // Keine Einnahmen
      monthlyExpenses: 45000 // Laufende Kosten für 8 Mitarbeiter
    },
    quarter: 1,
    year: 1983,
    models: [],
    budget: {
      marketing: 15000,
      development: 25000, 
      research: 5000
    }
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
    const cpuOptions = ['MOS 6502', 'Zilog Z80', 'Motorola 68000', 'Intel 8086'];
    const ramOptions = ['4KB', '8KB', '16KB', '32KB', '64KB', '128KB'];
    
    const randomCpu = cpuOptions[Math.floor(Math.random() * cpuOptions.length)];
    const randomRam = ramOptions[Math.floor(Math.random() * ramOptions.length)];
    
    const newModel: ComputerModel = {
      id: `model-${Date.now()}`,
      name: `Computer-${gameState.models.length + 1}`,
      cpu: randomCpu,
      ram: randomRam,
      price: Math.floor(Math.random() * 2000) + 500,
      unitsSold: 0,
      developmentCost: Math.floor(Math.random() * 100000) + 50000,
      releaseQuarter: gameState.quarter + 1 > 4 ? 1 : gameState.quarter + 1,
      releaseYear: gameState.quarter + 1 > 4 ? gameState.year + 1 : gameState.year,
      status: 'development'
    };

    setGameState(prev => ({
      ...prev,
      models: [...prev.models, newModel],
      company: {
        ...prev.company,
        cash: prev.company.cash - newModel.developmentCost
      }
    }));
  };

  const handleNextTurn = () => {
    setGameState(prev => {
      const newQuarter = prev.quarter === 4 ? 1 : prev.quarter + 1;
      const newYear = prev.quarter === 4 ? prev.year + 1 : prev.year;
      
      return {
        ...prev,
        quarter: newQuarter,
        year: newYear,
        company: {
          ...prev.company,
          // Realistic quarterly changes - subtract expenses, no income initially
          cash: prev.company.cash + prev.company.monthlyIncome * 3 - prev.company.monthlyExpenses * 3,
          reputation: Math.min(100, Math.max(0, prev.company.reputation + Math.random() * 3 - 1)),
          marketShare: Math.min(100, Math.max(0, prev.company.marketShare + Math.random() * 1 - 0.5))
        }
      };
    });
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
          />
        );
      
      default:
        return <GameIntro onComplete={handleIntroComplete} />;
    }
  };

  return renderCurrentScreen();
};

export default Index;
