import React, { useState } from 'react';
import { useAnalyzer } from './AnalyzerContext';
import { Target, TrendingUp, RefreshCw, Leaf, ChevronDown } from 'lucide-react';
import SavingsGoalCalculator from './SavingsGoalCalculator';
import RetirementCalculator from './RetirementCalculator';

const AnalyzerLayout: React.FC = () => {
  const { state, setStep, resetCurrent } = useAnalyzer();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const navItems = [
    { id: 'savings-goal', label: 'Savings Goal', icon: Target },
    { id: 'retirement', label: 'Retirement Planning', icon: TrendingUp },
  ];

  return (
    <div className="flex h-screen bg-[var(--surface)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--vibrant-teal)]/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--primary-container)]/10 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />
      
      <aside className="w-72 h-screen flex flex-col bg-[var(--surface)] border-r border-[var(--outline-variant)] sticky top-0 z-20">
        <div className="p-8 pb-4">
          <div className="relative mb-12">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            >
              <div className="w-10 h-10 bg-[var(--inverse-surface)] rounded-xl flex items-center justify-center text-white shadow-lg">
                <Leaf className="w-6 h-6 fill-current" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold tracking-tight text-[var(--on-surface)]">Lumina Analyzer</h1>
              </div>
              <ChevronDown className={`w-4 h-4 text-[var(--on-surface-variant)] transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} />
            </div>

            {isSwitcherOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-lg border border-[var(--outline-variant)] py-2 z-50">
                <button 
                  onClick={() => { setIsSwitcherOpen(false); window.location.href = '/'; }}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] font-semibold text-sm flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-transparent"></div>
                  Advisory Flow
                </button>
                <button 
                  onClick={() => { setIsSwitcherOpen(false); window.location.href = '/analyzer'; }}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--surface-container-low)] text-[var(--on-surface)] font-semibold text-sm flex items-center gap-2 bg-[var(--surface-container-highest)] text-[var(--on-surface)]"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--inverse-surface)]"></div>
                  Analyzer Flow
                </button>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = state.step === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setStep(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-lg)] transition-all duration-300 group ${isActive
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
          <button
            onClick={() => {
              const calculatorName = state.step === 'savings-goal' ? 'Savings Goal' : 'Retirement Planning';
              if (confirm(`Reset all inputs for the ${calculatorName} calculator?`)) {
                resetCurrent();
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 mt-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-semibold">Reset {state.step === 'savings-goal' ? 'Savings' : 'Retirement'} Data</span>
          </button>
        </div>
      </aside>
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-hidden">
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            {state.step === 'savings-goal' && <SavingsGoalCalculator />}
            {state.step === 'retirement' && <RetirementCalculator />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyzerLayout;
