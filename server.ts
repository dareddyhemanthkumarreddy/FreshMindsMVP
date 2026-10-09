import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// CORS & Headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Load Deterministic Seed History
const SEED_FILE = path.join(__dirname, 'artifacts', 'seed_production_history.json');
let inspectionsHistory: any[] = [];
try {
  if (fs.existsSync(SEED_FILE)) {
    const raw = fs.readFileSync(SEED_FILE, 'utf-8');
    inspectionsHistory = JSON.parse(raw);
  }
} catch (e) {
  console.warn('Could not load seed data, starting with empty history', e);
}

// Model Metrics Cache (from artifacts/metrics/*.json)
function loadProductMetrics(productId: string) {
  const filePath = path.join(__dirname, 'artifacts', 'metrics', `${productId}_metrics.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

function loadBenchmarkSummary() {
  const filePath = path.join(__dirname, 'artifacts', 'metrics', 'summary_benchmark.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

// Product Profiles
const PRODUCT_PROFILES: Record<string, any> = {
  transistor: {
    product_id: 'transistor',
    name: 'TO-220 Power Transistor',
    dataset: 'MVTec AD',
    image: '/src/assets/images/transistor_inspection_1791490274961.jpg',
    line_config: { nominal_speed_mps: 1.2, distance_to_actuator_m: 1.8, deadline_budget_ms: 120.0 },
    calibrated_thresholds: { normal_cutoff: 0.485, review_band_lower: 0.485, review_band_upper: 0.548, reject_cutoff: 0.548 },
    critical_zones: [
      { id: 'Z1_LEADS', name: 'Terminal Leads (Drain/Source/Gate)', bbox_norm: [0.55, 0.20, 0.95, 0.80], safety_critical: true },
      { id: 'Z2_TAB', name: 'Mounting Heat Sink Tab', bbox_norm: [0.05, 0.25, 0.40, 0.75], safety_critical: false },
      { id: 'Z3_BODY', name: 'Epoxy Molded Case', bbox_norm: [0.38, 0.22, 0.60, 0.78], safety_critical: true }
    ],
    defect_catalog: ['bent_lead', 'damaged_case', 'cut_lead', 'misplaced_heat_sink', 'unknown_anomaly']
  },
  metal_nut: {
    product_id: 'metal_nut',
    name: 'Precision M10 Hex Nut',
    dataset: 'MVTec AD',
    image: '/src/assets/images/metal_nut_inspection_1791490285483.jpg',
    line_config: { nominal_speed_mps: 1.5, distance_to_actuator_m: 1.5, deadline_budget_ms: 100.0 },
    calibrated_thresholds: { normal_cutoff: 0.490, review_band_lower: 0.490, review_band_upper: 0.562, reject_cutoff: 0.562 },
    critical_zones: [
      { id: 'Z1_THREADS', name: 'Internal Thread Helix', bbox_norm: [0.32, 0.32, 0.68, 0.68], safety_critical: true },
      { id: 'Z2_HEX_FLATS', name: 'Hexagonal Drive Flats', bbox_norm: [0.12, 0.12, 0.88, 0.88], safety_critical: false }
    ],
    defect_catalog: ['thread_burr', 'bent', 'scratch', 'color_defect', 'unknown_anomaly']
  },
  cable: {
    product_id: 'cable',
    name: 'Multi-Conductor Industrial Cable',
    dataset: 'MVTec AD',
    image: '/src/assets/images/cable_inspection_1791490296172.jpg',
    line_config: { nominal_speed_mps: 0.8, distance_to_actuator_m: 1.6, deadline_budget_ms: 150.0 },
    calibrated_thresholds: { normal_cutoff: 0.470, review_band_lower: 0.470, review_band_upper: 0.535, reject_cutoff: 0.535 },
    logical_rules: { required_wire_count: 8, pinout_sequence: ['L1', 'L2', 'GND', 'SIG1', 'SIG2', 'COM'] },
    critical_zones: [
      { id: 'Z1_CRIMP_PINS', name: 'Ring Terminal Crimps', bbox_norm: [0.70, 0.15, 0.95, 0.85], safety_critical: true },
      { id: 'Z2_INSULATION', name: 'Stripped Wire Interface', bbox_norm: [0.35, 0.20, 0.70, 0.80], safety_critical: true },
      { id: 'Z3_JACKET', name: 'Outer Strain Relief Sheath', bbox_norm: [0.05, 0.30, 0.35, 0.70], safety_critical: false }
    ],
    defect_catalog: ['bent_wire', 'cut_inner_insulation', 'cut_outer_insulation', 'missing_wire', 'wrong_sequence', 'unknown_anomaly']
  },
  zipper: {
    product_id: 'zipper',
    name: 'Precision Metal Zipper',
    dataset: 'MVTec AD',
    image: '/src/assets/images/zipper_inspection_1791490306751.jpg',
    line_config: { nominal_speed_mps: 2.0, distance_to_actuator_m: 1.8, deadline_budget_ms: 80.0 },
    calibrated_thresholds: { normal_cutoff: 0.480, review_band_lower: 0.480, review_band_upper: 0.551, reject_cutoff: 0.551 },
    critical_zones: [
      { id: 'Z1_TEETH_MESH', name: 'Interlocking Element Mesh', bbox_norm: [0.30, 0.05, 0.70, 0.95], safety_critical: true },
      { id: 'Z2_TAPE_BORDER', name: 'Woven Textile Flange', bbox_norm: [0.05, 0.05, 0.95, 0.95], safety_critical: false }
    ],
    defect_catalog: ['broken_teeth', 'missing_teeth', 'fabric_interior_tear', 'rough_teeth_burr', 'unknown_anomaly']
  },
  breakfast_box: {
    product_id: 'breakfast_box',
    name: 'Compartmentalized Breakfast Box Tray',
    dataset: 'MVTec LOCO AD (Logical & Structural Defects)',
    image: '/src/assets/images/breakfast_box_inspection_1791490319996.jpg',
    line_config: { nominal_speed_mps: 0.6, distance_to_actuator_m: 1.5, deadline_budget_ms: 200.0 },
    calibrated_thresholds: { normal_cutoff: 0.465, review_band_lower: 0.465, review_band_upper: 0.528, reject_cutoff: 0.528 },
    logical_rules: { required_components: ['Granola Portion', 'Greek Yogurt Pot (Sealed)', 'Berry Mix', 'Pastry Pocket'] },
    critical_zones: [
      { id: 'Z1_YOGURT_LID', name: 'Yogurt Foil Seal', bbox_norm: [0.50, 0.25, 0.75, 0.50], safety_critical: true },
      { id: 'Z2_FRUIT_TRAY', name: 'Fresh Berry Pocket', bbox_norm: [0.25, 0.50, 0.50, 0.75], safety_critical: true },
      { id: 'Z3_BAKERY', name: 'Pastry Compartment', bbox_norm: [0.50, 0.50, 0.75, 0.75], safety_critical: false }
    ],
    defect_catalog: ['missing_yogurt', 'displaced_croissant', 'unsealed_fruit_compartment', 'foreign_granola_contamination', 'unknown_anomaly']
  }
};

// Actuator Log Tracker
interface ActuatorLog {
  id: string;
  inspection_id: string;
  timestamp: string;
  action: 'EJECT_PUSHER' | 'PASS_THROUGH' | 'DIVERTER_REVIEW';
  target_bin: 'SCRAP_CHUTE' | 'CONVEYOR_CONTINUE' | 'MANUAL_INSPECTION_BUFFER';
  latency_ms: number;
  deadline_ms: number;
  on_time: boolean;
}
const actuatorLogs: ActuatorLog[] = [];

// Simulator State
let simulatorRunning = true;
let simulatorSpeed = 1; // 1-10 items per sec (interval = 2000ms / speed)
let currentFault: string | null = null;
let sseClients: Response[] = [];

function broadcastSSE(data: any) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // client closed
    }
  });
}

// Generate Live Simulated Inspection
let inspectionCounter = 5400;
function generateSimulatedInspection(): any {
  inspectionCounter++;
  const prodKeys = Object.keys(PRODUCT_PROFILES);
  const prodKey = prodKeys[Math.floor(Math.random() * prodKeys.length)];
  const profile = PRODUCT_PROFILES[prodKey];
  const inspectionId = `INS-20261008-${inspectionCounter}`;
  const nowStr = new Date().toISOString();

  // Handle active fault injection
  let blurVal = 210.0;
  let brightness = 135.0;
  let glare = 1.0;
  let anomalyScore = 0.32;
  let defectType = 'none';
  let isFaultInjected = false;

  if (currentFault === 'blur_camera') {
    blurVal = 48.0; // severe blur
    isFaultInjected = true;
  } else if (currentFault === 'dark_lighting') {
    brightness = 28.0; // severe underexposure
    isFaultInjected = true;
  } else if (currentFault === 'contaminate_lens') {
    glare = 8.5; // excessive glare/dirt
    blurVal = 95.0;
    isFaultInjected = true;
  } else if (currentFault === 'defect_heavy_batch') {
    anomalyScore = 0.78;
    const defects = profile.defect_catalog.filter((d: string) => d !== 'unknown_anomaly');
    defectType = defects[Math.floor(Math.random() * defects.length)];
    isFaultInjected = true;
  } else if (currentFault === 'unseen_defect') {
    anomalyScore = 0.74;
    defectType = 'unknown_anomaly';
    isFaultInjected = true;
  } else {
    // Normal statistical distribution (4% natural defect rate, 3% review band)
    const roll = Math.random();
    if (roll < 0.04) {
      anomalyScore = 0.65 + Math.random() * 0.28;
      const defects = profile.defect_catalog.filter((d: string) => d !== 'unknown_anomaly');
      defectType = defects[Math.floor(Math.random() * defects.length)];
    } else if (roll < 0.07) {
      anomalyScore = profile.calibrated_thresholds.normal_cutoff + 0.02; // review band
      defectType = 'marginal_edge_variance';
    } else {
      anomalyScore = 0.22 + Math.random() * 0.22;
      defectType = 'none';
    }
  }

  // 1. Image Quality Gate
  const blurScore = Math.min(100, Math.max(0, (blurVal / 200.0) * 100));
  const brightScore = brightness < 40 ? (brightness / 40) * 70 : 96.0;
  const glareScore = glare > 4 ? Math.max(0, 100 - (glare - 4) * 15) : 95.0;
  const qualityScore = Math.round((blurScore * 0.4 + brightScore * 0.3 + glareScore * 0.3) * 10) / 10;
  const qualPassed = qualityScore >= 70.0;
  const failureReasons: string[] = [];
  if (blurVal < 140) failureReasons.push(`Laplacian sharpness low (${blurVal.toFixed(1)} < 140)`);
  if (brightness < 40) failureReasons.push(`Severe underexposure (${brightness.toFixed(1)} lux)`);
  if (glare > 4) failureReasons.push(`High specular glare (${glare.toFixed(1)}%)`);

  // Recovery Engine if failed
  let recoveryAttempts = 0;
  let finalCamera = 'CAM-01';
  let recoveryHistory: any[] = [];
  if (!qualPassed) {
    recoveryAttempts = 2;
    finalCamera = 'CAM-02';
    recoveryHistory = [
      { attempt: 1, camera: 'CAM-01', status: 'FAILED', score: qualityScore, reason: failureReasons[0] || 'Quality Gate Fail' },
      { attempt: 2, camera: 'CAM-02', status: 'PASSED', score: 88.5, reason: 'Polarized diffuse lighting applied' }
    ];
  }

  // 2. Decision Engine
  let result = 'PASS';
  let decision = 'PASS';
  let severity = 'none';
  let confidence = Math.round((0.94 + Math.random() * 0.05) * 1000) / 1000;
  let criticalZoneHit = false;
  let explanation = 'All feature embeddings within calibrated bounds.';
  let regionBbox: number[] = [];

  if (!qualPassed && recoveryAttempts === 0) {
    result = 'UNINSPECTABLE';
    decision = 'UNINSPECTABLE';
    confidence = 0.45;
    explanation = `Optical quality gate failed: ${failureReasons.join(', ')}. Actuator paused.`;
  } else if (defectType === 'unknown_anomaly') {
    result = 'REVIEW';
    decision = 'REVIEW';
    severity = 'medium';
    confidence = 0.72;
    explanation = 'Novel statistical outlier detected with no matching prototype. Routed for inspector review.';
    regionBbox = [0.45, 0.40, 0.65, 0.60];
  } else if (anomalyScore > profile.calibrated_thresholds.reject_cutoff) {
    result = 'REJECT';
    decision = 'REJECT';
    criticalZoneHit = Math.random() > 0.3;
    severity = criticalZoneHit ? 'critical' : 'high';
    confidence = Math.round((0.92 + Math.random() * 0.07) * 1000) / 1000;
    explanation = `Defect '${defectType}' identified${criticalZoneHit ? ' in critical zone' : ''} (anomaly score ${anomalyScore.toFixed(3)} > cutoff ${profile.calibrated_thresholds.reject_cutoff}).`;
    regionBbox = [0.35, 0.30, 0.65, 0.70];
  } else if (anomalyScore > profile.calibrated_thresholds.normal_cutoff) {
    result = 'REVIEW';
    decision = 'REVIEW';
    severity = 'low';
    confidence = 0.78;
    explanation = `Score ${anomalyScore.toFixed(3)} lies within calibration review band [${profile.calibrated_thresholds.normal_cutoff}, ${profile.calibrated_thresholds.reject_cutoff}].`;
  }

  // Latency & Deadline Budget
  const stageLatency = {
    capture_ms: Math.round((2.8 + Math.random() * 1.2) * 10) / 10,
    quality_gate_ms: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    identification_ms: Math.round((4.2 + Math.random() * 1.8) * 10) / 10,
    inference_ms: Math.round((18.5 + Math.random() * 4.2) * 10) / 10,
    postprocess_ms: Math.round((3.8 + Math.random() * 1.4) * 10) / 10,
    decision_ms: Math.round((1.1 + Math.random() * 0.6) * 10) / 10,
    actuation_ms: Math.round((4.5 + Math.random() * 2.0) * 10) / 10
  };
  const totalLatency = Math.round(Object.values(stageLatency).reduce((a, b) => a + b, 0) * 10) / 10;
  const deadlineBudgetMs = profile.line_config.deadline_budget_ms;
  const missedDeadline = totalLatency > deadlineBudgetMs;

  // Actuator Trigger Log
  const actuatorAction = result === 'REJECT' ? 'EJECT_PUSHER' : (result === 'REVIEW' ? 'DIVERTER_REVIEW' : 'PASS_THROUGH');
  const targetBin = result === 'REJECT' ? 'SCRAP_CHUTE' : (result === 'REVIEW' ? 'MANUAL_INSPECTION_BUFFER' : 'CONVEYOR_CONTINUE');
  const actuatorEntry: ActuatorLog = {
    id: `ACT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    inspection_id: inspectionId,
    timestamp: nowStr,
    action: actuatorAction,
    target_bin: targetBin,
    latency_ms: totalLatency,
    deadline_ms: deadlineBudgetMs,
    on_time: !missedDeadline
  };
  actuatorLogs.unshift(actuatorEntry);
  if (actuatorLogs.length > 50) actuatorLogs.pop();

  const inspectionRecord = {
    inspection_id: inspectionId,
    timestamp: nowStr,
    product_id: prodKey,
    product_name: profile.name,
    line: Math.random() > 0.5 ? 'L1' : 'L2',
    machine: `M-0${Math.floor(Math.random() * 6) + 1}`,
    batch: `B-${8420 + Math.floor(Math.random() * 10)}`,
    shift: 'Shift A (Morning)',
    camera: finalCamera,
    image_quality_score: qualPassed ? qualityScore : (recoveryAttempts > 0 ? 88.5 : qualityScore),
    quality_gate_passed: qualPassed || recoveryAttempts > 0,
    failure_reasons: failureReasons,
    result,
    decision,
    defect_type: defectType,
    confidence,
    severity,
    critical_zone: criticalZoneHit,
    explanation,
    recovery_attempts: recoveryAttempts,
    recovery_history: recoveryHistory,
    stage_latency: stageLatency,
    total_latency_ms: totalLatency,
    timing_deadline_ms: deadlineBudgetMs,
    missed_deadline: missedDeadline,
    model_version: `patchcore-${prodKey}-v2.4`,
    threshold_version: 'calib-f1opt-v2.1',
    regions: regionBbox.length > 0 ? [{
      id: 'REG-1',
      box: regionBbox,
      score: anomalyScore,
      defect_type: defectType,
      severity,
      in_critical_zone: criticalZoneHit
    }] : [],
    reviewed_by_human: false,
    human_override: null,
    is_fault_injected: isFaultInjected
  };

  inspectionsHistory.unshift(inspectionRecord);
  if (inspectionsHistory.length > 2000) inspectionsHistory.pop();

  return inspectionRecord;
}

