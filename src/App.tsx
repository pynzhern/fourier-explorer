import { useState } from "react";
import SignalBuilder from "./components/SignalBuilder";
import DotProductWalkthrough from "./components/DotProductWalkthrough";
import FrequencySpectrum from "./components/FrequencySpectrum";
import Reconstruction from "./components/Reconstruction";
import NarrateButton from "./components/NarrateButton";
import type { SineComponent } from "./utils/dft";

const DEFAULT_COMPONENTS: SineComponent[] = [
  { frequency: 3, amplitude: 1.0, phase: 0, enabled: true },
  { frequency: 7, amplitude: 0.6, phase: 1.2, enabled: true },
  { frequency: 1, amplitude: 0.4, phase: 0.5, enabled: true },
];

function App() {
  const [components, setComponents] = useState<SineComponent[]>(DEFAULT_COMPONENTS);

  return (
    <div className="min-h-screen bg-[#0f1729]">
      {/* Hero */}
      <header className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-400/3 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-20">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs tracking-widest uppercase text-cyan-400/70 font-medium">
              BT3017 Interactive Explainer
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl text-white leading-[1.1] mb-6">
            Fourier Transform,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-400">
              Demystified
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-8">
            The Discrete Fourier Transform is <em>not</em> new to you. The core
            operation is a dot product — the same one you used in PCA to project
            data onto eigenvectors. The DFT just swaps eigenvectors for sine and
            cosine waves, and now you're reading <em>frequency content</em>{" "}
            instead of finding directions of maximum variance.
          </p>

          <p className="text-slate-500 text-base max-w-2xl leading-relaxed">
            Recall from BT3017: any set of orthogonal basis vectors lets you
            decompose and reconstruct data. For audio signals, the natural basis
            is sinusoids — they tell you which frequencies are present and how
            strong each one is. This guide builds that intuition step by step.
          </p>

          <div className="mt-6">
            <NarrateButton
              text="Fourier Transform, Demystified. The Discrete Fourier Transform is not new to you. The core operation is a dot product — the same one you used in P.C.A. to project data onto eigen-vectors. The D.F.T. just swaps eigen-vectors for sine and cosine waves, and now you're reading frequency content instead of finding directions of maximum variance. Recall from B.T. three oh one seven: any set of orthogonal basis vectors lets you decompose and reconstruct data. For audio signals, the natural basis is sighnewsoids — they tell you which frequencies are present and how strong each one is. This guide builds that intuition step by step."
              label="Listen to introduction"
            />
          </div>

          {/* Nav hints */}
          <nav className="flex flex-wrap gap-3 mt-12">
            {[
              { href: "#signal-builder", label: "Signal Builder" },
              { href: "#dot-product", label: "Dot Products" },
              { href: "#spectrum", label: "Spectrum" },
              { href: "#reconstruction", label: "Reconstruction" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-lg bg-navy-800/50 border border-slate-700/40 text-slate-400 text-sm hover:border-cyan-400/30 hover:text-cyan-400 transition-all"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      </div>

      {/* Sections */}
      <SignalBuilder components={components} onChange={setComponents} />

      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      </div>

      <DotProductWalkthrough components={components} />

      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      </div>

      <FrequencySpectrum components={components} />

      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      </div>

      <Reconstruction components={components} />

      {/* Footer */}
      <footer className="py-12 px-6 text-center">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent max-w-5xl mx-auto mb-8" />
        <p className="text-slate-600 text-sm">
          Built for BT3017 Feature Engineering for Machine Learning, NUS
        </p>
      </footer>
    </div>
  );
}

export default App;
