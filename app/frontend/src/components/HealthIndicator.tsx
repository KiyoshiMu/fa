import React, { useEffect, useState } from 'react';
import { checkHealth } from '../lib/api';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

const HealthIndicator: React.FC = () => {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'OK' | 'ERROR'>('IDLE');

    useEffect(() => {
        const fetchHealth = async () => {
            setStatus('LOADING');
            try {
                const isOk = await checkHealth();
                setStatus(isOk ? 'OK' : 'ERROR');
            } catch {
                setStatus('ERROR');
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-3 group cursor-pointer transition-all duration-300">
            <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-500 ${
                status === 'OK' 
                    ? 'bg-[var(--emerald)]/10 border-[var(--emerald)]/20 text-[var(--emerald)] group-hover:bg-[var(--emerald)]/20' 
                    : status === 'ERROR' 
                    ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                    : 'bg-[var(--on-surface-variant)]/5 border-[var(--on-surface-variant)]/10 text-[var(--on-surface-variant)]/20'
            }`}>
                {status === 'OK' ? (
                    <>
                        <ShieldCheck className="w-5 h-5" />
                        <span className="absolute inset-0 rounded-xl border border-[var(--emerald)]/20 animate-ping opacity-20" />
                    </>
                ) : status === 'ERROR' ? (
                    <AlertTriangle className="w-5 h-5" />
                ) : (
                    <Activity className="w-5 h-5 animate-pulse" />
                )}
            </div>
            
            <div className="hidden lg:block">
                <div className="text-[9px] font-black text-[var(--on-surface-variant)]/40 uppercase tracking-[0.2em] leading-none mb-1">Grid Status</div>
                <div className="text-[11px] font-black text-[var(--on-surface-variant)]/80 tracking-tighter uppercase leading-none">
                    {status === 'OK' ? 'Terminal Active' : status === 'ERROR' ? 'Grid Offline' : 'Syncing...'}
                </div>
            </div>
        </div>
    );
};

export default HealthIndicator;