// Simulator Timer Loop
setInterval(() => {
  if (simulatorRunning && sseClients.length > 0) {
    const item = generateSimulatedInspection();
    broadcastSSE({ type: 'INSPECTION', data: item });
  }
}, 2000);

// ==========================================
// API ROUTES
// ==========================================

// Health & System Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'QualityLens Industrial API',
    timestamp: new Date().toISOString(),
    uptime_seconds: process.uptime(),
    inspections_cached: inspectionsHistory.length,
    simulator: { running: simulatorRunning, speed: simulatorSpeed, active_fault: currentFault }
  });
});

// Products & Profiles
app.get('/api/products', (req, res) => {
  const list = Object.values(PRODUCT_PROFILES).map((p) => ({
    product_id: p.product_id,
    name: p.name,
    dataset: p.dataset,
    image: p.image,
    defect_classes_count: p.defect_catalog.length,
    nominal_speed_mps: p.line_config.nominal_speed_mps,
    deadline_budget_ms: p.line_config.deadline_budget_ms
  }));
  res.json(list);
});

app.get('/api/products/:id/profile', (req, res) => {
  const profile = PRODUCT_PROFILES[req.params.id];
  if (!profile) return res.status(404).json({ error: 'Product profile not found' });
  const metrics = loadProductMetrics(req.params.id);
  res.json({ ...profile, evaluation_metrics: metrics });
});

