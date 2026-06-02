// ============================================================================
// Deterministisches Quartals-RNG
// ============================================================================
// Verhindert Save-Scumming: identische (userId, year, quarter)-Kombination
// liefert immer denselben Zahlenstrom — egal wie oft der Spieler lädt.
// Mulberry32 (32-Bit-PRNG), schnell, gute Verteilung für unsere Zwecke.
// ============================================================================

/** FNV-1a-Hash → 32-Bit-Seed aus einem String. */
export function hashSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

/** Mulberry32-PRNG: gibt eine Funktion zurück, die [0, 1) liefert. */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seed für ein konkretes Quartal eines Spielers (+ optionaler Spiel-Salt). */
export function quarterSeed(
  userId: string | null | undefined,
  year: number,
  quarter: number,
  salt?: string | null,
): number {
  const key = `${userId ?? 'anon'}|${salt ?? ''}|${year}|${quarter}`;
  return hashSeed(key);
}

/** Convenience: liefert direkt eine RNG-Funktion für (user, year, quarter, salt). */
export function quarterRng(
  userId: string | null | undefined,
  year: number,
  quarter: number,
  salt?: string | null,
): () => number {
  return mulberry32(quarterSeed(userId, year, quarter, salt));
}
