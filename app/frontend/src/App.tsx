import React, { useState } from 'react';
import { LayoutDashboard, Target, Activity, Menu, Sparkles, Sun, Moon, X, Rocket, ChevronRight } from 'lucide-react';
import HealthIndicator from './components/HealthIndicator';
import InvestmentProfiler from './components/InvestmentProfiler';
import CashFlowHub from './components/CashFlowHub';
import GoalOnboarding from './components/GoalOnboarding';
import SolutionsHub from './components/SolutionsHub';
import { FinancialProvider, useFinancial } from './FinancialContext';

type Tab = 'cashflow' | 'goal' | 'profiler' | 'solutions';

const MainContent: React.FC<{ theme: 'dark' | 'light', setTheme: (t: 'dark' | 'light') => void }> = ({ theme, setTheme }) => {
    const { state, setStep } = useFinancial();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { id: 'cashflow' as Tab, label: '1. Cash Flow', icon: LayoutDashboard, desc: 'Budgeting', step: 1 },
        { id: 'goal' as Tab, label: '2. Goals', icon: Target, desc: 'Planning', step: 2 },
        { id: 'profiler' as Tab, label: '3. Risk Profiler', icon: Sparkles, desc: 'Strategy', step: 3 },
        { id: 'solutions' as Tab, label: '4. Solutions', icon: Rocket, desc: 'Recommendations', step: 4 },
    ];

    return (
        <div className="flex relative z-10 transition-all duration-500">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] z-50 transition-all duration-500 transform lg:translate-x-0 lg:bg-[hsl(var(--sidebar-bg))]/50 lg:backdrop-blur-2xl ${isMenuOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl lg:shadow-none'}`}>
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black bg-gradient-to-br from-[hsl(var(--sidebar-foreground))] to-[hsl(var(--sidebar-foreground))]/60 bg-clip-text text-transparent italic">FA Advisor</h1>
                                <div className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em] leading-none mt-1">v2.0 Premium</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsMenuOpen(false)}
                            className="lg:hidden p-2 text-[hsl(var(--sidebar-foreground))]/40 hover:text-[hsl(var(--sidebar-foreground))]"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const isLocked = item.step > state.step;
                            return (
                                <button
                                    key={item.id}
                                    disabled={isLocked}
                                    onClick={() => {
                                        setStep(item.step);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                                        state.step === item.step 
                                            ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' 
                                            : isLocked 
                                                ? 'opacity-40 cursor-not-allowed text-[hsl(var(--sidebar-foreground))]/50'
                                                : 'text-[hsl(var(--sidebar-foreground))]/70 hover:bg-[hsl(var(--sidebar-foreground))]/10 border border-transparent'
                                    }`}
                                >
                                    <div className={`p-2 rounded-xl transition-all duration-300 ${state.step === item.step ? 'bg-primary-500 text-white' : 'bg-[hsl(var(--sidebar-foreground))]/5 group-hover:bg-[hsl(var(--sidebar-foreground))]/10'}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm tracking-wide group-hover:text-[hsl(var(--sidebar-foreground))] transition-colors">{item.label}</div>
                                        <div className="text-[10px] uppercase font-black tracking-widest opacity-40 group-hover:opacity-60 transition-opacity">{item.desc}</div>
                                    </div>
                                    {state.step === item.step && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-l-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-auto space-y-4 pt-6 border-t border-[hsl(var(--sidebar-border))]">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-[hsl(var(--sidebar-foreground))]/5 hover:bg-[hsl(var(--sidebar-foreground))]/10 transition-all border border-[hsl(var(--sidebar-foreground))]/10 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
                                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                </div>
                                <span className="text-sm font-bold text-[hsl(var(--sidebar-foreground))]/60 group-hover:text-[hsl(var(--sidebar-foreground))]">
                                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                </span>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white shadow-sm rounded-full transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
                            </div>
                        </button>
                        <HealthIndicator />
                        <div className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-3 h-3 text-primary-500" />
                                <span className="text-[10px] font-black uppercase text-primary-500 tracking-widest">Support</span>
                            </div>
                            <p className="text-[10px] text-[hsl(var(--sidebar-foreground))]/40 font-medium leading-relaxed">
                                Get priority analysis for your specific financial goals.
                            </p>
                            <button className="flex items-center gap-1 mt-3 text-[10px] font-black text-primary-500 hover:text-primary-400 group">
                                CONTACT ADVISOR <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <main className="flex-1 lg:ml-72 min-h-screen relative p-6 lg:p-12 overflow-x-hidden">
                {/* Top Bar for Mobile */}
                <header className="lg:hidden flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black italic text-lg tracking-tight">FA</span>
                    </div>
                    <button 
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 bg-secondary rounded-xl text-foreground"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex items-center justify-between mb-12">
                   <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary-500/5 border border-primary-500/10 rounded-full">
                       <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 font-mono">
                           Global Financial Context: ACTIVE
                       </span>
                   </div>
                   <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Selected Strategy</span>
                            <span className="text-xs font-black italic">{state.profile?.type || 'Under Analysis'}</span>
                        </div>
                   </div>
                </div>

                <div className="max-w-[1400px] mx-auto min-h-[70vh]">
                    {state.step === 1 && <CashFlowHub />}
                    {state.step === 2 && <GoalOnboarding />}
                    {state.step === 3 && <InvestmentProfiler />}
                    {state.step === 4 && <SolutionsHub />}
                </div>

                <footer className="mt-20 border-t border-border py-12 px-6 lg:px-12 text-center">
                    <div className="text-[12px] font-bold text-foreground/20 uppercase tracking-[0.3em]">
                        Financial Advisor Dashboard • Guided Wealth Journey
                    </div>
                </footer>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
        }
        return 'dark';
    });

    React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <FinancialProvider>
            <div className="min-h-screen bg-background text-foreground selection:bg-primary-500/30 transition-colors duration-500 font-sans">
                {/* Background Effects */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                </div>

                <MainContent theme={theme} setTheme={setTheme} />
            </div>
        </FinancialProvider>
    );
};

export default App;
