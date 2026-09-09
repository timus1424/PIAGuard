import React from "react";
import { AttackType } from "../lib/types";
import { ShieldCheck, FileWarning, Terminal, Skull, Lock, EyeOff, HelpCircle } from "lucide-react";

interface AttackTypeBadgeProps {
  type: AttackType;
  label?: string;
}

export const AttackTypeBadge: React.FC<AttackTypeBadgeProps> = ({ type, label }) => {
  const configs: Record<
    AttackType,
    { text: string; bg: string; border: string; textClass: string; icon: any }
  > = {
    clean: {
      text: label || "Clean / Benign Prompt",
      bg: "bg-emerald-950/40",
      border: "border-emerald-500/30",
      textClass: "text-emerald-400",
      icon: ShieldCheck,
    },
    direct: {
      text: label || "Direct Prompt Injection",
      bg: "bg-rose-950/50",
      border: "border-rose-500/40",
      textClass: "text-rose-400",
      icon: Terminal,
    },
    indirect: {
      text: label || "Indirect Prompt Injection",
      bg: "bg-purple-950/50",
      border: "border-purple-500/40",
      textClass: "text-purple-400",
      icon: FileWarning,
    },
    jailbreak: {
      text: label || "Jailbreak / Persona Manipulation",
      bg: "bg-amber-950/50",
      border: "border-amber-500/40",
      textClass: "text-amber-400",
      icon: Skull,
    },
    adversarial: {
      text: label || "Adversarial Suffix / Perturbation",
      bg: "bg-orange-950/50",
      border: "border-orange-500/40",
      textClass: "text-orange-400",
      icon: Lock,
    },
    obfuscated: {
      text: label || "Obfuscation & Lookalikes",
      bg: "bg-cyan-950/50",
      border: "border-cyan-500/40",
      textClass: "text-cyan-400",
      icon: EyeOff,
    },
    backdoor: {
      text: label || "Backdoor Trigger Attack",
      bg: "bg-red-950/50",
      border: "border-red-500/40",
      textClass: "text-red-400",
      icon: Skull,
    },
    unknown: {
      text: label || "Unclassified Anomaly",
      bg: "bg-slate-900",
      border: "border-slate-700",
      textClass: "text-slate-300",
      icon: HelpCircle,
    },
  };

  const current = configs[type] || configs.unknown;
  const Icon = current.icon;

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${current.bg} ${current.border} ${current.textClass} text-xs font-semibold`}
    >
      <Icon className="w-4 h-4" />
      <span>{current.text}</span>
    </div>
  );
};
