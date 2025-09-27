import { useTranslation } from 'react-i18next';
import { formatters } from '@/lib/i18n';

/**
 * Hook for easy access to economy-specific translations and formatters
 */
export const useEconomyTranslation = () => {
  const { t } = useTranslation(['economy', 'common']);
  
  return {
    t,
    formatCurrency: formatters.currency,
    formatPercentage: formatters.percentage,
    formatNumber: formatters.number,
    
    // Economy-specific formatters with translations
    formatRevenue: (amount: number) => t('economy:revenue.total', { amount }),
    formatProfit: (amount: number) => t('economy:revenue.profit', { amount }),
    formatMargin: (percentage: number) => t('economy:revenue.margin', { percentage }),
    formatUnitsSold: (count: number) => t('economy:units.sold', { count }),
    formatUnitsProduced: (count: number) => t('economy:units.produced', { count }),
    
    // Segment/position labels
    getSegmentLabel: (segment: 'gamer' | 'business' | 'workstation') => 
      t(`economy:segments.${segment}`),
    getPositionLabel: (position: 'budget' | 'midrange' | 'premium') => 
      t(`economy:positions.${position}`),
    getTypeLabel: (type: 'gamer' | 'office') => 
      t(`economy:types.${type}`)
  };
};

/**
 * Hook for UI-specific translations
 */
export const useUITranslation = () => {
  const { t } = useTranslation(['ui', 'common']);
  
  return {
    t,
    
    // Tab labels
    getTabLabel: (tab: 'overview' | 'development' | 'market' | 'management') =>
      t(`ui:dashboard.tabs.${tab}`),
      
    // Case selection helpers
    getCaseName: (caseKey: string) => t(`ui:caseSelection.cases.${caseKey}.name`),
    getCaseDescription: (caseKey: string) => t(`ui:caseSelection.cases.${caseKey}.description`)
  };
};

/**
 * Hook for toast notifications with i18n
 */
export const useToastTranslation = () => {
  const { t } = useTranslation(['toast', 'common']);
  
  return {
    t,
    
    // Auth toasts
    toastLoginSuccess: () => t('toast:auth.loginSuccess'),
    toastLoginError: (error: string) => t('toast:auth.loginError', { error }),
    toastLogoutSuccess: () => t('toast:auth.logoutSuccess'),
    toastLogoutError: (error: string) => t('toast:auth.logoutError', { error }),
    
    // Save game toasts
    toastSaved: () => t('toast:saveGame.saved'),
    toastLoaded: () => t('toast:saveGame.loaded'),
    toastDeleted: () => t('toast:saveGame.deleted'),
    toastSaveError: () => t('toast:saveGame.saveError'),
    toastLoadError: () => t('toast:saveGame.loadError'),
    toastDeleteError: () => t('toast:saveGame.deleteError')
  };
};

/**
 * Language switching utility component
 */
export const useLanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const currentLanguage = i18n.language as 'de' | 'en';
  
  const switchLanguage = (lang: 'de' | 'en') => {
    i18n.changeLanguage(lang);
  };
  
  const toggleLanguage = () => {
    const newLang = currentLanguage === 'de' ? 'en' : 'de';
    switchLanguage(newLang);
  };
  
  return {
    currentLanguage,
    switchLanguage,
    toggleLanguage,
    isGerman: currentLanguage === 'de',
    isEnglish: currentLanguage === 'en'
  };
};