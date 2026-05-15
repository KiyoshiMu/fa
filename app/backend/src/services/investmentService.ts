/**
 * Investment Scoring Service
 * Implements logic from project.md and image3.png
 */

export type InvestmentProfile = 
  | 'Safety' 
  | 'Very Conservative' 
  | 'Conservative' 
  | 'Moderate' 
  | 'Aggressive' 
  | 'Very Aggressive';

export type ScoringPolicy = 'weighted' | 'conservative';

export interface QuestionnaireAnswers {
  timeHorizon: string;        // Q1 (Linked)
  knowledge: string;         // Q2 (Visible)
  objectives: string;        // Q3 (Visible)
  annualIncome: number;      // Q4 (Linked)
  incomeStability: number;   // Q5 (Linked)
  financialSituation: number; // Q6 (Visible)
  netWorth: number;          // Q7 (Visible)
  concentration: number;     // Q8 (Linked)
  ageGroup: number;          // Q9 (Visible)
  riskTolerance: number;     // Q10 (Visible)
  tolerableLoss: number;     // Q11 (Visible)
  psychology: number;        // Q12 (Visible)
  outcomeAcceptability: number; // Q13 (Visible)
  marketDrop: number;        // Q14 (Visible)
  historicalComfort: number; // Q15 (Visible)
}

const PROFILE_ORDER: InvestmentProfile[] = [
  'Safety',
  'Very Conservative',
  'Conservative',
  'Moderate',
  'Aggressive',
  'Very Aggressive'
];

/**
 * Maps risk capacity points to a profile column index (0-5)
 */
const mapCapacityToProfileIdx = (points: number): number => {
  if (points < 11) return 0; // Safety
  if (points <= 20) return 1; // Very Conservative
  if (points <= 30) return 2; // Conservative
  if (points <= 40) return 3; // Moderate
  if (points <= 55) return 4; // Aggressive
  return 5; // Very Aggressive
};

/**
 * Maps risk attitude points to a profile column index (0-5)
 */
const mapAttitudeToProfileIdx = (points: number): number => {
  if (points < 11) return 0; // Safety
  if (points <= 20) return 1; // Very Conservative
  if (points <= 30) return 2; // Conservative
  if (points <= 40) return 3; // Moderate
  if (points <= 50) return 4; // Aggressive
  return 5; // Very Aggressive
};

/**
 * Maps Q1, Q2, Q3 answers to profile indices based on image3.png
 */
const mapQAtoProfileIdx = (qId: number, answer: string): number => {
  const ans = answer.toLowerCase();
  if (qId === 1) { // Time Horizon
    return ['a', 'b', 'c', 'd', 'e'].indexOf(ans);
  }
  if (qId === 2) { // Knowledge
    if (ans === 'a') return 3; // Moderate
    if (ans === 'b') return 4; // Aggressive
    if (['c', 'd', 'e'].includes(ans)) return 5; // Very Aggressive
    return 3;
  }
  if (qId === 3) { // Objectives
    if (ans === 'a') return 0; // Safety
    if (ans === 'b') return 1; // Very Conservative
    if (ans === 'c') return 3; // Moderate
    if (ans === 'd') return 5; // Very Aggressive
    return 0;
  }
  return 0;
};

/**
 * Calculates the overall investment profile
 */
export const calculateProfile = (
  answers: QuestionnaireAnswers,
  policy: ScoringPolicy = 'weighted'
): InvestmentProfile => {
  const indices: number[] = [
    mapQAtoProfileIdx(1, answers.timeHorizon),
    mapQAtoProfileIdx(2, answers.knowledge),
    mapQAtoProfileIdx(3, answers.objectives),
    mapCapacityToProfileIdx(
      (answers.annualIncome || 0) + 
      (answers.incomeStability || 0) + 
      (answers.financialSituation || 0) + 
      (answers.netWorth || 0) + 
      (answers.concentration || 0) + 
      (answers.ageGroup || 0)
    ),
    mapAttitudeToProfileIdx(
      (answers.riskTolerance || 0) + 
      (answers.tolerableLoss || 0) + 
      (answers.psychology || 0) + 
      (answers.outcomeAcceptability || 0) + 
      (answers.marketDrop || 0) + 
      (answers.historicalComfort || 0)
    )
  ];

  let finalIdx: number;
  if (policy === 'conservative') {
    finalIdx = Math.min(...indices);
  } else {
    // Weighted Average (simple average for now, can be adjusted)
    const sum = indices.reduce((a, b) => a + b, 0);
    finalIdx = Math.round(sum / indices.length);
  }

  return PROFILE_ORDER[finalIdx];
};

/**
 * Returns the estimated annual rate of return (r) for a given profile
 */
export const getReturnRate = (profile: InvestmentProfile): number => {
  const rates: Record<InvestmentProfile, number> = {
    'Safety': 0.02,
    'Very Conservative': 0.03,
    'Conservative': 0.04,
    'Moderate': 0.05,
    'Aggressive': 0.07,
    'Very Aggressive': 0.09
  };
  return rates[profile];
};
