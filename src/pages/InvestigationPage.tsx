import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FileSearch, AlertTriangle, ShieldAlert, CheckCircle, Info, Sparkles, ArrowRight, Wrench } from 'lucide-react';
import { KPITile } from '../components/KPITile';

export const InvestigationPage: React.FC = () => {
  const [trends, setTrends] = useState<any[]>([]);
  const [factors, setFactors] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [linestop, setLinestop] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics/trends')
      .then((res) => res.json())
      .then(setTrends)
      .catch(console.error);

    fetch('/api/analytics/factors')
      .then((res) => res.json())
      .then(setFactors)
      .catch(console.error);

    fetch('/api/analytics/events')
      .then((res) => res.json())
      .then(setEvents)
      .catch(console.error);

    fetch('/api/linestop')
      .then((res) => res.json())
      .then(setLinestop)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header answering: What is happening? */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Operational Level 3 · Statistical Root Cause Investigation
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Investigation & Change-Point Analysis
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            CUSUM & EWMA change-point detection aligned with physical events, relative risk lift analysis, and line-stop governance.
          </p>
        </div>
      </div>

      {/* Top Diagnostic Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Product vs System Discriminator Verdict */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-2xs space-y-2 border-l-4 border-l-blue-600">
          <div className="text-xs font-bold text-neutral-800 uppercase flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            Product vs. Vision System Verdict
          </div>
          <div className="text-sm font-bold text-neutral-900">
            GENUINE PRODUCT ANOMALY
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Optical quality scores remain high (&gt;92%), confirming the sudden defect surge is a physical machining/raw material failure rather than camera sensor degradation.
          </p>
          <div className="text-[11px] text-blue-700 font-medium">Confidence: 98% (Optical Gate Passed)</div>
        </div>

        {/* Card 2: CUSUM Early Warning Trigger */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-2xs space-y-2 border-l-4 border-l-rose-600">
          <div className="text-xs font-bold text-neutral-800 uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Statistical Change-Point Alert
          </div>
          <div className="text-sm font-bold text-rose-700">
            CUSUM Alarm: S+ = 5.82 (&gt; 4.5 Threshold)
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Statistically significant upward defect rate shift detected on Oct 8 at 11:42. Baseline shifted from 4.2% to 18.6%.
          </p>
          <div className="text-[11px] text-rose-700 font-medium">Correlated with Machine M-04 tooling wear</div>
        </div>

        {/* Card 3: Line-Stop Advisory Card */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-2xs space-y-2 border-l-4 border-l-amber-500">
          <div className="text-xs font-bold text-neutral-800 uppercase flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            Line-Stop Recommendation Engine
          </div>
          <div className="text-sm font-bold text-amber-800">
            {linestop ? linestop.recommendation : 'RECOMMEND_LINE_PAUSE_ON_M04'}
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {linestop?.rationale || 'Elevated defect rate exceeds the 12.0% risk threshold for 3 consecutive windows with confirmed critical-zone thread damage.'}
          </p>
          <div className="text-[11px] text-neutral-500 font-mono">
            {linestop?.auto_stopped ? 'Auto-Stopped' : 'Human confirmation required (Never auto-stops)'}
          </div>
        </div>
      </div>

      {/* CUSUM / EWMA Change-Point Chart with Event Markers */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-neutral-200 gap-2">
          <div>
            <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
              Sequential Defect Rate EWMA & CUSUM Trajectory
            </div>
            <div className="text-[11px] text-neutral-500">
              Correlates statistical shift points directly with factory process changes.
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-600"></span>
              <span className="text-neutral-700">EWMA Defect %</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-600"></span>
              <span className="text-neutral-700">CUSUM Statistic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-neutral-700">Process Events</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} interval={3} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
              />
              <ReferenceLine y={4.5} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'CUSUM Alarm Limit (4.5)', fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }} />
              <Line type="monotone" dataKey="ewma_rate_pct" stroke="#2563eb" strokeWidth={2.5} dot={false} name="EWMA Defect Rate %" />
              <Line type="monotone" dataKey="cusum_statistic" stroke="#dc2626" strokeWidth={2} dot={false} name="CUSUM Statistic S+" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contributing-Factor Analysis Table with Lift */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <div>
            <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
              Contributing-Factor Analysis (Relative Risk & Lift)
            </div>
            <div className="text-[11px] text-neutral-500">
              Evaluates statistical association across Machines, Batches, Shifts, and Cameras. (Minimum sample guard: n &gt; 15).
            </div>
          </div>
          <span className="text-xs text-neutral-400 font-mono">Strict association terminology</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-medium">
                <th className="py-2.5 px-3">Dimension</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3 text-right">Sample (n)</th>
                <th className="py-2.5 px-3 text-right">Defect Rate</th>
                <th className="py-2.5 px-3 text-right">Baseline Rate</th>
                <th className="py-2.5 px-3 text-right">Lift</th>
                <th className="py-2.5 px-3">Statistical Finding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {factors.map((f, idx) => (
                <tr key={idx} className="hover:bg-neutral-50">
                  <td className="py-3 px-3 font-sans font-semibold capitalize text-neutral-900">{f.dimension}</td>
                  <td className="py-3 px-3 font-bold text-blue-700">{f.value}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{f.sample_size}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-rose-700 font-bold">{f.defect_rate}%</td>
                  <td className="py-3 px-3 text-right tabular-nums text-neutral-500">{f.baseline_rate}%</td>
                  <td className="py-3 px-3 text-right tabular-nums font-bold text-amber-800">
                    {f.lift}x
                  </td>
                  <td className="py-3 px-3 font-sans text-neutral-700 text-[11px]">{f.association}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Correlated Factory Process Events Timeline */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-3">
        <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight pb-2 border-b border-neutral-200">
          Factory Process Event Timeline (Correlated with Shift Points)
        </div>

        <div className="space-y-3 pt-1">
          {events.map((evt) => (
            <div key={evt.id} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-md border border-neutral-200/80 text-xs">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-md shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">{evt.title}</span>
                  <span className="font-mono text-neutral-500 tabular-nums">{evt.timestamp}</span>
                </div>
                <p className="text-neutral-600">{evt.description}</p>
                <div className="text-blue-700 font-medium">Impact: {evt.impact}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
