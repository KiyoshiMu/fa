import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  Zap,
  Target,
  DollarSign,
  PieChart as PieIcon,
  ChevronRight,
  Info,
  Rocket,
  ChevronLeft
} from 'lucide-react';
import { useFinancial } from '../FinancialContext';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const SolutionsHub: React.FC = () => {
    const { state, setStep } = useFinancial();

    const biWeeklySavings = 2450; // Mock derived from previous steps
    
    const projectionData = useMemo(() => {
        const data = [];
        const monthlySavings = biWeeklySavings * 2.166;
        const target = state.goal?.targetAmount || 150000;
        let current = state.goal?.currentSavings || 25000;
        
        for (let i = 0; i <= 36; i++) {
            data.push({
                month: i === 0 ? 'Start' : i % 12 === 0 ? `${i/12}yr` : '',
                savings: Math.round(current),
                target: target
            });
            current += monthlySavings + (current * (0.055 / 12));
        }
        return data;
    }, [state.goal]);

    return (
        <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--vibrant-teal)] bg-[var(--vibrant-teal)]/10 px-3 py-1 rounded-full">Step 4 of 4</span>
                    <div className="h-px flex-1 bg-[var(--outline-variant)] opacity-30" />
                </div>
                <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                  <div>
                    <h1 className="display-lg text-[var(--on-surface)] mb-2">Final Savings Plan</h1>
                    <p className="body-lg text-[var(--on-surface-variant)] max-w-2xl">
                      Based on your risk profile and goal timeline, we've optimized your trajectory to maximize tax efficiency.
                    </p>
                  </div>
                  <div className="p-6 rounded-3xl glass-dark text-white min-w-[280px] relative overflow-hidden group hover:scale-105 transition-all duration-500 shadow-2xl shadow-[var(--primary-container)]/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--vibrant-teal)] opacity-20 blur-3xl -mr-16 -mt-16" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Recommended Bi-Weekly</p>
                    <div className="text-5xl font-black mb-1">${biWeeklySavings.toLocaleString()}</div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--secondary-container)]">
                      <Zap className="w-3 h-3 fill-current" />
                      8.4% Faster than target
                    </div>
                  </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Projected Net Worth', value: '$842.5k', change: '+12.4%', icon: TrendingUp, color: 'var(--emerald)' },
                { label: 'Mortgage Principal', value: '$600.0k', change: '5.2% Rate', icon: ShieldCheck, color: 'var(--vibrant-teal)' },
                { label: 'Monthly Payment', value: '$3,842', change: 'Est.', icon: Calendar, color: 'var(--amber)' },
                { label: 'Home Equity', value: '24.2%', change: 'At Purchase', icon: PieIcon, color: 'var(--vibrant-teal)' },
              ].map((item, i) => (
                <div key={i} className="card p-6 border-none shadow-md hover:shadow-xl transition-all duration-300 group cursor-default">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] group-hover:bg-[var(--vibrant-teal)] group-hover:text-white transition-all">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-[var(--emerald)] bg-[var(--emerald)]/10 px-2 py-1 rounded-md">{item.change}</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-1">{item.label}</p>
                  <p className="text-2xl font-black text-[var(--on-surface)]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              <div className="xl:col-span-8 space-y-10">
                <section className="card p-8 border-none shadow-lg bg-white">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                      <h3 className="headline-md mb-1">Projection Timeline</h3>
                      <p className="text-xs text-[var(--on-surface-variant)] font-medium">Wealth accumulation over the next 36 months</p>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--vibrant-teal)] shadow-sm shadow-[var(--vibrant-teal)]/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Savings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--outline-variant)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Target</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--vibrant-teal)" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="var(--vibrant-teal)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" opacity={0.2} />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--on-surface-variant)' }}
                        />
                        <YAxis 
                          hide 
                          domain={[0, 'dataMax + 50000']} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '24px', 
                            border: 'none', 
                            boxShadow: 'var(--shadow-lg)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            padding: '16px'
                          }} 
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Projected Savings']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="savings" 
                          stroke="var(--vibrant-teal)" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorSavings)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="target" 
                          stroke="var(--outline-variant)" 
                          strokeWidth={2} 
                          strokeDasharray="8 8"
                          fill="transparent"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="card p-8 border-none bg-[var(--surface-container-low)] relative overflow-hidden group hover:bg-[var(--surface-container)] transition-colors duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--vibrant-teal)] opacity-5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--vibrant-teal)] mb-4">Tax Optimization</h4>
                    <p className="text-sm font-bold text-[var(--on-surface)] mb-6">Maximize your FHSA contributions to save <span className="text-[var(--emerald)]">$2,400</span> in annual taxes.</p>
                    <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--vibrant-teal)] transition-all group/btn">
                      Learn More <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="card p-8 border-none bg-[var(--surface-container-low)] relative overflow-hidden group hover:bg-[var(--surface-container)] transition-colors duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--amber)] opacity-5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--amber)] mb-4">Mortgage Strategy</h4>
                    <p className="text-sm font-bold text-[var(--on-surface)] mb-6">Opt for an accelerated bi-weekly payment to shave <span className="text-[var(--amber)]">4.2 years</span> off your term.</p>
                    <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--amber)] transition-all group/btn">
                      Learn More <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-4 space-y-8">
                <div className="card p-8 bg-white shadow-xl relative border-t-4 border-[var(--vibrant-teal)] flex flex-col min-h-[500px]">
                  <h3 className="headline-md mb-8">Executive Summary</h3>
                  
                  <div className="space-y-8 mb-10">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--surface-container)] flex items-center justify-center text-[var(--vibrant-teal)]">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Target Date</p>
                        <p className="text-sm font-bold text-[var(--on-surface)]">June 2027 (36 months)</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--surface-container)] flex items-center justify-center text-[var(--vibrant-teal)]">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Total Savings Goal</p>
                        <p className="text-sm font-bold text-[var(--on-surface)]">$150,000 (20% Down)</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-[var(--vibrant-teal)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Allocation Insight</span>
                    </div>
                    <p className="text-[10px] text-[var(--on-surface-variant)] leading-relaxed font-medium">
                      Your <span className="text-[var(--on-surface)] font-bold">Moderate</span> strategy allocates 60% to Equities and 40% to Fixed Income, providing a projected 5.5% annual return with limited downside.
                    </p>
                  </div>

                  <div className="mt-auto pt-8">
                    <button className="w-full btn btn-secondary py-5 text-lg shadow-xl shadow-[var(--vibrant-teal)]/20 group">
                      Finalize Journey
                      <Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                        onClick={() => setStep(0)}
                        className="w-full mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all"
                    >
                        Restart Analysis
                    </button>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-white border border-[var(--outline-variant)] flex gap-4 shadow-sm">
                    <div className="p-3 bg-[var(--surface-container-low)] rounded-2xl text-[var(--vibrant-teal)]">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface)]">Bank Ready</h4>
                        <p className="text-[10px] text-[var(--on-surface-variant)] leading-relaxed font-medium">
                            This plan meets the stress-test requirements of major Canadian financial institutions as of Q2 2024.
                        </p>
                    </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-between items-center pt-8 border-t border-[var(--outline-variant)]">
                <button 
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Risk Profiler
                </button>
            </div>
        </div>
    );
};

export default SolutionsHub;
