import React, { useState, useMemo } from 'react';
import { calculateInvestmentProfile } from '../lib/api';
import type { QuestionnaireAnswers } from '../lib/api';
import { 
  Loader2, 
  ChevronRight, 
  CheckCircle2, 
  ChevronLeft, 
  ArrowRight, 
  Compass, 
  Target, 
  Zap, 
  Anchor, 
  Activity,
  Shield,
  TrendingUp,
  PieChart as PieIcon
} from 'lucide-react';
import { useFinancial } from '../FinancialContext';
import { mapMonthsToTimeHorizon, mapIncomeToPoints, mapStabilityToPoints, mapConcentrationToPoints } from '../lib/mortgageUtils';
import { 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface QuestionOption {
  id: string;
  label: string;
  points?: number;
}

interface Question {
  id: string;
  type: string;
  label: string;
  text: string;
  linked?: boolean;
  options: QuestionOption[];
}

const QUESTIONS: Question[] = [
  { id: 'timeHorizon', type: 'select', label: 'Time Horizon', text: 'When do you plan to reach this goal?', linked: true, options: [
      { id: 'a', label: '< 1 year' },
      { id: 'b', label: '1 - 3 years' },
      { id: 'c', label: '4 - 5 years' },
      { id: 'd', label: '6 - 9 years' },
      { id: 'e', label: '10+ years' },
  ]},
  { id: 'knowledge', type: 'select', label: 'Investment Knowledge', text: 'How would you describe your investment knowledge?', options: [
      { id: 'a', label: 'Novice' },
      { id: 'b', label: 'Basic' },
      { id: 'c', label: 'Average' },
      { id: 'd', label: 'Above Average' },
      { id: 'e', label: 'Advanced' },
  ]},
  { id: 'objectives', type: 'select', label: 'Primary Goal', text: 'What is your primary goal for this investment?', options: [
      { id: 'a', label: 'Safety (Protect principal)' },
      { id: 'b', label: 'Income (Regular payments)' },
      { id: 'c', label: 'Balanced (Income & Growth)' },
      { id: 'd', label: 'Growth (Max long-term gain)' },
  ]},
  { id: 'q4Points', type: 'points', label: 'Annual Income', text: 'What is your total annual household income?', linked: true, options: [
      { id: 'a', label: '< $20k', points: 0 },
      { id: 'b', label: '$20-50k', points: 2 },
      { id: 'c', label: '$50-100k', points: 4 },
      { id: 'd', label: '$100-150k', points: 5 },
      { id: 'e', label: '$150-200k', points: 7 },
      { id: 'f', label: '> $200k', points: 10 },
  ]},
  { id: 'q5Points', type: 'points', label: 'Income Stability', text: 'How stable is your current source of income?', linked: true, options: [
      { id: 'a', label: 'Very Stable', points: 8 },
      { id: 'b', label: 'Somewhat Stable', points: 4 },
      { id: 'c', label: 'Unstable', points: 1 },
  ]},
  { id: 'q6Points', type: 'points', label: 'Financial Situation', text: 'Which best describes your current financial situation?', options: [
      { id: 'a', label: 'No savings, high debt', points: 0 },
      { id: 'b', label: 'Little savings, some debt', points: 2 },
      { id: 'c', label: 'Some savings, some debt', points: 5 },
      { id: 'd', label: 'Some savings, little debt', points: 7 },
      { id: 'e', label: 'Significant savings, little debt', points: 10 },
  ]},
  { id: 'q7Points', type: 'points', label: 'Net Worth', text: 'What is your approximate total net worth?', options: [
      { id: 'a', label: '< $50k', points: 0 },
      { id: 'b', label: '$50-100k', points: 2 },
      { id: 'c', label: '$100-250k', points: 4 },
      { id: 'd', label: '$250-500k', points: 6 },
      { id: 'e', label: '$500k-1M', points: 8 },
      { id: 'f', label: '$1-2M', points: 10 },
      { id: 'g', label: '> $2M', points: 12 },
  ]},
  { id: 'q8Points', type: 'points', label: 'Concentration', text: 'What % of your portfolio is this investment?', linked: true, options: [
      { id: 'a', label: '< 25%', points: 10 },
      { id: 'b', label: '25-50%', points: 5 },
      { id: 'c', label: '51-75%', points: 4 },
      { id: 'd', label: '> 75%', points: 2 },
  ]},
  { id: 'q9Points', type: 'points', label: 'Age Group', text: 'What is your age group?', options: [
      { id: 'a', label: 'Under 35', points: 20 },
      { id: 'b', label: '35-54', points: 8 },
      { id: 'c', label: '55-64', points: 3 },
      { id: 'd', label: '65+', points: 1 },
  ]},
  { id: 'q10Points', type: 'points', label: 'Risk Attitude', text: 'How would you describe your attitude toward risk?', options: [
      { id: 'a', label: 'Very Conservative', points: 0 },
      { id: 'b', label: 'Conservative', points: 4 },
      { id: 'c', label: 'Moderate', points: 6 },
      { id: 'd', label: 'Aggressive', points: 10 },
  ]},
  { id: 'q11Points', type: 'points', label: 'Tolerable Loss', text: 'How much market decline can you tolerate for a year?', options: [
      { id: 'a', label: '0%', points: 0 },
      { id: 'b', label: '-3%', points: 3 },
      { id: 'c', label: '-10%', points: 6 },
      { id: 'd', label: '-20%', points: 8 },
      { id: 'e', label: '> -20%', points: 10 },
  ]},
  { id: 'q12Points', type: 'points', label: 'Psychology', text: 'Do you prioritize avoiding loss or achieving gains?', options: [
      { id: 'a', label: 'Always avoid loss', points: 0 },
      { id: 'b', label: 'Generally avoid loss', points: 3 },
      { id: 'c', label: 'Generally achieve gains', points: 6 },
      { id: 'd', label: 'Always achieve gains', points: 10 },
  ]},
  { id: 'q13Points', type: 'points', label: 'Outcome Acceptability', text: 'Which $1,000 investment outcome is most acceptable?', options: [
      { id: 'a', label: '$0 to $200 gain', points: 0 },
      { id: 'b', label: '-$200 to $500 gain/loss', points: 3 },
      { id: 'c', label: '-$800 to $1,200 gain/loss', points: 6 },
      { id: 'd', label: '-$2,000 to $2,500 gain/loss', points: 10 },
  ]},
  { id: 'q14Points', type: 'points', label: 'Market Drop Reaction', text: 'If the market drops 20%, what would you do?', options: [
      { id: 'a', label: 'Sell all', points: 0 },
      { id: 'b', label: 'Sell a portion', points: 3 },
      { id: 'c', label: 'Hold', points: 5 },
      { id: 'd', label: 'Buy more', points: 10 },
  ]},
  { id: 'q15Points', type: 'points', label: 'Historical Comfort', text: 'Which historical portfolio volatility feels right?', options: [
      { id: 'a', label: 'Portfolio A: Low volatility (Safety)', points: 0 },
      { id: 'b', label: 'Portfolio B: Moderate volatility (Balanced growth)', points: 4 },
      { id: 'c', label: 'Portfolio C: High volatility (Aggressive growth)', points: 6 },
      { id: 'd', label: 'Portfolio D: Very high volatility (Maximum growth)', points: 10 },
  ]},
];

// Radar Chart Component
const RadarChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
    const dimensions = [
        { name: 'Viability', key: 'viability', icon: Anchor },
        { name: 'Offensiveness', key: 'offensiveness', icon: Target },
        { name: 'Decision', key: 'decision', icon: Compass },
        { name: 'Endurance', key: 'endurance', icon: Activity },
        { name: 'Adaptability', key: 'adaptability', icon: Zap },
    ];

    const size = 260;
    const center = size / 2;
    const radius = size * 0.35;
    const angleStep = (Math.PI * 2) / dimensions.length;

    const points = dimensions.map((d, i) => {
        const val = data[d.key] || 0.5;
        const x = center + radius * val * Math.sin(i * angleStep);
        const y = center - radius * val * Math.cos(i * angleStep);
        return `${x},${y}`;
    }).join(' ');

    const gridLevels = [0.25, 0.5, 0.75, 1];

    return (
        <div className="relative flex flex-col items-center">
            <svg width={size} height={size} className="overflow-visible">
                {gridLevels.map(level => (
                    <polygon
                        key={level}
                        points={dimensions.map((_, i) => {
                            const x = center + radius * level * Math.sin(i * angleStep);
                            const y = center - radius * level * Math.cos(i * angleStep);
                            return `${x},${y}`;
                        }).join(' ')}
                        className="fill-transparent stroke-[var(--outline-variant)] stroke-1"
                    />
                ))}
                
                {dimensions.map((_, i) => (
                    <line
                        key={i}
                        x1={center} y1={center}
                        x2={center + radius * Math.sin(i * angleStep)}
                        y2={center - radius * Math.cos(i * angleStep)}
                        className="stroke-[var(--outline-variant)] stroke-1"
                    />
                ))}

                <polygon
                    points={points}
                    className="fill-[var(--secondary)] fill-opacity-20 stroke-[var(--secondary)] stroke-2 transition-all duration-1000"
                />

                {dimensions.map((d, i) => {
                    const offset = 25;
                    const x = center + (radius + offset) * Math.sin(i * angleStep);
                    const y = center - (radius + offset) * Math.cos(i * angleStep);
                    return (
                        <text
                            key={d.key}
                            x={x} y={y}
                            className="text-[9px] font-black uppercase tracking-widest fill-[var(--on-surface-variant)]"
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            {d.name}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

const InvestmentProfiler: React.FC = () => {
    const { state, setProfile: setGlobalProfile, setStep } = useFinancial();
    const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const visibleQuestions = useMemo(() => QUESTIONS.filter(q => !q.linked), []);

    const finalAnswers = useMemo(() => {
        const base: Partial<QuestionnaireAnswers> = { ...answers };
        if (!state.goal) return base as QuestionnaireAnswers;

        const timeHorizon = mapMonthsToTimeHorizon(state.goal.months);
        const annualIncome = (state.cashFlow?.totalInflow || 5000) * 12;
        const incomePoints = mapIncomeToPoints(annualIncome);
        const stabilityPoints = mapStabilityToPoints(state.payFrequency);
        const netWorthMap: Record<number, number> = { 0: 25000, 2: 75000, 4: 175000, 6: 375000, 8: 750000, 10: 1500000, 12: 3000000 };
        const netWorth = netWorthMap[answers.q7Points || 0] || 50000;
        const concentrationPoints = mapConcentrationToPoints(state.goal.targetAmount - state.goal.currentSavings, netWorth);

        return {
            ...base,
            timeHorizon,
            q4Points: incomePoints,
            q5Points: stabilityPoints,
            q8Points: concentrationPoints
        } as QuestionnaireAnswers;
    }, [answers, state.goal, state.cashFlow, state.payFrequency]);

    const answeredCount = Object.keys(answers).filter(k => !QUESTIONS.find(q => q.id === k)?.linked).length;
    const isComplete = answeredCount === visibleQuestions.length;

    const handleGenerate = async () => {
        if (!isComplete) return;
        setLoading(true);
        try {
            const result = await calculateInvestmentProfile(finalAnswers);
            setGlobalProfile({
                type: result.profile,
                rate: result.returnRate
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (id: string, value: string | number) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
        if (currentStep < visibleQuestions.length - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        }
    };

    const radarData = useMemo(() => {
        const getVal = (id: string) => {
            const val = finalAnswers[id as keyof QuestionnaireAnswers];
            if (typeof val === 'number') return val / 10;
            if (typeof val === 'string') return (val.charCodeAt(0) - 97) / 4;
            return 0.5;
        };

        return {
            viability: (getVal('q5Points') + getVal('q6Points') + getVal('q11Points') + getVal('q14Points')) / 4,
            offensiveness: (getVal('objectives') + getVal('q10Points') + getVal('q15Points')) / 3,
            decision: (getVal('knowledge') + getVal('q12Points') + getVal('q13Points')) / 3,
            endurance: (getVal('timeHorizon') + getVal('q9Points')) / 2,
            adaptability: (getVal('q4Points') + getVal('q7Points') + getVal('q8Points')) / 3,
        };
    }, [finalAnswers]);

    const currentQ = visibleQuestions[currentStep];


    const allocationData = [
        { name: 'Equities', value: state.profile?.type === 'Aggressive' ? 80 : 40, color: '#006a61' },
        { name: 'Fixed Income', value: state.profile?.type === 'Aggressive' ? 15 : 50, color: '#86f2e4' },
        { name: 'Cash', value: 5, color: '#131b2e' },
    ];

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="label-md text-[var(--secondary)] mb-2 uppercase tracking-widest font-bold">Step 3 of 4</div>
                    <h2 className="headline-lg text-[var(--on-surface)]">Investment Profiler</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-[var(--surface-container-low)] rounded-full border border-[var(--outline-variant)] flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[var(--secondary)]" />
                        <span className="text-xs font-bold text-[var(--on-surface)]">Institutional Grade Assessment</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <div className="card p-10 min-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-12">
                            <div className="label-md text-[var(--on-surface-variant)] uppercase tracking-widest font-bold">
                                Question {currentStep + 1} <span className="opacity-40">/ {visibleQuestions.length}</span>
                            </div>
                            <div className="flex gap-2">
                                {visibleQuestions.map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-[var(--secondary)]' : 'w-4 bg-[var(--outline-variant)]'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div key={currentQ.id} className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="headline-md mb-2">{currentQ.label}</h3>
                            <p className="body-lg text-[var(--on-surface-variant)] mb-10">{currentQ.text}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQ.options.map(opt => {
                                    const isSelected = currentQ.type === 'select' 
                                        ? answers[currentQ.id as keyof QuestionnaireAnswers] === opt.id
                                        : answers[currentQ.id as keyof QuestionnaireAnswers] === opt.points;
                                    
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => currentQ.type === 'select' ? handleAnswer(currentQ.id, opt.id) : handleAnswer(currentQ.id, opt.points!)}
                                            className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 flex items-center justify-between group ${
                                                isSelected
                                                    ? 'border-[var(--secondary)] bg-[var(--secondary-container)]'
                                                    : 'border-[var(--outline-variant)] hover:border-[var(--secondary)] hover:bg-[var(--surface-container-low)]'
                                            }`}
                                        >
                                            <span className={`body-md font-bold ${isSelected ? 'text-[var(--on-secondary-container)]' : 'text-[var(--on-surface)]'}`}>
                                                {opt.label}
                                            </span>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                isSelected 
                                                    ? 'border-[var(--secondary)] bg-[var(--secondary)] text-white' 
                                                    : 'border-[var(--outline-variant)] group-hover:border-[var(--secondary)]'
                                            }`}>
                                                {isSelected && <CheckCircle2 className="w-4 h-4" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-12 pt-8 border-t border-[var(--outline-variant)]">
                            <button
                                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                                disabled={currentStep === 0}
                                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] disabled:opacity-0 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous Question
                            </button>
                            
                            {currentStep === visibleQuestions.length - 1 ? (
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || (!answers[currentQ.id as keyof QuestionnaireAnswers] && answers[currentQ.id as keyof QuestionnaireAnswers] !== 0)}
                                    className="btn btn-secondary px-8"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                                    Calculate Strategy
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentStep(prev => Math.min(visibleQuestions.length - 1, prev + 1))}
                                    disabled={!answers[currentQ.id as keyof QuestionnaireAnswers] && answers[currentQ.id as keyof QuestionnaireAnswers] !== 0}
                                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--secondary)] hover:opacity-80 disabled:opacity-0 transition-all"
                                >
                                    Next Question <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                </div>

                <div className="xl:col-span-1 space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="card p-8 bg-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--secondary-container)] opacity-20 blur-3xl -mr-16 -mt-16" />
                        
                        <div className="relative z-10 text-center space-y-8">
                            <div>
                                <div className="label-md text-[var(--on-surface-variant)] mb-2 uppercase tracking-widest font-bold">Strategy Archetype</div>
                                <h3 className="headline-lg text-[var(--secondary)]">{state.profile?.type || 'Determining...'}</h3>
                            </div>

                            <RadarChart data={radarData} />

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <PieIcon className="w-4 h-4 text-[var(--on-surface-variant)]" />
                                    <span className="label-md text-[var(--on-surface-variant)] uppercase tracking-wider font-bold">Asset Allocation</span>
                                </div>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={allocationData}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {allocationData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {allocationData.map(item => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-[10px] font-bold text-[var(--on-surface-variant)]">{item.name}</span>
                                            <span className="text-[10px] font-black ml-auto">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {state.profile && (
                                <button
                                    onClick={() => setStep(4)}
                                    className="w-full btn btn-primary py-5 text-lg group"
                                >
                                    Get Solutions
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="card p-8 bg-[var(--surface-container-low)] border-none space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm text-[var(--secondary)]">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black uppercase">Adaptive Logic</h4>
                                <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed font-medium">
                                    Your time horizon of <span className="text-[var(--on-surface)] font-bold">{state.goal?.months} months</span> has been factored into your risk tolerance scores.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentProfiler;
