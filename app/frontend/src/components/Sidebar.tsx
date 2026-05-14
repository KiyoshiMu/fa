import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Target, 
  Activity, 
  Settings, 
  HelpCircle,
  TrendingUp,
  Leaf
} from 'lucide-react';
import { useFinancial } from '../FinancialContext';

const Sidebar: React.FC = () => {
  const { state, setStep } = useFinancial();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, step: 0 },
    { id: 'cashflow', label: 'Cash Flow Hub', icon: Wallet, step: 1 },
    { id: 'goal', label: 'Goal Planner', icon: Target, step: 2 },
    { id: 'profiler', label: 'Risk Profiler', icon: Activity, step: 3 },
    { id: 'solutions', label: 'Solutions Hub', icon: TrendingUp, step: 4 },
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

        <div className="p-4 rounded-2xl bg-white border border-[var(--outline-variant)] shadow-sm mb-8">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Journey Progress</span>
              <span className="text-[10px] font-black text-[var(--on-surface)]">Step {state.step} of 4</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--surface-container)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--vibrant-teal)] transition-all duration-1000" 
                style={{ width: `${(state.step / 4) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-[var(--on-surface-variant)] font-medium">
              {state.step === 4 ? 'Journey complete!' : `${4 - state.step} steps remaining`}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = state.step === item.step;
          const isLocked = item.step > state.step && item.step !== 0;

          return (
            <button
              key={item.id}
              onClick={() => !isLocked && setStep(item.step)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-lg)] transition-all duration-300 group ${
                isActive 
                  ? 'bg-[#86f2e4] text-[#006f66] font-bold shadow-sm' 
                  : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]'
              } ${isLocked ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
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
      </div>
    </aside>
  );
};

export default Sidebar;
