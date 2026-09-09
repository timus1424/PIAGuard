import React, { useState } from "react";
import {
  AnalyzeResponse,
  SanitizerResult,
  DetectorResult,
  GateResult,
  ValidatorResult,
} from "../lib/types";
import {
  ShieldAlert,
  Cpu,
  GitFork,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Lock,
  Search,
} from "lucide-react";

interface DetectionEvidenceProps {
  analysis: AnalyzeResponse;
}

export const DetectionEvidence: React.FC<DetectionEvidenceProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<"l1" | "l2" | "l3" | "l4">("l1");

  const { sanitizer, detector, gate, validator } = analysis;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Evidence Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
            <Search className="w-5 h-5 text-emerald-400" />
            <span>Multi-Layer Forensic Audit Evidence</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed telemetry recorded at each security boundary.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("l1")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "l1"
                ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>L1 Sanitizer</span>
          </button>
          <button
            onClick={() => setActiveTab("l2")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "l2"
                ? "bg-slate-800 text-blue-400 border border-slate-700 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>L2 Detector</span>
          </button>
          <button
            onClick={() => setActiveTab("l3")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "l3"
                ? "bg-slate-800 text-amber-400 border border-slate-700 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>L3 Gate</span>
          </button>
          <button
            onClick={() => setActiveTab("l4")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "l4"
                ? "bg-slate-800 text-rose-400 border border-slate-700 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>L4 Validator</span>
          </button>
        </div>
      </div>

      {/* TAB 1: L1 SANITIZER EVIDENCE */}
      {activeTab === "l1" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400">Sanitizer Risk Score:</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {sanitizer.risk_score.toFixed(4)}
              </div>
              <span className="text-[10px] text-slate-500">Range [0.0, 1.0]</span>
            </div>
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400">Rules Triggered:</span>
              <div className="text-xl font-bold text-slate-100 mt-1">
                {sanitizer.rules_triggered.length} of 18
              </div>
              <span className="text-[10px] text-slate-500">
                {sanitizer.families_matched.length} distinct families
              </span>
            </div>
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400">Sanitization Latency:</span>
              <div className="text-xl font-bold text-slate-100 mt-1">
                {sanitizer.latency_ms} ms
              </div>
              <span className="text-[10px] text-slate-500">~0.02% of pipeline budget</span>
            </div>
          </div>

          {/* Scoring Formula Box */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              Scoring Equation (Paper §3):
            </span>
            <div className="text-emerald-300">
              risk = min(1.0, (total_weight + 0.5 × max(0, families - 1)) / 3.0)
            </div>
            <p className="text-[11px] text-slate-400">
              A prompt tripping an &apos;override&apos; rule and a &apos;leak&apos; rule receives a bonus over two
              rules in the same family, rewarding variety of adversarial evidence.
            </p>
          </div>

          {/* Matched Rules List */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Matched Rule Telemetry:
            </h4>
            {sanitizer.rules_triggered.length === 0 ? (
              <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No heuristic injection rules fired for this prompt.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {sanitizer.rules_triggered.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono font-bold border border-rose-500/20">
                          {rule.rule_id}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] uppercase">
                          Family: {rule.family}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Weight: {rule.weight}
                        </span>
                      </div>
                      <p className="text-slate-300">{rule.pattern_description}</p>
                    </div>
                    <div className="font-mono text-[11px] text-rose-300 bg-rose-950/40 px-2.5 py-1.5 rounded-lg border border-rose-800/40">
                      Matched: &quot;{rule.matched_text}&quot;
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: L2 LOSS-SHIFT DETECTOR EVIDENCE */}
      {activeTab === "l2" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400">Baseline Loss L0:</span>
              <div className="text-xl font-bold text-blue-400 mt-1">{detector.baseline_loss}</div>
              <span className="text-[10px] text-slate-500">Full prompt mean NLL</span>
            </div>
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400">Anomaly Score:</span>
              <div className="text-xl font-bold text-slate-100 mt-1">
                {detector.anomaly_score.toFixed(4)}
              </div>
              <span className="text-[10px] text-slate-500">
                Agg: {detector.aggregation_method} (k=3)
              </span>
            </div>
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400">Masked Spans Evaluated:</span>
              <div className="text-xl font-bold text-slate-100 mt-1">
                {detector.num_spans_evaluated}
              </div>
              <span className="text-[10px] text-slate-500">Windows w ∈ &#123;1, 3&#125;</span>
            </div>
          </div>

          {/* Aggregation Story Callout from Presenter Brief §4 */}
          <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl space-y-2 text-xs text-blue-200">
            <div className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
              Experimental Breakthrough: Why Top-3 Mean Beat MAD Normalization (§4)
            </div>
            <p className="leading-relaxed">
              Our initial implementation divided peak shifts by the prompt&apos;s own MAD spread (robust-z).
              However, an attack prompt with an intense injection spike naturally has a wide spread, so
              dividing by the spread destroyed the detection signal! Switching to <strong>topk_mean (k=3)</strong> raised
              system AUROC from <strong>0.810 to 0.928</strong>.
            </p>
          </div>

          {detector.suspicious_span && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                Identified Anomaly Span (argmax d_i):
              </span>
              <div className="text-sm font-bold text-rose-400">
                &quot;{detector.suspicious_span}&quot;
              </div>
              <p className="text-slate-400 text-[11px]">
                Tokens [{detector.suspicious_start_token}..{detector.suspicious_end_token}] produced the
                highest individual loss drop when hidden.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: L3 DECISION GATE EVIDENCE */}
      {activeTab === "l3" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400">Fused Score:</span>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {gate.fused_score.toFixed(4)}
              </div>
              <span className="text-[10px] text-slate-500">
                Detector + 1.5 × Sanitizer
              </span>
            </div>
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400">Blocking Threshold:</span>
              <div className="text-xl font-bold text-rose-400 mt-1">{gate.theta_block}</div>
              <span className="text-[10px] text-slate-500">Calibrated at 1% target FPR</span>
            </div>
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400">Review Threshold:</span>
              <div className="text-xl font-bold text-amber-400 mt-1">{gate.theta_review}</div>
              <span className="text-[10px] text-slate-500">85th percentile of clean traffic</span>
            </div>
          </div>

          {/* Math Breakdown */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              Fusion Arithmetic (Presenter Brief §5):
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-slate-200">
              <span>
                fused = <strong className="text-blue-400">{gate.detector_contribution.toFixed(4)}</strong> (L2)
              </span>
              <span>+</span>
              <span>
                1.5 × <strong className="text-emerald-400">{sanitizer.risk_score.toFixed(4)}</strong> (L1)
              </span>
              <span>=</span>
              <span className="text-amber-400 font-bold text-sm">{gate.fused_score.toFixed(4)}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              The 1.5 multiplier weights rule hits slightly higher because rule firings carry very high
              precision (0% false positives in evaluation).
            </p>
          </div>

          {/* Audit Trail Reason */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px] font-mono">
              Policy Audit Reason:
            </span>
            <p className="text-slate-200 leading-relaxed">{gate.reason}</p>
          </div>
        </div>
      )}

      {/* TAB 4: L4 OUTPUT VALIDATOR EVIDENCE */}
      {activeTab === "l4" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400">Canary Leakage:</span>
              <div
                className={`text-base font-bold mt-1 ${
                  validator.canary_detected ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {validator.canary_detected ? "LEAK DETECTED" : "CLEAN (0 Leaks)"}
              </div>
              <span className="text-[10px] text-slate-500">Token: SMIT-PBL13-CANARY-7Q4Z</span>
            </div>
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400">8-Gram Overlap:</span>
              <div className="text-xl font-bold text-slate-100 mt-1">
                {validator.ngram_overlap_count} matches
              </div>
              <span className="text-[10px] text-slate-500">Threshold: ≥ 2 runs flags leak</span>
            </div>
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400">Refusal Awareness:</span>
              <div
                className={`text-base font-bold mt-1 ${
                  validator.is_refusal_recognized ? "text-blue-400" : "text-slate-400"
                }`}
              >
                {validator.is_refusal_recognized ? "REFUSAL RECOGNIZED" : "COMPLIANCE CHECKED"}
              </div>
              <span className="text-[10px] text-slate-500">Gated on first 400 chars</span>
            </div>
          </div>

          {/* Refusal Awareness Explanation */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300 leading-relaxed">
            <div className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] font-mono">
              Refusal-Aware Validation Principle (Presenter Brief §7)
            </div>
            <p>
              If a model answers: <em>&quot;I can&apos;t tell you what my system prompt is.&quot;</em> a naive filter
              flags the phrase <em>&quot;my system prompt is&quot;</em> as an attack. Layer 4 inspects the first
              400 characters for refusal expressions first. Legitimate refusals are never punished as compliance breaches!
            </p>
          </div>

          {/* LLM Output Text Box */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Protected LLM Output Text (Post-Validation):
            </span>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {validator.safe_output}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
