import React, { useState, useEffect } from 'react';
import { Home, Plane, Sparkles, ArrowRight, DollarSign, Calendar, ShieldCheck, Info, Building2, Layout, Landmark, Construction } from 'lucide-react';
import { useFinancial } from '../FinancialContext';
import type { GoalType, PropertyType, PayFrequency } from '../FinancialContext';
import { PROPERTY_MEDIANS, calculateCMHC } from '../lib/mortgageUtils';

const GoalOnboarding: React.FC = () => {
    const { state, setGoal, setStep, setPayFrequency } = useFinancial();
    const [goalType, setGoalType] = useState<GoalType>(state.goal?.type || 'Home');
    
    // Housing Specific State
    const [propertyType, setPropertyType] = useState<PropertyType>(state.goal?.propertyType || 'condo');
    const [dpPct, setDpPct] = useState<number>(state.goal?.downPaymentPct || 0.20);
    const [customDP, setCustomDP] = useState<number>(state.goal?.customDP || 50000);
    
    // General Goal State
    const [targetAmount, setTargetAmount] = useState<number>(state.goal?.targetAmount || 50000);
    const [currentSavings, setCurrentSavings] = useState<number>(state.goal?.currentSavings || 5000);
    const [months, setMonths] = useState<number>(state.goal?.months || 36);
    const [hasFHSA, setHasFHSA] = useState<boolean>(state.goal?.hasFHSAOrTFSA ?? true);
    const [contribution, setContribution] = useState<number>(state.goal?.contribution || 500);
    const [payFreq, setPayFreq] = useState<PayFrequency>(state.payFrequency || 'bi-weekly');

    // Auto-calculate target amount for housing
    useEffect(() => {
        if (goalType === 'Home') {
            const median = PROPERTY_MEDIANS[propertyType];
            let dpAmount = 0;
            
            if (dpPct === 0.05) {
                // Minimum DP calculation for > 500k
                if (median <= 500000) {
                    dpAmount = median * 0.05;
                } else {
                    dpAmount = (500000 * 0.05) + ((median - 500000) * 0.10);
                }
            } else if (dpPct === 0.20) {
                dpAmount = median * 0.20;
            } else if (dpPct === 0.35) {
                dpAmount = customDP;
            } else {
                dpAmount = median * dpPct;
            }

            const { insuranceAmount } = calculateCMHC(median, dpAmount);
            setTargetAmount(Math.round(dpAmount + insuranceAmount));
        }
    }, [goalType, propertyType, dpPct, customDP]);

    const handleContinue = () => {
        setPayFrequency(payFreq);
        setGoal({
            type: goalType,
            targetAmount,
            currentSavings,
            months,
            hasFHSAOrTFSA: hasFHSA,
            contribution,
            propertyType,
            downPaymentPct: dpPct,
            customDP,
            medianPrice: PROPERTY_MEDIANS[propertyType]
        });
        setStep(3);
    };

    const goals = [
        { id: 'Home' as GoalType, label: 'First Home', icon: Home, desc: 'Saving for a down payment', color: 'from-blue-500 to-indigo-600' },
        { id: 'Vacation' as GoalType, label: 'Dream Vacation', icon: Plane, desc: 'Luxury travel or sabbatical', color: 'from-emerald-500 to-teal-600' },
        { id: 'Other' as GoalType, label: 'Custom Goal', icon: Sparkles, desc: 'Wedding, Car, or Life Event', color: 'from-purple-500 to-pink-600' },
    ];

    const propertyTypes = [
        { id: 'condo' as PropertyType, label: 'Condo', icon: Building2, median: PROPERTY_MEDIANS['condo'] },
        { id: 'townhouse' as PropertyType, label: 'Townhouse', icon: Layout, median: PROPERTY_MEDIANS['townhouse'] },
        { id: 'semi-detached' as PropertyType, label: 'Semi-Detached', icon: Landmark, median: PROPERTY_MEDIANS['semi-detached'] },
        { id: 'single family' as PropertyType, label: 'Single Family', icon: Construction, median: PROPERTY_MEDIANS['single family'] },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    Step 2: Goal Identification
                </div>
                <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">What are we building for?</h2>
                <p className="text-foreground/40 text-lg max-w-2xl mx-auto italic font-medium">
                    A goal without a plan is just a wish. Let's quantify your vision.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {goals.map((g) => (
                    <button
                        key={g.id}
                        onClick={() => setGoalType(g.id)}
                        className={`group relative p-8 rounded-[2.5rem] text-left transition-all duration-500 border-2 overflow-hidden ${
                            goalType === g.id 
                                ? 'bg-secondary border-primary-500 shadow-2xl shadow-primary-500/20 -translate-y-2' 
                                : 'bg-secondary/40 border-transparent hover:border-foreground/10 hover:bg-secondary/60'
                        }`}
                    >
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                            <g.icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-2">{g.label}</h3>
                        <p className="text-xs text-foreground/40 font-medium leading-relaxed">{g.desc}</p>
                        
                        {goalType === g.id && (
                            <div className="absolute top-6 right-6">
                                <ShieldCheck className="w-6 h-6 text-primary-500 animate-in zoom-in duration-300" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="glass-card p-10 lg:p-14 space-y-10 border-foreground/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-12">
                        {goalType === 'Home' ? (
                            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
                                <div className="space-y-6">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                                        1. What type of property do you want?
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {propertyTypes.map((pt) => (
                                            <button
                                                key={pt.id}
                                                onClick={() => setPropertyType(pt.id)}
                                                className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                                                    propertyType === pt.id 
                                                        ? 'bg-primary-500/10 border-primary-500 shadow-lg' 
                                                        : 'bg-background/40 border-transparent hover:border-foreground/10'
                                                }`}
                                            >
                                                <pt.icon className={`w-6 h-6 mb-2 ${propertyType === pt.id ? 'text-primary-500' : 'text-foreground/20'}`} />
                                                <div className="text-xs font-black uppercase">{pt.label}</div>
                                                <div className="text-[10px] text-foreground/40 font-bold">${(pt.median/1000).toFixed(0)}k Median</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                                        2. Down Payment Percentage
                                        <div className="group relative">
                                            <Info className="w-4 h-4 cursor-help" />
                                            <div className="absolute bottom-full right-0 mb-2 w-64 p-4 rounded-2xl bg-foreground text-background text-[10px] font-bold leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50">
                                                CMHC insurance is required if down payment is less than 20%. 
                                                The premium is added to your total target amount.
                                            </div>
                                        </div>
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { label: '5% (CMHC)', val: 0.05 },
                                            { label: '20% (Rec)', val: 0.20 },
                                            { label: '35%+', val: 0.35 }
                                        ].map((opt) => (
                                            <button
                                                key={opt.label}
                                                onClick={() => setDpPct(opt.val)}
                                                className={`px-6 py-3 rounded-full border-2 transition-all font-black text-xs ${
                                                    dpPct === opt.val 
                                                        ? 'bg-foreground text-background border-foreground shadow-lg' 
                                                        : 'bg-background/40 border-border/40 text-foreground/40'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {dpPct === 0.35 && (
                                        <div className="relative animate-in slide-in-from-top-2">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-foreground/20">$</span>
                                            <input
                                                type="number"
                                                value={customDP}
                                                onChange={(e) => setCustomDP(Number(e.target.value))}
                                                placeholder="Custom amount"
                                                className="w-full bg-background/50 border-2 border-border/40 focus:border-primary-500 rounded-2xl p-4 pl-12 text-lg font-black text-foreground focus:outline-none transition-all"
                                            />
                                        </div>
                                    )}

                                    <div className="p-6 rounded-3xl bg-primary-500/5 border border-primary-500/10 space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-primary-500/60">Estimated Target</div>
                                                <div className="text-3xl font-black text-foreground">${targetAmount.toLocaleString()}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-foreground/30">DP + Insurance</div>
                                                <div className="text-xs font-bold text-foreground/60 italic">
                                                    {dpPct < 0.2 ? `Incl. approx $${(targetAmount - (PROPERTY_MEDIANS[propertyType] * dpPct)).toLocaleString()} insurance` : 'No CMHC Insurance'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                                        <DollarSign className="w-4 h-4 text-primary-500" /> Target Amount
                                    </label>
                                    <div className="relative group">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-foreground/20 group-focus-within:text-primary-500 transition-colors">$</span>
                                        <input
                                            type="number"
                                            value={targetAmount}
                                            onChange={(e) => setTargetAmount(Number(e.target.value))}
                                            className="w-full bg-background/50 border-2 border-border/40 focus:border-primary-500 rounded-3xl p-6 pl-12 text-3xl font-black text-foreground focus:outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                                <Calendar className="w-4 h-4 text-primary-500" /> Time Horizon (Months)
                            </label>
                            <div className="pt-4">
                                <input
                                    type="range"
                                    min="6"
                                    max="120"
                                    step="6"
                                    value={months}
                                    onChange={(e) => setMonths(Number(e.target.value))}
                                    className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary-500"
                                />
                                <div className="flex justify-between mt-4 text-sm font-black italic text-foreground/60">
                                    <span>6 mo</span>
                                    <span className="text-primary-500 text-lg bg-primary-500/5 px-4 py-1 rounded-full border border-primary-500/10">
                                        {months} Months ({(months/12).toFixed(1)} yrs)
                                    </span>
                                    <span>10 yrs</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                                <Sparkles className="w-4 h-4 text-primary-500" /> Current Savings
                            </label>
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-foreground/20 group-focus-within:text-primary-500 transition-colors">$</span>
                                <input
                                    type="number"
                                    value={currentSavings}
                                    onChange={(e) => setCurrentSavings(Number(e.target.value))}
                                    className="w-full bg-background/50 border-2 border-border/40 focus:border-primary-500 rounded-2xl p-5 pl-12 text-xl font-bold text-foreground focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-secondary/50 border border-border/40 space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-foreground uppercase tracking-tight">Pay Frequency</h4>
                                        <p className="text-[10px] text-foreground/40 font-medium">How often do you get paid?</p>
                                    </div>
                                    <select 
                                        value={payFreq}
                                        onChange={(e) => setPayFreq(e.target.value as PayFrequency)}
                                        className="bg-background border border-border/40 rounded-xl px-4 py-2 text-xs font-black uppercase outline-none focus:border-primary-500 transition-all"
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="bi-weekly">Bi-Weekly</option>
                                        <option value="semi-monthly">Semi-Monthly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-foreground uppercase tracking-tight">Tax-Advantaged Accounts</h4>
                                        <p className="text-[10px] text-foreground/40 font-medium">Do you contribute to FHSA (Home) or TFSA?</p>
                                    </div>
                                    <div 
                                        onClick={() => setHasFHSA(!hasFHSA)}
                                        className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-500 ${hasFHSA ? 'bg-primary-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-500 ${hasFHSA ? 'translate-x-6' : 'translate-x-0'} shadow-md`} />
                                    </div>
                                </div>

                                {hasFHSA && (
                                    <div className="animate-in slide-in-from-top-2 fade-in duration-500">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block">Monthly Contribution</label>
                                        <input
                                            type="number"
                                            value={contribution}
                                            onChange={(e) => setContribution(Number(e.target.value))}
                                            className="w-full bg-background/50 border border-border/40 focus:border-primary-500 rounded-xl p-3 font-mono text-sm text-foreground focus:outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            {goalType === 'Home' && !hasFHSA && (
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-500 animate-in zoom-in duration-500">
                                    <Info className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-[11px] font-bold leading-relaxed">
                                        PRO TIP: For a first home in Canada, we strongly recommend opening an FHSA. It provides tax-free growth and tax deductions.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex justify-center">
                    <button
                        onClick={handleContinue}
                        className="group relative px-12 py-5 bg-foreground text-background font-black uppercase tracking-[0.3em] text-sm rounded-full overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl shadow-foreground/20"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            Confirm Goal & Profile Risks <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                        </span>
                        <div className="absolute inset-0 bg-primary-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalOnboarding;
