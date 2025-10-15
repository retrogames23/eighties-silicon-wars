import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyAccount } from "@/components/CompanyAccount";
import { DevelopmentTab } from "@/components/DevelopmentTab";
import { MarketTab } from "@/components/MarketTab";
import { CompanyManagement } from "@/components/CompanyManagement";
import { HeadquartersTab } from "@/components/HeadquartersTab";
import { GameTutorial } from "@/components/GameTutorial";
import { UserProfile } from "@/components/UserProfile";
import { useRenderTracking } from "@/lib/dev-tools";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipeable } from "react-swipeable";
import { useTranslation } from "react-i18next";
import { formatters } from "@/lib/i18n";
import { 
  Calendar,
  ChevronRight,
  Building2,
  Cpu,
  Monitor,
  Zap,
  HelpCircle,
  Save,
  Menu,
  X
} from "lucide-react";

import { type Competitor, type MarketEvent } from "@/lib/game";

import type { ComputerModel } from '@/types/ComputerModel';

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

interface GameDashboardProps {
  gameState: GameState;
  onNextTurn: () => void;
  onBudgetChange: (newBudget: Budget) => void;
  onDevelopNewModel: () => void;
  onDiscontinueModel?: (modelId: string) => void;
  onOpenSaveManager?: () => void;
  user?: any;
}

