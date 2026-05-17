import React, { createContext, useContext, useState, useEffect } from 'react';

type AnalyzerStep = 'savings-goal' | 'retirement';

interface AnalyzerState {
  step: AnalyzerStep;
  savingsGoalInput: {
    province: string;
    goalAmount: number;
    goalDate: string;
    currentSavings: number;
    monthlyContribution: number;
    rateOfReturn: number;
    annualIncome: number;
  };
  retirementInput: {
    age: number;
    currentIncome: number;
    retirementAge: number;
    lifespan: number;
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
  };
}

const defaultState: AnalyzerState = {
  step: 'savings-goal',
  savingsGoalInput: {
    province: 'Ontario',
    goalAmount: 10000,
    goalDate: '2026-07-31',
    currentSavings: 2000,
    monthlyContribution: 200,
    rateOfReturn: 5.0,
    annualIncome: 80000,
  },
  retirementInput: {
    age: 30,
    currentIncome: 80000,
    retirementAge: 65,
    lifespan: 90,
    targetIncomePercentage: 70,
    targetIncomeAmount: 80000,
    incomeMethod: 'amount',
    rrspSavings: 10000,
    tfsaSavings: 7000,
    nonRegSavings: 7000,
    rrspContribution: 10000,
    tfsaContribution: 7000,
    nonRegContribution: 7000,
    contributionFrequency: 'annually',
    rateOfReturn: 3.0,
    inflationRate: 2.0,
  },
};

interface AnalyzerContextType {
  state: AnalyzerState;
  setStep: (step: AnalyzerStep) => void;
  updateSavingsGoal: (data: Partial<AnalyzerState['savingsGoalInput']>) => void;
  updateRetirement: (data: Partial<AnalyzerState['retirementInput']>) => void;
}

const AnalyzerContext = createContext<AnalyzerContextType | undefined>(undefined);

export const AnalyzerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AnalyzerState>(() => {
    const stored = sessionStorage.getItem('analyzerState');
    return stored ? JSON.parse(stored) : defaultState;
  });

  useEffect(() => {
    sessionStorage.setItem('analyzerState', JSON.stringify(state));
  }, [state]);

  const setStep = (step: AnalyzerStep) => setState(prev => ({ ...prev, step }));
  
  const updateSavingsGoal = (data: Partial<AnalyzerState['savingsGoalInput']>) => 
    setState(prev => ({ ...prev, savingsGoalInput: { ...prev.savingsGoalInput, ...data } }));
    
  const updateRetirement = (data: Partial<AnalyzerState['retirementInput']>) => 
    setState(prev => ({ ...prev, retirementInput: { ...prev.retirementInput, ...data } }));

  return (
    <AnalyzerContext.Provider value={{ state, setStep, updateSavingsGoal, updateRetirement }}>
      {children}
    </AnalyzerContext.Provider>
  );
};

export const useAnalyzer = () => {
  const context = useContext(AnalyzerContext);
  if (!context) throw new Error('useAnalyzer must be used within an AnalyzerProvider');
  return context;
};
