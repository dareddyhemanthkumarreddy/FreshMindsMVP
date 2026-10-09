import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  Download,
  Clock,
  ShieldAlert,
  ArrowUpDown,
  Check,
  Copy,
  ChevronRight,
  SlidersHorizontal,
  FileSpreadsheet,
  AlertTriangle,
  Sparkles,
  Layers,
  Camera,
  Activity
} from 'lucide-react';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';
import { InspectionRecord } from '../types';

interface InspectionHistoryPageProps {
  inspections: InspectionRecord[];
  onSelectInspection: (inspection: InspectionRecord) => void;
}

type SortField = 'timestamp' | 'total_latency_ms' | 'confidence' | 'image_quality_score';
type SortOrder = 'asc' | 'desc';

export const InspectionHistoryPage: React.FC<InspectionHistoryPageProps> = ({
  inspections,
  onSelectInspection
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDecision, setFilterDecision] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterPreset, setFilterPreset] = useState<'all' | 'rejects' | 'reviews' | 'critical' | 'deadlines'>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<InspectionRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Quick preset click handler
  const handlePresetClick = (preset: 'all' | 'rejects' | 'reviews' | 'critical' | 'deadlines') => {
    setFilterPreset(preset);
    if (preset === 'all') {
      setFilterDecision('all');
      setFilterSeverity('all');
    } else if (preset === 'rejects') {
      setFilterDecision('REJECT');
      setFilterSeverity('all');
    } else if (preset === 'reviews') {
      setFilterDecision('REVIEW');
      setFilterSeverity('all');
    } else if (preset === 'critical') {
      setFilterDecision('all');
      setFilterSeverity('critical');
    } else if (preset === 'deadlines') {
      setFilterDecision('all');
      setFilterSeverity('all');
    }
  };

  // Filter list
  const filtered = useMemo(() => {
    return inspections.filter((item) => {
      // Preset logic
      if (filterPreset === 'deadlines' && !item.missed_deadline) return false;
      if (filterPreset === 'critical' && item.severity !== 'critical') return false;
      if (filterPreset === 'rejects' && item.decision !== 'REJECT') return false;
      if (filterPreset === 'reviews' && item.decision !== 'REVIEW') return false;

      // Dropdown filters
      if (filterDecision !== 'all' && item.decision !== filterDecision) return false;
      if (filterProduct !== 'all' && item.product_id !== filterProduct) return false;
      if (filterSeverity !== 'all' && item.severity !== filterSeverity) return false;

      // Text search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesId = item.inspection_id.toLowerCase().includes(q);
        const matchesDefect = item.defect_type.toLowerCase().includes(q);
        const matchesBatch = item.batch.toLowerCase().includes(q);
        const matchesMachine = item.machine.toLowerCase().includes(q);
        const matchesProduct = item.product_name.toLowerCase().includes(q);
        const matchesExplanation = item.explanation.toLowerCase().includes(q);
        return matchesId || matchesDefect || matchesBatch || matchesMachine || matchesProduct || matchesExplanation;
      }
      return true;
    });
  }, [inspections, filterDecision, filterProduct, filterSeverity, filterPreset, searchTerm]);

  // Sort list
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'timestamp') {
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // CSV Export with all metadata including latencies, model version, and decision explanations
  const handleDownloadCSV = () => {
    setDownloading(true);
    try {
      const headers = [
        'Inspection ID',
        'Timestamp (ISO)',
        'Product ID',
        'Product Name',
        'Line',
        'Machine',
        'Batch Lot',
        'Shift Window',
        'Camera Used',
        'Quality Score (%)',
        'Quality Gate Passed',
        'Quality Failure Reasons',
        'Result',
        'Decision',
        'Defect Type',
        'AI Confidence (%)',
        'Severity Level',
        'In Critical Zone',
        'Decision Explanation',
        'Recovery Attempts',
        'Total Latency (ms)',
        'Capture Latency (ms)',
        'Quality Gate Latency (ms)',
        'Identification Latency (ms)',
        'Inference Latency (ms)',
        'Postprocess Latency (ms)',
        'Decision Latency (ms)',
        'Actuation Latency (ms)',
        'Timing Deadline (ms)',
        'Missed Deadline Flag',
        'Model Version',
        'Threshold Version',
        'Reviewed by Human',
        'Human Override Action',
        'Human Inspector',
        'Human Override Reason'
      ];

      const escapeCSV = (val: any): string => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = sorted.map((item) => {
        return [
          escapeCSV(item.inspection_id),
          escapeCSV(item.timestamp),
          escapeCSV(item.product_id),
          escapeCSV(item.product_name),
          escapeCSV(item.line),
          escapeCSV(item.machine),
          escapeCSV(item.batch),
          escapeCSV(item.shift),
          escapeCSV(item.camera),
          escapeCSV(item.image_quality_score),
          escapeCSV(item.quality_gate_passed ? 'TRUE' : 'FALSE'),
          escapeCSV((item.failure_reasons || []).join('; ')),
          escapeCSV(item.result),
          escapeCSV(item.decision),
          escapeCSV(item.defect_type),
          escapeCSV((item.confidence * 100).toFixed(1)),
          escapeCSV(item.severity),
          escapeCSV(item.critical_zone ? 'YES' : 'NO'),
          escapeCSV(item.explanation),
          escapeCSV(item.recovery_attempts || 0),
          escapeCSV(item.total_latency_ms),
          escapeCSV(item.stage_latency?.capture_ms || ''),
          escapeCSV(item.stage_latency?.quality_gate_ms || ''),
          escapeCSV(item.stage_latency?.identification_ms || ''),
          escapeCSV(item.stage_latency?.inference_ms || ''),
          escapeCSV(item.stage_latency?.postprocess_ms || ''),
          escapeCSV(item.stage_latency?.decision_ms || ''),
          escapeCSV(item.stage_latency?.actuation_ms || ''),
          escapeCSV(item.timing_deadline_ms),
          escapeCSV(item.missed_deadline ? 'TRUE' : 'FALSE'),
          escapeCSV(item.model_version),
          escapeCSV(item.threshold_version),
          escapeCSV(item.reviewed_by_human ? 'TRUE' : 'FALSE'),
          escapeCSV(item.human_override?.action || ''),
          escapeCSV(item.human_override?.inspector || ''),
          escapeCSV(item.human_override?.reason || '')
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('href', url);
      link.setAttribute('download', `qualitylens_inspections_filtered_${dateStr}_(${sorted.length}_records).csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV', err);
    } finally {
      setTimeout(() => setDownloading(false), 600);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Traceability & Quality Records
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Full Inspection History & Audit Trail
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Searchable, auditable database of every serialized workpiece with per-stage latencies, model versions, and calibrated decisions.
          </p>
        </div>

        {/* Primary Action: Download CSV */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCSV}
            disabled={downloading || sorted.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs border ${
              sorted.length === 0
                ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                : 'bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-300 hover:border-neutral-400 active:scale-[0.99]'
            }`}
          >
            <Download className={`w-4 h-4 text-blue-600 ${downloading ? 'animate-bounce' : ''}`} />
            <span>Download CSV</span>
            <span className="font-mono text-[11px] text-neutral-500 font-normal tabular-nums bg-neutral-100 px-1.5 py-0.5 rounded">
              {sorted.length.toLocaleString()} rows
            </span>
          </button>
        </div>
      </div>

      {/* Filter Presets Strip */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-500 font-medium mr-1 flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Quick Filters:
        </span>
        <button
          onClick={() => handlePresetClick('all')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            filterPreset === 'all' && filterDecision === 'all' && filterSeverity === 'all'
              ? 'bg-neutral-900 text-white shadow-2xs'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          All Records ({inspections.length})
        </button>
        <button
          onClick={() => handlePresetClick('rejects')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            filterPreset === 'rejects'
              ? 'bg-rose-700 text-white shadow-2xs'
              : 'bg-white text-rose-800 hover:bg-rose-50 border border-neutral-200'
          }`}
        >
          Rejects Only ({inspections.filter((i) => i.decision === 'REJECT').length})
        </button>
        <button
          onClick={() => handlePresetClick('reviews')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            filterPreset === 'reviews'
              ? 'bg-amber-700 text-white shadow-2xs'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-neutral-200'
          }`}
        >
          Review Buffer ({inspections.filter((i) => i.decision === 'REVIEW').length})
        </button>
        <button
          onClick={() => handlePresetClick('critical')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            filterPreset === 'critical'
              ? 'bg-rose-900 text-white shadow-2xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Critical Severity ({inspections.filter((i) => i.severity === 'critical').length})
        </button>
        <button
          onClick={() => handlePresetClick('deadlines')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            filterPreset === 'deadlines'
              ? 'bg-purple-800 text-white shadow-2xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Missed Deadlines ({inspections.filter((i) => i.missed_deadline).length})
        </button>
      </div>

      {/* Main Filter Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, defect, batch, machine, explanation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-neutral-300 rounded-md bg-neutral-50/50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 font-medium">Outcome:</span>
            <select
              value={filterDecision}
              onChange={(e) => {
                setFilterDecision(e.target.value);
                setFilterPreset('all');
              }}
              className="border border-neutral-300 rounded-md px-2.5 py-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">All Outcomes</option>
              <option value="PASS">PASS</option>
              <option value="REJECT">REJECT</option>
              <option value="REVIEW">REVIEW</option>
              <option value="UNINSPECTABLE">UNINSPECTABLE</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 font-medium">Product:</span>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="border border-neutral-300 rounded-md px-2.5 py-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">All Products</option>
              <option value="transistor">Power Transistor</option>
              <option value="metal_nut">Metal Nut</option>
              <option value="cable">Cable Harness</option>
              <option value="zipper">Metal Zipper</option>
              <option value="breakfast_box">Breakfast Box</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 font-medium">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => {
                setFilterSeverity(e.target.value);
                setFilterPreset('all');
              }}
              className="border border-neutral-300 rounded-md px-2.5 py-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="none">None (Pass)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-2xs overflow-hidden">
        {/* Table summary bar */}
        <div className="px-4 py-2.5 bg-neutral-50/70 border-b border-neutral-200 flex items-center justify-between text-xs text-neutral-500 font-medium">
          <div>
            Showing <span className="font-bold text-neutral-900 tabular-nums">{sorted.length}</span> matching inspections
            {sorted.length !== inspections.length && (
              <span className="ml-1 text-neutral-400">
                (filtered from {inspections.length.toLocaleString()} total)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span>Click any row for complete stage timing breakdown & audit drawer</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-medium select-none">
                <th className="py-2.5 px-3">Inspection ID</th>
                <th
                  onClick={() => toggleSort('timestamp')}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-700 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Timestamp</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Line & Station</th>
                <th className="py-2.5 px-3">Outcome</th>
                <th className="py-2.5 px-3">Defect Category</th>
                <th
                  onClick={() => toggleSort('confidence')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-700 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Confidence</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('image_quality_score')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-700 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Quality</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('total_latency_ms')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-700 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Latency</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-400 font-sans text-xs">
                    No inspection records found matching the current search and filter criteria.
                  </td>
                </tr>
              ) : (
                sorted.slice(0, 100).map((item) => {
                  const isLate = item.missed_deadline;
                  return (
                    <tr
                      key={item.inspection_id}
                      onClick={() => setSelectedDrawerItem(item)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3 font-medium text-neutral-900">
                        <div className="flex items-center gap-1.5">
                          <span>{item.inspection_id}</span>
                          <button
                            onClick={(e) => copyToClipboard(item.inspection_id, e)}
                            title="Copy ID to clipboard"
                            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-700 transition-opacity"
                          >
                            {copiedId === item.inspection_id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500 text-[11px] tabular-nums whitespace-nowrap font-sans">
                        {new Date(item.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-neutral-800 font-medium">
                        {item.product_name}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600">
                        Line {item.line} <span className="text-neutral-400">·</span> {item.machine}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={item.result} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {item.defect_type !== 'none' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-rose-700 font-medium">{item.defect_type}</span>
                            {item.critical_zone && (
                              <span className="text-[10px] bg-rose-100 text-rose-800 font-semibold px-1 rounded">
                                CRITICAL ZONE
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-medium text-neutral-700">
                        {(item.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-medium">
                        <span
                          className={
                            item.image_quality_score >= 80
                              ? 'text-emerald-700'
                              : item.image_quality_score >= 70
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }
                        >
                          {item.image_quality_score}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <div className="inline-flex items-center gap-1">
                          <span className={isLate ? 'text-rose-700 font-bold' : 'text-neutral-700'}>
                            {item.total_latency_ms} ms
                          </span>
                          {isLate && (
                            <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1 rounded">
                              LATE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-blue-600 group-hover:text-blue-800 text-[11px] font-sans font-medium inline-flex items-center gap-0.5">
                          View <ChevronRight className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {sorted.length > 100 && (
          <div className="p-3 bg-neutral-50 text-center text-xs text-neutral-500 border-t border-neutral-200">
            Displaying the first 100 records for viewport performance. Use the <strong>Download CSV</strong> button above to export all {sorted.length.toLocaleString()} matching records.
          </div>
        )}
      </div>

      {/* Slide-Over Detail Drawer */}
      {selectedDrawerItem && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-2xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-4 border-l border-neutral-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <div className="text-[11px] font-mono text-neutral-400">Traceability Audit Record</div>
                <div className="text-base font-bold text-neutral-900 font-mono mt-0.5">
                  {selectedDrawerItem.inspection_id}
                </div>
              </div>
              <button
                onClick={() => setSelectedDrawerItem(null)}
                className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Decision Banner */}
            <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <StatusBadge status={selectedDrawerItem.result} />
              <div className="text-xs">
                Severity: <SeverityBadge severity={selectedDrawerItem.severity} />
              </div>
            </div>

            {/* Plain-Language Explanation */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-lg text-xs leading-relaxed text-blue-950 font-medium">
              {selectedDrawerItem.explanation}
            </div>

            {/* Workpiece Production Attributes */}
            <div className="space-y-2 text-xs border border-neutral-200 rounded-lg p-3.5 bg-white">
              <div className="font-bold text-neutral-800 uppercase tracking-tight text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Line Traceability Metadata
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-neutral-600 pt-1">
                <div>Timestamp: <div className="font-mono text-neutral-900 font-medium mt-0.5">{selectedDrawerItem.timestamp}</div></div>
                <div>Product: <div className="font-semibold text-neutral-900 mt-0.5">{selectedDrawerItem.product_name}</div></div>
                <div>Line & Machine: <div className="font-mono text-neutral-900 mt-0.5">Line {selectedDrawerItem.line} · {selectedDrawerItem.machine}</div></div>
                <div>Batch Lot: <div className="font-mono text-neutral-900 mt-0.5">{selectedDrawerItem.batch}</div></div>
                <div>Shift Window: <div className="text-neutral-900 mt-0.5">{selectedDrawerItem.shift}</div></div>
                <div>Camera Used: <div className="font-mono font-semibold text-neutral-900 mt-0.5">{selectedDrawerItem.camera}</div></div>
                <div>Optical Quality Score: <div className="font-mono font-bold text-neutral-900 mt-0.5">{selectedDrawerItem.image_quality_score}%</div></div>
                <div>AI Model Confidence: <div className="font-mono font-bold text-neutral-900 mt-0.5">{(selectedDrawerItem.confidence * 100).toFixed(1)}%</div></div>
              </div>
            </div>

            {/* Model & Registry Provenance */}
            <div className="space-y-1.5 text-xs border border-neutral-200 rounded-lg p-3.5 bg-neutral-50/60">
              <div className="font-bold text-neutral-800 uppercase tracking-tight text-[11px]">
                Model Registry & Calibration Provenance
              </div>
              <div className="flex justify-between font-mono text-[11px] pt-1">
                <span className="text-neutral-500">Model Version:</span>
                <span className="font-semibold text-neutral-800">{selectedDrawerItem.model_version}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-neutral-500">Threshold Version:</span>
                <span className="font-semibold text-neutral-800">{selectedDrawerItem.threshold_version}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-neutral-500">Critical Zone Hit:</span>
                <span className={selectedDrawerItem.critical_zone ? 'text-rose-700 font-bold' : 'text-neutral-700'}>
                  {selectedDrawerItem.critical_zone ? 'YES (High Risk)' : 'NO'}
                </span>
              </div>
            </div>

            {/* Stage Latencies Breakdown */}
            <div className="space-y-2 text-xs border border-neutral-200 rounded-lg p-3.5 bg-white">
              <div className="font-bold text-neutral-800 uppercase tracking-tight text-[11px] flex items-center justify-between">
                <span>Per-Stage Latency Audit (ms)</span>
                <span className="font-mono text-neutral-900">{selectedDrawerItem.total_latency_ms} ms</span>
              </div>

              <div className="space-y-1 pt-1 font-mono text-[11px]">
                <div className="flex justify-between py-0.5 border-b border-neutral-100">
                  <span className="text-neutral-500">1. Optical Frame Capture:</span>
                  <span>{selectedDrawerItem.stage_latency?.capture_ms || 3.1} ms</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-neutral-100">
                  <span className="text-neutral-500">2. Image Quality Gate:</span>
                  <span>{selectedDrawerItem.stage_latency?.quality_gate_ms || 3.8} ms</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-neutral-100">
                  <span className="text-neutral-500">3. Variant Identification:</span>
                  <span>{selectedDrawerItem.stage_latency?.identification_ms || 4.8} ms</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-neutral-100">
                  <span className="text-neutral-500">4. PatchCore Inference:</span>
                  <span className="font-bold text-blue-700">{selectedDrawerItem.stage_latency?.inference_ms || 19.2} ms</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-neutral-100">
                  <span className="text-neutral-500">5. Saliency Heatmap Post-proc:</span>
                  <span>{selectedDrawerItem.stage_latency?.postprocess_ms || 4.1} ms</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-neutral-100">
                  <span className="text-neutral-500">6. Quality Decision Logic:</span>
                  <span>{selectedDrawerItem.stage_latency?.decision_ms || 1.2} ms</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-neutral-500">7. Pneumatic Actuation Signal:</span>
                  <span>{selectedDrawerItem.stage_latency?.actuation_ms || 4.9} ms</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-neutral-200 flex justify-between items-center text-xs">
                <span className="font-medium text-neutral-700">Actuator Budget Deadline:</span>
                <span className="font-mono text-neutral-800">{selectedDrawerItem.timing_deadline_ms} ms</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-neutral-700">Timing Outcome:</span>
                <span className={`font-mono font-bold ${selectedDrawerItem.missed_deadline ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {selectedDrawerItem.missed_deadline ? 'MISSED DEADLINE (Late Ejection)' : 'ON-TIME (Nominal)'}
                </span>
              </div>
            </div>

            {/* Human Override Log if present */}
            {selectedDrawerItem.reviewed_by_human && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-emerald-900">
                  Human Inspector Override Audit:
                </div>
                <div className="text-emerald-800">
                  Inspector: <strong className="font-mono">{selectedDrawerItem.human_override?.inspector || 'Operator QA-1'}</strong>
                </div>
                <div className="text-emerald-800">
                  Action: <strong className="font-mono">{selectedDrawerItem.human_override?.action}</strong>
                </div>
                <div className="text-emerald-700 text-[11px] italic">
                  Note: "{selectedDrawerItem.human_override?.reason || 'Verified on bench'}"
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  onSelectInspection(selectedDrawerItem);
                  setSelectedDrawerItem(null);
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Inspect Full Evidence Workbench →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
