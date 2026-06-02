import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ComputerModel } from '@/types/ComputerModel';
import { GameIntro } from "@/components/GameIntro";
import { LanguageSelection } from "@/components/LanguageSelection";
import { CompanySetup, CompanySetupData } from "@/components/CompanySetup";
import { GameDashboard } from "@/components/GameDashboard";
import { ComputerDevelopment } from "@/components/ComputerDevelopment";
import { CaseSelection } from "@/components/CaseSelection";
import { QuarterResults } from "@/components/QuarterResults";
import { GameEnd } from "@/components/GameEnd";
import { MusicToggle } from "@/components/MusicToggle";
import { HardwareAnnouncement } from "@/components/HardwareAnnouncement";
import { Newspaper } from "@/components/Newspaper";
import { AdvisorChat } from "@/components/AdvisorChat";
import { Button } from "@/components/ui/button";
import { MessagesSquare } from "lucide-react";
import { SaveGameManager } from "@/components/SaveGameManager";
import { type Competitor, type MarketEvent, type CustomChip, type GameEndCondition, GameMechanics, INITIAL_COMPETITORS } from "@/lib/game";
import { LivingWorldService, type AiWorldEvent } from "@/services/LivingWorldService";
import { CompetitorsService, type AiCompetitor } from "@/services/CompetitorsService";
import { StaffService } from "@/services/StaffService";
import { AnnualMeeting } from "@/components/AnnualMeeting";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Company {
  id: string;
  name: string;
  description: string;
  startingCash: number;
  speciality: string;
  icon: React.ReactNode;
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
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Debug logging
  console.log("Index component is rendering");
  console.log("useLanguage hook result:", { t: typeof t });
  
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
  
  const [advisorOpen, setAdvisorOpen] = useState(false);

  // Lebende KI-Konkurrenz (DB-gestützt, ergänzt die statischen INITIAL_COMPETITORS)
  const [aiCompetitors, setAiCompetitors] = useState<AiCompetitor[]>([]);

  // Jahreshauptversammlung
  const [annualMeeting, setAnnualMeeting] = useState<{
    isOpen: boolean;
    year: number;
    yearRevenue: number;
    cash: number;
    reputation: number;
    marketShare: number;
    modelsReleased: number;
  } | null>(null);

  // Akkumuliert Jahresumsatz für die Jahreshauptversammlung
  const yearRevenueRef = useRef({ year: 1983, total: 0, modelsReleased: 0 });

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
        title: "🔧 " + t('notification.developmentStarted'),
        description: `${finalModel.name} ${t('case.subtitle')}`
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

  const handleNextTurn = async () => {
    // Check for new hardware before processing turn
    const previousResearchBudget = gameState.budget.research;
    
    // Verarbeite das Quartal mit der neuen GameMechanics Logik (async)
    const result = await GameMechanics.processQuarterTurn(gameState, gameState.competitors);
    
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
    
    // KI-Welt: neue Events generieren + alte runter-ticken (best effort, blockiert nicht bei Fehler)
    let aiEvents: AiWorldEvent[] = [];
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      try {
        await LivingWorldService.tickActiveEvents(user.id);
        aiEvents = await LivingWorldService.generateQuarterEvents({
          userId: user.id,
          year: gameState.year,
          quarter: gameState.quarter,
        });
      } catch (err) {
        console.warn("[LivingWorld] quarter generation failed:", err);
      }

      // Lebende Konkurrenz: pro Persona eine Aktion pro Quartal.
      // WICHTIG: awaiten, damit die Presseartikel in der DB stehen, bevor
      // die Newspaper sie nach den Quartalsresultaten anzeigt.
      try {
        const activeModels = (gameState.models ?? []).filter((m: any) => m.status === "released").length;
        await CompetitorsService.runQuarter({
          userId: user.id,
          year: gameState.year,
          quarter: gameState.quarter,
          playerSnapshot: {
            cash: gameState.company?.cash ?? 0,
            reputation: gameState.company?.reputation ?? 50,
            market_share: gameState.company?.marketShare ?? 0,
            active_models: activeModels,
          },
        });
        // Aktualisierte Konkurrenz-Stände für das Dashboard nachladen
        const refreshed = await CompetitorsService.getAll(user.id);
        setAiCompetitors(refreshed);
      } catch (err) {
        console.warn("[Competitors] quarter run failed:", err);
    }

    // Phase 4a — Payroll: Gehälter abziehen, Headcount synchronisieren.
    let payroll = { paid: 0, underpaid: false, headcount: 0 };
    if (user?.id) {
      try {
        const preCash = result.updatedGameState.company?.cash ?? 0;
        const pay = await StaffService.runPayroll(user.id, preCash);
        if (result.updatedGameState.company) {
          result.updatedGameState.company.cash = pay.newCash;
        }
        const team = await StaffService.list(user.id);
        if (result.updatedGameState.company) {
          // gameState.company.employees ist eine Zahl (HQ-Visualisierung).
          // Sync mit echter Teamgröße + Startteam (8).
          result.updatedGameState.company.employees = 8 + team.length;
        }
        payroll = { paid: pay.paid, underpaid: pay.underpaid, headcount: team.length };
        if (pay.underpaid && team.length > 0) {
          toast({
            title: "⚠️ Gehälter nicht gedeckt",
            description: `Nur ${Math.round(pay.paid).toLocaleString("de-DE")} $ von ${Math.round(pay.paid + Math.max(0, -pay.newCash)).toLocaleString("de-DE")} $ bezahlt — Moral fällt um 15 Punkte.`,
            variant: "destructive",
          });
        } else if (pay.paid > 0) {
          toast({
            title: `💼 Payroll Q${gameState.quarter}/${gameState.year}`,
            description: `${pay.paid.toLocaleString("de-DE")} $ Gehälter an ${team.length} Mitarbeitende ausgezahlt.`,
          });
        }
      } catch (err) {
        console.warn("[Staff] payroll failed:", err);
      }
    }
    }

    // Jahresumsatz aufaddieren (für die Jahreshauptversammlung)
    const quarterRevenue = result.quarterResults?.totalRevenue ?? 0;
    const newlyReleasedCount = (result.updatedGameState.models ?? []).filter((model: any) =>
      model.status === 'released' &&
      gameState.models.find((oldModel: any) => oldModel.id === model.id)?.status === 'development'
    ).length;
    if (yearRevenueRef.current.year !== gameState.year) {
      yearRevenueRef.current = { year: gameState.year, total: 0, modelsReleased: 0 };
    }
    yearRevenueRef.current.total += quarterRevenue;
    yearRevenueRef.current.modelsReleased += newlyReleasedCount;

    // Proaktive Berater-Trigger (Phase 3c)
    const nextCash = result.updatedGameState.company?.cash ?? gameState.company.cash;
    const monthlyBurn = (gameState.company.monthlyExpenses ?? 0) || 30000;
    const runwayMonths = monthlyBurn > 0 ? nextCash / monthlyBurn : Infinity;
    if (runwayMonths < 3 && runwayMonths > 0) {
      toast({
        title: '💸 Margarete Vogel klopft an',
        description: `Liquidität reicht nur noch ~${runwayMonths.toFixed(1)} Monate. Ein Gespräch mit den Aktionärinnen wäre klug.`,
        action: (
          <ToastAction altText="Berater öffnen" onClick={() => setAdvisorOpen(true)}>
            Berater
          </ToastAction>
        ),
      });
    }
    if (user?.id) {
      const top = (await CompetitorsService.getAll(user.id))[0];
      const playerRep = result.updatedGameState.company?.reputation ?? 50;
      if (top && top.reputation > playerRep + 15) {
        toast({
          title: `📈 ${top.name} zieht vorbei`,
          description: 'K.J. Jordan empfiehlt einen Strategie-Check in der Entwicklung.',
          action: (
            <ToastAction altText="Berater öffnen" onClick={() => setAdvisorOpen(true)}>
              Berater
            </ToastAction>
          ),
        });
      }
    }

    // Zeige Quartalsresultate
    setQuarterResults({
      quarter: gameState.quarter,
      year: gameState.year,
      results: result.quarterResults,
      newsEvents: result.newsEvents,
      marketData: result.marketData,
      aiEvents,
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

  const handleContinueFromResults = async () => {
    // Show newspaper after quarter results
    if (quarterResults && quarterResults.newsEvents && quarterResults.marketData) {
      // Pull AI-generated press articles for this quarter and merge them into
      // the newspaper feed so the player sees the lebendige Presse output.
      let mergedNews = quarterResults.newsEvents;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: articles } = await supabase
            .from('ai_press_articles')
            .select('id, headline, body, category, kind, created_at')
            .eq('user_id', user.id)
            .eq('game_year', quarterResults.year)
            .eq('game_quarter', quarterResults.quarter)
            .order('created_at', { ascending: false });

          if (articles && articles.length > 0) {
            const mapCategory = (c: string): 'tech' | 'market' | 'world' | 'competitor' => {
              if (c === 'tech' || c === 'market' || c === 'competitor' || c === 'world') return c;
              return 'world';
            };
            const aiNews = articles.map((a) => ({
              id: `ai-${a.id}`,
              year: quarterResults.year,
              quarter: quarterResults.quarter,
              category: mapCategory(a.category),
              headline: a.headline,
              content: a.body,
            }));
            // AI-generated articles lead (they're event-driven and fresh).
            mergedNews = [...aiNews, ...quarterResults.newsEvents];
          }
        }
      } catch (e) {
        console.warn('Failed to fetch AI press articles', e);
      }

      setNewspaper({
        isOpen: true,
        quarter: quarterResults.quarter,
        year: quarterResults.year,
        newsEvents: mergedNews,
        marketData: quarterResults.marketData
      });
    }

    // Jahreshauptversammlung am Jahresende: gerade abgelaufenes Quartal war Q4
    if (quarterResults && quarterResults.quarter === 4) {
      const closedYear = quarterResults.year;
      const summary = yearRevenueRef.current.year === closedYear
        ? yearRevenueRef.current
        : { year: closedYear, total: 0, modelsReleased: 0 };
      setAnnualMeeting({
        isOpen: true,
        year: closedYear,
        yearRevenue: summary.total,
        cash: gameState.company.cash,
        reputation: gameState.company.reputation,
        marketShare: gameState.company.marketShare,
        modelsReleased: summary.modelsReleased,
      });
      // Reset für das neue Jahr
      yearRevenueRef.current = { year: closedYear + 1, total: 0, modelsReleased: 0 };
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
    // Use ModelRevisionManager to migrate existing models on first load
    if (gameState.models.length > 0 && !gameState.models[0].revision) {
      console.log('🔄 Migrating existing models to revision system...');
      const migrateModels = async () => {
        const { ModelRevisionManager } = await import('@/types/ComputerModel');
        setGameState(prev => ({
          ...prev,
          models: ModelRevisionManager.migrateExistingModels(prev.models)
        }));
      };
      migrateModels();
    }

    // Sync with SaveGameManager if authenticated
    if (user && gameState.company) {
      try {
        const autoSave = async () => {
          const { SaveGameManager } = await import('@/components/SaveGameManager');
          // Note: SaveGameManager doesn't have autoSave method, skipping for now
          console.log('Auto-save functionality needs implementation');
        };
        autoSave();
      } catch (error) {
        console.log('Auto-save failed:', error);
      }
    }
  }, [gameState, user]);

  // Authentication state management
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

  // KI-Konkurrenten seeden + initial laden, sobald der User eingeloggt ist
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const seeded = await CompetitorsService.ensureSeeded(user.id);
        if (!cancelled) setAiCompetitors(seeded);
      } catch (e) {
        console.warn('[Competitors] initial seed failed', e);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

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
          aiCompetitors={aiCompetitors}
        />
        );
      
      case 'development':
        return (
          <ComputerDevelopment 
            onBack={() => setCurrentScreen('dashboard')}
            onModelComplete={handleModelComplete}
            currentYear={gameState.year}
            currentQuarter={gameState.quarter}
            customChips={gameState.customChips || []}
            existingModels={gameState.models}
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
            aiEvents={quarterResults.aiEvents ?? []}
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

      {/* Jahreshauptversammlung (Phase 3a) */}
      {annualMeeting && (
        <AnnualMeeting
          isOpen={annualMeeting.isOpen}
          onClose={() => setAnnualMeeting(null)}
          year={annualMeeting.year}
          yearRevenue={annualMeeting.yearRevenue}
          cash={annualMeeting.cash}
          reputation={annualMeeting.reputation}
          marketShare={annualMeeting.marketShare}
          modelsReleased={annualMeeting.modelsReleased}
          competitors={aiCompetitors}
        />
      )}

      {/* Advisor chat — only meaningful on the dashboard */}
      {currentScreen === 'dashboard' && (
        <>
          <Button
            onClick={() => setAdvisorOpen(true)}
            className="fixed bottom-4 right-4 z-40 shadow-lg gap-2"
            size="sm"
          >
            <MessagesSquare className="w-4 h-4" />
            Berater
          </Button>
          <AdvisorChat
            isOpen={advisorOpen}
            onClose={() => setAdvisorOpen(false)}
            gameContext={{
              year: gameState.year,
              quarter: gameState.quarter,
              company: {
                name: gameState.company.name,
                cash: gameState.company.cash,
                reputation: gameState.company.reputation,
                marketShare: gameState.company.marketShare,
              },
              budget: gameState.budget,
              activeModels: (gameState.models || []).map((m: any) => ({
                name: m.name,
                price: m.price,
                status: m.status,
              })),
            }}
          />
        </>
      )}
    </>
  );
};

export default Index;