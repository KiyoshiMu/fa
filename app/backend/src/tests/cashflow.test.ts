import { describe, it, expect, vi } from 'vitest';
import { analyzeTransactions, analyzeWithAI } from '../services/cashflowService.js';

// Mock the AI library
vi.mock('../lib/gemini.js', () => ({
  generateCategorizedJSON: vi.fn()
}));

import { generateCategorizedJSON } from '../lib/gemini.js';

describe('CashflowService', () => {
    describe('analyzeTransactions', () => {
        it('calculates net cash flow and 50/30/20 percentages correctly', () => {
            const mockTransactions = [
                { date: '2026-04-01', description: 'Salary', amount: 5000, category: 'Income' as any },
                { date: '2026-04-02', description: 'Rent', amount: -2000, category: 'Fixed' as any },
                { date: '2026-04-03', description: 'Groceries', amount: -500, category: 'Fixed' as any },
                { date: '2026-04-05', description: 'Netflix', amount: -15, category: 'Variable' as any },
                { date: '2026-04-10', description: 'Eating Out', amount: -300, category: 'Variable' as any },
                { date: '2026-04-15', description: 'Savings', amount: -1000, category: 'Savings' as any }
            ];

            const analysis = analyzeTransactions(mockTransactions);

            expect(analysis.totalInflow).toBe(5000);
            expect(analysis.totalOutflow).toBe(3815);
            expect(analysis.netCashFlow).toBe(1185);
            
            // 50/30/20 Logic Verification
            // Fixed: 2500 / 5000 = 50%
            // Variable: 315 / 5000 = 6.3%
            // Savings: 1000 / 5000 = 20%
            expect(analysis.budgetCompliance.needs.actualPct).toBe(50);
            expect(analysis.budgetCompliance.wants.actualPct).toBe(6.3);
            expect(analysis.budgetCompliance.savings.actualPct).toBe(20);
            
            expect(analysis.budgetCompliance.needs.status).toBe('On Track');
            expect(analysis.budgetCompliance.savings.status).toBe('Target Met');
        });

        it('identifies Over Budget status when fixed costs > 50%', () => {
            const highRentTransactions = [
                { date: '2026-04-01', description: 'Salary', amount: 4000, category: 'Income' as any },
                { date: '2026-04-02', description: 'Expensive Rent', amount: -2500, category: 'Fixed' as any }
            ];

            const analysis = analyzeTransactions(highRentTransactions);
            expect(analysis.budgetCompliance.needs.actualPct).toBe(62.5);
            expect(analysis.budgetCompliance.needs.status).toBe('Over Budget');
        });

        it('filters transactions to a 30-day window from the latest item', () => {
            const mixedTransactions = [
                { date: '2026-04-30', description: 'Latest', amount: 1000, category: 'Income' as any },
                { date: '2026-04-15', description: 'Mid', amount: -500, category: 'Fixed' as any },
                { date: '2026-03-25', description: 'Old (Outside 30 days)', amount: -500, category: 'Fixed' as any }
            ];

            const analysis = analyzeTransactions(mixedTransactions);
            
            // Only 'Latest' ($1000) and 'Mid' (-$500) should be counted.
            // Total Inflow: 1000, Needs: 500
            expect(analysis.totalInflow).toBe(1000);
            expect(analysis.needs).toBe(500);
            expect(analysis.budgetCompliance.needs.actualPct).toBe(50);
        });
    });

    describe('analyzeWithAI', () => {
        it('successfully parses AI JSON response into transactions with absolute amounts', async () => {
            const mockAIResponse = JSON.stringify([
                { date: '2026-04-01', description: 'MOCK SALARY', amount: -3000, category: 'income' },
                { date: '04/02/2026', description: 'MOCK RENT', amount: -1200, category: 'Fixed' }
            ]);

            (generateCategorizedJSON as any).mockResolvedValue(mockAIResponse);

            const transactions = await analyzeWithAI("some raw text");

            expect(transactions).toHaveLength(2);
            expect(transactions[0].id).toBeDefined();
            expect(transactions[0].amount).toBe(3000); // Should be absolute
            expect(transactions[0].date).toBe('2026-04-01');
            
            expect(transactions[1].amount).toBe(1200); // Should be absolute
            expect(transactions[1].date).toBe('2026-04-02'); // Should be normalized to ISO
            expect(generateCategorizedJSON).toHaveBeenCalled();
        });

        it('throws error if AI returns invalid JSON', async () => {
            (generateCategorizedJSON as any).mockResolvedValue("Not a JSON string");

            await expect(analyzeWithAI("malformed data")).rejects.toThrow("AI returned invalid JSON formatting.");
        });
    });
});
