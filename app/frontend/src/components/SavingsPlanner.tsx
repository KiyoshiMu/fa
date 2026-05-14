import React, { useState } from 'react';
import { generateSavingsPlan } from '../lib/api';
import type { InvestmentProfile } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, Target, Wallet, Calendar, TrendingUp, Info, ChevronLeft, Sparkles } from 'lucide-react';
import { useFinancial } from '../FinancialContext';

const SavingsPlanner: React.FC = () => {
    const { setStep } = useFinancial();
    const [goal, setGoal] = useState<number>(1000000);
    const [current, setCurrent] = useState<number>(450000);
    const [months, setMonths] = useState<number>(36);
    const [profile, setProfile] = useState<InvestmentProfile>('Very Aggressive');
    const [result, setResult] = useState<{ pmtWithInvestment: number; pmtWithoutInvestment: number; rate: number } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCalculate = async () => {
        setLoading(true);
        try {
            const plan = await generateSavingsPlan(goal, current, months, profile);
            setResult(plan);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = result ? [
        { name: 'With Investment', amount: result.pmtWithInvestment, color: 'var(--vibrant-teal)' },
        { name: 'Without Investment', amount: result.pmtWithoutInvestment, color: 'var(--outline-variant)' }
    ] : [];

    return (
        <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--vibrant-teal)] bg-[var(--vibrant-teal)]/10 px-3 py-1 rounded-full">Simulator</span>
                        <div className="h-px w-20 bg-[var(--outline-variant)] opacity-30" />
                    </div>
                    <h2 className="display-lg text-[var(--on-surface)]">Savings Goal Planner</h2>
                    <p className="body-lg text-[var(--on-surface-variant)] max-w-2xl">
                        Simulate the institutional commitment required to reach your target benchmarks.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-8">
                    <div className="card p-10 bg-white shadow-xl border-none space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase tracking-widest flex items-center gap-2">
                                <Target className="w-3 h-3 text-[var(--vibrant-teal)]" /> Savings Goal ($)
                            </label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={goal}
                                onChange={(e) => setGoal(Number(e.target.value))}
                                className="w-full bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-2xl px-5 py-4 text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--vibrant-teal)] transition-all font-mono text-xl font-black placeholder:text-[var(--on-surface-variant)]/30"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase tracking-widest flex items-center gap-2">
                                <Wallet className="w-3 h-3 text-[var(--vibrant-teal)]" /> Current Benchmarks ($)
                            </label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={current}
                                onChange={(e) => setCurrent(Number(e.target.value))}
                                className="w-full bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-2xl px-5 py-4 text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--vibrant-teal)] transition-all font-mono text-xl font-black placeholder:text-[var(--on-surface-variant)]/30"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-[var(--vibrant-teal)]" /> Horizon (Months)
                            </label>
                            <input
                                type="number"
                                placeholder="36"
                                value={months}
                                onChange={(e) => setMonths(Number(e.target.value))}
                                className="w-full bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-2xl px-5 py-4 text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--vibrant-teal)] transition-all font-mono text-xl font-black placeholder:text-[var(--on-surface-variant)]/30"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 text-[var(--vibrant-teal)]" /> Strategy Matrix
                            </label>
                            <div className="relative">
                                <select
                                    value={profile}
                                    onChange={(e) => setProfile(e.target.value as InvestmentProfile)}
                                    className="w-full bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-2xl px-5 py-4 text-[var(--on-surface)] font-bold focus:outline-none focus:ring-2 focus:ring-[var(--vibrant-teal)] transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Safety">Safety (2%)</option>
                                    <option value="Very Conservative">Very Conservative (3%)</option>
                                    <option value="Conservative">Conservative (4%)</option>
                                    <option value="Moderate">Moderate (5%)</option>
                                    <option value="Aggressive">Aggressive (7%)</option>
                                    <option value="Very Aggressive">Very Aggressive (9%)</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--on-surface-variant)]">
                                    <Info className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={loading}
                            className="w-full btn btn-primary py-5 text-lg gap-3 shadow-xl shadow-[var(--primary-container)]/20 disabled:opacity-50 group"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                            Run Simulation
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-10">
                    {result ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full">
                            <div className="flex flex-col gap-10">
                                <div className="card p-10 bg-white relative overflow-hidden shadow-2xl border-none flex-1">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--vibrant-teal)] opacity-5 blur-3xl -mr-16 -mt-16" />
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-4">Required Monthly Inflow</div>
                                    <div className="text-6xl font-black text-[var(--on-surface)] mb-4 tracking-tighter">
                                        ${result.pmtWithInvestment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="flex items-center gap-3 text-[var(--emerald)] font-black text-xs uppercase tracking-widest">
                                        <div className="p-1.5 bg-[var(--emerald)]/10 rounded-lg">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                        {profile} ({(result.rate * 100).toFixed(0)}% APY)
                                    </div>
                                </div>

                                <div className="card p-10 bg-[var(--surface-container-low)] border-[var(--outline-variant)] shadow-sm">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-4">Vanilla Savings Model</div>
                                    <div className="text-3xl font-black text-[var(--on-surface)]/60 mb-2">
                                        ${result.pmtWithoutInvestment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full inline-block">
                                        +${(result.pmtWithoutInvestment - result.pmtWithInvestment).toLocaleString(undefined, { maximumFractionDigits: 0 })} Excess Per Month
                                    </div>
                                </div>
                            </div>

                            <div className="card p-10 bg-white border-none shadow-xl flex flex-col h-full">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-[10px] font-black text-[var(--on-surface)] uppercase tracking-[0.2em] flex items-center gap-3">
                                        <div className="p-2 bg-[var(--vibrant-teal)]/10 text-[var(--vibrant-teal)] rounded-xl">
                                            <Info className="w-5 h-5" />
                                        </div>
                                        Alpha Comparison
                                    </h3>
                                </div>
                                <div className="flex-1 min-h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" vertical={false} />
                                            <XAxis 
                                                dataKey="name" 
                                                stroke="var(--on-surface-variant)" 
                                                fontSize={10} 
                                                fontWeight="bold"
                                                tickLine={false} 
                                                axisLine={false} 
                                                dy={15}
                                            />
                                            <YAxis 
                                                stroke="var(--on-surface-variant)" 
                                                fontSize={10} 
                                                fontWeight="bold"
                                                tickLine={false} 
                                                axisLine={false} 
                                                tickFormatter={(val) => `$${val/1000}k`}
                                            />
                                            <Tooltip 
                                                cursor={{ fill: 'var(--surface-container-low)' }}
                                                contentStyle={{ 
                                                    backgroundColor: 'white', 
                                                    border: 'none',
                                                    borderRadius: '24px',
                                                    boxShadow: 'var(--shadow-xl)',
                                                    padding: '20px',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                            <Bar dataKey="amount" radius={[12, 12, 0, 0]} barSize={80}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card h-full flex flex-col items-center justify-center text-center p-20 bg-white border-none shadow-xl">
                            <div className="w-32 h-32 rounded-[3rem] bg-[var(--surface-container-low)] flex items-center justify-center mb-10 relative group">
                                <div className="absolute inset-0 bg-[var(--vibrant-teal)] opacity-0 group-hover:opacity-5 rounded-[3rem] transition-all scale-150 duration-700" />
                                <Target className="w-16 h-16 text-[var(--on-surface-variant)] opacity-20" />
                            </div>
                            <h3 className="headline-md text-[var(--on-surface-variant)] opacity-40 mb-3">Simulation Required</h3>
                            <p className="text-sm text-[var(--on-surface-variant)] opacity-40 max-w-sm font-medium">
                                Configure your benchmarks to visualize institutional performance alpha.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 flex justify-between items-center pt-8 border-t border-[var(--outline-variant)]">
                <button 
                    onClick={() => setStep(0)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all"
                >
                    <ChevronLeft className="w-4 h-4" /> Dashboard
                </button>
            </div>
        </div>
    );
};

export default SavingsPlanner;
