import React, { useState, useMemo } from 'react';
import type { QuestionnaireAnswers } from '../lib/api';
import { calculateInvestmentProfile } from '../lib/api';
import { 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  Shield,
  Activity
} from 'lucide-react';
import { useFinancial } from '../FinancialContext';
import { 
  mapMonthsToTimeHorizon, 
  mapIncomeToPoints, 
  mapStabilityToPoints, 
  mapConcentrationToPoints 
} from '../lib/mortgageUtils';

interface QuestionOption {
  id: string;
  label: string;
  desc?: string;
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
      { id: 'a', label: 'Novice', desc: 'Very little experience with investments.' },
      { id: 'b', label: 'Basic', desc: 'Some understanding of stocks and bonds.' },
      { id: 'c', label: 'Average', desc: 'Regular investor with decent knowledge.' },
      { id: 'd', label: 'Above Average', desc: 'Confident in managing complex portfolios.' },
      { id: 'e', label: 'Advanced', desc: 'Expert level knowledge and experience.' },
  ]},
  { id: 'objectives', type: 'select', label: 'Primary Goal', text: 'What is your primary goal for this investment?', options: [
      { id: 'a', label: 'Safety', desc: 'Protect principal at all costs.' },
      { id: 'b', label: 'Income', desc: 'Generate regular payments from portfolio.' },
      { id: 'c', label: 'Balanced', desc: 'Mix of income and long-term growth.' },
      { id: 'd', label: 'Growth', desc: 'Maximize long-term capital gains.' },
  ]},
  { id: 'q4Points', type: 'points', label: 'Investment Experience', text: 'How many years of experience do you have with stock market investments?', options: [
      { id: 'a', label: '0 - 1 years', points: 0 },
      { id: 'b', label: '1 - 3 years', points: 3 },
      { id: 'c', label: '3 - 5 years', points: 5 },
      { id: 'd', label: '5 - 10 years', points: 7 },
      { id: 'e', label: '10+ years', points: 10 },
  ]},
  { id: 'q5Points', type: 'points', label: 'Annual Income', text: 'What is your approximate annual net income?', linked: true, options: [
      { id: 'a', label: '< $20k', points: 0 },
      { id: 'b', label: '$20k - $50k', points: 2 },
      { id: 'c', label: '$50k - $100k', points: 4 },
      { id: 'd', label: '$100k - $150k', points: 5 },
      { id: 'e', label: '$150k - $200k', points: 7 },
      { id: 'f', label: '> $200k', points: 10 },
  ]},
  { id: 'q6Points', type: 'points', label: 'Income Stability', text: 'How stable do you consider your primary source of income?', linked: true, options: [
      { id: 'a', label: 'Unstable / Seasonal', points: 1 },
      { id: 'b', label: 'Somewhat Stable', points: 4 },
      { id: 'c', label: 'Stable', points: 6 },
      { id: 'd', label: 'Very Stable', points: 8 },
  ]},
  { id: 'q7Points', type: 'points', label: 'Net Worth', text: 'Excluding your primary residence, what is your total net worth?', options: [
      { id: 'a', label: '< $50k', points: 0 },
      { id: 'b', label: '$50k - $200k', points: 3 },
      { id: 'c', label: '$200k - $500k', points: 6 },
      { id: 'd', label: '$500k - $1M', points: 8 },
      { id: 'e', label: '> $1M', points: 10 },
  ]},
  { id: 'q8Points', type: 'points', label: 'Portfolio Concentration', text: 'What percentage of your total investable assets will this investment represent?', linked: true, options: [
      { id: 'a', label: '> 75%', points: 2 },
      { id: 'b', label: '50% - 75%', points: 4 },
      { id: 'c', label: '25% - 50%', points: 5 },
      { id: 'd', label: '< 25%', points: 10 },
  ]},
  { id: 'q9Points', type: 'points', label: 'Liquid Assets', text: 'If you had an emergency, how long could you sustain your lifestyle with your current liquid assets?', options: [
      { id: 'a', label: '< 1 month', points: 0 },
      { id: 'b', label: '1 - 3 months', points: 3 },
      { id: 'c', label: '3 - 6 months', points: 6 },
      { id: 'd', label: '6 - 12 months', points: 8 },
      { id: 'e', label: '> 12 months', points: 10 },
  ]},
  { id: 'q10Points', type: 'points', label: 'Risk Attitude', text: 'How would you describe your general attitude toward financial risk?', options: [
      { id: 'a', label: 'Very Conservative', points: 0 },
      { id: 'b', label: 'Conservative', points: 4 },
      { id: 'c', label: 'Moderate', points: 6 },
      { id: 'd', label: 'Aggressive', points: 10 },
  ]},
  { id: 'q11Points', type: 'points', label: 'Tolerable Loss', text: 'What is the maximum decline you could tolerate in your portfolio over a single year?', options: [
      { id: 'a', label: '0%', points: 0 },
      { id: 'b', label: '-5%', points: 3 },
      { id: 'c', label: '-10%', points: 6 },
      { id: 'd', label: '-20%', points: 8 },
      { id: 'e', label: '> -20%', points: 10 },
  ]},
  { id: 'q12Points', type: 'points', label: 'Portfolio Volatility', text: 'Which of the following scenarios would you be most comfortable with over a 12-month period?', options: [
      { id: 'a', label: 'Small gain (2%), no loss', points: 0 },
      { id: 'b', label: 'Medium gain (5%), small loss (-2%)', points: 4 },
      { id: 'c', label: 'Large gain (12%), medium loss (-8%)', points: 7 },
      { id: 'd', label: 'Extreme gain (25%), extreme loss (-20%)', points: 10 },
  ]},
  { id: 'q13Points', type: 'points', label: 'Investment Decision', text: 'When making an investment decision, you are most concerned with:', options: [
      { id: 'a', label: 'Potential for loss', points: 0 },
      { id: 'b', label: 'Both loss and gain equally', points: 5 },
      { id: 'c', label: 'Potential for gain', points: 10 },
  ]},
  { id: 'q14Points', type: 'points', label: 'Market Drop Reaction', text: 'How would you react to a 20% market drop in your portfolio over a short period?', options: [
      { id: 'a', label: 'Sell everything immediately', desc: 'I prioritize preserving whatever capital is left over potential future recoveries.', points: 0 },
      { id: 'b', label: 'Sell a portion to secure cash', desc: "I'd reduce exposure but keep some investments active to mitigate total loss.", points: 3 },
      { id: 'c', label: 'Do nothing and wait', desc: 'I understand markets fluctuate and prefer to stick to the original long-term plan.', points: 5 },
      { id: 'd', label: 'Buy more at a discount', desc: 'I see market drops as an opportunity to increase holdings at lower prices.', points: 10 },
  ]},
  { id: 'q15Points', type: 'points', label: 'Investment Philosophy', text: 'Do you believe that high returns always come with high risk?', options: [
      { id: 'a', label: 'No, I want high returns with no risk', points: 0 },
      { id: 'b', label: 'I accept some risk for some return', points: 5 },
      { id: 'c', label: 'Yes, I fully accept risk for high returns', points: 10 },
  ]},
];

const RadarChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
    const dimensions = [
        { name: 'Endurance', key: 'endurance' },
        { name: 'Offensiveness', key: 'offensiveness' },
        { name: 'Adaptability', key: 'adaptability' },
        { name: 'Decision', key: 'decision' },
        { name: 'Viability', key: 'viability' },
    ];

    const size = 280;
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
                        className="fill-transparent stroke-[var(--outline-variant)] stroke-1 opacity-50"
                    />
                ))}
                
                {dimensions.map((_, i) => (
                    <line
                        key={i}
                        x1={center} y1={center}
                        x2={center + radius * Math.sin(i * angleStep)}
                        y2={center - radius * Math.cos(i * angleStep)}
                        className="stroke-[var(--outline-variant)] stroke-1 opacity-50"
                    />
                ))}

                <polygon
                    points={points}
                    className="fill-[var(--vibrant-teal)] fill-opacity-20 stroke-[var(--vibrant-teal)] stroke-2 transition-all duration-1000"
                />

                {dimensions.map((d, i) => {
                    const offset = 35;
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
    
    // Pre-fill linked questions based on state
    const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>(() => {
        const initial: Partial<QuestionnaireAnswers> = {};
        
        // Q1: Time Horizon
        if (state.goal?.months) {
            initial.timeHorizon = mapMonthsToTimeHorizon(state.goal.months);
        }
        
        // Q5: Income
        if (state.cashFlow?.totalInflow) {
            initial.q5Points = mapIncomeToPoints(state.cashFlow.totalInflow * 12);
        }
        
        // Q6: Stability
        if (state.payFrequency) {
            initial.q6Points = mapStabilityToPoints(state.payFrequency);
        }
        
        // Q8: Concentration
        // Note: netWorth is not in state yet, but we'll use a placeholder or add it later
        // For now, let's assume 1M if not provided to avoid crash, or just skip
        const estimatedNetWorth = 500000; 
        if (state.goal?.targetAmount) {
            initial.q8Points = mapConcentrationToPoints(state.goal.targetAmount, estimatedNetWorth);
        }
        
        return initial;
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const visibleQuestions = useMemo(() => QUESTIONS.filter(q => !q.linked), []);
    const currentQ = visibleQuestions[currentStep];

    const radarData = useMemo(() => {
        // Dynamic radar calculation based on answers
        const getPoints = (ids: string[]) => {
            const sum = ids.reduce((acc, id) => {
                const val = answers[id as keyof QuestionnaireAnswers];
                return acc + (typeof val === 'number' ? val : 0);
            }, 0);
            return Math.min(1, sum / (ids.length * 10 || 1));
        };

        return {
            endurance: getPoints(['q4Points', 'q5Points', 'q6Points', 'q7Points', 'q8Points', 'q9Points']),
            offensiveness: getPoints(['q10Points', 'q14Points', 'q15Points']),
            adaptability: (['a', 'b', 'c', 'd', 'e'].indexOf(answers.knowledge || 'a') + 1) / 5,
            decision: getPoints(['q11Points', 'q12Points', 'q13Points']),
            viability: (['a', 'b', 'c', 'd', 'e'].indexOf(answers.timeHorizon || 'a') + 1) / 5,
        };
    }, [answers]);

    const handleAnswer = (id: string, value: string | number) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
        // Automatic progression for a smoother "wizard" experience
        setTimeout(() => {
            handleNext();
        }, 300);
    };

    const handleNext = () => {
        if (currentStep < visibleQuestions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleGenerate();
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await calculateInvestmentProfile(answers as QuestionnaireAnswers);
            setGlobalProfile({ type: result.profile, rate: result.returnRate });
            setStep(4);
        } catch (error) {
            console.error('Profile calculation failed:', error);
            // Fallback for demo purposes if backend fails
            setGlobalProfile({ type: 'Moderate', rate: 0.055 });
            setStep(4);
        } finally {
            setLoading(false);
        }
    };

    const progress = ((currentStep + 1) / visibleQuestions.length) * 100;

    return (
        <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--vibrant-teal)] bg-[var(--vibrant-teal)]/10 px-3 py-1 rounded-full">Step 3: Investment Profiler</span>
                    <div className="h-px flex-1 bg-[var(--outline-variant)] opacity-30" />
                </div>
                <div className="flex justify-between items-end mb-4">
                  <h1 className="headline-lg text-[var(--on-surface)]">Question {currentStep + 1} of {visibleQuestions.length}</h1>
                  <span className="text-xs font-black text-[var(--on-surface-variant)]">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--surface-container)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--vibrant-teal)] transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-8 space-y-8">
                    <div className="card p-12 min-h-[600px] flex flex-col justify-center">
                        <div key={currentQ.id} className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="headline-md mb-4 leading-tight">{currentQ.text}</h2>
                            <p className="body-md text-[var(--on-surface-variant)] mb-12">
                                Consider a hypothetical scenario where global events cause a sudden downturn. Your response helps us gauge your natural risk tolerance.
                            </p>

                            <div className="space-y-4">
                                {currentQ.options.map(opt => {
                                    const value = currentQ.type === 'select' ? opt.id : opt.points;
                                    const isSelected = answers[currentQ.id as keyof QuestionnaireAnswers] === value;
                                    
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleAnswer(currentQ.id, value!)}
                                            className={`radio-card w-full text-left ${isSelected ? 'active' : 'bg-white border-[var(--outline-variant)] hover:border-[var(--vibrant-teal)]/50'}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="radio-circle mt-1 flex-shrink-0">
                                                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-sm font-bold text-[var(--on-surface)]">{opt.label}</span>
                                                    {opt.desc && <p className="text-xs text-[var(--on-surface-variant)] font-medium leading-relaxed">{opt.desc}</p>}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <button
                            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                            disabled={currentStep === 0}
                            className="btn btn-outline px-8 rounded-xl border-[var(--outline-variant)] text-[var(--on-surface-variant)] disabled:opacity-0"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        
                        <button
                            onClick={handleNext}
                            disabled={loading || (answers[currentQ.id as keyof QuestionnaireAnswers] === undefined)}
                            className="btn btn-secondary px-10 rounded-xl shadow-lg shadow-[var(--vibrant-teal)]/20"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                  {currentStep === visibleQuestions.length - 1 ? 'Complete Assessment' : 'Next Question'}
                                  <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Sidebar Risk Preview */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="card p-8 bg-white border-2 border-[var(--vibrant-teal)]/5 shadow-lg text-center">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Activity className="w-4 h-4 text-[var(--vibrant-teal)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Risk Profile Preview</span>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-2xl font-black text-[#006f66]">Moderate</h3>
                            <p className="text-xs font-bold text-[var(--on-surface-variant)] opacity-60">~5.5% Expected Return</p>
                        </div>

                        <RadarChart data={radarData} />

                        <div className="p-6 rounded-2xl bg-[var(--surface-container-low)] text-left mt-8">
                            <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed font-medium">
                                As you answer questions, this chart adapts in real-time. A <span className="text-[var(--on-surface)] font-bold">Moderate</span> profile seeks a balance between capital preservation and long-term growth, accepting measured short-term volatility.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-white border border-[var(--outline-variant)] flex gap-4">
                        <div className="p-3 bg-[var(--surface-container-low)] rounded-2xl text-[var(--vibrant-teal)]">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface)]">Institutional Compliance</h4>
                            <p className="text-[10px] text-[var(--on-surface-variant)] leading-relaxed font-medium">
                                This assessment follows standard KYC (Know Your Client) guidelines to ensure your investment strategy aligns with your unique financial situation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentProfiler;
