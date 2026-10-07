import React from 'react';
import { ShieldCheck, Activity, Terminal, Sparkles, Cpu } from 'lucide-react';

export default function Header({ totalEvents, isCorrelated, onReset, activeTab, setActiveTab }) {
  return (
    <header className="border-b border-cyber-700/60 bg-cyber-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyber-800 border border-cyber-accent/40 flex items-center justify-center text-cyber-accent shadow-lg shadow-cyber-accent/10">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-mono">
                CYBER CORRELATION AGENT
              </h1>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30 font-semibold">
                v1.1 POC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Multi-Event Heuristic & Attack Chain Correlation Engine
            </p>
          </div>
        </div>

        {/* Middle: Tab Navigation */}
        <div className="flex items-center gap-1 bg-cyber-950/80 p-1 rounded-lg border border-cyber-800 self-center md:self-auto">
          <button
            onClick={() => setActiveTab('correlation')}
            className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all duration-150 flex items-center gap-2 ${
              activeTab === 'correlation'
                ? 'bg-cyber-accent text-cyber-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Correlation Agent
          </button>
          <button
            onClick={() => setActiveTab('forecasting')}
            className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all duration-150 flex items-center gap-2 ${
              activeTab === 'forecasting'
                ? 'bg-cyber-accent text-cyber-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Threat Forecasting
          </button>
        </div>

        {/* Right: Telemetry Indicators */}
        <div className="flex items-center gap-3 text-xs font-mono justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyber-950 border border-cyber-700/70 text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-neon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-neon"></span>
            </span>
            <span>AGENT: <strong className="text-cyber-neon">ACTIVE</strong></span>
          </div>

          <div className="px-3 py-1.5 rounded-md bg-cyber-950 border border-cyber-700/70 text-slate-300">
            LOADED EVENTS: <strong className="text-cyber-accent">{totalEvents}</strong>
          </div>

          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-md bg-cyber-800/80 hover:bg-cyber-700 border border-cyber-600/60 text-slate-200 transition text-xs flex items-center gap-1.5"
            title="Reset to default state"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            Reset
          </button>
        </div>

      </div>
    </header>
  );
}