// SSE Live Stream
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Connected to QualityLens Conveyor SSE Stream' })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c !== res);
  });
});

// Simulator Controls
app.post('/api/simulator/start', (req, res) => {
  simulatorRunning = true;
  broadcastSSE({ type: 'SIMULATOR_STATE', running: true, speed: simulatorSpeed, fault: currentFault });
  res.json({ success: true, running: true });
});

app.post('/api/simulator/pause', (req, res) => {
  simulatorRunning = false;
  broadcastSSE({ type: 'SIMULATOR_STATE', running: false, speed: simulatorSpeed, fault: currentFault });
  res.json({ success: true, running: false });
});

app.post('/api/simulator/speed', (req, res) => {
  const { speed } = req.body;
  if (speed >= 1 && speed <= 10) simulatorSpeed = speed;
  broadcastSSE({ type: 'SIMULATOR_STATE', running: simulatorRunning, speed: simulatorSpeed, fault: currentFault });
  res.json({ success: true, speed: simulatorSpeed });
});

app.post('/api/simulator/fault', (req, res) => {
  const { fault } = req.body; // 'blur_camera' | 'dark_lighting' | 'contaminate_lens' | 'defect_heavy_batch' | 'unseen_defect' | 'clear'
  currentFault = fault === 'clear' ? null : fault;
  broadcastSSE({ type: 'SIMULATOR_FAULT', fault: currentFault });
  res.json({ success: true, active_fault: currentFault });
});

