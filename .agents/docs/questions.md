# Financial Advisor Questionnaire & Scoring Logic

This document transcribes the questionnaire content and scoring rules extracted from the project's documentation images.

## 1. Investment Profile Questionnaire

### Part 1: General & Strategic Questions
| ID | Topic | Question | Options |
| :--- | :--- | :--- | :--- |
| **Q1** | Time Horizon | When do you plan to buy your home? (or reach your goal) | a) <1 year<br>b) 1-3 years<br>c) 4-5 years<br>d) 6-9 years<br>e) 10+ years |
| **Q2** | Knowledge | How would you describe your investment knowledge? | a) Novice<br>b) Basic<br>c) Average<br>d) Above Average<br>e) Advanced |
| **Q3** | Objectives | What is your primary goal for this investment? | a) Safety (Protect principal)<br>b) Income (Regular payments)<br>c) Balanced (Income & Growth)<br>d) Growth (Max long-term gain) |

### Part 2: Risk Capacity (Financial Situation)
*Scoring range: 0 - 62 points*

| ID | Title | Question | Options (Points) |
| :--- | :--- | :--- | :--- |
| **Q4** | Annual Income | What is your total annual household income? | a) <$20k (0)<br>b) $20-50k (2)<br>c) $50-100k (4)<br>d) $100-150k (5)<br>e) $150-200k (7)<br>f) >$200k (10) |
| **Q5** | Stability | How stable is your current source of income? | a) Very Stable (8)<br>b) Somewhat Stable (4)<br>c) Unstable (1) |
| **Q6** | Debt/Savings | Which best describes your current financial situation? | a) No savings, high debt (0)<br>b) Little savings, some debt (2)<br>c) Some savings, some debt (5)<br>d) Some savings, little debt (7)<br>e) Significant savings, little debt (10) |
| **Q7** | Net Worth | What is your approximate total net worth? | a) <$50k (0)<br>b) $50-100k (2)<br>c) $100-250k (4)<br>d) $250-500k (6)<br>e) $500k-1M (8)<br>f) $1-2M (10)<br>g) >$2M (12) |
| **Q8** | Concentration | What % of your portfolio is this investment? | a) <25% (10)<br>b) 25-50% (5)<br>c) 51-75% (4)<br>d) >75% (2) |
| **Q9** | Age | What is your age group? | a) Under 35 (20)<br>b) 35-54 (8)<br>c) 55-64 (3)<br>d) 65+ (1) |

### Part 3: Risk Attitude (Psychological)
*Scoring range: 0 - 50 points*

| ID | Title | Question | Options (Points) |
| :--- | :--- | :--- | :--- |
| **Q10** | Risk Tolerance | How would you describe your attitude toward risk? | a) Very Conservative (0)<br>b) Conservative (4)<br>c) Moderate (6)<br>d) Aggressive (10) |
| **Q11** | Tolerable Loss | How much market decline can you tolerate for a year? | a) 0% (0)<br>b) -3% (3)<br>c) -10% (6)<br>d) -20% (8)<br>e) >-20% (10) |
| **Q12** | Psychology | Do you prioritize avoiding loss or achieving gains? | a) Always avoid loss (0)<br>b) Generally avoid loss (3)<br>c) Generally achieve gains (6)<br>d) Always achieve gains (10) |
| **Q13** | Scenarios | Which $1,000 investment outcome is most acceptable? | a) $0 to $200 gain (0)<br>b) -$200 to $500 gain/loss (3)<br>c) -$800 to $1,200 gain/loss (6)<br>d) -$2,000 to $2,500 gain/loss (10) |
| **Q14** | Market Drop | If the market drops 20%, what would you do? | a) Sell all (0)<br>b) Sell a portion (3)<br>c) Hold (5)<br>d) Buy more (10) |
| **Q15** | Comfort | Which historical portfolio volatility feels right? | a) Portfolio A (Low volatility) (0)<br>b) Portfolio B (4)<br>c) Portfolio C (6)<br>d) Portfolio D (High volatility) (10) |

## 2. Investment Profile Mapping

| Profile | Q1 | Q2 | Q3 | Risk Capacity (Q4-Q9) | Risk Attitude (Q10-Q15) | Return Rate |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Safety** | a | - | a | < 11 | < 16 | 2% |
| **Very Conservative** | b | - | b | 11 - 15 | 16 - 20 | 3% |
| **Conservative** | - | - | - | 16 - 20 | 21 - 25 | 4% |
| **Moderate** | c | a | c | 21 - 30 | 26 - 30 | 5% |
| **Aggressive** | d | b | - | 31 - 45 | 31 - 45 | 7% |
| **Very Aggressive** | e | c,d,e | d | > 45 | > 45 | 9% |

## 3. Financial Formulas

- **PMT (Savings Projection)**:
  `PMT = (FV - PV*(1+r)^n) / (((1+r)^n - 1) / r)`
  Used to determine required monthly payment to reach goal FV from initial PV.

- **Cash Flow Analysis**:
  `Net Cash Flow = Total Inflow - Total Outflow`
  `Categorization`: Fixed (Needs), Variable (Wants), Savings (Debt Repayment).
  `Rule`: 50% Needs, 30% Wants, 20% Savings.
