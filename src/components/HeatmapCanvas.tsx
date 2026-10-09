import React, { useRef, useEffect, useState } from 'react';

interface HeatmapCanvasProps {
  imageSrc: string;
  hasDefect: boolean;
  defectType?: string;
  anomalyScore?: number;
  criticalZones?: Array<{ id: string; name: string; bbox_norm: number[]; safety_critical?: boolean }>;
  regions?: Array<{ id: string; box: number[]; score: number; defect_type: string; in_critical_zone: boolean }>;
  showHeatmap?: boolean;
  showZones?: boolean;
  showBoxes?: boolean;
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
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

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

      // 1. Draw original image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 2. Draw Anomaly Heatmap if enabled and defect exists
      if (showHeatmap && (hasDefect || anomalyScore > 0.45)) {
        const cx = regions[0]?.box ? ((regions[0].box[1] + regions[0].box[3]) / 2) * canvas.width : canvas.width * 0.55;
        const cy = regions[0]?.box ? ((regions[0].box[0] + regions[0].box[2]) / 2) * canvas.height : canvas.height * 0.52;
        const radius = Math.max(45, (anomalyScore || 0.6) * 90);

        const radial = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
        radial.addColorStop(0, 'rgba(239, 68, 68, 0.72)');   // high anomaly core (red)
        radial.addColorStop(0.35, 'rgba(245, 158, 11, 0.55)'); // medium heat (amber)
        radial.addColorStop(0.7, 'rgba(59, 130, 246, 0.35)');  // low edge (blue)
        radial.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

        ctx.save();
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw Critical Zones
      if (showZones && criticalZones.length > 0) {
        criticalZones.forEach((z) => {
          const [ymin, xmin, ymax, xmax] = z.bbox_norm;
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
          ctx.fillRect(x, Math.max(0, y - 16), ctx.measureText(z.name).width + 8, 16);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(z.name, x + 4, Math.max(12, y - 4));
          ctx.restore();
        });
      }

      // 4. Draw Defect Bounding Boxes
      if (showBoxes && (regions.length > 0 || (hasDefect && anomalyScore > 0.5))) {
        const box = regions[0]?.box || [0.38, 0.32, 0.68, 0.68];
        const [ymin, xmin, ymax, xmax] = box;
        const x = xmin * canvas.width;
        const y = ymin * canvas.height;
        const w = (xmax - xmin) * canvas.width;
        const h = (ymax - ymin) * canvas.height;

        ctx.save();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
        ctx.strokeRect(x, y, w, h);

        // Corner tick marks
        const tick = 8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - 1, y - 1, tick, tick);

        // Header label
        const label = `${defectType || 'Defect'} (${(anomalyScore * 100).toFixed(1)}%)`;
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x, Math.max(0, y - 18), textWidth + 10, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + 5, Math.max(13, y - 5));
        ctx.restore();
      }
    };
  }, [imageSrc, hasDefect, defectType, anomalyScore, criticalZones, regions, showHeatmap, showZones, showBoxes]);

  return (
    <div className="relative w-full aspect-square bg-neutral-900 rounded-lg overflow-hidden border border-neutral-300">
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-400 font-mono">
          Loading telecentric feed...
        </div>
      )}
    </div>
  );
};
