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
        <div className="flex items-center gap-2 group cursor-pointer transition-all duration-300">
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-500 ${
                status === 'OK' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400 group-hover:bg-green-500/20' 
                    : status === 'ERROR' 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-white/5 border-white/10 text-white/20'
            }`}>
                {status === 'OK' ? (
                    <>
                        <ShieldCheck className="w-4 h-4" />
                        <span className="absolute inset-0 rounded-full border border-green-500/20 animate-ping opacity-20" />
                    </>
                ) : status === 'ERROR' ? (
                    <AlertTriangle className="w-4 h-4" />
                ) : (
                    <Activity className="w-4 h-4 animate-pulse" />
                )}
            </div>
            
            <div className="hidden sm:block">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none mb-1">System Health</div>
                <div className="text-[11px] font-black text-white/60 tracking-tighter uppercase leading-none">
                    {status === 'OK' ? 'Backend Operational' : status === 'ERROR' ? 'Connection Lost' : 'Checking Link...'}
                </div>
            </div>
        </div>
    );
};

export default HealthIndicator;
