import React, { useState } from "react";
import { DetectorResult } from "../lib/types";
import { AlertCircle, Eye, Sparkles } from "lucide-react";

interface TokenHeatmapProps {
  detector: DetectorResult;
}

export const TokenHeatmap: React.FC<TokenHeatmapProps> = ({ detector }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { tokens, candidate_spans, baseline_loss, suspicious_span, suspicious_start_token, suspicious_end_token } = detector;

  // Build a token-level shift weight map
  const tokenMaxShift: number[] = new Array(tokens.length).fill(0);
  const tokenSpans: string[] = new Array(tokens.length).fill("");

  for (const span of candidate_spans) {
    for (let t = span.start_token; t < span.end_token && t < tokens.length; t++) {
      if (span.loss_difference > tokenMaxShift[t]) {
        tokenMaxShift[t] = span.loss_difference;
        tokenSpans[t] = span.span_text;
      }
    }
  }

  const maxOverallShift = Math.max(0.01, ...tokenMaxShift);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base text-slate-100">
              L2 Behavioral Perturbation Heatmap
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Color intensity represents the drop in model surprise (L0 - Li) when the span is masked.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Baseline Loss L0:</span>
          <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 font-bold border border-slate-800">
            {baseline_loss}
          </span>
        </div>
      </div>

      {/* Heatmap Token Container */}
      <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800/80 min-h-[120px] flex flex-wrap gap-2 items-center leading-relaxed">
        {tokens.map((token, index) => {
          const shift = tokenMaxShift[index] || 0;
          const ratio = Math.max(0, Math.min(1, shift / maxOverallShift));

          const isSuspicious =
            suspicious_start_token !== null &&
            suspicious_end_token !== null &&
            index >= suspicious_start_token &&
            index < suspicious_end_token;

          // Compute color intensity
          let bgStyle = "rgba(30, 41, 59, 0.4)";
          let textStyle = "text-slate-300";
          let borderStyle = "border-slate-800";

          if (shift > 0.05) {
            // Gradient from subtle blue to bright orange/red
            if (ratio > 0.7) {
              bgStyle = `rgba(244, 63, 94, ${0.2 + ratio * 0.4})`;
              textStyle = "text-rose-200 font-bold";
              borderStyle = "border-rose-500/50";
            } else if (ratio > 0.3) {
              bgStyle = `rgba(245, 158, 11, ${0.2 + ratio * 0.3})`;
              textStyle = "text-amber-200 font-medium";
              borderStyle = "border-amber-500/40";
            } else {
              bgStyle = `rgba(59, 130, 246, ${0.15 + ratio * 0.2})`;
              textStyle = "text-blue-200";
              borderStyle = "border-blue-500/30";
            }
          }

          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative px-2.5 py-1 rounded-md text-xs font-mono border transition-all cursor-pointer select-none ${textStyle} ${borderStyle} ${
                isSuspicious ? "ring-2 ring-rose-500 shadow-md shadow-rose-500/20" : ""
              }`}
              style={{ backgroundColor: bgStyle }}
            >
              <span>{token}</span>

              {isSuspicious && (
                <span className="absolute -top-2 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}

              {/* Hover Tooltip */}
              {hoveredIndex === index && (
                <div className="absolute z-20 bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-100 shadow-xl whitespace-nowrap pointer-events-none">
                  <div className="font-semibold text-slate-200">Token #{index + 1}: &quot;{token}&quot;</div>
                  <div className="text-emerald-400 font-mono">Max Loss Shift: +{shift.toFixed(4)}</div>
                  {isSuspicious && <div className="text-rose-400 font-bold">★ Highest Anomaly Span</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Suspicious Span Callout */}
      {suspicious_span && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-xl text-xs gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-slate-300">
              Highest Behavioral Shift Span (argmax d_i):
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-300 font-mono font-bold border border-rose-700/40">
              &quot;{suspicious_span}&quot;
            </span>
          </div>

          <div className="text-rose-400 font-mono text-[11px]">
            Tokens [{suspicious_start_token}..{suspicious_end_token}]
          </div>
        </div>
      )}

      {/* Research Caveat Callout - Mandated by prompt and paper */}
      <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-start space-x-2.5 text-xs text-amber-200/90 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 font-semibold">
            Important Research Caveat:
          </strong>{" "}
          A high loss shift does <em>not</em> prove that the selected span is the malicious trigger.
          It indicates localized model sensitivity and structural dependence. As documented in the
          paper (§6 worked example), fixing scoring improves alarm reliability, but exact trigger
          span localization remains future work.
        </div>
      </div>
    </div>
  );
};
