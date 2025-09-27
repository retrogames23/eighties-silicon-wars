/**
 * Game-spezifische Konstanten
 */

// Spielmechanik Konstanten
export const GAME_CONSTANTS = {
  QUARTERS_PER_YEAR: 4,
  MONTHS_PER_QUARTER: 3,
  STARTING_YEAR: 1983,
  STARTING_QUARTER: 1,
  
  // Economic Constants
  BASE_MARKETING_MULTIPLIER: 1.0,
  BASE_DEVELOPMENT_MULTIPLIER: 1.0,
  BASE_RESEARCH_MULTIPLIER: 1.0,
  
  // Hardware Constants
  MIN_OBSOLESCENCE_APPEAL: 0.2, // 20% minimum appeal
  OBSOLESCENCE_DECAY_PER_QUARTER: 0.15, // 15% decay per quarter
  
  // Market Constants
  BASE_MARKET_SIZE: 10000,
  MARKET_GROWTH_PER_YEAR: 0.15, // 15% growth per year
  
  // Cost Constants
  PRODUCTION_COST_MULTIPLIER: 0.1, // 10% of BOM
  OVERHEAD_COST_MULTIPLIER: 0.05, // 5% of revenue
} as const;

/**
 * UI-spezifische Konstanten
 */
export const UI_CONSTANTS = {
  CURRENCY_LOCALE: 'en-US',
  DEFAULT_ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  
  // Responsive Breakpoints (matches Tailwind)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
} as const;

/**
 * API & Storage Konstanten
 */
export const STORAGE_KEYS = {
  GAME_STATE: 'computer-tycoon-game-state',
  USER_PREFERENCES: 'computer-tycoon-preferences',
  MUSIC_ENABLED: 'computer-tycoon-music-enabled',
} as const;

export type GameConstants = typeof GAME_CONSTANTS;
export type UIConstants = typeof UI_CONSTANTS;
export type StorageKeys = typeof STORAGE_KEYS;