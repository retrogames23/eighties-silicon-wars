import { useState } from "react";
import { CompanySelection } from "@/components/CompanySelection";
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

type GameScreen = 'company-selection' | 'company-setup' | 'dashboard' | 'development' | 'market' | 'team';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('company-selection');
  const [gameState, setGameState] = useState<GameState>({
    company: {
      name: '',
      logo: '',
      cash: 0,
      employees: 12,
      reputation: 45,
      marketShare: 8,
      monthlyIncome: 115000,
      monthlyExpenses: 115000
    },
    quarter: 1,
    year: 1983,
    models: [],
    budget: {
      marketing: 50000,
      development: 75000,
      research: 25000
    }
  });

  const handleCompanySelection = (company: Company) => {
    setGameState(prev => ({
      ...prev,
      company: {
        ...prev.company,
        name: company.name,
        cash: company.startingCash
      }
    }));
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
          // Simple simulation of quarterly changes
          cash: prev.company.cash + Math.random() * 50000 - 25000,
          reputation: Math.min(100, Math.max(0, prev.company.reputation + Math.random() * 10 - 5)),
          marketShare: Math.min(100, Math.max(0, prev.company.marketShare + Math.random() * 5 - 2.5))
        }
      };
    });
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'company-selection':
        return <CompanySelection onSelectCompany={handleCompanySelection} />;
      
      case 'company-setup':
        return <CompanySetup onSetupComplete={handleCompanySetup} />;
      
      case 'dashboard':
        return (
          <GameDashboard 
            gameState={gameState}
            onNextTurn={handleNextTurn}
            onBudgetChange={handleBudgetChange}
          />
        );
      
      case 'development':
        return (
          <ComputerDevelopment 
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      
      default:
        return <CompanySelection onSelectCompany={handleCompanySelection} />;
    }
  };

  return renderCurrentScreen();
};

export default Index;
