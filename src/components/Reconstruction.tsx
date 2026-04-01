import { useState, useMemo } from "react";
import SectionWrapper from "./SectionWrapper";
import WaveformCanvas from "./WaveformCanvas";
import Tex from "./Math";
import {
  generateSignal,
  computeDFT,
  reconstructSignal,
  normalizeMagnitude,
} from "../utils/dft";
import type { SineComponent } from "../utils/dft";

const N = 512;
const MAX_DISPLAY = 14;

interface ReconstructionProps {
  components: SineComponent[];
}

export default function Reconstruction({ components }: ReconstructionProps) {
  const [K, setK] = useState(1);

  const originalSignal = useMemo(
    () => generateSignal(components, N),
    [components],
  );

  const dft = useMemo(() => computeDFT(originalSignal), [originalSignal]);

  const normalizedMags = useMemo(
    () => normalizeMagnitude(dft.magnitude, N),
    [dft],
  );

  const reconstructed = useMemo(
    () => reconstructSignal(dft, K, N),
    [dft, K],
  );

  const error = useMemo(() => {
    let sumSq = 0;
    for (let i = 0; i < N; i++) {
      const diff = originalSignal[i] - reconstructed[i];
      sumSq += diff * diff;
    }
    return Math.sqrt(sumSq / N);
  }, [originalSignal, reconstructed]);

  const maxComponentFreq = Math.max(
    ...components.filter((c) => c.enabled).map((c) => c.frequency),
    1,
  );

  const maxK = Math.min(maxComponentFreq + 4, MAX_DISPLAY);

  return (
    <SectionWrapper
      id="reconstruction"
      number="Part Four"
      title="Reconstruction: no information lost"
      subtitle="The DFT is perfectly reversible. You can rebuild the original signal from its spectrum by adding back one frequency at a time. This is the inverse DFT in action."
    >
      <div className="space-y-5">
        {/* Intro */}
        <details className="group rounded-xl bg-navy-800/30 border border-cyan-400/20">
          <summary className="p-4 cursor-pointer text-sm text-cyan-400 font-medium select-none">
            How does reconstruction work?
            <span className="text-slate-500 font-normal ml-2 group-open:hidden">(click to expand)</span>
          </summary>
          <div className="px-4 pb-4 text-slate-300 text-sm leading-relaxed space-y-2">
            <p>
              Starting from the frequency spectrum, take each bin's coefficient and turn
              it back into a weighted sine and cosine wave. The inverse DFT formula is:
            </p>
            <div className="bg-navy-900/50 rounded-lg p-3 text-center overflow-x-auto">
              <Tex
                tex="x[n] = \frac{1}{N} \sum_{k=0}^{N-1} \left( b_k \cos\!\left(2\pi k \tfrac{n}{N}\right) + a_k \sin\!\left(2\pi k \tfrac{n}{N}\right) \right)"
                display
              />
            </div>
            <p>
              The more frequency bins you include (higher K), the closer you get to
              the original. Use the slider to control K.
            </p>
          </div>
        </details>

        {/* Combined: slider + spectrum + waveform in a tight layout */}
        <div className="rounded-xl bg-navy-800/50 border border-slate-700/50 p-4 space-y-3">
          {/* Slider row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm text-slate-400">K =</span>
              <span className="text-xl font-medium text-cyan-400 tabular-nums w-8 text-center">
                {K}
              </span>
              <span className="text-slate-600 text-sm">/ {maxK}</span>
            </div>
            <input
              type="range"
              min={1}
              max={maxK}
              step={1}
              value={K}
              onChange={(e) => setK(+e.target.value)}
              className="flex-1"
            />
            <div className="flex-shrink-0 text-right">
              <span className="text-xs text-slate-500">Error: </span>
              <span
                className={`text-sm font-medium tabular-nums ${
                  error < 0.001
                    ? "text-emerald-400"
                    : error < 0.1
                      ? "text-amber-400"
                      : "text-red-400"
                }`}
              >
                {error < 0.001 ? "~0" : error.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Spectrum with cutoff - compact */}
          <div className="relative" style={{ height: 100 }}>
            <div className="absolute left-0 top-0 bottom-5 w-px bg-slate-600/50" />
            <div className="absolute left-0 right-0 bottom-5 h-px bg-slate-600/50" />
            <div
              className="absolute top-0 bottom-5 w-px bg-red-400/60 z-10 transition-all duration-200"
              style={{ left: `${(K / maxK) * 100}%` }}
            >
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 px-1 py-px rounded bg-red-400/20 text-[8px] text-red-400 whitespace-nowrap">
                cutoff
              </div>
            </div>
            <div className="flex items-end h-full pb-5 px-1">
              {normalizedMags.slice(0, maxK).map((mag, k) => {
                const maxMag = Math.max(...normalizedMags.slice(0, maxK), 0.01);
                const barH = (mag / maxMag) * 72;
                const included = k < K;
                return (
                  <div
                    key={k}
                    className="flex flex-col items-center justify-end"
                    style={{ width: `${100 / maxK}%`, padding: `0 ${(100 / maxK) * 0.1}%` }}
                  >
                    <div
                      className={`w-full rounded-t transition-all duration-200 ${included ? "bg-cyan-400" : "bg-slate-700/50"}`}
                      style={{
                        height: Math.max(barH, 2),
                        opacity: included ? 1 : 0.3,
                        boxShadow: included ? "0 0 6px rgba(34,211,238,0.2)" : "none",
                      }}
                    />
                    <span className="text-[8px] text-slate-600 mt-0.5">{k}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reconstruction waveform */}
          <WaveformCanvas
            signals={[
              {
                data: originalSignal,
                color: "rgba(255,255,255,0.2)",
                lineWidth: 1.5,
                label: "Original",
              },
              {
                data: reconstructed,
                color: "#22d3ee",
                lineWidth: 2,
                label: `Reconstructed (K=${K})`,
              },
            ]}
            height={150}
            showGrid
          />
          <p className="text-xs text-slate-500 text-center">
            {error < 0.001
              ? "Perfect reconstruction. No information was lost in the DFT."
              : K >= maxComponentFreq
                ? "Almost there. A few more bins will capture everything."
                : `Using ${K} of ${maxK} frequency bins. Slide K higher to improve the approximation.`}
          </p>
        </div>

        {/* Compression takeaway */}
        <div className="rounded-xl bg-navy-800/30 border border-cyan-400/10 p-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            <span className="text-cyan-400 font-medium">
              Compression:
            </span>{" "}
            MP3 and JPEG use this principle. Transform data to the frequency domain,
            keep only bins with significant energy, discard the rest. You're using{" "}
            <span className="text-white">{K}/{maxK}</span> bins
            ({((K / maxK) * 100).toFixed(0)}% of spectrum).{" "}
            {error < 0.001
              ? "Already perfect, because the signal has only a few frequencies."
              : "Try finding the smallest K that gives near-zero error."}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
