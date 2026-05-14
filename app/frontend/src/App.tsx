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
    <div className="flex min-h-screen bg-[var(--surface)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            {renderStep()}
          </div>
        </main>
        <footer className="py-8 px-10 border-t border-[var(--outline-variant)] text-center">
          <p className="text-xs font-medium text-[var(--on-surface-variant)] uppercase tracking-[0.2em]">
            Financial Advisor Dashboard • Guided Wealth Journey
          </p>
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
