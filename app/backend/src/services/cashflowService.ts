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
  breakdown: {
    fixed: number;
    variable: number;
    savings: number;
  };
  percentages: {
    fixedPct: number;
    variablePct: number;
    savingsPct: number;
  };
  recommendation: string;
  items?: Transaction[];
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
    if (tx.amount > 0 || tx.category === 'Income') {
      totalInflow += Math.abs(tx.amount);
    } else {
      const absAmount = Math.abs(tx.amount);
      switch (tx.category) {
        case 'Fixed':
          fixed += absAmount;
          break;
        case 'Variable':
          variable += absAmount;
          break;
        case 'Savings':
          savings += absAmount;
          break;
      }
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
    breakdown: { fixed, variable, savings },
    percentages: {
      fixedPct: Math.round(fixedPct * 10) / 10,
      variablePct: Math.round(variablePct * 10) / 10,
      savingsPct: Math.round(savingsPct * 10) / 10
    },
    recommendation,
    items: transactions
  };
};
