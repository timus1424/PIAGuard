import React from "react";
import { CheckCircle2, AlertTriangle, ShieldX } from "lucide-react";
import { Decision } from "../lib/types";

interface DecisionBadgeProps {
  decision: Decision;
  size?: "sm" | "md" | "lg";
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({ decision, size = "md" }) => {
  const configs = {
    ALLOW: {
      label: "ALLOW",
      subtext: "Safe to forward to LLM",
      icon: CheckCircle2,
      bg: "bg-emerald-950/60",
      border: "border-emerald-500/40",
      text: "text-emerald-400",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.2)]",
    },
    REVIEW: {
      label: "REVIEW",
      subtext: "Send with hardened prompt / tools off",
      icon: AlertTriangle,
      bg: "bg-amber-950/60",
      border: "border-amber-500/40",
      text: "text-amber-400",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.2)]",
    },
    BLOCK: {
      label: "BLOCK",
      subtext: "Execution refused & logged",
      icon: ShieldX,
      bg: "bg-rose-950/60",
      border: "border-rose-500/40",
      text: "text-rose-400",
      glow: "shadow-[0_0_12px_rgba(244,63,94,0.2)]",
    },
  };

  const current = configs[decision] || configs.ALLOW;
  const Icon = current.icon;

  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${current.bg} ${current.border} ${current.text}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{current.label}</span>
      </span>
    );
  }

  return (
    <div
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl border ${current.bg} ${current.border} ${current.glow} transition-all`}
    >
      <div className={`p-2 rounded-lg bg-slate-950/60 border border-current/20 ${current.text}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Gate Policy:</span>
          <span className={`text-base font-extrabold tracking-wide ${current.text}`}>
            {current.label}
          </span>
        </div>
        <p className="text-xs text-slate-300/90">{current.subtext}</p>
      </div>
    </div>
  );
};
