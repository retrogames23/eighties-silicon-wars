import { describe, expect, it } from 'bun:test';
import { EnhancedTestReportGenerator } from '@/components/EnhancedTestReportGenerator';
import { TestScoringMatrix } from '@/services/TestScoringMatrix';

const base = { name: 'Gamer 1986', cpu: 'Motorola 68000', gpu: 'EGA Graphics', ram: '256KB RAM', sound: 'SID 6581', price: 1400 };
const report = (accessories: string[], year = 1986) => EnhancedTestReportGenerator.generateTestReport({ ...base, accessories }, year, 1);

describe('gamer storage in test reports', () => {
  it('deducts 10 gaming points without a drive', () => {
    expect(report(['Diskettenlaufwerk 5.25"']).categories.gaming.score - report([]).categories.gaming.score).toBe(10);
  });
  it('deducts 10 gaming points for cassette from 1986', () => {
    expect(report(['Diskettenlaufwerk 5.25"']).categories.gaming.score - report(['Kassettenlaufwerk']).categories.gaming.score).toBe(10);
  });
  it('accepts cassette through 1985', () => {
    expect(report(['Kassettenlaufwerk'], 1985).categories.gaming.score).toBe(report(['Diskettenlaufwerk 5.25"'], 1985).categories.gaming.score);
  });
  it('accepts hard disks after 1986', () => {
    expect(report(['Festplatte 5MB']).categories.gaming.score).toBe(report(['Diskettenlaufwerk 5.25"']).categories.gaming.score);
  });
  it('feeds the gaming deduction into the weighted overall rating', () => {
    const floppy = report(['Diskettenlaufwerk 5.25"']);
    const missing = report([]);
    const weighted = (r: ReturnType<typeof report>) => Math.round(r.categories.gaming.score * 0.35 + r.categories.business.score * 0.45 + r.compatibility.score * 0.1 + r.buildQuality.score * 0.1);
    expect(missing.overallScore).toBe(weighted(missing));
    expect(floppy.overallScore - missing.overallScore).toBe(4);
    expect(floppy.categories.business.score).toBe(missing.categories.business.score);
  });
  it('applies the storage deduction in the workbench preview too', () => {
    const preview = (accessories: string[]) => TestScoringMatrix.getEraRelativeOverallScore(base.cpu, base.gpu, base.ram, base.sound, 1986, 1, accessories);
    expect(preview(['Diskettenlaufwerk 5.25"']) - preview(['Kassettenlaufwerk'])).toBe(3);
  });
  it('floors penalized gaming scores at zero', () => {
    expect(TestScoringMatrix.adjustGamingScoreForStorage(5, [], 1986)).toBe(0);
  });
});