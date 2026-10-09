import React, { useState } from 'react';
import {
  Upload,
  Layers,
  Eye,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sliders,
  RefreshCw,
  AlertTriangle,
  FileImage,
  Sparkles,
  Zap
} from 'lucide-react';
import { HeatmapCanvas } from '../components/HeatmapCanvas';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';
import { InspectionRecord, ProductProfile } from '../types';

interface InspectPageProps {
  inspection: InspectionRecord | null;
  productProfile?: ProductProfile;
  onInspectNew: (productId: string, options: { simulateDefect?: boolean; simulateBlur?: boolean; simulateDark?: boolean }) => void;
  availableProducts: ProductProfile[];
}

export const InspectPage: React.FC<InspectPageProps> = ({
  inspection,
  productProfile,
  onInspectNew,
  availableProducts
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(productProfile?.product_id || 'transistor');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showBoxes, setShowBoxes] = useState(true);
  const [simulateDefect, setSimulateDefect] = useState(true);
  const [simulateBlur, setSimulateBlur] = useState(false);
  const [simulateDark, setSimulateDark] = useState(false);
  const [customFileLoaded, setCustomFileLoaded] = useState<string | null>(null);

  const activeProduct = availableProducts.find((p) => p.product_id === selectedProductId) || availableProducts[0];
  const hasDefect = inspection ? inspection.result === 'REJECT' || inspection.result === 'REVIEW' : true;

  const handleProductSelect = (pId: string) => {
    setSelectedProductId(pId);
    setCustomFileLoaded(null);
    onInspectNew(pId, { simulateDefect, simulateBlur, simulateDark });
  };

  const handleRunInspection = () => {
    onInspectNew(selectedProductId, {
      simulateDefect,
      simulateBlur,
      simulateDark
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomFileLoaded(event.target.result as string);
          onInspectNew(selectedProductId, { simulateDefect: true, simulateBlur: false, simulateDark: false });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Stage Latencies Waterfall
  const stages = inspection?.stage_latency
    ? [
        { name: '1. Image Capture', ms: inspection.stage_latency.capture_ms },
        { name: '2. Quality Gate', ms: inspection.stage_latency.quality_gate_ms },
        { name: '3. Variant Identification', ms: inspection.stage_latency.identification_ms },
        { name: '4. PatchCore Feature Inference', ms: inspection.stage_latency.inference_ms, highlight: true },
        { name: '5. Heatmap & Post-processing', ms: inspection.stage_latency.postprocess_ms },
        { name: '6. Quality Decision Logic', ms: inspection.stage_latency.decision_ms },
        { name: '7. Pneumatic Actuator Signal', ms: inspection.stage_latency.actuation_ms }
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Diagnostic Inspection Workbench
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Single-Sample Evidence & Decision Breakdown
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Detailed optical inspection evidence, calibrated anomaly saliency heatmaps, critical-zone intersection, and per-stage latency telemetry.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 rounded-md text-xs font-semibold shadow-2xs cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Workpiece</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleRunInspection}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Execute Pipeline
          </button>
        </div>
      </div>

      {/* Quick Product Selection Bar */}
      <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-2xs">
        <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Inspect Reference Product Profile</span>
          <span className="font-mono text-neutral-400">5 MVTec AD / LOCO AD Profiles Loaded</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {availableProducts.map((p) => {
            const isSelected = p.product_id === selectedProductId;
            return (
              <button
                key={p.product_id}
                onClick={() => handleProductSelect(p.product_id)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-neutral-900'}`}>
                    {p.name}
                  </span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">{p.dataset}</div>
                <div className="text-[10px] font-mono text-neutral-400 mt-1 tabular-nums">
                  Budget: {p.deadline_budget_ms} ms · {p.nominal_speed_mps} m/s
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overlay & Perturbation Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-600" /> Layer Overlays:
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 hover:text-neutral-900 font-medium">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="accent-blue-600 w-3.5 h-3.5"
            />
            PatchCore Heatmap
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 hover:text-neutral-900 font-medium">
            <input
              type="checkbox"
              checked={showZones}
              onChange={(e) => setShowZones(e.target.checked)}
              className="accent-blue-600 w-3.5 h-3.5"
            />
            Critical Inspection Zones
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 hover:text-neutral-900 font-medium">
            <input
              type="checkbox"
              checked={showBoxes}
              onChange={(e) => setShowBoxes(e.target.checked)}
              className="accent-blue-600 w-3.5 h-3.5"
            />
            Defect Bounding Box
          </label>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-neutral-200 pt-2 sm:pt-0 sm:pl-4">
          <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-600" /> Pipeline Test States:
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 hover:text-neutral-900 font-medium">
            <input
              type="checkbox"
              checked={simulateDefect}
              onChange={(e) => setSimulateDefect(e.target.checked)}
              className="accent-rose-600 w-3.5 h-3.5"
            />
            Injected Defect
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 hover:text-neutral-900 font-medium">
            <input
              type="checkbox"
              checked={simulateBlur}
              onChange={(e) => setSimulateBlur(e.target.checked)}
              className="accent-amber-600 w-3.5 h-3.5"
            />
            Trip Blur Gate
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 hover:text-neutral-900 font-medium">
            <input
              type="checkbox"
              checked={simulateDark}
              onChange={(e) => setSimulateDark(e.target.checked)}
              className="accent-neutral-600 w-3.5 h-3.5"
            />
            Trip Dark Gate
          </label>
        </div>
      </div>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Telecentric Vision Canvas */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <div>
              <div className="text-[11px] font-mono text-neutral-400">Telecentric Vision Ingestion</div>
              <div className="text-sm font-bold text-neutral-900 font-mono">
                {inspection?.inspection_id || 'INS-ACTIVE-FOV'}
              </div>
            </div>
            {inspection && <StatusBadge status={inspection.result} />}
          </div>

          {/* Interactive Heatmap Canvas */}
          <HeatmapCanvas
            imageSrc={customFileLoaded || activeProduct?.image || '/src/assets/images/transistor_inspection_1791490274961.jpg'}
            hasDefect={hasDefect}
            defectType={inspection?.defect_type || 'Defect'}
            anomalyScore={inspection ? (inspection.result === 'PASS' ? 0.28 : 0.82) : 0.78}
            criticalZones={[
              { id: 'Z1', name: 'Critical Leads', bbox_norm: [0.55, 0.2, 0.95, 0.8], safety_critical: true },
              { id: 'Z2', name: 'Mounting Flange', bbox_norm: [0.05, 0.25, 0.4, 0.75], safety_critical: false }
            ]}
            regions={inspection?.regions || []}
            showHeatmap={showHeatmap}
            showZones={showZones}
            showBoxes={showBoxes}
          />

          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-100 font-mono">
            <span>Primary Sensor: CAM-01 Telecentric</span>
            <span>Trigger: Optical Proximity Beam</span>
          </div>
        </div>

        {/* Right Column (7 cols): Decision, Quality Gate & Recovery Timeline */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Quality Decision Engine Card */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Quality Decision Engine Verdict
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500">Severity:</span>
                <SeverityBadge severity={inspection?.severity || 'none'} />
              </div>
            </div>

            <div className="bg-blue-50/70 p-3.5 rounded-lg border border-blue-200/80 text-xs text-blue-950 leading-relaxed font-medium">
              {inspection?.explanation || 'All feature embeddings within calibrated bounds.'}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                <div className="text-[11px] text-neutral-500">Defect Class</div>
                <div className="font-semibold text-neutral-900 mt-0.5">{inspection?.defect_type || 'None'}</div>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                <div className="text-[11px] text-neutral-500">AI Confidence</div>
                <div className="font-mono font-bold text-neutral-900 mt-0.5">
                  {inspection ? `${(inspection.confidence * 100).toFixed(1)}%` : '98.5%'}
                </div>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                <div className="text-[11px] text-neutral-500">Critical Zone Hit</div>
                <div className={`font-semibold mt-0.5 ${inspection?.critical_zone ? 'text-rose-700 font-bold' : 'text-neutral-600'}`}>
                  {inspection?.critical_zone ? 'YES (Escalated)' : 'NO'}
                </div>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                <div className="text-[11px] text-neutral-500">Pneumatic Actuator</div>
                <div className="font-mono font-bold text-neutral-900 mt-0.5">
                  {inspection?.result === 'REJECT' ? 'PNEUMATIC EJECT' : (inspection?.result === 'REVIEW' ? 'QC BUFFER' : 'CONVEY')}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Image Quality Gate Card (OpenCV metrics) */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
                Image Quality Gate (Classical Pre-Inference Validation)
              </div>
              <span className={`font-mono text-xs font-bold ${
                (inspection?.image_quality_score || 94) >= 70 ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                Score: {inspection?.image_quality_score || 94.2}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 border border-neutral-200 rounded bg-neutral-50">
                <div className="text-[11px] text-neutral-500">Laplacian Sharpness</div>
                <div className="font-mono font-semibold text-neutral-800">
                  {simulateBlur ? '48.2 (FAIL)' : '214.5 (PASS)'}
                </div>
              </div>
              <div className="p-2 border border-neutral-200 rounded bg-neutral-50">
                <div className="text-[11px] text-neutral-500">Mean Luminance</div>
                <div className="font-mono font-semibold text-neutral-800">
                  {simulateDark ? '28.4 lux (FAIL)' : '136.2 lux (PASS)'}
                </div>
              </div>
              <div className="p-2 border border-neutral-200 rounded bg-neutral-50">
                <div className="text-[11px] text-neutral-500">Specular Saturation</div>
                <div className="font-mono font-semibold text-neutral-800">1.1% (PASS)</div>
              </div>
              <div className="p-2 border border-neutral-200 rounded bg-neutral-50">
                <div className="text-[11px] text-neutral-500">Boundary Centering</div>
                <div className="font-mono font-semibold text-neutral-800">96.4% (PASS)</div>
              </div>
            </div>

            {inspection?.failure_reasons && inspection.failure_reasons.length > 0 && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
                <strong>Failure Reasons:</strong> {inspection.failure_reasons.join(' · ')}
              </div>
            )}
          </div>

          {/* 3. Multi-Camera Recovery Timeline */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
                Multi-Camera Recovery Timeline (Same Inspection ID)
              </div>
              <span className="text-[11px] text-neutral-500">
                Attempts: {inspection?.recovery_attempts || 0} / 2 max
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded border border-neutral-200 bg-neutral-50">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-neutral-700">Attempt 1 (CAM-01):</span>
                  <span className="text-neutral-600">Primary In-Line Capture</span>
                </div>
                <span className={inspection?.recovery_attempts ? 'text-rose-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                  {inspection?.recovery_attempts ? 'TRIGGERED QUALITY RETRY' : 'PASSED'}
                </span>
              </div>

              {inspection?.recovery_attempts && inspection.recovery_attempts > 0 ? (
                <div className="flex items-center justify-between p-2.5 rounded border border-emerald-200 bg-emerald-50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-900">Attempt 2 (CAM-02):</span>
                    <span className="text-emerald-800">Adaptive Telecentric Zoom + Polarized Diffuse Ring</span>
                  </div>
                  <span className="text-emerald-700 font-bold">RECOVERED (Score 89.2%)</span>
                </div>
              ) : (
                <div className="text-[11px] text-neutral-400 italic px-2">
                  No recovery required. Primary camera passed quality thresholds on first pass.
                </div>
              )}
            </div>
          </div>

          {/* 4. Per-Stage Latency Breakdown */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
                Per-Stage Pipeline Latency Breakdown
              </div>
              <div className="font-mono text-xs font-bold text-neutral-900">
                Total: {inspection?.total_latency_ms || 41.2} ms (Deadline {activeProduct?.deadline_budget_ms || 120} ms)
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              {stages.map((st, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className={`w-48 truncate text-[11px] ${(st as any).highlight ? 'font-bold text-blue-900' : 'text-neutral-600'}`}>
                    {st.name}
                  </span>
                  <div className="flex-1 bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${(st as any).highlight ? 'bg-blue-600' : 'bg-neutral-400'}`}
                      style={{ width: `${Math.min(100, (st.ms / (inspection?.total_latency_ms || 50)) * 100)}%` }}
                    />
                  </div>
                  <span className="w-16 font-mono text-right tabular-nums text-neutral-700 text-[11px]">
                    {st.ms} ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
