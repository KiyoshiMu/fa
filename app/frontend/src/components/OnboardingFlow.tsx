import React from 'react';
import { useFinancial } from '../FinancialContext';
import CashFlowHub from './CashFlowHub';
import GoalOnboarding from './GoalOnboarding';
import InvestmentProfiler from './InvestmentProfiler';
import SolutionsHub from './SolutionsHub';
import { Leaf, Check, RefreshCw } from 'lucide-react';

const OnboardingFlow: React.FC = () => {
    const { state, setStep, reset } = useFinancial();

    const steps = [
        { id: 1, label: 'Financial Baseline', component: <CashFlowHub /> },
        { id: 2, label: 'Goal Architecture', component: <GoalOnboarding /> },
        { id: 3, label: 'Risk Intelligence', component: <InvestmentProfiler /> },
        { id: 4, label: 'Plan Finalization', component: <SolutionsHub /> },
    ];

    const currentStepIndex = state.step - 1;
    const currentStep = steps[currentStepIndex] || steps[0];

    return (
        <div className="min-h-screen bg-[var(--surface)] flex flex-col relative overflow-x-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--vibrant-teal)]/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--primary-container)]/10 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--outline-variant)]/30 px-6 py-4">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[var(--vibrant-teal)] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[var(--vibrant-teal)]/20">
                            <Leaf className="w-5 h-5 fill-current" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-[var(--on-surface)] hidden sm:block">Lumina Wealth</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-6">
                        {steps.map((s, idx) => {
                            const isCompleted = state.step > s.id;
                            const isActive = state.step === s.id;
                            const isPast = s.id < state.step;

                            return (
                                <React.Fragment key={s.id}>
                                    <button 
                                        onClick={() => setStep(s.id)}
                                        className={`flex items-center gap-2 group transition-all duration-300 ${
                                            isPast ? 'cursor-pointer' : isActive ? 'cursor-default' : 'cursor-not-allowed opacity-50'
                                        }`}
                                        disabled={s.id > state.step}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
                                            isCompleted 
                                                ? 'bg-[var(--emerald)] text-white shadow-sm shadow-[var(--emerald)]/20 group-hover:bg-[var(--emerald)] group-hover:scale-110' 
                                                : isActive 
                                                    ? 'bg-[var(--vibrant-teal)] text-white shadow-lg shadow-[var(--vibrant-teal)]/30 scale-110' 
                                                    : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]'
                                        }`}>
                                            {isCompleted ? <Check className="w-3 h-3 stroke-[4px]" /> : s.id}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 hidden lg:block ${
                                            isActive ? 'text-[var(--on-surface)]' : 'text-[var(--on-surface-variant)] opacity-40 group-hover:opacity-100'
                                        }`}>
                                            {s.label}
                                        </span>
                                    </button>
                                    {idx < steps.length - 1 && (
                                        <div className={`h-0.5 w-4 sm:w-8 rounded-full transition-colors duration-500 ${
                                            state.step > s.id ? 'bg-[var(--emerald)]/40' : 'bg-[var(--outline-variant)]/20'
                                        }`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <div className="hidden md:block">
                        <button 
                            onClick={() => {
                                if (window.confirm('Restart your journey? All progress will be lost.')) {
                                    reset();
                                }
                            }}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Restart Journey
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pt-12 pb-24 px-6 relative z-10">
                <div className="max-w-[1400px] mx-auto">
                    {currentStep.component}
                </div>
            </main>

            {/* Mobile Navigation Bar (Optional, can be added later if needed) */}
        </div>
    );
};

export default OnboardingFlow;
