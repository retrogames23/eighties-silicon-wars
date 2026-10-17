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
  it('loses at least 10 appeal with gamers', () => {
    const m = { ...base, sound: 'PC Speaker' };
    const a = EconomyModel.calculateSegmentAppeal({ ...m, accessories: ['Kassettenlaufwerk'] }, 'gamer', 1983, 1);
    const b = EconomyModel.calculateSegmentAppeal({ ...m, accessories: [] }, 'gamer', 1983, 1);
    expect(a - b).toBeGreaterThanOrEqual(10);
  });
});

describe('gamer storage from 1986', () => {
  const m = { cpu: 'Intel 8086', gpu: 'EGA Graphics', ram: '256KB RAM', sound: 'AdLib Sound' };
  it('cassette alone costs 10 gamer appeal in 1986', () => {
    const a = EconomyModel.calculateSegmentAppeal({ ...m, accessories: ['Diskettenlaufwerk 5.25"'] }, 'gamer', 1986, 1);
    const b = EconomyModel.calculateSegmentAppeal({ ...m, accessories: ['Kassettenlaufwerk'] }, 'gamer', 1986, 1);
    expect(a - b).toBe(10);
  });
  it('cassette still suffices in 1985', () => {
    expect(EconomyModel.hasGamerStorage({ accessories: ['Kassettenlaufwerk'] }, 1985)).toBe(true);
    expect(EconomyModel.hasGamerStorage({ accessories: ['Kassettenlaufwerk'] }, 1986)).toBe(false);
  });
});
