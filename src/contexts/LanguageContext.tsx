import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  de: {
    // Game Intro
    'intro.title': 'COMPUTER TYCOON',
    'intro.subtitle': 'Die 80er erwarten Sie...',
    'intro.description': 'Erleben Sie die Goldene Ära der Computertechnik. Entwickeln Sie bahnbrechende Hardware, treffen Sie strategische Entscheidungen und führen Sie Ihr Unternehmen zum Erfolg in einer Zeit, als Computer noch echte Innovationen waren.',
    'intro.prompt': '> Bereit für das ultimative Tech-Abenteuer?',
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
    'logo.microchip': 'Microchip',
    'logo.cpu': 'Prozessor',
    'logo.circuit': 'Schaltkreis',
    'logo.computer': 'Computer',

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

    // Tabs
    'tabs.development': 'Entwicklung',
    'tabs.market': 'Markt',
    'tabs.research': 'Forschung',

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
    'gameend.title': 'Spiel beendet!',
    'gameend.finalScore': 'Endpunktzahl',
    'gameend.newHighScore': 'Neue Bestleistung!',
    'gameend.playAgain': 'Nochmal spielen',
    'gameend.mainMenu': 'Hauptmenü',

    // Achievements
    'achievement.unlocked': 'Erfolg freigeschaltet!',
    'achievement.firstSale': 'Erster Verkauf',
    'achievement.millionaire': 'Millionär',
    'achievement.marketLeader': 'Marktführer',

    // Common
    'common.cancel': 'Abbrechen',
    'common.confirm': 'Bestätigen',
    'common.save': 'Speichern',
    'common.load': 'Laden',
    'common.back': 'Zurück',
    'common.next': 'Weiter',
  },
  en: {
    // Game Intro
    'intro.title': 'COMPUTER TYCOON',
    'intro.subtitle': 'The 80s await you...',
    'intro.description': 'Experience the Golden Age of computer technology. Develop groundbreaking hardware, make strategic decisions and lead your company to success in an era when computers were true innovations.',
    'intro.prompt': '> Ready for the ultimate tech adventure?',
    'intro.button': 'ENTER THE 80s',
    'intro.switchToGerman': 'Wechsel zu Deutsch',

    // Language Selection
    'language.title': 'Select Language',
    'language.description': 'Choose your preferred game language',
    'language.german': 'Deutsch',
    'language.english': 'English',
    'language.continue': 'Continue',

    // Company Setup
    'company.title': 'Company Foundation',
    'company.subtitle': 'Start Your Tech Empire',
    'company.nameLabel': 'Company Name',
    'company.namePlaceholder': 'Enter your company name',
    'company.logoLabel': 'Select Company Logo',
    'company.submit': 'Found Company',
    'company.nameRequired': 'Please enter a company name',

    // Logo names
    'logo.microchip': 'Microchip',
    'logo.cpu': 'Processor',
    'logo.circuit': 'Circuit',
    'logo.computer': 'Computer',

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

    // Tabs
    'tabs.development': 'Development',
    'tabs.market': 'Market',
    'tabs.research': 'Research',

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
    'gameend.title': 'Game Over!',
    'gameend.finalScore': 'Final Score',
    'gameend.newHighScore': 'New High Score!',
    'gameend.playAgain': 'Play Again',
    'gameend.mainMenu': 'Main Menu',

    // Achievements
    'achievement.unlocked': 'Achievement Unlocked!',
    'achievement.firstSale': 'First Sale',
    'achievement.millionaire': 'Millionaire',
    'achievement.marketLeader': 'Market Leader',

    // Common
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.load': 'Load',
    'common.back': 'Back',
    'common.next': 'Next',
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

  const t = (key: string): string => {
    return translations[language][key] || key;
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