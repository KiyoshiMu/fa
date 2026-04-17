# Skill: Planner

Detailed planning and task management for the FA project features.

## Core Responsibilities
- Break down the requirements in `project.md` into actionable tasks.
- Design API specifications for the backend services.
- Define JSON schemas for financial data input/output.
- Map the questionnaire scoring logic from `image3`.

## Feature Breakdown
### 1. Cash Flow Analysis
- Endpoint: `POST /api/cashflow/analyze`
- Task: Integrate Gemini to parse inflows/outflows and categorize as Fixed or Variable.

### 2. Investment Profile Questionnaire
- Endpoint: `POST /api/invest/calc-profile`
- Task: Implement scoring ranges for Risk Capacity (Q4-9) and Risk Attitude (Q10-15).

### 3. Savings Goal Projection
- Endpoint: `POST /api/invest/generate-plan`
- Task: Implement PMT formula $PMT = \frac{FV \cdot r}{(1+r)^n - 1}$ and comparison bar chart data.
