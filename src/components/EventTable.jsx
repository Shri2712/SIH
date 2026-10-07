import React, { useState } from 'react';
import { 
  Clock, 
  User, 
  Globe, 
  Monitor, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ChevronRight, 
  Code, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function EventTable({ events, correlatedEventIds, isCorrelated }) {
  const [selectedEventId, setSelectedEventId] = useState(null);

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'low':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="bg-cyber-900/80 border border-cyber-700/60 rounded-xl p-5 shadow-xl backdrop-blur-sm">
      
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-cyber-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 rounded-full bg-cyber-accent/20 border border-cyber-accent/40 items-center justify-center text-[10px] font-mono text-cyber-accent font-bold">2</span>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              Ingested Security Events
              <span className="text-xs font-normal text-slate-400 font-sans">
                ({events.length} total)
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Initial state shows disparate, unlinked telemetry alerts in the ingestion queue.
          </p>
        </div>

        {isCorrelated && (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-cyber-accent/15 border border-cyber-accent/30 text-cyber-accent text-xs font-mono flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              {correlatedEventIds.length > 0 ? `${correlatedEventIds.length} Correlated Nodes Highlighted` : 'No Correlated Nodes'}
            </span>
          </div>
        )}
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto rounded-lg border border-cyber-800 bg-cyber-950/70">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-cyber-900/90 text-slate-400 font-mono uppercase tracking-wider border-b border-cyber-800">
              <th className="py-3 px-3.5 w-16 text-center">Status</th>
              <th className="py-3 px-3.5">Timestamp</th>
              <th className="py-3 px-3.5">Security Event</th>
              <th className="py-3 px-3.5">Identity / IP</th>
              <th className="py-3 px-3.5 hidden md:table-cell">Device / Host</th>
              <th className="py-3 px-3.5">Severity</th>
              <th className="py-3 px-3.5 text-right">Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-800/60 font-mono">
            {events.map((evt, idx) => {
              const isEventCorrelated = isCorrelated && correlatedEventIds.includes(evt.id);
              const isSelected = selectedEventId === evt.id;

              return (
                <tr 
                  key={evt.id}
                  onClick={() => setSelectedEventId(isSelected ? null : evt.id)}
                  className={`transition-all duration-200 cursor-pointer ${
                    isEventCorrelated
                      ? 'bg-cyber-accent/5 hover:bg-cyber-accent/10 border-l-4 border-l-cyber-accent'
                      : 'hover:bg-cyber-850/60 border-l-4 border-l-transparent'
                  } ${isSelected ? 'bg-cyber-800/80 ring-1 ring-cyber-accent/30' : ''}`}
                >
                  {/* Status Indicator */}
                  <td className="py-3 px-3.5 text-center">
                    {isEventCorrelated ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cyber-danger/20 text-cyber-danger border border-cyber-danger/40 animate-pulse" title="Linked to Correlated Incident">
                        <AlertTriangle className="w-3 h-3" />
                      </span>
                    ) : isCorrelated ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Independent Baseline Event">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                        {idx + 1}
                      </span>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-3.5 text-slate-300 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {evt.time}
                  </td>

                  {/* Event Name */}
                  <td className="py-3 px-3.5">
                    <div className="flex flex-col">
                      <span className={`font-semibold text-xs ${isEventCorrelated ? 'text-cyber-accent font-bold' : 'text-slate-200'}`}>
                        {evt.eventType}
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        {evt.category}
                      </span>
                    </div>
                  </td>

                  {/* Identity / IP */}
                  <td className="py-3 px-3.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 text-slate-300">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{evt.user || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Globe className="w-3 h-3 text-slate-500" />
                        <span>{evt.ip || 'N/A'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Device / Host */}
                  <td className="py-3 px-3.5 text-slate-400 hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-slate-500" />
                      <span>{evt.device || 'N/A'}</span>
                    </div>
                  </td>

                  {/* Severity */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[10px] uppercase rounded border font-semibold ${getSeverityBadge(evt.severity)}`}>
                      {evt.severity || 'Info'}
                    </span>
                  </td>

                  {/* Details Toggle */}
                  <td className="py-3 px-3.5 text-right">
                    <button 
                      className="p-1 rounded hover:bg-cyber-800 text-slate-400 hover:text-cyber-accent transition"
                      title="Inspect Raw Log Details"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Raw Log Drawer / Inspector Modal */}
      {selectedEvent && (
        <div className="mt-4 p-4 rounded-lg bg-cyber-950 border border-cyber-accent/30 font-mono text-xs animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyber-800">
            <div className="flex items-center gap-2 text-cyber-accent font-semibold">
              <Code className="w-4 h-4" />
              <span>Raw Telemetry Payload: [{selectedEvent.id}]</span>
            </div>
            <button 
              onClick={() => setSelectedEventId(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-cyber-850"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
            <div>
              <span className="text-slate-500">Event Signature:</span> {selectedEvent.eventType}
            </div>
            <div>
              <span className="text-slate-500">Category:</span> {selectedEvent.category}
            </div>
            <div>
              <span className="text-slate-500">User / Identity:</span> {selectedEvent.user} ({selectedEvent.ip})
            </div>
            <div>
              <span className="text-slate-500">Host Device:</span> {selectedEvent.device}
            </div>
            <div className="md:col-span-2 bg-cyber-900 p-2.5 rounded border border-cyber-800 text-emerald-400">
              <span className="text-slate-400 block mb-1 text-[11px] font-sans">Raw Log Message:</span>
              <code>{selectedEvent.rawDetails || 'No additional raw log metadata attached.'}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
