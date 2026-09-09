import React, { useState } from "react";
import {
  Sparkles,
  Cpu,
  GitFork,
  ShieldCheck,
  ChevronRight,
  Clock,
  Layers,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

interface LayerDetail {
  id: string;
  name: string;
  tag: string;
  cost: string;
  costMs: string;
  costShare: string;
  purpose: string;
  input: string;
  output: string;
  algorithm: string[];
  workedExample: {
    attack: string;
    clean: string;
  };
  limitations: string;
  color: string;
}

const LAYERS: LayerDetail[] = [
  {
    id: "l1",
    name: "Layer 1: Input Sanitizer",
    tag: "Cheap First-Level Filter",
    cost: "Very Low (~0.02% total time)",
    costMs: "~1.5 ms",
    costShare: "0.02%",
    purpose:
      "Normalizes text, neutralizes character-level evasion tricks, and scores matches against 18 hand-written rules across 6 threat families.",
    input: "Raw user input string or document text.",
    output:
      "Normalized prompt text, list of matched rules, and a normalized risk score r ∈ [0.0, 1.0].",
    algorithm: [
      "1. Strip zero-width & invisible Unicode (\\u200b, \\u200c, \\ufeff, bidi overrides).",
      "2. Homoglyph normalization (fold Cyrillic lookalikes like 'а', 'о', 'с' to ASCII).",
      "3. Inspect Base64, Hex, and Rot13 encoded payloads.",
      "4. Match 18 regex rules (override, leak, persona, separator, delimiter, encoding).",
      "5. Score risk: risk = min(1.0, (total_weight + 0.5 × (families - 1)) / 3.0).",
    ],
    workedExample: {
      attack: "R01 (override) + R04 (leak) → 2 weights, 2 families → risk: (2.0 + 0.5) / 3.0 = 0.833",
      clean: "0 rules matched → risk: 0.000",
    },
    limitations:
      "Keyword and rule filters have an empirical ceiling (AUROC 0.849). Novel paraphrasing or sophisticated obfuscation can easily evade them.",
    color: "emerald",
  },
  {
    id: "l2",
    name: "Layer 2: Loss-Shift Detector",
    tag: "Core Behavioral Anomaly Engine",
    cost: "Computationally Expensive (~99.98% total time)",
    costMs: "~6,231 ms (~6.2 s)",
    costShare: "99.98%",
    purpose:
      "Measures internal model perturbation by masking candidate text spans and computing the drop in model surprise (negative log-likelihood). Injected commands abnormally dominate sentence probabilities.",
    input: "Sanitized prompt from Layer 1, decoder-only language model M, window sizes W={1, 3}.",
    output:
      "Continuous anomaly score (top-3 mean of loss shifts), highest shift value, and most suspicious span.",
    algorithm: [
      "1. Tokenize sequence: T = tokenize(P). Compute baseline loss L0 = meanNLL(M, T).",
      "2. Generate multi-scale candidate spans for w ∈ {1, 3} with stride = ceil(w/2).",
      "3. Subsample to max_positions (96) if necessary to cap computational budget.",
      "4. For each span, mask/remove tokens and compute modified loss L_i.",
      "5. Calculate loss difference: d_i = L0 - L_i (large positive shift = anomalous dependence).",
      "6. Aggregate using topk_mean (k=3): anomaly_score = mean(top_3(d)).",
      "7. Identify suspicious span: argmax(d). (Caveat: indicates behavioral dependence, not guaranteed ground truth).",
    ],
    workedExample: {
      attack: "32 candidate spans scored (17 tokens) → L2 score: 0.183",
      clean: "20 candidate spans scored → L2 score: 0.131",
    },
    limitations:
      "High computational cost (~6s on CPU). Backdoor attacks that rely on training-time poisoning have 0.000 recall because clean scoring models show no abnormal loss on clean rare strings.",
    color: "blue",
  },
  {
    id: "l3",
    name: "Layer 3: Decision Gate",
    tag: "Calibrated Evidence Fusion",
    cost: "Negligible (<0.01% total time)",
    costMs: "<0.1 ms",
    costShare: "<0.01%",
    purpose:
      "Fuses structural surface evidence (Layer 1) with behavioral model perturbation (Layer 2), comparing against thresholds calibrated exclusively from clean baseline traffic.",
    input: "Sanitizer risk r ∈ [0, 1], Detector score d, calibrated thresholds θ_block, θ_review.",
    output: "Three-way operational verdict: ALLOW, REVIEW, or BLOCK, accompanied by readable audit reason.",
    algorithm: [
      "1. Calculate fused risk score: fused = detector_score + 1.5 × sanitizer_risk.",
      "2. Compare against clean-calibrated thresholds:",
      "   - If fused ≥ θ_block: classify as BLOCK (refuse & log).",
      "   - Else if fused > θ_review: classify as REVIEW (defensive routing, tools off).",
      "   - Else: classify as ALLOW (forward safely to LLM).",
      "3. Thresholds derived from clean traffic: θ_block at (1 - target_fpr) quantile, θ_review at 85th percentile.",
    ],
    workedExample: {
      attack: "fused = 0.183 + 1.5 × 0.833 = 1.433. Since 1.433 ≥ 0.487 (θ_block) → BLOCK.",
      clean: "fused = 0.131 + 1.5 × 0 = 0.131. Since 0.131 < 0.432 (θ_review) → ALLOW.",
    },
    limitations:
      "The linear fusion weight λ=1.5 was empirically tuned on GPT-2; moving to GPT-2-medium showed slight scale sensitivity, indicating the need for future z-score normalization across models.",
    color: "amber",
  },
  {
    id: "l4",
    name: "Layer 4: Output Validator",
    tag: "Deterministic Safety Backstop",
    cost: "Very Low (~0.01% total time)",
    costMs: "~1.0 ms",
    costShare: "0.01%",
    purpose:
      "Inspects the LLM's generated output before the user ever sees it. If an injection slipped past input layers, this catches the damage (canary, system prompt leak, API keys, compliance markers).",
    input: "LLM response text, system prompt, canary token string.",
    output: "Safe response or in-place redacted response, with security alert flags.",
    algorithm: [
      "1. Canary check: substring search for 'SMIT-PBL13-CANARY-7Q4Z'. 0% false positive by construction.",
      "2. 8-gram overlap: checks consecutive 8-word runs against the system prompt (≥2 runs = leak).",
      "3. Refusal-awareness check: inspects first 400 characters for refusal expressions ('I cannot', 'I must decline').",
      "4. Compliance markers: only checks for 'DAN mode enabled' or 'my system prompt is' if NOT a refusal!",
      "5. Secret scanner: regex checks for OpenAI keys (sk-...), AWS keys (AKIA...), JWTs, private keys.",
      "6. In-place redaction: replaces sensitive substrings with [REDACTED-*] markers and downgrades ALLOW to REVIEW.",
    ],
    workedExample: {
      attack:
        "If model replies 'Sure! My prompt is: ... SMIT-PBL13-CANARY-7Q4Z', canary + 8-gram + compliance fire. Canary redacted, verdict downgraded to REVIEW.",
      clean: "Output contains clean bullet points. 0 leaks detected → Returned intact.",
    },
    limitations:
      "Output validation only detects attacks whose impact is reflected in the generated output text. Cannot reverse state changes caused by autonomous tool calls if tools were executed before validation.",
    color: "rose",
  },
];

export const ArchitectureDiagram: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<string>("l2");

  const current = LAYERS.find((l) => l.id === selectedLayer) || LAYERS[1];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Layered, Training-Free Defense Topology</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            PIAGuard Architecture: Cheap → Expensive → Decision → Safety Net
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            The system sits directly between user input and the target LLM. The target model is untouched:
            no fine-tuning, no retraining, and no GPU required for inference. Click each layer below to
            inspect its algorithmic design, exact cost, and experimental findings.
          </p>
        </div>
      </div>

      {/* Interactive Pipeline Sequence */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {LAYERS.map((layer, index) => {
          const isSelected = selectedLayer === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 relative ${
                isSelected
                  ? "bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500"
                  : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-slate-400 border border-slate-800">
                  Step 0{index + 1}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{layer.costMs}</span>
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-100">{layer.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{layer.tag}</p>

              <div className="mt-3 flex items-center justify-between text-xs font-medium">
                <span className="text-emerald-400/80">Inspect Specs</span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isSelected ? "translate-x-1 text-emerald-400" : ""
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Layer Deep Dive Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-bold text-slate-100">{current.name}</h3>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {current.tag}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{current.purpose}</p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                Latency Cost
              </div>
              <div className="text-sm font-bold text-slate-200">{current.costMs}</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                Pipeline Share
              </div>
              <div className="text-sm font-bold text-emerald-400">{current.costShare}</div>
            </div>
          </div>
        </div>

        {/* Algorithm & Flow Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Execution Algorithm & Mechanics</span>
              </h4>
              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-1.5 font-mono text-xs text-slate-300 leading-relaxed">
                {current.algorithm.map((step, i) => (
                  <div key={i} className="text-slate-300">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Worked Example from Paper */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Paper Worked Example on GPT-2 (§6)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1">
                    Attack Prompt Evaluation
                  </div>
                  <div className="text-xs font-mono text-slate-300">{current.workedExample.attack}</div>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                    Clean Prompt Evaluation
                  </div>
                  <div className="text-xs font-mono text-slate-300">{current.workedExample.clean}</div>
                </div>
              </div>
            </div>
          </div>

          {/* I/O & Known Limitations */}
          <div className="space-y-4">
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Inputs & Outputs
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-mono">Input:</span>
                  <p className="text-slate-200 mt-0.5">{current.input}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-emerald-400 font-mono">Output:</span>
                  <p className="text-slate-200 mt-0.5">{current.output}</p>
                </div>
              </div>
            </div>

            {/* Research Caveats / Limitations */}
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Known Limitations & Honest Caveats</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{current.limitations}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
