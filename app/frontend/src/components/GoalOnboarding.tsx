import React, { useState, useMemo, useEffect } from 'react';
import {
    Building2,
    Home,
    Info,
    ChevronRight,
    ChevronLeft,
    Zap
} from 'lucide-react';
import { useFinancial } from '../FinancialContext';
import type { PropertyType, PayFrequency, AppState } from '../FinancialContext';
import { calculateCMHC, PROPERTY_MEDIANS, calculateMinDP } from '../lib/mortgageUtils';

const GoalOnboarding: React.FC = () => {
    const { state, setGoal, setStep, setPayFrequency } = useFinancial();

    const [propertyType, setPropertyType] = useState<PropertyType>(state.goal?.propertyType || 'condo');
    const [targetAmount, setTargetAmount] = useState(state.goal?.targetAmount || 750000);
    const [savings, setSavings] = useState(state.goal?.desiredDownPayment || state.goal?.currentSavings || 37500);
    const [initialSavings, setInitialSavings] = useState(state.goal?.currentSavings || 37500);

    const [months, setMonths] = useState(state.goal?.months || 36);
    const [payFreq, setPayFreq] = useState<PayFrequency>(state.payFrequency || 'bi-weekly');
    const [dpStrategy, setDpStrategy] = useState<'5%' | '20%' | 'custom'>(
        savings / targetAmount <= 0.05 ? '5%' : savings / targetAmount >= 0.2 ? '20%' : 'custom'
    );
 
    // Keep savings in sync with targetAmount when using percentage-based strategies
    useEffect(() => {
        if (dpStrategy === '5%') {
            setSavings(calculateMinDP(targetAmount));
        } else if (dpStrategy === '20%') {
            setSavings(targetAmount * 0.2);
        }
    }, [targetAmount, dpStrategy]);


    // Sync local changes to global state for persistence
    useEffect(() => {
        const timeout = setTimeout(() => {
            setGoal({
                type: state.goal?.type || 'Home',
                targetAmount,
                currentSavings: initialSavings,
                desiredDownPayment: savings,
                months,
                hasFHSAOrTFSA: state.goal?.hasFHSAOrTFSA ?? false,
                contribution: state.goal?.contribution ?? 0,
                propertyType,
            });
            setPayFrequency(payFreq);
        }, 1000); // 1s debounce to avoid excessive storage writes
        return () => clearTimeout(timeout);
    }, [propertyType, targetAmount, savings, months, payFreq, setGoal, setPayFrequency, state.goal?.type, state.goal?.hasFHSAOrTFSA, state.goal?.contribution, initialSavings]);



    const cmhcInsurance = useMemo(() => calculateCMHC(targetAmount, savings), [targetAmount, savings]);

    // Dynamic savings calc for display
    const savingsGoal = targetAmount * (dpStrategy === '5%' ? 0.05 : dpStrategy === '20%' ? 0.2 : (savings / targetAmount));
    const closingCosts = targetAmount * 0.015;
    const totalCashNeeded = savingsGoal + closingCosts;
    const frequencyMultiplier = payFreq === 'monthly' ? 1 : 2.166;
    const requiredSavings = Math.max(0, Math.round((totalCashNeeded - initialSavings) / (months * frequencyMultiplier)));




    const updateGoal = (updates: Partial<AppState['goal'] & { payFrequency: PayFrequency }>) => {
        const newGoal = {
            type: state.goal?.type || 'Home',
            targetAmount: updates.targetAmount ?? targetAmount,
            currentSavings: updates.currentSavings ?? savings,
            months: updates.months ?? months,
            hasFHSAOrTFSA: state.goal?.hasFHSAOrTFSA ?? false,
            contribution: state.goal?.contribution ?? 0,
            propertyType: updates.propertyType ?? propertyType,
            ...updates
        };
        setGoal(newGoal as AppState['goal']);
        if (updates.payFrequency) setPayFrequency(updates.payFrequency);
    };

    const handleContinue = () => {
        updateGoal({ propertyType, targetAmount, currentSavings: savings, months });
        setStep(3);
    };


    const properties: { type: PropertyType; icon: React.ElementType; label: string }[] = [
        { type: 'condo', icon: Building2, label: 'Condo' },
        { type: 'townhouse', icon: Home, label: 'Townhouse' },
        { type: 'semi-detached', icon: Home, label: 'Semi-Detached' },
        { type: 'single family', icon: Home, label: 'Detached' },
    ];

    return (
        <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--vibrant-teal)] bg-[var(--vibrant-teal)]/10 px-3 py-1 rounded-full">Step 2 of 4</span>
                    <div className="h-px flex-1 bg-[var(--outline-variant)] opacity-30" />
                </div>
                <h1 className="display-lg text-[var(--on-surface)] mb-4">Target Property Details</h1>
                <p className="body-lg text-[var(--on-surface-variant)] max-w-2xl">
                    Define your future home parameters to calculate precise down payment requirements and CMHC insurance premiums.
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-8 space-y-10">
                    {/* Property Type */}
                    <section>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-4">Property Type</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {properties.map((prop) => (
                                <button
                                    key={prop.type}
                                    onClick={() => {
                                        setPropertyType(prop.type);
                                        const medianPrice = PROPERTY_MEDIANS[prop.type];
                                        setTargetAmount(medianPrice);
                                        
                                        // Update savings if using a percentage strategy
                                        if (dpStrategy === '5%') {
                                            setSavings(calculateMinDP(medianPrice));
                                        } else if (dpStrategy === '20%') {
                                            setSavings(medianPrice * 0.2);
                                        }
                                    }}
                                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all duration-300 ${propertyType === prop.type
                                            ? 'border-[var(--vibrant-teal)] bg-[var(--surface-container-low)] shadow-sm'
                                            : 'border-[var(--outline-variant)] bg-white hover:border-[var(--vibrant-teal)]/50'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl ${propertyType === prop.type ? 'bg-[var(--vibrant-teal)] text-white' : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)]'}`}>
                                        <prop.icon className="w-6 h-6" />
                                    </div>
                                    <span className={`text-xs font-bold ${propertyType === prop.type ? 'text-[var(--on-surface)]' : 'text-[var(--on-surface-variant)]'}`}>{prop.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Home Price */}
                    <section className="card p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Current Savings</h3>
                            <span className="text-xl font-bold text-[var(--on-surface-variant)]">${initialSavings.toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={targetAmount * 0.2}
                            step="1000"
                            value={initialSavings}
                            onChange={(e) => setInitialSavings(Number(e.target.value))}
                            className="w-full mb-10"
                        />

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Target Home Price</h3>
                            <span className="text-3xl font-bold text-[var(--vibrant-teal)]">${targetAmount.toLocaleString()}</span>
                        </div>

                        <input
                            type="range"
                            min="400000"
                            max="1500000"
                            step="10000"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(Number(e.target.value))}
                            className="w-full mb-4"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-widest opacity-60">
                            <span>$400k</span>
                            <span>$1.5M+</span>
                        </div>
                    </section>

                    {/* Down Payment Strategy */}
                    <section className="card p-8 space-y-8">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Down Payment Strategy</h3>
                        <div className="flex p-1 bg-[var(--surface-container-low)] rounded-xl w-fit">
                            {(['Min. CMHC Insured', '20% Conventional', 'Custom Amount'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => {
                                        if (s.includes('Min.')) { 
                                            setDpStrategy('5%'); 
                                            setSavings(calculateMinDP(targetAmount)); 
                                        }
                                        else if (s.includes('20%')) { setDpStrategy('20%'); setSavings(targetAmount * 0.2); }
                                        else setDpStrategy('custom');
                                    }}
                                    className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${(s.includes('Min.') && dpStrategy === '5%') ||
                                            (s.includes('20%') && dpStrategy === '20%') ||
                                            (s.includes('Custom') && dpStrategy === 'custom')
                                            ? 'bg-[var(--secondary-container)] text-[var(--on-secondary-container)] shadow-sm'
                                            : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Percentage (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={((savings / targetAmount) * 100).toFixed(2)}
                                        readOnly
                                        className="w-full bg-[var(--surface-container-low)] border-none rounded-xl py-4 px-6 text-sm font-bold"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] font-bold">%</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Amount ($)</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] font-bold">$</span>
                                    <input
                                        type="text"
                                        value={savings.toLocaleString()}
                                        readOnly
                                        className="w-full bg-[var(--surface-container-low)] border-none rounded-xl py-4 px-10 text-sm font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        {cmhcInsurance.insuranceAmount > 0 && (
                            <div className="p-6 rounded-2xl bg-[var(--surface-container)] border-none flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="p-2 bg-white rounded-lg text-[var(--vibrant-teal)] shadow-sm">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-[var(--on-surface)]">CMHC Insurance Required</h4>
                                    <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
                                        Down payments under 20% require mortgage default insurance. A premium of <span className="text-[var(--on-surface)] font-bold">${cmhcInsurance.insuranceAmount.toLocaleString()}</span> ({(cmhcInsurance.premium * 100).toFixed(2)}%) will be added to your mortgage principal.
                                    </p>
                                    <p className="text-[10px] text-[var(--on-surface-variant)] mt-2 italic opacity-70">
                                        * Minimum Down Payment in Canada: 5% on the first $500k + 10% on the remainder.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Horizon */}
                        <section className="card p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Purchase Horizon</h3>
                                <span className="text-xl font-bold text-[var(--vibrant-teal)]">{(months / 12).toFixed(0)} Years</span>
                            </div>
                            <input
                                type="range"
                                min="12"
                                max="120"
                                step="12"
                                value={months}
                                onChange={(e) => setMonths(Number(e.target.value))}
                                className="w-full mb-4"
                            />
                            <div className="flex justify-between text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-widest opacity-60">
                                <span>1 Yr</span>
                                <span>10 Yrs</span>
                            </div>
                        </section>

                        {/* Frequency */}
                        <section className="card p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-6">Saving Frequency</h3>
                            <div className="flex p-1 bg-[var(--surface-container-low)] rounded-xl">
                                {(['bi-weekly', 'monthly'] as PayFrequency[]).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setPayFreq(f)}
                                        className={`flex-1 py-3 rounded-lg text-xs font-bold capitalize transition-all ${payFreq === f ? 'bg-white shadow-sm text-[var(--on-surface)]' : 'text-[var(--on-surface-variant)]'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="card p-8 bg-white sticky top-28 border-2 border-[var(--vibrant-teal)]/10 shadow-lg">
                        <h2 className="headline-md mb-8">Goal Summary</h2>

                        <div className="space-y-6 mb-10">
                            <div className="space-y-1">
                                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">
                                    {dpStrategy === '5%' ? 'Min. Down Payment' : 'Target Down Payment'} ({(savings / targetAmount * 100).toFixed(1)}%)
                                </div>
                                <div className="text-4xl font-bold text-[var(--on-surface)]">${savings.toLocaleString()}</div>
                            </div>

                            <div className="h-px bg-[var(--outline-variant)] opacity-30" />

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-medium text-[var(--on-surface-variant)]">
                                    <span>Estimated Closing Costs</span>
                                    <span className="font-bold text-[var(--on-surface)]">${(targetAmount * 0.015).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-[var(--on-surface-variant)]">
                                    <span>CMHC Premium</span>
                                    <span className="font-bold text-[var(--on-surface)]">${cmhcInsurance.insuranceAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-[var(--outline-variant)] border-dashed">
                                    <span className="text-sm font-black uppercase tracking-tight">Total Cash Required</span>
                                    <span className="text-xl font-black text-[var(--emerald)]">${(savings + targetAmount * 0.015).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-[#86f2e4] bg-opacity-40 text-center space-y-2 mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-20 rounded-full -mr-12 -mt-12 blur-2xl" />
                            <div className="text-[10px] font-black uppercase tracking-widest text-[#006f66]">{payFreq} Savings Required</div>
                            <div className="text-4xl font-black text-[#006f66]">${requiredSavings.toLocaleString()}</div>

                            <div className="text-[10px] font-bold text-[#006f66] opacity-60">for the next {(months / 12).toFixed(0)} years</div>
                        </div>

                        <button
                            onClick={handleContinue}
                            className="w-full btn btn-secondary py-5 text-lg shadow-xl shadow-[var(--vibrant-teal)]/20 group"
                        >
                            Continue to Allocation
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-white border border-[var(--outline-variant)] flex gap-4">
                        <div className="p-3 bg-[var(--surface-container-low)] rounded-2xl text-[var(--vibrant-teal)]">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface)]">Pro Tip: Leverage the FHSA</h4>
                            <p className="text-[10px] text-[var(--on-surface-variant)] leading-relaxed font-medium">
                                If you’re saving for your first home in Canada, we strongly recommend opening a First Home Saving Account (FHSA), as it offers tax-deductible contributions and tax-free growth for qualifying home purchases.
                                You can contribute up to $8,000 annually.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-between items-center pt-8 border-t border-[var(--outline-variant)]">
                <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Cash Flow
                </button>
            </div>
        </div>
    );
};

export default GoalOnboarding;
