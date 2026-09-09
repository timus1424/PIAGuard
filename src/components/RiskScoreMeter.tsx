import React from "react";

interface RiskScoreMeterProps {
  score: number; // 0..1 scale
  fusedScore?: number;
  thetaReview?: number;
  thetaBlock?: number;
}

export const RiskScoreMeter: React.FC<RiskScoreMeterProps> = ({
  score,
  fusedScore,
  thetaReview = 0.432,
  thetaBlock = 0.487,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round(score * 100)));

  // Color selection based on risk levels
  let colorClass = "from-emerald-500 to-teal-500";
  let textColor = "text-emerald-400";
  let statusText = "SAFE / BENIGN";

  if (fusedScore !== undefined) {
    if (fusedScore >= thetaBlock) {
      colorClass = "from-rose-500 to-red-600";
      textColor = "text-rose-400";
      statusText = "HIGH RISK / MALICIOUS";
    } else if (fusedScore > thetaReview) {
      colorClass = "from-amber-500 to-yellow-600";
      textColor = "text-amber-400";
      statusText = "SUSPICIOUS / ELEVATED";
    }
  } else {
    if (score >= 0.5) {
      colorClass = "from-rose-500 to-red-600";
      textColor = "text-rose-400";
      statusText = "HIGH RISK";
    } else if (score >= 0.3) {
      colorClass = "from-amber-500 to-yellow-600";
      textColor = "text-amber-400";
      statusText = "SUSPICIOUS";
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Threat Risk Index
        </span>
        <span className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>
          {statusText}
        </span>
      </div>

      {/* Main Score Display */}
      <div className="flex items-baseline space-x-2 mb-3">
        <span className={`text-3xl font-extrabold tracking-tight ${textColor}`}>
          {(score * 100).toFixed(1)}%
        </span>
        {fusedScore !== undefined && (
          <span className="text-xs text-slate-400">
            (Fused score: <strong className="text-slate-200">{fusedScore.toFixed(3)}</strong>)
          </span>
        )}
      </div>

      {/* Visual Meter Bar */}
      <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800 overflow-hidden relative">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
        {/* Review threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80"
          style={{ left: `${Math.min(95, (thetaReview / 1.5) * 100)}%` }}
          title={`θ_review: ${thetaReview}`}
        />
        {/* Block threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-rose-500"
          style={{ left: `${Math.min(95, (thetaBlock / 1.5) * 100)}%` }}
          title={`θ_block: ${thetaBlock}`}
        />
      </div>

      {/* Threshold Reference Labels */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
        <span>0.0 (Safe)</span>
        <span className="text-amber-400/90">θ_review: {thetaReview}</span>
        <span className="text-rose-400/90">θ_block: {thetaBlock}</span>
        <span>1.5+ (Critical)</span>
      </div>
    </div>
  );
};
