import React, { useState } from "react";
import { VIVA_QUESTIONS } from "../lib/constants";
import { BookOpen, HelpCircle, ChevronDown, Award, Sparkles, CheckCircle2 } from "lucide-react";

export const PanelVivaGuide: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>PBL Evaluation Defense & Viva Reference Guide</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            The Presenter&apos;s Defense Brief: Questions the Panel Will Ask
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Written so any team member can defend PIAGuard with authoritative clarity. Grounded in our
            empirical GPT-2 experimental results, the four-layer design rationale, and our published
            failure modes.
          </p>
        </div>
      </div>

      {/* Top 5 Golden Rules / Core Takeaways */}
      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
          <Award className="w-5 h-5" />
          <span>If You Remember Only Five Things (Presenter Brief §10)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="font-mono text-emerald-400 font-bold">1. Root Cause</span>
            <p className="text-slate-300">
              An LLM cannot separate instructions from data. That one fundamental fact is the vulnerability.
            </p>
          </div>
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="font-mono text-emerald-400 font-bold">2. Layered Defense</span>
            <p className="text-slate-300">
              Arranged cheap-before-expensive: rules (1.5ms) → behavioral loss (6s) → gate → output backstop.
            </p>
          </div>
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="font-mono text-emerald-400 font-bold">3. No Training Needed</span>
            <p className="text-slate-300">
              Layer 2 masks spans and measures model surprise (NLL drop). Zero fine-tuning, model-agnostic.
            </p>
          </div>
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="font-mono text-emerald-400 font-bold">4. Honest Calibration</span>
            <p className="text-slate-300">
              Thresholds derive strictly from normal traffic: &quot;Block at most 1 in 100 legitimate messages.&quot;
            </p>
          </div>
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="font-mono text-emerald-400 font-bold">5. Fusing Beats Parts</span>
            <p className="text-slate-300">
              Fused AUROC is 0.928 vs rules alone (0.849). Backdoors remain a known clean-model blind spot.
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Questions & Answers */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider px-1">
          Common Panel Questions & Tested Defenses
        </h3>

        {VIVA_QUESTIONS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center space-x-3 pr-4">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                    Q{index + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-100">{item.q}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                    isOpen ? "rotate-180 text-emerald-400" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="p-4 pt-1 pb-5 border-t border-slate-800/60 bg-slate-950/40 text-xs text-slate-300 leading-relaxed font-sans">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-300 font-semibold block mb-1">
                        Recommended Answer:
                      </strong>
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
