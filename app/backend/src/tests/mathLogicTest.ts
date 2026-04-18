/**
 * mathLogicTest.ts
 * Verifies the fix for transaction categorization:
 * 1. Expenses entered as positive numbers are correctly subtracted.
 * 2. Incomes are correctly added.
 * 3. Net flow is balanced (Inflow - Fixed - Variable - Savings).
 */

import { analyzeTransactions, Transaction } from '../services/cashflowService.js';

const testMath = () => {
    console.log("🧪 Running Math Logic Tests for Cash Flow...");

    const testCases: { name: string; transactions: Transaction[]; expectedNet: number }[] = [
        {
            name: "Standard Income and Expense",
            transactions: [
                { id: '1', date: '2026-04-01', description: 'Salary', amount: 5000, category: 'Income' },
                { id: '2', date: '2026-04-02', description: 'Rent', amount: 1800, category: 'Fixed' }
            ],
            expectedNet: 3200 // 5000 - 1800
        },
        {
            name: "Positive Expenses Should Subtract",
            transactions: [
                { id: '1', date: '2026-04-01', description: 'Salary', amount: 5000, category: 'Income' },
                { id: '2', date: '2026-04-02', description: 'Food', amount: 100, category: 'Variable' }, // Positive 100
                { id: '3', date: '2026-04-03', description: 'Rent', amount: 1500, category: 'Fixed' }  // Positive 1500
            ],
            expectedNet: 3400 // 5000 - 100 - 1500
        },
        {
            name: "Savings Allocation Included",
            transactions: [
                { id: '1', date: '2026-04-01', description: 'Salary', amount: 5000, category: 'Income' },
                { id: '2', date: '2026-04-02', description: 'Savings Deposit', amount: 1000, category: 'Savings' }
            ],
            expectedNet: 4000 // 5000 - 1000
        }
    ];

    let passed = 0;
    testCases.forEach(tc => {
        const result = analyzeTransactions(tc.transactions);
        if (result.netCashFlow === tc.expectedNet) {
            console.log(`✅ PASS: ${tc.name}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${tc.name} | Expected ${tc.expectedNet}, got ${result.netCashFlow}`);
        }
    });

    console.log(`\nResults: ${passed}/${testCases.length} tests passed.`);
    process.exit(passed === testCases.length ? 0 : 1);
};

testMath();
