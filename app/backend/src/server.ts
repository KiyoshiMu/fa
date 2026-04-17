import express, { Request, Response } from 'express';
import { calculateProfile, ScoringPolicy, QuestionnaireAnswers, getReturnRate, InvestmentProfile } from './services/investmentService.js';
import { calculatePMT } from './utils/financeUtils.js';
import { analyzeTransactions, analyzeWithAI, Transaction } from './services/cashflowService.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

/**
 * Health Check
 */
app.get('/health', (req: Request, res: Response) => {
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
    const fvRemaining = goalAmount - currentSavings;

    const pmtWithInvestment = calculatePMT(fvRemaining, periodicRate, months);
    const pmtWithoutInvestment = calculatePMT(fvRemaining, 0, months);

    res.json({
      profile,
      annualRate: rate,
      months,
      targetAmount: goalAmount,
      currentSavings,
      remainingToSave: fvRemaining,
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
    const { rawText } = req.body as { rawText: string };
    
    if (!rawText) {
      return res.status(400).json({ error: 'Missing raw transaction text' });
    }

    const transactions = await analyzeWithAI(rawText);
    const analysis = analyzeTransactions(transactions);
    
    res.json(analysis);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`FA Backend listening at http://localhost:${port}`);
});
