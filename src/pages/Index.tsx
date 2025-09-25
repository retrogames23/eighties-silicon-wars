import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { GameIntro } from "@/components/GameIntro";
import { CompanySetup, CompanySetupData } from "@/components/CompanySetup";
import { GameDashboard } from "@/components/GameDashboard";
import { ComputerDevelopment } from "@/components/ComputerDevelopment";
import { CaseSelection } from "@/components/CaseSelection";
import { QuarterResults } from "@/components/QuarterResults";
import { GameEnd } from "@/components/GameEnd";
import { MusicToggle } from "@/components/MusicToggle";
import { HardwareAnnouncement } from "@/components/HardwareAnnouncement";
import { Newspaper } from "@/components/Newspaper";
import { SaveGameManager } from "@/components/SaveGameManager";
import { GameMechanics, INITIAL_COMPETITORS, type Competitor, type MarketEvent, type CustomChip, type GameEndCondition } from "@/components/GameMechanics";
import { toast } from "@/hooks/use-toast";

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
    hardwareIncome?: number;
    additionalRevenue?: {
      softwareLicenses: { games: number; office: number };
      supportService: { b2c: number; b2b: number };
    };
  };
  quarter: number;
  year: number;
  models: ComputerModel[];
  budget: Budget;
  competitors: Competitor[];
  marketEvents: MarketEvent[];
  totalMarketSize: number;
  customChips: CustomChip[];
  totalRevenue: number;
}

