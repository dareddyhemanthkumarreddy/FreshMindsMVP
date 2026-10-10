import React, { useRef, useEffect, useState } from 'react';

interface HeatmapCanvasProps {
  imageSrc: string;
  hasDefect: boolean;
  defectType?: string;
  anomalyScore?: number;
  criticalZones?: Array<{ id: string; name: string; bbox_norm: number[]; safety_critical?: boolean }>;
  regions?: Array<{ id: string; box: number[]; score: number; defect_type: string; in_critical_zone?: boolean; severity?: string }>;
  showHeatmap?: boolean;
  showZones?: boolean;
  showBoxes?: boolean;
  isProcessing?: boolean;
}

// Normalize coordinate box: handles both [ymin, xmin, ymax, xmax] in 0..1 and 0..1000 scales
function normalizeBox(rawBox: number[]): [number, number, number, number] {
  if (!rawBox || rawBox.length < 4) return [0.2, 0.2, 0.8, 0.8];
  let [ymin, xmin, ymax, xmax] = rawBox;
  if (ymin > 1.0 || xmin > 1.0 || ymax > 1.0 || xmax > 1.0) {
    ymin = ymin / 1000;
    xmin = xmin / 1000;
    ymax = ymax / 1000;
    xmax = xmax / 1000;
  }
  // Clamp
  ymin = Math.max(0, Math.min(1, ymin));
  xmin = Math.max(0, Math.min(1, xmin));
  ymax = Math.max(ymin + 0.02, Math.min(1, ymax));
  xmax = Math.max(xmin + 0.02, Math.min(1, xmax));
  return [ymin, xmin, ymax, xmax];
}

export const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({
  imageSrc,
  hasDefect,
  defectType,
  anomalyScore = 0.25,
  criticalZones = [],
  regions = [],
  showHeatmap = true,
  showZones = true,
  showBoxes = true,
  isProcessing = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      setImageLoaded(true);
      canvas.width = 600;
      canvas.height = 600;

      // 1. Draw original workpiece image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 2. Draw Anomaly Heatmaps
      if (showHeatmap && (hasDefect || anomalyScore > 0.45)) {
        const targetRegions = regions.length > 0 ? regions : [{ box: [0.35, 0.35, 0.65, 0.65], score: anomalyScore, defect_type: defectType || 'anomaly', id: 'R1' }];

        targetRegions.forEach((reg) => {
          const [ymin, xmin, ymax, xmax] = normalizeBox(reg.box);
          const cx = ((xmin + xmax) / 2) * canvas.width;
          const cy = ((ymin + ymax) / 2) * canvas.height;
          const boxWidth = (xmax - xmin) * canvas.width;
          const boxHeight = (ymax - ymin) * canvas.height;
          const radius = Math.max(35, Math.max(boxWidth, boxHeight) * 0.85);

          const radial = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
          radial.addColorStop(0, 'rgba(239, 68, 68, 0.75)');    // Red high heat core
          radial.addColorStop(0.35, 'rgba(245, 158, 11, 0.55)'); // Amber mid heat
          radial.addColorStop(0.7, 'rgba(59, 130, 246, 0.30)');  // Cyan outer halo
          radial.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

          ctx.save();
          ctx.fillStyle = radial;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // 3. Draw Critical Zones
      if (showZones && criticalZones.length > 0) {
        criticalZones.forEach((z) => {
          const [ymin, xmin, ymax, xmax] = normalizeBox(z.bbox_norm);
          const x = xmin * canvas.width;
          const y = ymin * canvas.height;
          const w = (xmax - xmin) * canvas.width;
          const h = (ymax - ymin) * canvas.height;

          ctx.save();
          ctx.strokeStyle = z.safety_critical ? 'rgba(225, 29, 72, 0.85)' : 'rgba(37, 99, 235, 0.75)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(x, y, w, h);

          // Zone text tag
          ctx.fillStyle = z.safety_critical ? 'rgba(225, 29, 72, 0.9)' : 'rgba(37, 99, 235, 0.85)';
          ctx.font = '10px "JetBrains Mono", monospace';
          const text = z.name;
          ctx.fillRect(x, Math.max(0, y - 16), ctx.measureText(text).width + 8, 16);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(text, x + 4, Math.max(12, y - 4));
          ctx.restore();
        });
      }

      // 4. Draw Defect Bounding Boxes (for all detected regions)
      if (showBoxes && (regions.length > 0 || (hasDefect && anomalyScore > 0.45))) {
        const targetRegions = regions.length > 0 ? regions : [{ box: [0.35, 0.35, 0.65, 0.65], score: anomalyScore, defect_type: defectType || 'Defect', id: 'R1' }];

        targetRegions.forEach((reg, idx) => {
          const [ymin, xmin, ymax, xmax] = normalizeBox(reg.box);
          const x = xmin * canvas.width;
          const y = ymin * canvas.height;
          const w = (xmax - xmin) * canvas.width;
          const h = (ymax - ymin) * canvas.height;

          ctx.save();
          // High-visibility defect box
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([]);
          ctx.strokeRect(x, y, w, h);

          // Corner tick accents
          const tick = 8;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(x, y + tick);
          ctx.lineTo(x, y);
          ctx.lineTo(x + tick, y);
          ctx.stroke();
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(x + w - tick, y + h);
          ctx.lineTo(x + w, y + h);
          ctx.lineTo(x + w, y + h - tick);
          ctx.stroke();

          // Header label tag
          const tagLabel = `${reg.defect_type || defectType || 'Anomaly'} [${Math.round((reg.score || anomalyScore) * 100)}%]`;
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          const textWidth = ctx.measureText(tagLabel).width;
          const tagY = y > 20 ? y - 19 : y + h + 2;

          ctx.fillStyle = '#dc2626';
          ctx.fillRect(x, tagY, textWidth + 10, 18);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(tagLabel, x + 5, tagY + 13);
          ctx.restore();
        });
      }

      // 5. If PASS, draw subtle green verification watermark
      if (!hasDefect && anomalyScore < 0.45) {
        ctx.save();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 1.5;
        const bannerText = '✓ OPTICAL SPEC CONFORMANT · NO ANOMALIES';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        const w = ctx.measureText(bannerText).width + 16;
        ctx.fillRect(12, 12, w, 24);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(bannerText, 20, 28);
        ctx.restore();
      }
    };
  }, [imageSrc, hasDefect, defectType, anomalyScore, criticalZones, regions, showHeatmap, showZones, showBoxes]);

  return (
    <div className="relative w-full aspect-square bg-neutral-900 rounded-lg overflow-hidden border border-neutral-300 shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
      
      {/* Loading overlay when image is not yet rendered */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-400 font-mono">
          Loading optical feed...
        </div>
      )}

      {/* Real-time Laser Scanning Beam Animation during Neural Inference */}
      {isProcessing && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-blue-950/20 backdrop-blur-[1px]">
          {/* Animated laser line */}
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 shadow-[0_0_15px_#06b6d4] animate-pulse transition-all"
               style={{ animation: 'scannerMove 1.8s ease-in-out infinite alternate' }} />
          {/* Scanning status banner */}
          <div className="absolute bottom-3 left-3 right-3 bg-neutral-950/85 backdrop-blur-md border border-cyan-500/50 rounded-md p-2.5 text-center flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-cyan-300">
              Gemini 3.8 Flash Vision Neural Pipeline Ingesting Workpiece...
            </span>
          </div>
          <style>{`
            @keyframes scannerMove {
              0% { top: 4%; }
              100% { top: 94%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};
