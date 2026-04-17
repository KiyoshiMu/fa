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
  timeHorizon: string; // 'a' | 'b' | 'c' | 'd' | 'e'
  knowledge: string;   // 'a' | 'b' | 'c' | 'd' | 'e'
  objectives: string; // 'a' | 'b' | 'c' | 'd'
  q4Points: number;
  q5Points: number;
  q6Points: number;
  q7Points: number;
  q8Points: number;
  q9Points: number;
  q10Points: number;
  q11Points: number;
  q12Points: number;
  q13Points: number;
  q14Points: number;
  q15Points: number;
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
  if (points <= 15) return 1; // Very Conservative
  if (points <= 20) return 2; // Conservative
  if (points <= 30) return 3; // Moderate
  if (points <= 45) return 4; // Aggressive
  return 5; // Very Aggressive
};

/**
 * Maps risk attitude points to a profile column index (0-5)
 */
const mapAttitudeToProfileIdx = (points: number): number => {
  if (points < 16) return 0; // Safety
  if (points <= 20) return 1; // Very Conservative
  if (points <= 25) return 2; // Conservative
  if (points <= 30) return 3; // Moderate
  if (points <= 45) return 4; // Aggressive
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
    mapCapacityToProfileIdx(answers.q4Points + answers.q5Points + answers.q6Points + answers.q7Points + answers.q8Points + answers.q9Points),
    mapAttitudeToProfileIdx(answers.q10Points + answers.q11Points + answers.q12Points + answers.q13Points + answers.q14Points + answers.q15Points)
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
