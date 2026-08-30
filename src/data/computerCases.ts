// Single source of truth for computer chassis, including era availability.
// Presentation/catalog data only — no economy logic here.

export interface ComputerCaseDef {
  id: string;
  nameKey: string;
  descriptionKey: string;
  type: 'gamer' | 'office';
  quality: number;
  design: number;
  price: number;
  /** First year this chassis style exists on the market. */
  availableFromYear: number;
  /** First quarter within that year. */
  availableFromQuarter: number;
}

export interface ComputerCase {
  id: string;
  name: string;
  type: 'gamer' | 'office';
  quality: number;
  design: number;
  price: number;
  description: string;
  availableFromYear: number;
  availableFromQuarter: number;
  available: boolean;
}

/** Historically ordered catalog: early beige boxes first, towers much later. */
export const COMPUTER_CASE_DEFS: ComputerCaseDef[] = [
  {
    id: 'beige-breadbox',
    nameKey: 'hardware:cases.beigeBreadbox.name',
    descriptionKey: 'hardware:cases.beigeBreadbox.description',
    type: 'gamer',
    quality: 55,
    design: 45,
    price: 60,
    availableFromYear: 1983,
    availableFromQuarter: 1,
  },
  {
    id: 'beige-pizzabox',
    nameKey: 'hardware:cases.beigePizzabox.name',
    descriptionKey: 'hardware:cases.beigePizzabox.description',
    type: 'office',
    quality: 65,
    design: 40,
    price: 80,
    availableFromYear: 1983,
    availableFromQuarter: 1,
  },
  {
    id: 'retro-wood',
    nameKey: 'hardware:cases.retroWood.name',
    descriptionKey: 'hardware:cases.retroWood.description',
    type: 'gamer',
    quality: 60,
    design: 80,
    price: 150,
    availableFromYear: 1983,
    availableFromQuarter: 1,
  },
  {
    id: 'compact-mini',
    nameKey: 'hardware:cases.compactMini.name',
    descriptionKey: 'hardware:cases.compactMini.description',
    type: 'office',
    quality: 75,
    design: 65,
    price: 100,
    availableFromYear: 1984,
    availableFromQuarter: 1,
  },
  {
    id: 'black-desktop',
    nameKey: 'hardware:cases.blackDesktop.name',
    descriptionKey: 'hardware:cases.blackDesktop.description',
    type: 'office',
    quality: 70,
    design: 55,
    price: 120,
    availableFromYear: 1986,
    availableFromQuarter: 1,
  },
  {
    id: 'beige-tower',
    nameKey: 'hardware:cases.beigeTower.name',
    descriptionKey: 'hardware:cases.beigeTower.description',
    type: 'office',
    quality: 80,
    design: 55,
    price: 160,
    availableFromYear: 1988,
    availableFromQuarter: 1,
  },
  {
    id: 'premium-metal',
    nameKey: 'hardware:cases.premiumMetal.name',
    descriptionKey: 'hardware:cases.premiumMetal.description',
    type: 'office',
    quality: 95,
    design: 85,
    price: 300,
    availableFromYear: 1994,
    availableFromQuarter: 1,
  },
  {
    id: 'gamer-rgb',
    nameKey: 'hardware:cases.gamerRgb.name',
    descriptionKey: 'hardware:cases.gamerRgb.description',
    type: 'gamer',
    quality: 85,
    design: 90,
    price: 200,
    availableFromYear: 1997,
    availableFromQuarter: 1,
  },
];

export const isCaseAvailable = (
  def: ComputerCaseDef,
  year: number,
  quarter: number
): boolean =>
  year > def.availableFromYear ||
  (year === def.availableFromYear && quarter >= def.availableFromQuarter);

/** Full catalog with translated labels and an availability flag for the given date. */
export const getComputerCases = (
  t: (key: string) => string,
  year: number,
  quarter: number
): ComputerCase[] =>
  COMPUTER_CASE_DEFS.map((def) => ({
    id: def.id,
    name: t(def.nameKey),
    description: t(def.descriptionKey),
    type: def.type,
    quality: def.quality,
    design: def.design,
    price: def.price,
    availableFromYear: def.availableFromYear,
    availableFromQuarter: def.availableFromQuarter,
    available: isCaseAvailable(def, year, quarter),
  }));
