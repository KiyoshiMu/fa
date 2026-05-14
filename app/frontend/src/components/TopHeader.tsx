import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

const TopHeader: React.FC = () => {
  return (
    <header className="h-20 bg-white border-b border-[var(--outline-variant)] flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[var(--secondary)] rounded-lg flex items-center justify-center text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#111c2d]">Lumina Wealth</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-80 bg-[var(--surface-container-low)] border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--secondary-container)] transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] rounded-full transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[var(--surface-container-highest)] overflow-hidden border border-[var(--outline-variant)] cursor-pointer">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
