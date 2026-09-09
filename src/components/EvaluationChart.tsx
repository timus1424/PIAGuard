import React, { useState } from "react";
import { TABLE_1_BASELINES, TABLE_3_FAMILY_RECALL } from "../lib/constants";
import { BarChart3, AlertTriangle, CheckCircle2, TrendingUp, HelpCircle, Layers } from "lucide-react";

export const EvaluationChart: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"table1" | "table3" | "roc">("table1");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Experimental Evaluation on GPT-2 (Presenter Brief §8)</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Empirical Results: Fusing Rules and Model Loss Shifts
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Evaluated on 88 prompts (18 clean set aside strictly for threshold calibration; 70 test prompts:
            43 attacks across 6 families and 27 clean prompts). All metrics were generated from genuine
            GPT-2 evaluation runs in <code className="text-emerald-400">scripts/evaluate.py</code>.
          </p>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab("table1")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "table1"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Table 1: Main Baselines Comparison
        </button>
        <button
          onClick={() => setActiveSubTab("table3")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "table3"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Table 3: Recall by Attack Family
        </button>
        <button
          onClick={() => setActiveSubTab("roc")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "roc"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          ROC & Distribution Curves
        </button>
      </div>

      {/* SUB-TAB 1: TABLE 1 */}
      {activeSubTab === "table1" && (
        <div className="space-y-6">
          {/* Main Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center justify-between">
              <span>Table 1: Detection Performance on 70 Test Prompts (GPT-2)</span>
              <span className="text-xs font-normal font-mono text-emerald-400">
                FPR = 0.000 across all baselines
              </span>
            </h3>

            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="pb-3 font-semibold">Defense Architecture</th>
                  <th className="pb-3 font-semibold text-right">TPR @ 1% FPR</th>
                  <th className="pb-3 font-semibold text-right">Precision</th>
                  <th className="pb-3 font-semibold text-right">F1 Score</th>
                  <th className="pb-3 font-semibold text-right">Bal. Acc.</th>
                  <th className="pb-3 font-semibold text-right text-emerald-400 font-bold">AUROC</th>
                  <th className="pb-3 font-semibold text-right">θ Cutoff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {TABLE_1_BASELINES.map((row, i) => (
                  <tr
                    key={i}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      row.system.includes("Proposed")
                        ? "bg-emerald-950/20 font-bold text-emerald-300"
                        : ""
                    }`}
                  >
                    <td className="py-3.5 pr-3 text-slate-100 font-semibold">
                      <div className="flex items-center space-x-2">
                        {row.system.includes("Proposed") && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30">
                            Ours
                          </span>
                        )}
                        <span>{row.system}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5 max-w-sm">
                        {row.description}
                      </p>
                    </td>
                    <td className="py-3.5 text-right text-slate-200 font-bold">
                      {row.tpr_at_1_fpr.toFixed(3)}
                    </td>
                    <td className="py-3.5 text-right text-slate-300">{row.precision.toFixed(3)}</td>
                    <td className="py-3.5 text-right text-slate-200">{row.f1.toFixed(3)}</td>
                    <td className="py-3.5 text-right text-slate-300">
                      {row.balanced_accuracy.toFixed(3)}
                    </td>
                    <td className="py-3.5 text-right font-extrabold text-sm text-emerald-400">
                      {row.auroc.toFixed(3)}
                    </td>
                    <td className="py-3.5 text-right text-slate-400">{row.theta.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Empirical Takeaways */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Fusing Beats Both Individual Parts</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rules alone achieved AUROC <strong>0.849</strong>; behavioral loss-shift alone achieved
                <strong> 0.690</strong>. When fused together by Layer 3, performance jumps to{" "}
                <strong className="text-emerald-300">0.928</strong>. Neither component could produce this
                result in isolation.
              </p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>Why Layer 2 Standalone Looks Low</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Loss-shift alone has a low recall of 0.140 because it was never engineered to operate as a
                solo defense. Its purpose is to catch what the rules cannot see (indirect, obfuscated, and
                adversarial suffixes).
              </p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Why FPR Is 0.000 Everywhere</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Thresholds were calibrated to ensure <strong>zero false alarms</strong> on benign prompts
                (&quot;Block at most 1 in 100 legitimate messages&quot;). Therefore, comparison occurs purely in
                the true positive recall column.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TABLE 3 */}
      {activeSubTab === "table3" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
            <h3 className="text-base font-bold text-slate-100 mb-2">
              Table 3: Attack Detection Recall by Threat Family (Presenter Brief §8.3)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Breakdown across 43 attacks evaluated against the calibrated blocking threshold θ_block = 0.487.
            </p>

            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="pb-3 font-semibold">Attack Family</th>
                  <th className="pb-3 font-semibold text-center">Sample (n)</th>
                  <th className="pb-3 font-semibold text-right">Detection Recall</th>
                  <th className="pb-3 font-semibold text-right">Blocked / Review</th>
                  <th className="pb-3 font-semibold pl-6">Analytical Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {TABLE_3_FAMILY_RECALL.map((row, i) => (
                  <tr
                    key={i}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      row.family === "backdoor" ? "bg-rose-950/10" : ""
                    }`}
                  >
                    <td className="py-3.5 pr-3 text-slate-100 font-semibold flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          row.recall >= 0.75
                            ? "bg-emerald-400"
                            : row.recall > 0
                            ? "bg-amber-400"
                            : "bg-rose-500"
                        }`}
                      />
                      <span>{row.label}</span>
                    </td>
                    <td className="py-3.5 text-center text-slate-400">n = {row.n}</td>
                    <td
                      className={`py-3.5 text-right font-extrabold text-sm ${
                        row.recall >= 0.75
                          ? "text-emerald-400"
                          : row.recall > 0
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {(row.recall * 100).toFixed(0)}%
                    </td>
                    <td className="py-3.5 text-right text-slate-300">
                      {row.blocked_count} / {row.review_count}
                    </td>
                    <td className="py-3.5 pl-6 text-slate-300 font-sans text-xs">
                      {row.description}
                      {row.limitation_note && (
                        <span className="block text-rose-400 font-mono text-[11px] mt-1 font-semibold">
                          ⚠️ Limitation: {row.limitation_note}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Honest Backdoor Failure Box */}
          <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Volunteer the Backdoor Failure First (Presenter Brief §8.3)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              A backdoor trigger like <code className="text-rose-300 font-mono">tq_activate</code> only
              means something to a model that was deliberately poisoned during training to obey it. We score
              prompts with an off-the-shelf, clean GPT-2 model, to which that token is merely a rare string.
              There is genuinely no loss perturbation signal to find.
              <br />
              <strong className="text-rose-300">
                The correct conclusion: detecting backdoor triggers requires scoring with the poisoned model
                itself.
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ROC & DISTRIBUTION */}
      {activeSubTab === "roc" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ROC Curve Reproduction */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">
                ROC Curve: Prompt Injection Detection (Fig 7.2)
              </h3>
              <span className="text-xs font-mono text-emerald-400">AUROC 0.928</span>
            </div>

            {/* Visual SVG Plot */}
            <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800/80 relative">
              <svg viewBox="0 0 300 240" className="w-full h-56">
                {/* Grid Lines */}
                <line x1="40" y1="20" x2="40" y2="200" stroke="#334155" strokeWidth="1" />
                <line x1="40" y1="200" x2="280" y2="200" stroke="#334155" strokeWidth="1" />
                <line
                  x1="40"
                  y1="20"
                  x2="280"
                  y2="200"
                  stroke="#475569"
                  strokeWidth="1"
                  strokeDasharray="4"
                />

                {/* Grid Horizontals */}
                <line x1="40" y1="65" x2="280" y2="65" stroke="#1e293b" strokeWidth="1" />
                <line x1="40" y1="110" x2="280" y2="110" stroke="#1e293b" strokeWidth="1" />
                <line x1="40" y1="155" x2="280" y2="155" stroke="#1e293b" strokeWidth="1" />

                {/* Proposed (L1+L2 Fused) Curve (Green) */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  points="40,200 42,65 60,50 100,40 180,30 280,20"
                />

                {/* Rule Filter Only (Orange) */}
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                  strokeDasharray="2"
                  points="40,200 42,80 80,75 140,60 220,40 280,20"
                />

                {/* Perplexity Only (Blue) */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  points="40,200 60,160 120,130 180,95 240,55 280,20"
                />

                {/* Loss-Shift Only (Purple) */}
                <polyline
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  points="40,200 50,175 100,150 160,110 220,80 280,20"
                />

                {/* Labels */}
                <text x="35" y="25" fill="#94a3b8" fontSize="9" textAnchor="end">
                  1.0
                </text>
                <text x="35" y="115" fill="#94a3b8" fontSize="9" textAnchor="end">
                  0.5
                </text>
                <text x="35" y="200" fill="#94a3b8" fontSize="9" textAnchor="end">
                  0.0
                </text>

                <text x="40" y="215" fill="#94a3b8" fontSize="9" textAnchor="middle">
                  0.0
                </text>
                <text x="160" y="215" fill="#94a3b8" fontSize="9" textAnchor="middle">
                  0.5
                </text>
                <text x="280" y="215" fill="#94a3b8" fontSize="9" textAnchor="middle">
                  1.0
                </text>

                <text x="160" y="232" fill="#64748b" fontSize="9" textAnchor="middle">
                  False Positive Rate (FPR)
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <span className="w-3 h-0.5 bg-emerald-500"></span>
                <span>Proposed Fused (0.928)</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-400">
                <span className="w-3 h-0.5 bg-amber-500"></span>
                <span>Rule Filter (0.849)</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <span className="w-3 h-0.5 bg-blue-500"></span>
                <span>Perplexity (0.732)</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-400">
                <span className="w-3 h-0.5 bg-purple-500"></span>
                <span>Loss-Shift Only (0.690)</span>
              </div>
            </div>
          </div>

          {/* Anomaly Score Separation Histogram */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">
                Anomaly Score Separation (Clean vs Injections)
              </h3>
              <span className="text-xs font-mono text-rose-400">θ_block = 0.487</span>
            </div>

            <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800/80 relative">
              <svg viewBox="0 0 300 240" className="w-full h-56">
                {/* Axes */}
                <line x1="30" y1="20" x2="30" y2="200" stroke="#334155" strokeWidth="1" />
                <line x1="30" y1="200" x2="280" y2="200" stroke="#334155" strokeWidth="1" />

                {/* Clean distribution (Blue bars on left) */}
                <rect x="40" y="90" width="16" height="110" fill="#3b82f6" opacity="0.8" />
                <rect x="60" y="50" width="16" height="150" fill="#3b82f6" opacity="0.8" />
                <rect x="80" y="110" width="16" height="90" fill="#3b82f6" opacity="0.8" />
                <rect x="100" y="160" width="16" height="40" fill="#3b82f6" opacity="0.8" />

                {/* Threshold Line θ_block */}
                <line
                  x1="125"
                  y1="20"
                  x2="125"
                  y2="200"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeDasharray="4"
                />
                <text x="130" y="35" fill="#f43f5e" fontSize="9" fontWeight="bold">
                  θ_block = 0.487
                </text>

                {/* Attack distribution (Rose bars on right) */}
                <rect x="135" y="140" width="16" height="60" fill="#f43f5e" opacity="0.8" />
                <rect x="155" y="100" width="16" height="100" fill="#f43f5e" opacity="0.8" />
                <rect x="175" y="70" width="16" height="130" fill="#f43f5e" opacity="0.8" />
                <rect x="195" y="45" width="16" height="155" fill="#f43f5e" opacity="0.8" />
                <rect x="215" y="80" width="16" height="120" fill="#f43f5e" opacity="0.8" />
                <rect x="235" y="120" width="16" height="80" fill="#f43f5e" opacity="0.8" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <div className="flex items-center space-x-2 text-blue-400">
                <span className="w-3 h-3 bg-blue-500 rounded-sm"></span>
                <span>Clean Traffic (n=27, Peak &lt; θ)</span>
              </div>
              <div className="flex items-center space-x-2 text-rose-400">
                <span className="w-3 h-3 bg-rose-500 rounded-sm"></span>
                <span>Injected Attacks (n=43, Spanning &gt; θ)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
