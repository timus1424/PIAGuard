export type AttackType =
  | "direct"
  | "indirect"
  | "jailbreak"
  | "adversarial"
  | "backdoor"
  | "obfuscated"
  | "clean"
  | "unknown";

export type Decision = "ALLOW" | "REVIEW" | "BLOCK";

export interface RuleMatch {
  rule_id: string;
  family: string;
  weight: number;
  pattern_description: string;
  matched_text: string;
  start_idx: number;
  end_idx: number;
}

export interface SanitizerResult {
  risk_score: number;
  rules_triggered: RuleMatch[];
  families_matched: string[];
  sanitized_prompt: string;
  removed_characters_count: number;
  decoded_payloads: string[];
  latency_ms: number;
}

export interface CandidateSpan {
  start_token: number;
  end_token: number;
  span_text: string;
  window_size: number;
  loss_with_mask: number;
  loss_difference: number; // d_i = L0 - L_i
}

export interface DetectorResult {
  baseline_loss: number;
  anomaly_score: number;
  aggregation_method: "topk_mean" | "robust_z";
  suspicious_span: string | null;
  suspicious_start_token: number | null;
  suspicious_end_token: number | null;
  candidate_spans: CandidateSpan[];
  num_spans_evaluated: number;
  tokens: string[];
  latency_ms: number;
  is_mock: boolean;
}

export interface GateResult {
  fused_score: number;
  theta_review: number;
  theta_block: number;
  decision: Decision;
  sanitizer_contribution: number;
  detector_contribution: number;
  reason: string;
  latency_ms: number;
}

export interface ValidatorResult {
  leak_detected: boolean;
  canary_detected: boolean;
  ngram_overlap_count: number;
  secrets_found: string[];
  compliance_marker_found: boolean;
  is_refusal_recognized: boolean;
  redaction_applied: boolean;
  raw_output: string;
  safe_output: string;
  downgraded_verdict?: Decision;
  latency_ms: number;
}

export interface AnalyzeResponse {
  is_safe: boolean;
  risk_score: number; // 0..1 scale for visual meter
  attack_type: AttackType;
  attack_type_label: string;
  decision: Decision;
  mitigation_applied: string;
  total_latency_ms: number;
  latencies_ms?: {
    l1: number;
    l2: number;
    l3: number;
    l4: number;
    total: number;
  };
  prompt: string;
  sanitizer: SanitizerResult;
  detector: DetectorResult;
  gate: GateResult;
  validator: ValidatorResult;
  timestamp: string;
}

export interface ExamplePrompt {
  id: string;
  title: string;
  category: AttackType;
  prompt: string;
  description: string;
  simulatedOutput?: string;
  expectedDecision: Decision;
}

export interface EvaluationBaseline {
  system: string;
  tpr_at_1_fpr: number;
  fpr: number;
  precision: number;
  f1: number;
  balanced_accuracy: number;
  auroc: number;
  theta: number;
  description: string;
}

export interface FamilyRecall {
  family: AttackType;
  label: string;
  n: number;
  recall: number;
  blocked_count: number;
  review_count: number;
  description: string;
  limitation_note?: string;
}

export interface LatencyBenchmark {
  stage: string;
  mean_ms: number;
  median_ms: number;
  p95_ms: number;
  share_pct: number;
}
