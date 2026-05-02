import React, { useState, useEffect, useMemo } from 'react';
import { useFinancial } from '../FinancialContext';
import { analyzeAdvisory } from '../lib/api';
import type { AdvisoryResponse } from '../lib/api';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LineChart, Line, YAxis } from 'recharts';
import { Rocket, ShieldCheck, AlertCircle, ArrowRight, ExternalLink, TrendingUp, Wallet, Lightbulb, Loader2, Clock } from 'lucide-react';

const SolutionsHub: React.FC = () => {
    const { state, setGoal, reset } = useFinancial();
    const [analysis, setAnalysis] = useState<AdvisoryResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [localMonths, setLocalMonths] = useState(state.goal?.months || 36);

    const fetchAnalysis = async (months: number) => {
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
        } catch (err: any) {
            console.error('Failed to fetch advisory analysis', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis(localMonths);
    }, [state.goal?.targetAmount, state.profile, state.cashFlow]);

    // Handle slider change
    const handleMonthChange = (val: number) => {
        setLocalMonths(val);
        // Debounce or just fetch
        fetchAnalysis(val);
        // Sync with global state if needed
        if (state.goal) {
            setGoal({ ...state.goal, months: val });
        }
    };

    if (!state.goal || !state.profile || !state.cashFlow) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-foreground/20" />
                <h2 className="text-xl font-bold text-foreground/40">Incomplete Journey</h2>
                <p className="text-sm text-foreground/20 italic">Please complete steps 1, 2, and 3 first.</p>
            </div>
        );
    }

    const { pmtWithInvest, pmtCashOnly, savingsGain, gap, isShort, recommendedETF } = analysis || { 
        pmtWithInvest: 0, pmtCashOnly: 0, savingsGain: 0, gap: 0, isShort: false, 
        recommendedETF: { ticker: 'VBAL', name: 'Balanced', desc: '60/40' } 
    };
    
    const targetAmount = state.goal.targetAmount;
    const rate = state.profile.rate;
    const surplus = state.cashFlow.netCashFlow;

    const chartData = [
        { name: 'Cash Only', amount: Math.round(pmtCashOnly) },
        { name: 'Invested', amount: Math.round(pmtWithInvest) },
    ];

    // Contribution Allocation Logic (Plan based)
    const allocations = useMemo(() => {
        const monthly = pmtWithInvest;
        const annualIncome = (state.cashFlow?.totalInflow || 5000) * 12;
        
        // Limits from Plan
        const fhsaAnnualLimit = 4000;
        const fhsaLifetimeLimit = 50000;
        const fhsaMonthlyLimit = fhsaAnnualLimit / 12; // ~$333
        
        const rrspMonthlyLimit = (annualIncome * 0.18) / 12;
        const rrspHBPMax = 35000;
        
        const calcFreq = (total: number, freq: 'monthly' | 'semi-monthly' | 'bi-weekly') => {
            const divisors = { 'monthly': 1, 'semi-monthly': 2, 'bi-weekly': 2.166 }; // 26/12
            const currentTotal = total / divisors[freq];
            
            // FHSA First
            let fhsa = Math.min(currentTotal, (fhsaMonthlyLimit / divisors[freq]));
            let remaining = currentTotal - fhsa;
            
            // RRSP Second (considering HBP limit)
            // Note: HBP is a withdrawal limit, but here we assume we contribute towards it
            let rrsp = Math.min(remaining, (rrspMonthlyLimit / divisors[freq]));
            let tfsa = Math.max(0, remaining - rrsp);
            
            return { fhsa, rrsp, tfsa };
        };

        return {
            monthly: calcFreq(monthly, 'monthly'),
            semiMonthly: calcFreq(monthly, 'semi-monthly'),
            biWeekly: calcFreq(monthly, 'bi-weekly')
        };
    }, [pmtWithInvest, state.cashFlow, state.goal]);

    // FHSA 5-Year Growth Data
    const fhsaGrowthData = useMemo(() => {
        const monthlyContrib = Math.min(pmtWithInvest, 4000/12);
        const data = [];
        let balance = 0;
        const monthlyRate = (state.profile?.rate || 0.05) / 12;

        for (let m = 0; m <= 60; m++) {
            if (m > 0) {
                balance = (balance + monthlyContrib) * (1 + monthlyRate);
            }
            if (m % 12 === 0) {
                data.push({ year: `Year ${m/12}`, balance: Math.round(balance) });
            }
        }
        return data;
    }, [pmtWithInvest, state.profile]);

    const currentAlloc = state.payFrequency === 'monthly' ? allocations.monthly : 
                   state.payFrequency === 'semi-monthly' ? allocations.semiMonthly : 
                   allocations.biWeekly;

    return (
        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-1000">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    Step 4: Final Recommendation
                </div>
                <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">Your Path to ${targetAmount.toLocaleString()}</h2>
                <p className="text-foreground/40 text-lg max-w-2xl mx-auto italic font-medium">
                    Integrated analysis complete. Adjust your timeline or follow the breakdown below.
                </p>
            </div>

            {/* Time Slider Bar */}
            <div className="glass-card p-6 border-primary-500/20 bg-primary-500/5">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="p-3 rounded-2xl bg-primary-500/20 text-primary-500">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Adjust Timeline</div>
                            <div className="text-xl font-black text-foreground">{localMonths} Months</div>
                        </div>
                    </div>
                    <div className="flex-1 w-full pt-2">
                        <input
                            type="range"
                            min="6"
                            max="120"
                            step="6"
                            value={localMonths}
                            onChange={(e) => handleMonthChange(Number(e.target.value))}
                            className="w-full h-3 bg-secondary rounded-full appearance-none cursor-pointer accent-primary-500 shadow-inner"
                        />
                        <div className="flex justify-between mt-3 text-[10px] font-black text-foreground/20 uppercase tracking-widest">
                            <span>Short Term (6m)</span>
                            <span>Medium Term (5y)</span>
                            <span>Long Term (10y)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Math Analysis */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="glass-card p-10 border-border/40 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                        
                        <div className="flex flex-col lg:flex-row gap-12 items-center">
                            <div className="w-full lg:w-1/2 space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-primary-500" /> Monthly Savings Delta
                                    </h3>
                                    {loading ? (
                                        <div className="h-4 w-32 bg-foreground/5 animate-pulse rounded" />
                                    ) : (
                                        <p className="text-xs text-foreground/30 font-medium leading-relaxed italic">
                                            Investing allows you to save <span className="text-green-500 font-black">${Math.round(savingsGain).toLocaleString()}/mo</span> less due to compound interest.
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 rounded-3xl bg-secondary/50 border border-border/40">
                                        <div className="text-[10px] font-black text-foreground/30 uppercase tracking-tighter mb-1">Cash Only</div>
                                        {loading ? <div className="h-8 w-20 bg-foreground/5 animate-pulse rounded" /> : <div className="text-2xl font-black text-foreground/60">${Math.round(pmtCashOnly).toLocaleString()}</div>}
                                        <div className="text-[10px] text-foreground/20 italic">monthly</div>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-primary-500/5 border border-primary-500/20 shadow-xl shadow-primary-500/5">
                                        <div className="text-[10px] font-black text-primary-500 uppercase tracking-tighter mb-1">With Investment</div>
                                        {loading ? <div className="h-10 w-24 bg-foreground/5 animate-pulse rounded" /> : <div className="text-3xl font-black text-primary-500">${Math.round(pmtWithInvest).toLocaleString()}</div>}
                                        <div className="text-[10px] text-primary-500/40 italic">monthly @ {(rate*100).toFixed(1)}%</div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full lg:w-1/2 h-64">
                                {loading ? (
                                    <div className="w-full h-full bg-foreground/5 animate-pulse rounded-3xl flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin opacity-20" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }} />
                                            <Tooltip 
                                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                            />
                                            <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={60}>
                                                {chartData.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 1 ? '#0ea5e9' : 'rgba(255,255,255,0.1)'} strokeWidth={index === 1 ? 2 : 0} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Freq Breakdown (image1.png / image5.png style) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Bi-Weekly', val: allocations.biWeekly, color: 'text-primary-400' },
                            { label: 'Semi-Monthly', val: allocations.semiMonthly, color: 'text-indigo-400' },
                            { label: 'Monthly', val: allocations.monthly, color: 'text-emerald-400' }
                        ].map((item) => (
                            <div key={item.label} className={`p-8 rounded-[2rem] glass-card border border-border/40 relative overflow-hidden ${state.payFrequency.toLowerCase().includes(item.label.toLowerCase().split('-')[0]) ? 'ring-2 ring-primary-500 bg-primary-500/5' : ''}`}>
                                <div className="absolute top-4 right-6 text-[8px] font-black uppercase text-primary-500/20 italic tracking-widest">Pay Yourself First</div>
                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-6">{item.label} Result</h5>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-foreground/60 italic">FHSA</span>
                                            <span className="text-[8px] text-foreground/20 uppercase font-black tracking-widest">Tax-Free Home Savings</span>
                                        </div>
                                        <span className="text-lg font-black text-foreground">${Math.round(item.val.fhsa).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-foreground/60 italic">RRSP (HBP)</span>
                                            <span className="text-[8px] text-foreground/20 uppercase font-black tracking-widest">Home Buyers' Plan</span>
                                        </div>
                                        <span className="text-lg font-black text-foreground">${Math.round(item.val.rrsp).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-foreground/60 italic">TFSA</span>
                                            <span className="text-[8px] text-foreground/20 uppercase font-black tracking-widest">Excess Savings</span>
                                        </div>
                                        <span className="text-lg font-black text-foreground">${Math.round(item.val.tfsa).toLocaleString()}</span>
                                    </div>
                                    <div className="pt-4 border-t border-border/40 flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase text-primary-500">Total Contribution</span>
                                        <span className={`text-xl font-black ${item.color}`}>${Math.round(item.val.fhsa + item.val.rrsp + item.val.tfsa).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FHSA 5-Year Growth Graph */}
                    <div className="glass-card p-10 border-border/40">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-primary-500" /> FHSA Maximization Strategy
                                </h4>
                                <p className="text-[10px] text-foreground/30 font-medium italic">Illustrating total savings over the 5-year maximum contribution period</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-primary-500">${fhsaGrowthData[5].balance.toLocaleString()}</div>
                                <div className="text-[8px] font-black uppercase text-foreground/20 tracking-tighter">Est. 5-Year Total</div>
                            </div>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={fhsaGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 'black' }} />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                                        labelStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'black' }}
                                    />
                                    <Line type="monotone" dataKey="balance" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', r: 4 }} activeDot={{ r: 6, fill: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Status Check */}
                        <div className={`p-8 rounded-[2rem] border relative overflow-hidden ${!isShort ? 'bg-green-500/5 border-green-500/20 shadow-green-500/5' : 'bg-red-500/5 border-red-500/20 shadow-red-500/5'}`}>
                            <div className="relative z-10 flex flex-col h-full space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-2xl ${!isShort ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Gap Analysis</h4>
                                        <p className="text-[10px] text-foreground/40 font-bold uppercase italic">Surplus vs. Requirement</p>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="text-4xl font-black italic">
                                        {!isShort ? (
                                            <span className="text-green-500">Fully Funded</span>
                                        ) : (
                                            <span className="text-red-500">-${Math.round(gap).toLocaleString()} Gap</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-foreground/50 mt-2 font-medium leading-relaxed">
                                        {!isShort 
                                            ? `Great news! Your monthly surplus of $${surplus.toLocaleString()} covers the necessary $${Math.round(pmtWithInvest).toLocaleString()} contribution.`
                                            : `You are short $${Math.round(gap).toLocaleString()} per month. To hit your ${localMonths}-month goal, you need to increase your savings or adjust your timeline.`}
                                    </p>
                                </div>

                                {isShort && (
                                    <div className="p-4 rounded-2xl bg-foreground/5 space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-primary-500 uppercase tracking-widest">
                                            <Lightbulb className="w-4 h-4" /> Recommendation
                                        </div>
                                        <p className="text-[11px] text-foreground/60 leading-relaxed italic">
                                            You currently spend <span className="font-black text-foreground">${state.cashFlow?.wants.toLocaleString()}</span> on 'Wants'. Redirecting <span className="font-black text-foreground">${Math.round(Math.min(gap, state.cashFlow?.wants || 0)).toLocaleString()}</span> of this would close the gap.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ETF Component */}
                        <div className="p-8 rounded-[2rem] border border-primary-500/20 bg-primary-500/5 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-primary-500/20 transition-all duration-700" />
                           
                           <div className="relative z-10 flex flex-col h-full space-y-6">
                                <div className="flex items-center gap-3 text-primary-500">
                                    <Rocket className="w-6 h-6" />
                                    <h4 className="text-sm font-black uppercase tracking-widest">Investment Engine</h4>
                                </div>

                                <div className="flex-1">
                                    <div className="inline-block px-3 py-1 rounded-lg bg-primary-500 text-white text-[10px] font-black uppercase mb-2">
                                        Recommended Tool
                                    </div>
                                    <h5 className="text-3xl font-black italic text-foreground">{recommendedETF.ticker}.TO</h5>
                                    <p className="text-xs font-bold text-foreground/40">{recommendedETF.name} ETF Portfolio</p>
                                    <p className="text-[11px] text-foreground/60 mt-3 leading-relaxed">
                                        This Vanguard one-ticket solution automatically maintains a <span className="text-primary-400 font-black">{recommendedETF.desc}</span> asset mix aligned with your profile.
                                    </p>
                                </div>

                                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border group-hover:border-primary-500/40 transition-all">
                                    <span className="text-xs font-black uppercase tracking-widest text-foreground/40 font-mono">View Prospectus</span>
                                    <ExternalLink className="w-4 h-4 text-foreground/20 group-hover:text-primary-500" />
                                </button>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Right: Summary & CTA */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="glass-card p-8 border-border/40 space-y-8 h-full flex flex-col">
                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/30">Next Steps</h4>
                            <div className="space-y-6">
                                {[
                                    { title: 'Setup Account', desc: state.goal.type === 'Home' ? 'Open an FHSA with a discount brokerage.' : 'Open a TFSA with a discount brokerage.', done: state.goal.hasFHSAOrTFSA },
                                    { title: 'Pay Yourself First', desc: `Redirect $${Math.round(currentAlloc.fhsa + currentAlloc.rrsp + currentAlloc.tfsa).toLocaleString()} ${state.payFrequency} automatically upon receiving your salary.`, icon: ShieldCheck },
                                    { title: 'Purchase ETF', desc: `Buy shares of ${recommendedETF.ticker} monthly.` },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${step.done ? 'bg-green-500/10 border-green-500/40 text-green-500' : 'bg-secondary border-border/40 text-foreground/20'}`}>
                                            {step.done ? <ShieldCheck className="w-4 h-4" /> : <span className="text-[10px] font-black">{i+1}</span>}
                                        </div>
                                        <div>
                                            <div className="text-xs font-black uppercase tracking-tight text-foreground">{step.title}</div>
                                            <p className="text-[11px] text-foreground/40 font-medium leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-primary-500/5 border border-primary-500/10 space-y-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-primary-500">Summary</h5>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-foreground/60">
                                    <span>Target Date</span>
                                    <span>{new Date(Date.now() + localMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-foreground/60">
                                    <span>Profile</span>
                                    <span>{state.profile.type}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 space-y-4">
                            <button className="w-full py-5 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all duration-300 shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3">
                                Talk to an Advisor <ArrowRight className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={reset}
                                className="w-full py-5 bg-secondary hover:bg-secondary/80 text-foreground/40 font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all text-xs"
                            >
                                Start New Journey
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SolutionsHub;
