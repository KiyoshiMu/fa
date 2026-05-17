import React, { useEffect, useState, useMemo } from 'react';
import { useAnalyzer } from './AnalyzerContext';
import PremiumSlider from '../ui/PremiumSlider';
import { analyzeRetirement } from '../../lib/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { HelpCircle, Pin, PinOff } from 'lucide-react';

const RetirementCalculator: React.FC = () => {
  const { state, updateRetirement } = useAnalyzer();
  const inputs = state.retirementInput;
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pinnedResult, setPinnedResult] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const data = await analyzeRetirement(inputs);
        if (isMounted) setResult(data);
      } catch (err) {
        console.error('Failed to calculate retirement', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    const timer = setTimeout(fetchAnalysis, 500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [inputs]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val);
  const formatPercentage = (val: number) => `${val}%`;

  const chartData = useMemo(() => {
    if (!result) return [];
    if (!pinnedResult) return result.chartData;

    const pinnedMap = new Map(pinnedResult.chartData.map((d: any) => [d.age, d.amount]));
    return result.chartData.map((d: any) => ({
      ...d,
      pinnedAmount: pinnedMap.get(d.age) || null
    }));
  }, [result, pinnedResult]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column: Inputs */}
      <div className="flex-1 space-y-6 h-[calc(100vh-140px)] overflow-y-auto pr-2 pb-10 custom-scrollbar">
        <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-sm border border-[var(--outline-variant)]">
          <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-2">Retirement savings and planning</h2>
          <p className="text-[var(--on-surface-variant)] mb-8">Enter your details to project your retirement timeline.</p>

          <div className="space-y-10">
            {/* Section 1: Retirement Info */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-[var(--on-surface)] border-b pb-2">Retirement information</h3>
              
              <PremiumSlider
                label="Age *"
                value={inputs.age}
                min={18}
                max={100}
                step={1}
                onChange={(val) => updateRetirement({ age: val })}
              />

              <PremiumSlider
                label="Current income *"
                value={inputs.currentIncome}
                min={0}
                max={500000}
                step={5000}
                onChange={(val) => updateRetirement({ currentIncome: val })}
                formatValue={formatCurrency}
              />

              <PremiumSlider
                label="What age do you plan to retire? *"
                value={inputs.retirementAge}
                min={inputs.age}
                max={100}
                step={1}
                onChange={(val) => updateRetirement({ retirementAge: val })}
              />

              <PremiumSlider
                label="Enter a plan to a specific age *"
                value={inputs.lifespan}
                min={inputs.retirementAge}
                max={110}
                step={1}
                onChange={(val) => updateRetirement({ lifespan: val })}
              />
            </section>

            {/* Section 2: Income in Retirement */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-[var(--on-surface)] border-b pb-2">Income in Retirement</h3>
              
              <div className="flex flex-col gap-4 mb-4">
                <label className="text-sm font-semibold text-[var(--on-surface)]">How much will you need to live comfortably in retirement? *</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="incomeMethod" 
                      checked={inputs.incomeMethod === 'percentage'}
                      onChange={() => updateRetirement({ incomeMethod: 'percentage' })}
                      className="text-[var(--vibrant-teal)] focus:ring-[var(--vibrant-teal)]"
                    />
                    <span className="text-sm">Percentage of current income</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="incomeMethod" 
                      checked={inputs.incomeMethod === 'amount'}
                      onChange={() => updateRetirement({ incomeMethod: 'amount' })}
                      className="text-[var(--vibrant-teal)] focus:ring-[var(--vibrant-teal)]"
                    />
                    <span className="text-sm">Target income amount</span>
                  </label>
                </div>
              </div>

              {inputs.incomeMethod === 'percentage' ? (
                <PremiumSlider
                  label="Target percentage *"
                  value={inputs.targetIncomePercentage}
                  min={10}
                  max={150}
                  step={5}
                  onChange={(val) => updateRetirement({ targetIncomePercentage: val })}
                  formatValue={formatPercentage}
                />
              ) : (
                <PremiumSlider
                  label="Target amount *"
                  value={inputs.targetIncomeAmount}
                  min={10000}
                  max={300000}
                  step={5000}
                  onChange={(val) => updateRetirement({ targetIncomeAmount: val })}
                  formatValue={formatCurrency}
                />
              )}
            </section>

            {/* Section 3: Balances */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-[var(--on-surface)] border-b pb-2">Savings - current balances</h3>
              
              <PremiumSlider
                label="RRSP savings"
                value={inputs.rrspSavings}
                min={0}
                max={1000000}
                step={5000}
                onChange={(val) => updateRetirement({ rrspSavings: val })}
                formatValue={formatCurrency}
              />
              <PremiumSlider
                label="TFSA savings"
                value={inputs.tfsaSavings}
                min={0}
                max={150000}
                step={1000}
                onChange={(val) => updateRetirement({ tfsaSavings: val })}
                formatValue={formatCurrency}
              />
              <PremiumSlider
                label="Non-registered savings"
                value={inputs.nonRegSavings}
                min={0}
                max={2000000}
                step={10000}
                onChange={(val) => updateRetirement({ nonRegSavings: val })}
                formatValue={formatCurrency}
              />
            </section>

            {/* Section 4: Contributions */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-[var(--on-surface)] border-b pb-2">Savings - ongoing contributions</h3>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-semibold text-[var(--on-surface)]">Frequency:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={inputs.contributionFrequency === 'annually'}
                    onChange={() => updateRetirement({ contributionFrequency: 'annually' })}
                    className="text-[var(--vibrant-teal)] focus:ring-[var(--vibrant-teal)]"
                  />
                  <span className="text-sm">Annually</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={inputs.contributionFrequency === 'monthly'}
                    onChange={() => updateRetirement({ contributionFrequency: 'monthly' })}
                    className="text-[var(--vibrant-teal)] focus:ring-[var(--vibrant-teal)]"
                  />
                  <span className="text-sm">Monthly</span>
                </label>
              </div>

              <PremiumSlider
                label="RRSP savings"
                value={inputs.rrspContribution}
                min={0}
                max={50000}
                step={500}
                onChange={(val) => updateRetirement({ rrspContribution: val })}
                formatValue={formatCurrency}
              />
              <PremiumSlider
                label="TFSA savings"
                value={inputs.tfsaContribution}
                min={0}
                max={10000}
                step={100}
                onChange={(val) => updateRetirement({ tfsaContribution: val })}
                formatValue={formatCurrency}
              />
              <PremiumSlider
                label="Non-registered savings"
                value={inputs.nonRegContribution}
                min={0}
                max={100000}
                step={1000}
                onChange={(val) => updateRetirement({ nonRegContribution: val })}
                formatValue={formatCurrency}
              />
            </section>

            {/* Section 5: Market & Inflation */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-[var(--on-surface)] border-b pb-2">Savings - Market and inflation</h3>
              <PremiumSlider
                label="Estimated rate of return *"
                value={inputs.rateOfReturn}
                min={0.1}
                max={20}
                step={0.1}
                onChange={(val) => updateRetirement({ rateOfReturn: val })}
                formatValue={formatPercentage}
              />
              <PremiumSlider
                label="Estimated inflation rate *"
                value={inputs.inflationRate}
                min={0.1}
                max={20}
                step={0.1}
                onChange={(val) => updateRetirement({ inflationRate: val })}
                formatValue={formatPercentage}
              />
            </section>

          </div>
        </div>
      </div>

      {/* Right Column: Results */}
      <div className="w-full lg:w-[450px] flex-shrink-0">
        <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-sm border border-[var(--outline-variant)] sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-[var(--on-surface)]">Results</h3>
              <div className="group relative">
                <HelpCircle className="w-5 h-5 text-[var(--on-surface-variant)] cursor-help" />
                <div className="absolute right-[-10px] top-full mt-2 w-64 p-3 bg-[var(--inverse-surface)] text-[var(--inverse-on-surface)] text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none shadow-xl">
                  This projection uses Future Value (FV) formulas during your accumulation phase, and calculates decumulation by subtracting your target income adjusted for inflation each year until your target lifespan.
                  <div className="absolute right-3 bottom-full border-4 border-transparent border-b-[var(--inverse-surface)]" />
                </div>
              </div>
            </div>
            {result && (
              <button 
                onClick={() => setPinnedResult(pinnedResult ? null : result)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${pinnedResult ? 'bg-[var(--vibrant-teal)] text-white' : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-highest)]'}`}
                title={pinnedResult ? "Unpin result" : "Pin result to compare scenarios"}
              >
                {pinnedResult ? (
                  <><PinOff className="w-4 h-4" /> Unpin</>
                ) : (
                  <><Pin className="w-4 h-4" /> Pin Scenario</>
                )}
              </button>
            )}
          </div>
          
          <div className="mb-6 p-4 rounded-xl bg-[var(--surface-container-low)] border border-[var(--surface-container-high)] relative overflow-hidden">
            {pinnedResult && (
              <div className="absolute top-0 right-0 bg-[var(--vibrant-teal)] text-white text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-bl-lg">
                Comparing Pinned
              </div>
            )}
            {loading ? (
              <div className="animate-pulse flex space-x-4 h-10 items-center">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            ) : result ? (
              <div>
                <h4 className="font-bold text-[var(--on-surface)] mb-2">
                  {result.isMeetingGoal ? 'Congratulations.' : 'Action Required.'}
                </h4>
                <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
                  {result.isMeetingGoal 
                    ? "You're on track to reach your retirement savings goal and will have a surplus at the end of your plan." 
                    : "You have a projected shortfall. Consider saving more, retiring later, or reducing your target income."}
                </p>
                <div className="mt-4 pt-4 border-t border-[var(--surface-container-high)]">
                  <span className="text-xs uppercase font-bold text-[var(--on-surface-variant)] tracking-widest block mb-1">Final Estate Balance</span>
                  <div className="flex items-end gap-3">
                    <span className={`text-2xl font-black ${result.isMeetingGoal ? 'text-[var(--emerald)]' : 'text-red-500'}`}>
                      {formatCurrency(result.surplus)}
                    </span>
                    {pinnedResult && (
                      <span className="text-sm font-semibold text-[var(--on-surface-variant)] line-through mb-1 opacity-60">
                        {formatCurrency(pinnedResult.surplus)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="h-[300px] w-full mt-8 relative">
            {!loading && result && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--vibrant-teal)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--vibrant-teal)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" />
                  <XAxis dataKey="age" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} />
                  <YAxis tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} width={60} />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `Age ${label}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="amount" name="Current Scenario" stroke="var(--vibrant-teal)" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
                  {pinnedResult && (
                    <Area type="monotone" dataKey="pinnedAmount" name="Pinned Scenario" stroke="var(--on-surface-variant)" fill="none" strokeWidth={2} strokeDasharray="4 4" />
                  )}
                  <Area type="step" dataKey="goal" name="Cumulative Goal" stroke="var(--on-surface-variant)" strokeDasharray="5 5" fill="none" opacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <button className="w-full mt-8 bg-[var(--vibrant-teal)] hover:bg-[var(--secondary)] text-white font-bold py-3 px-4 rounded-[var(--radius-md)] transition-colors">
            Contact a Financial Advisor
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetirementCalculator;
