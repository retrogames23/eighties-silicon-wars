import { describe, it, expect } from 'bun:test';
import { TestScoringMatrix } from '@/services/TestScoringMatrix';
import { EconomyModel } from '@/components/EconomyModel';

describe('model without graphics chip', () => {
  it('loses 12 test points', () => {
    const withGpu = TestScoringMatrix.getEraRelativeOverallScore('MOS 6502', 'MOS VIC', '16KB RAM', 'PC Speaker', 1983, 1);
    const without = TestScoringMatrix.getEraRelativeOverallScore('MOS 6502', '', '16KB RAM', 'PC Speaker', 1983, 1);
    expect(withGpu - without).toBe(12);
  });
  it('is less popular with gamers', () => {
    const base = { cpu: 'MOS 6502', ram: '16KB RAM', sound: 'PC Speaker' };
    const g1 = EconomyModel.calculateSegmentAppeal({ ...base, gpu: 'MOS VIC' }, 'gamer', 1983, 1);
    const g0 = EconomyModel.calculateSegmentAppeal(base, 'gamer', 1983, 1);
    expect(g1 - g0).toBeGreaterThanOrEqual(20);
  });
});
