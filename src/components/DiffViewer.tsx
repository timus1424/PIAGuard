import React from "react";
import { ArrowRight, CheckCircle, Info, ShieldAlert } from "lucide-react";

interface DiffViewerProps {
  originalPrompt: string;
  sanitizedPrompt: string;
  removedCount: number;
  decodedPayloads: string[];
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalPrompt,
  sanitizedPrompt,
  removedCount,
  decodedPayloads,
}) => {
  const isIdentical = originalPrompt === sanitizedPrompt && decodedPayloads.length === 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-slate-100">
            L1 Input Sanitizer: Text Normalization Diff
          </h3>
        </div>
        <div className="text-xs">
          {removedCount > 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              {removedCount} characters sanitized
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">
              0 modifications
            </span>
          )}
        </div>
      </div>

      {isIdentical ? (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center space-x-3 text-xs text-slate-300">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Input text was already clean: no zero-width characters, Cyrillic lookalikes, or hidden
            encodings were detected.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Original */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-400 font-mono">
              <span>RAW USER INPUT (Before Sanitization)</span>
              <span>{originalPrompt.length} chars</span>
            </div>
            <div className="p-4 bg-rose-950/10 border border-rose-500/20 rounded-xl font-mono text-xs text-rose-200/90 whitespace-pre-wrap break-all min-h-[100px] leading-relaxed">
              {originalPrompt}
            </div>
          </div>

          {/* Sanitized */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 font-mono">
              <span>NORMALIZED PROMPT (After Sanitization)</span>
              <span>{sanitizedPrompt.length} chars</span>
            </div>
            <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-xl font-mono text-xs text-emerald-200/90 whitespace-pre-wrap break-all min-h-[100px] leading-relaxed">
              {sanitizedPrompt}
            </div>
          </div>
        </div>
      )}

      {/* Decoded payloads if any */}
      {decodedPayloads.length > 0 && (
        <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>Decoded Obfuscated Payload Identified</span>
          </div>
          {decodedPayloads.map((payload, i) => (
            <div
              key={i}
              className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-purple-200 break-all border border-purple-800/40"
            >
              {payload}
            </div>
          ))}
          <p className="text-[11px] text-slate-400">
            Note: PIAGuard inspects decoded contents for adversarial intent without executing or
            forwarding arbitrary script blocks.
          </p>
        </div>
      )}
    </div>
  );
};
