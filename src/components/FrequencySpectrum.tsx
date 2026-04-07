import { useMemo } from "react";
import SectionWrapper from "./SectionWrapper";
import SpectrumChart from "./SpectrumChart";
import MathBlock from "./Math";
import {
  generateSignal,
  computeDFT,
  normaliseMagnitude,
} from "../utils/dft";
import type { SineComponent } from "../utils/dft";

const N = 512;
const MAX_DISPLAY = 12;

interface FrequencySpectrumProps {
  components: SineComponent[];
}

export default function FrequencySpectrum({
  components,
}: FrequencySpectrumProps) {
  const signal = useMemo(() => generateSignal(components, N), [components]);
  const dft = useMemo(() => computeDFT(signal), [signal]);
  const normalisedMags = useMemo(
    () => normaliseMagnitude(dft.magnitude, N),
    [dft],
  );

  const activeFreqs = components
    .filter((c) => c.enabled && c.amplitude > 0)
    .map((c) => c.frequency);

  return (
    <SectionWrapper
      id="spectrum"
      number="Part Three"
      title="The frequency spectrum"
      subtitle="Repeat that dot product at every integer frequency from 0 to N-1, and you get the full frequency spectrum. Each bar tells you how much energy lives at that frequency — tall bar means loud, short bar means quiet. Go back to Part One, change the signal, and watch the bars move in real time."
      narration={`Part three: the frequency spectrum. Repeat that dot product at every integer frequency from zero to N minus one, and you get the full frequency spectrum. Each bar tells you how much energy lives at that frequency — a tall bar means that frequency is loud, a short bar means it's quiet. Try changing the signal in part one and watch the spectrum update in real time. Each bar's height is the magnitude of the complex D.F.T. coefficient at that frequency — computed as the square root of the cosine coefficient squared plus the sine coefficient squared. Changing the amplitude of a component in part one makes its bar taller or shorter, but doesn't move it. The frequencies stay the same. Each frequency also carries a phase angle — it tells you where the wave starts. Two signals can have identical magnitude spectra but sound completely different because their phases differ. The D.F.T. divides the frequency axis into N bins. More samples means finer resolution — you can distinguish closer frequencies. There's also a fundamental limit: to faithfully capture a frequency, you must sample at least twice as fast. This is the Nye-quist rate. Human hearing tops out at about twenty kilo-hertz, so CD audio samples at forty-four point one kilo-hertz. Sample slower and high frequencies fold back as artefacts — that's aliasing. The connection to P.C.A.: P.C.A. picks basis vectors that maximise variance. The D.F.T. uses fixed sighnewsoidal bases that reveal frequency content. Same linear algebra, different question being asked.`}
    >
      <div className="space-y-6">
        {/* Spectrum */}
        <div className="rounded-xl bg-navy-800/50 border border-slate-700/50 p-6">
          <SpectrumChart
            magnitudes={normalisedMags}
            maxFreq={MAX_DISPLAY}
            startBin={1}
            height={240}
            activeFrequencies={activeFreqs}
          />
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
            <span>Frequency bin (k)</span>
            <span>Magnitude (normalised)</span>
          </div>
        </div>

        {/* The DFT formulas */}
        <div className="rounded-xl bg-navy-800/30 border border-slate-700/40 p-5">
          <h4 className="text-white font-medium text-sm mb-3">
            The DFT Equations
          </h4>
          <div className="space-y-4 text-sm text-slate-400">
            <div>
              <span className="text-cyan-400 text-xs font-medium">Forward DFT</span>
              <span className="text-slate-500 text-xs ml-2">(time domain to frequency domain)</span>
              <div className="mt-2 bg-navy-900/50 rounded px-4 py-3 overflow-x-auto">
                <MathBlock
                  tex="X[k] = \sum_{n=0}^{N-1} x[n] \left[\cos\left(2\pi k \frac{n}{N}\right) - j \sin\left(2\pi k \frac{n}{N}\right)\right]"
                  display
                />
              </div>
            </div>
            <div>
              <span className="text-amber-400 text-xs font-medium">Inverse DFT</span>
              <span className="text-slate-500 text-xs ml-2">(frequency domain back to time domain)</span>
              <div className="mt-2 bg-navy-900/50 rounded px-4 py-3 overflow-x-auto">
                <MathBlock
                  tex="x[n] = \frac{1}{N} \sum_{k=0}^{N-1} X[k] \left[\cos\left(2\pi k \frac{n}{N}\right) + j \sin\left(2\pi k \frac{n}{N}\right)\right]"
                  display
                />
              </div>
            </div>
            <p className="text-slate-500 text-xs">
              <em>n</em> = time index, <em>k</em> = frequency index, <em>N</em> = total samples, <MathBlock tex="j = \sqrt{-1}" />. The naive DFT is <MathBlock tex="\mathcal{O}(N^2)" /> — for every frequency bin, you loop over every sample. The Fast Fourier Transform (FFT) exploits symmetry to get <MathBlock tex="\mathcal{O}(N \log N)" />. Same result, much faster. Every audio app, numpy, and scipy uses FFT under the hood.
            </p>
          </div>
        </div>

        {/* Explanation cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-navy-800/30 border border-slate-700/40 p-4">
            <h4 className="text-cyan-400 font-medium text-sm mb-2">
              Magnitude
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Each bar's height is{" "}
              <MathBlock tex="|X[k]| = \sqrt{a_k^2 + b_k^2}" />,
              the magnitude of the complex coefficient. In audio terms: taller
              bar = louder pitch. Changing amplitude in Part One makes bars
              taller or shorter but doesn't move them — the frequencies stay the
              same.
            </p>
          </div>
          <div className="rounded-xl bg-navy-800/30 border border-slate-700/40 p-4">
            <h4 className="text-amber-400 font-medium text-sm mb-2">Phase</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Each frequency also carries a phase angle{" "}
              <MathBlock tex="\phi_k = \angle X[k]" /> — it tells you <em>where</em>{" "}
              the wave starts. Two signals can have identical magnitude spectra
              but sound completely different because their phases differ. The
              spectrum above shows magnitude only; phase is needed for perfect
              reconstruction.
            </p>
          </div>
          <div className="rounded-xl bg-navy-800/30 border border-slate-700/40 p-4">
            <h4 className="text-violet-400 font-medium text-sm mb-2">
              Frequency bins (
              <MathBlock tex="\Delta f = \frac{f_s}{N}" />
              )
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              The DFT chops the frequency axis into <em>N</em> bins spaced{" "}
              <MathBlock tex="\Delta f = \frac{f_s}{N}" /> apart.{" "}
              <MathBlock tex="f_s" /> is the sampling rate, <MathBlock tex="N" /> the number of
              samples. More samples = finer resolution (you can distinguish
              closer frequencies). Bin <MathBlock tex="k" /> corresponds to{" "}
              <MathBlock tex="k \cdot \Delta f" /> Hz.
            </p>
          </div>
        </div>

        {/* Nyquist */}
        <div className="rounded-xl bg-navy-800/30 border border-slate-700/40 p-4">
          <h4 className="text-emerald-400 font-medium text-sm mb-2">
            Nyquist Rate and Sampling
          </h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            Here's a fundamental limit: to faithfully capture a frequency{" "}
            <MathBlock tex="f" />, you must sample at least twice as fast —{" "}
            <MathBlock tex="f_s > 2 f_{\max}" />. This is the{" "}
            <span className="text-white">Nyquist rate</span>. Human hearing
            tops out at ~20 kHz, so CD audio samples at 44.1 kHz (just above{" "}
            <MathBlock tex="2 \times 20\,\text{kHz}" />). Sample slower and
            high frequencies "fold back" as artefacts — that's aliasing. Only
            bins 0 to <MathBlock tex="N/2" /> are unique; the upper half mirrors
            them due to the symmetry of real-valued signals.
          </p>
        </div>

        {/* PCA connection */}
        <div className="rounded-xl bg-navy-800/30 border border-cyan-400/10 p-5">
          <p className="text-slate-300 text-sm leading-relaxed">
            <span className="text-cyan-400 font-medium">
              PCA vs DFT — same recipe, different ingredients:
            </span>{" "}
            PCA projects data onto eigenvectors:{" "}
            <MathBlock tex="\alpha_{ij} = \text{dot}(x_i, e_j)" />, then
            reconstructs via{" "}
            <MathBlock tex="x_i = \sum \alpha_{ij} e_j" />. The DFT does the
            same — project onto sine/cosine bases to get{" "}
            <MathBlock tex="a_k" /> and <MathBlock tex="b_k" />, reconstruct as{" "}
            <MathBlock tex="x[n] = \sum \bigl(a_k \sin(2\pi k \tfrac{n}{N}) + b_k \cos(2\pi k \tfrac{n}{N})\bigr)" />.
            PCA picks basis vectors that maximise variance; the DFT uses fixed
            sinusoidal bases that reveal frequency content. Same linear algebra,
            different question being asked.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
