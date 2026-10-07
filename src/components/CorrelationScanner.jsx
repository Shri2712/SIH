import React, { useEffect, useState } from 'react';
import { Cpu, Sparkles, Check, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

const SCAN_STAGES = [
  { text: 'Ingesting & parsing raw telemetry streams...', icon: RefreshCw },
  { text: 'Identifying common entity attributes (IP, User, Device)...', icon: Layers },
  { text: 'Evaluating temporal proximity & sequence heuristics...', icon: Sparkles },
  { text: 'Synthesizing correlated attack graph & incident score...', icon: ShieldCheck }
];

export default function CorrelationScanner({ isProcessing, onStartAnalyze, isCorrelated, onResetCorrelation }) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    let stageInterval;
    let progressInterval;

    if (isProcessing) {
      setCurrentStageIdx(0);
      setProgressPercent(10);

      // Increment progress smoothly
      progressInterval = setInterval(() => {
        setProgressPercent(prev => {
          if (prev >= 95) return prev;
          return prev + Math.floor(Math.random() * 8) + 4;
        });
      }, 120);

      // Transition stages
      stageInterval = setInterval(() => {
        setCurrentStageIdx(prev => {
          if (prev < SCAN_STAGES.length - 1) return prev + 1;
          return prev;
        });
      }, 550);
    } else {
      setProgressPercent(100);
    }

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [isProcessing]);

  return (
    <div className="flex flex-col items-center justify-center my-6">
      
      {!isProcessing && !isCorrelated && (
        <button
          onClick={onStartAnalyze}
          className="relative group px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-accent via-cyan-400 to-cyber-neon text-cyber-950 font-bold font-mono text-sm tracking-wider uppercase shadow-xl hover:shadow-cyber-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-3 border border-cyan-300"
        >
          <Cpu className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>ANALYZE & CORRELATE</span>
          <Sparkles className="w-4 h-4 text-cyber-950" />
        </button>
      )}

      {/* Active Processing Scanner */}
      {isProcessing && (
        <div className="w-full max-w-xl bg-cyber-900 border border-cyber-accent/50 rounded-xl p-5 shadow-2xl backdrop-blur-md animate-fadeIn">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-cyber-accent font-semibold flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyber-accent" />
              HEURISTIC ENGINE ACTIVE
            </span>
            <span className="text-slate-300 font-bold">{Math.min(progressPercent, 100)}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-cyber-950 rounded-full h-2.5 overflow-hidden border border-cyber-700 mb-4">
            <div 
              className="bg-gradient-to-r from-cyber-accent via-cyan-400 to-cyber-neon h-full transition-all duration-150 rounded-full shadow-lg shadow-cyber-accent/50"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>

          {/* Stepper Status Indicator */}
          <div className="space-y-2 font-mono text-xs">
            {SCAN_STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              return (
                <div 
                  key={idx} 
                  className={`flex items-center gap-2.5 transition-opacity duration-200 ${
                    isCurrent ? 'text-cyber-accent font-semibold' : isPast ? 'text-slate-400' : 'text-slate-600 opacity-50'
                  }`}
                >
                  {isPast ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  ) : isCurrent ? (
                    <span className="w-4 h-4 rounded-full bg-cyber-accent/20 text-cyber-accent flex items-center justify-center text-[10px] animate-pulse">
                      ▶
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-[10px]">
                      •
                    </span>
                  )}
                  <span>{stage.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Done State Buttons */}
      {!isProcessing && isCorrelated && (
        <div className="flex items-center gap-3">
          <button
            onClick={onStartAnalyze}
            className="px-5 py-2 rounded-lg bg-cyber-800 hover:bg-cyber-700 border border-cyber-600 text-slate-200 font-mono text-xs flex items-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyber-accent" />
            Re-run Correlation Engine
          </button>
        </div>
      )}

    </div>
  );
}
