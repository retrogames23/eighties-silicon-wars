import { useState, useCallback, useMemo } from 'react';
import { GAME_CONSTANTS } from '@/lib/constants';

interface GameState {
  currentQuarter: number;
  currentYear: number;
  company: {
    name: string;
    cash: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    reputation: number;
    marketShare: number;
    hardwareIncome?: number;
    additionalRevenue?: {
      softwareLicenses: { games: number; office: number };
      supportService: { b2c: number; b2b: number };
    };
  };
  budget: {
    marketing: number;
    development: number;
    research: number;
  };
  models: any[];
  [key: string]: any;
}

/**
 * Custom Hook für Game State Management
 * Zentralisiert State-Updates und berechnet abgeleitete Werte
 */
export function useGameState(initialState: GameState) {
  const [gameState, setGameState] = useState<GameState>(initialState);

  // Memoized computed values
  const computedValues = useMemo(() => {
    const totalBudget = gameState.budget.marketing + gameState.budget.development + gameState.budget.research;
    const monthlyBudgetExpenses = Math.round(totalBudget / GAME_CONSTANTS.MONTHS_PER_QUARTER);
    
    // Additional revenue calculations
    const additionalRevenue = gameState.company.additionalRevenue || {
      softwareLicenses: { games: 0, office: 0 },
      supportService: { b2c: 0, b2b: 0 }
    };
    
    const softwareIncome = (additionalRevenue.softwareLicenses.games + additionalRevenue.softwareLicenses.office) / GAME_CONSTANTS.MONTHS_PER_QUARTER;
    const serviceIncome = (additionalRevenue.supportService.b2c + additionalRevenue.supportService.b2b) / GAME_CONSTANTS.MONTHS_PER_QUARTER;
    const hardwareIncome = gameState.company.hardwareIncome ?? 0;
    
    const totalIncome = hardwareIncome + softwareIncome + serviceIncome;
    const totalExpenses = monthlyBudgetExpenses;
    const netProfit = totalIncome - totalExpenses;
    
    return {
      totalBudget,
      monthlyBudgetExpenses,
      totalIncome,
      totalExpenses, 
      netProfit,
      additionalRevenue,
      softwareIncome,
      serviceIncome,
      hardwareIncome,
    };
  }, [gameState.budget, gameState.company]);

  // State update functions
  const updateBudget = useCallback((newBudget: Partial<GameState['budget']>) => {
    setGameState(prev => ({
      ...prev,
      budget: { ...prev.budget, ...newBudget }
    }));
  }, []);

  const updateCompany = useCallback((companyUpdates: Partial<GameState['company']>) => {
    setGameState(prev => ({
      ...prev,
      company: { ...prev.company, ...companyUpdates }
    }));
  }, []);

  const updateModels = useCallback((models: any[]) => {
    setGameState(prev => ({
      ...prev,
      models
    }));
  }, []);

  const nextQuarter = useCallback(() => {
    setGameState(prev => {
      if (prev.currentQuarter === GAME_CONSTANTS.QUARTERS_PER_YEAR) {
        return {
          ...prev,
          currentQuarter: 1,
          currentYear: prev.currentYear + 1
        };
      }
      return {
        ...prev,
        currentQuarter: prev.currentQuarter + 1
      };
    });
  }, []);

  const setGameStateDirectly = useCallback((newState: GameState) => {
    setGameState(newState);
  }, []);

  return {
    gameState,
    computedValues,
    actions: {
      updateBudget,
      updateCompany,
      updateModels,
      nextQuarter,
      setGameState: setGameStateDirectly,
    }
  };
}