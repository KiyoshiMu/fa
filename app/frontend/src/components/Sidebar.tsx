import React from 'react';
import { 
  Wallet, 
  Target, 
  Settings, 
  HelpCircle,
  Leaf,
  RefreshCw,
  ShieldCheck,
  Zap,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useFinancial } from '../FinancialContext';

const Sidebar: React.FC = () => {
  const { state, setStep, reset } = useFinancial();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, step: 0 },
    { id: 'cashflow', label: 'Cash Flow Hub', icon: Wallet, step: 1 },
    { id: 'goal', label: 'Savings Planner', icon: Target, step: 2 },
    { id: 'profiler', label: 'Risk Intelligence', icon: ShieldCheck, step: 3 },
    { id: 'solutions', label: 'Deployment Hub', icon: Zap, step: 4 },
  ];

  return (
    <aside className="w-72 h-screen flex flex-col bg-[var(--surface)] border-r border-[var(--outline-variant)] sticky top-0">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[var(--vibrant-teal)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[var(--vibrant-teal)]/20">
            <Leaf className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--on-surface)]">Lumina Wealth</h1>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--vibrant-teal)]/10 to-transparent border border-[var(--vibrant-teal)]/20 shadow-sm mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--vibrant-teal)]/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Plan Health</span>
              <span className="text-[10px] font-black text-[var(--emerald)] bg-[var(--emerald)]/10 px-2 py-0.5 rounded">Optimal</span>
            </div>
            
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-[var(--on-surface)]">92</span>
              <span className="text-[10px] font-bold text-[var(--on-surface-variant)] mb-1.5 uppercase">Score</span>
            </div>

            <div className="h-1.5 w-full bg-[var(--surface-container)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--emerald)] transition-all duration-1000" 
                style={{ width: `92%` }}
              />
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--on-surface-variant)]">
              <Calendar className="w-3 h-3" />
              <span>Next Audit: June 1, 2024</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = state.step === item.step;

          return (
            <button
              key={item.id}
              onClick={() => setStep(item.step)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-lg)] transition-all duration-300 group ${
                isActive 
                  ? 'bg-[#86f2e4] text-[#006f66] font-bold shadow-sm' 
                  : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-sm tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-[var(--outline-variant)]">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] rounded-xl transition-all duration-200">
          <Settings className="w-5 h-5" />
          <span className="text-sm font-semibold">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] rounded-xl transition-all duration-200">
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">Support</span>
        </button>
        <button 
          onClick={() => {
            if (confirm('Are you sure you want to restart your journey? All current progress will be reset.')) {
              reset();
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 mt-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-semibold">Restart Journey</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
