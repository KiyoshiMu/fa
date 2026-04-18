import React, { useState } from 'react';
import { analyzeCashFlow, analyzeWithAI } from '../lib/api';
import type { Transaction } from '../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Loader2, Plus, Brain, List, CheckCircle2, AlertCircle, PieChart as PieIcon, DollarSign } from 'lucide-react';

const CashFlowHub: React.FC = () => {
    const [mode, setMode] = useState<'manual' | 'ai'>('manual');
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: '1', date: '2026-04-01', description: 'Salary', amount: 5000, category: 'Income' }
    ]);
    const [aiInput, setAiInput] = useState('');
    const [analysis, setAnalysis] = useState<{ needs: number; wants: number; savings: number; totalInflow: number; totalOutflow: number; netCashFlow: number; budgetCompliance: any } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAddTransaction = () => {
        const newTx: Transaction = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: 0,
            category: 'Fixed'
        };
        setTransactions([...transactions, newTx]);
    };

    const handleUpdateTransaction = (id: string, field: keyof Transaction, value: any) => {
        let finalValue = value;
        if (field === 'amount') {
            finalValue = Math.abs(Number(value));
        }
        setTransactions(transactions.map(t => t.id === id ? { ...t, [field]: finalValue } : t));
    };

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const result = mode === 'manual' 
                ? await analyzeCashFlow(transactions)
                : await analyzeWithAI(aiInput);
            
            setAnalysis(result as any);
            if (mode === 'ai' && (result as any).extractedTransactions) {
                setTransactions((result as any).extractedTransactions);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0ea5e9', '#6366f1', '#10b981'];
    const pieData = analysis ? [
        { name: 'Needs', value: analysis.needs },
        { name: 'Wants', value: analysis.wants },
        { name: 'Savings', value: analysis.savings }
    ].filter(d => d.value > 0) : [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Cash Flow Hub</h2>
                    <p className="text-foreground/60 max-w-2xl">
                        Monitor your income and expenses to ensure a healthy 50/30/20 balance. Use AI to automatically categorize your spending from bank statements.
                    </p>
                </div>

                <div className="flex bg-secondary p-1 rounded-2xl border border-border">
                    <button
                        onClick={() => setMode('manual')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                            mode === 'manual' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-foreground/40 hover:text-foreground/60'
                        }`}
                    >
                        <List className="w-4 h-4" /> Manual
                    </button>
                    <button
                        onClick={() => setMode('ai')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                            mode === 'ai' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-foreground/40 hover:text-foreground/60'
                        }`}
                    >
                        <Brain className="w-4 h-4" /> AI Extract
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    {mode === 'manual' ? (
                        <div className="glass-card overflow-hidden border-border/40">
                            <div className="p-4 bg-secondary/50 border-b border-border/40 flex justify-between items-center">
                                <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Transaction List</span>
                                <button
                                    onClick={handleAddTransaction}
                                    className="p-2 bg-primary-500/5 hover:bg-primary-500/10 text-primary-500 rounded-lg transition-colors border border-primary-500/10"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-foreground/50 uppercase tracking-tighter sticky top-0 bg-background/90 backdrop-blur-md">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Date</th>
                                            <th className="px-6 py-4 font-bold">Description</th>
                                            <th className="px-6 py-4 font-bold">Category</th>
                                            <th className="px-6 py-4 font-bold text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {transactions.map(tx => (
                                            <tr key={tx.id} className="hover:bg-secondary/40 transition-colors group">
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <input
                                                        type="date"
                                                        value={tx.date}
                                                        onChange={(e) => handleUpdateTransaction(tx.id, 'date', e.target.value)}
                                                        className="bg-transparent text-foreground/80 focus:outline-none w-full"
                                                    />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Description..."
                                                        value={tx.description}
                                                        onChange={(e) => handleUpdateTransaction(tx.id, 'description', e.target.value)}
                                                        className="bg-transparent text-foreground focus:outline-none w-full placeholder:text-foreground/30"
                                                    />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <select
                                                        value={tx.category}
                                                        onChange={(e) => handleUpdateTransaction(tx.id, 'category', e.target.value as any)}
                                                        className="bg-transparent text-foreground/60 focus:outline-none cursor-pointer"
                                                    >
                                                        <option className="bg-background" value="Income">Income</option>
                                                        <option className="bg-background" value="Fixed">Fixed (Needs)</option>
                                                        <option className="bg-background" value="Variable">Variable (Wants)</option>
                                                        <option className="bg-background" value="Savings">Savings/Debt</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <span className={`text-xs font-bold ${tx.category === 'Income' ? 'text-green-500/50' : 'text-red-500/50'}`}>
                                                            {tx.category === 'Income' ? '+' : '-'}
                                                        </span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={tx.amount}
                                                            onChange={(e) => handleUpdateTransaction(tx.id, 'amount', e.target.value)}
                                                            className={`bg-transparent font-mono text-right focus:outline-none w-24 ${tx.category === 'Income' ? 'text-green-400' : 'text-red-400'}`}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card p-6 border-primary-500/20 bg-primary-500/5">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-primary-500/5 rounded-2xl text-primary-500 border border-primary-500/10">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">AI Statement Processor</h3>
                                    <p className="text-xs text-foreground/40 italic">Paste raw text from your bank or CC statement below.</p>
                                </div>
                            </div>
                            <textarea
                                className="w-full h-64 bg-secondary/50 border border-border rounded-2xl p-6 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder:text-foreground/30 mb-4"
                                placeholder="Example:&#10;APR 01 MAIN ST RENT -1800.00&#10;APR 05 STARBUCKS -6.50&#10;APR 15 EMPLOYER PAYROLL 4500.00..."
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                            />
                            <p className="text-[10px] text-foreground/30 italic mb-6">
                                * Your data is processed securely via Google Gemini. No personal info is stored.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full py-5 bg-gradient-to-r from-primary-600 to-blue-500 hover:from-primary-500 hover:to-blue-400 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 shadow-2xl shadow-primary-500/30 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-6 h-6 animate-spin" />}
                        Generate Analysis
                    </button>
                </div>

                <div className="xl:col-span-1 space-y-6">
                    {analysis ? (
                        <div className="space-y-6">
                            <div className="glass-card p-8 border-border bg-gradient-to-br from-secondary/50 to-transparent overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-full flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${analysis.netCashFlow >= 0 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Monthly Summary</span>
                                        </div>
                                        <PieIcon className="w-4 h-4 text-foreground/20" />
                                    </div>

                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    innerRadius={75}
                                                    outerRadius={95}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((_entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: '#0f172a', 
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '12px'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-4">
                                            <div className="text-[10px] text-foreground/40 uppercase font-black tracking-tighter">Net Flow</div>
                                            <div className={`text-2xl font-black ${analysis.netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                ${analysis.netCashFlow.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 w-full gap-4 mt-8 pt-8 border-t border-border text-center">
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-tight">Needs</div>
                                            <div className="text-sm font-bold text-foreground">${analysis.needs.toLocaleString()}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-tight">Wants</div>
                                            <div className="text-sm font-bold text-foreground">${analysis.wants.toLocaleString()}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-tight">Savings</div>
                                            <div className="text-sm font-bold text-foreground">${analysis.savings.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6 border-border">
                                <h4 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary-500" />
                                    Budget Compliance
                                </h4>
                                <div className="space-y-6">
                                    {analysis.budgetCompliance && Object.entries(analysis.budgetCompliance).map(([key, data]: any) => (
                                        <div key={key} className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-foreground/60 capitalize">{key}</span>
                                                <span className={`${data.status === 'Over Budget' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {data.actualPct?.toFixed(0) || 0}% / {data.limitPct}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${data.status === 'Over Budget' ? 'bg-red-500' : 'bg-green-500'}`} 
                                                    style={{ width: `${Math.min(data.actualPct || 0, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`p-5 rounded-2xl border flex items-start gap-4 ${analysis.netCashFlow >= 0 ? 'bg-green-500/10 border-green-500/20 text-green-200' : 'bg-red-500/10 border-red-500/20 text-red-200'}`}>
                                {analysis.netCashFlow >= 0 ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                <div>
                                    <div className="text-sm font-bold mb-1">
                                        {analysis.netCashFlow >= 0 ? 'Positive Cash Flow Detected' : 'Debt Risk Alert'}
                                    </div>
                                    <div className="text-xs opacity-70 leading-relaxed">
                                        {analysis.netCashFlow >= 0 
                                            ? `Great job! You have $${analysis.netCashFlow.toLocaleString()} left over this month correctly. We recommend putting this toward your savings goal.`
                                            : "Your expenses exceed your income this month. You should audit your 'Wants' category to bring your cash flow back to zero or positive."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card h-full p-12 flex flex-col items-center justify-center text-center space-y-4 border-border/40">
                            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                                <DollarSign className="w-8 h-8 text-foreground/10" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground/40 uppercase tracking-widest">Financial Health Summary</h3>
                            <p className="text-sm text-foreground/20 italic">Analyze your data to see your 50/30/20 breakdown and health status.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CashFlowHub;
