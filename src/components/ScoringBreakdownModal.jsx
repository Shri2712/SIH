import React from 'react';
import { Calculator, X, Award, CheckCircle } from 'lucide-react';

export default function ScoringBreakdownModal({ isOpen, onClose, score, scoreBreakdown, riskLevel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-cyber-900 border border-cyber-accent/40 rounded-xl max-w-lg w-full p-6 shadow-2xl relative font-mono">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyber-800">
          <div className="flex items-center gap-2 text-cyber-accent">
            <Calculator className="w-5 h-5" />
            <h3 className="font-bold text-sm tracking-wide text-white">
              Correlation Engine Scoring Matrix
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-cyber-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score Summary Box */}
        <div className="bg-cyber-950 p-4 rounded-lg border border-cyber-800 mb-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Total Aggregate Score</span>
            <span className="text-2xl font-black text-cyber-accent">{score} <span className="text-xs font-normal text-slate-500">/ 100</span></span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Calculated Severity</span>
            <span className={`text-xs uppercase font-bold px-2.5 py-1 rounded border ${
              riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
              riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
              'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}>
              {riskLevel} Risk
            </span>
          </div>
        </div>

        {/* Rule Trigger Itemization */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-slate-300 mb-2">Triggered Correlation Heuristics:</h4>
          {scoreBreakdown && scoreBreakdown.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {scoreBreakdown.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded bg-cyber-950/70 border border-cyber-800 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-200 font-semibold block">{item.rule}</span>
                    <span className="text-[11px] text-slate-400 font-sans">{item.detail}</span>
                  </div>
                  <span className="text-cyber-neon font-bold whitespace-nowrap">+{item.points} pts</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 bg-cyber-950 rounded">
              No elevated risk rules were triggered. Telemetry matched baseline parameters (0-30 pts).
            </p>
          )}
        </div>

        {/* Severity Scale Guide */}
        <div className="p-3 rounded bg-cyber-950/50 border border-cyber-800/80 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300 block mb-1">Standard Severity Tiers:</span>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">0–30: Low</div>
            <div className="p-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">31–60: Medium</div>
            <div className="p-1 rounded bg-red-500/10 text-red-300 border border-red-500/20">61–100: High</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyber-800 hover:bg-cyber-700 text-xs text-slate-200 rounded border border-cyber-600 transition"
          >
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
}
