import type { ReactNode } from "react";
import NarrateButton from "./NarrateButton";

interface SectionWrapperProps {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  narration?: string;
  children: ReactNode;
}

export default function SectionWrapper({
  id,
  number,
  title,
  subtitle,
  narration,
  children,
}: SectionWrapperProps) {
  return (
    <section id={id} className="py-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <span className="text-cyan-400/70 font-body text-sm tracking-widest uppercase">
            {number}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-white mt-2 leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-slate-400 text-lg mt-3 max-w-2xl">
              {subtitle}
            </p>
          )}
          {narration && (
            <div className="mt-4">
              <NarrateButton text={narration} label="Listen to this section" />
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
