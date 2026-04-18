import express, { Request, Response } from 'express';
import cors from 'cors';
import { calculateProfile, ScoringPolicy, QuestionnaireAnswers, getReturnRate, InvestmentProfile } from './services/investmentService.js';
import { calculatePMT } from './utils/financeUtils.js';
import { analyzeTransactions, analyzeWithAI, Transaction } from './services/cashflowService.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

export default app;

/**
 * Health Check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

/**
 * Endpoint: Calculate Investment Profile
 */
app.post('/api/invest/calc-profile', (req: Request, res: Response) => {
  try {
    const { answers, policy } = req.body as { answers: QuestionnaireAnswers, policy?: ScoringPolicy };
    
    if (!answers) {
      return res.status(400).json({ error: 'Missing questionnaire answers' });
    }

    const profile = calculateProfile(answers, policy || 'weighted');
    const rate = getReturnRate(profile);

    res.json({
      profile,
      annualRate: rate,
      monthlyRate: rate / 12
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Generate Savings Plan
 */
app.post('/api/invest/generate-plan', (req: Request, res: Response) => {
  try {
    const { goalAmount, currentSavings, months, profile } = req.body as {
      goalAmount: number;
      currentSavings: number;
      months: number;
      profile: InvestmentProfile;
    };

    if (!goalAmount || months === undefined || !profile) {
      return res.status(400).json({ error: 'Missing required projection parameters' });
    }

    const rate = getReturnRate(profile);
    const periodicRate = rate / 12;
    // Proper financial formula for PMT when there's an initial balance (PV):
    // FV = PV * (1+r)^n + PMT * [((1+r)^n - 1) / r]
    // Re-arranging for PMT:
    // PMT = (FV - PV * (1+r)^n) * r / ((1+r)^n - 1)
    
    const fvOfCurrentSavings = currentSavings * Math.pow(1 + periodicRate, months);
    const amountToSave = goalAmount - fvOfCurrentSavings;
    
    // We already have calculatePMT which is (FV * r) / ((1+r)^n - 1)
    // So we just pass the 'amountToSave' as the FV into it.
    const pmtWithInvestment = calculatePMT(amountToSave, periodicRate, months);
    const pmtWithoutInvestment = calculatePMT(goalAmount - currentSavings, 0, months);

    res.json({
      profile,
      annualRate: rate,
      months,
      targetAmount: goalAmount,
      currentSavings,
      remainingToSave: goalAmount - currentSavings,
      pmt: {
        withInvestment: Math.round(pmtWithInvestment * 100) / 100,
        withoutInvestment: Math.round(pmtWithoutInvestment * 100) / 100,
        monthlySaving: Math.round((pmtWithoutInvestment - pmtWithInvestment) * 100) / 100
      },
      disclaimer: "The rates of return shown are for illustrative purposes only and are not guaranteed. Actual results will vary based on market conditions and individual circumstances."
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Analyze Cash Flow
 */
app.post('/api/cashflow/analyze', (req: Request, res: Response) => {
  try {
    const { transactions } = req.body as { transactions: Transaction[] };
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Missing or invalid transactions list' });
    }

    const analysis = analyzeTransactions(transactions);
    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Analyze Cash Flow with Gemini AI
 */
app.post('/api/cashflow/analyze-ai', async (req: Request, res: Response) => {
  try {
    const { input } = req.body as { input: string };
    
    if (!input) {
      return res.status(400).json({ error: 'Missing raw transaction text (input)' });
    }

    const transactions = await analyzeWithAI(input);
    const analysis = analyzeTransactions(transactions);
    
    res.json(analysis);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`FA Backend listening at http://localhost:${port}`);
  });
}
