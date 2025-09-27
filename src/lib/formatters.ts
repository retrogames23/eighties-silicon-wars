/**
 * Gemeinsame Formatierungsfunktionen für die gesamte Anwendung
 */

export const formatCurrency = (amount: number): string => `$${amount.toLocaleString()}`;

export const formatPercentage = (value: number, decimals = 1): string => 
  `${value.toFixed(decimals)}%`;

export const formatNumber = (value: number): string => value.toLocaleString();

export const formatQuarter = (quarter: number, year: number): string => 
  `Q${quarter} ${year}`;

/**
 * Quartal-Berechnungsfunktionen
 */
export const getNextQuarter = (currentQuarter: number, currentYear: number) => {
  if (currentQuarter === 4) {
    return { quarter: 1, year: currentYear + 1 };
  }
  return { quarter: currentQuarter + 1, year: currentYear };
};

export const getPreviousQuarter = (currentQuarter: number, currentYear: number) => {
  if (currentQuarter === 1) {
    return { quarter: 4, year: currentYear - 1 };
  }
  return { quarter: currentQuarter - 1, year: currentYear };
};

export const calculateQuartersDiff = (
  startQuarter: number, 
  startYear: number, 
  endQuarter: number, 
  endYear: number
): number => {
  const yearDiff = endYear - startYear;
  const quarterDiff = endQuarter - startQuarter;
  return yearDiff * 4 + quarterDiff;
};

export const addQuarters = (quarter: number, year: number, quartersToAdd: number) => {
  let currentQuarter = quarter;
  let currentYear = year;
  
  for (let i = 0; i < quartersToAdd; i++) {
    const next = getNextQuarter(currentQuarter, currentYear);
    currentQuarter = next.quarter;
    currentYear = next.year;
  }
  
  return { quarter: currentQuarter, year: currentYear };
};