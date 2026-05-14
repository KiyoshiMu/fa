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
  X as CloseIcon
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
                className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-container-low)] border border-[var(--outline-variant)] hover:border-[var(--secondary)] transition-all min-w-[140px] text-[var(--on-surface)]"
            >
                <span className="text-xs font-semibold">{selectedCategory?.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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
                    className="bg-white border border-[var(--outline-variant)] rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(cat.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${value === cat.id
                                    ? 'bg-[var(--secondary)] text-white'
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
        if (window.confirm('Are you sure you want to remove this transaction?')) {
            setTransactions(transactions.filter(t => t.id !== id));
        }
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
            alert("Analysis failed. Please check your file/input and try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (state.cashFlow && mode === 'manual') {
            analyzeCashFlow(transactions).then(res => setCashFlow(res));
        }
    }, [transactions, mode, setCashFlow, state.cashFlow]);

    const COLORS = ['#006a61', '#86f2e4', '#131b2e'];
    const pieData = state.cashFlow ? [
        { name: 'Needs', value: state.cashFlow?.needs || 0 },
        { name: 'Wants', value: state.cashFlow?.wants || 0 },
        { name: 'Savings', value: state.cashFlow?.savings || 0 }
    ].filter(d => d.value > 0) : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="headline-lg text-[var(--on-surface)]">Cash Flow Hub</h2>
                    <p className="body-md text-[var(--on-surface-variant)]">
                        Analyze your monthly balance and optimize your spending habits.
                    </p>
                </div>

                <div className="flex bg-[var(--surface-container-low)] p-1 rounded-[var(--radius-lg)] border border-[var(--outline-variant)]">
                    <button
                        onClick={() => setMode('manual')}
                        className={`px-6 py-2 rounded-[var(--radius-md)] text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                          mode === 'manual' 
                            ? 'bg-white text-[var(--on-surface)] shadow-sm' 
                            : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                        }`}
                    >
                        <List className="w-4 h-4" /> Manual
                    </button>
                    <button
                        onClick={() => setMode('ai')}
                        className={`px-6 py-2 rounded-[var(--radius-md)] text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                          mode === 'ai' 
                            ? 'bg-white text-[var(--on-surface)] shadow-sm' 
                            : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                        }`}
                    >
                        <Brain className="w-4 h-4" /> AI Upload
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    {mode === 'manual' ? (
                        <div className="card overflow-hidden">
                            <div className="p-6 border-b border-[var(--outline-variant)] flex justify-between items-center bg-[var(--surface-container-low)]">
                                <h3 className="headline-md text-sm">Transaction List</h3>
                                <button
                                    onClick={handleAddTransaction}
                                    className="p-2 bg-[var(--secondary-container)] text-[var(--on-secondary-container)] rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="label-md text-[var(--on-surface-variant)] sticky top-0 bg-[var(--surface-container-low)] z-10">
                                        <tr>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Description</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4 text-right">Amount</th>
                                            <th className="px-6 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--outline-variant)]">
                                        {transactions.map(tx => (
                                            <tr key={tx.id} className="hover:bg-[var(--surface-container-low)] transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="date"
                                                        value={tx.date}
                                                        onChange={(e) => handleUpdateTransaction(tx.id, 'date', e.target.value)}
                                                        className="bg-transparent text-[var(--on-surface)] focus:outline-none w-full"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Description..."
                                                        value={tx.description}
                                                        onChange={(e) => handleUpdateTransaction(tx.id, 'description', e.target.value)}
                                                        className="bg-transparent text-[var(--on-surface)] focus:outline-none w-full placeholder:text-[var(--on-surface-variant)]"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <CategorySelector
                                                        value={tx.category}
                                                        onChange={(val) => handleUpdateTransaction(tx.id, 'category', val)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <span className={`text-xs font-bold ${tx.category === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {tx.category === 'Income' ? '+' : '-'}
                                                        </span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={Math.abs(tx.amount)}
                                                            onChange={(e) => handleUpdateTransaction(tx.id, 'amount', e.target.value)}
                                                            className={`bg-transparent data-mono text-right focus:outline-none w-24 ${tx.category === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteTransaction(tx.id!)}
                                                        className="p-2 text-[var(--on-surface-variant)] hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="card p-8 bg-[var(--surface-container-low)]">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-4 bg-[var(--secondary-container)] rounded-2xl text-[var(--on-secondary-container)]">
                                        <Brain className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="headline-md">AI Statement Processor</h3>
                                        <p className="body-md text-[var(--on-surface-variant)]">Upload a file or paste text to extract transactions.</p>
                                    </div>
                                </div>

                                <div 
                                    {...getRootProps() as any} 
                                    className={`mb-8 border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
                                        isDragActive ? 'border-[var(--secondary)] bg-[var(--surface-container)]' : 'border-[var(--outline-variant)] hover:border-[var(--secondary)] hover:bg-white'
                                    }`}
                                >
                                    <input {...getInputProps() as any} />
                                    {selectedFile ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-[var(--secondary-container)] rounded-2xl text-[var(--on-secondary-container)] relative">
                                                <FileText className="w-10 h-10" />
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedFile(null);
                                                    }}
                                                    className="absolute -top-2 -right-2 p-1 bg-white border border-[var(--outline-variant)] rounded-full text-red-600 hover:scale-110 transition-transform"
                                                >
                                                    <CloseIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-[var(--on-surface)]">{selectedFile.name}</div>
                                                <div className="label-md text-[var(--on-surface-variant)] mt-1">Ready for analysis</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-4 bg-[var(--surface-container)] rounded-2xl text-[var(--on-surface-variant)] group-hover:text-[var(--secondary)] transition-colors mb-4">
                                                <Upload className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="body-lg font-semibold text-[var(--on-surface)]">
                                                    Drop your statement here or <span className="text-[var(--secondary)] underline">browse</span>
                                                </p>
                                                <p className="label-md text-[var(--on-surface-variant)] mt-2">
                                                    PDF, CSV, PNG, JPG
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="relative mb-8 text-center">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-[var(--outline-variant)]"></div>
                                    </div>
                                    <span className="relative px-4 bg-[var(--surface-container-low)] label-md text-[var(--on-surface-variant)]">OR PASTE TEXT</span>
                                </div>

                                <textarea
                                    className="w-full h-48 bg-white border border-[var(--outline-variant)] rounded-2xl p-6 text-[var(--on-surface)] data-mono text-sm focus:ring-2 focus:ring-[var(--secondary)] focus:outline-none transition-all placeholder:text-[var(--on-surface-variant)]"
                                    placeholder="Example:&#10;APR 01 MAIN ST RENT -1800.00&#10;APR 05 STARBUCKS -6.50..."
                                    value={aiInput}
                                    onChange={(e) => {
                                        setAiInput(e.target.value);
                                        if (e.target.value) setSelectedFile(null);
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-6">
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || (mode === 'ai' && !aiInput && !selectedFile)}
                            className="flex-1 btn btn-secondary py-5 text-lg gap-3 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-6 h-6 animate-spin" />}
                            Run Analysis
                        </button>

                        {state.cashFlow && (
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 btn btn-primary py-5 text-lg gap-3"
                            >
                                Continue to Goal <ArrowRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="xl:col-span-1 space-y-8">
                    {state.cashFlow ? (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="card p-8 bg-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--secondary-container)] opacity-20 blur-3xl -mr-16 -mt-16" />
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${state.cashFlow.netCashFlow >= 0 ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                                                <span className="label-md text-[var(--on-surface-variant)]">Monthly Summary</span>
                                            </div>
                                        </div>
                                        <PieIcon className="w-5 h-5 text-[var(--on-surface-variant)]" />
                                    </div>

                                    <div className="h-64 w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    innerRadius={80}
                                                    outerRadius={100}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((_entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid var(--outline-variant)',
                                                        borderRadius: 'var(--radius-md)',
                                                        boxShadow: 'var(--shadow-md)'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-2">
                                            <p className="label-md text-[var(--on-surface-variant)] text-[10px]">Net Flow</p>
                                            <p className={`headline-lg leading-none ${state.cashFlow.netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                ${(state.cashFlow.netCashFlow || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-8">
                                        <div className="p-4 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]">
                                            <p className="label-md text-[var(--on-surface-variant)] mb-1">Income</p>
                                            <p className="headline-md text-emerald-600">${(state.cashFlow.totalInflow || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]">
                                            <p className="label-md text-[var(--on-surface-variant)] mb-1">Expenses</p>
                                            <p className="headline-md text-red-600">${(state.cashFlow.totalOutflow || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-8">
                                <h4 className="headline-md text-sm mb-6 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-[var(--secondary)]" />
                                    Budget Audit
                                </h4>
                                <div className="space-y-6">
                                    {state.cashFlow.budgetCompliance && Object.entries(state.cashFlow.budgetCompliance).map(([key, data]) => (
                                        <div key={key} className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-[var(--on-surface-variant)] capitalize">{key}</span>
                                                <span className={data.status === 'Over Budget' ? 'text-red-600' : 'text-emerald-600'}>
                                                    {data.actualPct?.toFixed(0) || 0}% / {data.limitPct}%
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-[var(--surface-container-low)] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${data.status === 'Over Budget' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${Math.min(data.actualPct || 0, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`p-6 rounded-[var(--radius-xl)] border flex items-start gap-4 ${
                                state.cashFlow.netCashFlow >= 0 
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
                                  : 'bg-red-50 border-red-100 text-red-900'
                            }`}>
                                {state.cashFlow.netCashFlow >= 0 
                                  ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> 
                                  : <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />}
                                <div>
                                    <p className="text-sm font-bold mb-1">
                                        {state.cashFlow.netCashFlow >= 0 ? 'Healthy Cash Flow' : 'Deficit Detected'}
                                    </p>
                                    <p className="text-xs opacity-70 leading-relaxed font-medium">
                                        {state.cashFlow.netCashFlow >= 0
                                            ? `Excellent wealth baseline. You have a surplus of $${state.cashFlow.netCashFlow.toLocaleString()} to commit to your saving goals.`
                                            : "Your outflows exceed your income. We recommend auditing your 'Wants' category to reach a positive balance."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card h-[600px] p-12 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-20 h-20 rounded-full bg-[var(--surface-container-low)] flex items-center justify-center">
                                <DollarSign className="w-10 h-10 text-[var(--on-surface-variant)] opacity-20" />
                            </div>
                            <div>
                                <h3 className="headline-md text-[var(--on-surface-variant)] opacity-40">Financial Health Summary</h3>
                                <p className="body-md text-[var(--on-surface-variant)] opacity-40 mt-2">Analyze your data to see your 50/30/20 breakdown.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CashFlowHub;
