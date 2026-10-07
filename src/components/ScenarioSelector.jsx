import React from 'react';
import { ShieldAlert, Bug, CheckCircle2, Play, Flame } from 'lucide-react';

export default function ScenarioSelector({ scenarios, activeScenarioId, onSelectScenario, isProcessing }) {
  return (
    <div className="bg-cyber-900/80 border border-cyber-700/60 rounded-xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-cyber-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 rounded-full bg-cyber-accent/20 border border-cyber-accent/40 items-center justify-center text-[10px] font-mono text-cyber-accent font-bold">1</span>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono">
              Step 1: Select Simulation Scenario
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose a mock telemetry stream to simulate raw unlinked security alerts.
          </p>
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block">
          Interactive Attack Generator
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {scenarios.map((scenario) => {
          const isSelected = activeScenarioId === scenario.id;
          
          let iconComponent = <ShieldAlert className="w-5 h-5" />;
          let activeBorder = 'border-cyber-danger bg-cyber-danger/10 text-cyber-danger';
          let hoverBorder = 'hover:border-cyber-danger/60';
          let badgeColor = 'bg-red-500/20 text-red-300 border-red-500/30';

          if (scenario.id === 'malware_activity') {
            iconComponent = <Bug className="w-5 h-5" />;
            activeBorder = 'border-cyber-warning bg-cyber-warning/10 text-cyber-warning';
            hoverBorder = 'hover:border-cyber-warning/60';
            badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
          } else if (scenario.id === 'normal_activity') {
            iconComponent = <CheckCircle2 className="w-5 h-5" />;
            activeBorder = 'border-cyber-neon bg-cyber-neon/10 text-cyber-neon';
            hoverBorder = 'hover:border-cyber-neon/60';
            badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
          }

          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.id)}
              disabled={isProcessing}
              className={`relative text-left p-4 rounded-lg border transition-all duration-200 group flex flex-col justify-between ${
                isSelected
                  ? `${activeBorder} shadow-lg ring-1 ring-cyber-accent/20`
                  : `bg-cyber-950/60 border-cyber-700/60 text-slate-300 ${hoverBorder} hover:bg-cyber-850`
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={isSelected ? '' : 'text-slate-400 group-hover:text-white'}>
                      {iconComponent}
                    </span>
                    <span className="font-semibold text-sm text-slate-100 group-hover:text-cyber-accent transition">
                      {scenario.name}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="flex h-2 w-2 rounded-full bg-cyber-accent animate-pulse" />
                  )}
                </div>

                <span className={`inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded border mb-2 font-medium ${badgeColor}`}>
                  {scenario.badge}
                </span>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-cyber-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{scenario.events.length} Telemetry Events</span>
                <span className="text-cyber-accent flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Load <Play className="w-2.5 h-2.5 fill-current" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
