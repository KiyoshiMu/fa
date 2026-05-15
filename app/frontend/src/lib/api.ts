// Base API configuration
const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api';

// Questionnaire Data Structures
export interface QuestionnaireAnswers {
  timeHorizon: string;        // Q1 (Linked)
  knowledge: string;         // Q2 (Visible)
  objectives: string;        // Q3 (Visible)
  annualIncome: number;      // Q4 (Linked)
  incomeStability: number;   // Q5 (Linked)
  financialSituation: number; // Q6 (Visible)
  netWorth: number;          // Q7 (Visible)
  concentration: number;     // Q8 (Linked)
  ageGroup: number;          // Q9 (Visible)
  riskTolerance: number;     // Q10 (Visible)
  tolerableLoss: number;     // Q11 (Visible)
  psychology: number;        // Q12 (Visible)
  outcomeAcceptability: number; // Q13 (Visible)
  marketDrop: number;        // Q14 (Visible)
  historicalComfort: number; // Q15 (Visible)
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
  budgetCompliance: {
    needs: { actualPct: number; limitPct: number; status: string };
    wants: { actualPct: number; limitPct: number; status: string };
    savings: { actualPct: number; limitPct: number; status: string };
  };
  recommendation: string;
  extractedTransactions?: Transaction[];
  startDate?: string;
  endDate?: string;
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
  const res = await fetch(`${API_BASE}/invest/calc-profile`, {
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
  const res = await fetch(`${API_BASE}/invest/generate-plan`, {
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
  const res = await fetch(`${API_BASE}/cashflow/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions }),
  });
  return res.json() as Promise<AnalysisResponse>;
}

export async function analyzeWithAI(rawText: string) {
  const res = await fetch(`${API_BASE}/cashflow/analyze-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText }),
  });
  return res.json() as Promise<AnalysisResponse>;
}

export async function analyzeWithFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/cashflow/analyze-file`, {
    method: 'POST',
    body: formData,
  });
  return res.json() as Promise<AnalysisResponse>;
}

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

export const analyzeAdvisory = async (data: AdvisoryRequest): Promise<AdvisoryResponse> => {
    const response = await fetch(`${API_BASE}/advisory/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to analyze advisory path');
    return response.json();
};
