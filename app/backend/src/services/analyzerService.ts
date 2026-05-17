export interface SavingsGoalParams {
  goalAmount: number;
  goalDate: string;
  currentSavings: number;
  monthlyContribution: number;
  rateOfReturn: number; // in percentage, e.g., 5 for 5%
}

export interface SavingsGoalResult {
  projectedNonReg: number;
  projectedTFSA: number;
  targetAmount: number;
  recommendedContribution: number;
  recommendedTFSA: number;
  isMeetingGoal: boolean;
  deficit: number;
}

export interface RetirementParams {
  age: number;
  retirementAge: number;
  lifespan: number;
  currentIncome: number;
  targetIncomePercentage: number;
  targetIncomeAmount: number;
  incomeMethod: 'percentage' | 'amount';
  rrspSavings: number;
  tfsaSavings: number;
  nonRegSavings: number;
  rrspContribution: number;
  tfsaContribution: number;
  nonRegContribution: number;
  contributionFrequency: 'monthly' | 'annually';
  rateOfReturn: number;
  inflationRate: number;
}

export interface RetirementResult {
  surplus: number;
  isMeetingGoal: boolean;
  chartData: Array<{
    age: number;
    amount: number;
    goal: number;
  }>;
}

export class AnalyzerService {
  static calculateSavingsGoal(params: SavingsGoalParams): SavingsGoalResult {
    const today = new Date();
    const goalDate = new Date(params.goalDate);
    const months = (goalDate.getFullYear() - today.getFullYear()) * 12 + (goalDate.getMonth() - today.getMonth());
    
    const monthlyRate = (params.rateOfReturn / 100) / 12;
    const n = Math.max(0, months);
    
    // Future Value formula: FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
    let fv = params.currentSavings;
    if (monthlyRate > 0 && n > 0) {
      fv = params.currentSavings * Math.pow(1 + monthlyRate, n) + 
           params.monthlyContribution * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate);
    } else if (n > 0) {
      fv = params.currentSavings + params.monthlyContribution * n;
    }

    const projectedTFSA = fv * 1.003; // Simple illustrative difference for tax-free growth over time
    const projectedNonReg = fv;

    // PMT formula for goal
    let requiredMonthly = 0;
    const amountToSave = params.goalAmount - (params.currentSavings * Math.pow(1 + monthlyRate, n));
    if (monthlyRate > 0 && n > 0) {
      requiredMonthly = (amountToSave * monthlyRate) / (Math.pow(1 + monthlyRate, n) - 1);
    } else if (n > 0) {
      requiredMonthly = amountToSave / n;
    }

    return {
      projectedNonReg: Number(projectedNonReg.toFixed(2)),
      projectedTFSA: Number(projectedTFSA.toFixed(2)),
      targetAmount: params.goalAmount,
      recommendedContribution: Number(Math.max(0, requiredMonthly).toFixed(2)),
      recommendedTFSA: Number(Math.max(0, requiredMonthly * 0.99).toFixed(2)), // Illustrative
      isMeetingGoal: fv >= params.goalAmount,
      deficit: Number(Math.max(0, params.goalAmount - fv).toFixed(2))
    };
  }

  static calculateRetirement(params: RetirementParams): RetirementResult {
    const realReturn = ((1 + params.rateOfReturn / 100) / (1 + params.inflationRate / 100)) - 1;
    const annualRate = realReturn;
    
    const accumulationYears = Math.max(0, params.retirementAge - params.age);
    const retirementYears = Math.max(0, params.lifespan - params.retirementAge);

    let currentTotal = params.rrspSavings + params.tfsaSavings + params.nonRegSavings;
    let annualContribution = params.rrspContribution + params.tfsaContribution + params.nonRegContribution;
    if (params.contributionFrequency === 'monthly') {
      annualContribution *= 12;
    }

    const chartData = [];

    // Accumulation phase
    let balance = currentTotal;
    for (let i = 0; i < accumulationYears; i++) {
      balance = balance * (1 + annualRate) + annualContribution;
      chartData.push({
        age: params.age + i,
        amount: Math.round(balance),
        goal: 0 // Placeholder
      });
    }

    // Required Retirement Income
    const targetIncome = params.incomeMethod === 'percentage' 
      ? params.currentIncome * (params.targetIncomePercentage / 100)
      : params.targetIncomeAmount;

    // Decumulation phase
    let ranOutOfMoney = false;
    for (let i = 0; i < retirementYears; i++) {
      balance = (balance - targetIncome) * (1 + annualRate);
      if (balance <= 0) {
        ranOutOfMoney = true;
        balance = 0;
      }
      chartData.push({
        age: params.retirementAge + i,
        amount: Math.round(balance),
        goal: Math.round(targetIncome * retirementYears) // simplistic goal representation
      });
    }

    const surplus = balance;
    return {
      surplus: Number(surplus.toFixed(2)),
      isMeetingGoal: !ranOutOfMoney,
      chartData
    };
  }
}
