import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Target, 
  Activity, 
  Settings, 
  HelpCircle,
  TrendingUp
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
    <aside className="w-72 h-screen flex flex-col bg-white border-r border-[var(--outline-variant)] sticky top-0">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-10">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" 
            alt="Profile" 
            className="w-12 h-12 rounded-full bg-[var(--surface-container)]"
          />
          <div>
            <h3 className="text-sm font-bold">Journey Progress</h3>
            <p className="text-xs text-[var(--on-surface-variant)]">Step {state.step} of 4 active</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = state.step === item.step;
          const isLocked = item.step > state.step && item.step !== 0; // Dashboard always open

          return (
            <button
              key={item.id}
              onClick={() => !isLocked && setStep(item.step)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] transition-all duration-200 ${
                isActive 
                  ? 'bg-[#86f2e4] text-[#006f66] font-semibold' 
                  : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]'
              } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 space-y-4">
        <button className="w-full btn btn-outline gap-2 bg-[#f0f3ff] border-[#dee8ff]">
          View Net Worth
        </button>
        
        <div className="pt-4 border-t border-[var(--outline-variant)]">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Support</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
