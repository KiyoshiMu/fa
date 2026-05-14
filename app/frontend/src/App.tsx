import React from 'react';
import { FinancialProvider, useFinancial } from './FinancialContext';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Dashboard from './components/Dashboard';
import CashFlowHub from './components/CashFlowHub';
import GoalOnboarding from './components/GoalOnboarding';
import InvestmentProfiler from './components/InvestmentProfiler';
import SolutionsHub from './components/SolutionsHub';

const MainContent: React.FC = () => {
  const { state } = useFinancial();

  const renderStep = () => {
    switch (state.step) {
      case 0: return <Dashboard />;
      case 1: return <CashFlowHub />;
      case 2: return <GoalOnboarding />;
      case 3: return <InvestmentProfiler />;
      case 4: return <SolutionsHub />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--surface)] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--vibrant-teal)]/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--primary-container)]/10 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />
      
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopHeader />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            {renderStep()}
          </div>
        </main>
        <footer className="py-8 px-10 border-t border-[var(--outline-variant)]">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.2em]">
              Lumina Wealth Management • Institutional Advisory Terminal
            </p>
            <p className="text-[10px] font-bold text-[var(--on-surface-variant)]/40 uppercase tracking-widest">
              v2.4.0-PRO • Grid Security Active
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FinancialProvider>
      <MainContent />
    </FinancialProvider>
  );
};

export default App;
