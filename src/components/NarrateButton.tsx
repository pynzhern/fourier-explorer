import { useState, useEffect, useCallback, useRef } from "react"

interface NarrateButtonProps {
  text: string
  label?: string
}

let activeUtterance: SpeechSynthesisUtterance | null = null

export default function NarrateButton({ text, label = "Listen" }: NarrateButtonProps) {
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    activeUtterance = null
    setSpeaking(false)
  }, [])

  const speak = useCallback(() => {
    // Stop any currently playing narration (global)
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1

    // Prefer a British English voice
    const voices = window.speechSynthesis.getVoices()
    const british = voices.find((v) => v.lang === "en-GB")
    if (british) utterance.voice = british

    utterance.onend = () => {
      activeUtterance = null
      setSpeaking(false)
    }
    utterance.onerror = () => {
      activeUtterance = null
      setSpeaking(false)
    }

    utteranceRef.current = utterance
    activeUtterance = utterance
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }, [text])

  const toggle = useCallback(() => {
    if (speaking) {
      stop()
    } else {
      speak()
    }
  }, [speaking, stop, speak])

  // Stop on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current === activeUtterance) {
        window.speechSynthesis.cancel()
        activeUtterance = null
      }
    }
  }, [])

  // If another button starts playing, this one should reflect that
  useEffect(() => {
    const interval = setInterval(() => {
      if (utteranceRef.current !== activeUtterance && speaking) {
        setSpeaking(false)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [speaking])

  return (
    <button
      onClick={toggle}
      aria-label={speaking ? "Stop narration" : label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
        speaking
          ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
          : "bg-slate-800/60 text-slate-500 border border-slate-700/40 hover:text-slate-300 hover:border-slate-600/60"
      }`}
    >
      {speaking ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="animate-pulse">
          <rect x="1" y="1" width="4" height="10" rx="1" fill="currentColor" />
          <rect x="7" y="1" width="4" height="10" rx="1" fill="currentColor" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 3.5V8.5L3.5 8.5L6.5 11V1L3.5 3.5H1Z" fill="currentColor" />
          <path d="M8 4C8.7 4.5 9 5.2 9 6C9 6.8 8.7 7.5 8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M9.5 2.5C10.8 3.5 11.5 4.7 11.5 6C11.5 7.3 10.8 8.5 9.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}
      {speaking ? "Stop" : label}
    </button>
  )
}
