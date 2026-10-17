import { describe, test, expect } from 'bun:test';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dir, '..', 'public', 'locales');
const flatten = (o: unknown, p = ''): string[] =>
  o && typeof o === 'object' && !Array.isArray(o)
    ? Object.entries(o as Record<string, unknown>).flatMap(([k, v]) => flatten(v, p ? `${p}.${k}` : k))
    : [p];
const load = (lng: string, f: string) => new Set(flatten(JSON.parse(readFileSync(join(root, lng, f), 'utf8'))));

describe('i18n coverage DE/EN', () => {
  for (const file of readdirSync(join(root, 'de')).filter((f) => f.endsWith('.json'))) {
    test(`${file}: same keys in de and en`, () => {
      const de = load('de', file);
      const en = load('en', file);
      expect([...de].filter((k) => !en.has(k))).toEqual([]);
      expect([...en].filter((k) => !de.has(k))).toEqual([]);
    });
  }
});
