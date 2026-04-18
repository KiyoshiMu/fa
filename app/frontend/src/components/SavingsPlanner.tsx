import React, { useState } from 'react';
import { generateSavingsPlan } from '../lib/api';
import type { InvestmentProfile } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, Target, Wallet, Calendar, TrendingUp, Info } from 'lucide-react';

const SavingsPlanner: React.FC = () => {
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
        { name: 'With Investment', amount: result.pmtWithInvestment, color: '#0ea5e9' },
        { name: 'Without Investment', amount: result.pmtWithoutInvestment, color: '#94a3b8' }
    ] : [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Savings Goal Planner</h2>
                <p className="text-blue-200/60 max-w-2xl">
                    Calculate the monthly commitment required to reach your target goal, and visualize how different investment strategies accelerate your progress.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 space-y-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-blue-100/70 uppercase tracking-widest flex items-center gap-2">
                                <Target className="w-4 h-4" /> Savings Goal ($)
                            </label>
                            <input
                                type="number"
                                value={goal}
                                onChange={(e) => setGoal(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-mono text-lg"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-blue-100/70 uppercase tracking-widest flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> Current Savings ($)
                            </label>
                            <input
                                type="number"
                                value={current}
                                onChange={(e) => setCurrent(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-mono text-lg"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-blue-100/70 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Timeline (Months)
                            </label>
                            <input
                                type="number"
                                value={months}
                                onChange={(e) => setMonths(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-mono text-lg"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-blue-100/70 uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Investment Profile
                            </label>
                            <select
                                value={profile}
                                onChange={(e) => setProfile(e.target.value as InvestmentProfile)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option className="bg-slate-900" value="Safety">Safety (2%)</option>
                                <option className="bg-slate-900" value="Very Conservative">Very Conservative (3%)</option>
                                <option className="bg-slate-900" value="Conservative">Conservative (4%)</option>
                                <option className="bg-slate-900" value="Moderate">Moderate (5%)</option>
                                <option className="bg-slate-900" value="Aggressive">Aggressive (7%)</option>
                                <option className="bg-slate-900" value="Very Aggressive">Very Aggressive (9%)</option>
                            </select>
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Calculate PMT'}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {result ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            <div className="flex flex-col gap-6">
                                <div className="glass-card p-8 border-primary-500/30 bg-primary-500/5 flex-1">
                                    <div className="text-blue-100/50 text-xs font-bold uppercase tracking-widest mb-2">Required Monthly Savings</div>
                                    <div className="text-5xl font-black text-white mb-2">
                                        ${result.pmtWithInvestment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                                        <TrendingUp className="w-4 h-4" />
                                        Utilizing {profile} Strategy ({(result.rate * 100).toFixed(0)}% Return)
                                    </div>
                                </div>

                                <div className="glass-card p-8 border-white/5 bg-white/5">
                                    <div className="text-blue-100/30 text-xs font-bold uppercase tracking-widest mb-2">Without Investing</div>
                                    <div className="text-3xl font-bold text-white/60 mb-1">
                                        ${result.pmtWithoutInvestment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-sm text-red-400/50">
                                        +${(result.pmtWithoutInvestment - result.pmtWithInvestment).toLocaleString(undefined, { maximumFractionDigits: 2 })} more per month
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6 border-white/5 flex flex-col h-full">
                                <h3 className="text-sm font-bold text-white/80 mb-6 flex items-center gap-2 uppercase tracking-wide">
                                    <Info className="w-4 h-4 text-blue-400" />
                                    Investment Impact (Monthly Payment)
                                </h3>
                                <div className="flex-1 min-h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis 
                                                dataKey="name" 
                                                stroke="#ffffff30" 
                                                fontSize={12} 
                                                tickLine={false} 
                                                axisLine={false} 
                                            />
                                            <YAxis 
                                                stroke="#ffffff30" 
                                                fontSize={12} 
                                                tickLine={false} 
                                                axisLine={false} 
                                                tickFormatter={(val) => `$${val/1000}k`}
                                            />
                                            <Tooltip 
                                                cursor={{ fill: '#ffffff05' }}
                                                contentStyle={{ 
                                                    backgroundColor: '#0f172a', 
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '12px',
                                                    color: '#fff'
                                                }}
                                            />
                                            <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={60}>
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
                        <div className="glass-card h-full flex flex-col items-center justify-center text-center p-12 border-white/5">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Target className="w-10 h-10 text-white/10" />
                            </div>
                            <h3 className="text-xl font-bold text-white/40 mb-2">Awaiting Calculation</h3>
                            <p className="text-blue-200/20 max-w-sm">
                                Enter your goal details to see how much you need to set aside each month.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavingsPlanner;
