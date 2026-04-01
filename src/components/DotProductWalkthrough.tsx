import { useState, useMemo } from "react";
import SectionWrapper from "./SectionWrapper";
import WaveformCanvas from "./WaveformCanvas";
import SpectrumChart from "./SpectrumChart";
import MathRenderer from "./Math";
import {
  generateSignal,
  dotProductWithCos,
  dotProductWithSin,
  normalizeMagnitude,
} from "../utils/dft";
import type { SineComponent } from "../utils/dft";

const N = 256;
const MAX_K = 14;

interface DotProductWalkthroughProps {
  components: SineComponent[];
}

export default function DotProductWalkthrough({
  components,
}: DotProductWalkthroughProps) {
  const [k, setK] = useState(1);
  const [showSin, setShowSin] = useState(false);

  const signal = useMemo(() => generateSignal(components, N), [components]);

  const cosResult = useMemo(
    () => dotProductWithCos(signal, k),
    [signal, k],
  );

  const sinResult = useMemo(
    () => dotProductWithSin(signal, k),
    [signal, k],
  );

  const activeResult = showSin ? sinResult : cosResult;

  // Compute magnitudes for all frequencies up to MAX_K
  const magnitudes = useMemo(() => {
    const mags = new Array(MAX_K).fill(0);
    for (let freq = 0; freq < MAX_K; freq++) {
      const cosR = dotProductWithCos(signal, freq);
      const sinR = dotProductWithSin(signal, freq);
      mags[freq] = Math.sqrt(
        cosR.dotProduct * cosR.dotProduct + sinR.dotProduct * sinR.dotProduct,
      );
    }
    return normalizeMagnitude(mags, N);
  }, [signal]);

  const magnitude = Math.sqrt(
    cosResult.dotProduct * cosResult.dotProduct +
      sinResult.dotProduct * sinResult.dotProduct,
  );

  // Check if this frequency matches a component
  const matchesComponent = components.some(
    (c) => c.enabled && c.frequency === k && c.amplitude > 0,
  );

  const activeComponentFreqs = components
    .filter((c) => c.enabled && c.amplitude > 0)
    .map((c) => c.frequency);

  return (
    <SectionWrapper
      id="dot-product"
      number="Part Two"
      title="The DFT is just dot products"
      subtitle={`Here's the key insight: to find out how much of a particular frequency is "hiding" in a signal, you multiply the signal by a sine or cosine wave at that frequency and add up the results. That's a dot product. It's the same operation as projecting a vector onto a basis vector in PCA.`}
    >
      <div className="space-y-4">

        {/* Collapsible: Orthogonality explanation */}
        <details className="rounded-xl bg-navy-800/30 border border-cyan-400/20 group">
          <summary className="flex items-center justify-between p-4 cursor-pointer select-none list-none">
            <span className="text-sm font-medium text-cyan-400">
              Why does the dot product work? (orthogonality)
            </span>
            <span className="text-slate-500 text-xs group-open:hidden">show</span>
            <span className="text-slate-500 text-xs hidden group-open:inline">hide</span>
          </summary>
          <div className="px-5 pb-5 space-y-3">
            <p className="text-slate-300 text-sm leading-relaxed">
              <span className="text-white font-medium">Orthogonality</span> is
              the same property that makes PCA work with eigenvectors. Sine and
              cosine waves at different frequencies are mutually orthogonal:
            </p>
            <ul className="text-slate-400 text-sm space-y-1.5 pl-4">
              <li>
                <MathRenderer tex="\sin(jx) \perp \cos(kx)" /> for any integers j, k
              </li>
              <li>
                <MathRenderer tex="\sin(jx) \perp \sin(kx)" /> when j and k differ
              </li>
              <li>
                <MathRenderer tex="\cos(jx) \perp \cos(kx)" /> when j and k differ
              </li>
            </ul>
            <p className="text-slate-300 text-sm leading-relaxed">
              When the test frequency{" "}
              <span className="text-cyan-400 font-medium">matches</span> a
              component in the signal, the waves line up and their product stays
              mostly positive, giving a large sum. When they{" "}
              <span className="text-amber-400 font-medium">don't match</span>,
              orthogonality guarantees the product oscillates symmetrically and
              cancels to roughly zero.
            </p>
          </div>
        </details>

        {/* Collapsible: Why both sin AND cos */}
        <details className="rounded-xl bg-navy-800/30 border border-amber-400/15 group">
          <summary className="flex items-center justify-between p-4 cursor-pointer select-none list-none">
            <span className="text-sm font-medium text-amber-400">
              Why test with both sine and cosine? (phase decomposition)
            </span>
            <span className="text-slate-500 text-xs group-open:hidden">show</span>
            <span className="text-slate-500 text-xs hidden group-open:inline">hide</span>
          </summary>
          <div className="px-5 pb-5 space-y-3">
            <p className="text-slate-300 text-sm leading-relaxed">
              A shifted sinusoid can be decomposed using the angle-addition identity:
            </p>
            <div className="py-2 text-center">
              <MathRenderer
                tex="\sin(2\pi ft + \phi) = \sin(2\pi ft)\cos(\phi) + \cos(2\pi ft)\sin(\phi)"
                display
              />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              So any real signal at a given frequency is a weighted mix of both
              sine and cosine. You need dot products with both bases to recover
              the full amplitude and phase shift. Toggle between the cos and sin
              basis below to see how the two dot products differ.
            </p>
          </div>
        </details>

        {/* Frequency stepper */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm text-slate-400">Test frequency:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setK(Math.max(0, k - 1))}
              disabled={k === 0}
              aria-label="Decrease frequency"
              className="w-8 h-8 rounded-lg bg-navy-700 border border-slate-600/50 text-white disabled:opacity-30 hover:border-cyan-400/50 transition-colors flex items-center justify-center"
            >
              -
            </button>
            <div className="px-4 py-1.5 rounded-lg bg-navy-800 border border-slate-600/50 min-w-[80px] text-center">
              <span className="text-cyan-400 font-medium text-lg tabular-nums">
                k = {k}
              </span>
            </div>
            <button
              onClick={() => setK(Math.min(MAX_K - 1, k + 1))}
              disabled={k === MAX_K - 1}
              aria-label="Increase frequency"
              className="w-8 h-8 rounded-lg bg-navy-700 border border-slate-600/50 text-white disabled:opacity-30 hover:border-cyan-400/50 transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setShowSin(false)}
              className={`px-3 py-1.5 rounded-l-lg text-xs font-medium transition-colors ${
                !showSin
                  ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                  : "bg-navy-800 text-slate-500 border border-slate-600/50"
              }`}
            >
              cos basis
            </button>
            <button
              onClick={() => setShowSin(true)}
              className={`px-3 py-1.5 rounded-r-lg text-xs font-medium transition-colors ${
                showSin
                  ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                  : "bg-navy-800 text-slate-500 border border-slate-600/50"
              }`}
            >
              sin basis
            </button>
          </div>

          {matchesComponent && (
            <div className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs font-medium animate-pulse">
              Match found!
            </div>
          )}
        </div>

        {/* Steps 1 & 2 side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Step 1: Signal + Basis overlay */}
          <div className="rounded-xl bg-navy-800/50 border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-slate-500 bg-slate-800 rounded px-2 py-0.5">
                Step 1
              </span>
              <span className="text-sm text-slate-400">
                Overlay signal with {showSin ? "sine" : "cosine"} basis at k={k}
              </span>
            </div>
            <WaveformCanvas
              signals={[
                { data: signal, color: "#ffffff", lineWidth: 1.5, label: "Signal" },
                {
                  data: activeResult.basis,
                  color: showSin ? "#fbbf24" : "#22d3ee",
                  lineWidth: 1.5,
                  label: `${showSin ? "sin" : "cos"}(2π·${k}·n/N)`,
                },
              ]}
              height={90}
            />
          </div>

          {/* Step 2: Element-wise product */}
          <div className="rounded-xl bg-navy-800/50 border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-slate-500 bg-slate-800 rounded px-2 py-0.5">
                Step 2
              </span>
              <span className="text-sm text-slate-400">
                Multiply point-by-point (element-wise product)
              </span>
            </div>
            <WaveformCanvas
              signals={[
                {
                  data: activeResult.products,
                  color: matchesComponent ? "#34d399" : "#f472b6",
                  lineWidth: 1.5,
                  label: "signal \u00d7 basis",
                },
              ]}
              height={90}
              highlightMatch={matchesComponent}
            />
            <p className="text-xs text-slate-500 mt-2">
              {matchesComponent
                ? "The product stays mostly on one side of zero — the waves are in sync."
                : "The product oscillates above and below zero, meaning these frequencies don't match."}
            </p>
          </div>
        </div>

        {/* Step 3: Dot product result */}
        <div className="rounded-xl bg-navy-800/50 border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-slate-500 bg-slate-800 rounded px-2 py-0.5">
              Step 3
            </span>
            <span className="text-sm text-slate-400">
              Sum all those products to get the dot product
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <div className="text-center">
              <div className="text-lg font-medium text-cyan-400 tabular-nums">
                b<sub>k</sub> = {cosResult.dotProduct.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500 mt-1">cos dot product</div>
            </div>
            <div className="text-slate-600 text-lg hidden sm:block">|</div>
            <div className="text-center">
              <div className="text-lg font-medium text-amber-400 tabular-nums">
                a<sub>k</sub> = {sinResult.dotProduct.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500 mt-1">sin dot product</div>
            </div>
            <div className="text-slate-600 text-lg hidden sm:block">|</div>
            <div className="text-center">
              <div className="text-2xl font-medium text-white tabular-nums">
                {magnitude.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                |X[{k}]| raw magnitude
              </div>
            </div>
            <div className="flex-1 text-sm text-slate-400 pl-4 border-l border-slate-700 min-w-[140px]">
              {matchesComponent ? (
                <span className="text-emerald-400">
                  Large magnitude: frequency k={k} is present in the signal!
                </span>
              ) : magnitude < 5 ? (
                <span>
                  Nearly zero: frequency k={k} is not in the signal.
                </span>
              ) : (
                <span>
                  Small value: minimal energy at frequency k={k}.
                </span>
              )}
            </div>
          </div>

          {/* Complex coefficient explanation */}
          <div className="mt-4 rounded-lg bg-navy-900/60 border border-slate-700/40 px-4 py-3 space-y-2">
            <p className="text-xs text-slate-400">
              <span className="text-slate-300 font-medium">Complex DFT coefficient</span>{" "}
              (j = imaginary unit):
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 items-center text-sm">
              <span>
                <MathRenderer tex={`X[${k}] = b_k - j \\cdot a_k`} />
                <span className="text-slate-500 text-xs ml-2">
                  = {cosResult.dotProduct.toFixed(1)} - j·({sinResult.dotProduct.toFixed(1)})
                </span>
              </span>
              <span>
                <MathRenderer tex={`|X[${k}]| = \\sqrt{b_k^2 + a_k^2}`} />
                <span className="text-slate-500 text-xs ml-2">
                  = {magnitude.toFixed(1)}
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              The complex number packs both the cosine and sine coefficients into a single value, encoding amplitude and phase together.
            </p>
          </div>
        </div>

        {/* Accumulating spectrum */}
        <div className="rounded-xl bg-navy-800/50 border border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">
              Frequency spectrum (built from all dot products)
            </span>
            <span className="text-xs text-slate-500">
              Step through k values above to see how each bin is computed
            </span>
          </div>
          <SpectrumChart
            magnitudes={magnitudes}
            maxFreq={MAX_K}
            height={180}
            highlightBin={k}
            activeFrequencies={activeComponentFreqs}
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
