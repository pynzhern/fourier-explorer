import katex from "katex";
import "katex/dist/katex.min.css";

interface MathProps {
  tex: string;
  display?: boolean;
  className?: string;
}

export default function Math({ tex, display = false, className = "" }: MathProps) {
  const html = katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
  });
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
