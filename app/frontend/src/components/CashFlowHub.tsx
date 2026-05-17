import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { analyzeCashFlow, analyzeWithAI, analyzeWithFile } from '../lib/api';
import type { Transaction } from '../lib/api';

import { 
  Loader2, 
  Plus, 
  List, 
  ArrowRight, 
  ChevronDown, 
  Trash2, 
  Upload, 
  FileText,
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
    const { state, setCashFlow, setStep, setTransactions } = useFinancial();
    const transactions = state.transactions;
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
            if (selectedFile) {
                result = await analyzeWithFile(selectedFile);
            } else if (aiInput.trim()) {
                result = await analyzeWithAI(aiInput);
            } else {
                result = await analyzeCashFlow(transactions);
            }

            setCashFlow(result);
            if (result.extractedTransactions && result.extractedTransactions.length > 0) {
                setTransactions(result.extractedTransactions);
                setAiInput('');
                setSelectedFile(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Automatically analyze whenever transactions change to keep state in sync
        const timeoutId = setTimeout(() => {
            analyzeCashFlow(transactions).then(res => setCashFlow(res));
        }, 500); // Debounce to avoid excessive API calls
        
        return () => clearTimeout(timeoutId);
    }, [transactions, setCashFlow]);

    // Note: pieData is currently unused in the horizontal bar layout

    return (
        <div className="max-w-[1400px] mx-auto p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="headline-lg text-[var(--on-surface)]">Cash Flow Hub</h2>
                    <p className="body-md text-[var(--on-surface-variant)]">Manage and audit your institutional cash flow with AI-driven insights.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Mode switcher removed as both now use same source of truth */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: AI Transaction Entry */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="card p-8 bg-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-500">
                        <h3 className="headline-md mb-2">AI Transaction Entry</h3>
                        <p className="body-md text-[var(--on-surface-variant)] mb-8">
                            Upload statements or paste raw text. Our AI will automatically categorize and audit your cash flow.
                        </p>

                        <div 
                            {...getRootProps()} 
                            className={`border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center text-center group mb-6 relative overflow-hidden ${
                                isDragActive ? 'border-[var(--vibrant-teal)] bg-[var(--vibrant-teal)]/5' : 'border-[var(--outline-variant)] hover:border-[var(--vibrant-teal)] hover:bg-[var(--surface-container-low)]'
                            }`}
                        >
                            <input {...getInputProps() as any} />
                            <div className="p-4 bg-[var(--surface-container-low)] rounded-2xl text-[var(--vibrant-teal)] mb-4 group-hover:scale-110 transition-transform duration-500">
                                <Upload className="w-8 h-8" />
                            </div>
                            <p className="text-sm font-black text-[var(--on-surface)] mb-1">
                                {selectedFile ? selectedFile.name : 'Drag & Drop PDF/CSV'}
                            </p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-[var(--on-surface-variant)] opacity-60">
                                or click to browse files
                            </p>
                            {isDragActive && (
                                <div className="absolute inset-0 bg-[var(--vibrant-teal)]/5 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
                                    <p className="text-[var(--vibrant-teal)] font-black uppercase tracking-widest text-xs">Drop statement now</p>
                                </div>
                            )}
                        </div>

                        <div className="relative mb-6 text-center">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-[var(--outline-variant)] opacity-40"></div>
                            </div>
                            <span className="relative px-4 bg-white text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">OR</span>
                        </div>

                        <div className="space-y-4">
                            <label className="label">Paste Unstructured Data</label>
                            <textarea
                                className="w-full h-48 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-[var(--vibrant-teal)] focus:bg-white focus:outline-none transition-all placeholder:text-[var(--on-surface-variant)]/50"
                                placeholder="e.g. Starbucks $4.50 yesterday,&#10;Amazon prime renewal $139..."
                                value={aiInput}
                                onChange={(e) => {
                                    setAiInput(e.target.value);
                                    if (e.target.value) setSelectedFile(null);
                                }}
                            />
                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="w-full btn btn-secondary gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                Process & Audit Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Audit and Transactions */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Budget Audit Card */}
                    <div className="card p-8 bg-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-500">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="headline-md">50/30/20 Budget Audit</h3>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--outline-variant)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--surface-container-low)] transition-all">
                                <FileText className="w-4 h-4" />
                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                <ChevronDown className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Needs', target: 50, actual: state.cashFlow?.budgetCompliance.needs.actualPct || 48, color: 'var(--vibrant-teal)', amount: 4500, icon: <List className="w-3 h-3" /> },
                                { label: 'Wants', target: 30, actual: state.cashFlow?.budgetCompliance.wants.actualPct || 32, color: 'var(--error)', amount: 2700, icon: <Sparkles className="w-3 h-3" /> },
                                { label: 'Savings', target: 20, actual: state.cashFlow?.budgetCompliance.savings.actualPct || 20, color: 'var(--emerald)', amount: 1800, icon: <ArrowRight className="w-3 h-3" /> }
                            ].map((item) => (
                                <div key={item.label} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-[var(--on-surface)]">{item.label}</span>
                                                <span className="text-[var(--on-surface-variant)] font-black text-xs" style={{ color: item.actual > item.target && item.label !== 'Savings' ? 'var(--error)' : item.color }}>{item.actual}%</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase opacity-60">Target: {item.target}% (${item.amount.toLocaleString()})</p>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-[var(--surface-container)] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.05)]"
                                            style={{ 
                                                width: `${Math.min(item.actual, 100)}%`,
                                                backgroundColor: item.actual > item.target && item.label !== 'Savings' ? 'var(--error)' : item.color 
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Unified Transaction Ledger */}
                    <div className="card overflow-hidden bg-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-500">
                        <div className="p-8 flex items-center justify-between gap-4">
                            <div>
                                <h3 className="headline-md">Transaction Ledger</h3>
                                <p className="text-xs text-[var(--on-surface-variant)] font-medium">Full historical record of analyzed and manual entries.</p>
                            </div>
                            <button
                                onClick={handleAddTransaction}
                                className="p-2 bg-[var(--vibrant-teal)] text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2 px-4"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Add Row</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto max-h-[600px]">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--surface-container-low)]/50 border-y border-[var(--outline-variant)] sticky top-0 z-10">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Date</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Description</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Category</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] text-right">Amount</th>
                                        <th className="px-8 py-4 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--outline-variant)]/30">
                                    {transactions.length > 0 ? (
                                        transactions.map(tx => (
                                            <tr key={tx.id} className="hover:bg-[var(--surface-container-low)] transition-colors group">
                                                <td className="px-8 py-4 whitespace-nowrap">
                                                    <input
                                                        type="date"
                                                        value={tx.date}
                                                        onChange={(e) => handleUpdateTransaction(tx.id, 'date', e.target.value)}
                                                        className="bg-transparent text-[var(--on-surface)] font-bold focus:outline-none w-full"
                                                    />
                                                </td>
                                                <td className="px-8 py-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Description..."
                                                        value={tx.description}
                                                        onChange={(e) => handleUpdateTransaction(tx.id, 'description', e.target.value)}
                                                        className="bg-transparent text-[var(--on-surface)] font-bold focus:outline-none w-full placeholder:text-[var(--on-surface-variant)]/40"
                                                    />
                                                </td>
                                                <td className="px-8 py-4">
                                                    <CategorySelector
                                                        value={tx.category}
                                                        onChange={(val) => handleUpdateTransaction(tx.id, 'category', val)}
                                                    />
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className={`text-sm font-black ${tx.category === 'Income' ? 'text-[var(--emerald)]' : 'text-red-500'}`}>
                                                            {tx.category === 'Income' ? '+' : '-'}
                                                        </span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={Math.abs(tx.amount)}
                                                            onChange={(e) => handleUpdateTransaction(tx.id, 'amount', e.target.value)}
                                                            className={`bg-transparent data-mono text-right focus:outline-none w-24 ${tx.category === 'Income' ? 'text-[var(--emerald)]' : 'text-red-500'}`}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteTransaction(tx.id!)}
                                                        className="p-1.5 text-[var(--on-surface-variant)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <p className="body-md text-[var(--on-surface-variant)] opacity-50 font-medium">No transactions found. Use AI entry or add manual rows.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[var(--outline-variant)] flex items-center justify-end">
                {!state.onboardingComplete && (
                  <div />
                )}
                {state.onboardingComplete && (
                  <button 
                      onClick={() => setStep(0)}
                      className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all"
                  >
                      <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                  </button>
                )}

                <button 
                    onClick={() => setStep(2)}
                    className="btn btn-primary gap-2 px-8 shadow-[var(--shadow-lg)]"
                >
                    Continue to Goal Planner
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default CashFlowHub;
