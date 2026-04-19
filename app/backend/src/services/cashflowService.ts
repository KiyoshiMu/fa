/**
 * Cash Flow Service
 * Analyzes transactions and applies 50-30-20 budget logic.
 */
import { generateCategorizedJSON } from '../lib/gemini.js';

export interface Transaction {
  id?: string;
  date: string;
  description: string;
  amount: number;
  category: 'Fixed' | 'Variable' | 'Savings' | 'Income' | 'Unknown';
}

export interface CashflowAnalysis {
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  needs: number;
  wants: number;
  savings: number;
  budgetCompliance: {
    needs: { actualPct: number; limitPct: number; status: string };
    wants: { actualPct: number; limitPct: number; status: string };
    savings: { actualPct: number; limitPct: number; status: string };
  };
  recommendation: string;
  extractedTransactions?: Transaction[];
}

import crypto from 'crypto';

/**
 * Categorize raw transaction strings using Gemini AI
 */
export const analyzeWithAI = async (input: string): Promise<Transaction[]> => {
  const prompt = `
    Analyze the following bank statement. Context year is 2026.
    
    CRITICAL COLUMN LOGIC:
    - Many statements use separate columns for "Withdrawals" and "Deposits".
    - If a number is in the "Deposits", "Credits", or "Income" column (usually the rightmost column), category MUST be 'Income' and amount MUST be positive.
    - If a number is in the "Withdrawals", "Purchases", or "Debits" column (usually the leftmost column), the amount MUST be negative.
    
    Extract every transaction line item. Ignore summaries or noise.
    
    Categorize into: 'Fixed' (Needs: Rent, Loan, Utilities), 
    'Variable' (Wants: Dining, Shopping, Coffee), 'Savings' (Debt, Investments), 
    'Income' (Salary, Deposits), or 'Unknown'.
    
    Input data:
    ${input}
    
    CRITICAL: Always return dates in YYYY-MM-DD format.
  `;

  const responseText = await generateCategorizedJSON(prompt);
  
  try {
    const rawTransactions: Transaction[] = JSON.parse(responseText);
    // Assign unique IDs to prevent frontend state collisions
    return rawTransactions.map(tx => {
        // Normalize date to YYYY-MM-DD if possible
        let normalizedDate = tx.date;
        try {
            const d = new Date(tx.date);
            if (!isNaN(d.getTime())) {
                normalizedDate = d.toISOString().split('T')[0];
            }
        } catch (e) {}

        return {
            ...tx,
            date: normalizedDate,
            id: tx.id || crypto.randomUUID(),
            // ALL numbers should be positive. UI handles signing based on category.
            amount: Math.abs(tx.amount)
        };
    });
  } catch (err) {
    console.error("Failed to parse Gemini response:", responseText);
    throw new Error("AI returned invalid JSON formatting.");
  }
};

/**
 * Perform budget analysis on categorized transactions
 * CAPS analysis to a 30-day window from the latest transaction
 */
export const analyzeTransactions = (transactions: Transaction[]): CashflowAnalysis => {
  if (transactions.length === 0) {
    return {
      totalInflow: 0, totalOutflow: 0, netCashFlow: 0, 
      needs: 0, wants: 0, savings: 0, 
      budgetCompliance: {
        needs: { actualPct: 0, limitPct: 50, status: 'On Track' },
        wants: { actualPct: 0, limitPct: 30, status: 'On Track' },
        savings: { actualPct: 0, limitPct: 20, status: 'Under Target' }
      },
      recommendation: "Add transactions to see your analysis.",
      extractedTransactions: []
    };
  }

  // 1. Identify "Latest Date" to define the 30-day window
  const sortedByDate = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestDate = new Date(sortedByDate[0].date);
  const cutoffDate = new Date(latestDate);
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  // 2. Filter transactions to only include the last month
  const monthlyTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= cutoffDate && txDate <= latestDate;
  });

  let totalInflow = 0;
  let fixed = 0;
  let variable = 0;
  let savings = 0;

  monthlyTransactions.forEach(tx => {
    const absAmount = Math.abs(tx.amount);
    const category = (tx.category || 'Unknown').trim().toLowerCase();

    if (category === 'income') {
      totalInflow += absAmount;
    } else if (category === 'fixed') {
      fixed += absAmount;
    } else if (category === 'variable') {
      variable += absAmount;
    } else if (category === 'savings') {
      savings += absAmount;
    } else {
      // Default behavior for Unknown or undefined categories
      if (tx.amount > 0) totalInflow += absAmount;
      else variable += absAmount;
    }
  });

  const totalOutflow = fixed + variable + savings;
  const netCashFlow = totalInflow - totalOutflow;

  const fixedPct = totalInflow > 0 ? (fixed / totalInflow) * 100 : 0;
  const variablePct = totalInflow > 0 ? (variable / totalInflow) * 100 : 0;
  const savingsPct = totalInflow > 0 ? (savings / totalInflow) * 100 : 0;

  let recommendation = "Your budget aligns well with the 50-30-20 rule.";
  if (fixedPct > 50) {
    recommendation = `Your 'Fixed' costs (${fixedPct.toFixed(1)}%) exceed the recommended 50%. Consider reviewing insurance, rent, or loan costs.`;
  } else if (variablePct > 30) {
    recommendation = `Your 'Variable' spending (${variablePct.toFixed(1)}%) is above the recommended 30%. Look for discretionary spending to cut.`;
  } else if (savingsPct < 20) {
    recommendation = `You are saving ${savingsPct.toFixed(1)}% of your income. Aim to reach the 20% savings target for better financial health.`;
  }

  return {
    totalInflow,
    totalOutflow,
    netCashFlow,
    needs: fixed,
    wants: variable,
    savings,
    budgetCompliance: {
      needs: { actualPct: Math.round(fixedPct * 10) / 10, limitPct: 50, status: fixedPct > 50 ? 'Over Budget' : 'On Track' },
      wants: { actualPct: Math.round(variablePct * 10) / 10, limitPct: 30, status: variablePct > 30 ? 'Over Budget' : 'On Track' },
      savings: { actualPct: Math.round(savingsPct * 10) / 10, limitPct: 20, status: savingsPct >= 20 ? 'Target Met' : 'Under Target' }
    },
    recommendation,
    extractedTransactions: sortedByDate // Return sorted list to UI
  };
};
