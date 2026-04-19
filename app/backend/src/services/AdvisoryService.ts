import { InvestmentProfile } from './investmentService.js';

export interface AdvisoryRequest {
    surplus: number;
    targetAmount: number;
    currentSavings: number;
    months: number;
    profileType: InvestmentProfile;
    annualRate: number;
}

export interface AdvisoryResponse {
    pmtWithInvest: number;
    pmtCashOnly: number;
    savingsGain: number;
    gap: number;
    isShort: boolean;
    recommendedETF: {
        ticker: string;
        name: string;
        desc: string;
    };
}

export class AdvisoryService {
    private static ETF_MAP: Record<string, { ticker: string, name: string, desc: string }> = {
        'Safety': { ticker: 'VCIP', name: 'Conservative Income', desc: '80% Bonds / 20% Stocks' },
        'Conservative': { ticker: 'VCNS', name: 'Conservative', desc: '60% Bonds / 40% Stocks' },
        'Moderate': { ticker: 'VBAL', name: 'Balanced', desc: '40% Bonds / 60% Stocks' },
        'Aggressive': { ticker: 'VGRO', name: 'Growth', desc: '20% Bonds / 80% Stocks' },
        'Very Aggressive': { ticker: 'VEQT', name: 'All-Equity', desc: '100% Stocks' },
    };

    /**
     * Standard PMT Calculation: How much to save monthly to reach a Future Value (fv)
     * Formula: PMT = (FV - PV * (1 + r)^n) * (r / ((1 + r)^n - 1))
     */
    static calculatePMT(fv: number, pv: number, r: number, n: number): number {
        if (n <= 0) return 0;
        if (r === 0) return (fv - pv) / n;
        
        const power = Math.pow(1 + r, n);
        const pmt = (fv - pv * power) * (r / (power - 1));
        return Math.max(0, pmt);
    }

    static analyze(data: AdvisoryRequest): AdvisoryResponse {
        const { surplus, targetAmount, currentSavings, months, profileType, annualRate } = data;
        const monthlyRate = annualRate / 12;

        const pmtWithInvest = this.calculatePMT(targetAmount, currentSavings, monthlyRate, months);
        const pmtCashOnly = this.calculatePMT(targetAmount, currentSavings, 0, months);
        const savingsGain = pmtCashOnly - pmtWithInvest;
        
        const gap = pmtWithInvest - surplus;
        const isShort = gap > 0;

        const recommendedETF = this.ETF_MAP[profileType] || this.ETF_MAP['Moderate'];

        return {
            pmtWithInvest: Math.round(pmtWithInvest * 100) / 100,
            pmtCashOnly: Math.round(pmtCashOnly * 100) / 100,
            savingsGain: Math.round(savingsGain * 100) / 100,
            gap: Math.round(gap * 100) / 100,
            isShort,
            recommendedETF
        };
    }
}
