import type { PropertyType, PayFrequency } from '../FinancialContext';

/**
 * CMHC Insurance Premium Lookup
 * Based on Loan-to-Value (LTV) ratio
 */
export const CMHC_TABLE = [
  { maxLtv: 0.65, premium: 0.006 },
  { maxLtv: 0.75, premium: 0.017 },
  { maxLtv: 0.80, premium: 0.024 },
  { maxLtv: 0.85, premium: 0.028 },
  { maxLtv: 0.90, premium: 0.031 },
  { maxLtv: 0.95, premium: 0.040 },
  { maxLtv: 1.00, premium: 0.045 }, // For non-traditional or high LTV
];

/**
 * Median Property Prices (Approximate for Greater Toronto Area)
 * Source: CREA/TREB Median Price Reference
 */
export const PROPERTY_MEDIANS: Record<PropertyType, number> = {
  'condo': 600000,
  'townhouse': 850000,
  'semi-detached': 1150000,
  'single family': 1450000,
};

/**
 * Calculate CMHC Insurance Premium
 * @param purchasePrice Total cost of the home
 * @param downPayment Amount paid upfront
 * @returns { insuranceAmount: number, ltv: number }
 */
export function calculateCMHC(purchasePrice: number, downPayment: number) {
  const downPaymentPct = downPayment / purchasePrice;
  const ltv = 1 - downPaymentPct;

  // If DP is 20% or more, CMHC is not required
  if (downPaymentPct >= 0.20) {
    return { insuranceAmount: 0, ltv, premium: 0 };
  }

  const mortgageAmount = purchasePrice - downPayment;
  // Match based on LTV. If > 95% or non-traditional, use 4.5%
  const match = CMHC_TABLE.find(row => ltv <= row.maxLtv);
  const premium = match ? match.premium : 0.045;

  return {
    insuranceAmount: mortgageAmount * premium,
    ltv,
    premium
  };
}

/**
 * Calculate Minimum Down Payment based on Purchase Price
 * Formula: 5% on first $500k + 10% on remainder (up to $1.5M per plan)
 */
export function calculateMinDP(purchasePrice: number): number {
  if (purchasePrice <= 500000) {
    return purchasePrice * 0.05;
  } else {
    // Plan: for 500k to 1.5M, 5%*500k + 10%*remaining
    return (500000 * 0.05) + ((purchasePrice - 500000) * 0.10);
  }
}

/**
 * Map months to Risk Profiler Q1 Time Horizon options
 */
export function mapMonthsToTimeHorizon(months: number): string {
  if (months < 12) return 'a'; // < 1 year
  if (months <= 36) return 'b'; // 1-3 years
  if (months <= 60) return 'c'; // 4-5 years
  if (months <= 108) return 'd'; // 6-9 years
  return 'e'; // 10+ years
}

/**
 * Map annual income to Risk Profiler Q4 points
 */
/**
 * Map net annual income (or gross estimate) to Risk Profiler Q4 points
 * Uses 2024 tax bracket estimation logic
 */
export function mapIncomeToPoints(netAnnualIncome: number): number {
  // Estimate Gross from Net (rough inverse of 2024 combined Fed+ON tax)
  let grossEstimate = netAnnualIncome;
  if (netAnnualIncome < 45000) grossEstimate = netAnnualIncome / 0.80; // ~20% tax
  else if (netAnnualIncome < 80000) grossEstimate = netAnnualIncome / 0.75; // ~25% tax
  else if (netAnnualIncome < 120000) grossEstimate = netAnnualIncome / 0.70; // ~30% tax
  else if (netAnnualIncome < 180000) grossEstimate = netAnnualIncome / 0.65; // ~35% tax
  else grossEstimate = netAnnualIncome / 0.60; // ~40%+ tax

  if (grossEstimate < 20000) return 0;
  if (grossEstimate < 50000) return 2;
  if (grossEstimate < 100000) return 4;
  if (grossEstimate < 150000) return 5;
  if (grossEstimate < 200000) return 7;
  return 10;
}

/**
 * Map pay frequency to Risk Profiler Q5 Stability points
 */
export function mapStabilityToPoints(frequency: PayFrequency): number {
  // If user has a fixed pay cycle, it's considered "Very Stable" (8 pts)
  const stableFrequencies: PayFrequency[] = ['weekly', 'bi-weekly', 'semi-monthly', 'monthly'];
  return stableFrequencies.includes(frequency) ? 8 : 1;
}

/**
 * Map concentration to Risk Profiler Q8 points
 * Based on % of portfolio this investment represents
 */
export function mapConcentrationToPoints(investmentAmount: number, netWorth: number): number {
  const pct = (investmentAmount / netWorth) * 100;
  if (pct < 25) return 10;
  if (pct <= 50) return 5;
  if (pct <= 75) return 4;
  return 2;
}
