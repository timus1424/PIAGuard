import React, { useState } from "react";
import { Code2, Copy, Check, FileCode, FolderTree } from "lucide-react";

interface CodeFile {
  name: string;
  path: string;
  description: string;
  code: string;
}

const PYTHON_FILES: CodeFile[] = [
  {
    name: "sanitizer.py",
    path: "backend/app/security/sanitizer.py",
    description: "Layer 1: Input hygiene, zero-width removal, homoglyph folding, and 18 regex rules.",
    code: `"""
PIAGuard Layer 1: Input Sanitizer
Author: PBL Group 13 (SMIT)
Normalizes input text and scores 18 hand-crafted regex rules across 6 families.
"""

import re
import unicodedata
from typing import List, Set, Tuple
from pydantic import BaseModel

# Zero-width / invisible Unicode codepoints
INVISIBLE_CHARS_RE = re.compile(r"[\\u200B\\u200C\\u200D\\uFEFF\\u202A\\u202B\\u202C\\u202D\\u202E\\u00AD]")

# Cyrillic homoglyphs mapping to Latin ASCII
HOMOGLYPH_MAP = {
    '\\u0430': 'a', '\\u0410': 'A',
    '\\u0435': 'e', '\\u0415': 'E',
    '\\u043e': 'o', '\\u041e': 'O',
    '\\u0440': 'p', '\\u0420': 'P',
    '\\u0441': 'c', '\\u0421': 'C',
    '\\u0443': 'y', '\\u0445': 'x',
    '\\u0456': 'i', '\\u0406': 'I',
    '\\u0458': 'j', '\\u0408': 'J',
    '\\u0455': 's',
}

RULES = [
    ("R01", "override", 1.0, re.compile(r"(?i)(?:ignore|disregard|forget|bypass)\\s+(?:all\\s+)?(?:previous|prior|above)\\s+(?:instructions|prompts|rules|commands)")),
    ("R02", "override", 0.8, re.compile(r"(?i)(?:start|begin)\\s+new\\s+(?:task|instruction|session|conversation|rules)")),
    ("R03", "override", 1.0, re.compile(r"(?i)(?:do not|don't)\\s+(?:follow|obey|listen to)\\s+(?:the\\s+)?(?:system|developer|original|initial)")),
    ("R04", "leak", 1.0, re.compile(r"(?i)(?:print|reveal|output|show|display|tell\\s+me|dump|leak|repeat)\\s+(?:your\\s+)?(?:system\\s+prompt|hidden\\s+prompt|instructions|secret\\s+key)")),
    ("R05", "leak", 0.9, re.compile(r"(?i)(?:what\\s+(?:are|is)\\s+your\\s+(?:system\\s+prompt|original\\s+instructions|initial\\s+rules))")),
    ("R06", "persona", 1.0, re.compile(r"(?i)(?:you\\s+are\\s+now|act\\s+as|pretend\\s+to\\s+be|from\\s+now\\s+on\\s+you\\s+are)\\s+(?:DAN|jailbreak|unrestricted|god\\s+mode)")),
    ("R07", "persona", 1.0, re.compile(r"(?i)(?:enable|enter)\\s+(?:developer\\s+mode|unfiltered\\s+mode|jailbreak\\s+mode|god\\s+mode)")),
    ("R08", "separator", 0.8, re.compile(r"(?i)(?:===\\s*END\\s+OF\\s+SYSTEM\\s+PROMPT\\s*===|###\\s*END\\s+SYSTEM|---\\s*BEGIN\\s+USER\\s*---)")),
    ("R09", "separator", 0.9, re.compile(r"(?i)(?:\\[(?:system|admin|root|developer)\\]|<<SYS>>|<\\|im_start\\|>system)")),
    ("R10", "separator", 0.7, re.compile(r"(?i)(?:(?:human|assistant|user|system):\\s*){2,}")),
    ("R11", "delimiter", 0.6, re.compile(r"<(?:!--.*?--|script|injection|override)>")),
    ("R12", "delimiter", 0.7, re.compile(r"\`\`\`(?:json|python|bash)?\\s*(?:system|override|ignore)")),
    ("R13", "delimiter", 0.6, re.compile(r"\\{\\{\\s*(?:system|prompt|secret)\\s*\\}\\}")),
    ("R14", "delimiter", 0.7, re.compile(r"\\[INST\\].*?\\[/INST\\]")),
    ("R15", "encoding", 0.8, re.compile(r"(?i)(?:base64\\s+decode|rot13|hex\\s+decode|execute\\s+this\\s+encoded)")),
    ("R16", "encoding", 0.5, re.compile(r"(?:[A-Za-z0-9+/]{32,}={0,2})")),
    ("R17", "backdoor", 0.8, re.compile(r"(?i)(?:tq_activate|backdoor_trigger_alpha|uuid_override_77)")),
    ("R18", "adversarial", 0.6, re.compile(r"(?i)(?:adversarial\\s+suffix|gcg_opt_suffix|[!@#$%^&*()_+]{8,})")),
]

class SanitizerResult(BaseModel):
    risk_score: float
    rules_triggered: List[str]
    families_matched: List[str]
    sanitized_prompt: str
    removed_characters_count: int

class InputSanitizer:
    def __init__(self, risk_divisor: float = 3.0):
        self.risk_divisor = risk_divisor

    def sanitize(self, raw_text: str) -> SanitizerResult:
        # Step 1: Strip zero-width & invisible characters
        initial_len = len(raw_text)
        cleaned = INVISIBLE_CHARS_RE.sub("", raw_text)
        removed_count = initial_len - len(cleaned)

        # Step 2: Normalize homoglyphs
        normalized_chars = []
        for ch in cleaned:
            if ch in HOMOGLYPH_MAP:
                normalized_chars.append(HOMOGLYPH_MAP[ch])
                removed_count += 1
            else:
                normalized_chars.append(ch)
        cleaned = unicodedata.normalize("NFKC", "".join(normalized_chars))

        # Step 3: Match 18 hand-written rules
        matched_rules = []
        matched_families = set()
        total_weight = 0.0

        for rule_id, family, weight, rx in RULES:
            if rx.search(cleaned):
                matched_rules.append(rule_id)
                matched_families.add(family)
                total_weight += weight

        # Formula: risk = min(1.0, (total + 0.5 * (families - 1)) / 3.0)
        risk = 0.0
        if matched_rules:
            bonus = 0.5 * max(0, len(matched_families) - 1)
            risk = min(1.0, (total_weight + bonus) / self.risk_divisor)

        return SanitizerResult(
            risk_score=round(risk, 4),
            rules_triggered=matched_rules,
            families_matched=list(matched_families),
            sanitized_prompt=cleaned,
            removed_characters_count=removed_count
        )
`
  },
  {
    name: "detector.py",
    path: "backend/app/security/detector.py",
    description: "Layer 2: Multi-scale masked-span loss-shift anomaly detector with top-3 aggregation.",
    code: `"""
PIAGuard Layer 2: Masked-Span Loss-Shift Detector
Author: PBL Group 13 (SMIT)
Core research component: slides multi-scale windows across prompt tokens,
measures NLL loss shift when masked, and computes top-3 mean anomaly score.
"""

import math
import numpy as np
from typing import List, Optional
from pydantic import BaseModel

class CandidateSpan(BaseModel):
    start_token: int
    end_token: int
    span_text: str
    window_size: int
    loss_with_mask: float
    loss_difference: float

class DetectorResult(BaseModel):
    baseline_loss: float
    anomaly_score: float
    aggregation_method: str
    suspicious_span: Optional[str]
    num_spans_evaluated: int
    is_mock: bool

class LossShiftDetector:
    def __init__(
        self,
        scoring_model,
        window_sizes: List[int] = [1, 3],
        max_positions: int = 96,
        aggregation: str = "topk_mean"
    ):
        self.model = scoring_model
        self.window_sizes = window_sizes
        self.max_positions = max_positions
        self.aggregation = aggregation

    def detect(self, prompt: str) -> DetectorResult:
        token_ids = self.model.tokenize(prompt)
        n = len(token_ids)
        if n == 0:
            return DetectorResult(
                baseline_loss=0.0, anomaly_score=0.0, aggregation_method=self.aggregation,
                suspicious_span=None, num_spans_evaluated=0, is_mock=self.model.is_mock
            )

        # Step 1: Baseline NLL of the complete sequence
        baseline_loss = self.model.mean_nll([token_ids])[0]

        # Step 2: Generate candidate spans using multi-scale windows
        raw_spans = []
        for w in self.window_sizes:
            if w > n:
                continue
            stride = 1 if w == 1 else max(1, math.ceil(w / 2))
            for i in range(0, n - w + 1, stride):
                raw_spans.append((i, i + w, w))

        # Step 3: Subsample if candidates exceed max_positions
        if len(raw_spans) > self.max_positions:
            indices = np.linspace(0, len(raw_spans) - 1, self.max_positions, dtype=int)
            selected_spans = [raw_spans[idx] for idx in indices]
        else:
            selected_spans = raw_spans

        # Step 4: Batch evaluate masked variants
        masked_sequences = []
        for start, end, _ in selected_spans:
            variant = token_ids[:start] + token_ids[end:]
            masked_sequences.append(variant if variant else token_ids)

        losses = self.model.mean_nll(masked_sequences)

        # Step 5: Calculate loss differences d_i = L0 - L_i
        differences = [baseline_loss - l_i for l_i in losses]

        # Step 6: Score aggregation (topk_mean k=3)
        if self.aggregation == "topk_mean":
            sorted_diffs = sorted(differences, reverse=True)
            k = min(3, len(sorted_diffs))
            anomaly_score = sum(sorted_diffs[:k]) / k if k > 0 else 0.0
        else:
            # Legacy robust-z with MAD
            med = float(np.median(differences))
            mad = float(np.median(np.abs(differences - med)))
            s_mad = 1.4826 * mad
            anomaly_score = (max(differences) - med) / (s_mad + 1e-6)

        # Step 7: Locate suspicious span (argmax d_i)
        max_idx = int(np.argmax(differences)) if differences else 0
        best_span = selected_spans[max_idx]
        suspicious_text = self.model.decode(token_ids[best_span[0]:best_span[1]])

        return DetectorResult(
            baseline_loss=round(float(baseline_loss), 4),
            anomaly_score=round(float(anomaly_score), 4),
            aggregation_method=self.aggregation,
            suspicious_span=suspicious_text,
            num_spans_evaluated=len(selected_spans),
            is_mock=self.model.is_mock
        )
`
  },
  {
    name: "gate.py",
    path: "backend/app/security/gate.py",
    description: "Layer 3: Score fusion policy and clean-calibrated 3-way decision gate.",
    code: `"""
PIAGuard Layer 3: Decision Gate
Author: PBL Group 13 (SMIT)
Combines L1 sanitizer risk and L2 behavioral anomaly score via score fusion.
Decisions: ALLOW, REVIEW, BLOCK.
"""

from pydantic import BaseModel

class GateResult(BaseModel):
    fused_score: float
    theta_review: float
    theta_block: float
    decision: str
    reason: str

class DecisionGate:
    def __init__(
        self,
        theta_block: float = 0.487,
        theta_review: float = 0.432,
        lambda_weight: float = 1.5
    ):
        self.theta_block = theta_block
        self.theta_review = theta_review
        self.lambda_weight = lambda_weight

    def decide(self, sanitizer_risk: float, detector_score: float) -> GateResult:
        # Fused score equation from paper Section 5
        fused = detector_score + (self.lambda_weight * sanitizer_risk)

        if fused >= self.theta_block:
            decision = "BLOCK"
            reason = f"Fused risk {fused:.3f} exceeds blocking threshold {self.theta_block}."
        elif fused > self.theta_review:
            decision = "REVIEW"
            reason = f"Fused risk {fused:.3f} lands in review band [{self.theta_review}..{self.theta_block}]."
        else:
            decision = "ALLOW"
            reason = f"Fused risk {fused:.3f} is below review threshold {self.theta_review}."

        return GateResult(
            fused_score=round(fused, 4),
            theta_review=self.theta_review,
            theta_block=self.theta_block,
            decision=decision,
            reason=reason
        )
`
  },
  {
    name: "validator.py",
    path: "backend/app/security/validator.py",
    description: "Layer 4: Output Validator with canary check, 8-gram overlap, and refusal awareness.",
    code: `"""
PIAGuard Layer 4: Output Validator
Author: PBL Group 13 (SMIT)
Deterministic backstop inspecting model replies before the user sees them.
Canary token: SMIT-PBL13-CANARY-7Q4Z
"""

import re
from typing import Set
from pydantic import BaseModel

CANARY_TOKEN = "SMIT-PBL13-CANARY-7Q4Z"

REFUSAL_MARKERS = [
    re.compile(r"i cannot\\b", re.I),
    re.compile(r"i can't\\b", re.I),
    re.compile(r"i am unable to\\b", re.I),
    re.compile(r"as an ai assistant, i must\\b", re.I),
]

COMPLIANCE_MARKERS = [
    re.compile(r"dan mode enabled", re.I),
    re.compile(r"my system prompt is", re.I),
    re.compile(r"as an unrestricted ai", re.I),
]

class ValidatorResult(BaseModel):
    leak_detected: bool
    canary_detected: bool
    safe_output: str
    redaction_applied: bool

class OutputValidator:
    def __init__(self, system_prompt: str, canary: str = CANARY_TOKEN):
        self.system_prompt = system_prompt
        self.canary = canary
        self.system_8grams = self._extract_8grams(system_prompt)

    def _extract_8grams(self, text: str) -> Set[str]:
        words = re.findall(r"\\w+", text.lower())
        return {" ".join(words[i:i+8]) for i in range(len(words) - 7)}

    def validate(self, output: str) -> ValidatorResult:
        safe_output = output
        leak = False
        canary_found = False
        redacted = False

        # 1. Canary check (zero false positives)
        if self.canary in safe_output:
            canary_found = True
            leak = True
            safe_output = safe_output.replace(self.canary, "[REDACTED-CANARY]")
            redacted = True

        # 2. 8-gram overlap
        output_8grams = self._extract_8grams(safe_output)
        if len(self.system_8grams.intersection(output_8grams)) >= 2:
            leak = True

        # 3. Refusal-aware compliance check (first 400 chars)
        is_refusal = any(rx.search(safe_output[:400]) for rx in REFUSAL_MARKERS)
        if not is_refusal:
            for rx in COMPLIANCE_MARKERS:
                if rx.search(safe_output):
                    leak = True
                    break

        return ValidatorResult(
            leak_detected=leak,
            canary_detected=canary_found,
            safe_output=safe_output,
            redaction_applied=redacted
        )
`
  },
  {
    name: "pipeline.py",
    path: "backend/app/security/pipeline.py",
    description: "Complete orchestrator tying L1 -> L2 -> L3 -> (LLM) -> L4 with latency logging.",
    code: `"""
PIAGuard Complete Pipeline Orchestrator
Author: PBL Group 13 (SMIT)
"""

import time
from app.security.sanitizer import InputSanitizer
from app.security.detector import LossShiftDetector
from app.security.gate import DecisionGate
from app.security.validator import OutputValidator

class PIAGuardPipeline:
    def __init__(self, sanitizer, detector, gate, validator):
        self.sanitizer = sanitizer
        self.detector = detector
        self.gate = gate
        self.validator = validator

    def run(self, prompt: str, simulated_output: str = None):
        t0 = time.perf_counter()

        # Layer 1: Input Sanitizer
        l1_res = self.sanitizer.sanitize(prompt)
        t1 = time.perf_counter()

        # Layer 2: Loss-Shift Detector
        l2_res = self.detector.detect(l1_res.sanitized_prompt)
        t2 = time.perf_counter()

        # Layer 3: Decision Gate
        l3_res = self.gate.decide(l1_res.risk_score, l2_res.anomaly_score)
        t3 = time.perf_counter()

        # Layer 4: Output Validator
        model_reply = simulated_output or "Standard protected LLM completion."
        l4_res = self.validator.validate(model_reply)
        t4 = time.perf_counter()

        return {
            "prompt": prompt,
            "decision": l3_res.decision,
            "fused_score": l3_res.fused_score,
            "sanitizer": l1_res,
            "detector": l2_res,
            "gate": l3_res,
            "validator": l4_res,
            "latencies_ms": {
                "l1": (t1 - t0) * 1000,
                "l2": (t2 - t1) * 1000,
                "l3": (t3 - t2) * 1000,
                "l4": (t4 - t3) * 1000,
                "total": (t4 - t0) * 1000,
            }
        }
`
  }
];

