import React from "react";
import { CandidateSpan } from "../lib/types";
import { BarChart3, TrendingUp } from "lucide-react";

interface LossShiftChartProps {
  candidateSpans: CandidateSpan[];
  aggregationMethod: "topk_mean" | "robust_z";
  anomalyScore: number;
}

export const LossShiftChart: React.FC<LossShiftChartProps> = ({
  candidateSpans,
  aggregationMethod,
  anomalyScore,
}) => {
  // Sort candidate spans by shift descending to find top 3
  const sorted = [...candidateSpans].sort((a, b) => b.loss_difference - a.loss_difference);
  const top3Set = new Set(sorted.slice(0, 3).map((s) => `${s.start_token}-${s.end_token}`));

  // Display top 15 spans or all if small
  const displaySpans = candidateSpans.slice(0, 24);
  const maxShift = Math.max(0.1, ...candidateSpans.map((s) => s.loss_difference));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">
              Candidate Masked-Span Loss Differences (d_i = L0 - L_i)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluates {candidateSpans.length} masked variations across multi-scale windows (w=1, w=3).
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">
            {aggregationMethod === "topk_mean" ? "Top-3 Mean Score:" : "Robust-Z Score:"}
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
            {anomalyScore.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="space-y-2 pt-1 max-h-[360px] overflow-y-auto pr-1 font-mono text-xs">
        {displaySpans.map((span, idx) => {
          const isTop3 = top3Set.has(`${span.start_token}-${span.end_token}`);
          const barWidth = Math.max(2, Math.min(100, (span.loss_difference / maxShift) * 100));

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border transition-all ${
                isTop3
                  ? "bg-rose-950/30 border-rose-500/40 shadow-sm"
                  : "bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-[70%]">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      span.window_size === 1
                        ? "bg-blue-950 text-blue-400 border border-blue-800"
                        : "bg-purple-950 text-purple-400 border border-purple-800"
                    }`}
                  >
                    w={span.window_size}
                  </span>
                  <span className="font-semibold text-slate-200 truncate">
                    &quot;{span.span_text}&quot;
                  </span>
                  {isTop3 && (
                    <span className="px-1.5 py-0.2 text-[9px] rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      Top-3
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <span className="text-[11px] text-slate-400">L_i: {span.loss_with_mask.toFixed(3)}</span>
                  <span
                    className={`font-bold ${
                      span.loss_difference > 0 ? "text-rose-400" : "text-slate-400"
                    }`}
                  >
                    +{span.loss_difference.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isTop3 ? "bg-rose-500" : "bg-emerald-500/60"
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {candidateSpans.length > displaySpans.length && (
        <div className="text-center text-[11px] text-slate-400 pt-1">
          Showing top {displaySpans.length} of {candidateSpans.length} candidate spans evaluated.
        </div>
      )}
    </div>
  );
};
