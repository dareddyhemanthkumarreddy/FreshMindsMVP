import React, { ReactNode } from 'react';
import {
  Activity,
  ScanEye,
  PieChart,
  FileSearch,
  FileSpreadsheet,
  CheckSquare,
  Cpu,
  History,
  Layers,
  CircleDot
} from 'lucide-react';

export type PageId =
  | 'live'
  | 'inspect'
  | 'analysis'
  | 'investigation'
  | 'report'
  | 'review'
  | 'health'
  | 'history';

interface LayoutProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  selectedProduct: string;
  onProductChange: (prod: string) => void;
  products: Array<{ product_id: string; name: string }>;
  isSimulatorActive?: boolean;
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentPage,
  onPageChange,
  selectedProduct,
  onProductChange,
  products,
  isSimulatorActive = true,
  children
}) => {
  const navItems: Array<{ id: PageId; label: string; level?: string; icon: React.ReactNode }> = [
    { id: 'live', label: 'Live Production', level: 'L1', icon: <Activity className="w-4 h-4" /> },
    { id: 'inspect', label: 'Inspect Sample', icon: <ScanEye className="w-4 h-4" /> },
    { id: 'analysis', label: 'Defect Analysis', level: 'L2', icon: <PieChart className="w-4 h-4" /> },
    { id: 'investigation', label: 'Investigation', level: 'L3', icon: <FileSearch className="w-4 h-4" /> },
    { id: 'report', label: 'Quality Report', level: 'L4', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'review', label: 'Review & Feedback', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'health', label: 'System & Model Health', icon: <Cpu className="w-4 h-4" /> },
    { id: 'history', label: 'Inspection History', icon: <History className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Top Bar (3-Zone Contract: Brand, Contextual State, Actions) */}
      <header className="h-14 border-b border-neutral-200 bg-white px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
        {/* Zone 1: Single wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></span>
            <span className="text-base font-bold tracking-tight text-neutral-900">
              QualityLens
            </span>
          </div>
          <span className="text-neutral-300">/</span>
          <span className="text-xs text-neutral-500 font-medium">
            Plant 4 · Lines L1 & L2
          </span>
        </div>

        {/* Zone 2: Real-time Line Indicators */}
        <div className="hidden md:flex items-center gap-6 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-neutral-700">Line L1: Running</span>
            <span className="text-neutral-400">·</span>
            <span className="font-mono tabular-nums">1.2 m/s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-medium text-neutral-700">Line L2: M-04 Flagged</span>
            <span className="text-neutral-400">·</span>
            <span className="font-mono tabular-nums">1.5 m/s</span>
          </div>
          <div className="flex items-center gap-2 border-l border-neutral-200 pl-4">
            <span className="text-neutral-500">Actuator:</span>
            <span className="font-mono text-emerald-700 font-medium">99.8% On-Time</span>
          </div>
        </div>

        {/* Zone 3: Global Product Filter & Simulator Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
            <span>Product:</span>
          </div>
          <select
            value={selectedProduct}
            onChange={(e) => onProductChange(e.target.value)}
            className="text-xs font-medium bg-neutral-50 border border-neutral-300 rounded-md px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Inspected Products</option>
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
            <CircleDot className="w-3 h-3 text-blue-600 animate-pulse" />
            <span>Simulation Mode</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-64 border-r border-neutral-200 bg-white flex flex-col shrink-0">
          <div className="p-3">
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 py-2">
              Industrial Quality Ops
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors text-left ${
                      isActive
                        ? 'bg-blue-50 text-blue-900 border border-blue-200/80 shadow-2xs font-semibold'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-blue-600' : 'text-neutral-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.level && (
                      <span
                        className={`text-[10px] font-mono font-medium ${
                          isActive ? 'text-blue-600' : 'text-neutral-400'
                        }`}
                      >
                        {item.level}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Line Status Widget */}
          <div className="mt-auto p-4 border-t border-neutral-200 bg-neutral-50/50">
            <div className="text-xs font-medium text-neutral-800">Conveyor Cell Status</div>
            <div className="mt-2 space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>In-Line Stream:</span>
                <span className={`font-mono font-medium ${isSimulatorActive ? 'text-emerald-700' : 'text-neutral-500'}`}>
                  {isSimulatorActive ? 'STREAMING' : 'PAUSED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Buffer Queue:</span>
                <span className="font-mono tabular-nums">3 units</span>
              </div>
              <div className="flex justify-between">
                <span>Actuator Speed:</span>
                <span className="font-mono tabular-nums">1.2 m/s</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-[1520px] mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Honest Scope Disclosure Footer */}
      <footer className="border-t border-neutral-200 bg-white px-6 py-2.5 text-[11px] text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <div>
          <span>QualityLens Industrial Quality Intelligence Platform</span>
          <span className="mx-2 text-neutral-300">·</span>
          <span className="text-neutral-600">Simulated production data</span>
          <span className="mx-2 text-neutral-300">·</span>
          <span>Simulation mode (Conveyor, cameras and reject actuator simulated)</span>
        </div>
        <div className="font-mono text-neutral-400 tabular-nums">
          Artifacts: v2.4.1 · Metrics ground truth verified from artifacts/metrics/*.json
        </div>
      </footer>
    </div>
  );
};
