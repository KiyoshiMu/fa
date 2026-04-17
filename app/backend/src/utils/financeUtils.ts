/**
 * Financial Utility Functions
 * Based on formulas from project.md and image2.png
 */

/**
 * Calculates the periodic payment required to reach a future value (FV)
 * Formula: PMT = (FV * r) / ((1 + r)^n - 1)
 * 
 * @param fv Future Value (target amount)
 * @param r Periodic interest rate (e.g., 0.05/12 for monthly if annual rate is 5%)
 * @param n Total number of periods (e.g., 10*12 for 10 years monthly)
 * @returns The periodic payment amount
 */
export const calculatePMT = (fv: number, r: number, n: number): number => {
  if (r === 0) return fv / n;
  return (fv * r) / (Math.pow(1 + r, n) - 1);
};

/**
 * Calculates the future value of a series of periodic payments
 * Formula: FV = PMT * (((1 + r)^n - 1) / r)
 * 
 * @param pmt Periodic payment amount
 * @param r Periodic interest rate
 * @param n Total number of periods
 * @returns The future value
 */
export const calculateFV = (pmt: number, r: number, n: number): number => {
  if (r === 0) return pmt * n;
  return pmt * ((Math.pow(1 + r, n) - 1) / r);
};

/**
 * Calculates the number of periods (n) required to reach a target (FV) with a fixed payment (PMT)
 * Formula: n = log((FV * r / PMT) + 1) / log(1 + r)
 * 
 * @param fv Target amount
 * @param pmt Fixed periodic payment
 * @param r Periodic interest rate
 * @returns The number of periods
 */
export const calculateN = (fv: number, pmt: number, r: number): number => {
  if (r === 0) return fv / pmt;
  return Math.log((fv * r) / pmt + 1) / Math.log(1 + r);
};
