import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Layers, MapPin, AlertCircle, ArrowUpRight } from 'lucide-react';
import { KPITile } from '../components/KPITile';

export const DefectAnalysisPage: React.FC<{ selectedProduct: string }> = ({ selectedProduct }) => {
  const [defectData, setDefectData] = useState<any[]>([]);
  const [shiftsData, setShiftsData] = useState<any[]>([]);
  const [locationsData, setLocationsData] = useState<Record<string, any[]>>({});
  const [activeProd, setActiveProd] = useState<string>(selectedProduct === 'all' ? 'transistor' : selectedProduct);

  useEffect(() => {
    fetch('/api/analytics/defects')
      .then((res) => res.json())
      .then((data) => setDefectData(data))
      .catch(console.error);

    fetch('/api/analytics/shifts')
      .then((res) => res.json())
      .then((data) => setShiftsData(data))
      .catch(console.error);

    fetch('/api/analytics/locations')
      .then((res) => res.json())
      .then((data) => setLocationsData(data))
      .catch(console.error);
  }, []);

  const SEVERITY_COLORS = ['#dc2626', '#ea580c', '#d97706', '#2563eb'];

  const severityPie = [
    { name: 'Critical (Safety/Electrical)', value: 42, color: '#dc2626' },
    { name: 'High (Functional/Assembly)', value: 31, color: '#ea580c' },
    { name: 'Medium (Cosmetic/Edge)', value: 18, color: '#d97706' },
    { name: 'Low (Minor Burrs)', value: 9, color: '#2563eb' }
  ];

  const currentProductLocs = locationsData[activeProd] || [];

  return (
    <div className="space-y-6">
      {/* Header answering: What is happening? */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Operational Level 2 · Defect Diagnostics
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Defect Analysis & Pareto Categorization
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Statistical breakdown of defect taxonomy, severity hierarchy, cross-station comparisons, and spatial cluster maps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Spatial Map Product:</span>
          <select
            value={activeProd}
            onChange={(e) => setActiveProd(e.target.value)}
            className="text-xs font-medium bg-white border border-neutral-300 rounded-md px-3 py-1.5"
          >
            <option value="transistor">Power Transistor</option>
            <option value="metal_nut">Metal Nut</option>
            <option value="cable">Cable Harness</option>
            <option value="zipper">Metal Zipper</option>
            <option value="breakfast_box">Breakfast Box</option>
          </select>
        </div>
      </div>

      {/* Top Defect Diagnostics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPITile
          label="Top Defect Category"
          value="bent_lead / burr"
          subValue="42% of rejects"
          indicatorColor="rose"
        />
        <KPITile
          label="Safety-Critical Ratio"
          value="42.0%"
          subValue="Zero-Tolerance"
          indicatorColor="rose"
        />
        <KPITile
          label="Most Affected Machine"
          value="M-04 (Line 2)"
          subValue="18.6% defect rate"
          indicatorColor="amber"
        />
        <KPITile
          label="Highest Defect Shift"
          value="Shift B (Evening)"
          subValue="8.8% vs 4.1% baseline"
          indicatorColor="amber"
        />
      </div>

      {/* Main Charts: Pareto Chart & Severity Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pareto Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <div>
              <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
                Defect Frequency Pareto Distribution
              </div>
              <div className="text-[11px] text-neutral-500">
                Identifies vital few failure modes responsible for 80% of factory rejects.
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-blue-700">80/20 Principle</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectData.slice(0, 7)} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis
                  dataKey="defect_type"
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Defect Occurrences" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Pie (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <div>
              <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
                Severity & Risk Classification
              </div>
              <div className="text-[11px] text-neutral-500">
                Directly gates the pneumatic actuator response.
              </div>
            </div>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {severityPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-xs">
            {severityPie.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-neutral-700">{item.name}</span>
                </div>
                <span className="font-mono font-semibold tabular-nums text-neutral-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spatial Defect Location Map & Cross-Shift Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spatial 2D Map (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <div>
              <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                Physical Workpiece Defect Spatial Map ({activeProd})
              </div>
              <div className="text-[11px] text-neutral-500">
                2D coordinate scatter pinpoints recurring tooling wear zones on the CAD footprint.
              </div>
            </div>
          </div>

          {/* Simulated 2D Geometry Plane */}
          <div className="relative w-full aspect-16/10 bg-neutral-950 rounded-lg p-4 border border-neutral-300 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Center Cad Wireframe Container */}
            <div className="relative w-3/4 h-3/4 border border-neutral-700/80 rounded flex items-center justify-center">
              <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-widest">
                {activeProd.toUpperCase()} WORKPIECE BOUNDS
              </span>

              {/* Render Spatial Defect Clusters */}
              {currentProductLocs.map((loc, idx) => (
                <div
                  key={idx}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ left: `${loc.x * 100}%`, top: `${loc.y * 100}%` }}
                >
                  <span className="flex h-5 w-5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-600 text-[10px] text-white font-mono font-bold items-center justify-center">
                      {loc.count}
                    </span>
                  </span>
                  {/* Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-neutral-900 border border-neutral-200 px-2 py-1 rounded shadow-md text-[10px] whitespace-nowrap z-20">
                    <strong>{loc.label}</strong>: {loc.count} occurrences
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-neutral-600 space-y-1">
            <div className="font-semibold text-neutral-800">Spatial Finding:</div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Defects strictly localize around contact points with the feeding gripper and wave solder guide pins, suggesting mechanical clearance drift rather than upstream casting voids.
            </p>
          </div>
        </div>

        {/* Cross-Shift Comparison (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <div>
              <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
                Shift-by-Shift Performance Matrix
              </div>
              <div className="text-[11px] text-neutral-500">
                Comparing morning, evening, and night operational windows.
              </div>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="shift" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="defect_rate_pct" fill="#ea580c" radius={[4, 4, 0, 0]} name="Defect Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-neutral-200 rounded-md overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
                <tr>
                  <th className="py-2 px-3">Shift</th>
                  <th className="py-2 px-3 text-right">Inspected</th>
                  <th className="py-2 px-3 text-right">Rejects</th>
                  <th className="py-2 px-3 text-right">Defect %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {shiftsData.map((s, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50">
                    <td className="py-2 px-3 font-sans font-medium text-neutral-800">{s.shift}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{s.total}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-rose-700">{s.rejects}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold">
                      <span className={s.defect_rate_pct > 6 ? 'text-rose-700' : 'text-neutral-700'}>
                        {s.defect_rate_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
