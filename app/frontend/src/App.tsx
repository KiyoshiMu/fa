import React, { useState, useEffect } from 'react';
import { FinancialProvider, useFinancial } from './FinancialContext';
import { AnalyzerProvider } from './components/Analyser/AnalyzerContext';
import AnalyzerLayout from './components/Analyser/AnalyzerLayout';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Dashboard from './components/Dashboard';
import CashFlowHub from './components/CashFlowHub';
import GoalOnboarding from './components/GoalOnboarding';
import InvestmentProfiler from './components/InvestmentProfiler';
import SolutionsHub from './components/SolutionsHub';
import OnboardingFlow from './components/OnboardingFlow';

const MainContent: React.FC = () => {
  const { state, setStep } = useFinancial();

  if (!state.onboardingComplete) {
    // If onboarding is not complete, we always show the onboarding flow
    // and we ensure the step is at least 1 (the first onboarding step)
    if (state.step === 0) {
      setStep(1);
      return null; // Let the next render handle it
    }
    return <OnboardingFlow />;
  }

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
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (path === '/analyzer') {
    return (
      <AnalyzerProvider>
        <AnalyzerLayout />
      </AnalyzerProvider>
    );
  }

  return (
    <FinancialProvider>
      <MainContent />
    </FinancialProvider>
  );
};

export default App;
