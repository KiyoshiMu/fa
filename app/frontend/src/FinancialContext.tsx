/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { InvestmentProfile, AnalysisResponse, Transaction, QuestionnaireAnswers } from './lib/api';

export type GoalType = 'Home' | 'Vacation' | 'Other';
export type PropertyType = 'condo' | 'townhouse' | 'semi-detached' | 'single family';
export type PayFrequency = 'monthly' | 'semi-monthly' | 'bi-weekly' | 'weekly';

export interface AppState {
    step: number;
    cashFlow: AnalysisResponse | null;
    transactions: Transaction[];
    payFrequency: PayFrequency;
    goal: {
        type: GoalType;
        targetAmount: number;
        currentSavings: number; // Existing savings
        desiredDownPayment: number; // Target down payment
        months: number;
        hasFHSAOrTFSA: boolean;
        contribution: number;
        // Housing specific
        propertyType?: PropertyType;
        location?: string;
        downPaymentPct?: number;
        customDP?: number;
        medianPrice?: number;
        cmhcInsurance?: number;
    } | null;

    profile: {
        type: InvestmentProfile;
        rate: number;
    } | null;
    profilerAnswers: Partial<QuestionnaireAnswers>;
    profilerStep: number;
}

interface FinancialContextType {
    state: AppState;
    setStep: (step: number) => void;
    setCashFlow: (data: AnalysisResponse) => void;
    setTransactions: (txs: Transaction[]) => void;
    setPayFrequency: (freq: PayFrequency) => void;
    setGoal: (goal: AppState['goal']) => void;
    setProfile: (profile: AppState['profile']) => void;
    setProfilerAnswers: (answers: Partial<QuestionnaireAnswers>) => void;
    setProfilerStep: (step: number) => void;
    reset: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const STORAGE_KEY = 'fa_session_state';

const INITIAL_STATE: AppState = {
    step: 0,
    cashFlow: null,
    transactions: [
        { id: '1', date: new Date().toISOString().split('T')[0], description: 'Salary', amount: 5000, category: 'Income' }
    ],
    payFrequency: 'bi-weekly',
    goal: {
        type: 'Home',
        targetAmount: 750000,
        currentSavings: 37500,
        desiredDownPayment: 37500,
        months: 36,
        hasFHSAOrTFSA: false,
        contribution: 0
    },
    profile: null,
    profilerAnswers: {},
    profilerStep: 0
};


const loadState = (): AppState => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error('Failed to load state from localStorage', e);
    }
    return INITIAL_STATE;
};

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(loadState);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const setStep = (step: number) => setState(prev => ({ ...prev, step }));
    const setCashFlow = (cashFlow: AnalysisResponse) => setState(prev => ({ ...prev, cashFlow }));
    const setTransactions = (transactions: Transaction[]) => setState(prev => ({ ...prev, transactions }));
    const setPayFrequency = (payFrequency: PayFrequency) => setState(prev => ({ ...prev, payFrequency }));
    const setGoal = (goal: AppState['goal']) => setState(prev => ({ ...prev, goal }));
    const setProfile = (profile: AppState['profile']) => setState(prev => ({ ...prev, profile }));
    const setProfilerAnswers = (profilerAnswers: Partial<QuestionnaireAnswers>) => setState(prev => ({ ...prev, profilerAnswers }));
    const setProfilerStep = (profilerStep: number) => setState(prev => ({ ...prev, profilerStep }));
    
    const reset = () => {
        localStorage.removeItem(STORAGE_KEY);
        setState(INITIAL_STATE);
    };

    return (
        <FinancialContext.Provider value={{ 
            state, 
            setStep, 
            setCashFlow, 
            setTransactions, 
            setPayFrequency, 
            setGoal, 
            setProfile, 
            setProfilerAnswers,
            setProfilerStep,
            reset 
        }}>
            {children}
        </FinancialContext.Provider>
    );
};

export const useFinancial = () => {
    const context = useContext(FinancialContext);
    if (!context) throw new Error('useFinancial must be used within FinancialProvider');
    return context;
};

