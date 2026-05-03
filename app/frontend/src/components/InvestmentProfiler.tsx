import React, { useState, useEffect, useMemo } from 'react';
import { calculateInvestmentProfile } from '../lib/api';
import type { QuestionnaireAnswers } from '../lib/api';
import { Loader2, ChevronRight, CheckCircle2, ChevronLeft, ArrowRight, Compass, Target, Zap, Anchor, Activity } from 'lucide-react';
import { useFinancial } from '../FinancialContext';
import { mapMonthsToTimeHorizon, mapIncomeToPoints, mapStabilityToPoints, mapConcentrationToPoints } from '../lib/mortgageUtils';

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

    const size = 300;
    const center = size / 2;
    const radius = size * 0.4;
    const angleStep = (Math.PI * 2) / dimensions.length;

    const points = dimensions.map((d, i) => {
        const val = data[d.key] || 0.5; // normalized 0-1
        const x = center + radius * val * Math.sin(i * angleStep);
        const y = center - radius * val * Math.cos(i * angleStep);
        return `${x},${y}`;
    }).join(' ');

    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

    return (
        <div className="relative flex flex-col items-center">
            <svg width={size} height={size} className="overflow-visible drop-shadow-2xl">
                {/* Grids */}
                {gridLevels.map(level => (
                    <polygon
                        key={level}
                        points={dimensions.map((_, i) => {
                            const x = center + radius * level * Math.sin(i * angleStep);
                            const y = center - radius * level * Math.cos(i * angleStep);
                            return `${x},${y}`;
                        }).join(' ')}
                        className="fill-transparent stroke-foreground/5"
                    />
                ))}
                
                {/* Axis lines */}
                {dimensions.map((_, i) => (
                    <line
                        key={i}
                        x1={center} y1={center}
                        x2={center + radius * Math.sin(i * angleStep)}
                        y2={center - radius * Math.cos(i * angleStep)}
                        className="stroke-foreground/5"
                    />
                ))}

                {/* Data Polygon */}
                <polygon
                    points={points}
                    className="fill-primary-500/20 stroke-primary-500 stroke-2 transition-all duration-1000"
                />

                {/* Labels */}
                {dimensions.map((d, i) => {
                    const offset = i === 0 ? 30 : 40; // More offset for side labels
                    const x = center + (radius + offset) * Math.sin(i * angleStep);
                    const y = center - (radius + offset) * Math.cos(i * angleStep);
                    return (
                        <text
                            key={d.key}
                            x={x} y={y}
                            className="text-[11px] font-black uppercase tracking-widest fill-foreground/60"
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            {d.name}
                        </text>
                    );
                })}
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center backdrop-blur-md shadow-2xl">
                    <Compass className="w-8 h-8 text-primary-500 animate-pulse" />
                </div>
            </div>
        </div>
    );
};

const InvestmentProfiler: React.FC = () => {
    const { state, setProfile: setGlobalProfile, setStep } = useFinancial();
    const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});
    const [currentStep, setCurrentStep] = useState(0);
    const [isWizard, setIsWizard] = useState(false);
    const [loading, setLoading] = useState(false);

    // Filter visible questions
    const visibleQuestions = useMemo(() => QUESTIONS.filter(q => !q.linked), []);

    // Combined final answers (State + Derived)
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

    useEffect(() => {
        const handleResize = () => setIsWizard(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            if (isWizard) {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (id: string, value: string) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
        if (isWizard && currentStep < visibleQuestions.length - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        }
    };

    const handlePointChange = (id: string, value: number) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
        if (isWizard && currentStep < visibleQuestions.length - 1) {
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

    const renderQuestion = (q: typeof QUESTIONS[0], idx: number) => (
        <div key={q.id} className="glass-card p-6 border border-border hover:border-border/60 transition-all duration-500 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-start gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary-500/5 text-primary-500 text-sm font-bold border border-primary-500/10">
                    {idx + 1}
                </span>
                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-foreground/90">{q.label}</h3>
                        <p className="text-sm text-foreground/50 mt-1">{q.text}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {q.options.map(opt => {
                            const isSelected = q.type === 'select' 
                                ? answers[q.id as keyof QuestionnaireAnswers] === opt.id
                                : answers[q.id as keyof QuestionnaireAnswers] === opt.points;
                            
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => q.type === 'select' ? handleSelectChange(q.id, opt.id) : handlePointChange(q.id, opt.points!)}
                                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-primary-500/10 border-primary-500 text-primary-500 shadow-[0_0_15px_rgba(14,165,233,0.1)]'
                                            : 'bg-secondary border-border text-foreground/40 hover:bg-secondary/80 hover:border-border/60'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Step 3: Risk Profiler</h2>
                    <p className="text-foreground/60 max-w-2xl text-sm italic">
                        Your strategy is automatically adapting to your goals. Complete the remaining profile questions below.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {isWizard ? (
                        <div className="space-y-6">
                            {renderQuestion(visibleQuestions[currentStep], currentStep)}
                            <div className="flex items-center justify-between gap-4 p-4 glass-card bg-secondary/40">
                                <button
                                    disabled={currentStep === 0}
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-foreground/40 hover:text-foreground disabled:opacity-0 transition-all font-mono"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                                    Step {currentStep + 1} of {visibleQuestions.length}
                                </div>
                                <button
                                    disabled={currentStep === visibleQuestions.length - 1 || (!answers[visibleQuestions[currentStep].id as keyof QuestionnaireAnswers] && answers[visibleQuestions[currentStep].id as keyof QuestionnaireAnswers] !== 0)}
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-foreground/40 hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all font-mono"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        visibleQuestions.map((q, idx) => renderQuestion(q, idx))
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-8 space-y-6">
                        <div className="glass-card p-10 bg-gradient-to-br from-primary-500/5 to-secondary/30 border-primary-500/10">
                            <h4 className="text-[10px] font-black text-foreground/40 mb-8 uppercase tracking-[0.2em] text-center">Live Risk Archetype</h4>
                            <RadarChart data={radarData} />
                        </div>

                        {!state.profile ? (
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !isComplete}
                                className="w-full relative group px-8 py-5 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-[0.15em] rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(224,242,254,0.1)] hover:shadow-primary-500/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                )}
                                {isComplete ? 'Calculate Strategy' : 'Incomplete'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setStep(4)}
                                className="w-full relative group px-8 py-5 bg-foreground text-background font-black uppercase tracking-[0.15em] rounded-2xl transition-all duration-300 shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-2 overflow-hidden"
                            >
                                Get Final Recommendation <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </button>
                        )}

                        <div className="glass-card p-6 border-border/40 bg-secondary/20">
                            <h4 className="text-[10px] font-black text-foreground/40 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                <CheckCircle2 className="w-4 h-4 text-primary-500/50" />
                                Progress Tracking
                            </h4>
                            <div className="space-y-4">
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-primary-600 to-blue-500 transition-all duration-500" 
                                        style={{ width: `${(answeredCount / visibleQuestions.length) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                                    <span>{answeredCount} / {visibleQuestions.length} Complete</span>
                                    <span>{answeredCount === visibleQuestions.length ? 'Finalized' : 'In Progress'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentProfiler;
