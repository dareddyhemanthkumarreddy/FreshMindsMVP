import React, { useState } from 'react';
import { CheckSquare, CheckCircle, XCircle, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';
import { InspectionRecord } from '../types';

interface ReviewFeedbackPageProps {
  inspections: InspectionRecord[];
  onReviewSubmit: (id: string, action: string, reason: string, annotatedDefect?: string) => void;
}

export const ReviewFeedbackPage: React.FC<ReviewFeedbackPageProps> = ({
  inspections,
  onReviewSubmit
}) => {
  const reviewQueue = inspections.filter((i) => i.result === 'REVIEW' || i.reviewed_by_human);
  const [selectedItem, setSelectedItem] = useState<InspectionRecord | null>(reviewQueue[0] || null);
  const [overrideReason, setOverrideReason] = useState('');
  const [annotatedType, setAnnotatedType] = useState('nominal');

  // Compute stats
  const totalReviewed = inspections.filter((i) => i.reviewed_by_human).length;
  const fpCount = inspections.filter((i) => i.human_override?.action === 'OVERRIDE_PASS').length;
  const confirmedCount = inspections.filter((i) => i.human_override?.action === 'CONFIRM' || i.human_override?.action === 'OVERRIDE_REJECT').length;
  const retrainingCandidatesCount = reviewQueue.length;

  const handleAction = (action: string) => {
    if (!selectedItem) return;
    onReviewSubmit(selectedItem.inspection_id, action, overrideReason || 'Standard QA Verification', annotatedType);
    setOverrideReason('');
  };

  const handleExportRetrainingData = () => {
    const payload = reviewQueue.map((item) => ({
      id: item.inspection_id,
      product: item.product_id,
      confidence: item.confidence,
      original_decision: item.decision,
      human_verdict: item.human_override?.action || 'PENDING',
      annotated_label: item.human_override?.annotated_defect || item.defect_type,
      exported_at: new Date().toISOString()
    }));
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `qualitylens_retraining_set_${Date.now()}.json`);
    dl.click();
  };

  return (
    <div className="space-y-6">
      {/* Header answering: What is happening? */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Human-in-the-Loop Verification
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Review Queue & Retraining Feedback Loop
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Inspector verification of borderline scores, novel unknown anomalies, and continuous learning pool export.
          </p>
        </div>

        <button
          onClick={handleExportRetrainingData}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export Retraining Dataset ({retrainingCandidatesCount} items)
        </button>
      </div>

      {/* Review Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-2xs">
          <div className="text-neutral-500 font-medium">Pending in Review Queue</div>
          <div className="text-2xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {reviewQueue.filter((i) => !i.reviewed_by_human).length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Diverted to manual buffer</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-2xs">
          <div className="text-neutral-500 font-medium">Human Decisions Logged</div>
          <div className="text-2xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {totalReviewed}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Operator audit trail</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-2xs">
          <div className="text-neutral-500 font-medium">False Positives Overridden</div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            {fpCount}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Saved from scrap chute</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-2xs">
          <div className="text-neutral-500 font-medium">Defects Confirmed</div>
          <div className="text-2xl font-bold text-rose-700 font-mono tabular-nums mt-1">
            {confirmedCount}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">Validated model accuracy</div>
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List: Pending Items Queue */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs flex flex-col">
          <div className="text-xs font-bold text-neutral-800 uppercase tracking-tight pb-2 border-b border-neutral-200">
            Workpieces Requiring Human Verdict
          </div>

          <div className="flex-1 overflow-y-auto max-h-[560px] divide-y divide-neutral-100 mt-2">
            {reviewQueue.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                Review queue empty. All line inspections operating within confident automated bounds.
              </div>
            ) : (
              reviewQueue.map((item) => (
                <div
                  key={item.inspection_id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 cursor-pointer rounded-md transition-colors ${
                    selectedItem?.inspection_id === item.inspection_id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-neutral-900">{item.inspection_id}</span>
                    <StatusBadge status={item.result} size="sm" />
                  </div>
                  <div className="text-[11px] text-neutral-600 mt-1 flex items-center justify-between">
                    <span>{item.product_name}</span>
                    <span className="font-mono text-neutral-500 tabular-nums">Conf: {(item.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5 truncate">
                    Reason: {item.explanation}
                  </div>
                  {item.reviewed_by_human && (
                    <div className="mt-1 text-[10px] font-semibold text-emerald-700">
                      ✓ VERIFIED BY {item.human_override?.inspector || 'OPERATOR'}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Detail & Action Panel */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <div className="text-xs font-mono text-neutral-400">Selected Workpiece Inspection</div>
              <div className="text-base font-bold text-neutral-900 font-mono">
                {selectedItem ? selectedItem.inspection_id : 'Select an item from queue'}
              </div>
            </div>
            {selectedItem && <StatusBadge status={selectedItem.result} />}
          </div>

          {selectedItem ? (
            <div className="space-y-4 text-xs">
              {/* Reason for Routing to Review */}
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3.5 space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  Reason Automated Model Flagged for Human Review:
                </div>
                <p className="text-amber-800 leading-relaxed font-medium">
                  {selectedItem.explanation}
                </p>
              </div>

              {/* Workpiece Context Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3 rounded-md border border-neutral-200">
                <div>
                  <div className="text-neutral-500">Product</div>
                  <div className="font-semibold text-neutral-900 mt-0.5">{selectedItem.product_name}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Machine & Line</div>
                  <div className="font-mono text-neutral-900 mt-0.5">{selectedItem.machine} / Line {selectedItem.line}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Model Confidence</div>
                  <div className="font-mono font-bold text-neutral-900 mt-0.5">
                    {(selectedItem.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500">Optical Quality</div>
                  <div className="font-mono font-semibold text-neutral-900 mt-0.5">
                    {selectedItem.image_quality_score}%
                  </div>
                </div>
              </div>

              {/* Inspector Decision Actions */}
              <div className="border border-neutral-200 rounded-md p-4 space-y-3">
                <div className="font-bold text-neutral-800 uppercase tracking-tight">
                  Inspector Human Verdict & Audit Log
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1 font-medium">
                    Inspector Audit Notes:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Checked with vernier gauge: within 0.05mm tolerance"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => handleAction('OVERRIDE_PASS')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Override: Mark PASS (False Positive)
                  </button>

                  <button
                    onClick={() => handleAction('OVERRIDE_REJECT')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Confirm Defect: Route REJECT
                  </button>

                  <button
                    onClick={() => handleAction('CONFIRM')}
                    className="flex items-center gap-1.5 px-4 py-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 rounded text-xs font-medium transition-colors"
                  >
                    Record for Retraining Dataset
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-neutral-400">
              Select an inspection record from the left queue to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
