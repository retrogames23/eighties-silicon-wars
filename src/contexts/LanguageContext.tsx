import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  de: {
    // Game Intro
    'intro.title': 'COMPUTER TYCOON',
    'intro.subtitle': 'Die 80er erwarten Sie...',
    'intro.description': '1983: Während Knight Rider über die Highways rast und Dallas die Fernsehbildschirme beherrscht, beginnt eine stille Revolution in den Garagen und Kellern Amerikas. Steve Jobs hat gerade den Apple IIe vorgestellt, Commodore kämpft mit dem legendären C64 um jeden Hobbyisten, und irgendwo bastelt ein gewisser Bill Gates an MS-DOS. Die Zukunft wartet darauf, erfunden zu werden.',
    'intro.prompt': '> Bereit für das ultimative Tech-Abenteuer?',
    'intro.question': 'Wirst du Teil dieser digitalen Revolution?',
    'intro.button': 'ENTER DIE 80er',
    'intro.switchToEnglish': 'Switch to English',

    // Language Selection
    'language.title': 'Sprache auswählen',
    'language.description': 'Wählen Sie Ihre bevorzugte Spielsprache',
    'language.german': 'Deutsch',
    'language.english': 'English',
    'language.continue': 'Weiter',

    // Company Setup
    'company.title': 'Firmengründung',
    'company.subtitle': 'Starten Sie Ihr Tech-Imperium',
    'company.nameLabel': 'Firmenname',
    'company.namePlaceholder': 'Geben Sie Ihren Firmennamen ein',
    'company.logoLabel': 'Firmenlogo auswählen',
    'company.submit': 'Firma gründen',
    'company.nameRequired': 'Bitte geben Sie einen Firmennamen ein',

    // Logo names
    'logo.microchip': 'Mikrochip',
    'logo.cpu': 'Prozessor',
    'logo.circuit': 'Schaltkreis',
    'logo.computer': 'Computer',
    'logo.corporate': 'Unternehmen',
    'logo.tech': 'Technik',
    'logo.innovation': 'Innovation',

    // Game Dashboard
    'dashboard.quarter': 'Quartal',
    'dashboard.year': 'Jahr',
    'dashboard.cash': 'Bargeld',
    'dashboard.reputation': 'Reputation',
    'dashboard.marketShare': 'Marktanteil',
    'dashboard.development': 'Entwicklung',
    'dashboard.marketing': 'Marketing',
    'dashboard.research': 'Forschung',
    'dashboard.nextTurn': 'Nächste Runde',
    'dashboard.menu': 'Menü',
    'dashboard.employees': 'Mitarbeiter',
    'dashboard.monthlyIncome': 'Monatliche Einnahmen',
    'dashboard.monthlyExpenses': 'Monatliche Ausgaben',
    'dashboard.budget': 'Budget',
    'dashboard.models': 'Modelle',
    'dashboard.saveGame': 'Spiel speichern',
    'dashboard.loadGame': 'Spiel laden',

    // Tabs
    'tabs.development': 'Entwicklung',
    'tabs.market': 'Markt',
    'tabs.research': 'Forschung',
    'tabs.overview': 'Übersicht',

    // Development
    'development.title': 'Computer-Entwicklung',
    'development.newModel': 'Neues Modell entwickeln',
    'development.modelName': 'Modellname',
    'development.targetPrice': 'Zielpreis',
    'development.components': 'Komponenten',
    'development.specifications': 'Spezifikationen',
    'development.developmentCost': 'Entwicklungskosten',
    'development.estimatedProfit': 'Geschätzter Gewinn',
    'development.startDevelopment': 'Entwicklung starten',
    'development.back': 'Zurück',
    'development.cpu': 'Prozessor',
    'development.ram': 'Arbeitsspeicher',
    'development.storage': 'Speicher',
    'development.graphics': 'Grafik',
    'development.sound': 'Sound',
    'development.networking': 'Netzwerk',
    'development.expansion': 'Erweiterung',

    // Case Selection
    'case.title': 'Gehäuse auswählen',
    'case.subtitle': 'Wählen Sie das passende Gehäuse für Ihren Computer',
    'case.select': 'Auswählen',
    'case.price': 'Preis',
    'case.features': 'Eigenschaften',

    // Quarter Results
    'results.title': 'Quartalsergebnisse',
    'results.quarter': 'Quartal {quarter} - {year}',
    'results.revenue': 'Umsatz',
    'results.expenses': 'Ausgaben',
    'results.profit': 'Gewinn',
    'results.marketShare': 'Marktanteil',
    'results.reputation': 'Reputation',
    'results.continue': 'Weiter',
    'results.modelsSold': 'Verkaufte Modelle',
    'results.marketEvents': 'Marktereignisse',

    // Hardware & Technology
    'hardware.processor': 'Prozessor',
    'hardware.memory': 'Arbeitsspeicher',
    'hardware.storage': 'Speicher',
    'hardware.graphics': 'Grafikkarte',
    'hardware.sound': 'Soundkarte',
    'hardware.motherboard': 'Hauptplatine',
    'hardware.powersupply': 'Netzteil',
    'hardware.case': 'Gehäuse',
    'hardware.keyboard': 'Tastatur',
    'hardware.mouse': 'Maus',
    'hardware.monitor': 'Monitor',
    'hardware.available': 'Verfügbar',
    'hardware.unavailable': 'Nicht verfügbar',
    'hardware.announced': 'Angekündigt',

    // Market & Competition
    'market.title': 'Marktanalyse',
    'market.competitors': 'Konkurrenten',
    'market.marketSize': 'Marktgröße',
    'market.growth': 'Wachstum',
    'market.trends': 'Trends',
    'market.opportunities': 'Chancen',
    'market.threats': 'Bedrohungen',

    // Research & Development
    'research.title': 'Forschung & Entwicklung',
    'research.projects': 'Projekte',
    'research.progress': 'Fortschritt',
    'research.completed': 'Abgeschlossen',
    'research.inProgress': 'In Bearbeitung',
    'research.available': 'Verfügbar',

    // Notifications & Messages
    'notification.developmentStarted': 'Entwicklung gestartet',
    'notification.modelCompleted': 'Modell fertiggestellt',
    'notification.salesSuccess': 'Verkaufserfolg',
    'notification.marketChange': 'Marktveränderung',
    'notification.newHardware': 'Neue Hardware verfügbar',
    'notification.competitorAction': 'Konkurrenz-Aktion',

    // Difficulty Selection
    'difficulty.title': 'Schwierigkeitsgrad',
    'difficulty.easy': 'Einfach',
    'difficulty.easyDesc': 'Entspanntes Spielerlebnis mit mehr Startkapital',
    'difficulty.medium': 'Mittel',
    'difficulty.mediumDesc': 'Ausgewogene Herausforderung',
    'difficulty.hard': 'Schwer',
    'difficulty.hardDesc': 'Für erfahrene Spieler - weniger Ressourcen',
    'difficulty.continue': 'Weiter',

    // High Scores
    'highscores.title': 'Bestenliste',
    'highscores.score': 'Punkte',
    'highscores.difficulty': 'Schwierigkeit',
    'highscores.noScores': 'Noch keine Einträge',
    'highscores.back': 'Zurück',

    // Game End
    'gameend.title': 'Ende der Heimcomputer-Ära',
    'gameend.finalScore': 'Endpunktzahl',
    'gameend.newHighScore': 'Neue Bestleistung!',
    'gameend.playAgain': 'Nochmal spielen',
    'gameend.mainMenu': 'Hauptmenü',
    'gameend.yourCompany': 'Ihr Unternehmen',
    'gameend.marketPosition': 'Marktposition',
    'gameend.achievements': 'Erfolge',

    // Achievements
    'achievement.unlocked': 'Erfolg freigeschaltet!',
    'achievement.firstSale': 'Erster Verkauf',
    'achievement.millionaire': 'Millionär',
    'achievement.marketLeader': 'Marktführer',
    'achievement.techPioneer': 'Tech-Pionier',
    'achievement.massProducer': 'Massenproduzent',

    // Common UI Elements
    'common.cancel': 'Abbrechen',
    'common.confirm': 'Bestätigen',
    'common.save': 'Speichern',
    'common.load': 'Laden',
    'common.back': 'Zurück',
    'common.next': 'Weiter',
    'common.close': 'Schließen',
    'common.open': 'Öffnen',
    'common.edit': 'Bearbeiten',
    'common.delete': 'Löschen',
    'common.create': 'Erstellen',
    'common.update': 'Aktualisieren',
    'common.search': 'Suchen',
    'common.filter': 'Filter',
    'common.sort': 'Sortieren',
    'common.yes': 'Ja',
    'common.no': 'Nein',
    'common.ok': 'OK',
    'common.error': 'Fehler',
    'common.warning': 'Warnung',
    'common.info': 'Information',
    'common.success': 'Erfolg',
    'common.help': 'Hilfe',

    // Units & Measurements
    'units.currency': '$',
    'units.percentage': '%',
    'units.thousand': 'K',
    'units.million': 'M',
    'units.billion': 'B',
    'units.mhz': 'MHz',
    'units.kb': 'KB',
    'units.mb': 'MB',
    'units.gb': 'GB',

    // Time & Dates
    'time.quarter': 'Q{quarter}',
    'time.year': '{year}',
    'time.month': 'Monat',
    'time.week': 'Woche',
    'time.day': 'Tag',
    'time.january': 'Januar',
    'time.february': 'Februar',
    'time.march': 'März',
    'time.april': 'April',
    'time.may': 'Mai',
    'time.june': 'Juni',
    'time.july': 'Juli',
    'time.august': 'August',
    'time.september': 'September',
    'time.october': 'Oktober',
    'time.november': 'November',
    'time.december': 'Dezember',
  },
  en: {
    // Game Intro
    'intro.title': 'COMPUTER TYCOON',
    'intro.subtitle': 'The 80s await you...',
    'intro.description': '1983: While Knight Rider cruises the highways and Dallas dominates television screens, a quiet revolution begins in garages and basements across America. Steve Jobs has just unveiled the Apple IIe, Commodore battles with the legendary C64 for every hobbyist, and somewhere a certain Bill Gates tinkers with MS-DOS. The future awaits to be invented.',
    'intro.prompt': '> Ready for the ultimate tech adventure?',
    'intro.question': 'Will you become part of this digital revolution?',
    'intro.button': 'ENTER THE 80s',
    'intro.switchToGerman': 'Switch to German',

    // Language Selection
    'language.title': 'Select Language',
    'language.description': 'Choose your preferred game language',
    'language.german': 'German',
    'language.english': 'English',
    'language.continue': 'Continue',

    // Company Setup
    'company.title': 'Company Setup',
    'company.subtitle': 'Start Your Tech Empire',
    'company.nameLabel': 'Company Name',
    'company.namePlaceholder': 'Enter your company name',
    'company.logoLabel': 'Select Company Logo',
    'company.submit': 'Create Company',
    'company.nameRequired': 'Please enter a company name',

    // Logo names
    'logo.microchip': 'Microchip',
    'logo.cpu': 'CPU',
    'logo.circuit': 'Circuit',
    'logo.computer': 'Computer',
    'logo.corporate': 'Corporate',
    'logo.tech': 'Tech',
    'logo.innovation': 'Innovation',

    // Game Dashboard
    'dashboard.quarter': 'Quarter',
    'dashboard.year': 'Year',
    'dashboard.cash': 'Cash',
    'dashboard.reputation': 'Reputation',
    'dashboard.marketShare': 'Market Share',
    'dashboard.development': 'Development',
    'dashboard.marketing': 'Marketing',
    'dashboard.research': 'Research',
    'dashboard.nextTurn': 'Next Turn',
    'dashboard.menu': 'Menu',
    'dashboard.employees': 'Employees',
    'dashboard.monthlyIncome': 'Monthly Income',
    'dashboard.monthlyExpenses': 'Monthly Expenses',
    'dashboard.budget': 'Budget',
    'dashboard.models': 'Models',
    'dashboard.saveGame': 'Save Game',
    'dashboard.loadGame': 'Load Game',

    // Tabs
    'tabs.development': 'Development',
    'tabs.market': 'Market',
    'tabs.research': 'Research',
    'tabs.overview': 'Overview',

    // Development
    'development.title': 'Computer Development',
    'development.newModel': 'Develop New Model',
    'development.modelName': 'Model Name',
    'development.targetPrice': 'Target Price',
    'development.components': 'Components',
    'development.specifications': 'Specifications',
    'development.developmentCost': 'Development Cost',
    'development.estimatedProfit': 'Estimated Profit',
    'development.startDevelopment': 'Start Development',
    'development.back': 'Back',
    'development.cpu': 'CPU',
    'development.ram': 'RAM',
    'development.storage': 'Storage',
    'development.graphics': 'Graphics',
    'development.sound': 'Sound',
    'development.networking': 'Network',
    'development.expansion': 'Expansion',

    // Case Selection
    'case.title': 'Select Case',
    'case.subtitle': 'Choose the right case for your computer',
    'case.select': 'Select',
    'case.price': 'Price',
    'case.features': 'Features',

    // Quarter Results
    'results.title': 'Quarterly Results',
    'results.quarter': 'Quarter {quarter} - {year}',
    'results.revenue': 'Revenue',
    'results.expenses': 'Expenses',
    'results.profit': 'Profit',
    'results.marketShare': 'Market Share',
    'results.reputation': 'Reputation',
    'results.continue': 'Continue',
    'results.modelsSold': 'Models Sold',
    'results.marketEvents': 'Market Events',

    // Hardware & Technology
    'hardware.processor': 'CPU',
    'hardware.memory': 'RAM',
    'hardware.storage': 'Storage',
    'hardware.graphics': 'Graphics Card',
    'hardware.sound': 'Sound Card',
    'hardware.motherboard': 'Motherboard',
    'hardware.powersupply': 'Power Supply',
    'hardware.case': 'Case',
    'hardware.keyboard': 'Keyboard',
    'hardware.mouse': 'Mouse',
    'hardware.monitor': 'Monitor',
    'hardware.available': 'Available',
    'hardware.unavailable': 'Unavailable',
    'hardware.announced': 'Announced',

    // Market & Competition
    'market.title': 'Market Analysis',
    'market.competitors': 'Competitors',
    'market.marketSize': 'Market Size',
    'market.growth': 'Growth',
    'market.trends': 'Trends',
    'market.opportunities': 'Opportunities',
    'market.threats': 'Threats',

    // Research & Development
    'research.title': 'Research & Development',
    'research.projects': 'Projects',
    'research.progress': 'Progress',
    'research.completed': 'Completed',
    'research.inProgress': 'In Progress',
    'research.available': 'Available',

    // Notifications & Messages
    'notification.developmentStarted': 'Development Started',
    'notification.modelCompleted': 'Model Completed',
    'notification.salesSuccess': 'Sales Success',
    'notification.marketChange': 'Market Change',
    'notification.newHardware': 'New Hardware Available',
    'notification.competitorAction': 'Competitor Action',

    // Difficulty Selection
    'difficulty.title': 'Difficulty Level',
    'difficulty.easy': 'Easy',
    'difficulty.easyDesc': 'Relaxed gameplay with more starting capital',
    'difficulty.medium': 'Medium',
    'difficulty.mediumDesc': 'Balanced challenge',
    'difficulty.hard': 'Hard',
    'difficulty.hardDesc': 'For experienced players - fewer resources',
    'difficulty.continue': 'Continue',

    // High Scores
    'highscores.title': 'High Scores',
    'highscores.score': 'Score',
    'highscores.difficulty': 'Difficulty',
    'highscores.noScores': 'No entries yet',
    'highscores.back': 'Back',

    // Game End
    'gameend.title': 'End of the Home Computer Era',
    'gameend.finalScore': 'Final Score',
    'gameend.newHighScore': 'New High Score!',
    'gameend.playAgain': 'Play Again',
    'gameend.mainMenu': 'Main Menu',
    'gameend.yourCompany': 'Your Company',
    'gameend.marketPosition': 'Market Position',
    'gameend.achievements': 'Achievements',

    // Achievements
    'achievement.unlocked': 'Achievement Unlocked!',
    'achievement.firstSale': 'First Sale',
    'achievement.millionaire': 'Millionaire',
    'achievement.marketLeader': 'Market Leader',
    'achievement.techPioneer': 'Tech Pioneer',
    'achievement.massProducer': 'Mass Producer',

    // Common UI Elements
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.load': 'Load',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.error': 'Error',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.success': 'Success',
    'common.help': 'Help',

    // Units & Measurements
    'units.currency': '$',
    'units.percentage': '%',
    'units.thousand': 'K',
    'units.million': 'M',
    'units.billion': 'B',
    'units.mhz': 'MHz',
    'units.kb': 'KB',
    'units.mb': 'MB',
    'units.gb': 'GB',

    // Time & Dates
    'time.quarter': 'Q{quarter}',
    'time.year': '{year}',
    'time.month': 'Month',
    'time.week': 'Week',
    'time.day': 'Day',
    'time.january': 'January',
    'time.february': 'February',
    'time.march': 'March',
    'time.april': 'April',
    'time.may': 'May',
    'time.june': 'June',
    'time.july': 'July',
    'time.august': 'August',
    'time.september': 'September',
    'time.october': 'October',
    'time.november': 'November',
    'time.december': 'December',
  }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('computer-tycoon-language');
    return (saved as Language) || 'de';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('computer-tycoon-language', lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key] || key;
    
    // Simple parameter substitution for dynamic values
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      });
    }
    
    return translation;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};