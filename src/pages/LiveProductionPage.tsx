import React, { useState } from 'react';
import {
  Play,
  Pause,
  AlertOctagon,
  Flame,
  EyeOff,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Zap,
  Gauge,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Radio,
  Clock
} from 'lucide-react';
import { KPITile } from '../components/KPITile';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';
import { InspectionRecord } from '../types';

interface LiveProductionPageProps {
  currentInspection: InspectionRecord | null;
  history: InspectionRecord[];
  isSimulatorActive: boolean;
  onToggleSimulator: () => void;
  onInjectFault: (fault: string) => void;
  activeFault: string | null;
  simulatorSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onSelectInspection: (inspection: InspectionRecord) => void;
}

export const LiveProductionPage: React.FC<LiveProductionPageProps> = ({
  currentInspection,
  history,
  isSimulatorActive,
  onToggleSimulator,
  onInjectFault,
  activeFault,
  simulatorSpeed,
  onChangeSpeed,
  onSelectInspection
}) => {
  const [selectedFeedTab, setSelectedFeedTab] = useState<'feed' | 'actuator'>('feed');

  // Compute live KPIs from recent history
  const total = history.length;
  const passes = history.filter((i) => i.result === 'PASS').length;
  const rejects = history.filter((i) => i.result === 'REJECT').length;
  const reviews = history.filter((i) => i.result === 'REVIEW').length;
  const uninspectables = history.filter((i) => i.result === 'UNINSPECTABLE').length;
  const passRate = total > 0 ? ((passes / total) * 100).toFixed(1) : '95.2';
  const defectRate = total > 0 ? ((rejects / total) * 100).toFixed(1) : '4.1';

  const missedDeadlines = history.slice(0, 50).filter((i) => i.missed_deadline).length;
  const actuatorOnTimePct = total > 0 ? (((50 - missedDeadlines) / 50) * 100).toFixed(1) : '99.8';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            Operational Level 1 · In-Line Vision Stream
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Live Production Cell
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Continuous optical quality gating, PatchCore anomaly scoring, and pneumatic actuator orchestration.
          </p>
        </div>

        {/* Conveyor Speed & Live Play/Pause Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-lg shadow-2xs">
            <Gauge className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-xs text-neutral-600 font-medium">Throughput:</span>
            <input
              type="range"
              min="1"
              max="5"
              value={simulatorSpeed}
              onChange={(e) => onChangeSpeed(Number(e.target.value))}
              className="w-20 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-neutral-900 tabular-nums">
              {simulatorSpeed * 2} items/s
            </span>
          </div>

          <button
            onClick={onToggleSimulator}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-all active:scale-[0.99] ${
              isSimulatorActive
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
            }`}
          >
            {isSimulatorActive ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Stream In-Line
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Tiles Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPITile
          label="Total Inspected"
          value={total.toLocaleString()}
          subValue="Continuous"
          indicatorColor="neutral"
        />
        <KPITile
          label="First-Pass Yield"
          value={`${passRate}%`}
          trend={{ direction: 'up', text: '+0.4%', isPositive: true }}
          indicatorColor="emerald"
        />
        <KPITile
          label="Reject Scrap Rate"
          value={`${defectRate}%`}
          trend={{ direction: 'down', text: 'Nominal', isPositive: true }}
          indicatorColor="rose"
        />
        <KPITile
          label="In-Line Latency P50"
          value={`${currentInspection?.total_latency_ms || 41.2} ms`}
          subValue="Budget 120 ms"
          indicatorColor="blue"
        />
        <KPITile
          label="Actuator Timing"
          value={`${actuatorOnTimePct}%`}
          subValue="Pneumatic Pusher"
          indicatorColor="emerald"
        />
      </div>

      {/* Active Fault Notification Banner if active */}
      {activeFault && (
        <div className="bg-rose-50 border border-rose-300 rounded-lg p-3.5 flex items-center justify-between gap-3 text-xs text-rose-950 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
            <div>
              <strong>Active Injected Perturbation:</strong>{' '}
              <span className="font-mono uppercase font-semibold text-rose-800">{activeFault.replace(/_/g, ' ')}</span>{' '}
              <span className="text-rose-700">
                — Demonstrating automated Quality Gate trip, CAM-02 adaptive optical switch, and CUSUM change-point alert.
              </span>
            </div>
          </div>
          <button
            onClick={() => onInjectFault('clear')}
            className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded text-xs font-semibold transition-colors shrink-0"
          >
            Clear Fault & Return to Nominal
          </button>
        </div>
      )}

      {/* Interactive Fault Injection Deck */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Live Demonstration Fault Injection Deck
            </div>
            <p className="text-[11px] text-neutral-500">
              Inject real-world factory perturbations to test the Image Quality Gate, Multi-Camera Recovery, and CUSUM alerting.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <button
            onClick={() => onInjectFault('blur_camera')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeFault === 'blur_camera'
                ? 'bg-rose-50 border-rose-400 text-rose-950 font-semibold shadow-xs'
                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
              Blur Camera
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">Tests Quality Gate blur trigger</div>
          </button>

          <button
            onClick={() => onInjectFault('dark_lighting')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeFault === 'dark_lighting'
                ? 'bg-rose-50 border-rose-400 text-rose-950 font-semibold shadow-xs'
                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <AlertOctagon className="w-3.5 h-3.5 text-neutral-700" />
              Dark Lighting
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">Simulates light fixture trip</div>
          </button>

          <button
            onClick={() => onInjectFault('contaminate_lens')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeFault === 'contaminate_lens'
                ? 'bg-rose-50 border-rose-400 text-rose-950 font-semibold shadow-xs'
                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              Lens Dirt / Oil
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">Triggers CAM-02 recovery</div>
          </button>

          <button
            onClick={() => onInjectFault('defect_heavy_batch')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeFault === 'defect_heavy_batch'
                ? 'bg-rose-50 border-rose-400 text-rose-950 font-semibold shadow-xs'
                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Bad Material Lot
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">Triggers CUSUM change point</div>
          </button>

          <button
            onClick={() => onInjectFault('unseen_defect')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeFault === 'unseen_defect'
                ? 'bg-purple-50 border-purple-400 text-purple-950 font-semibold shadow-xs'
                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Unseen Defect
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">Routes to REVIEW (not reject)</div>
          </button>

          <button
            onClick={() => onInjectFault('clear')}
            className="p-2.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-left transition-all"
          >
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              Nominal Run
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">Clear all injected faults</div>
          </button>
        </div>
      </div>

      {/* Main Grid: Current Workpiece Card + Active In-Line Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (5 cols): Current Workpiece Live Card */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <div className="text-[11px] font-mono text-neutral-400">Current Workpiece in FOV</div>
              <div className="text-base font-bold text-neutral-900 font-mono">
                {currentInspection ? currentInspection.inspection_id : 'WAITING FOR TRIGGER...'}
              </div>
            </div>
            {currentInspection && <StatusBadge status={currentInspection.result} />}
          </div>

          {currentInspection ? (
            <div className="space-y-4">
              {/* Product and In-Line Details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-50 p-3 rounded-md border border-neutral-200/80">
                <div>
                  <span className="text-neutral-500">Product:</span>{' '}
                  <span className="font-semibold text-neutral-900">{currentInspection.product_name}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Line & Unit:</span>{' '}
                  <span className="font-mono text-neutral-900">Line {currentInspection.line} · {currentInspection.machine}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Active Camera:</span>{' '}
                  <span className="font-mono font-semibold text-neutral-900">{currentInspection.camera}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Batch Lot:</span>{' '}
                  <span className="font-mono text-neutral-900">{currentInspection.batch}</span>
                </div>
              </div>

              {/* Quality Gate Status */}
              <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50/50">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-neutral-800">Image Quality Gate (Classical OpenCV)</span>
                  <span className="font-mono font-bold text-neutral-900 tabular-nums">
                    {currentInspection.image_quality_score}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentInspection.image_quality_score >= 70 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, currentInspection.image_quality_score)}%` }}
                  />
                </div>
                {currentInspection.failure_reasons && currentInspection.failure_reasons.length > 0 && (
                  <div className="mt-2 text-[11px] text-rose-800 bg-rose-50 p-2 rounded border border-rose-200">
                    Reasons: {currentInspection.failure_reasons.join(' · ')}
                  </div>
                )}
                {currentInspection.recovery_attempts > 0 && (
                  <div className="mt-2 text-[11px] text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                    Adaptive Recovery Engaged: Re-inspected using {currentInspection.camera} (Score recovered to {currentInspection.image_quality_score}%)
                  </div>
                )}
              </div>

              {/* Decision & Plain-Language Explanation */}
              <div className="border border-neutral-200 rounded-lg p-3.5 space-y-2 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-800 uppercase">Decision Engine Output</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-500">Severity:</span>
                    <SeverityBadge severity={currentInspection.severity} />
                  </div>
                </div>
                <p className="text-xs text-neutral-800 bg-neutral-50 p-3 rounded border border-neutral-200/80 leading-relaxed font-medium">
                  {currentInspection.explanation}
                </p>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                  <span>Confidence: <strong className="font-mono text-neutral-900">{(currentInspection.confidence * 100).toFixed(1)}%</strong></span>
                  <span>Model: <span className="font-mono text-neutral-700">{currentInspection.model_version}</span></span>
                </div>
              </div>

              {/* Timing Budget Progress */}
              <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50/50">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-neutral-800">End-to-End Latency vs Reject Deadline</span>
                  <span className={`font-mono font-bold tabular-nums ${currentInspection.missed_deadline ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {currentInspection.total_latency_ms} ms / {currentInspection.timing_deadline_ms} ms
                  </span>
                </div>
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${currentInspection.missed_deadline ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, (currentInspection.total_latency_ms / currentInspection.timing_deadline_ms) * 100)}%` }}
                  />
                </div>
                {currentInspection.missed_deadline && (
                  <div className="mt-1.5 text-[11px] font-bold text-rose-700">
                    MISSED DEADLINE: Actuator timing window breached!
                  </div>
                )}
              </div>

              <button
                onClick={() => onSelectInspection(currentInspection)}
                className="w-full py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 shadow-2xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Inspect Full Evidence & Stage Breakdown</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-neutral-400">
              Conveyor paused. Press "Stream In-Line" above to start live captures.
            </div>
          )}
        </div>

        {/* Right Col (7 cols): In-Line Inspection Stream & Actuator Logs */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs flex flex-col">
          {/* Segmented Control */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-3">
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-md">
              <button
                onClick={() => setSelectedFeedTab('feed')}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                  selectedFeedTab === 'feed' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                In-Line Inspection Stream ({history.length})
              </button>
              <button
                onClick={() => setSelectedFeedTab('actuator')}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                  selectedFeedTab === 'actuator' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Pneumatic Actuator Actions
              </button>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Ingestion
            </span>
          </div>

          {selectedFeedTab === 'feed' ? (
            <div className="flex-1 overflow-y-auto max-h-[520px] divide-y divide-neutral-100">
              {history.slice(0, 30).map((item) => (
                <div
                  key={item.inspection_id}
                  onClick={() => onSelectInspection(item)}
                  className="py-2.5 px-2 hover:bg-blue-50/50 rounded-md cursor-pointer transition-colors flex items-center justify-between text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.result} size="sm" />
                    <div>
                      <div className="font-mono font-bold text-neutral-900 group-hover:text-blue-700 transition-colors">
                        {item.inspection_id}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {item.product_name} · Line {item.line} ({item.machine})
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono tabular-nums">
                      {item.defect_type !== 'none' ? (
                        <span className="text-rose-700 font-bold">{item.defect_type}</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Nominal</span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400 tabular-nums">
                      {item.total_latency_ms} ms · CAM {item.camera}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[520px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 bg-neutral-50 font-medium">
                    <th className="py-2 px-3">Inspection ID</th>
                    <th className="py-2 px-3">Action</th>
                    <th className="py-2 px-3">Destination</th>
                    <th className="py-2 px-3 text-right">Latency</th>
                    <th className="py-2 px-3 text-right">Timing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {history.slice(0, 20).map((item, idx) => {
                    const action = item.result === 'REJECT' ? 'EJECT_PUSHER' : (item.result === 'REVIEW' ? 'DIVERTER_REVIEW' : 'PASS_THROUGH');
                    const bin = item.result === 'REJECT' ? 'SCRAP_CHUTE' : (item.result === 'REVIEW' ? 'QC_BUFFER' : 'CONVEYOR_CONTINUE');
                    return (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="py-2.5 px-3 font-medium text-neutral-900">{item.inspection_id}</td>
                        <td className="py-2.5 px-3">
                          <span className={item.result === 'REJECT' ? 'text-rose-700 font-bold' : (item.result === 'REVIEW' ? 'text-amber-800' : 'text-neutral-600')}>
                            {action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-600">{bin}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">{item.total_latency_ms} ms</td>
                        <td className="py-2.5 px-3 text-right">
                          {item.missed_deadline ? (
                            <span className="text-rose-600 font-bold">LATE</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">ON-TIME</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
