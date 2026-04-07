import { useState, useMemo } from "react";
import SectionWrapper from "./SectionWrapper";
import WaveformCanvas from "./WaveformCanvas";
import Tex from "./Math";
import {
  generateSignal,
  computeDFT,
  reconstructSignal,
  normaliseMagnitude,
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

  const normalisedMags = useMemo(
    () => normaliseMagnitude(dft.magnitude, N),
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
      subtitle="The DFT doesn't destroy anything. Given the spectrum, you can perfectly rebuild the original signal by adding back one frequency component at a time. Slide K up and watch the cyan curve converge onto the original — that's the inverse DFT in action."
      narration={`Part four: reconstruction — no information lost. The D.F.T. doesn't destroy anything. Given the frequency spectrum, you can perfectly rebuild the original signal by adding back one frequency component at a time. Each frequency bin holds a coefficient — a weight that says how much cosine and how much sine at that frequency. Turn each coefficient back into a weighted wave, sum them all, and you get the original signal back. The more frequency bins you include, the better the approximation. With all bins included, you get perfect reconstruction — zero error. The D.F.T. and its inverse are exact inverses of each other. This is the principle behind compression. em pee three and jay peg work on this exact idea: transform to the frequency domain, keep only the bins with significant energy, and throw away the rest. The smallest number of bins that gives near-zero error is the compression sweet spot.`}
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
              Each frequency bin holds a coefficient — a weight that says "this
              much cosine, this much sine at frequency k." Turn each coefficient
              back into a weighted wave and sum them all:
            </p>
            <div className="bg-navy-900/50 rounded-lg p-3 text-center overflow-x-auto">
              <Tex
                tex="x[n] = \frac{1}{N} \sum_{k=0}^{N-1} \left( b_k \cos\!\left(2\pi k \tfrac{n}{N}\right) + a_k \sin\!\left(2\pi k \tfrac{n}{N}\right) \right)"
                display
              />
            </div>
            <p>
              More bins = better approximation. With all bins included, you get
              perfect reconstruction — zero error. This is lossless: the DFT and
              its inverse are exact inverses of each other.
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
              style={{ left: `${((K - 1) / (maxK - 1)) * 100}%` }}
            >
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 px-1 py-px rounded bg-red-400/20 text-[8px] text-red-400 whitespace-nowrap">
                cutoff
              </div>
            </div>
            <div className="flex items-end h-full pb-5 px-1">
              {normalisedMags.slice(1, maxK).map((mag, i) => {
                const k = i + 1;
                const maxMag = Math.max(...normalisedMags.slice(1, maxK), 0.01);
                const barH = (mag / maxMag) * 72;
                const included = k < K;
                return (
                  <div
                    key={k}
                    className="flex flex-col items-center justify-end"
                    style={{ width: `${100 / (maxK - 1)}%`, padding: `0 ${(100 / (maxK - 1)) * 0.1}%` }}
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
                colour: "rgba(255,255,255,0.2)",
                lineWidth: 1.5,
                label: "Original",
              },
              {
                data: reconstructed,
                colour: "#22d3ee",
                lineWidth: 2,
                label: `Reconstructed (K=${K})`,
              },
            ]}
            height={150}
            showGrid
          />
          <p className="text-xs text-slate-500 text-center">
            {error < 0.001
              ? "Perfect reconstruction — every sample matches the original exactly."
              : `${K} of ${maxK} bins included. The gap between cyan and grey is what you're throwing away.`}
          </p>
        </div>

        {/* Compression takeaway */}
        <div className="rounded-xl bg-navy-800/30 border border-cyan-400/10 p-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            <span className="text-cyan-400 font-medium">
              Why this matters — compression:
            </span>{" "}
            MP3 and JPEG work on this exact principle. Transform to the frequency
            domain, keep only the bins with significant energy, throw away the rest.
            You're using{" "}
            <span className="text-white">{K}/{maxK}</span> bins
            ({((K / maxK) * 100).toFixed(0)}% of the spectrum).{" "}
            {error < 0.001
              ? "Already perfect — the signal only contains a few frequencies, so most bins were empty anyway."
              : "Try finding the smallest K that gives near-zero error. That's the compression sweet spot."}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