type GameScreen = 'intro' | 'company-setup' | 'dashboard' | 'development' | 'case-selection' | 'quarter-results' | 'game-end';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('intro');
  const [quarterResults, setQuarterResults] = useState<any>(null);
  const [tempModel, setTempModel] = useState<ComputerModel | null>(null);
  const [gameEndCondition, setGameEndCondition] = useState<GameEndCondition | null>(null);
  const [showSaveManager, setShowSaveManager] = useState(false);
  
  // Hardware announcement state
  const [hardwareAnnouncement, setHardwareAnnouncement] = useState<{
    isOpen: boolean;
    newHardware: any[];
  }>({ isOpen: false, newHardware: [] });
  
  // Track announced hardware to avoid duplicates
  const [announcedHardware, setAnnouncedHardware] = useState<string[]>([]);
  
  // Newspaper state
  const [newspaper, setNewspaper] = useState<{
    isOpen: boolean;
    quarter: number;
    year: number;
    newsEvents: any[];
    marketData: any;
  }>({ isOpen: false, quarter: 1, year: 1983, newsEvents: [], marketData: null });
  
  const [gameState, setGameState] = useState<GameState>({
    company: {
      name: '',
      logo: '',
    cash: 5000000, // Erhöht auf 5M für bessere Balance
    employees: 8, // Kleines Team
    reputation: 50, // Startwert für Reputation
    marketShare: 0, // Kein Marktanteil
    monthlyIncome: 0, // Noch keine Einnahmen
    monthlyExpenses: 30000 // Reduziert auf 30k für bessere Überlebenschancen
    },
    quarter: 1,
    year: 1983,
    models: [],
    budget: {
      marketing: 20000, // Leicht erhöht für bessere Verkäufe
      development: 30000, // Leicht erhöht für schnellere Entwicklung
      research: 5000
    },
    competitors: INITIAL_COMPETITORS,
    marketEvents: [],
    totalMarketSize: 1000000, // 1 Million $ Gesamtmarkt 1983
    customChips: [],
    totalRevenue: 0
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
      
      toast({
        title: "🔧 Entwicklung gestartet",
        description: `${finalModel.name} mit ${computerCase.name} Case wird entwickelt!`
      });
    }
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
    setCurrentScreen('dashboard');
    
    toast({
      title: "🔧 Entwicklung gestartet",
      description: `${model.name} wird entwickelt! Dauert ${model.developmentTime} Quartal${model.developmentTime > 1 ? 'e' : ''}.`
    });
  };

  const handleNextTurn = () => {
    // Check for new hardware before processing turn
    const previousResearchBudget = gameState.budget.research;
    
    // Verarbeite das Quartal mit der neuen GameMechanics Logik
    const result = GameMechanics.processQuarterTurn(gameState, gameState.competitors);
    
    // Check for newly unlocked hardware
    const newHardware = GameMechanics.checkForNewHardware(
      previousResearchBudget,
      result.updatedGameState.budget.research,
      gameState.year,
      gameState.quarter,
      announcedHardware
    );
    
    // Prüfe auf Spielende
    if (result.gameEndCondition?.isGameEnded) {
      setGameEndCondition(result.gameEndCondition);
      setCurrentScreen('game-end');
      return;
    }
    
    // Custom Chip Benachrichtigung
    if (result.newCustomChip) {
      toast({
        title: "🎉 Custom Hardware entwickelt!",
        description: `${result.newCustomChip.name}: ${result.newCustomChip.description}`
      });
    }
    
    // Benachrichtigung für fertiggestellte Computer
    const newlyReleasedModels = result.updatedGameState.models.filter((model: any) => 
      model.status === 'released' && 
      gameState.models.find((oldModel: any) => oldModel.id === model.id)?.status === 'development'
    );
    
    newlyReleasedModels.forEach((model: any) => {
      toast({
        title: "🚀 Computer fertiggestellt!",
        description: `${model.name} ist jetzt verfügbar und geht in den Verkauf!`
      });
    });
    
    // Zeige Quartalsresultate
    setQuarterResults({
      quarter: gameState.quarter,
      year: gameState.year,
      results: result.quarterResults,
      newsEvents: result.newsEvents,
      marketData: result.marketData
    });
    
    // Aktualisiere den Spielzustand für das nächste Quartal
    const nextQuarter = gameState.quarter === 4 ? 1 : gameState.quarter + 1;
    const nextYear = gameState.quarter === 4 ? gameState.year + 1 : gameState.year;
    
    setGameState({
      ...result.updatedGameState,
      quarter: nextQuarter,
      year: nextYear,
      competitors: result.updatedCompetitors,
      totalRevenue: (result.updatedGameState.totalRevenue || 0) + (result.quarterResults?.totalRevenue || 0)
    });
    
    // Show hardware announcement if there's new hardware
    if (newHardware.length > 0) {
      setHardwareAnnouncement({
        isOpen: true,
        newHardware: newHardware
      });
      setAnnouncedHardware(prev => [...prev, ...newHardware.map(hw => hw.name)]);
    }
    
    setCurrentScreen('quarter-results');
  };

  const handleContinueFromResults = () => {
    // Show newspaper after quarter results
    if (quarterResults && quarterResults.newsEvents && quarterResults.marketData) {
      setNewspaper({
        isOpen: true,
        quarter: quarterResults.quarter,
        year: quarterResults.year,
        newsEvents: quarterResults.newsEvents,
        marketData: quarterResults.marketData
      });
    }
    setCurrentScreen('dashboard');
    setQuarterResults(null);
  };

  const handleDiscontinueModel = (modelId: string) => {
    setGameState(prev => ({
      ...prev,
      models: prev.models.map(model => 
        model.id === modelId 
          ? { ...model, status: 'discontinued' as const }
          : model
      )
    }));
    
    const model = gameState.models.find(m => m.id === modelId);
    if (model) {
      toast({
        title: "Computer eingestellt",
        description: `${model.name} wurde vom Markt genommen.`
      });
    }
  };

  const handleGameRestart = () => {
    // Reset alles zurück auf Anfangswerte
    setCurrentScreen('intro');
    setGameEndCondition(null);
    setQuarterResults(null);
    setTempModel(null);
    setShowSaveManager(false);
    setHardwareAnnouncement({ isOpen: false, newHardware: [] });
    setAnnouncedHardware([]);
    setGameState({
      company: {
        name: '',
        logo: '',
      cash: 5000000, // Erhöht auf 5M für bessere Balance
      employees: 8,
      reputation: 50,
      marketShare: 0,
      monthlyIncome: 0,
      monthlyExpenses: 30000 // Reduziert auf 30k für bessere Überlebenschancen
      },
      quarter: 1,
      year: 1983,
      models: [],
    budget: {
      marketing: 20000, // Leicht erhöht für bessere Verkäufe
      development: 30000, // Leicht erhöht für schnellere Entwicklung
      research: 5000
    },
      competitors: INITIAL_COMPETITORS,
      marketEvents: [],
      totalMarketSize: 1000000,
      customChips: [],
      totalRevenue: 0
    });
  };

  const handleLoadGame = (loadedGameState: GameState) => {
    setGameState(loadedGameState);
    setCurrentScreen('dashboard');
    setShowSaveManager(false);
  };

  const handleOpenSaveManager = () => {
    setShowSaveManager(true);
  };

  // Auth state management
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
          onDiscontinueModel={handleDiscontinueModel}
          onOpenSaveManager={handleOpenSaveManager}
        />
        );
      
      case 'development':
        return (
          <ComputerDevelopment 
            onBack={() => setCurrentScreen('dashboard')}
            onModelComplete={handleModelComplete}
            onCaseSelection={handleCaseSelection}
            currentYear={gameState.year}
            currentQuarter={gameState.quarter}
            customChips={gameState.customChips || []}
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
      
      case 'game-end':
        return gameEndCondition ? (
          <GameEnd
            gameEndCondition={gameEndCondition}
            gameState={gameState}
            competitors={gameState.competitors}
            onRestart={handleGameRestart}
          />
        ) : null;
      
      default:
        return <GameIntro onComplete={handleIntroComplete} />;
    }
  };

  return (
    <>
      <MusicToggle />
      {renderCurrentScreen()}
      
      {/* Hardware Announcement Dialog */}
      <HardwareAnnouncement
        isOpen={hardwareAnnouncement.isOpen}
        onClose={() => setHardwareAnnouncement({ isOpen: false, newHardware: [] })}
        newHardware={hardwareAnnouncement.newHardware}
        currentYear={gameState.year}
        currentQuarter={gameState.quarter}
      />
      
      {/* Newspaper Dialog */}
      <Newspaper
        isOpen={newspaper.isOpen}
        onClose={() => setNewspaper({ isOpen: false, quarter: 1, year: 1983, newsEvents: [], marketData: null })}
        quarter={newspaper.quarter}
        year={newspaper.year}
        newsEvents={newspaper.newsEvents}
        marketData={newspaper.marketData}
      />
      
      {/* Save Game Manager */}
      <SaveGameManager
        gameState={gameState}
        onLoadGame={handleLoadGame}
        isOpen={showSaveManager}
        onClose={() => setShowSaveManager(false)}
        user={user}
      />
    </>
  );
};

export default Index;