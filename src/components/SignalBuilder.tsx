import { useMemo } from "react";
import SectionWrapper from "./SectionWrapper";
import WaveformCanvas from "./WaveformCanvas";
import type { SineComponent } from "../utils/dft";
import { generateSignal } from "../utils/dft";

const N = 512;

const COMPONENT_COLORS = [
  "#22d3ee", "#fbbf24", "#a78bfa", "#34d399", "#f472b6",
];

interface SignalBuilderProps {
  components: SineComponent[];
  onChange: (components: SineComponent[]) => void;
}

export default function SignalBuilder({ components, onChange }: SignalBuilderProps) {
  const componentSignals = useMemo(
    () =>
      components.map((comp) =>
        comp.enabled ? generateSignal([comp], N) : new Array(N).fill(0),
      ),
    [components],
  );

  const compositeSignal = useMemo(
    () => generateSignal(components, N),
    [components],
  );

  const updateComponent = (index: number, updates: Partial<SineComponent>) => {
    const next = components.map((c, i) =>
      i === index ? { ...c, ...updates } : c,
    );
    onChange(next);
  };

  const addComponent = () => {
    if (components.length >= 5) return;
    onChange([
      ...components,
      { frequency: components.length + 1, amplitude: 0.5, phase: 0, enabled: true },
    ]);
  };

  const removeComponent = (index: number) => {
    if (components.length <= 1) return;
    onChange(components.filter((_, i) => i !== index));
  };

  return (
    <SectionWrapper
      id="signal-builder"
      number="Part One"
      title="Any signal is a sum of sinusoids"
      subtitle="Think of a chord on a piano. You hear one sound, but multiple notes are ringing simultaneously. Every signal, no matter how jagged or complex, is just a collection of sine waves added together, each with its own frequency, amplitude, and phase. Build one yourself: drag the sliders and watch the composite signal change."
      narration="Part one: any signal is a sum of sighnewsoids. Think of a chord on a piano. You hear one sound, but multiple notes are ringing simultaneously. Every signal, no matter how jagged or complex, is just a collection of sine waves added together, each with its own frequency, amplitude, and phase. Use the sliders to build your own signal from scratch. Each component is a single sine wave with a frequency, amplitude, and phase. The composite signal at the bottom is the sum of all the components. This is what a microphone captures — one messy waveform. The individual frequencies are buried inside, and the D.F.T.'s entire job is to pull them back out."
    >
      <div className="space-y-2">
        {/* Component waves */}
        <div className="grid gap-1.5">
          {components.map((comp, i) => (
            <div
              key={i}
              className={`rounded-lg border transition-all duration-200 ${
                comp.enabled
                  ? "bg-navy-800/50 border-slate-700/50"
                  : "bg-navy-900/30 border-slate-800/30 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3 px-3 py-1.5">
                {/* Controls */}
                <div className="flex-shrink-0 w-60 space-y-1">
                  {/* Header row: colour dot, label, on/off, remove */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: COMPONENT_COLORS[i % COMPONENT_COLORS.length] }}
                      />
                      <span className="text-xs font-medium text-white leading-none">
                        Component {i + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateComponent(i, { enabled: !comp.enabled })}
                        className={`text-xs px-1.5 py-0.5 rounded leading-none transition-colors ${
                          comp.enabled
                            ? "bg-cyan-400/20 text-cyan-400"
                            : "bg-slate-700/50 text-slate-500"
                        }`}
                      >
                        {comp.enabled ? "ON" : "OFF"}
                      </button>
                      {components.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeComponent(i)}
                          className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400/70 hover:text-red-400 transition-colors leading-none"
                          aria-label={`Remove component ${i + 1}`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slider rows */}
                  <label className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-10 flex-shrink-0">Freq</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={comp.frequency}
                      onChange={(e) =>
                        updateComponent(i, { frequency: +e.target.value })
                      }
                      className="flex-1 h-1 accent-cyan-400"
                    />
                    <span className="w-6 text-right text-slate-300 tabular-nums">
                      {comp.frequency}
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-10 flex-shrink-0">Amp</span>
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.05}
                      value={comp.amplitude}
                      onChange={(e) =>
                        updateComponent(i, { amplitude: +e.target.value })
                      }
                      className="flex-1 h-1 accent-cyan-400"
                    />
                    <span className="w-6 text-right text-slate-300 tabular-nums">
                      {comp.amplitude.toFixed(1)}
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-10 flex-shrink-0">Phase</span>
                    <input
                      type="range"
                      min={0}
                      max={6.28}
                      step={0.05}
                      value={comp.phase}
                      onChange={(e) =>
                        updateComponent(i, { phase: +e.target.value })
                      }
                      className="flex-1 h-1 accent-cyan-400"
                    />
                    <span className="w-6 text-right text-slate-300 tabular-nums">
                      {comp.phase.toFixed(1)}
                    </span>
                  </label>
                </div>

                {/* Waveform preview */}
                <div className="flex-1 min-w-0">
                  <WaveformCanvas
                    signals={[
                      {
                        data: componentSignals[i],
                        colour: comp.enabled
                          ? COMPONENT_COLORS[i % COMPONENT_COLORS.length]
                          : "#475569",
                        lineWidth: 1.5,
                      },
                    ]}
                    height={60}
                    yRange={[-1.2, 1.2]}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add component button */}
        {components.length < 5 && (
          <button
            type="button"
            onClick={addComponent}
            className="w-full py-1.5 rounded-lg border border-dashed border-slate-600/50 text-slate-500 text-xs hover:border-cyan-400/30 hover:text-cyan-400/70 transition-colors"
          >
            + Add component
          </button>
        )}

        {/* Composite signal */}
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
            <span className="text-xs text-slate-400 font-medium px-2">
              = Composite Signal (sum of all components)
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
          </div>
          <div className="rounded-xl bg-navy-800/50 border border-slate-700/50 px-3 py-2">
            <WaveformCanvas
              signals={[
                {
                  data: compositeSignal,
                  colour: "#ffffff",
                  lineWidth: 2,
                },
              ]}
              height={120}
              showGrid
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5 text-center">
            This is what a microphone captures: one messy waveform. The individual frequencies are buried inside, and the DFT's entire job is to pull them back out.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
