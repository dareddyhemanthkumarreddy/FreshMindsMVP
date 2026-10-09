import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { InspectionResult, SeverityLevel } from '../types';

interface StatusBadgeProps {
  status: InspectionResult | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = status.toUpperCase();
  const isSm = size === 'sm';

  if (s === 'PASS') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-md ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
        <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        PASS
      </span>
    );
  }

  if (s === 'REJECT') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium text-rose-700 bg-rose-50 border border-rose-200/80 rounded-md ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
        <XCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        REJECT
      </span>
    );
  }

  if (s === 'REVIEW') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium text-amber-800 bg-amber-50 border border-amber-200/80 rounded-md ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
        <AlertTriangle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        REVIEW
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100 border border-slate-200/80 rounded-md ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
      <HelpCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      UNINSPECTABLE
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: SeverityLevel }> = ({ severity }) => {
  const s = severity?.toLowerCase();
  if (s === 'critical') {
    return <span className="text-rose-700 font-semibold text-xs tracking-tight uppercase">Critical</span>;
  }
  if (s === 'high') {
    return <span className="text-orange-700 font-semibold text-xs tracking-tight uppercase">High</span>;
  }
  if (s === 'medium') {
    return <span className="text-amber-700 font-medium text-xs tracking-tight uppercase">Medium</span>;
  }
  if (s === 'low') {
    return <span className="text-blue-700 font-medium text-xs tracking-tight uppercase">Low</span>;
  }
  return <span className="text-neutral-400 font-normal text-xs uppercase">—</span>;
};
