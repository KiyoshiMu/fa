import express, { Request, Response } from 'express';
import cors from 'cors';
import { calculateProfile, ScoringPolicy, QuestionnaireAnswers, getReturnRate, InvestmentProfile } from './services/investmentService.js';
import { AdvisoryService } from './services/AdvisoryService.js';
import { calculatePMT } from './utils/financeUtils.js';
import { analyzeTransactions, analyzeWithAI, analyzeWithFile, Transaction } from './services/cashflowService.js';
import { AnalyzerService, SavingsGoalParams, RetirementParams } from './services/analyzerService.js';
import multer from 'multer';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

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
    
    const fvOfCurrentSavings = currentSavings * Math.pow(1 + periodicRate, months);
    const amountToSave = goalAmount - fvOfCurrentSavings;
    
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
 * Endpoint: Analyze Cash Flow (Manual Data)
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
 * Endpoint: Analyze Cash Flow with Gemini AI (Raw Text)
 */
app.post('/api/cashflow/analyze-ai', async (req: Request, res: Response) => {
  try {
    const { rawText } = req.body as { rawText: string };
    
    if (!rawText) {
      return res.status(400).json({ error: 'Missing raw transaction text (rawText)' });
    }

    const transactions = await analyzeWithAI(rawText);
    const analysis = analyzeTransactions(transactions);
    
    res.json(analysis);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Analyze Cash Flow from File Upload (PDF, CSV, Image)
 */
app.post('/api/cashflow/analyze-file', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const transactions = await analyzeWithFile(
      req.file.buffer, 
      req.file.originalname, 
      req.file.mimetype
    );
    const analysis = analyzeTransactions(transactions);
    
    res.json(analysis);
  } catch (error: any) {
    console.error("File Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Advisory Analysis
 */
app.post('/api/advisory/analyze', (req: Request, res: Response) => {
    try {
        const result = AdvisoryService.analyze(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Endpoint: Analyzer Flow - Savings Goal
 */
app.post('/api/analyzer/savings-goal', (req: Request, res: Response) => {
    try {
        const params = req.body as SavingsGoalParams;
        const result = AnalyzerService.calculateSavingsGoal(params);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Endpoint: Analyzer Flow - Retirement
 */
app.post('/api/analyzer/retirement', (req: Request, res: Response) => {
    try {
        const params = req.body as RetirementParams;
        const result = AnalyzerService.calculateRetirement(params);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'An unexpected error occurred'
    });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`FA Backend listening at http://localhost:${port}`);
  });
}

export default app;
