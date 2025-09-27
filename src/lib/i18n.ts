import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import de from '../translations/de.json';
import en from '../translations/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: process.env.NODE_ENV === 'development',
    
    fallbackLng: 'de',
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    resources: {
      de,
      en
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    }
  });

export default i18n;