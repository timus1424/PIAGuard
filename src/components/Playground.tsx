import React, { useState, useEffect } from "react";
import { AnalyzeResponse } from "../lib/types";
import { runPIAGuardPipeline } from "../lib/piaguard-engine";
import { EXAMPLE_PROMPTS, DEFAULT_SYSTEM_PROMPT } from "../lib/constants";
import { PromptEditor } from "./PromptEditor";
import { DiffViewer } from "./DiffViewer";
import { TokenHeatmap } from "./TokenHeatmap";
import { LossShiftChart } from "./LossShiftChart";
import { RiskScoreMeter } from "./RiskScoreMeter";
import { DecisionBadge } from "./DecisionBadge";
import { LatencyBreakdown } from "./LatencyBreakdown";
import { DetectionEvidence } from "./DetectionEvidence";
import {
  Shield,
  RotateCcw,
  Sparkles,
  Sliders,
  Settings,
  HelpCircle,
  FileCode,
  Key,
} from "lucide-react";

export const Playground: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(EXAMPLE_PROMPTS[0].prompt);
  const [systemPrompt, setSystemPrompt] = useState<string>(DEFAULT_SYSTEM_PROMPT);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);

  // Analyze prompt function
  const handleAnalyze = async (options: {
    aggregation: "topk_mean" | "robust_z";
    windows: number[];
  }) => {
    setIsLoading(true);
    try {
      // First try backend API endpoint
      const response = await fetch("/api/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aggregation: options.aggregation,
          system_prompt: systemPrompt,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else {
        // Fallback to client-side pipeline engine
        const fallback = runPIAGuardPipeline(prompt, {
          aggregation: options.aggregation,
          systemPrompt,
        });
        setAnalysis(fallback);
      }
    } catch (err) {
      console.warn("Backend API not reachable, running client-side engine", err);
      const fallback = runPIAGuardPipeline(prompt, {
        aggregation: options.aggregation,
        systemPrompt,
      });
      setAnalysis(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Run once on load with the default prompt
  useEffect(() => {
    handleAnalyze({ aggregation: "topk_mean", windows: [1, 3] });
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Interactive Security Lab</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Live PIAGuard Pipeline Inspector
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Test any adversarial injection or benign text in real time. Inspect text sanitization,
            masked-span loss shifts, gate score arithmetic, and output canary validation.
          </p>
        </div>

        {/* Configuration Button */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <Settings className="w-4 h-4 text-emerald-400" />
          <span>System Prompt & Canary</span>
        </button>
      </div>

      {/* System Prompt & Canary Settings Drawer */}
      {showConfig && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-slate-100">
                Target Application System Context
              </h4>
            </div>
            <button
              onClick={() => setSystemPrompt(DEFAULT_SYSTEM_PROMPT)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              PROTECTED SYSTEM PROMPT (Includes Canary Token):
            </label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Canary string: <code className="text-emerald-400">SMIT-PBL13-CANARY-7Q4Z</code>. Layer 4
              actively checks model replies for this token to prevent confidential prompt extraction.
            </p>
          </div>
        </div>
      )}

      {/* Main Input Component */}
      <PromptEditor
        prompt={prompt}
        setPrompt={setPrompt}
        onAnalyze={handleAnalyze}
        isLoading={isLoading}
      />

      {/* Analysis Results Display */}
      {analysis && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Decision Banner & Meters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Decision Badge Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Layer 3 Gate Policy Verdict
                </span>
                <div className="pt-1">
                  <DecisionBadge decision={analysis.decision} size="lg" />
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300">
                <strong className="text-slate-200 block mb-0.5">Audit Trail Reason:</strong>
                {analysis.gate.reason}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                <span>Total Latency:</span>
                <span className="text-emerald-400 font-bold">
                  {(analysis.latencies_ms?.total ?? analysis.total_latency_ms).toFixed(1)} ms
                </span>
              </div>
            </div>

            {/* Fused Risk Meter */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
              <RiskScoreMeter
                fusedScore={analysis.fused_score}
                thetaReview={analysis.gate.theta_review}
                thetaBlock={analysis.gate.theta_block}
              />
            </div>

            {/* Individual Layer Metrics Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-3">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Multi-Layer Risk Telemetry
              </span>

              <div className="space-y-3 font-mono text-xs">
                {/* L1 */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-slate-300">L1 Sanitizer:</span>
                  </div>
                  <span className="font-bold text-emerald-400">
                    {analysis.sanitizer.risk_score.toFixed(4)}
                  </span>
                </div>

                {/* L2 */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span className="text-slate-300">L2 Loss-Shift:</span>
                  </div>
                  <span className="font-bold text-blue-400">
                    {analysis.detector.anomaly_score.toFixed(4)}
                  </span>
                </div>

                {/* L4 Output */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span className="text-slate-300">L4 Leak Check:</span>
                  </div>
                  <span
                    className={`font-bold ${
                      analysis.validator.leak_detected ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {analysis.validator.leak_detected ? "LEAK CAUGHT" : "SAFE"}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-center">
                Thresholds calibrated on clean traffic at 1% FPR target.
              </div>
            </div>
          </div>

          {/* L1 Normalization Diff */}
          <DiffViewer
            originalPrompt={analysis.prompt}
            sanitizedPrompt={analysis.sanitizer.sanitized_prompt}
            removedCount={analysis.sanitizer.removed_characters_count}
            decodedPayloads={analysis.sanitizer.decoded_payloads}
          />

          {/* L2 Behavioral Perturbation Heatmap */}
          <TokenHeatmap detector={analysis.detector} />

          {/* L2 Candidate Spans Chart */}
          <LossShiftChart
            candidateSpans={analysis.detector.candidate_spans}
            aggregationMethod={analysis.detector.aggregation_method}
            anomalyScore={analysis.detector.anomaly_score}
          />

          {/* Latency & Engineering Cost Profile */}
          <LatencyBreakdown currentLatencies={analysis.latencies_ms} />

          {/* Detailed Multi-Layer Evidence */}
          <DetectionEvidence analysis={analysis} />
        </div>
      )}
    </div>
  );
};
