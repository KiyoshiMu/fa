import React from 'react';
import { 
  ArrowUpRight, 
  MoreHorizontal, 
  CheckCircle2, 
  Edit2,
  ChevronRight,
  Plus,
  Zap
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useFinancial } from '../FinancialContext';

const netWorthData = [
  { month: 'Jan', value: 45000 },
  { month: 'Feb', value: 48000 },
  { month: 'Mar', value: 52000 },
  { month: 'Apr', value: 58000 },
  { month: 'May', value: 62000 },
  { month: 'Jun', value: 75000 },
  { month: 'Jul', value: 85240 },
];

const Dashboard: React.FC = () => {
  const { setStep } = useFinancial();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--vibrant-teal)] bg-[var(--vibrant-teal)]/10 px-3 py-1 rounded-full">Overview</span>
          </div>
          <h2 className="display-lg text-[var(--on-surface)]">Welcome back, Sarah.</h2>
          <p className="body-lg text-[var(--on-surface-variant)]">Here is an overview of your financial progress today.</p>
        </div>
        <button className="btn btn-secondary shadow-xl shadow-[var(--vibrant-teal)]/20 px-8 py-4">
          Schedule Review
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Net Worth Chart */}
        <div className="lg:col-span-2 card p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--vibrant-teal)] opacity-5 blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-2">Current Net Worth</p>
              <div className="flex items-end gap-4">
                <h3 className="text-5xl font-black text-[var(--on-surface)]">$85,240</h3>
                <div className="flex items-center gap-1 text-[var(--emerald)] bg-[var(--emerald)]/10 px-3 py-1.5 rounded-xl text-xs font-bold mb-1 border border-[var(--emerald)]/10">
                  <ArrowUpRight className="w-3 h-3" />
                  2.4% this month
                </div>
              </div>
            </div>
            <button className="p-3 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] rounded-2xl transition-all">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>

          <div className="h-72 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--vibrant-teal)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--vibrant-teal)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" opacity={0.2} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--on-surface-variant)', fontSize: 10, fontWeight: 700}}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-sans)', fontWeight: 'bold'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--vibrant-teal)" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wealth Insight Card */}
        <div className="bg-[var(--primary-container)] rounded-[var(--radius-xl)] p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-[var(--primary-container)]/30 group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--vibrant-teal)] opacity-10 blur-[60px] -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-1000"></div>
          
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-white/10 text-[var(--secondary-container)]">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-primary-container)]">Wealth Insight</span>
            </div>
            <h4 className="headline-md text-3xl mb-4 leading-tight">FHSA Opportunity</h4>
            <p className="text-[var(--on-primary-container)] text-sm leading-relaxed mb-8 font-medium">
              You have <span className="text-white font-bold">$3,000</span> remaining in your First Home Savings Account limit. Maximizing this accelerates your goal timeline by <span className="text-[var(--secondary-container)] font-bold text-lg">4 months</span>.
            </p>
          </div>

          <button className="w-full bg-[#86f2e4] text-[#006f66] py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 shadow-xl shadow-[#86f2e4]/10 transition-all">
            Contribute Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Financial Journey Card */}
        <div className="card p-10 shadow-lg border-none">
          <h4 className="headline-md mb-2">Financial Journey</h4>
          <p className="body-md text-[var(--on-surface-variant)] mb-10">Complete these pillars to secure your roadmap.</p>
          
          <div className="space-y-8 relative">
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-[var(--surface-container-high)]"></div>
            
            <div className="flex gap-6 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-[var(--vibrant-teal)] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[var(--vibrant-teal)]/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="pt-1">
                <h5 className="text-sm font-black uppercase tracking-tight text-[var(--on-surface)]">1. Discovery & Onboarding</h5>
                <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest mt-1">Completed Mar 12, 2024</p>
              </div>
            </div>

            <div className="flex gap-6 relative z-10">
              <div className="w-10 h-10 rounded-2xl border-2 border-[var(--vibrant-teal)] bg-white flex items-center justify-center text-[var(--vibrant-teal)] shrink-0 shadow-sm">
                <span className="text-xs font-black">2</span>
              </div>
              <div className="flex-1 bg-[var(--surface-container-low)] p-6 rounded-2xl border border-[var(--outline-variant)] hover:bg-white hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => setStep(1)}>
                <h5 className="text-sm font-black uppercase tracking-tight text-[var(--on-surface)] mb-1">Cash Flow Mapping</h5>
                <p className="text-xs text-[var(--on-surface-variant)] mb-4 font-medium leading-relaxed">Connect remaining accounts to build a complete picture of your disposable income.</p>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[var(--vibrant-teal)] group-hover:gap-2 transition-all">
                  Resume Action <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>

            <div className="flex gap-6 relative z-10 opacity-30 grayscale">
              <div className="w-10 h-10 rounded-2xl border-2 border-[var(--outline)] bg-white flex items-center justify-center text-[var(--on-surface-variant)] shrink-0">
                <span className="text-xs font-black">3</span>
              </div>
              <div className="pt-2">
                <h5 className="text-sm font-black uppercase tracking-tight text-[var(--on-surface)]">Risk Profiling</h5>
                <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest mt-1">LOCKED</p>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Card */}
        <div className="card p-10 shadow-lg border-none flex flex-col group overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-[var(--surface-container-low)] rounded-2xl flex items-center justify-center text-[var(--vibrant-teal)] group-hover:bg-[var(--vibrant-teal)] group-hover:text-white transition-all duration-500">
                <Plus className="w-8 h-8" />
              </div>
              <div>
                <h4 className="headline-md text-xl leading-none">First Home Downpayment</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mt-2">Target: Q3 2026</p>
              </div>
            </div>
            <button className="p-3 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] rounded-2xl transition-all">
              <Edit2 className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-[var(--on-surface)]">$45,000</span>
                <span className="text-[var(--on-surface-variant)] text-xs font-black uppercase tracking-widest">saved</span>
              </div>
              <span className="text-xs font-black text-[var(--on-surface-variant)] uppercase tracking-widest">$650k target</span>
            </div>
            
            <div className="space-y-3">
              <div className="h-3 w-full bg-[var(--surface-container-high)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--vibrant-teal)] shadow-[0_0_12px_rgba(13,148,136,0.3)] transition-all duration-1000" style={{width: '7%'}}></div>
              </div>
              <p className="text-[10px] text-[var(--on-surface-variant)] font-black uppercase tracking-[0.1em] text-right">7% funded based on total property value</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-10 mt-10 border-t border-[var(--outline-variant)]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-2">Monthly Savings</p>
              <p className="text-2xl font-black text-[var(--on-surface)]">$1,250</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-2">Return (EST)</p>
              <p className="text-2xl font-black text-[var(--emerald)]">+4.2% YTD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
