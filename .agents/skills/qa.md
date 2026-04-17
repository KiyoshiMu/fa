# Skill: QA

Verification and quality assurance for the FA application.

## Core Responsibilities
- Verify that financial calculations (PMT, scores) are accurate.
- Test endpoint robustness and error handling.
- Audit UI/UX against the hand-drawn diagrams in `image7`.
- Perform edge-case testing for negative cash flow scenarios.

## Verification Checklist
- [ ] PMT formula matches $PMT = \frac{FV \cdot r}{(1+r)^n - 1}$.
- [ ] Risk scoring matches the thresholds in `image3`.
- [ ] Cash flow categorization handles unknown transactions gracefully.
- [ ] All visualizations handle 0 or negative values without crashing.
