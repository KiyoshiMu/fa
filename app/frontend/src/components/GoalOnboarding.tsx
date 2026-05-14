import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Layout, 
  Landmark, 
  Construction,
  ArrowRight,
  MapPin,
  TrendingUp,
  Target
} from 'lucide-react';
import { useFinancial } from '../FinancialContext';
import type { PropertyType, PayFrequency } from '../FinancialContext';
import { PROPERTY_MEDIANS, calculateCMHC, calculateMinDP } from '../lib/mortgageUtils';

const GoalOnboarding: React.FC = () => {
    const { state, setGoal, setStep } = useFinancial();
    
    // Housing Specific State
    const [propertyType, setPropertyType] = useState<PropertyType>(state.goal?.propertyType || 'single family');
    const [targetAmount] = useState(state.goal?.targetAmount || PROPERTY_MEDIANS['single family']);
    const [location, setLocation] = useState(state.goal?.location || 'Toronto, ON');
    const [savings, setSavings] = useState(state.goal?.currentSavings || 25000);
    const [months, setMonths] = useState(state.goal?.months || 36);
    const [hasFHSA] = useState(state.goal?.hasFHSAOrTFSA || false);
    const [contribution] = useState(state.cashFlow?.netCashFlow || 1500);
    const [payFreq, setPayFreq] = useState<PayFrequency>(state.payFrequency);

    const minDownpayment = useMemo(() => calculateMinDP(targetAmount), [targetAmount]);
    const cmhcInsurance = useMemo(() => calculateCMHC(targetAmount, savings), [targetAmount, savings]);

    const handlePropertySelect = (type: PropertyType) => {
        setPropertyType(type);
    };

    const handleFrequencySelect = (freq: PayFrequency) => {
        setPayFreq(freq);
    };

    const handleContinue = () => {
        setGoal({
            type: 'Home',
            propertyType,
            targetAmount,
            location,
            currentSavings: savings,
            months,
            hasFHSAOrTFSA: hasFHSA,
            contribution
        });
        setStep(3);
    };

    const properties: { type: PropertyType; icon: any; label: string; desc: string }[] = [
        { type: 'single family', icon: Building2, label: 'Detached Home', desc: 'Single-family residential' },
        { type: 'semi-detached', icon: Layout, label: 'Semi-Detached', desc: 'Shared wall construction' },
        { type: 'townhouse', icon: Landmark, label: 'Townhouse', desc: 'Multi-level row housing' },
        { type: 'condo', icon: Construction, label: 'Condominium', desc: 'High-rise or low-rise unit' },
    ];

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="label-md text-[var(--secondary)] mb-2 uppercase tracking-widest font-bold">Step 2 of 4</div>
                    <h2 className="headline-lg text-[var(--on-surface)]">Goal Selection</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-[var(--surface-container-low)] rounded-full border border-[var(--outline-variant)] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[var(--secondary)]" />
                        <span className="text-xs font-bold text-[var(--on-surface)]">Mortgage Compliance Verified</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <div className="card p-8">
                        <h3 className="headline-md mb-6">Which property type are you targeting?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {properties.map((prop) => (
                                <button
                                    key={prop.type}
                                    onClick={() => handlePropertySelect(prop.type)}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 flex items-start gap-4 group ${
                                        propertyType === prop.type 
                                            ? 'border-[var(--secondary)] bg-[var(--secondary-container)] bg-opacity-20' 
                                            : 'border-[var(--outline-variant)] hover:border-[var(--secondary)] hover:bg-[var(--surface-container-low)]'
                                    }`}
                                >
                                    <div className={`p-3 rounded-xl transition-colors ${propertyType === prop.type ? 'bg-[var(--secondary)] text-white' : 'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] group-hover:bg-[var(--secondary-container)]'}`}>
                                        <prop.icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-bold">{prop.label}</div>
                                        <div className="text-xs text-[var(--on-surface-variant)]">{prop.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card p-8 space-y-8">
                        <h3 className="headline-md">Goal Configuration</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="label-md font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Primary Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
                                    <input 
                                        type="text" 
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full bg-[var(--surface-container-low)] border-none rounded-xl py-4 pl-12 pr-4 text-sm font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="label-md font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Savings Cadence</label>
                                <div className="flex p-1 bg-[var(--surface-container-low)] rounded-xl">
                                    {(['monthly', 'semi-monthly', 'bi-weekly'] as PayFrequency[]).map((freq) => (
                                        <button
                                            key={freq}
                                            onClick={() => handleFrequencySelect(freq)}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${payFreq === freq ? 'bg-white shadow-sm text-[var(--secondary)]' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}
                                        >
                                            {freq}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <label className="label-md font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Current Downpayment</label>
                                <span className="headline-md text-xl">${savings.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" 
                                min="10000"
                                max="200000"
                                step="5000"
                                value={savings}
                                onChange={(e) => setSavings(Number(e.target.value))}
                                className="w-full h-2 bg-[var(--outline-variant)] rounded-full appearance-none cursor-pointer accent-[var(--secondary)]"
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <label className="label-md font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Horizon (Months)</label>
                                <span className="headline-md text-xl">{months} Months</span>
                            </div>
                            <input 
                                type="range" 
                                min="6"
                                max="60"
                                step="6"
                                value={months}
                                onChange={(e) => setMonths(Number(e.target.value))}
                                className="w-full h-2 bg-[var(--outline-variant)] rounded-full appearance-none cursor-pointer accent-[var(--secondary)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-1 space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="card p-8 bg-white border-2 border-[var(--secondary)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--secondary-container)] opacity-20 blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10 space-y-8">
                            <div>
                                <div className="label-md text-[var(--on-surface-variant)] mb-2 uppercase tracking-widest font-bold">Goal Target</div>
                                <h3 className="headline-lg text-[var(--on-surface)]">${targetAmount.toLocaleString()}</h3>
                                <p className="text-xs text-[var(--on-surface-variant)] font-bold mt-1 uppercase tracking-widest italic">{propertyType} Property • {location}</p>
                            </div>

                            <div className="space-y-6 border-y border-[var(--outline-variant)] py-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-[var(--on-surface-variant)] font-medium">Min. Downpayment</span>
                                    <span className="text-sm font-black">${minDownpayment.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-[var(--on-surface-variant)] font-medium">CMHC Insurance</span>
                                    <span className={`text-sm font-black ${cmhcInsurance.insuranceAmount > 0 ? 'text-red-500' : 'text-[var(--secondary)]'}`}>
                                        {cmhcInsurance.insuranceAmount > 0 ? `$${cmhcInsurance.insuranceAmount.toLocaleString()}` : 'Not Required'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-[var(--secondary)]" />
                                        <span className="text-sm text-[var(--on-surface-variant)] font-medium">Est. Monthly Surplus</span>
                                    </div>
                                    <span className="text-sm font-black">${contribution.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-[var(--surface-container-low)] flex items-center gap-3">
                                <Target className="w-5 h-5 text-[var(--secondary)]" />
                                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] leading-tight">
                                    Targeting <span className="text-[var(--on-surface)]">{(savings / targetAmount * 100).toFixed(1)}%</span> of total value today.
                                </div>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="w-full btn btn-primary py-5 text-lg group"
                            >
                                Build Profile
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalOnboarding;
