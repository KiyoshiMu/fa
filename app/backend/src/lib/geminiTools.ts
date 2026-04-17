/**
 * Gemini Tool Definitions
 * These allow an LLM to call the backend financial functions.
 */

import { calculatePMT, calculateFV, calculateN } from '../utils/financeUtils.js';
import { calculateProfile, getReturnRate, InvestmentProfile, QuestionnaireAnswers, ScoringPolicy } from '../services/investmentService.js';

export const financialTools = [
  {
    name: "calculate_pmt",
    description: "Calculates the periodic payment required to reach a future value (FV) given an interest rate and number of periods.",
    parameters: {
      type: "object",
      properties: {
        fv: { type: "number", description: "Target future value" },
        r: { type: "number", description: "Periodic interest rate (e.g. 0.05/12 for 5% annual monthly)" },
        n: { type: "number", description: "Total number of periods (e.g. 120 for 10 years monthly)" }
      },
      required: ["fv", "r", "n"]
    }
  },
  {
    name: "calculate_fv",
    description: "Calculates the future value of a series of periodic payments.",
    parameters: {
      type: "object",
      properties: {
        pmt: { type: "number", description: "Periodic payment amount" },
        r: { type: "number", description: "Periodic interest rate" },
        n: { type: "number", description: "Total number of periods" }
      },
      required: ["pmt", "r", "n"]
    }
  },
  {
    name: "calculate_investment_profile",
    description: "Calculates the user's investment profile based on questionnaire answers.",
    parameters: {
      type: "object",
      properties: {
        answers: {
          type: "object",
          description: "JSON object containing all 15 question answers and point values"
        },
        policy: {
          type: "string",
          enum: ["weighted", "conservative"],
          description: "Scoring policy to use"
        }
      },
      required: ["answers"]
    }
  }
];

/**
 * Tool Handler for LLM execution
 */
export const handleToolCall = (name: string, args: any) => {
  switch (name) {
    case "calculate_pmt":
      return { result: calculatePMT(args.fv, args.r, args.n) };
    case "calculate_fv":
      return { result: calculateFV(args.pmt, args.r, args.n) };
    case "calculate_investment_profile":
      const profile = calculateProfile(args.answers as QuestionnaireAnswers, args.policy as ScoringPolicy || 'weighted');
      return {
        profile,
        rate: getReturnRate(profile)
      };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
};
