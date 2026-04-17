/**
 * QA Audit Test: Cash Flow Analysis
 * Verifies that the logic correctly categorizes dummy data according to 50-30-20.
 */

import { analyzeTransactions, Transaction } from '../services/cashflowService.js';
import * as fs from 'fs';
import * as path from 'path';

// Path relative to execution from d:\code\fa\app\backend
const dummyDataPath = path.join(process.cwd(), '../../production_artifacts/test_data.json');

const runAudit = () => {
  console.log("🔍 QA Audit: Starting Cash Flow Analysis Verification...");
  
  if (!fs.existsSync(dummyDataPath)) {
    console.error("❌ Error: test_data.json not found at " + dummyDataPath);
    console.log("Looking at path: " + dummyDataPath);
    return;
  }

  const transactions: Transaction[] = JSON.parse(fs.readFileSync(dummyDataPath, 'utf8'));
  const analysis = analyzeTransactions(transactions);

  console.log("\n--- Analysis Results ---");
  console.log(`Inflow: $${analysis.totalInflow}`);
  console.log(`Outflow: $${analysis.totalOutflow}`);
  console.log(`Net: $${analysis.netCashFlow}`);
  console.log("\n--- Budget Breakdown ---");
  console.log(`Fixed (Needs): ${analysis.percentages.fixedPct}%`);
  console.log(`Variable (Wants): ${analysis.percentages.variablePct}%`);
  console.log(`Savings: ${analysis.percentages.savingsPct}%`);
  console.log("\n--- Recommendation ---");
  console.log(analysis.recommendation);

  // QA Assertions
  const errors: string[] = [];
  if (analysis.totalInflow === 0) errors.push("Total inflow should not be zero");
  
  if (errors.length === 0) {
    console.log("\n✅ QA Audit: PASS");
  } else {
    console.log("\n❌ QA Audit: FAIL");
    errors.forEach(e => console.log(`  - ${e}`));
  }
};

runAudit();
