# FA Project: Data Models

## Transaction
The core entity for Cash Flow analysis.

```typescript
interface Transaction {
  id: string;
  date: string;       // ISO 8601 format
  description: string;
  amount: number;     // Positive for inflow, Negative for outflow
  category: TransactionCategory;
  source: 'bank' | 'manual' | 'ai_estimated';
}

type TransactionCategory = 
  | 'Fixed'    // Needs: Rent, Loan, Insurance, Utils
  | 'Variable' // Wants: Entertainment, Dining, Shopping
  | 'Savings'  // Savings/Debt: Debt repayment, Investment
  | 'Income'   // Salary, Dividends, etc.
  | 'Unknown'; // Requires BI analysis
```

## Cash Flow Summary
The result of an analysis session.

```typescript
interface CashflowSummary {
  inflow: number;
  outflow: number;
  net: number;
  breakdown: {
    fixed: number;    // Needs
    variable: number; // Wants
    savings: number;  // Savings/Debt
  };
  budgetCompliance: {
    needsPct: number;    // Goal <= 50%
    wantsPct: number;    // Goal <= 30%
    savingsPct: number;  // Goal >= 20%
  };
}
```
