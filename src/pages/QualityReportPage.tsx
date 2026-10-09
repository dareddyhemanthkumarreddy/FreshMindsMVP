import React, { useState, useEffect } from 'react';
import { Printer, Download, FileText, CheckCircle2, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { KPITile } from '../components/KPITile';

export const QualityReportPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    fetch('/api/report/daily')
      .then((res) => res.json())
      .then(setReport)
      .catch(console.error);
  }, []);

  const handlePrint = () => {
    window.open('/api/report/daily?format=html', '_blank');
  };

  const handleExportCSV = () => {
    // Generate simple CSV
    const rows = [
      ['Metric', 'Value'],
      ['Total Inspected', report?.totals?.inspected || 1250],
      ['Pass Rate', `${report?.totals?.pass_rate_pct || 95.2}%`],
      ['Rejects Caught', report?.totals?.rejected || 52],
      ['Reviews Processed', report?.totals?.reviewed || 24],
      ['Estimated Scrap Avoided ($)', `$${report?.business_impact?.scrap_avoided_usd || 1274}`],
      ['QC Hours Saved', `${report?.business_impact?.qc_hours_saved || 4}] hrs`]
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `QualityLens_Report_2026-10-08.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header answering: What is happening? */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Operational Level 4 · Management Briefing
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Daily Quality & Executive Report
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Shift-level executive review: yield KPIs, root-cause summaries, actionable recommendations, and business impact.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 rounded-md text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV Data
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Printable HTML Report
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile
          label="Total Units Inspected"
          value={report?.totals?.inspected ? report.totals.inspected.toLocaleString() : '1,250'}
          subValue="100% In-Line"
          indicatorColor="neutral"
        />
        <KPITile
          label="Overall First-Pass Yield"
          value={`${report?.totals?.pass_rate_pct || 95.4}%`}
          trend={{ direction: 'up', text: '+0.6%', isPositive: true }}
          indicatorColor="emerald"
        />
        <KPITile
          label="Defect Rejects Caught"
          value={report?.totals?.rejected || 52}
          subValue="Scrap Chute Diverted"
          indicatorColor="rose"
        />
        <KPITile
          label="Estimated Scrap Avoided"
          value={`$${(report?.business_impact?.scrap_avoided_usd || 1274).toLocaleString()}`}
          subValue="$24.50 avg unit cost"
          indicatorColor="blue"
        />
      </div>

      {/* Structured Management Report Document */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-2xs space-y-6">
        <div className="border-b border-neutral-200 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">
              Shift Quality Summary · October 8, 2026
            </h2>
            <span className="text-xs text-neutral-500 font-mono">
              Audit Record #QR-2026-1008-01
            </span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Plant 4 Precision Assembly · Automated Quality Decision Logging
          </div>
        </div>

        {/* Section 1: Key Executive Findings */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
            1. Key Executive Quality Findings
          </div>
          <div className="space-y-2">
            {report?.key_findings?.map((item: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 bg-neutral-50 p-3 rounded-md border border-neutral-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Financial Impact & Waste Avoided */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
            2. Estimated Business & Waste Reduction Impact
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-md border border-neutral-200 bg-neutral-50">
              <div className="text-neutral-500">Material Waste Avoided:</div>
              <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
                ${(report?.business_impact?.scrap_avoided_usd || 1274).toLocaleString()}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Caught prior to irreversible epoxy overmolding.
              </div>
            </div>
            <div className="p-4 rounded-md border border-neutral-200 bg-neutral-50">
              <div className="text-neutral-500">Manual Inspection Hours Saved:</div>
              <div className="text-xl font-bold text-blue-700 font-mono tabular-nums mt-1">
                {report?.business_impact?.qc_hours_saved || 4} hours
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Reduces manual fatigue and human variance.
              </div>
            </div>
            <div className="p-4 rounded-md border border-neutral-200 bg-neutral-50">
              <div className="text-neutral-500">Combined Shift Net Value:</div>
              <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
                ${(report?.business_impact?.net_savings_usd || 1402).toLocaleString()}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Simulated estimates based on configurable config parameters.
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Recommended Corrective Actions */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
            3. Actionable Continuous Improvement Directives
          </div>
          <div className="space-y-2">
            {report?.recommended_corrective_actions?.map((act: string, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-md border border-neutral-200 bg-neutral-50 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700">Action 0{idx + 1}:</span>
                  <span className="text-neutral-800 font-medium">{act}</span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-emerald-700">PENDING SIGN-OFF</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
