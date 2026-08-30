// Pixel matrices for the 16-bit machine preview.
// Characters: '.' transparent, L bright, l light, B base, D dark, K deep, W white-ish, P pad/pin.

export type PixelMatrix = string[];

export const CPU_SPRITE: PixelMatrix = [
  '.P.P.P.P.P.',
  '.DDDDDDDDD.',
  'PDLLLLLLLDP',
  '.DLBBBBBLD.',
  'PDLBKKKBLDP',
  '.DLBKWKBLD.',
  'PDLBKKKBLDP',
  '.DLBBBBBLD.',
  'PDLLLLLLLDP',
  '.DDDDDDDDD.',
  '.P.P.P.P.P.',
];

/** Extra heatsink fins that sit on top of a fast CPU. */
export const HEATSINK_SPRITE: PixelMatrix = [
  'L.L.L.L.L.L',
  'LDLDLDLDLDL',
  'LDLDLDLDLDL',
  'DDDDDDDDDDD',
];

export const RAM_SPRITE: PixelMatrix = [
  'DDDD',
  'DllD',
  'DBBD',
  'DKKD',
  'DBBD',
  'DKKD',
  'DBBD',
  'DKKD',
  'DBBD',
  'DllD',
  'DDDD',
  'P..P',
];

export const GPU_SPRITE: PixelMatrix = [
  'DDDDDDDDDDDDDDDDDD',
  'DllllllllllllllllD',
  'DlBBKKKKBBBBBBBBlD',
  'DlBBKKKKBBBWWBBBlD',
  'DlBBBBBBBBBBBBBBlD',
  'DllllllllllllllllD',
  '.PP...PP...PP..PP.',
];

export const SOUND_SPRITE: PixelMatrix = [
  'DDDDDDDDDDDDDDDDDD',
  'DllllllllllllllllD',
  'DlBBBKKKKBBBBBBBlD',
  'DlBBBKKKKBBWBWBBlD',
  'DllllllllllllllllD',
  '.PP...PP...PP..PP.',
];

export type StorageKind = 'cassette' | 'floppy' | 'disk' | 'optical';

/** Front-loading drive bay; the slot detail depends on the storage medium. */
export const storageSprite = (kind: StorageKind): PixelMatrix => {
  const slotRow: Record<StorageKind, string> = {
    cassette: 'DlKKKKKKKKKKKKlWlD',
    floppy: 'DlKKKKKKKKKKKKlWlD',
    disk: 'DlBBBBBBBBBBBBlWlD',
    optical: 'DlKKKKKKKKKKKKlWlD',
  };
  const faceRow: Record<StorageKind, string> = {
    cassette: 'DlBKKBBBBBBBKKBllD',
    floppy: 'DllllllllllllllllD',
    disk: 'DlllllBBBBBBllllllD'.slice(0, 18),
    optical: 'DlllKKKKKKKKllllllD'.slice(0, 18),
  };
  return [
    'DDDDDDDDDDDDDDDDDD',
    'DllllllllllllllllD',
    slotRow[kind],
    faceRow[kind],
    'DDDDDDDDDDDDDDDDDD',
  ];
};

/** Small speaker grill drawn on the case front. */
export const GRILL_SPRITE: PixelMatrix = [
  'D.D.D.D.D',
  '.D.D.D.D.',
  'D.D.D.D.D',
  '.D.D.D.D.',
];
