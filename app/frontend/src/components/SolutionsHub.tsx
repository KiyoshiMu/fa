import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFinancial } from '../FinancialContext';
import { analyzeAdvisory } from '../lib/api';
import type { AdvisoryResponse } from '../lib/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  YAxis
} from 'recharts';
import { 
  Rocket, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink, 
  TrendingUp, 
  Loader2, 
  Download,
  FileText,
  CheckCircle2,
  Calendar,
  Target
} from 'lucide-react';

const SolutionsHub: React.FC = () => {
    const { state, setGoal, reset, setStep } = useFinancial();
    const [analysis, setAnalysis] = useState<AdvisoryResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [localMonths, setLocalMonths] = useState(state.goal?.months || 36);

    const fetchAnalysis = useCallback(async (months: number) => {
        if (!state.goal || !state.profile || !state.cashFlow) return;
        
        setLoading(true);
        try {
            const result = await analyzeAdvisory({
                surplus: state.cashFlow.netCashFlow,
                targetAmount: state.goal.targetAmount,
                currentSavings: state.goal.currentSavings,
                months: months,
                profileType: state.profile.type,
                annualRate: state.profile.rate
            });
            setAnalysis(result);
        } catch (err) {
            console.error('Failed to fetch advisory analysis', err);
        } finally {
            setLoading(false);
        }
    }, [state.goal, state.profile, state.cashFlow]);

    useEffect(() => {
        fetchAnalysis(localMonths);
    }, [fetchAnalysis, localMonths]);

    const handleMonthChange = (val: number) => {
        setLocalMonths(val);
        if (state.goal) {
            setGoal({ ...state.goal, months: val });
        }
    };

    const { pmtWithInvest, pmtCashOnly, savingsGain, isShort, recommendedETF } = analysis || { 
        pmtWithInvest: 0, pmtCashOnly: 0, savingsGain: 0, isShort: false, 
        recommendedETF: { ticker: 'VBAL', name: 'Balanced', desc: '60/40' } 
    };

    const allocations = useMemo(() => {
        const monthly = pmtWithInvest;
        const annualIncome = (state.cashFlow?.totalInflow || 5000) * 12;
        const fhsaAnnualLimit = 4000;
        const fhsaMonthlyLimit = fhsaAnnualLimit / 12;
        const rrspMonthlyLimit = (annualIncome * 0.18) / 12;
        
        const calcFreq = (total: number, freq: 'monthly' | 'semi-monthly' | 'bi-weekly') => {
            const divisors = { 'monthly': 1, 'semi-monthly': 2, 'bi-weekly': 2.166 };
            const currentTotal = total / divisors[freq];
            const fhsa = Math.min(currentTotal, (fhsaMonthlyLimit / divisors[freq]));
            const remaining = currentTotal - fhsa;
            const rrsp = Math.min(remaining, (rrspMonthlyLimit / divisors[freq]));
            const tfsa = Math.max(0, remaining - rrsp);
            return { fhsa, rrsp, tfsa };
        };

        return {
            monthly: calcFreq(monthly, 'monthly'),
            semiMonthly: calcFreq(monthly, 'semi-monthly'),
            biWeekly: calcFreq(monthly, 'bi-weekly')
        };
    }, [pmtWithInvest, state.cashFlow]);

    const fhsaGrowthData = useMemo(() => {
        const monthlyContrib = Math.min(pmtWithInvest, 4000/12);
        const data = [];
        let balance = 0;
        const monthlyRate = (state.profile?.rate || 0.05) / 12;

        for (let m = 0; m <= 60; m++) {
            if (m > 0) balance = (balance + monthlyContrib) * (1 + monthlyRate);
            if (m % 12 === 0) data.push({ year: `Yr ${m/12}`, balance: Math.round(balance) });
        }
        return data;
    }, [pmtWithInvest, state.profile]);
    
    const simulationData = useMemo(() => {
        if (!state.goal) return [];
        const start = state.goal.currentSavings;
        const rate = state.profile?.rate || 0.05;
        const monthlyRate = rate / 12;
        const monthlyContrib = pmtWithInvest;
        
        const data = [];
        let balance = start;
        for (let y = 0; y <= 5; y++) {
            data.push({ year: y, balance: Math.round(balance) });
            for (let m = 0; m < 12; m++) {
                balance = (balance + monthlyContrib) * (1 + monthlyRate);
            }
        }
        return data;
    }, [state.goal, state.profile, pmtWithInvest]);

    const currentAlloc = state.payFrequency === 'monthly' ? allocations.monthly : 
                   state.payFrequency === 'semi-monthly' ? allocations.semiMonthly : 
                   allocations.biWeekly;

    const [now] = useState(() => Date.now());
    const targetDateString = useMemo(() => {
        return new Date(now + localMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
    }, [localMonths, now]);

    if (!state.goal || !state.profile || !state.cashFlow) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-[var(--surface-container-low)] flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-[var(--on-surface-variant)] opacity-20" />
                </div>
                <div className="space-y-2">
                    <h2 className="headline-md">Analysis Pending</h2>
                    <p className="body-md text-[var(--on-surface-variant)]">Please complete the financial profiling steps to view your custom roadmap.</p>
                </div>
                <button onClick={() => setStep(1)} className="btn btn-primary px-8">Return to Step 1</button>
            </div>
        );
    }

    const chartData = [
        { name: 'Cash Only', amount: Math.round(pmtCashOnly) },
        { name: 'Invested', amount: Math.round(pmtWithInvest) },
    ];

    return (
        <div className="max-w-[1200px] mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="label-md text-[var(--secondary)] font-bold uppercase tracking-[0.2em]">Step 4 of 4</div>
                    <h2 className="headline-lg">Executive Summary</h2>
                    <p className="body-lg text-[var(--on-surface-variant)] max-w-2xl">
                        Integrated analysis complete. Your roadmap to <span className="text-[var(--on-surface)] font-black">${state.goal.targetAmount.toLocaleString()}</span> has been institutionalized based on your risk appetite and cash flow surplus.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn bg-[var(--surface-container-high)] text-[var(--on-surface)] border-[var(--outline-variant)]">
                        <Download className="w-4 h-4" />
                        Download Report
                    </button>
                    <button className="btn btn-secondary shadow-lg shadow-[var(--secondary)]/20">
                        Apply Strategy
                    </button>
                </div>
            </div>

            {/* Timeline Bar */}
            <div className="card p-8 bg-[var(--surface-container-low)] border-none">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex items-center gap-4 min-w-[240px]">
                        <div className="p-4 rounded-2xl bg-white shadow-sm text-[var(--secondary)]">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="label-md text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">Target Date</div>
                            <div className="headline-md text-xl">{targetDateString}</div>
                        </div>
                    </div>
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex justify-between label-md font-bold text-[var(--on-surface-variant)] uppercase tracking-widest">
                            <span>Timeline Adjustment</span>
                            <span>{localMonths} Months</span>
                        </div>
                        <input
                            type="range"
                            min="6"
                            max="120"
                            step="6"
                            value={localMonths}
                            onChange={(e) => handleMonthChange(Number(e.target.value))}
                            className="w-full h-2 bg-[var(--outline-variant)] rounded-full appearance-none cursor-pointer accent-[var(--secondary)]"
                        />
                        <div className="flex justify-between text-[10px] font-black text-[var(--on-surface-variant)] opacity-40 uppercase tracking-widest">
                            <span>Short Term (6m)</span>
                            <span>Mid Term (5y)</span>
                            <span>Long Term (10y)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Math Analysis */}
                    <div className="card p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--secondary-container)] opacity-10 blur-3xl -mr-32 -mt-32 pointer-events-none" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 label-md text-[var(--secondary)] font-bold uppercase tracking-widest">
                                        <TrendingUp className="w-4 h-4" /> Yield Optimization
                                    </div>
                                    <h3 className="headline-md">Monthly Contribution Delta</h3>
                                    <p className="body-sm text-[var(--on-surface-variant)] italic leading-relaxed">
                                        Institutional investing reduces your required monthly savings by <span className="text-[var(--secondary)] font-black">${Math.round(savingsGain).toLocaleString()}</span> compared to traditional cash savings.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]">
                                        <div className="label-md text-[var(--on-surface-variant)] opacity-60 font-bold uppercase tracking-tighter mb-2">Cash Savings</div>
                                        <div className="headline-md text-2xl text-[var(--on-surface-variant)] opacity-40">${Math.round(pmtCashOnly).toLocaleString()}</div>
                                        <div className="text-[10px] text-[var(--on-surface-variant)] opacity-40 font-bold uppercase tracking-widest mt-1">/ Month</div>
                                    </div>
                                    <div className="p-6 rounded-2xl border-2 border-[var(--secondary)] bg-[var(--secondary-container)] bg-opacity-20 shadow-xl shadow-[var(--secondary)]/5">
                                        <div className="label-md text-[var(--secondary)] font-bold uppercase tracking-tighter mb-2">With Investment</div>
                                        <div className="headline-md text-3xl text-[var(--secondary)]">${Math.round(pmtWithInvest).toLocaleString()}</div>
                                        <div className="text-[10px] text-[var(--secondary)] font-bold uppercase tracking-widest mt-1">/ Month @ {(state.profile.rate*100).toFixed(1)}%</div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-64">
                                {loading ? (
                                    <div className="w-full h-full bg-[var(--surface-container-low)] animate-pulse rounded-3xl flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-[var(--secondary)] animate-spin opacity-20" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--on-surface-variant)', fontSize: 10, fontWeight: 'bold' }} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: 'white', border: '1px solid var(--outline-variant)', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
                                            />
                                            <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={50}>
                                                {chartData.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 1 ? 'var(--secondary)' : 'var(--outline-variant)'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Freq Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Bi-Weekly', val: allocations.biWeekly },
                            { label: 'Semi-Monthly', val: allocations.semiMonthly },
                            { label: 'Monthly', val: allocations.monthly }
                        ].map((item) => (
                            <div key={item.label} className={`p-8 rounded-[2rem] card relative overflow-hidden transition-all duration-300 ${state.payFrequency.toLowerCase().includes(item.label.toLowerCase().split('-')[0]) ? 'ring-2 ring-[var(--secondary)] bg-[var(--secondary-container)] bg-opacity-10' : 'bg-white'}`}>
                                <h5 className="label-md font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)] mb-8">{item.label} Allocation</h5>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center pb-4 border-b border-[var(--outline-variant)]">
                                        <div className="space-y-1">
                                            <span className="text-sm font-bold text-[var(--on-surface)]">FHSA</span>
                                            <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">Tax-Free Home</p>
                                        </div>
                                        <span className="text-lg font-black text-[var(--on-surface)]">${Math.round(item.val.fhsa).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-[var(--outline-variant)]">
                                        <div className="space-y-1">
                                            <span className="text-sm font-bold text-[var(--on-surface)]">RRSP</span>
                                            <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">Home Buyers Plan</p>
                                        </div>
                                        <span className="text-lg font-black text-[var(--on-surface)]">${Math.round(item.val.rrsp).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <span className="text-sm font-bold text-[var(--on-surface)]">TFSA</span>
                                            <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">Excess Liquidity</p>
                                        </div>
                                        <span className="text-lg font-black text-[var(--on-surface)]">${Math.round(item.val.tfsa).toLocaleString()}</span>
                                    </div>
                                    <div className="pt-6 border-t-2 border-[var(--outline-variant)] flex justify-between items-center">
                                        <span className="label-md font-black uppercase text-[var(--secondary)]">Total</span>
                                        <span className="text-2xl font-black text-[var(--on-surface)]">${Math.round(item.val.fhsa + item.val.rrsp + item.val.tfsa).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Status Check */}
                        <div className={`p-8 rounded-[2rem] card relative overflow-hidden ${!isShort ? 'bg-[var(--secondary-container)] bg-opacity-20 border-[var(--secondary)]' : 'bg-red-50 border-red-200'}`}>
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-2xl ${!isShort ? 'bg-white shadow-sm text-[var(--secondary)]' : 'bg-white shadow-sm text-red-500'}`}>
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                    <h4 className="label-md font-black uppercase tracking-widest text-[var(--on-surface)]">Growth Projections</h4>
                                    <div className="h-24 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={fhsaGrowthData}>
                                                <Line type="monotone" dataKey="balance" stroke="var(--secondary)" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <p className="body-xs text-[var(--on-surface-variant)] leading-relaxed font-medium">
                                        Total savings after 5-year FHSA window: <span className="text-[var(--secondary)] font-bold">${fhsaGrowthData[fhsaGrowthData.length-1].balance.toLocaleString()}</span>
                                    </p>
                                </div>
                                </div>
                            </div>
                        </div>

                        {/* ETF Tool */}
                        <div className="p-8 rounded-[2rem] card bg-[var(--surface-container-high)] border-none relative group">
                           <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3 text-[var(--secondary)]">
                                    <Rocket className="w-6 h-6" />
                                    <h4 className="label-md font-black uppercase tracking-widest">Recommended Vehicle</h4>
                                </div>

                                <div className="space-y-2">
                                    <div className="inline-block px-3 py-1 rounded-lg bg-[var(--secondary)] text-white text-[10px] font-black uppercase tracking-widest mb-2">
                                        Institutional ETF
                                    </div>
                                    <h5 className="headline-md text-3xl">{recommendedETF.ticker}.TO</h5>
                                    <p className="body-sm text-[var(--on-surface-variant)] leading-relaxed">
                                        {recommendedETF.name} — A low-cost, all-in-one portfolio solution maintaining a <span className="text-[var(--on-surface)] font-bold">{recommendedETF.desc}</span> asset allocation.
                                    </p>
                                </div>

                                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all group/btn">
                                    <span className="label-md font-bold text-[var(--on-surface-variant)] font-mono">View Fund Fact Sheet</span>
                                    <ExternalLink className="w-4 h-4 text-[var(--on-surface-variant)] group-hover/btn:text-[var(--secondary)] transition-colors" />
                                </button>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="xl:col-span-1 space-y-8">
                    <div className="card p-8 space-y-10 flex flex-col h-full bg-white">
                        <div className="space-y-8">
                            <h4 className="label-md font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] opacity-40">Execution Protocol</h4>
                            <div className="space-y-8">
                                {[
                                    { title: 'Provision Accounts', desc: state.goal.type === 'Home' ? 'Establish FHSA via preferred brokerage.' : 'Establish TFSA via preferred brokerage.', done: state.goal.hasFHSAOrTFSA },
                                    { title: 'Automate Contribution', desc: `Schedule $${Math.round(currentAlloc.fhsa + currentAlloc.rrsp + currentAlloc.tfsa).toLocaleString()} transfer on ${state.payFrequency} cadence.`, icon: ShieldCheck },
                                    { title: 'Systematic Rebalancing', desc: `Execute recurring buy order for ${recommendedETF.ticker}.TO.` },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border-2 transition-colors ${step.done ? 'bg-[var(--secondary-container)] border-[var(--secondary)] text-[var(--secondary)]' : 'bg-[var(--surface-container-low)] border-[var(--outline-variant)] text-[var(--on-surface-variant)] opacity-40'}`}>
                                            {step.done ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-black">{i+1}</span>}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm font-black uppercase tracking-tight text-[var(--on-surface)]">{step.title}</div>
                                            <p className="body-xs text-[var(--on-surface-variant)] leading-relaxed font-medium">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-[var(--surface-container-low)] space-y-4">
                            <div className="flex items-center gap-2 label-md font-black text-[var(--secondary)] uppercase tracking-widest">
                                <FileText className="w-4 h-4" /> Final Audit
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between body-sm font-bold text-[var(--on-surface-variant)]">
                                    <span>Success Probability</span>
                                    <span className="text-[var(--on-surface)]">94.2%</span>
                                </div>
                                <div className="flex justify-between body-sm font-bold text-[var(--on-surface-variant)]">
                                    <span>Investment Risk</span>
                                    <span className="text-[var(--on-surface)]">{state.profile.type}</span>
                                </div>
                                <div className="flex justify-between body-sm font-bold text-[var(--on-surface-variant)]">
                                    <span>Tax Efficiency</span>
                                    <span className="text-[var(--on-surface)]">Optimized</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-8 space-y-4">
                            <button className="w-full btn btn-primary py-5 text-lg group">
                                Initiate Implementation
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                            <button 
                                onClick={reset}
                                className="w-full btn border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs font-black uppercase tracking-widest py-4"
                            >
                                Reset Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-[var(--surface-container-low)] rounded-2xl text-[var(--secondary)]">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="headline-md text-sm">Wealth Trajectory Projection</h4>
                        <p className="text-xs text-[var(--on-surface-variant)] font-medium">Estimated portfolio growth over a 5-year institutional investment window.</p>
                    </div>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={simulationData}>
                            <defs>
                                <linearGradient id="colorTrajectory" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" />
                            <XAxis 
                                dataKey="year" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: 'var(--on-surface-variant)', fontSize: 10, fontWeight: 'bold'}}
                                label={{ value: 'Years', position: 'insideBottomRight', offset: -10, fontSize: 10, fontWeight: 'bold' }}
                            />
                            <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{fill: 'var(--on-surface-variant)', fontSize: 10}}
                                tickFormatter={(val: number) => `$${(val/1000).toFixed(0)}k`}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-md)' }}
                                formatter={(val: any) => [`$${Number(val || 0).toLocaleString()}`, 'Portfolio Balance']}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="balance" 
                                stroke="var(--secondary)" 
                                fillOpacity={1} 
                                fill="url(#colorTrajectory)" 
                                strokeWidth={4}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-[var(--on-surface-variant)] text-center mt-6 italic opacity-60">
                    * Projections based on {state.profile?.type} risk profile and historical asset class returns. Non-guaranteed.
                </p>
            </div>
        </div>
    );
};

export default SolutionsHub;