export const CodeRepoViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(PYTHON_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Code2 className="w-3.5 h-3.5" />
            <span>Python 3.12 Backend Architecture</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Authentic Modular Source Code
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Every layer is implemented as an independent, unit-testable class with strict typing,
            deterministic mock capabilities, and transparent configuration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File Navigator Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center space-x-2">
            <FolderTree className="w-4 h-4 text-emerald-400" />
            <span>Project Modules</span>
          </div>

          <div className="space-y-1">
            {PYTHON_FILES.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs transition-all flex items-center space-x-2.5 ${
                    isSelected
                      ? "bg-slate-800 text-emerald-400 border-slate-700 shadow-sm"
                      : "bg-slate-900/60 text-slate-300 border-slate-800/80 hover:bg-slate-800/40"
                  }`}
                >
                  <FileCode className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                  <div className="truncate">
                    <span className="font-semibold">{file.name}</span>
                    <span className="block text-[10px] text-slate-500 truncate">{file.path}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Editor Preview */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-900/80 border-b border-slate-800">
            <div>
              <div className="text-xs font-mono text-slate-200 font-semibold">{selectedFile.path}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{selectedFile.description}</div>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Text Box */}
          <div className="p-5 overflow-x-auto max-h-[540px] font-mono text-xs text-slate-300 leading-relaxed select-text">
            <pre className="whitespace-pre">
              <code>{selectedFile.code.trim()}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
