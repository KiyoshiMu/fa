import React, { useState, useMemo, useEffect } from 'react';
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

const PortfolioChart: React.FC<{ data: number[] }> = ({ data }) => {
    const width = 200;
    const height = 100;
    const margin = { top: 10, right: 5, bottom: 20, left: 25 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const maxVal = 30;
    const minVal = -30;
    const range = maxVal - minVal;
    
    const getY = (val: number) => margin.top + chartHeight - ((val - minVal) / range) * chartHeight;
    const zeroY = getY(0);
    
    return (
        <div className="bg-white/50 p-3 rounded-xl border border-[var(--outline-variant)] mt-4">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                {/* Axes */}
                <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + chartHeight} className="stroke-[var(--on-surface-variant)] stroke-1 opacity-30" />
                <line x1={margin.left} y1={zeroY} x2={width - margin.right} y2={zeroY} className="stroke-[var(--on-surface-variant)] stroke-1 opacity-30" />
                
                {/* Labels */}
                <text x={margin.left - 5} y={getY(20)} className="text-[6px] fill-[var(--on-surface-variant)] opacity-60" textAnchor="end">20%</text>
                <text x={margin.left - 5} y={zeroY} className="text-[6px] fill-[var(--on-surface-variant)] opacity-60" textAnchor="end">0%</text>
                <text x={margin.left - 5} y={getY(-20)} className="text-[6px] fill-[var(--on-surface-variant)] opacity-60" textAnchor="end">-20%</text>
                <text x={width / 2 + margin.left / 2} y={height - 2} className="text-[6px] fill-[var(--on-surface-variant)] font-bold opacity-40" textAnchor="middle">10 Year History</text>

                {/* Bars */}
                {data.map((val, i) => {
                    const barWidth = chartWidth / data.length - 2;
                    const x = margin.left + i * (chartWidth / data.length) + 1;
                    const h = Math.abs(getY(val) - zeroY);
                    const y = val > 0 ? getY(val) : zeroY;
                    
                    return (
                        <rect
                            key={i}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={h}
                            className={`${val > 0 ? 'fill-[var(--vibrant-teal)]' : 'fill-red-400'} opacity-80`}
                            rx="1"
                        />
                    );
                })}
            </svg>
        </div>
    );
};

