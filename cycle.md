# Project Cycle: Financial Advisor

This file serves as the orchestration index for the multi-agent workflow.

## 🔄 Development Loop
1. **Plan**: Planner agent reads `project.md` and `image3` to update `api-manager.md` and tasks.
2. **Build**: Builder agent implements current tasks in `app/backend/`.
3. **QA**: QA agent verifies implementation and provides feedback in `production_artifacts/`.
4. **Iterate**: If QA fails, Builder refines. If PASS, Architect initiates next module.

## 📦 Phase Index
- **Phase 1: Foundation**: Architect sets up `.agents/` and `app/` structure. (IN PROGRESS)
- **Phase 2: Cash Flow**: Builder integrates Gemini for bank statement analysis.
- **Phase 3: Investment Profile**: Builder implements questionnaire scoring.
- **Phase 4: Projections**: Builder implements math formulas and visualizations.
- **Phase 5: Integration**: QA performs final system verification.
