import React, { useState } from 'react';
import { LayoutDashboard, Target, Activity, Menu, ExternalLink, Sparkles, Sun, Moon, X } from 'lucide-react';
import HealthIndicator from './components/HealthIndicator';
import InvestmentProfiler from './components/InvestmentProfiler';
import SavingsPlanner from './components/SavingsPlanner';
import CashFlowHub from './components/CashFlowHub';

type Tab = 'profiler' | 'planner' | 'cashflow';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('profiler');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    const navItems = [
        { id: 'profiler' as Tab, label: 'Risk Profiler', icon: Sparkles, desc: 'Strategy' },
        { id: 'planner' as Tab, label: 'Savings Planner', icon: Target, desc: 'Projections' },
        { id: 'cashflow' as Tab, label: 'Cash Flow Hub', icon: LayoutDashboard, desc: 'Analytics' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary-500/30 transition-colors duration-500">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Layout Wrapper */}
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
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                                        activeTab === item.id 
                                            ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' 
                                            : 'text-[hsl(var(--sidebar-foreground))]/40 hover:bg-[hsl(var(--sidebar-foreground))]/5 border border-transparent'
                                    }`}
                                >
                                    <div className={`p-2 rounded-xl transition-all duration-300 ${activeTab === item.id ? 'bg-primary-500 text-white' : 'bg-[hsl(var(--sidebar-foreground))]/5 group-hover:bg-[hsl(var(--sidebar-foreground))]/10'}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm tracking-wide group-hover:text-[hsl(var(--sidebar-foreground))] transition-colors">{item.label}</div>
                                        <div className="text-[10px] uppercase font-black tracking-widest opacity-40 group-hover:opacity-60 transition-opacity">{item.desc}</div>
                                    </div>
                                    {activeTab === item.id && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-l-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                                    )}
                                </button>
                            ))}
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
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-72 min-h-screen bg-background">
                    {/* Header */}
                    <header className="sticky top-0 h-20 bg-background/80 backdrop-blur-md border-b border-border px-6 lg:px-12 flex items-center justify-between z-30">
                        <button 
                            className="lg:hidden p-2 text-foreground/60 hover:text-foreground"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-6 ml-auto">
                            <div className="hidden sm:flex items-center gap-4 py-1 px-4 bg-foreground/5 rounded-full border border-foreground/10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Connect</span>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-foreground transition-colors"><Activity className="w-4 h-4" /></a>
                                <div className="w-[1px] h-3 bg-foreground/10" />
                                <a href="#" className="text-foreground/40 hover:text-foreground transition-colors"><ExternalLink className="w-4 h-4" /></a>
                            </div>
                        </div>
                    </header>

                    {/* Content Viewport */}
                    <div className="p-6 lg:p-12 max-w-7xl mx-auto">
                        {activeTab === 'profiler' && <InvestmentProfiler />}
                        {activeTab === 'planner' && <SavingsPlanner />}
                        {activeTab === 'cashflow' && <CashFlowHub />}
                    </div>

                    {/* Footer */}
                    <footer className="mt-20 border-t border-border py-12 px-6 lg:px-12 text-center">
                        <div className="text-[12px] font-bold text-foreground/20 uppercase tracking-[0.3em]">
                            Financial Advisor Dashboard • Built with Agentic Intelligence
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default App;
