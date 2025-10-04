import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// ICU Polyfills for older browsers
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/de';
import '@formatjs/intl-pluralrules/locale-data/en';

// Define supported languages and namespaces
const SUPPORTED_LANGUAGES = ['de', 'en'] as const;
const NAMESPACES = ['common', 'ui', 'economy', 'toast', 'news', 'hardware', 'products', 'reviews', 'events', 'charts'] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
export type Namespace = typeof NAMESPACES[number];

// URL parameter detection function
const getLanguageFromURL = (): string | undefined => {
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  return langParam && SUPPORTED_LANGUAGES.includes(langParam as SupportedLanguage) ? langParam : undefined;
};

// Custom language detector with URL parameter support
const customDetector = {
  name: 'customDetector',
  lookup() {
    // 1. Check URL parameter first
    const urlLang = getLanguageFromURL();
    if (urlLang) return urlLang;
    
    // 2. Check localStorage
    const storedLang = localStorage.getItem('i18nextLng');
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang as SupportedLanguage)) {
      return storedLang;
    }
    
    // 3. Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)) {
      return browserLang;
    }
    
    // 4. Fallback to German
    return 'de';
  },
  cacheUserLanguage(lng: string) {
    localStorage.setItem('i18nextLng', lng);
    // Update URL parameter without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lng);
    window.history.replaceState({}, '', url.toString());
  }
};

i18n
  .use(Backend)
  .use({
    type: 'languageDetector',
    detect: customDetector.lookup,
    cacheUserLanguage: customDetector.cacheUserLanguage
  })
  .use(initReactI18next)
  .init({
    debug: process.env.NODE_ENV === 'development',
    
    fallbackLng: 'de',
    defaultNS: 'common',
    ns: NAMESPACES,
    
    // Enable React Suspense support
    react: {
      useSuspense: true
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
      format: (value, format, lng) => {
        // Custom ICU-like formatting
        if (format === 'currency') {
          return new Intl.NumberFormat(lng, { 
            style: 'currency', 
            currency: lng === 'de' ? 'EUR' : 'USD' 
          }).format(value);
        }
        
        if (format === 'percent') {
          return new Intl.NumberFormat(lng, { 
            style: 'percent', 
            minimumFractionDigits: 1 
          }).format(value / 100);
        }
        
        if (format === 'number') {
          return new Intl.NumberFormat(lng).format(value);
        }
        
        if (format === 'date') {
          return new Intl.DateTimeFormat(lng).format(new Date(value));
        }
        
        return value;
      }
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      
      // Lazy loading configuration
      allowMultiLoading: false,
      parse: (data: string) => JSON.parse(data),
      crossDomain: false,
      
      // Request options
      requestOptions: {
        mode: 'cors',
        credentials: 'same-origin',
        cache: 'default'
      }
    },
    
    detection: {
      order: ['customDetector'],
      caches: ['localStorage'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'i18nextLng'
    },
    
    // Load only essential namespaces initially
    preload: ['de', 'en'],
    load: 'languageOnly',
    
    // Fallback configuration
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${ns}:${key} for language: ${lng}`);
      }
    }
  });

// Helper functions for locale-specific formatting
export const formatters = {
  currency: (amount: number, locale: string = i18n.language) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: locale === 'de' ? 'EUR' : 'USD'
    }).format(amount);
  },
  
  percentage: (value: number, locale: string = i18n.language) => {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1
    }).format(value / 100);
  },
  
  number: (value: number, locale: string = i18n.language) => {
    return new Intl.NumberFormat(locale).format(value);
  },
  
  date: (date: Date, locale: string = i18n.language) => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  },
  
  quarter: (quarter: number, year: number, locale: string = i18n.language) => {
    if (locale === 'de') {
      return `Q${quarter} ${year}`;
    }
    
    const ordinal = ['st', 'nd', 'rd', 'th'];
    const suffix = ordinal[quarter - 1] || 'th';
    return `Q${quarter}${suffix} ${year}`;
  }
};

// Language switching utility
export const switchLanguage = (lang: SupportedLanguage) => {
  i18n.changeLanguage(lang);
};

// Lazy namespace loading utility  
export const loadNamespace = async (namespace: Namespace) => {
  if (!i18n.hasResourceBundle(i18n.language, namespace)) {
    await i18n.loadNamespaces(namespace);
  }
};

export default i18n;