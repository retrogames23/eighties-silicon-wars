import { useState } from "react";
import { GameIntro } from "@/components/GameIntro";
import { CompanySetup, CompanySetupData } from "@/components/CompanySetup";
import { GameDashboard } from "@/components/GameDashboard";
import { ComputerDevelopment } from "@/components/ComputerDevelopment";
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
  competitors: Competitor[];
  marketEvents: MarketEvent[];
  totalMarketSize: number;
}

type GameScreen = 'intro' | 'company-setup' | 'dashboard' | 'development' | 'market' | 'team';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('intro');
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

  const handleModelComplete = (model: ComputerModel) => {
    setGameState(prev => ({
      ...prev,
      models: [...prev.models, model],
      company: {
        ...prev.company,
        cash: prev.company.cash - model.developmentCost
      }
    }));
  };

  const handleNextTurn = () => {
    setGameState(prev => {
      const newQuarter = prev.quarter === 4 ? 1 : prev.quarter + 1;
      const newYear = prev.quarter === 4 ? prev.year + 1 : prev.year;
      
      // Calculate quarterly revenue from released models
      const quarterlyRevenue = prev.models.reduce((total, model) => {
        if (model.status === 'released') {
          return total + GameMechanics.calculateRevenue(
            model, 
            prev.company.marketShare, 
            prev.budget.marketing, 
            prev.totalMarketSize
          );
        }
        return total;
      }, 0);
      
      // Update market share based on performance
      const newMarketShare = GameMechanics.calculateMarketShare(
        prev.models,
        prev.budget.marketing,
        prev.company.reputation,
        prev.competitors,
        prev.totalMarketSize
      );
      
      // Update competitors
      const updatedCompetitors = GameMechanics.updateCompetitors(prev.competitors, newQuarter, newYear);
      
      // Check for market events
      const marketEvent = GameMechanics.getRandomMarketEvent();
      const newMarketEvents = marketEvent ? [...prev.marketEvents, marketEvent] : prev.marketEvents;
      
      // Show notifications
      if (quarterlyRevenue > 0) {
        toast.success(`Quartalsumsatz: $${quarterlyRevenue.toLocaleString()}`);
      }
      if (marketEvent) {
        toast.info(`Marktereignis: ${marketEvent.title}`);
      }
      
      // Budget expenses per quarter
      const quarterlyBudgetCosts = (prev.budget.marketing + prev.budget.development + prev.budget.research) * 3;
      
      return {
        ...prev,
        quarter: newQuarter,
        year: newYear,
        competitors: updatedCompetitors,
        marketEvents: newMarketEvents,
        totalMarketSize: prev.totalMarketSize * (1 + (newYear - 1983) * 0.1), // Market grows 10% per year
        company: {
          ...prev.company,
          cash: prev.company.cash + quarterlyRevenue - prev.company.monthlyExpenses * 3 - quarterlyBudgetCosts,
          monthlyIncome: quarterlyRevenue / 3, // Show monthly equivalent
          reputation: Math.min(100, Math.max(0, prev.company.reputation + (quarterlyRevenue > 0 ? 2 : -1))),
          marketShare: newMarketShare
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
            onModelComplete={handleModelComplete}
          />
        );
      
      default:
        return <GameIntro onComplete={handleIntroComplete} />;
    }
  };

  return renderCurrentScreen();
};

export default Index;
