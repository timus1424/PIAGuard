import React from "react";
import { Clock, Cpu, Zap } from "lucide-react";
import { TABLE_4_LATENCY } from "../lib/constants";

interface LatencyBreakdownProps {
  currentLatencies?: {
    l1: number;
    l2: number;
    l3: number;
    l4: number;
    total: number;
  };
}

export const LatencyBreakdown: React.FC<LatencyBreakdownProps> = ({ currentLatencies }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-slate-100">
              Pipeline Latency & Cost Distribution
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical runtime profile measured on CPU (Table 4, Presenter Brief §8.4).
          </p>
        </div>

        {currentLatencies && (
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-400">Current Run:</span>
            <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
              {currentLatencies.total.toFixed(1)} ms
            </span>
          </div>
        )}
      </div>

      {/* Visual Stacked Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1.5">
          <span>Cost Allocation Across Layers</span>
          <span className="text-emerald-400 font-bold">L1: 0.02% | L2: 99.98%</span>
        </div>
        <div className="h-4 w-full bg-slate-950 rounded-full flex overflow-hidden p-0.5 border border-slate-800">
          <div
            className="bg-emerald-500 h-full rounded-l-full"
            style={{ width: "3%" }}
            title="L1 Sanitizer (~1.5 ms)"
          />
          <div
            className="bg-blue-600 h-full rounded-r-full"
            style={{ width: "97%" }}
            title="L2 Loss-Shift (~6,231 ms)"
          />
        </div>
      </div>

      {/* Latency Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono text-left">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase">
              <th className="pb-2 font-semibold">Defense Layer</th>
              <th className="pb-2 font-semibold">Mean (ms)</th>
              <th className="pb-2 font-semibold">Median (ms)</th>
              <th className="pb-2 font-semibold">p95 (ms)</th>
              <th className="pb-2 font-semibold text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {TABLE_4_LATENCY.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/30">
                <td className="py-2.5 font-semibold text-slate-100 flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      row.stage.includes("L1")
                        ? "bg-emerald-400"
                        : row.stage.includes("L2")
                        ? "bg-blue-400"
                        : row.stage.includes("L3")
                        ? "bg-amber-400"
                        : "bg-slate-400"
                    }`}
                  />
                  <span>{row.stage}</span>
                </td>
                <td className="py-2.5 text-slate-300">{row.mean_ms.toFixed(2)}</td>
                <td className="py-2.5 text-slate-300">{row.median_ms.toFixed(2)}</td>
                <td className="py-2.5 text-slate-400">{row.p95_ms.toFixed(2)}</td>
                <td className="py-2.5 font-bold text-right text-emerald-400">
                  {row.share_pct < 0.01 ? "<0.01%" : `${row.share_pct}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Engineering Trade-Off Insight */}
      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          <span>The Measured Engineering Trade-Off (Presenter Brief §8.4)</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          <strong>Layer 2 costs ~4,200× Layer 1 and buys +0.079 AUROC.</strong> This is not an
          embarrassment—it is a central architectural justification. In production deployment,
          PIAGuard gates the expensive behavioral layer behind the cheap rule layer, only invoking L2
          when rule evidence is ambiguous or low-confidence.
        </p>
      </div>
    </div>
  );
};