const PORTFOLIO_DATA: Record<string, number[]> = {
    'Portfolio A': [2, 3, 2, 2, 3, 2, 2, 3, 3, 2],
    'Portfolio B': [5, -3, -4, 8, 4, 1, 6, 4, -5, 4],
    'Portfolio C': [12, -7, -10, 18, 14, 4, 12, 8, -15, 12],
    'Portfolio D': [22, -12, -18, 28, 21, -8, 22, 30, -25, 20],
};

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
  { id: 'annualIncome', type: 'points', label: 'Annual Income', text: 'What is your approximate annual net income?', linked: true, options: [
      { id: 'a', label: '< $20k', points: 0 },
      { id: 'b', label: '$20k - $50k', points: 2 },
      { id: 'c', label: '$50k - $100k', points: 4 },
      { id: 'd', label: '$100k - $150k', points: 5 },
      { id: 'e', label: '$150k - $200k', points: 7 },
      { id: 'f', label: '> $200k', points: 10 },
  ]},
  { id: 'incomeStability', type: 'points', label: 'Income Stability', text: 'How stable do you consider your primary source of income?', linked: true, options: [
      { id: 'a', label: 'Unstable / Seasonal', points: 1 },
      { id: 'b', label: 'Somewhat Stable', points: 4 },
      { id: 'c', label: 'Stable', points: 6 },
      { id: 'd', label: 'Very Stable', points: 8 },
  ]},
  { id: 'financialSituation', type: 'points', label: 'Financial Situation', text: 'Which best describes your current financial situation?', options: [
      { id: 'a', label: 'No savings, high debt', points: 0 },
      { id: 'b', label: 'Little savings, some debt', points: 2 },
      { id: 'c', label: 'Some savings, some debt', points: 5 },
      { id: 'd', label: 'Some savings, little debt', points: 7 },
      { id: 'e', label: 'Significant savings, little debt', points: 10 },
  ]},
  { id: 'netWorth', type: 'points', label: 'Net Worth', text: 'What is your approximate total net worth?', options: [
      { id: 'a', label: '< $50k', points: 0 },
      { id: 'b', label: '$50-100k', points: 2 },
      { id: 'c', label: '$100-250k', points: 4 },
      { id: 'd', label: '$250-500k', points: 6 },
      { id: 'e', label: '$500k-1M', points: 8 },
      { id: 'f', label: '$1-2M', points: 10 },
      { id: 'g', label: '> $2M', points: 12 },
  ]},
  { id: 'concentration', type: 'points', label: 'Portfolio Concentration', text: 'What percentage of your total investable assets will this investment represent?', linked: true, options: [
      { id: 'a', label: '> 75%', points: 2 },
      { id: 'b', label: '50% - 75%', points: 4 },
      { id: 'c', label: '25% - 50%', points: 5 },
      { id: 'd', label: '< 25%', points: 10 },
  ]},
  { id: 'ageGroup', type: 'points', label: 'Age Group', text: 'What is your age group?', options: [
      { id: 'a', label: 'Under 35', points: 20 },
      { id: 'b', label: '35-54', points: 8 },
      { id: 'c', label: '55-64', points: 3 },
      { id: 'd', label: '65+', points: 1 },
  ]},
  { id: 'riskTolerance', type: 'points', label: 'Risk Attitude', text: 'How would you describe your attitude toward risk?', options: [
      { id: 'a', label: 'Very Conservative', points: 0 },
      { id: 'b', label: 'Conservative', points: 4 },
      { id: 'c', label: 'Moderate', points: 6 },
      { id: 'd', label: 'Aggressive', points: 10 },
  ]},
  { id: 'tolerableLoss', type: 'points', label: 'Tolerable Loss', text: 'How much market decline can you tolerate for a year?', options: [
      { id: 'a', label: '0%', points: 0 },
      { id: 'b', label: '-3%', points: 3 },
      { id: 'c', label: '-10%', points: 6 },
      { id: 'd', label: '-20%', points: 8 },
      { id: 'e', label: '> -20%', points: 10 },
  ]},
  { id: 'psychology', type: 'points', label: 'Psychology', text: 'Do you prioritize avoiding loss or achieving gains?', options: [
      { id: 'a', label: 'Always avoid loss', points: 0 },
      { id: 'b', label: 'Generally avoid loss', points: 3 },
      { id: 'c', label: 'Generally achieve gains', points: 6 },
      { id: 'd', label: 'Always achieve gains', points: 10 },
  ]},
  { id: 'outcomeAcceptability', type: 'points', label: 'Outcome Acceptability', text: 'Which $1,000 investment outcome is most acceptable?', options: [
      { id: 'a', label: '$0 to $200 gain', points: 0 },
      { id: 'b', label: '-$200 to $500 gain/loss', points: 3 },
      { id: 'c', label: '-$800 to $1,200 gain/loss', points: 6 },
      { id: 'd', label: '-$2,000 to $2,500 gain/loss', points: 10 },
  ]},
  { id: 'marketDrop', type: 'points', label: 'Market Drop Reaction', text: 'If the market drops 20%, what would you do?', options: [
      { id: 'a', label: 'Sell all', points: 0 },
      { id: 'b', label: 'Sell a portion', points: 3 },
      { id: 'c', label: 'Hold', points: 5 },
      { id: 'd', label: 'Buy more', points: 10 },
  ]},
  { id: 'historicalComfort', type: 'points', label: 'Historical Comfort', text: 'Which historical portfolio volatility feels right?', options: [
      { id: 'a', label: 'Portfolio A: Low volatility (Safety)', points: 0 },
      { id: 'b', label: 'Portfolio B: Moderate volatility (Balanced growth)', points: 4 },
      { id: 'c', label: 'Portfolio C: High volatility (Aggressive growth)', points: 6 },
      { id: 'd', label: 'Portfolio D: Very high volatility (Maximum growth)', points: 10 },
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
    const { state, setProfile: setGlobalProfile, setStep, setProfilerAnswers, setProfilerStep } = useFinancial();
    const answers = state.profilerAnswers;
    const currentStep = state.profilerStep;

    // Pre-fill linked questions based on state if not already answered
    useEffect(() => {
        if (Object.keys(answers).length === 0) {
            const initial: Partial<QuestionnaireAnswers> = {};
            
            // Q1: Time Horizon
            if (state.goal?.months) {
                initial.timeHorizon = mapMonthsToTimeHorizon(state.goal.months);
            }
            
            // Q4: Income
            if (state.cashFlow?.totalInflow) {
                initial.annualIncome = mapIncomeToPoints(state.cashFlow.totalInflow * 12);
            }
            
            // Q5: Stability
            if (state.payFrequency) {
                initial.incomeStability = mapStabilityToPoints(state.payFrequency);
            }
            
            // Q8: Concentration
            const estimatedNetWorth = 500000; 
            if (state.goal?.targetAmount) {
                initial.concentration = mapConcentrationToPoints(state.goal.targetAmount, estimatedNetWorth);
            }
            
            setProfilerAnswers(initial);
        }
    }, [state.goal, state.cashFlow, state.payFrequency, answers, setProfilerAnswers]);

    const [loading, setLoading] = useState(false);

    const visibleQuestions = useMemo(() => QUESTIONS.filter(q => !q.linked), []);
    const currentQ = visibleQuestions[currentStep];

    const radarData = useMemo(() => {
        const getPoints = (ids: string[]) => {
            const sum = ids.reduce((acc, id) => {
                const val = answers[id as keyof QuestionnaireAnswers];
                return acc + (typeof val === 'number' ? val : 0);
            }, 0);
            return Math.min(1, sum / (ids.length * 10 || 1));
        };

        return {
            endurance: getPoints(['annualIncome', 'incomeStability', 'financialSituation', 'netWorth', 'concentration', 'ageGroup']),
            offensiveness: getPoints(['riskTolerance', 'marketDrop', 'psychology']),
            adaptability: (['a', 'b', 'c', 'd', 'e'].indexOf(answers.knowledge || 'a') + 1) / 5,
            decision: getPoints(['tolerableLoss', 'historicalComfort', 'outcomeAcceptability']),
            viability: (['a', 'b', 'c', 'd', 'e'].indexOf(answers.timeHorizon || 'a') + 1) / 5,
        };
    }, [answers]);

    const handleAnswer = (id: string, value: string | number) => {
        setProfilerAnswers({ ...answers, [id]: value });
        // Automatic progression for a smoother "wizard" experience
        setTimeout(() => {
            handleNext();
        }, 300);
    };

    const handleNext = () => {
        if (currentStep < visibleQuestions.length - 1) {
            setProfilerStep(currentStep + 1);
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
                                                <div className="space-y-1 w-full">
                                                    <span className="text-sm font-bold text-[var(--on-surface)]">{opt.label}</span>
                                                    {opt.desc && <p className="text-xs text-[var(--on-surface-variant)] font-medium leading-relaxed">{opt.desc}</p>}
                                                    {currentQ.id === 'historicalComfort' && (
                                                        <PortfolioChart data={PORTFOLIO_DATA[opt.label.split(':')[0]] || []} />
                                                    )}
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
                            onClick={() => setProfilerStep(Math.max(0, currentStep - 1))}
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
