# FA Project: Technical Architecture

## Financial Logic
The application centered around the **50-30-20 rule** for budgeting and the **PMT formula** for savings goals.

### Budgeting (50-30-20)
- **50% Needs**: Loan payments, rent, insurance, bills, mortgages, strata fees.
- **30% Wants**: Entertainment, discretionary spending.
- **20% Savings/Debt**: Debt repayment and savings goals.

### Investment Profiles
Thresholds for mapping scores to profiles:
| Profile | Return Rate (r) |
| :--- | :--- |
| Safety | 2% |
| Very Conservative | 3% |
| Conservative | 4% |
| Moderate | 5% |
| Aggressive | 7% |
| Very Aggressive | 9% |

### Projections
Use PMT formula to calculate monthly savings needed to reach a Future Value (FV).
$PMT = \frac{FV \cdot r}{(1+r)^n - 1}$
Compare result at $r=0$ vs $r=profile\%$.
