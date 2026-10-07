import React, { useState } from 'react';
import { 
  User, 
  Globe, 
  Monitor, 
  Layers, 
  ArrowDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  RotateCcw,
  Zap,
  Shield,
  Unlink,
  Link2
} from 'lucide-react';

export default function EntityRelationshipView({ incident, events = [] }) {
  const [activeSelection, setActiveSelection] = useState(null); 
  // activeSelection: { type: 'user'|'ip'|'device'|'event', value: string } | null

  if (!incident) return null;

  const { incidentDetected, incidentType } = incident;

  // Extract distinct entities from actual events data
  const users = [...new Set(events.map(e => e.user).filter(Boolean))];
  const ips = [...new Set(events.map(e => e.ip).filter(Boolean))];
  const devices = [...new Set(events.map(e => e.device).filter(Boolean))];

  // Handle entity click
  const handleEntityClick = (type, value) => {
    if (activeSelection?.type === type && activeSelection?.value === value) {
      setActiveSelection(null);
    } else {
      setActiveSelection({ type, value });
    }
  };

  // Handle event click
  const handleEventClick = (eventId) => {
    if (activeSelection?.type === 'event' && activeSelection?.value === eventId) {
      setActiveSelection(null);
    } else {
      setActiveSelection({ type: 'event', value: eventId });
    }
  };

  // Check if an event is highlighted
  const isEventHighlighted = (evt) => {
    if (!activeSelection) return true; // All events active by default
    if (activeSelection.type === 'user') return evt.user === activeSelection.value;
    if (activeSelection.type === 'ip') return evt.ip === activeSelection.value;
    if (activeSelection.type === 'device') return evt.device === activeSelection.value;
    if (activeSelection.type === 'event') return evt.id === activeSelection.value;
    return false;
  };

  // Check if an entity is highlighted
  const isEntityHighlighted = (type, value) => {
    if (!activeSelection) return true; // All entities active by default
    if (activeSelection.type === type && activeSelection.value === value) return true;
    if (activeSelection.type === 'event') {
      const targetEvent = events.find(e => e.id === activeSelection.value);
      if (!targetEvent) return false;
      if (type === 'user') return targetEvent.user === value;
      if (type === 'ip') return targetEvent.ip === value;
      if (type === 'device') return targetEvent.device === value;
    }
    return false;
  };

  // Get active filter description
  const getFilterDescription = () => {
    if (!activeSelection) {
      return 'Showing full relational graph. Click any entity or event node to isolate connected telemetry.';
    }
    if (activeSelection.type === 'user') {
      const matchCount = events.filter(e => e.user === activeSelection.value).length;
      return `Filtering by User [👤 ${activeSelection.value}] — ${matchCount} connected events highlighted.`;
    }
    if (activeSelection.type === 'ip') {
      const matchCount = events.filter(e => e.ip === activeSelection.value).length;
      return `Filtering by Origin IP [🌐 ${activeSelection.value}] — ${matchCount} connected events highlighted.`;
    }
    if (activeSelection.type === 'device') {
      const matchCount = events.filter(e => e.device === activeSelection.value).length;
      return `Filtering by Host Device [💻 ${activeSelection.value}] — ${matchCount} connected events highlighted.`;
    }
    if (activeSelection.type === 'event') {
      const evt = events.find(e => e.id === activeSelection.value);
      return `Inspecting Event [⚡ ${evt?.eventType || activeSelection.value}] — Connected to User (${evt?.user}), IP (${evt?.ip}), Host (${evt?.device}).`;
    }
    return '';
  };

  const getSeverityBadge = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="rounded-xl border border-cyber-700/70 bg-cyber-900/90 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyber-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 rounded-full bg-cyber-accent/20 border border-cyber-accent/40 items-center justify-center text-[10px] font-mono text-cyber-accent font-bold">
              4
            </span>
            <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              Entity Relationship
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual pivot matrix demonstrating why security events belong to the same incident or remain isolated.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSelection && (
            <button
              onClick={() => setActiveSelection(null)}
              className="text-xs font-mono px-3 py-1 rounded bg-cyber-800 hover:bg-cyber-700 border border-cyber-600 text-slate-200 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3 h-3 text-cyber-accent" />
              Reset Highlight
            </button>
          )}
          <span className="text-[11px] font-mono text-slate-400 bg-cyber-950 px-2.5 py-1 rounded border border-cyber-800">
            Interactive Graph
          </span>
        </div>
      </div>

      {/* Interactive Helper Banner */}
      <div className={`p-3 rounded-lg border font-mono text-xs flex items-center justify-between gap-3 transition-all ${
        activeSelection 
          ? 'bg-cyber-accent/10 border-cyber-accent/40 text-cyber-accent' 
          : 'bg-cyber-950/70 border-cyber-800 text-slate-400'
      }`}>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 flex-shrink-0" />
          <span className="font-sans text-xs">{getFilterDescription()}</span>
        </div>
        {activeSelection && (
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyber-accent/20 border border-cyber-accent/30 text-white whitespace-nowrap">
            Click node to toggle
          </span>
        )}
      </div>

      {/* Graph Visualizations */}
      {incidentDetected ? (
        /* Correlated Incident Graph (Account Compromise & Malware Activity) */
        <div className="p-5 md:p-8 rounded-xl bg-cyber-950/90 border border-cyber-800 flex flex-col items-center space-y-6 relative overflow-hidden">
          
          {/* Cyber Background Accents */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyber-accent/5 via-transparent to-red-500/5 pointer-events-none" />

          {/* Level 1: Primary User Identity Node */}
          <div className="flex flex-col items-center z-10">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
              Root Identity Vector
            </span>
            {users.map(u => {
              const isSelected = activeSelection?.type === 'user' && activeSelection?.value === u;
              const isHighlighted = isEntityHighlighted('user', u);
              const eventCount = events.filter(e => e.user === u).length;

              return (
                <div
                  key={u}
                  onClick={() => handleEntityClick('user', u)}
                  className={`cursor-pointer px-5 py-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 shadow-lg ${
                    isSelected
                      ? 'bg-cyber-accent/20 border-cyber-accent text-white scale-105 shadow-cyber-accent/40 ring-4 ring-cyber-accent/20'
                      : isHighlighted
                      ? 'bg-cyber-900 border-cyber-accent/60 text-slate-100 hover:border-cyber-accent hover:scale-102'
                      : 'bg-cyber-900/40 border-cyber-850 text-slate-500 opacity-40 hover:opacity-80'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected || isHighlighted ? 'bg-cyber-accent/20 text-cyber-accent' : 'bg-slate-800 text-slate-500'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400 block font-normal">Correlated User</span>
                    <strong className="text-sm font-mono font-bold tracking-wide">{u}</strong>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-950 border border-cyber-700 text-cyber-accent font-bold">
                    {eventCount} Events
                  </span>
                </div>
              );
            })}
          </div>

          {/* Connecting Branch Lines to IP and Host */}
          <div className="w-full max-w-md flex items-center justify-center relative py-1 z-0">
            <div className="w-0.5 h-6 bg-cyber-accent/50 absolute top-0 left-1/2 -translate-x-1/2" />
            <div className="w-3/4 h-0.5 bg-cyber-accent/40 mt-6" />
          </div>

          {/* Level 2: IP Address & Device Host Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 w-full max-w-xl z-10">
            
            {/* Origin IP Node */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                Origin / Network Address
              </span>
              {ips.map(ip => {
                const isSelected = activeSelection?.type === 'ip' && activeSelection?.value === ip;
                const isHighlighted = isEntityHighlighted('ip', ip);
                const eventCount = events.filter(e => e.ip === ip).length;

                return (
                  <div
                    key={ip}
                    onClick={() => handleEntityClick('ip', ip)}
                    className={`w-full cursor-pointer p-3.5 rounded-xl border-2 transition-all duration-300 flex items-center justify-between gap-2.5 shadow-md ${
                      isSelected
                        ? 'bg-cyber-accent/20 border-cyber-accent text-white scale-105 shadow-cyber-accent/30 ring-4 ring-cyber-accent/20'
                        : isHighlighted
                        ? 'bg-cyber-900 border-cyber-accent/50 text-slate-100 hover:border-cyber-accent hover:scale-102'
                        : 'bg-cyber-900/40 border-cyber-850 text-slate-500 opacity-40 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-md ${isSelected || isHighlighted ? 'bg-cyber-accent/20 text-cyber-accent' : 'bg-slate-800 text-slate-500'}`}>
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">Correlated IP</span>
                        <strong className="text-xs font-mono">{ip}</strong>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-950 border border-cyber-700 text-cyber-accent">
                      {eventCount} Events
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Target Host Device Node (Only if present in data) */}
            {devices.length > 0 && devices[0] !== 'N/A' && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                  Target Host Endpoint
                </span>
                {devices.map(device => {
                  const isSelected = activeSelection?.type === 'device' && activeSelection?.value === device;
                  const isHighlighted = isEntityHighlighted('device', device);
                  const eventCount = events.filter(e => e.device === device).length;

                  return (
                    <div
                      key={device}
                      onClick={() => handleEntityClick('device', device)}
                      className={`w-full cursor-pointer p-3.5 rounded-xl border-2 transition-all duration-300 flex items-center justify-between gap-2.5 shadow-md ${
                        isSelected
                          ? 'bg-cyber-accent/20 border-cyber-accent text-white scale-105 shadow-cyber-accent/30 ring-4 ring-cyber-accent/20'
                          : isHighlighted
                          ? 'bg-cyber-900 border-cyber-accent/50 text-slate-100 hover:border-cyber-accent hover:scale-102'
                          : 'bg-cyber-900/40 border-cyber-850 text-slate-500 opacity-40 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-md ${isSelected || isHighlighted ? 'bg-cyber-accent/20 text-cyber-accent' : 'bg-slate-800 text-slate-500'}`}>
                          <Monitor className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block">Host Machine</span>
                          <strong className="text-xs font-mono">{device}</strong>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-950 border border-cyber-700 text-cyber-accent">
                        {eventCount} Events
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Level 3: Connector Bridge to Events */}
          <div className="flex flex-col items-center z-10 my-2">
            <div className="w-0.5 h-6 bg-cyber-accent/40" />
            <div className="px-4 py-1.5 rounded-full bg-cyber-900 border border-cyber-accent/40 text-cyber-accent text-xs font-mono font-bold flex items-center gap-2 shadow-inner">
              <Link2 className="w-3.5 h-3.5" />
              <span>Correlated Ingested Security Events ({events.length} Total)</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <div className="w-0.5 h-6 bg-cyber-accent/40" />
          </div>

          {/* Level 4: Connected Security Events Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 z-10 font-mono">
            {events.map((evt, idx) => {
              const isSelected = activeSelection?.type === 'event' && activeSelection?.value === evt.id;
              const isHighlighted = isEventHighlighted(evt);

              return (
                <div
                  key={evt.id}
                  onClick={() => handleEventClick(evt.id)}
                  className={`p-3.5 rounded-xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-red-950/40 border-cyber-danger text-white scale-102 shadow-lg shadow-red-950/40 ring-4 ring-red-500/20'
                      : isHighlighted
                      ? 'bg-cyber-900/90 border-cyber-800 text-slate-200 hover:border-cyber-accent/60 hover:bg-cyber-850'
                      : 'bg-cyber-900/30 border-cyber-850 text-slate-500 opacity-40 hover:opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {evt.time} &bull; #{idx + 1}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${getSeverityBadge(evt.severity)}`}>
                        {evt.severity}
                      </span>
                    </div>

                    <h5 className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyber-danger' : 'bg-cyber-accent'}`} />
                      {evt.eventType}
                    </h5>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {evt.category}
                    </p>
                  </div>

                  {/* Connected Entity Badges */}
                  <div className="pt-2 border-t border-cyber-800/80 flex items-center gap-2 flex-wrap text-[10px] text-slate-400">
                    <span className={`px-1.5 py-0.5 rounded bg-cyber-950 border ${
                      isEntityHighlighted('user', evt.user) ? 'border-cyber-accent/40 text-cyber-accent' : 'border-cyber-800 text-slate-500'
                    }`}>
                      👤 {evt.user}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded bg-cyber-950 border ${
                      isEntityHighlighted('ip', evt.ip) ? 'border-cyber-accent/40 text-cyber-accent' : 'border-cyber-800 text-slate-500'
                    }`}>
                      🌐 {evt.ip}
                    </span>
                    {evt.device && (
                      <span className={`px-1.5 py-0.5 rounded bg-cyber-950 border ${
                        isEntityHighlighted('device', evt.device) ? 'border-cyber-accent/40 text-cyber-accent' : 'border-cyber-800 text-slate-500'
                      }`}>
                        💻 {evt.device}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* Normal Activity: Disconnected Entity Clusters */
        <div className="p-5 md:p-6 rounded-xl bg-cyber-950/90 border border-cyber-800 space-y-6">
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-900 border border-cyber-800 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400">
              <Unlink className="w-4 h-4" />
              <strong className="font-semibold">Isolated Baseline Clusters:</strong>
            </div>
            <span className="text-slate-400 text-[11px]">
              0 Inter-Entity Pivot Linkages &bull; No Overlapping Incident Graph
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((evt, idx) => {
              const isSelected = (activeSelection?.type === 'user' && activeSelection?.value === evt.user) ||
                                (activeSelection?.type === 'ip' && activeSelection?.value === evt.ip) ||
                                (activeSelection?.type === 'device' && activeSelection?.value === evt.device) ||
                                (activeSelection?.type === 'event' && activeSelection?.value === evt.id);
              const isHighlighted = isEventHighlighted(evt);

              return (
                <div
                  key={evt.id}
                  onClick={() => handleEventClick(evt.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-emerald-950/30 border-cyber-neon text-white ring-4 ring-emerald-500/20 scale-102 shadow-lg shadow-emerald-950/30'
                      : isHighlighted
                      ? 'bg-cyber-900/80 border-cyber-800 hover:border-emerald-500/40 text-slate-200'
                      : 'bg-cyber-900/30 border-cyber-850 opacity-40 hover:opacity-80'
                  }`}
                >
                  {/* Entity Header */}
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyber-800">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                        Isolated Unit 0{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                        Baseline Routine
                      </span>
                    </div>

                    {/* Isolated Entities */}
                    <div className="space-y-1.5 font-mono text-xs mb-3">
                      <div 
                        onClick={(e) => { e.stopPropagation(); handleEntityClick('user', evt.user); }}
                        className="p-1.5 rounded bg-cyber-950 border border-cyber-800 flex items-center gap-2 hover:border-cyber-accent transition"
                      >
                        <User className="w-3.5 h-3.5 text-cyber-accent" />
                        <span className="text-slate-400 text-[10px]">User:</span>
                        <strong className="text-slate-200">{evt.user}</strong>
                      </div>

                      <div 
                        onClick={(e) => { e.stopPropagation(); handleEntityClick('ip', evt.ip); }}
                        className="p-1.5 rounded bg-cyber-950 border border-cyber-800 flex items-center gap-2 hover:border-cyber-accent transition"
                      >
                        <Globe className="w-3.5 h-3.5 text-cyber-accent" />
                        <span className="text-slate-400 text-[10px]">IP:</span>
                        <strong className="text-slate-200">{evt.ip}</strong>
                      </div>

                      <div 
                        onClick={(e) => { e.stopPropagation(); handleEntityClick('device', evt.device); }}
                        className="p-1.5 rounded bg-cyber-950 border border-cyber-800 flex items-center gap-2 hover:border-cyber-accent transition"
                      >
                        <Monitor className="w-3.5 h-3.5 text-cyber-accent" />
                        <span className="text-slate-400 text-[10px]">Host:</span>
                        <strong className="text-slate-200">{evt.device}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Associated Event */}
                  <div className="p-3 rounded-lg bg-cyber-950/90 border border-cyber-800 font-mono">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>{evt.time}</span>
                      <span className="text-emerald-400 font-semibold">{evt.severity}</span>
                    </div>
                    <h6 className="font-bold text-xs text-slate-200">
                      {evt.eventType}
                    </h6>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {evt.rawDetails}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded bg-cyber-900/60 border border-cyber-800/80 text-center text-xs font-mono text-slate-400">
            ✓ Entities do NOT share users, IP addresses, or hosts &bull; Events remain unmerged independent telemetry points.
          </div>

        </div>
      )}

    </div>
  );
}
