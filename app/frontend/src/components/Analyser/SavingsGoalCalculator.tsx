import React, { useEffect, useState } from 'react';
import { useAnalyzer } from './AnalyzerContext';
import PremiumSlider from '../ui/PremiumSlider';
import { analyzeSavingsGoal } from '../../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { HelpCircle, Pin, PinOff } from 'lucide-react';

const SavingsGoalCalculator: React.FC = () => {
  const { state, updateSavingsGoal } = useAnalyzer();
  const inputs = state.savingsGoalInput;
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pinnedResult, setPinnedResult] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const data = await analyzeSavingsGoal(inputs);
        if (isMounted) setResult(data);
      } catch (err) {
        console.error('Failed to calculate savings goal', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    // Add simple debounce
    const timer = setTimeout(fetchAnalysis, 500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [inputs]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val);
  const formatPercentage = (val: number) => `${val}%`;

  const chartData = React.useMemo(() => {
    if (!result) return [];
    
    return [
      {
        name: 'Non-registered',
        Projected: result.projectedNonReg,
        ...(pinnedResult && { Pinned: pinnedResult.projectedNonReg })
      },
      {
        name: 'TFSA',
        Projected: result.projectedTFSA,
        ...(pinnedResult && { Pinned: pinnedResult.projectedTFSA })
      }
    ];
  }, [result, pinnedResult]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column: Inputs */}
      <div className="flex-1 space-y-6">
        <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-sm border border-[var(--outline-variant)]">
          <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-2">Savings Goal Calculator</h2>
          <p className="text-[var(--on-surface-variant)] mb-8">Adjust the sliders to project your potential savings.</p>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-[var(--on-surface)] mb-2">Where do you live? *</label>
              <select
                value={inputs.province}
                onChange={(e) => updateSavingsGoal({ province: e.target.value })}
                className="w-full p-3 rounded-[var(--radius-md)] border border-[var(--outline-variant)] focus:border-[var(--vibrant-teal)] focus:ring-1 focus:ring-[var(--vibrant-teal)] outline-none transition-all bg-white"
              >
                <option value="Alberta">Alberta</option>
                <option value="British Columbia">British Columbia</option>
                <option value="Manitoba">Manitoba</option>
                <option value="New Brunswick">New Brunswick</option>
                <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                <option value="Nova Scotia">Nova Scotia</option>
                <option value="Ontario">Ontario</option>
                <option value="Prince Edward Island">Prince Edward Island</option>
                <option value="Quebec">Quebec</option>
                <option value="Saskatchewan">Saskatchewan</option>
                <option value="Northwest Territories">Northwest Territories</option>
                <option value="Nunavut">Nunavut</option>
                <option value="Yukon">Yukon</option>
              </select>
            </div>

            <PremiumSlider
              label="How much do you want to save? *"
              value={inputs.goalAmount}
              min={2000}
              max={5000000}
              step={10000}
              onChange={(val) => updateSavingsGoal({ goalAmount: val })}
              formatValue={formatCurrency}
            />

            <div>
              <label className="block text-sm font-semibold text-[var(--on-surface)] mb-2">When do you want to reach your goal by? *</label>
              <input 
                type="date"
                value={inputs.goalDate}
                onChange={(e) => updateSavingsGoal({ goalDate: e.target.value })}
                className="w-full p-3 rounded-[var(--radius-md)] border border-[var(--outline-variant)] focus:border-[var(--vibrant-teal)] focus:ring-1 focus:ring-[var(--vibrant-teal)] outline-none transition-all"
              />
            </div>

            <PremiumSlider
              label="How much do you currently have saved?"
              value={inputs.currentSavings}
              min={0}
              max={2000000}
              step={5000}
              onChange={(val) => updateSavingsGoal({ currentSavings: val })}
              formatValue={formatCurrency}
            />

            <PremiumSlider
              label="How much do you contribute on a monthly basis? *"
              value={inputs.monthlyContribution}
              min={0}
              max={50000}
              step={500}
              onChange={(val) => updateSavingsGoal({ monthlyContribution: val })}
              formatValue={formatCurrency}
            />

            <PremiumSlider
              label="Estimated rate of return *"
              value={inputs.rateOfReturn}
              min={0.001}
              max={20}
              step={0.5}
              onChange={(val) => updateSavingsGoal({ rateOfReturn: val })}
              formatValue={formatPercentage}
            />

            <PremiumSlider
              label="What is your annual income? *"
              value={inputs.annualIncome}
              min={0}
              max={2000000}
              step={10000}
              onChange={(val) => updateSavingsGoal({ annualIncome: val })}
              formatValue={formatCurrency}
            />
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
                  This projection calculates the Future Value (FV) of your current savings plus regular contributions over the time horizon. It contrasts standard taxable growth with tax-free growth in a TFSA.
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
            <h4 className="font-bold text-[var(--on-surface)] mb-2">Projected savings</h4>
            {loading ? (
              <div className="animate-pulse flex space-x-4 h-10 items-center">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            ) : result ? (
              <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
                {result.isMeetingGoal ? (
                  <span>Congratulations! You are on track to meet your savings goal of <strong className="text-[var(--emerald)]">{formatCurrency(result.targetAmount)}</strong>.</span>
                ) : (
                  <span>To meet your savings goal, we recommend that you increase your monthly contributions to <strong className="text-[var(--vibrant-teal)]">{formatCurrency(result.recommendedContribution)}</strong> in a Non-registered savings account, or to <strong className="text-[var(--emerald)]">{formatCurrency(result.recommendedTFSA)}</strong> in a TFSA.</span>
                )}
              </p>
            ) : null}
          </div>

          <div className="h-[300px] w-full mt-8 relative">
            {!loading && result && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--outline-variant)" />
                  <XAxis type="number" tickFormatter={(val) => `$${val/1000}k`} tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} width={100} />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="Projected" fill="var(--vibrant-teal)" radius={[0, 4, 4, 0]} barSize={pinnedResult ? 20 : 40} />
                  {pinnedResult && (
                    <Bar dataKey="Pinned" fill="var(--outline)" radius={[0, 4, 4, 0]} barSize={20} opacity={0.5} />
                  )}
                  <ReferenceLine x={result.targetAmount} stroke="var(--on-surface)" strokeDasharray="3 3" label={{ position: 'top', value: 'Goal', fill: 'var(--on-surface)', fontSize: 12 }} />
                </BarChart>
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

export default SavingsGoalCalculator;
