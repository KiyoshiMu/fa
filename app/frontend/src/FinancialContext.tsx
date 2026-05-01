import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { InvestmentProfile, AnalysisResponse } from './lib/api';

export type GoalType = 'Home' | 'Vacation' | 'Other';
export type PropertyType = 'condo' | 'townhouse' | 'semi-detached' | 'single family';
export type PayFrequency = 'monthly' | 'semi-monthly' | 'bi-weekly' | 'weekly';

export interface AppState {
    step: number;
    cashFlow: AnalysisResponse | null;
    payFrequency: PayFrequency;
    goal: {
        type: GoalType;
        targetAmount: number;
        currentSavings: number;
        months: number;
        hasFHSAOrTFSA: boolean;
        contribution: number;
        // Housing specific
        propertyType?: PropertyType;
        downPaymentPct?: number;
        customDP?: number;
        medianPrice?: number;
        cmhcInsurance?: number;
    } | null;
    profile: {
        type: InvestmentProfile;
        rate: number;
    } | null;
}

interface FinancialContextType {
    state: AppState;
    setStep: (step: number) => void;
    setCashFlow: (data: AnalysisResponse) => void;
    setPayFrequency: (freq: PayFrequency) => void;
    setGoal: (goal: AppState['goal']) => void;
    setProfile: (profile: AppState['profile']) => void;
    reset: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const INITIAL_STATE: AppState = {
    step: 1,
    cashFlow: null,
    payFrequency: 'bi-weekly',
    goal: null,
    profile: null
};

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(INITIAL_STATE);

    const setStep = (step: number) => setState(prev => ({ ...prev, step }));
    const setCashFlow = (cashFlow: AnalysisResponse) => setState(prev => ({ ...prev, cashFlow }));
    const setPayFrequency = (payFrequency: PayFrequency) => setState(prev => ({ ...prev, payFrequency }));
    const setGoal = (goal: AppState['goal']) => setState(prev => ({ ...prev, goal }));
    const setProfile = (profile: AppState['profile']) => setState(prev => ({ ...prev, profile }));
    const reset = () => setState(INITIAL_STATE);

    return (
        <FinancialContext.Provider value={{ state, setStep, setCashFlow, setPayFrequency, setGoal, setProfile, reset }}>
            {children}
        </FinancialContext.Provider>
    );
};

export const useFinancial = () => {
    const context = useContext(FinancialContext);
    if (!context) throw new Error('useFinancial must be used within FinancialProvider');
    return context;
};
