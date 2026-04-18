import React, { useState, useEffect } from 'react';
import { calculateInvestmentProfile } from '../lib/api';
import type { QuestionnaireAnswers, InvestmentProfile } from '../lib/api';
import { Loader2, Info, ChevronRight, CheckCircle2, ChevronLeft } from 'lucide-react';

const QUESTIONS = [
  { id: 'timeHorizon', type: 'select', label: 'Time Horizon', text: 'When do you plan to buy your home? (or reach your goal)', options: [
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
  { id: 'q4Points', type: 'points', label: 'Annual Income', text: 'What is your total annual household income?', options: [
      { id: 'a', label: '< $20k', points: 0 },
      { id: 'b', label: '$20-50k', points: 2 },
      { id: 'c', label: '$50-100k', points: 4 },
      { id: 'd', label: '$100-150k', points: 5 },
      { id: 'e', label: '$150-200k', points: 7 },
      { id: 'f', label: '> $200k', points: 10 },
  ]},
  { id: 'q5Points', type: 'points', label: 'Income Stability', text: 'How stable is your current source of income?', options: [
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
  { id: 'q8Points', type: 'points', label: 'Concentration', text: 'What % of your portfolio is this investment?', options: [
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

const InvestmentProfiler: React.FC = () => {
    const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});
    const [currentStep, setCurrentStep] = useState(0);
    const [isWizard, setIsWizard] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsWizard(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const answeredCount = Object.keys(answers).length;
    const isComplete = answeredCount === QUESTIONS.length;

    const [profile, setProfile] = useState<{ profile: InvestmentProfile; returnRate: number; monthlyYield: number } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!isComplete) return;
        setLoading(true);
        try {
            const result = await calculateInvestmentProfile(answers as QuestionnaireAnswers);
            setProfile(result);
            // On mobile, scroll to results
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
        if (isWizard && currentStep < QUESTIONS.length - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        }
    };

    const handlePointChange = (id: string, value: number) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
        if (isWizard && currentStep < QUESTIONS.length - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        }
    };

    const renderQuestion = (q: typeof QUESTIONS[0], idx: number) => (
        <div key={q.id} className="glass-card p-6 border border-white/5 hover:border-white/10 transition-all duration-500 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-start gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary-500/10 text-primary-400 text-sm font-bold border border-primary-500/20">
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
                                : answers[q.id as keyof QuestionnaireAnswers] === (opt as any).points;
                            
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => q.type === 'select' ? handleSelectChange(q.id, opt.id) : handlePointChange(q.id, (opt as any).points)}
                                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-primary-600/20 border-primary-500 text-primary-400 shadow-[0_0_15px_rgba(14,165,233,0.1)]'
                                            : 'bg-white/5 border-white/5 text-foreground/40 hover:bg-white/10 hover:border-white/20'
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
                    <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Investment Profiler</h2>
                    <p className="text-foreground/60 max-w-2xl text-sm italic">
                        Determine your risk tolerance and find the optimal investment strategy.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {isWizard ? (
                        <div className="space-y-6">
                            {renderQuestion(QUESTIONS[currentStep], currentStep)}
                            <div className="flex items-center justify-between gap-4 p-4 glass-card bg-white/5">
                                <button
                                    disabled={currentStep === 0}
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white/40 hover:text-white disabled:opacity-0 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                                    Step {currentStep + 1} of {QUESTIONS.length}
                                </div>
                                <button
                                    disabled={currentStep === QUESTIONS.length - 1 || !answers[QUESTIONS[currentStep].id as keyof QuestionnaireAnswers] && answers[QUESTIONS[currentStep].id as keyof QuestionnaireAnswers] !== 0}
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        QUESTIONS.map((q, idx) => renderQuestion(q, idx))
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-8 space-y-6">
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !isComplete}
                            className="w-full relative group px-8 py-5 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-[0.15em] rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(2,132,199,0.3)] hover:shadow-[0_0_30px_rgba(2,132,199,0.5)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            )}
                            {isComplete ? 'Generate Profile' : 'Incomplete'}
                        </button>

                        {profile ? (
                            <div className="glass-card p-8 border-primary-500/30 bg-primary-500/5 overflow-hidden relative animate-in zoom-in-95 duration-500">
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl opacity-50" />
                                
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-3 text-primary-400 text-sm font-black uppercase tracking-widest">
                                        <div className="w-8 h-[2px] bg-primary-500 shadow-[0_0_10px_rgba(14,165,233,1)]" />
                                        Your Result
                                    </div>
                                    
                                    <div>
                                        <div className="text-foreground/50 text-xs mb-1 uppercase font-bold tracking-tighter">Recommended Profile</div>
                                        <div className="text-4xl font-black bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent italic">
                                            {profile.profile}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-foreground/30 font-bold uppercase tracking-tighter">Annual Return (EST)</div>
                                            <div className="text-2xl font-black text-green-400">
                                                {(profile.returnRate * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-foreground/30 font-bold uppercase tracking-tighter">Monthly Yield</div>
                                            <div className="text-2xl font-black text-primary-400">
                                                {(profile.monthlyYield * 100).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 text-[10px] text-foreground/40 italic leading-relaxed">
                                        <Info className="w-3 h-3 mb-2 opacity-50" />
                                        illustrative purposes only. Actual results will vary based on market conditions.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card p-12 border-white/5 flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                    <Info className="w-8 h-8 text-foreground/10" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground/20 leading-tight">Evaluation Pending</h3>
                                <p className="text-xs text-foreground/20 italic">Questionnaire data required to generate risk profile.</p>
                            </div>
                        )}

                        <div className="glass-card p-6 border-white/5 bg-white/2">
                            <h4 className="text-[10px] font-black text-foreground/40 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                <CheckCircle2 className="w-4 h-4 text-primary-500/50" />
                                Progress Tracking
                            </h4>
                            <div className="space-y-4">
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-primary-600 to-blue-400 transition-all duration-500" 
                                        style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                                    <span>{answeredCount} / {QUESTIONS.length} Complete</span>
                                    <span>{answeredCount === QUESTIONS.length ? 'Finalized' : 'In Progress'}</span>
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
