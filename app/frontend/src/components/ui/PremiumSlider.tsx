import React from 'react';

interface PremiumSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
}

const PremiumSlider: React.FC<PremiumSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue = (v) => v.toString()
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-3 group">
      <div className="flex justify-between items-end">
        <label className="text-sm font-semibold text-[var(--on-surface)] group-hover:text-[var(--secondary)] transition-colors">
          {label}
        </label>
        <span className="text-sm font-bold text-[var(--secondary)] bg-[var(--secondary-container)] px-2 py-1 rounded-md">
          {formatValue(value)}
        </span>
      </div>
      
      <div className="relative h-2 bg-[var(--surface-container-high)] rounded-full">
        <div 
          className="absolute top-0 left-0 h-full bg-[var(--vibrant-teal)] rounded-full"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Custom thumb to match DESIGN.md */}
        <div 
          className="absolute top-1/2 -mt-3 w-6 h-6 bg-white border-4 border-[var(--vibrant-teal)] rounded-full shadow-md pointer-events-none transition-transform group-hover:scale-110"
          style={{ left: `calc(${percentage}% - 12px)` }}
        />
      </div>
      <div className="flex justify-between text-xs font-medium text-[var(--on-surface-variant)] opacity-60">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

export default PremiumSlider;
