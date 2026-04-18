// Base API configuration
const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:3000';

// Questionnaire Data Structures
export interface QuestionnaireAnswers {
  timeHorizon: string; // 'a' | 'b' | 'c' | 'd' | 'e'
  knowledge: string;   // 'a' | 'b' | 'c' | 'd' | 'e'
  objectives: string; // 'a' | 'b' | 'c' | 'd'
  q4Points: number;
  q5Points: number;
  q6Points: number;
  q7Points: number;
  q8Points: number;
  q9Points: number;
  q10Points: number;
  q11Points: number;
  q12Points: number;
  q13Points: number;
  q14Points: number;
  q15Points: number;
}

export type InvestmentProfile = 'Safety' | 'Very Conservative' | 'Conservative' | 'Moderate' | 'Aggressive' | 'Very Aggressive';

// API Response Definitions
export interface ProfileResponse {
  profile: InvestmentProfile;
  annualRate: number;
  monthlyRate: number;
}

export interface PlanResponse {
  profile: InvestmentProfile;
  annualRate: number;
  months: number;
  targetAmount: number;
  currentSavings: number;
  remainingToSave: number;
  pmt: {
    withInvestment: number;
    withoutInvestment: number;
    monthlySaving: number;
  };
  disclaimer: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'Income' | 'Fixed' | 'Variable' | 'Savings';
}

export interface AnalysisResponse {
  needs: number;
  wants: number;
  savings: number;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  budgetCompliance: any;
  recommendation: string;
  extractedTransactions?: Transaction[];
}

// API Methods
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

export async function calculateInvestmentProfile(answers: QuestionnaireAnswers) {
  const res = await fetch(`${API_BASE}/api/invest/calc-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  const data = await res.json() as ProfileResponse;
  return {
    profile: data.profile,
    returnRate: data.annualRate,
    monthlyYield: data.monthlyRate
  };
}

export async function generateSavingsPlan(goalAmount: number, currentSavings: number, months: number, profile: InvestmentProfile) {
  const res = await fetch(`${API_BASE}/api/invest/generate-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goalAmount, currentSavings, months, profile }),
  });
  const data = await res.json() as PlanResponse;
  return {
    pmtWithInvestment: data.pmt.withInvestment,
    pmtWithoutInvestment: data.pmt.withoutInvestment,
    rate: data.annualRate
  };
}

export async function analyzeCashFlow(transactions: Transaction[]) {
  const res = await fetch(`${API_BASE}/api/cashflow/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions }),
  });
  return res.json() as Promise<AnalysisResponse>;
}

export async function analyzeWithAI(rawText: string) {
  const res = await fetch(`${API_BASE}/api/cashflow/analyze-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText }),
  });
  return res.json() as Promise<AnalysisResponse>;
}
