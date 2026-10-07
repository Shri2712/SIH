import React from 'react';
import { ArrowRight, ShieldAlert, CheckCircle2, AlertOctagon, Terminal } from 'lucide-react';

export default function AttackChainFlow({ steps, incidentType }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-cyber-950/90 border border-cyber-800 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-cyber-accent font-semibold">
          <Terminal className="w-3.5 h-3.5" />
          Correlated Attack Sequence & Kill Chain Flow
        </span>
        <span>{steps.length} Progression Stages</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          let nodeTheme = 'border-cyber-700 bg-cyber-900/90 text-slate-200';
          let badgeTheme = 'bg-slate-800 text-slate-400';

          if (step.status === 'danger') {
            nodeTheme = 'border-red-500/40 bg-red-950/20 text-red-100 shadow-sm shadow-red-500/10';
            badgeTheme = 'bg-red-500/20 text-red-400 border border-red-500/30';
          } else if (step.status === 'warning') {
            nodeTheme = 'border-amber-500/40 bg-amber-950/20 text-amber-100';
            badgeTheme = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
          } else if (step.status === 'normal') {
            nodeTheme = 'border-emerald-500/40 bg-emerald-950/20 text-emerald-100';
            badgeTheme = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
          }

          return (
            <div key={idx} className="relative flex flex-col justify-between">
              <div className={`p-3.5 rounded-lg border flex flex-col justify-between h-full ${nodeTheme} transition-all duration-200 hover:scale-[1.02]`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${badgeTheme}`}>
                      Step 0{step.step || idx + 1}
                    </span>
                    {idx < steps.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
                    )}
                  </div>
                  <h4 className="font-semibold text-xs text-slate-100 mb-1 leading-snug">
                    {step.label}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-tight font-sans">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
