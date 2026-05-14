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
    <div className="flex h-screen bg-[var(--surface)] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--vibrant-teal)]/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--primary-container)]/10 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />
      
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-hidden">
        <TopHeader />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            {renderStep()}
          </div>
        </main>
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
