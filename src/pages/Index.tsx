import { useState } from "react";
import { CompanySelection } from "@/components/CompanySelection";
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

interface GameState {
  company: {
    name: string;
    cash: number;
    employees: number;
    reputation: number;
    marketShare: number;
  };
  quarter: number;
  year: number;
}

type GameScreen = 'company-selection' | 'dashboard' | 'development' | 'market' | 'team';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('company-selection');
  const [gameState, setGameState] = useState<GameState>({
    company: {
      name: '',
      cash: 0,
      employees: 12,
      reputation: 45,
      marketShare: 8
    },
    quarter: 1,
    year: 1983
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
    setCurrentScreen('dashboard');
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
      
      case 'dashboard':
        return (
          <GameDashboard 
            gameState={gameState}
            onNextTurn={handleNextTurn}
            onDevelopComputer={() => setCurrentScreen('development')}
            onViewMarket={() => setCurrentScreen('market')}
            onManageTeam={() => setCurrentScreen('team')}
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
