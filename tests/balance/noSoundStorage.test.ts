import { describe, it, expect } from 'bun:test';
import { TestScoringMatrix } from '@/services/TestScoringMatrix';
import { EconomyModel } from '@/components/EconomyModel';

const base = { cpu: 'MOS 6502', gpu: 'MOS VIC', ram: '16KB RAM' };

describe('model without sound chip', () => {
  it('loses 6 test points', () => {
    const a = TestScoringMatrix.getEraRelativeOverallScore('MOS 6502', 'MOS VIC', '16KB RAM', 'PC Speaker', 1983, 1);
    const b = TestScoringMatrix.getEraRelativeOverallScore('MOS 6502', 'MOS VIC', '16KB RAM', '', 1983, 1);
    expect(a - b).toBe(6);
  });
  it('is less popular with gamers', () => {
    const a = EconomyModel.calculateSegmentAppeal({ ...base, sound: 'PC Speaker' }, 'gamer', 1983, 1);
    const b = EconomyModel.calculateSegmentAppeal(base, 'gamer', 1983, 1);
    expect(a - b).toBeGreaterThanOrEqual(12);
  });
});

describe('model without any drive', () => {
  it('loses 15 appeal with business buyers', () => {
    const m = { ...base, sound: 'PC Speaker' };
    const a = EconomyModel.calculateSegmentAppeal({ ...m, accessories: ['Kassettenlaufwerk'] }, 'business', 1983, 1);
    const b = EconomyModel.calculateSegmentAppeal({ ...m, accessories: [] }, 'business', 1983, 1);
    expect(a - b).toBeGreaterThanOrEqual(15);
  });
  it('does not change gamer appeal by the drive rule', () => {
    const m = { ...base, sound: 'PC Speaker' };
    const a = EconomyModel.calculateSegmentAppeal({ ...m, accessories: ['Kassettenlaufwerk'] }, 'gamer', 1983, 1);
    const b = EconomyModel.calculateSegmentAppeal({ ...m, accessories: [] }, 'gamer', 1983, 1);
    expect(a - b).toBeLessThan(15);
  });
});