export const GameDashboard = ({ 
  gameState, 
  onNextTurn, 
  onBudgetChange,
  onDevelopNewModel,
  onDiscontinueModel,
  onOpenSaveManager,
  user
}: GameDashboardProps) => {
  const { t } = useTranslation(['ui', 'common']);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile();
  
  // Development-only render tracking
  useRenderTracking('GameDashboard');

  // Tab navigation for swipe gestures
  const tabs = ["account", "development", "market", "management", "headquarters"];
  
  const navigateToTab = useCallback((direction: 'left' | 'right') => {
    const currentIndex = tabs.indexOf(activeTab);
    if (direction === 'left' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    } else if (direction === 'right' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  }, [activeTab]);

  // Swipe handlers for mobile navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigateToTab('right'),
    onSwipedRight: () => navigateToTab('left'),
    trackMouse: false, // Only track touch, not mouse
    trackTouch: true,
    delta: 50 // Minimum swipe distance
  });
  
  const getCompanyIcon = () => {
    switch (gameState.company.logo) {
      case 'building': return Building2;
      case 'cpu': return Cpu;
      case 'monitor': return Monitor;
      case 'zap': return Zap;
      default: return Building2;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-crt ${isMobile ? 'mobile-overflow-x-hidden p-4' : 'p-6'}`}>
      <div className="crt-screen">
        <div className="scanline" />
        
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className={`${isMobile ? 'mobile-header' : 'flex justify-between items-center'} mb-6`}>
            {/* Company Info */}
            <div className="flex items-center space-x-3">
              {(() => {
                const IconComponent = getCompanyIcon();
                return <IconComponent className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} text-neon-green`} />;
              })()}
              <div>
                <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold neon-text text-neon-green`}>
                  {gameState.company.name}
                </h1>
                <p className="text-neon-cyan font-mono text-sm">
                  {formatters.quarter(gameState.quarter, gameState.year)} - CEO Terminal
                </p>
              </div>
            </div>
            
            {/* Desktop Header Actions */}
            {!isMobile && (
              <div className="flex gap-4 mr-16">
                <Button 
                  variant="outline"
                  onClick={() => setShowTutorial(true)}
                  className="retro-border bg-card/20 hover:bg-card/40"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  {t('common:help')}
                </Button>
                
                {onOpenSaveManager && (
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline"
                      onClick={onOpenSaveManager}
                      className="retro-border bg-card/20 hover:bg-card/40"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {t('ui:dashboard.saveGame')}
                    </Button>
                    
                    <UserProfile user={user} />
                  </div>
                )}
                
                <Button 
                  onClick={onNextTurn}
                  className="glow-button px-8 py-3 text-lg"
                  variant="default"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  {t('ui:dashboard.nextTurn')}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="outline"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="retro-border bg-card/20 hover:bg-card/40 mobile-touch-button"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          {isMobile && showMobileMenu && (
            <div className="mb-6 space-y-2 bg-card/50 backdrop-blur-sm retro-border p-4 rounded-lg">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowTutorial(true);
                  setShowMobileMenu(false);
                }}
                className="w-full retro-border bg-card/20 hover:bg-card/40 mobile-touch-button justify-start"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {t('common:help')}
              </Button>
              
              {onOpenSaveManager && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    onOpenSaveManager();
                    setShowMobileMenu(false);
                  }}
                  className="w-full retro-border bg-card/20 hover:bg-card/40 mobile-touch-button justify-start"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t('ui:dashboard.saveGame')}
                </Button>
              )}

              {user && (
                <div className="pt-2 border-t border-border">
                  <UserProfile user={user} />
                </div>
              )}
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" {...(isMobile ? swipeHandlers : {})}>
            <div className={`${isMobile ? 'mobile-tabs' : ''}`}>
              <TabsList className={`retro-border bg-card/50 backdrop-blur-sm p-1 mb-6 ${isMobile ? 'mobile-tab-list' : ''}`}>
                <TabsTrigger 
                  value="account" 
                  className={`retro-tab ${isMobile ? 'mobile-touch-button text-xs px-3' : ''}`}
                >
                  {isMobile ? t('ui:dashboard.tabs.overview').slice(0,4) : t('ui:dashboard.tabs.overview')}
                </TabsTrigger>
                <TabsTrigger 
                  value="development" 
                  className={`retro-tab ${isMobile ? 'mobile-touch-button text-xs px-3' : ''}`}
                >
                  {isMobile ? 'Dev' : t('ui:dashboard.tabs.development')}
                </TabsTrigger>
                <TabsTrigger 
                  value="market" 
                  className={`retro-tab ${isMobile ? 'mobile-touch-button text-xs px-3' : ''}`}
                >
                  {t('ui:dashboard.tabs.market')}
                </TabsTrigger>
                <TabsTrigger 
                  value="management" 
                  className={`retro-tab ${isMobile ? 'mobile-touch-button text-xs px-3' : ''}`}
                >
                  {isMobile ? 'Mgmt' : t('ui:dashboard.tabs.management')}
                </TabsTrigger>
                <TabsTrigger 
                  value="headquarters" 
                  className={`retro-tab ${isMobile ? 'mobile-touch-button text-xs px-3' : ''}`}
                >
                  {isMobile ? 'HQ' : t('ui:dashboard.tabs.headquarters')}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="account" className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
              <CompanyAccount gameState={gameState} />
            </TabsContent>

            <TabsContent value="development" className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
              <DevelopmentTab 
                models={gameState.models} 
                onDevelopNewModel={onDevelopNewModel}
                onDiscontinueModel={onDiscontinueModel}
              />
            </TabsContent>

            <TabsContent value="market" className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
              <MarketTab 
                competitors={gameState.competitors}
                marketEvents={gameState.marketEvents}
                totalMarketSize={gameState.totalMarketSize}
                playerMarketShare={gameState.company.marketShare}
              />
            </TabsContent>

            <TabsContent value="management" className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
              <CompanyManagement 
                budget={gameState.budget}
                totalBudget={200000}
                onBudgetChange={onBudgetChange}
              />
            </TabsContent>

            <TabsContent value="headquarters" className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
              <HeadquartersTab 
                cash={gameState.company.cash}
                employees={gameState.company.employees}
                revenue={gameState.company.monthlyIncome}
                quarter={gameState.quarter}
                year={gameState.year}
              />
            </TabsContent>

            {/* Mobile Navigation Hint */}
            {isMobile && (
              <div className="text-center mt-4">
                <p className="text-xs text-muted-foreground font-mono">
                  {t('ui:dashboard.mobileNavHint')}
                </p>
              </div>
            )}
          </Tabs>

          {/* Mobile Next Turn Button */}
          {isMobile && (
            <div className="fixed bottom-4 left-4 right-4 z-10">
              <Button 
                onClick={onNextTurn}
                className="w-full glow-button py-4 text-lg mobile-touch-button"
                variant="default"
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t('ui:dashboard.nextTurn')}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Terminal Footer */}
          <div className={`${isMobile ? 'mt-8 mb-20' : 'mt-12'} text-center`}>
            <div className="retro-border inline-block p-4 bg-card/30 backdrop-blur-sm">
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-terminal-green font-mono`}>
                {">>> SYSTEM STATUS: ALL NETWORKS OPERATIONAL <<<"}
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                MAINFRAME_OS v2.1 - Last backup: Q{gameState.quarter} {gameState.year}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {showTutorial && <GameTutorial onClose={() => setShowTutorial(false)} />}
    </div>
  );
};