import { describe, it, expect } from 'vitest';
import { AdvisoryService } from '../services/AdvisoryService.js';

describe('AdvisoryService', () => {
    describe('calculatePMT', () => {
        it('calculates simple interest correctly when rate is 0', () => {
            const pmt = AdvisoryService.calculatePMT(1000, 0, 0, 10);
            expect(pmt).toBe(100);
        });

        it('calculates compound interest PMT correctly (FV=$50k, PV=$5k, 6%, 36mo)', () => {
            // Formula value for this scenario is roughly $1112.56
            const pmt = AdvisoryService.calculatePMT(50000, 5000, 0.06 / 12, 36);
            expect(pmt).toBeCloseTo(1118.99, 1);
        });

        it('returns 0 if already over target', () => {
            const pmt = AdvisoryService.calculatePMT(10000, 15000, 0.05 / 12, 12);
            expect(pmt).toBe(0);
        });
    });

    describe('analyze', () => {
        const baseRequest = {
            surplus: 1500,
            targetAmount: 50000,
            currentSavings: 5000,
            months: 36,
            profileType: 'Moderate' as any,
            annualRate: 0.06
        };

        it('identifies fully funded scenario', () => {
            const result = AdvisoryService.analyze({ ...baseRequest, surplus: 2000 });
            expect(result.isShort).toBe(false);
            expect(result.gap).toBeLessThanOrEqual(0);
        });

        it('identifies gap scenario', () => {
            const result = AdvisoryService.analyze({ ...baseRequest, surplus: 500 });
            expect(result.isShort).toBe(true);
            expect(result.gap).toBeGreaterThan(0);
        });

        it('maps ETFs correctly', () => {
            const safety = AdvisoryService.analyze({ ...baseRequest, profileType: 'Safety' as any });
            expect(safety.recommendedETF.ticker).toBe('VCIP');

            const aggressive = AdvisoryService.analyze({ ...baseRequest, profileType: 'Aggressive' as any });
            expect(aggressive.recommendedETF.ticker).toBe('VGRO');
        });
    });
});
