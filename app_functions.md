# Financial Advisor (FA) App Functions Documentation

This document describes the full functional specification of the Financial Advisor (FA) web application. It is intended to serve as a blueprint for developers to recreate the application with identical functionality.

## 1. Overview
The FA App is a comprehensive financial planning tool that guides users through a 4-step journey to achieve their financial goals (primarily focused on home ownership in Canada, but extensible to other goals). It integrates AI-powered transaction analysis, budget auditing, risk profiling, and an investment advisory engine.

## 2. Technical Stack
- **Frontend**: React (TypeScript), Tailwind CSS, Lucide-React (Icons), Recharts (Data Visualization), React-Dropzone.
- **Backend**: Node.js/Express (TypeScript), Google Gemini AI (for transaction extraction).
- **Hosting/Deployment**: Vercel.

---

## 3. Core Functional Modules

### Step 1: Cash Flow Hub (Budgeting)
**Goal**: Establish a baseline of the user's monthly financial health.
- **Transaction Entry**:
    - **Manual Mode**: User can add, edit, or delete transactions with Date, Description, Category, and Amount.
    - **AI Mode**: 
        - **File Upload**: Supports PDF, CSV, and Images (PNG/JPG).
        - **Text Paste**: User can paste raw bank statement text.
        - **AI Processing**: Uses Google Gemini to extract structured JSON (Date, Description, Category, Amount) from raw/unstructured inputs.
- **Budget Audit (50/30/20 Rule)**:
    - Automatically categorizes transactions into: **Fixed (Needs)**, **Variable (Wants)**, **Savings/Debt**, and **Income**.
    - Calculates **Net Cash Flow** (Income - Expenses).
    - Measures compliance against the 50/30/20 rule:
        - Needs: Max 50% of income.
        - Wants: Max 30% of income.
        - Savings: Target 20% of income.
    - **Visualizations**: Pie chart of spending categories and progress bars for budget compliance.
    - **Health Status**: Displays "Healthy Cash Flow" or "Deficit Detected" with tailored recommendations.

### Step 2: Goal Onboarding (Planning)
**Goal**: Quantify a specific financial target and timeline.
- **Goal Selection**:
    - **First Home**: Triggers specific mortgage and down payment calculations.
    - **Dream Vacation / Custom Goal**: Simple target amount input.
- **Housing-Specific Logic (Canadian Context)**:
    - **Property Types**: Condo, Townhouse, Semi-Detached, Single Family (pre-populated with Canadian median prices).
    - **Down Payment (DP) Logic**:
        - **5% (CMHC Insured)**: Calculates the minimum required DP based on the federal "5% on first $500k, 10% on remainder" rule.
        - **20% (Recommended)**: Conventional mortgage target (no insurance required).
        - **Custom DP**: Specific dollar amount.
    - **CMHC Insurance Calculation**: Estimates mortgage insurance premiums based on a tiered LTV (Loan-to-Value) table (matching CMHC standards).
- **General Parameters**:
    - **Time Horizon**: 6 to 120 months (Slider).
    - **Current Savings**: Starting principal.
    - **Pay Frequency**: Weekly, Bi-Weekly, Semi-Monthly, Monthly.
    - **Tax-Advantaged Accounts**: Toggle for FHSA (First Home Savings Account) or TFSA contributions. Includes "Pro Tips" for Canadian first-time buyers.

### Step 3: Investment Profiler (Strategy)
**Goal**: Determine the user's risk tolerance and appropriate investment strategy.
- **Adaptive Questionnaire**: 15 questions covering time horizon, knowledge, objectives, financial capacity, and risk attitude.
- **Derived Context**: Pre-fills certain answers based on Step 1 (Income/Stability) and Step 2 (Time Horizon/Concentration).
- **Scoring Engine**:
    - **Capacity Points**: Based on income, net worth, age, and stability.
    - **Attitude Points**: Based on psychological response to market drops and volatility.
- **Risk Archetypes**: Categorizes user into one of:
    - **Safety** (2% return)
    - **Very Conservative** (3% return)
    - **Conservative** (4% return)
    - **Moderate** (5% return)
    - **Aggressive** (7% return)
    - **Very Aggressive** (9% return)
- **Visualizations**: Radar chart showing 5 dimensions: Viability, Offensiveness, Decision, Endurance, and Adaptability.

### Step 4: Solutions Hub (Recommendations)
**Goal**: Provide a concrete, actionable savings and investment plan.
- **Advisory Engine**:
    - **PMT Calculation**: Calculates required monthly savings to reach the goal, accounting for compound interest at the profile's expected rate.
    - **Comparative Analysis**: Compares "Invested" vs. "Cash Only" savings requirements.
- **Allocation Strategy**:
    - Breaks down the monthly contribution into specific Canadian accounts:
        - **FHSA (First Home Savings Account)**: Prioritized up to $8,000/year ($333/mo) limit.
        - **RRSP (Home Buyers' Plan)**: Secondary priority up to 18% of income.
        - **TFSA (Tax-Free Savings Account)**: Tertiary for excess savings.
- **Investment Recommendation**:
    - Suggests a specific Vanguard "Asset Allocation" ETF (VCIP, VCNS, VBAL, VGRO, VEQT) based on the risk profile.
- **Gap Analysis**: Compares the required monthly contribution against the user's current surplus from Step 1.
- **Growth Projection**: 5-year growth chart for FHSA maximization.
- **Action Plan**: Checklist of next steps (Open account, Setup auto-pay, Buy ETF).

### Additional Systems
- **System Health Monitor**: A persistent `HealthIndicator` component that pings the backend `/health` endpoint every 30 seconds to ensure operational status.
- **Theme Management**: Support for Dark/Light modes with persistent storage in `localStorage`.
- **Global Context**: Uses `FinancialContext` to manage user state (Transactions, Goals, Profiles) across all steps without data loss on navigation.

---

## 4. Key Algorithms & Formulas

### PMT (Payment) Formula
Used to calculate the monthly savings amount ($PMT$) needed to reach a Future Value ($FV$) given a Present Value ($PV$), a monthly interest rate ($r$), and total months ($n$).
$$PMT = (FV - PV \times (1 + r)^n) \times \frac{r}{(1 + r)^n - 1}$$

### Minimum Down Payment (Canada)
- $Price \le \$500,000$: $5\% \times Price$
- $Price > \$500,000$: $(\$500,000 \times 5\%) + (Price - \$500,000) \times 10\%$

---

## 5. UI/UX Standards
- **Aesthetics**: Premium Dark Mode by default, Glassmorphism effects, grainy gradients, and smooth transitions.
- **Navigation**: Sidebar-based stepped progress with "lock" mechanism (Step 2 requires Step 1 completion, etc.).
- **Responsiveness**: Mobile-optimized wizard mode for the questionnaire and responsive grid layouts for dashboards.
- **Interactivity**: Real-time updates on sliders, hover states for charts, and portal-based dropdowns for clean UI.