// Single Inspection Post (Interactive Inspect View)
app.post('/api/inspect', (req, res) => {
  const { product_id = 'transistor', simulate_defect, simulate_blur, simulate_dark } = req.body;
  const profile = PRODUCT_PROFILES[product_id] || PRODUCT_PROFILES.transistor;
  const inspectionId = `INS-MANUAL-${Date.now().toString().slice(-6)}`;
  const nowStr = new Date().toISOString();

  // Execute pipeline simulation
  let blurVal = simulate_blur ? 42.0 : 220.0;
  let brightness = simulate_dark ? 25.0 : 130.0;
  let anomalyScore = simulate_defect ? 0.82 : 0.28;
  let defectType = simulate_defect ? profile.defect_catalog[0] : 'none';

  // 1. Quality Gate
  const blurScore = Math.min(100, Math.max(0, (blurVal / 200.0) * 100));
  const brightScore = brightness < 40 ? 30.0 : 95.0;
  const overallQuality = Math.round((blurScore * 0.5 + brightScore * 0.5) * 10) / 10;
  const gatePassed = overallQuality >= 70.0;
  const failureReasons: string[] = [];
  if (blurVal < 140) failureReasons.push('Optical blur detected (Laplacian variance low)');
  if (brightness < 40) failureReasons.push('Severe underexposure (<40 lux)');

  // 2. Optical Recovery
  let recoveryAttempts = 0;
  let finalCamera = 'CAM-01';
  let recoveryTimeline: any[] = [];
  if (!gatePassed) {
    recoveryAttempts = 2;
    finalCamera = 'CAM-02';
    recoveryTimeline = [
      { attempt: 1, camera: 'CAM-01', status: 'FAILED', score: overallQuality, notes: failureReasons[0] },
      { attempt: 2, camera: 'CAM-02', status: 'PASSED', score: 89.2, notes: 'Re-inspected with adaptive telecentric lens' }
    ];
  }

  // 3. Decision
  let result = 'PASS';
  let decision = 'PASS';
  let severity = 'none';
  let confidence = 0.982;
  let criticalZoneHit = false;
  let explanation = 'All feature embeddings within calibrated bounds.';

  if (!gatePassed && recoveryAttempts === 0) {
    result = 'UNINSPECTABLE';
    decision = 'UNINSPECTABLE';
    confidence = 0.45;
    explanation = 'Image quality gate failed. Cannot make reliable decision.';
  } else if (anomalyScore > profile.calibrated_thresholds.reject_cutoff) {
    result = 'REJECT';
    decision = 'REJECT';
    criticalZoneHit = true;
    severity = 'critical';
    confidence = 0.965;
    explanation = `Defect '${defectType}' identified in critical zone exceeding tolerance limit.`;
  }

  const stageLatency = {
    capture_ms: 3.1,
    quality_gate_ms: 3.8,
    identification_ms: 4.8,
    inference_ms: 19.2,
    postprocess_ms: 4.1,
    decision_ms: 1.2,
    actuation_ms: 4.9
  };
  const totalLatency = Math.round(Object.values(stageLatency).reduce((a, b) => a + b, 0) * 10) / 10;

  const inspectionResult = {
    inspection_id: inspectionId,
    timestamp: nowStr,
    product_id,
    product_name: profile.name,
    line: 'L1',
    machine: 'M-02',
    batch: 'B-8450',
    shift: 'Shift A (Morning)',
    camera: finalCamera,
    image_quality_score: gatePassed ? overallQuality : 89.2,
    quality_gate_passed: true,
    failure_reasons: failureReasons,
    result,
    decision,
    defect_type: defectType,
    confidence,
    severity,
    critical_zone: criticalZoneHit,
    explanation,
    recovery_attempts: recoveryAttempts,
    recovery_history: recoveryTimeline,
    stage_latency: stageLatency,
    total_latency_ms: totalLatency,
    timing_deadline_ms: profile.line_config.deadline_budget_ms,
    missed_deadline: totalLatency > profile.line_config.deadline_budget_ms,
    model_version: `patchcore-${product_id}-v2.4`,
    threshold_version: 'calib-f1opt-v2.1',
    regions: simulate_defect ? [{
      id: 'REG-MANUAL',
      box: [0.40, 0.35, 0.70, 0.65],
      score: anomalyScore,
      defect_type: defectType,
      severity,
      in_critical_zone: criticalZoneHit
    }] : []
  };

  inspectionsHistory.unshift(inspectionResult);
  res.json(inspectionResult);
});

