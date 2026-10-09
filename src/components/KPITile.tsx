import React from 'react';

interface KPITileProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
    isPositive?: boolean;
  };
  indicatorColor?: 'emerald' | 'rose' | 'amber' | 'blue' | 'neutral';
}

export const KPITile: React.FC<KPITileProps> = ({
  label,
  value,
  subValue,
  trend,
  indicatorColor = 'neutral'
}) => {
  const getIndicatorBorder = () => {
    switch (indicatorColor) {
      case 'emerald': return 'border-l-4 border-l-emerald-600';
      case 'rose': return 'border-l-4 border-l-rose-600';
      case 'amber': return 'border-l-4 border-l-amber-500';
      case 'blue': return 'border-l-4 border-l-blue-600';
      default: return 'border-l-4 border-l-neutral-300';
    }
  };

  return (
    <div className={`bg-white border border-neutral-200 rounded-lg p-4 shadow-xs ${getIndicatorBorder()}`}>
      <div className="text-xs font-medium text-neutral-500 tracking-tight">{label}</div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums">
          {value}
        </div>
        {subValue && (
          <span className="text-xs text-neutral-500 font-mono tabular-nums">
            {subValue}
          </span>
        )}
      </div>
      {trend && (
        <div className="mt-2 text-xs flex items-center gap-1">
          <span
            className={`font-medium ${
              trend.isPositive ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {trend.text}
          </span>
          <span className="text-neutral-400">vs shift baseline</span>
        </div>
      )}
    </div>
  );
};
