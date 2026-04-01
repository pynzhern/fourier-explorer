import { useMemo } from "react";
import SectionWrapper from "./SectionWrapper";
import SpectrumChart from "./SpectrumChart";
import MathBlock from "./Math";
import {
  generateSignal,
  computeDFT,
  normalizeMagnitude,
} from "../utils/dft";
import type { SineComponent } from "../utils/dft";

const N = 512;
const MAX_DISPLAY = 16;

interface FrequencySpectrumProps {
  components: SineComponent[];
}

export default function FrequencySpectrum({
  components,
}: FrequencySpectrumProps) {
  const signal = useMemo(() => generateSignal(components, N), [components]);
  const dft = useMemo(() => computeDFT(signal), [signal]);
  const normalizedMags = useMemo(
    () => normalizeMagnitude(dft.magnitude, N),
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
      subtitle="When you compute the dot product at every frequency, you get the full picture: a frequency spectrum. Each bar shows how much energy lives at that frequency. Try changing the signal in Part One and watch the spectrum update."
    >
      <div className="space-y-6">
        {/* Spectrum */}
        <div className="rounded-xl bg-navy-800/50 border border-slate-700/50 p-6">
          <SpectrumChart
            magnitudes={normalizedMags}
            maxFreq={MAX_DISPLAY}
            height={240}
            activeFrequencies={activeFreqs}
          />
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
            <span>Frequency bin (k)</span>
            <span>Magnitude (normalized)</span>
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
              Here <em>n</em> is the time index, <em>k</em> is the frequency index, <em>N</em> is the total number of samples, and <MathBlock tex="j = \sqrt{-1}" />. In practice, the Fast Fourier Transform (FFT) computes the same result in <MathBlock tex="\mathcal{O}(N \log N)" /> instead of <MathBlock tex="\mathcal{O}(N^2)" />, which is why real-world libraries use FFT. The math is identical.
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
              The height of each bar is{" "}
              <MathBlock tex="|X[k]| = \sqrt{a_k^2 + b_k^2}" />,
              the magnitude of the complex coefficient. In audio, higher
              magnitude means that pitch is louder. Notice that volume (amplitude)
              does not affect which frequencies are present, only how tall the
              bars are.
            </p>
          </div>
          <div className="rounded-xl bg-navy-800/30 border border-slate-700/40 p-4">
            <h4 className="text-amber-400 font-medium text-sm mb-2">Phase</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Each frequency also carries a phase angle{" "}
              <MathBlock tex="\phi_k = \angle X[k]" />, the angle of the
              complex coefficient <MathBlock tex="X[k]" />. This tells you how
              shifted that sine wave is. The spectrum plot above shows magnitude
              only. Phase is needed for perfect reconstruction.
            </p>
          </div>
          <div className="rounded-xl bg-navy-800/30 border border-slate-700/40 p-4">
            <h4 className="text-violet-400 font-medium text-sm mb-2">
              Frequency bins (
              <MathBlock tex="\Delta f = \frac{f_s}{N}" />
              )
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              The DFT divides the frequency axis into <em>N</em> bins spaced{" "}
              <MathBlock tex="\Delta f = \frac{f_s}{N}" /> apart, where{" "}
              <MathBlock tex="f_s" /> is the sampling rate and <MathBlock tex="N" /> is the number of
              samples. More samples means finer resolution. Bin <MathBlock tex="k" /> corresponds to
              frequency <MathBlock tex="k \cdot \Delta f" /> Hz.
            </p>
          </div>
        </div>

        {/* Nyquist */}
        <div className="rounded-xl bg-navy-800/30 border border-slate-700/40 p-4">
          <h4 className="text-emerald-400 font-medium text-sm mb-2">
            Nyquist Rate and Sampling
          </h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            The sampling theorem tells us that to capture a frequency <MathBlock tex="f" /> without
            losing information, you must sample at least twice as fast:{" "}
            <MathBlock tex="f_s > 2 f_{\max}" />. This minimum rate is called
            the <span className="text-white">Nyquist rate</span>. Humans can
            hear 20 Hz to 20 kHz, so the industry standard for CD audio is
            44.1 kHz (just above <MathBlock tex="2 \times 20\,\text{kHz}" />). Only the bottom half of the DFT
            output (bins 0 to <MathBlock tex="N/2" />) represents unique positive frequencies; the
            upper half mirrors them.
          </p>
        </div>

        {/* PCA connection */}
        <div className="rounded-xl bg-navy-800/30 border border-cyan-400/10 p-5">
          <p className="text-slate-300 text-sm leading-relaxed">
            <span className="text-cyan-400 font-medium">
              Connection to PCA:
            </span>{" "}
            In PCA, you project data onto eigenvectors (the principal components)
            to get projection coefficients{" "}
            <MathBlock tex="\alpha_{ij} = \text{dot}(x_i, e_j)" />, and you can
            reconstruct{" "}
            <MathBlock tex="x_i = \sum \alpha_{ij} e_j" />. The DFT is exactly
            the same operation: project the signal onto sine and cosine basis
            vectors to get coefficients <MathBlock tex="a_k" /> and{" "}
            <MathBlock tex="b_k" />, and reconstruct as{" "}
            <MathBlock tex="x[n] = \sum (a_k \cdot \sin + b_k \cdot \cos)" />.
            Same math, different basis vectors chosen to reveal frequency content
            instead of variance.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
