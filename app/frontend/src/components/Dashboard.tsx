import React from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  MoreHorizontal, 
  CheckCircle2, 
  Edit2,
  ChevronRight,
  Plus
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="headline-lg text-[var(--on-surface)]">Welcome back, Sarah.</h2>
          <p className="body-md text-[var(--on-surface-variant)]">Here is an overview of your financial progress today.</p>
        </div>
        <button className="btn btn-secondary gap-2 px-8">
          Schedule Review
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Net Worth Chart */}
        <div className="lg:col-span-2 card p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="label-md text-[var(--on-surface-variant)] mb-1">Current Net Worth</p>
              <div className="flex items-end gap-4">
                <h3 className="display-lg leading-none">$85,240</h3>
                <div className="flex items-center gap-1 text-[#006f66] bg-[#86f2e4] px-2 py-1 rounded-md text-xs font-bold mb-1">
                  <ArrowUpRight className="w-3 h-3" />
                  2.4% this month
                </div>
              </div>
            </div>
            <button className="p-2 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] rounded-full transition-colors">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006a61" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#006a61" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--on-surface-variant)', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  hide 
                  domain={['dataMin - 10000', 'dataMax + 10000']} 
                />
                <Tooltip 
                  contentStyle={{borderRadius: 'var(--radius-md)', border: 'none', boxShadow: 'var(--shadow-lg)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#006a61" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wealth Insight Card */}
        <div className="bg-[#131b2e] rounded-[var(--radius-xl)] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#86f2e4] opacity-5 blur-[60px] -mr-16 -mt-16"></div>
          
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#86f2e4]" />
              <span className="label-md text-[#7c839b]">Wealth Insight</span>
            </div>
            <h4 className="headline-md mb-4 leading-tight">FHSA Contribution Opportunity</h4>
            <p className="text-[#7c839b] text-sm leading-relaxed mb-8">
              You have $3,000 remaining in your First Home Savings Account limit for this year. Maximizing this accelerates your goal timeline by 4 months.
            </p>
          </div>

          <button className="w-full bg-[#86f2e4] text-[#006f66] py-4 rounded-[var(--radius-lg)] font-bold hover:opacity-90 transition-opacity">
            Contribute Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Financial Journey Card */}
        <div className="card p-8">
          <h4 className="headline-md mb-2">Financial Journey</h4>
          <p className="body-md text-[var(--on-surface-variant)] mb-8">Complete these pillars to secure your roadmap.</p>
          
          <div className="space-y-6 relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[var(--surface-container-high)]"></div>
            
            <div className="flex gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#006a61] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#006a61]/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold">1. Discovery & Onboarding</h5>
                <p className="text-xs text-[var(--on-surface-variant)]">Completed Mar 12</p>
              </div>
            </div>

            <div className="flex gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full border-2 border-[#006a61] bg-white flex items-center justify-center text-[#006a61] shrink-0">
                <span className="text-xs font-bold">2</span>
              </div>
              <div className="flex-1 bg-[#f0f3ff] p-4 rounded-xl border border-[#dee8ff]">
                <h5 className="text-sm font-bold">Cash Flow Mapping</h5>
                <p className="text-xs text-[var(--on-surface-variant)] mb-4">Connect remaining accounts to build a complete picture.</p>
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-xs font-bold text-[#006a61] hover:underline"
                >
                  Resume Action <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex gap-4 relative z-10 opacity-40">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--outline)] bg-white flex items-center justify-center text-[var(--on-surface-variant)] shrink-0">
                <span className="text-xs font-bold">3</span>
              </div>
              <h5 className="text-sm font-bold flex items-center">Risk Profiling</h5>
            </div>
          </div>
        </div>

        {/* Goal Card */}
        <div className="card p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f0f3ff] rounded-xl flex items-center justify-center text-[#006a61]">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="headline-md leading-none">First Home Downpayment</h4>
                <p className="text-xs text-[var(--on-surface-variant)] mt-1">Target: Q3 2026</p>
              </div>
            </div>
            <button className="p-2 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] rounded-full transition-colors">
              <Edit2 className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-2">
                <span className="display-lg leading-none">$45,000</span>
                <span className="text-[var(--on-surface-variant)] text-sm font-medium">saved</span>
              </div>
              <span className="text-sm font-bold">$650k target</span>
            </div>
            
            <div className="h-2 w-full bg-[var(--surface-container-high)] rounded-full overflow-hidden">
              <div className="h-full bg-[#006a61] transition-all duration-1000" style={{width: '7%'}}></div>
            </div>
            <p className="text-[10px] text-[var(--on-surface-variant)] font-medium text-right">7% funded based on total property value</p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[var(--outline-variant)]">
            <div>
              <p className="label-md text-[var(--on-surface-variant)] mb-1">Monthly Savings</p>
              <p className="headline-md font-bold">$1,250</p>
            </div>
            <div>
              <p className="label-md text-[var(--on-surface-variant)] mb-1">Investment Return (EST)</p>
              <p className="headline-md font-bold text-[#006f66]">+4.2% YTD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