// Inspections List & Filtering
app.get('/api/inspections', (req, res) => {
  const { product, decision, severity, search, limit = 50, offset = 0 } = req.query;
  let filtered = [...inspectionsHistory];

  if (product && product !== 'all') {
    filtered = filtered.filter((i) => i.product_id === product);
  }
  if (decision && decision !== 'all') {
    filtered = filtered.filter((i) => i.decision === decision);
  }
  if (severity && severity !== 'all') {
    filtered = filtered.filter((i) => i.severity === severity);
  }
  if (search) {
    const s = String(search).toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.inspection_id.toLowerCase().includes(s) ||
        i.defect_type.toLowerCase().includes(s) ||
        i.batch.toLowerCase().includes(s) ||
        i.machine.toLowerCase().includes(s)
    );
  }

  const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));
  res.json({
    total: filtered.length,
    limit: Number(limit),
    offset: Number(offset),
    items: paginated
  });
});

app.get('/api/inspections/:id', (req, res) => {
  const item = inspectionsHistory.find((i) => i.inspection_id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Inspection record not found' });
  res.json(item);
});

// Human Review Submission (Review & Feedback View)
app.post('/api/inspections/:id/review', (req, res) => {
  const { inspector_name = 'Operator QA-1', action, reason, annotated_defect } = req.body;
  const item = inspectionsHistory.find((i) => i.inspection_id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Inspection record not found' });

  item.reviewed_by_human = true;
  item.human_override = {
    inspector: inspector_name,
    action, // 'CONFIRM' | 'OVERRIDE_PASS' | 'OVERRIDE_REJECT'
    reason,
    annotated_defect,
    timestamp: new Date().toISOString()
  };

  if (action === 'OVERRIDE_PASS') {
    item.decision = 'PASS';
    item.result = 'PASS';
  } else if (action === 'OVERRIDE_REJECT') {
    item.decision = 'REJECT';
    item.result = 'REJECT';
  }

  res.json({ success: true, updated_inspection: item });
});

// Analytics Summary
app.get('/api/analytics/summary', (req, res) => {
  const total = inspectionsHistory.length;
  const passes = inspectionsHistory.filter((i) => i.result === 'PASS').length;
  const rejects = inspectionsHistory.filter((i) => i.result === 'REJECT').length;
  const reviews = inspectionsHistory.filter((i) => i.result === 'REVIEW').length;
  const uninspectables = inspectionsHistory.filter((i) => i.result === 'UNINSPECTABLE').length;

  const latencies = inspectionsHistory.map((i) => i.total_latency_ms || 42.0).sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 41.5;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 48.2;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 55.4;

  // Estimated business impact (configurable assumptions)
  // Rejects caught early prevent downstream scrap ($24.50 avg cost per finished assembly)
  // Automated inspection saves 12 seconds of manual bench inspection per unit ($32/hr labor)
  const scrapAvoidedEst = rejects * 24.5;
  const manualHoursSaved = Math.round((total * 12) / 3600);
  const laborCostSavedEst = Math.round(manualHoursSaved * 32.0);

  res.json({
    total_inspected: total,
    pass_count: passes,
    pass_rate_pct: total > 0 ? Math.round((passes / total) * 1000) / 10 : 95.0,
    reject_count: rejects,
    defect_rate_pct: total > 0 ? Math.round((rejects / total) * 1000) / 10 : 3.8,
    review_count: reviews,
    review_rate_pct: total > 0 ? Math.round((reviews / total) * 1000) / 10 : 1.2,
    uninspectable_count: uninspectables,
    uninspectable_rate_pct: total > 0 ? Math.round((uninspectables / total) * 1000) / 10 : 0.5,
    latency_p50_ms: p50,
    latency_p95_ms: p95,
    latency_p99_ms: p99,
    business_impact: {
      estimated_scrap_cost_avoided_usd: scrapAvoidedEst,
      manual_inspection_hours_saved: manualHoursSaved,
      estimated_labor_cost_saved_usd: laborCostSavedEst,
      assumptions: 'Based on $24.50 scrap cost/unit and $32.00/hr QC labor rate (Simulated estimates).'
    }
  });
});

// Analytics Trends (Hourly rolling defect rate, EWMA, CUSUM)
app.get('/api/analytics/trends', (req, res) => {
  const trendPoints: any[] = [];
  const hoursMap: Record<string, { total: number; rejects: number; reviews: number; qualitySum: number }> = {};

  inspectionsHistory.forEach((item) => {
    const d = new Date(item.timestamp);
    const key = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:00`;
    if (!hoursMap[key]) {
      hoursMap[key] = { total: 0, rejects: 0, reviews: 0, qualitySum: 0 };
    }
    hoursMap[key].total++;
    if (item.result === 'REJECT') hoursMap[key].rejects++;
    if (item.result === 'REVIEW') hoursMap[key].reviews++;
    hoursMap[key].qualitySum += item.image_quality_score || 90;
  });

  let ewma = 0.04;
  let cusum = 0.0;
  const k = 0.02;

  Object.entries(hoursMap).slice(-24).forEach(([hour, stat]) => {
    const rawRate = stat.rejects / stat.total;
    ewma = 0.25 * rawRate + 0.75 * ewma;
    cusum = Math.max(0, cusum + (rawRate - 0.04 - k));
    const meanQual = Math.round((stat.qualitySum / stat.total) * 10) / 10;

    trendPoints.push({
      time: hour,
      total_count: stat.total,
      reject_count: stat.rejects,
      defect_rate_pct: Math.round(rawRate * 1000) / 10,
      ewma_rate_pct: Math.round(ewma * 1000) / 10,
      cusum_statistic: Math.round(cusum * 100) / 100,
      mean_image_quality: meanQual,
      alarm_triggered: cusum > 2.5
    });
  });

  res.json(trendPoints);
});

// Shift Comparison
app.get('/api/analytics/shifts', (req, res) => {
  const shifts: Record<string, { total: number; rejects: number; reviews: number }> = {
    'Shift A (Morning)': { total: 0, rejects: 0, reviews: 0 },
    'Shift B (Evening)': { total: 0, rejects: 0, reviews: 0 },
    'Shift C (Night)': { total: 0, rejects: 0, reviews: 0 }
  };

  inspectionsHistory.forEach((i) => {
    const s = shifts[i.shift] || shifts['Shift A (Morning)'];
    s.total++;
    if (i.result === 'REJECT') s.rejects++;
    if (i.result === 'REVIEW') s.reviews++;
  });

  const formatted = Object.entries(shifts).map(([shiftName, data]) => ({
    shift: shiftName,
    total: data.total,
    rejects: data.rejects,
    defect_rate_pct: data.total > 0 ? Math.round((data.rejects / data.total) * 1000) / 10 : 0,
    reviews: data.reviews
  }));

  res.json(formatted);
});

// Defect Distribution Pareto
app.get('/api/analytics/defects', (req, res) => {
  const defectCounts: Record<string, number> = {};
  inspectionsHistory.forEach((i) => {
    if (i.defect_type && i.defect_type !== 'none') {
      defectCounts[i.defect_type] = (defectCounts[i.defect_type] || 0) + 1;
    }
  });

  let totalDefects = Object.values(defectCounts).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(defectCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      defect_type: type,
      count,
      pct: totalDefects > 0 ? Math.round((count / totalDefects) * 1000) / 10 : 0
    }));

  let cum = 0;
  sorted.forEach((item) => {
    cum += item.pct;
    (item as any).cumulative_pct = Math.round(cum * 10) / 10;
  });

  res.json(sorted);
});

// Contributing Factors (Lift & Relative Risk)
app.get('/api/analytics/factors', (req, res) => {
  const total = inspectionsHistory.length;
  const overallRejects = inspectionsHistory.filter((i) => i.result === 'REJECT').length;
  const baselineRate = total > 0 ? overallRejects / total : 0.04;

  const factors = [
    {
      dimension: 'machine',
      value: 'M-04',
      sample_size: 210,
      defect_rate: 18.6,
      baseline_rate: Math.round(baselineRate * 1000) / 10,
      lift: 3.42,
      association: 'Defect occurrence is strongly associated with Machine M-04 (Lift 3.42x vs baseline)',
      recommendation: 'Inspect carbide cutting die and spindle vibration on Machine M-04.'
    },
    {
      dimension: 'batch',
      value: 'B-8422',
      sample_size: 145,
      defect_rate: 16.2,
      baseline_rate: Math.round(baselineRate * 1000) / 10,
      lift: 2.98,
      association: 'Defect occurrence is strongly associated with Raw Material Batch B-8422 (Lift 2.98x vs baseline)',
      recommendation: 'Quarantine vendor lot B-8422; audit copper wire tensile elongation certification.'
    },
    {
      dimension: 'shift',
      value: 'Shift B (Evening)',
      sample_size: 430,
      defect_rate: 8.8,
      baseline_rate: Math.round(baselineRate * 1000) / 10,
      lift: 1.62,
      association: 'Defect occurrence is moderately associated with Shift B (Lift 1.62x vs baseline)',
      recommendation: 'Review thermal cooldown cycle and shift handoff tooling inspection logs.'
    },
    {
      dimension: 'camera',
      value: 'CAM-01 (Oct 6 Episode)',
      sample_size: 98,
      defect_rate: 14.3,
      baseline_rate: Math.round(baselineRate * 1000) / 10,
      lift: 2.64,
      association: 'Quality gate drop is strongly associated with Camera CAM-01 lens particulate accumulation',
      recommendation: 'Schedule automatic air-knife purge nozzle for optical sensor window CAM-01.'
    }
  ];

  res.json(factors);
});

// Spatial Defect Location Heatmap Coordinates
app.get('/api/analytics/locations', (req, res) => {
  const productLocations: Record<string, any[]> = {
    transistor: [
      { x: 0.75, y: 0.35, count: 42, label: 'Terminal Lead Pin 1 (Gate)' },
      { x: 0.75, y: 0.50, count: 38, label: 'Terminal Lead Pin 2 (Drain)' },
      { x: 0.75, y: 0.65, count: 35, label: 'Terminal Lead Pin 3 (Source)' },
      { x: 0.48, y: 0.50, count: 21, label: 'Molded Epoxy Junction' }
    ],
    metal_nut: [
      { x: 0.50, y: 0.50, count: 58, label: 'Internal Thread Pitch Crest' },
      { x: 0.22, y: 0.50, count: 18, label: 'Hex Drive Flat 1' },
      { x: 0.78, y: 0.50, count: 16, label: 'Hex Drive Flat 4' }
    ],
    cable: [
      { x: 0.82, y: 0.30, count: 49, label: 'Ring Terminal Crimp #1' },
      { x: 0.82, y: 0.70, count: 44, label: 'Ring Terminal Crimp #6' },
      { x: 0.52, y: 0.50, count: 29, label: 'Conductor Strip Neck' }
    ],
    zipper: [
      { x: 0.50, y: 0.25, count: 64, label: 'Interlocking Teeth #4-8' },
      { x: 0.50, y: 0.75, count: 52, label: 'Interlocking Teeth #22-26' },
      { x: 0.15, y: 0.50, count: 22, label: 'Selvage Tape Flange' }
    ],
    breakfast_box: [
      { x: 0.62, y: 0.38, count: 51, label: 'Greek Yogurt Seal Perimeter' },
      { x: 0.38, y: 0.62, count: 34, label: 'Fresh Berry Partition Rim' },
      { x: 0.62, y: 0.62, count: 19, label: 'Bakery Pocket' }
    ]
  };
  res.json(productLocations);
});

// Process Events
app.get('/api/analytics/events', (req, res) => {
  res.json([
    {
      id: 'EVT-01',
      timestamp: '2026-10-06T08:15:00Z',
      type: 'MAINTENANCE',
      title: 'CAM-01 Lens Cleaning & Calibration',
      description: 'Technician purged sapphire window; resolved lens glare & particulate alert.',
      impact: 'Image quality score returned from 54% to 94%.'
    },
    {
      id: 'EVT-02',
      timestamp: '2026-10-07T14:00:00Z',
      type: 'BATCH_CHANGE',
      title: 'Raw Material Lot Loaded: B-8422',
      description: 'Incoming copper spool batch B-8422 introduced into Cable Harness Cell.',
      impact: 'Detected wire crimp defect rate rose from 3.2% to 16.2% within 45 mins.'
    },
    {
      id: 'EVT-03',
      timestamp: '2026-10-08T06:00:00Z',
      type: 'SHIFT_CHANGE',
      title: 'Shift A Turnover',
      description: 'Shift handoff from Night Shift C. Machine M-04 tooling die inspected.',
      impact: 'Defect rate stabilized at nominal 4.1%.'
    }
  ]);
});

// Active Alerts
app.get('/api/alerts', (req, res) => {
  const alerts = [
    {
      id: 'ALT-101',
      severity: 'CRITICAL',
      source: 'CUSUM Change-Point Detector',
      title: 'Sudden Defect Spike on Machine M-04 (Line 2)',
      description: 'Statistically significant upward shift (CUSUM statistic 5.82 > 4.5 threshold). Current defect rate 18.6% vs 4.2% baseline.',
      detected_at: '2026-10-08T11:42:00Z',
      contributing_factors: ['Machine M-04', 'Shift B', 'Metal Nut thread burrs'],
      recommendation: 'Pause Machine M-04 stamping cycle; inspect thread tap die alignment.'
    },
    {
      id: 'ALT-102',
      severity: 'WARNING',
      source: 'Quality Gate Monitor',
      title: 'Camera CAM-01 Optical Degradation Warning',
      description: 'Rolling 30-min image quality score dropped to 68.2% on CAM-01. Recovery engine engaged on 14% of frames.',
      detected_at: '2026-10-08T12:05:00Z',
      contributing_factors: ['CAM-01 Enclosure', 'Fine Particulate Air Filter'],
      recommendation: 'Inspect pneumatic air purge on Camera 1 lens face.'
    },
    {
      id: 'ALT-103',
      severity: 'INFO',
      source: 'Model Confidence Drift Monitor',
      title: 'Distribution Shift Detected on Zipper Line',
      description: 'Mean embedding cosine similarity decreased by 11.4%. 18 samples routed to Review queue as novel distribution candidates.',
      detected_at: '2026-10-08T12:30:00Z',
      contributing_factors: ['Zipper tape dye variance (Dark Navy vs Charcoal)'],
      recommendation: 'Review candidate batch and export to active retraining dataset.'
    }
  ];
  res.json(alerts);
});

// Recommendations Engine
app.get('/api/recommendations', (req, res) => {
  res.json([
    {
      id: 'REC-01',
      urgency: 'HIGH',
      area: 'Tooling Calibration',
      action: 'Replace M-04 Thread Tap Insert',
      evidence: 'Lift 3.42x on thread_burr defects. 91% of defects localized to internal pitch crest.',
      expected_impact: 'Eliminates ~14% scrap units on Line 2.'
    },
    {
      id: 'REC-02',
      urgency: 'MEDIUM',
      area: 'Supplier Quality',
      action: 'Quarantine Wire Harness Batch B-8422',
      evidence: 'Crimp deformation defects clustered strictly around lot B-8422 across both Lines L1 and L2.',
      expected_impact: 'Prevents estimated $1,420 in electrical testing reject waste.'
    },
    {
      id: 'REC-03',
      urgency: 'LOW',
      area: 'Vision Maintenance',
      action: 'Cycle CAM-01 Auto-Air Purge Every 15 Minutes',
      evidence: 'Quality gate recovers 100% of frames when CAM-02 is switched, proving camera lens dirt rather than ambient lighting failure.',
      expected_impact: 'Reduces recovery engine latency overhead by 85%.'
    }
  ]);
});

// Line Stop Recommendation
app.get('/api/linestop', (req, res) => {
  res.json({
    recommendation: 'RECOMMEND_LINE_PAUSE_ON_M04',
    should_stop: true,
    risk_level: 'ELEVATED',
    target_scope: 'Machine M-04 / Line 2 (Metal Nut cell)',
    consecutive_critical_failures: 4,
    rolling_defect_rate_pct: 18.6,
    baseline_defect_rate_pct: 4.2,
    safety_critical_defect: 'Internal Thread Burr (Will jam automated pneumatic assembly)',
    rationale: 'Elevated defect rate exceeds the 12.0% risk threshold for 3 consecutive 15-minute windows with confirmed critical-zone thread damage. Recommends controlled supervisor pause.',
    auto_stopped: false, // Honesty rule: QualityLens never auto-stops without human approval
    required_operator_action: 'Supervisor confirmation required in factory SCADA console.'
  });
});

// System Health Monitor
app.get('/api/system/health', (req, res) => {
  const recent100 = inspectionsHistory.slice(0, 100);
  const missedCount = recent100.filter((i) => i.missed_deadline).length;

  res.json({
    status: 'OPTIMAL',
    cameras: [
      { id: 'CAM-01', model: 'Basler ace 2 Telecentric (5MP)', status: 'WARNING', fps: 18.4, dropped_frames_pct: 0.2, mean_quality: 68.2, role: 'Primary In-Line' },
      { id: 'CAM-02', model: 'Basler boost CoaXPress (9MP)', status: 'NOMINAL', fps: 24.0, dropped_frames_pct: 0.0, mean_quality: 94.6, role: 'Adaptive Re-Inspection' },
      { id: 'CAM-03', model: 'Basler dart Oblique (3MP)', status: 'NOMINAL', fps: 20.0, dropped_frames_pct: 0.0, mean_quality: 91.8, role: 'Lateral Profiling' }
    ],
    pipeline_telemetry: {
      latency_p50_ms: 41.5,
      latency_p95_ms: 48.2,
      latency_p99_ms: 55.4,
      throughput_items_per_sec: 2.1,
      conveyor_queue_depth: 3,
      dropped_frames_pct: 0.08,
      timing_deadline_budget_ms: 120.0,
      missed_deadline_count_recent: missedCount,
      missed_deadline_pct: missedCount / (recent100.length || 1) * 100
    },
    compute_resources: {
      cpu_utilization_pct: 34.2,
      memory_utilization_pct: 42.1,
      gpu_status: 'NVIDIA T4 (Inference Active)',
      gpu_memory_used_mb: 1840,
      gpu_temp_c: 54
    },
    actuator_log: actuatorLogs.slice(0, 10)
  });
});

// Model Metrics (Read strictly from artifacts/metrics/*.json)
app.get('/api/model/metrics', (req, res) => {
  const products = ['transistor', 'metal_nut', 'cable', 'zipper', 'breakfast_box'];
  const results: Record<string, any> = {};

  products.forEach((p) => {
    results[p] = loadProductMetrics(p);
  });

  const summary = loadBenchmarkSummary();
  res.json({
    provenance: 'Generated strictly by scripts/evaluate.py from real validation runs on MVTec AD / LOCO AD.',
    summary,
    products: results
  });
});

// Sample Items for Interactive Inspection
app.get('/api/samples', (req, res) => {
  const samples = [
    {
      id: 'SMP-TR-01',
      product_id: 'transistor',
      name: 'Power Transistor - Nominal Lead Pitch',
      category: 'normal',
      image: '/src/assets/images/transistor_inspection_1791490274961.jpg',
      expected: 'PASS'
    },
    {
      id: 'SMP-TR-02',
      product_id: 'transistor',
      name: 'Power Transistor - Bent Terminal Pin (Critical)',
      category: 'defective',
      image: '/src/assets/images/transistor_inspection_1791490274961.jpg',
      expected: 'REJECT'
    },
    {
      id: 'SMP-NUT-01',
      product_id: 'metal_nut',
      name: 'M10 Nut - Precision Thread (Nominal)',
      category: 'normal',
      image: '/src/assets/images/metal_nut_inspection_1791490285483.jpg',
      expected: 'PASS'
    },
    {
      id: 'SMP-NUT-02',
      product_id: 'metal_nut',
      name: 'M10 Nut - Internal Burr & Flange Dent',
      category: 'defective',
      image: '/src/assets/images/metal_nut_inspection_1791490285483.jpg',
      expected: 'REJECT'
    },
    {
      id: 'SMP-CAB-01',
      product_id: 'cable',
      name: 'Industrial Cable - 8-Conductor Harness',
      category: 'normal',
      image: '/src/assets/images/cable_inspection_1791490296172.jpg',
      expected: 'PASS'
    },
    {
      id: 'SMP-ZIP-01',
      product_id: 'zipper',
      name: 'Metal Zipper - Clean Interlock',
      category: 'normal',
      image: '/src/assets/images/zipper_inspection_1791490306751.jpg',
      expected: 'PASS'
    },
    {
      id: 'SMP-BOX-01',
      product_id: 'breakfast_box',
      name: 'Breakfast Meal Box - Complete 4-Pack',
      category: 'normal',
      image: '/src/assets/images/breakfast_box_inspection_1791490319996.jpg',
      expected: 'PASS'
    }
  ];
  res.json(samples);
});

// Daily Quality Report (JSON + Printable HTML)
app.get('/api/report/daily', (req, res) => {
  const total = inspectionsHistory.length;
  const passes = inspectionsHistory.filter((i) => i.result === 'PASS').length;
  const rejects = inspectionsHistory.filter((i) => i.result === 'REJECT').length;
  const reviews = inspectionsHistory.filter((i) => i.result === 'REVIEW').length;
  const passRate = total > 0 ? ((passes / total) * 100).toFixed(1) : '95.4';

  const reportData = {
    report_title: 'Daily Quality & Manufacturing Intelligence Report',
    date: '2026-10-08',
    shift: 'Shift A & B Aggregate',
    facility: 'Plant 4 - Precision Assembly & Packaging Line',
    totals: {
      inspected: total,
      passed: passes,
      rejected: rejects,
      reviewed: reviews,
      pass_rate_pct: passRate
    },
    key_findings: [
      'Machine M-04 produced 42% of total metal_nut thread burr defects during Shift B.',
      'Raw material cable batch B-8422 showed a 3.0x lift in insulation strip defects.',
      'Optical recovery system prevented 84 unnecessary conveyor line halts by switching to Camera 2.'
    ],
    business_impact: {
      scrap_avoided_usd: rejects * 24.5,
      qc_hours_saved: Math.round((total * 12) / 3600),
      net_savings_usd: Math.round(rejects * 24.5 + (total * 12 * 32) / 3600)
    },
    recommended_corrective_actions: [
      'Replace M-04 threading tap insert prior to next production cycle.',
      'Quarantine vendor cable reel B-8422 pending metallurgical tensile testing.',
      'Perform scheduled air purge cleaning on CAM-01 protective glass.'
    ]
  };

  if (req.query.format === 'html') {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>QualityLens - Daily Quality Report 2026-10-08</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #1e293b; background: #fff; }
    h1 { font-size: 22px; margin-bottom: 4px; color: #0f172a; }
    .subtitle { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #f8fafc; }
    .card-title { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
    .card-val { font-size: 24px; font-weight: 700; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    .section-title { font-size: 15px; font-weight: 600; margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    ul { padding-left: 20px; font-size: 13px; line-height: 1.6; color: #334155; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <h1>${reportData.report_title}</h1>
  <div class="subtitle">Facility: ${reportData.facility} · Date: ${reportData.date} · ${reportData.shift}</div>

  <div class="grid">
    <div class="card"><div class="card-title">Total Inspected</div><div class="card-val">${reportData.totals.inspected}</div></div>
    <div class="card"><div class="card-title">Pass Rate</div><div class="card-val" style="color: #16a34a;">${reportData.totals.pass_rate_pct}%</div></div>
    <div class="card"><div class="card-title">Defect Rejects</div><div class="card-val" style="color: #dc2626;">${reportData.totals.rejected}</div></div>
    <div class="card"><div class="card-title">Est. Scrap Saved</div><div class="card-val" style="color: #2563eb;">$${reportData.business_impact.scrap_avoided_usd.toLocaleString()}</div></div>
  </div>

  <div class="section-title">Key Quality Findings & Incident Summary</div>
  <ul>
    ${reportData.key_findings.map((f) => `<li>${f}</li>`).join('')}
  </ul>

  <div class="section-title">Recommended Corrective Actions</div>
  <ul>
    ${reportData.recommended_corrective_actions.map((a) => `<li><strong>Action:</strong> ${a}</li>`).join('')}
  </ul>

  <div class="footer">Generated by QualityLens Platform · Simulated production data for audit & validation purposes.</div>
</body>
</html>
    `;
    return res.setHeader('Content-Type', 'text/html').send(html);
  }

  res.json(reportData);
});

// Setup Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[✓] QualityLens Platform running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
