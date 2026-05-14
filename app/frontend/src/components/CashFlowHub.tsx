import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { analyzeCashFlow, analyzeWithAI, analyzeWithFile } from '../lib/api';
import type { Transaction } from '../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Loader2, 
  Plus, 
  Brain, 
  List, 
  CheckCircle2, 
  AlertCircle, 
  PieChart as PieIcon, 
  DollarSign, 
  ArrowRight, 
  ChevronDown, 
  Trash2, 
  Upload, 
  FileText, 
  X as CloseIcon,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { useFinancial } from '../FinancialContext';
import { useDropzone } from 'react-dropzone';

const CategorySelector: React.FC<{
    value: Transaction['category'];
    onChange: (val: Transaction['category']) => void;
}> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);

    const categories: { id: Transaction['category'], label: string }[] = [
        { id: 'Income', label: 'Income' },
        { id: 'Fixed', label: 'Fixed (Needs)' },
        { id: 'Variable', label: 'Variable (Wants)' },
        { id: 'Savings', label: 'Savings/Debt' }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isOutsideContainer = containerRef.current && !containerRef.current.contains(target);
            const isOutsidePortal = portalRef.current && !portalRef.current.contains(target);
            
            if (isOutsideContainer && isOutsidePortal) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom,
                left: rect.left,
                width: rect.width
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [isOpen]);

    const selectedCategory = categories.find(c => c.id === value);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2 px-4 py-2 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] hover:border-[var(--vibrant-teal)] transition-all min-w-[150px] text-[var(--on-surface)]"
            >
                <span className="text-xs font-bold uppercase tracking-tight">{selectedCategory?.label}</span>
                <ChevronDown className={`w-3 h-3 text-[var(--on-surface-variant)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && createPortal(
                <div 
                    ref={portalRef}
                    style={{ 
                        position: 'fixed',
                        top: coords.top + 8,
                        left: coords.left,
                        width: coords.width,
                        zIndex: 9999
                    }}
                    className="bg-white border border-[var(--outline-variant)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(cat.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${value === cat.id
                                    ? 'bg-[var(--vibrant-teal)] text-white'
                                    : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
};

const CashFlowHub: React.FC = () => {
    const { state, setCashFlow, setStep } = useFinancial();
    const [mode, setMode] = useState<'manual' | 'ai'>('manual');
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: '1', date: '2026-04-18', description: 'Salary', amount: 5000, category: 'Income' }
    ]);
    const [aiInput, setAiInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
            setAiInput('');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/csv': ['.csv'],
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        multiple: false
    } as any);

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

    const handleDeleteTransaction = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    const handleUpdateTransaction = (id: string, field: keyof Transaction, value: string | number) => {
        let finalValue = value;
        if (field === 'amount') {
            finalValue = Math.abs(Number(value));
        }
        setTransactions(transactions.map(t => t.id === id ? { ...t, [field]: finalValue } : t));
    };

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            let result;
            if (mode === 'manual') {
                result = await analyzeCashFlow(transactions);
            } else if (selectedFile) {
                result = await analyzeWithFile(selectedFile);
            } else {
                result = await analyzeWithAI(aiInput);
            }

            setCashFlow(result);
            if (result.extractedTransactions) {
                setTransactions(result.extractedTransactions);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (state.cashFlow && mode === 'manual') {
            analyzeCashFlow(transactions).then(res => setCashFlow(res));
        }
    }, [transactions, mode, setCashFlow, state.cashFlow]);

    const COLORS = ['var(--vibrant-teal)', '#86f2e4', 'var(--primary-container)'];
    const pieData = state.cashFlow ? [
        { name: 'Needs', value: state.cashFlow?.needs || 0 },
        { name: 'Wants', value: state.cashFlow?.wants || 0 },
        { name: 'Savings', value: state.cashFlow?.savings || 0 }
    ].filter(d => d.value > 0) : [];

    return (
        <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--vibrant-teal)] bg-[var(--vibrant-teal)]/10 px-3 py-1 rounded-full">Step 1 of 4</span>
                        <div className="h-px w-20 bg-[var(--outline-variant)] opacity-30" />
                    </div>
                    <h2 className="display-lg text-[var(--on-surface)]">Cash Flow Hub</h2>
                    <p className="body-lg text-[var(--on-surface-variant)] max-w-2xl">
                        Integrated analysis of your monthly balance and institutional spending patterns.
                    </p>
                </div>

                <div className="flex bg-[var(--surface-container-low)] p-1.5 rounded-2xl border border-[var(--outline-variant)] shadow-sm">
                    <button
                        onClick={() => setMode('manual')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                          mode === 'manual' 
                            ? 'bg-white text-[var(--on-surface)] shadow-md' 
                            : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                        }`}
                    >
                        <List className="w-4 h-4" /> Manual
                    </button>
                    <button
                        onClick={() => setMode('ai')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                          mode === 'ai' 
                            ? 'bg-white text-[var(--on-surface)] shadow-md' 
                            : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                        }`}
                    >
                        <Brain className="w-4 h-4" /> AI Processor
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-10">
                    {mode === 'manual' ? (
                        <div className="card border-none shadow-xl bg-white overflow-hidden">
                            <div className="p-8 border-b border-[var(--outline-variant)] flex justify-between items-center bg-[var(--surface-container-low)]/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-white shadow-sm text-[var(--vibrant-teal)]">
                                        <List className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--on-surface)]">Active Ledger</h3>
                                </div>
                                <button
                                    onClick={handleAddTransaction}
                                    className="p-3 bg-[var(--vibrant-teal)] text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--vibrant-teal)]/20"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] sticky top-0 bg-white z-10 border-b border-[var(--outline-variant)]">
                                        <tr>
                                            <th className="px-8 py-5">Date</th>
                                            <th className="px-8 py-5">Description</th>
                                            <th className="px-8 py-5">Category</th>
                                            <th className="px-8 py-5 text-right">Amount</th>
                                            <th className="px-8 py-5 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--outline-variant)]">
                                        {transactions.map(tx => (
                                            <tr key={tx.id} className="hover:bg-[var(--surface-container-low)] transition-colors group">
                                                <td className="px-8 py-5 whitespace-nowrap">
                                                    <input
                                                        type="date"
                                                        value={tx.date}
                                                        onChange={(e) => handleUpdateTransaction(tx.id, 'date', e.target.value)}
                                                        className="bg-transparent text-[var(--on-surface)] font-bold focus:outline-none w-full"
                                                    />
                                                </td>
                                                <td className="px-8 py-5">
                                                    <input
                                                        type="text"
                                                        placeholder="Description..."
                                                        value={tx.description}
                                                        onChange={(e) => handleUpdateTransaction(tx.id, 'description', e.target.value)}
                                                        className="bg-transparent text-[var(--on-surface)] font-bold focus:outline-none w-full placeholder:text-[var(--on-surface-variant)] placeholder:font-medium"
                                                    />
                                                </td>
                                                <td className="px-8 py-5">
                                                    <CategorySelector
                                                        value={tx.category}
                                                        onChange={(val) => handleUpdateTransaction(tx.id, 'category', val)}
                                                    />
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className={`text-xs font-black ${tx.category === 'Income' ? 'text-[var(--emerald)]' : 'text-red-500'}`}>
                                                            {tx.category === 'Income' ? '+' : '-'}
                                                        </span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={Math.abs(tx.amount)}
                                                            onChange={(e) => handleUpdateTransaction(tx.id, 'amount', e.target.value)}
                                                            className={`bg-transparent font-mono font-black text-right focus:outline-none w-24 text-lg ${tx.category === 'Income' ? 'text-[var(--emerald)]' : 'text-red-500'}`}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <button
                                                        onClick={() => handleDeleteTransaction(tx.id!)}
                                                        className="p-2 text-[var(--on-surface-variant)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {transactions.length === 0 && (
                                    <div className="p-20 text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-[var(--surface-container-low)] flex items-center justify-center mx-auto">
                                            <FileText className="w-8 h-8 text-[var(--on-surface-variant)] opacity-20" />
                                        </div>
                                        <p className="text-sm font-bold text-[var(--on-surface-variant)]">No transactions recorded. Add one above.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="card p-10 bg-white shadow-xl border-none relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--vibrant-teal)] opacity-5 blur-3xl -mr-32 -mt-32" />
                                
                                <div className="flex items-center gap-5 mb-10 relative z-10">
                                    <div className="p-4 bg-[var(--vibrant-teal)] text-white rounded-[2rem] shadow-lg shadow-[var(--vibrant-teal)]/20">
                                        <Brain className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="headline-md">AI Intelligence Processor</h3>
                                        <p className="text-sm text-[var(--on-surface-variant)] font-medium">Deep extraction of banking data through semantic analysis.</p>
                                    </div>
                                </div>

                                <div 
                                    {...getRootProps()} 
                                    className={`mb-10 border-2 border-dashed rounded-[2.5rem] p-16 transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
                                        isDragActive ? 'border-[var(--vibrant-teal)] bg-[var(--vibrant-teal)]/5' : 'border-[var(--outline-variant)] hover:border-[var(--vibrant-teal)] hover:bg-[var(--surface-container-low)]'
                                    }`}
                                >
                                    <input 
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    {...getInputProps() as any} 
                                />
                                    {selectedFile ? (
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="p-6 bg-[var(--vibrant-teal)]/10 text-[var(--vibrant-teal)] rounded-3xl relative">
                                                <FileText className="w-12 h-12" />
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedFile(null);
                                                    }}
                                                    className="absolute -top-3 -right-3 p-2 bg-white border border-[var(--outline-variant)] rounded-full text-red-500 hover:scale-110 transition-transform shadow-md"
                                                >
                                                    <CloseIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div>
                                                <div className="text-lg font-black text-[var(--on-surface)]">{selectedFile.name}</div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--vibrant-teal)] mt-2">Ready for institutional processing</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-5 bg-[var(--surface-container)] rounded-[2rem] text-[var(--on-surface-variant)] group-hover:text-[var(--vibrant-teal)] group-hover:bg-white group-hover:shadow-md transition-all mb-6">
                                                <Upload className="w-10 h-10" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xl font-black text-[var(--on-surface)]">
                                                    Drop statement or <span className="text-[var(--vibrant-teal)] underline decoration-2 underline-offset-4 cursor-pointer">browse</span>
                                                </p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] opacity-60">
                                                    Supported: PDF • CSV • PNG • JPG
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="relative mb-10 text-center">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-[var(--outline-variant)] opacity-50"></div>
                                    </div>
                                    <span className="relative px-6 bg-white text-[10px] font-black uppercase tracking-[0.3em] text-[var(--on-surface-variant)]">Contextual Text Analysis</span>
                                </div>

                                <div className="relative">
                                    <div className="absolute top-4 left-4 p-2 rounded-lg bg-white/80 backdrop-blur shadow-sm text-[var(--vibrant-teal)] z-10">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <textarea
                                        className="w-full h-56 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-[2rem] p-8 pl-14 text-[var(--on-surface)] font-mono text-sm focus:ring-2 focus:ring-[var(--vibrant-teal)] focus:bg-white focus:outline-none transition-all placeholder:text-[var(--on-surface-variant)] placeholder:font-sans placeholder:font-medium"
                                        placeholder="Example:&#10;APR 01 MAIN ST RENT -1800.00&#10;APR 05 STARBUCKS -6.50..."
                                        value={aiInput}
                                        onChange={(e) => {
                                            setAiInput(e.target.value);
                                            if (e.target.value) setSelectedFile(null);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-6 pt-6">
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || (mode === 'ai' && !aiInput && !selectedFile)}
                            className="flex-1 btn btn-secondary py-5 text-lg gap-3 disabled:opacity-50 shadow-xl shadow-[var(--vibrant-teal)]/10"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                            Process Intelligence
                        </button>

                        {state.cashFlow && (
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 btn btn-primary py-5 text-lg gap-3 group shadow-2xl shadow-[var(--primary-container)]/20"
                            >
                                Define Goals <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="xl:col-span-1 space-y-10">
                    {state.cashFlow ? (
                        <div className="space-y-10 animate-in slide-in-from-right-8 duration-700">
                            <div className="card p-10 bg-white relative overflow-hidden shadow-2xl border-none">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--vibrant-teal)] opacity-5 blur-3xl -mr-16 -mt-16" />
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${state.cashFlow.netCashFlow >= 0 ? 'bg-[var(--emerald)] shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'} animate-pulse`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Liquidity Profile</span>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-[var(--surface-container-low)] rounded-xl text-[var(--on-surface-variant)]">
                                            <PieIcon className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <div className="h-72 w-full relative group">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    innerRadius={85}
                                                    outerRadius={110}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                    animationDuration={1500}
                                                >
                                                    {pieData.map((_entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: 'none',
                                                        borderRadius: '24px',
                                                        boxShadow: 'var(--shadow-xl)',
                                                        padding: '16px',
                                                        fontFamily: 'var(--font-sans)',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-2 transition-transform group-hover:scale-110 duration-500">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] mb-1">Net Flow</p>
                                            <p className={`text-4xl font-black tracking-tight leading-none ${state.cashFlow.netCashFlow >= 0 ? 'text-[var(--emerald)]' : 'text-red-600'}`}>
                                                ${(state.cashFlow.netCashFlow || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-12">
                                        <div className="p-5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-2">Total Inflow</p>
                                            <p className="text-xl font-black text-[var(--emerald)]">${(state.cashFlow.totalInflow || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-2">Total Outflow</p>
                                            <p className="text-xl font-black text-red-500">${(state.cashFlow.totalOutflow || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-10 border-none shadow-xl bg-white">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface)] mb-8 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-[var(--vibrant-teal)]/10 text-[var(--vibrant-teal)]">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    50/30/20 Rule Audit
                                </h4>
                                <div className="space-y-8">
                                    {state.cashFlow.budgetCompliance && Object.entries(state.cashFlow.budgetCompliance).map(([key, data]) => (
                                        <div key={key} className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <span className="text-sm font-black uppercase tracking-tight text-[var(--on-surface)]">{key}</span>
                                                    <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">{data.status}</p>
                                                </div>
                                                <span className={`text-sm font-black ${data.status === 'Over Budget' ? 'text-red-500' : 'text-[var(--emerald)]'}`}>
                                                    {data.actualPct?.toFixed(0) || 0}% <span className="text-[var(--on-surface-variant)] font-medium opacity-40">/ {data.limitPct}%</span>
                                                </span>
                                            </div>
                                            <div className="h-2.5 w-full bg-[var(--surface-container-low)] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 shadow-sm ${data.status === 'Over Budget' ? 'bg-red-500' : 'bg-[var(--vibrant-teal)]'}`}
                                                    style={{ width: `${Math.min(data.actualPct || 0, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`p-8 rounded-[2.5rem] border flex items-start gap-5 shadow-sm transition-all hover:shadow-md ${
                                state.cashFlow.netCashFlow >= 0 
                                  ? 'bg-[var(--emerald)]/5 border-[var(--emerald)]/10 text-emerald-900' 
                                  : 'bg-red-50 border-red-100 text-red-900'
                            }`}>
                                <div className={`p-3 rounded-2xl bg-white shadow-sm shrink-0 ${state.cashFlow.netCashFlow >= 0 ? 'text-[var(--emerald)]' : 'text-red-500'}`}>
                                    {state.cashFlow.netCashFlow >= 0 
                                      ? <CheckCircle2 className="w-6 h-6" /> 
                                      : <AlertCircle className="w-6 h-6" />}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-black uppercase tracking-tight leading-none">
                                        {state.cashFlow.netCashFlow >= 0 ? 'Healthy Baseline' : 'Deficit Protocol Required'}
                                    </p>
                                    <p className="text-xs opacity-70 leading-relaxed font-medium">
                                        {state.cashFlow.netCashFlow >= 0
                                            ? `Excellent wealth baseline. You have a verified surplus of $${state.cashFlow.netCashFlow.toLocaleString()} to commit to your saving goals.`
                                            : "Your outflows currently exceed your institutional income. We recommend a priority audit of variable expenditures."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card h-full p-16 flex flex-col items-center justify-center text-center space-y-8 bg-white border-none shadow-xl">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-[var(--surface-container-low)] flex items-center justify-center relative group">
                                <div className="absolute inset-0 bg-[var(--vibrant-teal)] opacity-0 group-hover:opacity-5 rounded-[2.5rem] transition-all scale-150 duration-700" />
                                <DollarSign className="w-12 h-12 text-[var(--on-surface-variant)] opacity-20" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="headline-md text-[var(--on-surface-variant)] opacity-40">Financial Health Audit</h3>
                                <p className="text-sm text-[var(--on-surface-variant)] opacity-40 max-w-[200px] mx-auto font-medium">Analyze your ledger to generate your 50/30/20 breakdown.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 flex justify-between items-center pt-8 border-t border-[var(--outline-variant)]">
                <button 
                    onClick={() => setStep(0)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default CashFlowHub;
