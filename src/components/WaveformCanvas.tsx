import { useRef, useEffect } from "react";

interface WaveformCanvasProps {
  signals: { data: number[]; colour: string; lineWidth?: number; label?: string }[];
  height?: number;
  className?: string;
  yRange?: [number, number];
  showAxis?: boolean;
  showGrid?: boolean;
  highlightMatch?: boolean;
}

export default function WaveformCanvas({
  signals,
  height = 150,
  className = "",
  yRange,
  showAxis = true,
  showGrid = false,
  highlightMatch = false,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = height;

    ctx.clearRect(0, 0, w, h);

    // Compute y range
    let yMin: number;
    let yMax: number;
    if (yRange) {
      [yMin, yMax] = yRange;
    } else {
      yMin = Infinity;
      yMax = -Infinity;
      for (const sig of signals) {
        for (const v of sig.data) {
          if (v < yMin) yMin = v;
          if (v > yMax) yMax = v;
        }
      }
      if (!isFinite(yMin)) { yMin = -1; yMax = 1; }
      const pad = (yMax - yMin) * 0.15 || 0.5;
      yMin -= pad;
      yMax += pad;
    }

    const mapY = (v: number) => h - ((v - yMin) / (yMax - yMin)) * h;

    // Grid
    if (showGrid) {
      ctx.strokeStyle = "rgba(42, 61, 107, 0.5)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        const y = (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    // Zero axis
    if (showAxis) {
      const zeroY = mapY(0);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(w, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw signals
    for (const sig of signals) {
      const N = sig.data.length;
      if (N === 0) continue;

      ctx.strokeStyle = sig.colour;
      ctx.lineWidth = sig.lineWidth ?? 2;
      ctx.lineJoin = "round";
      ctx.beginPath();

      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * w;
        const y = mapY(sig.data[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Labels
    if (signals.some((s) => s.label)) {
      ctx.font = "12px 'DM Sans', sans-serif";
      let labelX = 8;
      for (const sig of signals) {
        if (!sig.label) continue;
        ctx.fillStyle = sig.colour;
        ctx.fillRect(labelX, 8, 12, 3);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillText(sig.label, labelX + 16, 14);
        labelX += ctx.measureText(sig.label).width + 32;
      }
    }

    // Match glow
    if (highlightMatch) {
      ctx.save();
      ctx.strokeStyle = "rgba(34, 211, 238, 0.15)";
      ctx.lineWidth = h;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.restore();
    }
  }, [signals, height, yRange, showAxis, showGrid, highlightMatch]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full block ${className}`}
      style={{ height }}
    />
  );
}
