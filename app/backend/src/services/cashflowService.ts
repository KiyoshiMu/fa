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

/**
 * Categorize raw transaction strings using Gemini AI
 */
export const analyzeWithAI = async (input: string): Promise<Transaction[]> => {
  const prompt = `
    Analyze the following bank statement or transaction list. 
    Categorize each transaction into one of: 'Fixed' (Needs: Rent, Loan, Insurance, Utilities), 
    'Variable' (Wants: Entertainment, Dining, Coffee), 'Savings' (Debt repayment, Investments, Savings), 
    'Income' (Salary, Dividends), or 'Unknown'.
    
    Ensure amounts are numbers (negative for outflow, positive for inflow).
    
    Input data:
    ${input}
  `;

  const responseText = await generateCategorizedJSON(prompt);
  
  try {
    return JSON.parse(responseText);
  } catch (err) {
    console.error("Failed to parse Gemini response:", responseText);
    throw new Error("AI returned invalid JSON formatting.");
  }
};

/**
 * Perform budget analysis on categorized transactions
 */
export const analyzeTransactions = (transactions: Transaction[]): CashflowAnalysis => {
  let totalInflow = 0;
  let fixed = 0;
  let variable = 0;
  let savings = 0;

  transactions.forEach(tx => {
    const absAmount = Math.abs(tx.amount);
    if (tx.category === 'Income') {
      totalInflow += absAmount;
    } else if (tx.category === 'Fixed') {
      fixed += absAmount;
    } else if (tx.category === 'Variable') {
      variable += absAmount;
    } else if (tx.category === 'Savings') {
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
    extractedTransactions: transactions
  };
};
