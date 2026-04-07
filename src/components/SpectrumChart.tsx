interface SpectrumChartProps {
  magnitudes: number[];
  maxFreq?: number;
  startBin?: number;
  height?: number;
  className?: string;
  highlightBin?: number;
  activeFrequencies?: number[];
  labelPrefix?: string;
}

export default function SpectrumChart({
  magnitudes,
  maxFreq,
  startBin = 0,
  height = 200,
  className = "",
  highlightBin,
  activeFrequencies,
  labelPrefix = "k",
}: SpectrumChartProps) {
  const N = maxFreq ?? Math.min(magnitudes.length, 20);
  const bins = magnitudes.slice(startBin, N);
  const maxMag = Math.max(...bins, 0.01);

  const barWidth = 100 / bins.length;
  const barGap = barWidth * 0.2;

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Y-axis line */}
      <div className="absolute left-0 top-0 bottom-6 w-px bg-slate-600" />
      {/* X-axis line */}
      <div className="absolute left-0 right-0 bottom-6 h-px bg-slate-600" />

      <div className="flex items-end h-full pb-6 px-1">
        {bins.map((mag, i) => {
          const k = i + startBin;
          const barH = (mag / maxMag) * (height - 32);
          const isHighlight = highlightBin === k;
          const isActive = activeFrequencies?.includes(k);

          let barColour = "bg-cyan-400/60";
          if (isHighlight) barColour = "bg-amber-400";
          else if (isActive) barColour = "bg-cyan-400";
          else if (mag / maxMag > 0.3) barColour = "bg-cyan-400/80";

          return (
            <div
              key={k}
              className="flex flex-col items-center justify-end"
              style={{ width: `${barWidth}%`, padding: `0 ${barGap / 2}%` }}
            >
              <div
                className={`w-full rounded-t transition-all duration-200 ${barColour}`}
                style={{
                  height: Math.max(barH, 2),
                  boxShadow: isHighlight
                    ? "0 0 12px rgba(251, 191, 36, 0.5)"
                    : isActive
                      ? "0 0 8px rgba(34, 211, 238, 0.3)"
                      : "none",
                }}
              />
              <span className="text-[10px] text-slate-400 mt-1 leading-none">
                {labelPrefix}={k}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
