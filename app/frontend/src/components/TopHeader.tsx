import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

const TopHeader: React.FC = () => {
  return (
    <header className="h-20 bg-white border-b border-[var(--outline-variant)] flex items-center justify-between px-10 sticky top-0 z-20">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)] group-focus-within:text-[var(--vibrant-teal)] transition-colors" />
          <input 
            type="text" 
            placeholder="Search for tools, accounts or insights..." 
            className="w-full bg-[var(--surface-container-low)] border border-transparent rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[var(--vibrant-teal)]/20 focus:border-[var(--vibrant-teal)] focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] rounded-xl transition-all relative group">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--amber)] rounded-full border-2 border-white group-hover:scale-125 transition-transform"></span>
          </button>
          <button className="p-2.5 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] rounded-xl transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="h-10 w-px bg-[var(--outline-variant)] opacity-50 mx-2" />

        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-[var(--surface-container-highest)] overflow-hidden border-2 border-[var(--outline-variant)] group-hover:border-[var(--vibrant-teal)] transition-all">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-bold text-[var(--on-surface)]">Sarah Jenkins</p>
            <p className="text-[10px] font-medium text-[var(--on-surface-variant)] uppercase tracking-widest">Premium Plan</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
