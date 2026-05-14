import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  ChevronRight,
  Rocket,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useFinancial } from '../FinancialContext';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';

const SolutionsHub: React.FC = () => {
    const { state, setStep } = useFinancial();
    const [horizon, setHorizon] = useState(state.goal?.months ? Math.round(state.goal.months / 12) : 3);
    const [isChecked, setIsChecked] = useState([false, false, false]);

    const handleCheck = (index: number) => {
        const newChecked = [...isChecked];
        newChecked[index] = !newChecked[index];
        setIsChecked(newChecked);
    };

    // Dynamic Calculations
    const targetAmount = state.goal?.targetAmount || 150000;
    const currentSavings = state.goal?.currentSavings || 25000;
    const annualRate = state.profile?.rate || 0.055;
    const monthlyRate = annualRate / 12;
    const months = horizon * 12;

    const calculatePMT = (fv: number, pv: number, r: number, n: number) => {
        if (n <= 0) return 0;
        if (r === 0) return (fv - pv) / n;
        const power = Math.pow(1 + r, n);
        const pmt = (fv - pv * power) * (r / (power - 1));
        return Math.max(0, pmt);
    };

    const monthlyTarget = useMemo(() => calculatePMT(targetAmount, currentSavings, monthlyRate, months), [targetAmount, currentSavings, monthlyRate, months]);

    // Allocation Logic
    const allocations = useMemo(() => {
        let remaining = monthlyTarget;
        
        // FHSA: Max $8,000/year -> $666.67/mo
        const fhsa = Math.min(remaining, 666.67);
        remaining -= fhsa;

        // RRSP: Aim for ~50% of remaining or up to a reasonable cap
        const rrsp = Math.min(remaining, monthlyTarget * 0.5);
        remaining -= rrsp;

        // TFSA: Remainder
        const tfsa = remaining;

        return {
            rrsp: Math.round(rrsp),
            fhsa: Math.round(fhsa),
            tfsa: Math.round(tfsa)
        };
    }, [monthlyTarget]);

    const projectionData = useMemo(() => {
        const data = [];
        let currentInvested = currentSavings;
        let currentCash = currentSavings;
        
        // Use months as total data points, but label by years
        for (let i = 0; i <= months; i++) {
            data.push({
                month: i,
                label: i === 0 ? 'Start' : i % 12 === 0 ? `${i/12}y` : '',
                invested: Math.round(currentInvested),
                cash: Math.round(currentCash)
            });
            currentInvested += monthlyTarget + (currentInvested * monthlyRate);
            currentCash += monthlyTarget;
        }
        return data;
    }, [currentSavings, monthlyTarget, monthlyRate, months]);

    const etfDetails = useMemo(() => {
        interface ETFProfile {
            ticker: string;
            name: string;
            allocation: string;
            risk: string;
        }
        const profiles: Record<string, ETFProfile> = {
            'Safety': { ticker: 'VCIP', name: 'Conservative Income', allocation: '20% Equity / 80% Fixed', risk: 'Low' },
            'Very Conservative': { ticker: 'VCNS', name: 'Very Conservative', allocation: '40% Equity / 60% Fixed', risk: 'Low to Medium' },
            'Conservative': { ticker: 'VCNS', name: 'Conservative', allocation: '40% Equity / 60% Fixed', risk: 'Low to Medium' },
            'Moderate': { ticker: 'VBAL', name: 'Balanced ETF Portfolio', allocation: '60% Equity / 40% Fixed', risk: 'Medium' },
            'Aggressive': { ticker: 'VGRO', name: 'Growth', allocation: '80% Equity / 20% Fixed', risk: 'Medium to High' },
            'Very Aggressive': { ticker: 'VEQT', name: 'All-Equity', allocation: '100% Equity / 0% Fixed', risk: 'High' },
        };
        return profiles[state.profile?.type || 'Moderate'] || profiles['Moderate'];
    }, [state.profile]);

    const sparklineData = [
        { v: 10 }, { v: 15 }, { v: 12 }, { v: 18 }, { v: 22 }, { v: 20 }, { v: 24.5 }
    ];

    return (
        <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            <header className="mb-10">
                <h1 className="headline-lg text-[var(--on-surface)] mb-2">Final Savings Plan</h1>
                <p className="body-md text-[var(--on-surface-variant)]">
                  Your tailored roadmap to achieve your financial milestones efficiently.
                </p>
            </header>

            {/* Adjust Timeline */}
            <section className="card p-8 mb-8 relative overflow-hidden bg-white border-none shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div className="max-w-md">
                        <h3 className="headline-md mb-1">Adjust Timeline</h3>
                        <p className="text-xs text-[var(--on-surface-variant)] font-medium">
                          Simulate your growth trajectory by adjusting your savings window.
                        </p>
                    </div>
                    <div className="bg-[var(--secondary-container)]/20 text-[var(--on-secondary-container)] px-4 py-2 rounded-xl border border-[var(--secondary-container)]/30">
                        <span className="text-[10px] font-black uppercase tracking-widest block opacity-70">Current Horizon</span>
                        <span className="text-sm font-black">{horizon} Years</span>
                    </div>
                </div>

                <div className="relative px-2">
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        step="1"
                        value={horizon}
                        onChange={(e) => setHorizon(parseInt(e.target.value))}
                        className="w-full h-2 bg-[var(--surface-container)] rounded-full appearance-none cursor-pointer accent-[var(--vibrant-teal)]"
                    />
                    <div className="flex justify-between mt-4">
                        <span className="text-[10px] font-bold text-[var(--on-surface-variant)]/40 uppercase">1 Year</span>
                        <span className="text-[10px] font-bold text-[var(--on-surface-variant)]/40 uppercase">10 Years</span>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Monthly Target */}
                <div className="lg:col-span-4 card p-8 flex flex-col justify-center relative overflow-hidden group bg-white border-none shadow-sm">
                    <div className="p-3 rounded-full bg-[var(--vibrant-teal)]/10 text-[var(--vibrant-teal)] w-fit mb-8">
                        <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] mb-4 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" /> Monthly Target
                    </p>
                    <div className="text-6xl font-black text-[var(--on-surface)] mb-4">
                        ${Math.round(monthlyTarget).toLocaleString()}
                    </div>
                    <p className="text-[10px] leading-relaxed text-[var(--on-surface-variant)] font-medium max-w-[200px]">
                        Total required savings to meet your projected {state.goal?.type?.toLowerCase() || 'financial'} goal.
                    </p>
                </div>

                {/* Allocation Strategy */}
                <div className="lg:col-span-8 card p-8 bg-white border-none shadow-sm">
                    <h3 className="headline-md mb-8">Optimized Allocation Strategy</h3>
                    <div className="space-y-8">
                        {[
                            { label: 'RRSP', desc: 'Tax-deferred growth', value: allocations.rrsp, color: 'var(--primary)' },
                            { label: 'FHSA', desc: 'Tax-free home savings', value: allocations.fhsa, color: 'var(--vibrant-teal)' },
                            { label: 'TFSA', desc: 'Tax-free growth', value: allocations.tfsa, color: 'var(--emerald)' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm font-black text-[var(--on-surface)]">{item.label}</p>
                                        <p className="text-[10px] font-medium text-[var(--on-surface-variant)]">{item.desc}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-[var(--on-surface)]">${item.value.toLocaleString()}</span>
                                        <span className="text-[10px] font-medium text-[var(--on-surface-variant)] ml-1">/mo</span>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-[var(--surface-container)] rounded-full overflow-hidden">
                                    <div 
                                        className="h-full transition-all duration-1000 ease-out"
                                        style={{ 
                                            width: `${(item.value / monthlyTarget) * 100}%`,
                                            backgroundColor: item.color 
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Growth Trajectory */}
            <section className="card p-8 mb-8 bg-white border-none shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="headline-md">Growth Trajectory</h3>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--vibrant-teal)]" />
                            <span className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">Invested Strategy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--outline-variant)]/40 border border-dashed border-[var(--outline-variant)]" />
                            <span className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">Cash Only</span>
                        </div>
                    </div>
                </div>
                
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--vibrant-teal)" stopOpacity={0.05}/>
                                    <stop offset="95%" stopColor="var(--vibrant-teal)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" opacity={0.1} />
                            <XAxis 
                                dataKey="label" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--on-surface-variant)' }}
                                minTickGap={30}
                            />
                            <YAxis hide domain={['dataMin - 5000', 'dataMax + 10000']} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)', fontSize: '12px', fontWeight: 'bold' }}
                                formatter={(value: string | number | readonly (string | number)[] | undefined) => value ? [`$${Number(value).toLocaleString()}`, ''] : ['', '']}
                                labelFormatter={(label) => label ? `Time: ${label}` : ''}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="invested" 
                                stroke="var(--vibrant-teal)" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorInvested)" 
                                animationDuration={1500}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="cash" 
                                stroke="var(--outline-variant)" 
                                strokeWidth={2} 
                                strokeDasharray="5 5" 
                                fill="transparent" 
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recommended Asset */}
                <div className="lg:col-span-8 card p-8 bg-white border-none shadow-sm">
                    <h3 className="headline-md mb-2">Recommended Asset</h3>
                    <p className="text-xs text-[var(--on-surface-variant)] font-medium mb-8">
                        Based on your {state.profile?.type?.toLowerCase() || 'moderate'} risk profile, this broadly diversified ETF aligns with your long-term growth objectives.
                    </p>

                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[var(--primary)] text-white flex items-center justify-center rounded-xl font-black text-xl">
                                    {etfDetails?.ticker?.substring(0, 2) || 'VB'}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-[var(--on-surface)]">Vanguard {etfDetails?.name || 'Balanced'}</h4>
                                    <p className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase">Ticker: {etfDetails?.ticker || 'VBAL'} • TSX</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-[var(--surface-container-low)]/50 border border-[var(--outline-variant)]/20">
                                    <p className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase mb-1">Target Allocation</p>
                                    <p className="text-xs font-bold text-[var(--on-surface)]">{etfDetails?.allocation || '60% Equity / 40% Fixed'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-[var(--surface-container-low)]/50 border border-[var(--outline-variant)]/20">
                                    <p className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase mb-1">Management Fee (MER)</p>
                                    <p className="text-xs font-bold text-[var(--on-surface)]">0.24%</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-container-low)]/50 border border-[var(--outline-variant)]/20">
                                <p className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase">Risk Rating</p>
                                <div className="bg-[var(--emerald)]/10 text-[var(--emerald)] px-3 py-1 rounded-md text-[10px] font-black uppercase">
                                    {etfDetails?.risk || 'Medium'}
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-64 p-6 rounded-2xl bg-[var(--surface-container-low)]/30 border border-[var(--outline-variant)]/10 relative flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase">5-Year Historical</p>
                            </div>
                            <div className="flex-1 h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sparklineData}>
                                        <Line 
                                            type="monotone" 
                                            dataKey="v" 
                                            stroke="var(--vibrant-teal)" 
                                            strokeWidth={3} 
                                            dot={false} 
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 text-right">
                                <span className="text-xs font-black text-[var(--emerald)]">+24.5%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Your Action Plan */}
                <div className="lg:col-span-4 card p-8 flex flex-col bg-white border-none shadow-sm">
                    <h3 className="headline-md mb-8">Your Action Plan</h3>
                    
                    <div className="space-y-6 mb-10">
                        {[
                            { title: 'Open FHSA Account', desc: 'Complete the registration for your First Home Savings Account.' },
                            { title: 'Set up auto-deposit', desc: `Configure monthly transfers of $${Math.round(monthlyTarget).toLocaleString()} starting on the 1st.` },
                            { title: 'Execute trade', desc: `Purchase ${etfDetails?.ticker || 'VBAL'} units within your newly funded accounts.` }
                        ].map((item, i) => (
                            <div 
                                key={i} 
                                onClick={() => handleCheck(i)}
                                className={`flex gap-4 cursor-pointer group p-2 -m-2 rounded-xl transition-all ${isChecked[i] ? 'opacity-40' : 'hover:bg-[var(--surface-container-low)]/50'}`}
                            >
                                <div className={`w-5 h-5 mt-1 rounded border-2 flex items-center justify-center transition-all ${isChecked[i] ? 'bg-[var(--vibrant-teal)] border-[var(--vibrant-teal)] text-white' : 'border-[var(--outline-variant)] group-hover:border-[var(--vibrant-teal)]'}`}>
                                    {isChecked[i] && <CheckCircle2 className="w-3 h-3" />}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[12px] font-black text-[var(--on-surface)] leading-tight">{item.title}</h4>
                                    <p className="text-[10px] font-medium text-[var(--on-surface-variant)] leading-tight">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-auto w-full py-5 bg-[var(--secondary)] text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-xl shadow-[var(--vibrant-teal)]/10 flex items-center justify-center gap-3 group">
                        Complete Plan Setup
                        <Rocket className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                    </button>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[var(--outline-variant)]/30 flex flex-col md:flex-row justify-between items-center gap-6">
                <button 
                    onClick={() => setStep(3)}
                    className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all flex items-center gap-2 group"
                >
                    <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Risk Profiler
                </button>
                <div className="flex gap-4">
                    <button className="p-3 rounded-xl border border-[var(--outline-variant)]/30 text-[var(--on-surface-variant)] hover:bg-white hover:text-[var(--vibrant-teal)] hover:border-[var(--vibrant-teal)] transition-all">
                        <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="p-3 rounded-xl border border-[var(--outline-variant)]/30 text-[var(--on-surface-variant)] hover:bg-white hover:text-[var(--vibrant-teal)] hover:border-[var(--vibrant-teal)] transition-all">
                        <ShieldCheck className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SolutionsHub;
