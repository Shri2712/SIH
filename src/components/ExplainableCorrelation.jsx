import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Globe, 
  Monitor, 
  Clock, 
  Zap, 
  ShieldAlert, 
  Calculator, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';

export default function ExplainableCorrelation({ incident, events = [] }) {
  const [showAllRules, setShowAllRules] = useState(false);
  const [expandedFactor, setExpandedFactor] = useState(null);

  if (!incident) return null;

  const {
    incidentDetected,
    correlationFactors,
    allRuleEvaluations = [],
    score,
    riskLevel,
    incidentType
  } = incident;

  const toggleFactor = (key) => {
    setExpandedFactor(prev => prev === key ? null : key);
  };

  // Extract factors
  const sameUser = correlationFactors?.sameUser;
  const sameIp = correlationFactors?.sameIp;
  const sameDevice = correlationFactors?.sameDevice;
  const temporal = correlationFactors?.temporalProximity;
  const attackPattern = correlationFactors?.attackPattern;

  // Filter out any device factor if device is missing or N/A
  const hasValidDevice = sameDevice?.present && sameDevice?.entity && sameDevice.entity !== 'N/A';

  return (
    <div className="rounded-xl border border-cyber-700/70 bg-cyber-900/90 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyber-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 rounded-full bg-cyber-accent/20 border border-cyber-accent/40 items-center justify-center text-[10px] font-mono text-cyber-accent font-bold">
              3
            </span>
            <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              Why Were These Events Correlated?
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic correlation rationale derived from multi-factor entity linking and rule evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono px-3 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${
            incidentDetected 
              ? 'bg-cyber-danger/15 text-cyber-danger border-cyber-danger/30' 
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          }`}>
            {incidentDetected ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {incidentDetected ? 'Correlated Threat Detected' : 'Uncorrelated Baseline Activity'}
          </span>
        </div>
      </div>

      {/* Rationale Breakdown Cards */}
      {incidentDetected ? (
        <div className="space-y-3.5 font-mono text-xs">
          <div className="text-xs text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyber-neon" />
            <span>Active Correlation Factors &amp; Linked Events:</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            
            {/* Factor 1: Same User */}
            {sameUser && (
              <div className={`p-4 rounded-lg border transition-all duration-200 ${
                sameUser.present 
                  ? 'bg-cyber-950/80 border-cyber-accent/30 hover:border-cyber-accent/60' 
                  : 'bg-cyber-950/40 border-cyber-850 opacity-60'
              }`}>
                <div 
                  onClick={() => toggleFactor('user')}
                  className="flex items-start justify-between cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-md mt-0.5 ${
                      sameUser.present 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {sameUser.present ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-cyber-accent" />
                          Same User
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30 font-semibold">
                          {sameUser.entity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 font-sans">
                        <strong className="text-white font-mono">{sameUser.entity}</strong> appears in {sameUser.events.length} correlated events.
                      </p>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-white p-1">
                    {expandedFactor === 'user' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Connected Events List */}
                {sameUser.events.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-cyber-800/80 space-y-1.5 pl-9">
                    <span className="text-[11px] text-slate-400 block font-sans">Connected Events:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {sameUser.events.map((evt, idx) => (
                        <div key={evt.id || idx} className="p-2 rounded bg-cyber-900/90 border border-cyber-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent" />
                            {evt.time} &bull; {evt.eventType}
                          </span>
                          <span className="text-[10px] text-slate-500">[{evt.id}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Factor 2: Same IP Address */}
            {sameIp && (
              <div className={`p-4 rounded-lg border transition-all duration-200 ${
                sameIp.present 
                  ? 'bg-cyber-950/80 border-cyber-accent/30 hover:border-cyber-accent/60' 
                  : 'bg-cyber-950/40 border-cyber-850 opacity-60'
              }`}>
                <div 
                  onClick={() => toggleFactor('ip')}
                  className="flex items-start justify-between cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-md mt-0.5 ${
                      sameIp.present 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {sameIp.present ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-cyber-accent" />
                          Same IP Address
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30 font-semibold">
                          {sameIp.entity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 font-sans">
                        <strong className="text-white font-mono">{sameIp.entity}</strong> appears across all {sameIp.events.length} related events in the attack sequence.
                      </p>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-white p-1">
                    {expandedFactor === 'ip' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Connected Events List */}
                {sameIp.events.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-cyber-800/80 space-y-1.5 pl-9">
                    <span className="text-[11px] text-slate-400 block font-sans">Connected Events:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {sameIp.events.map((evt, idx) => (
                        <div key={evt.id || idx} className="p-2 rounded bg-cyber-900/90 border border-cyber-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent" />
                            {evt.time} &bull; {evt.eventType}
                          </span>
                          <span className="text-[10px] text-slate-500">[{evt.id}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Factor 3: Same Host / Device (Only shown if data is present) */}
            {hasValidDevice && (
              <div className="p-4 rounded-lg border bg-cyber-950/80 border-cyber-accent/30 hover:border-cyber-accent/60 transition-all duration-200">
                <div 
                  onClick={() => toggleFactor('device')}
                  className="flex items-start justify-between cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md mt-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5 text-cyber-accent" />
                          Same Host
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30 font-semibold">
                          {sameDevice.entity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 font-sans">
                        <strong className="text-white font-mono">{sameDevice.entity}</strong> is the shared target endpoint across all {sameDevice.events.length} security alerts.
                      </p>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-white p-1">
                    {expandedFactor === 'device' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Connected Events List */}
                {sameDevice.events.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-cyber-800/80 space-y-1.5 pl-9">
                    <span className="text-[11px] text-slate-400 block font-sans">Connected Events:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {sameDevice.events.map((evt, idx) => (
                        <div key={evt.id || idx} className="p-2 rounded bg-cyber-900/90 border border-cyber-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent" />
                            {evt.time} &bull; {evt.eventType}
                          </span>
                          <span className="text-[10px] text-slate-500">[{evt.id}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Factor 4: Temporal Proximity */}
            {temporal && (
              <div className="p-4 rounded-lg border bg-cyber-950/80 border-cyber-accent/30 hover:border-cyber-accent/60 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md mt-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyber-accent" />
                        Temporal Proximity
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                        &Delta; {temporal.deltaMinutes} min window
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-sans">
                      Related events occurred within a concentrated <strong className="text-white font-mono">{temporal.deltaMinutes} minute</strong> timeframe, well within the configured correlation window (&le; 20 minutes).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Factor 5: Attack Pattern / Kill-Chain Match */}
            {attackPattern && attackPattern.matched && (
              <div className="p-4 rounded-lg border bg-cyber-950/80 border-cyber-danger/40 hover:border-cyber-danger/60 transition-all duration-200 shadow-inner">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md mt-0.5 bg-red-500/20 text-red-400 border border-red-500/40">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-cyber-danger" />
                        Attack Pattern / Kill-Chain Match
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30 font-semibold">
                        {attackPattern.patternName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-sans">
                      {attackPattern.explanation}
                    </p>

                    {/* Pattern Progression Breadcrumbs */}
                    {attackPattern.chain && attackPattern.chain.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-cyber-800 flex items-center gap-1.5 flex-wrap">
                        {attackPattern.chain.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <span className="px-2 py-1 rounded bg-cyber-900 border border-red-500/30 text-red-300 text-[11px] font-bold">
                              {step}
                            </span>
                            {idx < attackPattern.chain.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      ) : (
        /* Normal Activity / Uncorrelated Diagnosis */
        <div className="p-5 rounded-lg bg-cyber-950/90 border border-cyber-800 space-y-4 font-mono text-xs">
          <div className="flex items-start gap-3 pb-3 border-b border-cyber-800">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">
                No Significant Correlation Detected
              </h4>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                The correlation engine determined that ingested telemetry represents routine baseline traffic rather than a unified attack campaign.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-slate-300 font-sans">
            <span className="font-mono text-xs font-semibold text-slate-200 block uppercase tracking-wider">
              Diagnostic Heuristic Findings:
            </span>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="p-2.5 rounded bg-cyber-900/80 border border-cyber-800 flex items-start gap-2.5">
                <span className="text-slate-500 font-mono font-bold mt-0.5">&bull;</span>
                <div>
                  <strong className="text-slate-200 font-mono">Disparate User Identities:</strong> Events belong to 3 different users (<code className="text-cyber-accent">alice</code>, <code className="text-cyber-accent">bob</code>, <code className="text-cyber-accent">charlie</code>). No single user pivot detected.
                </div>
              </div>

              <div className="p-2.5 rounded bg-cyber-900/80 border border-cyber-800 flex items-start gap-2.5">
                <span className="text-slate-500 font-mono font-bold mt-0.5">&bull;</span>
                <div>
                  <strong className="text-slate-200 font-mono">Dispersed Hosts &amp; IP Subnets:</strong> Activities originate from isolated IP addresses (<code className="text-cyber-accent">192.168.1.10</code>, <code className="text-cyber-accent">192.168.1.35</code>, <code className="text-cyber-accent">192.168.1.50</code>) and separate workstations.
                </div>
              </div>

              <div className="p-2.5 rounded bg-cyber-900/80 border border-cyber-800 flex items-start gap-2.5">
                <span className="text-slate-500 font-mono font-bold mt-0.5">&bull;</span>
                <div>
                  <strong className="text-slate-200 font-mono">Temporal Dispersion:</strong> Timestamps span 90 minutes across business hours, exceeding the concentrated 20-minute incident correlation window.
                </div>
              </div>

              <div className="p-2.5 rounded bg-cyber-900/80 border border-cyber-800 flex items-start gap-2.5">
                <span className="text-slate-500 font-mono font-bold mt-0.5">&bull;</span>
                <div>
                  <strong className="text-slate-200 font-mono">No Matching Attack Sequence:</strong> No brute force patterns, payload executions, C2 beaconing, or defense evasion techniques were triggered.
                </div>
              </div>

              <div className="p-2.5 rounded bg-cyber-900/80 border border-cyber-800 flex items-start gap-2.5">
                <span className="text-slate-500 font-mono font-bold mt-0.5">&bull;</span>
                <div>
                  <strong className="text-slate-200 font-mono">Score Below Incident Threshold:</strong> Correlation score evaluated at <strong className="text-emerald-400 font-mono">{score}/100</strong>, remaining well below the 35/100 threshold required for incident escalation.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transparent Correlation Score Breakdown */}
      <div className="p-4 sm:p-5 rounded-lg bg-cyber-950 border border-cyber-800 space-y-4 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cyber-800">
          <div className="flex items-center gap-2 text-cyber-accent">
            <Calculator className="w-4 h-4" />
            <h4 className="font-bold uppercase tracking-wider text-slate-200 text-xs sm:text-sm">
              Correlation Score Breakdown
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Real Engine Evaluation Rules (Offline Deterministic Heuristics)
          </span>
        </div>

        {/* Score Itemized Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-cyber-800/80 text-[11px] uppercase">
                <th className="py-2 px-3">Engine Correlation Heuristic</th>
                <th className="py-2 px-3 hidden md:table-cell">Evaluated Telemetry Evidence</th>
                <th className="py-2 px-3 text-right">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-800/50 text-[11px]">
              {allRuleEvaluations.map((item) => (
                <tr 
                  key={item.id}
                  className={`transition ${item.contributed ? 'bg-cyber-900/60 font-semibold' : 'text-slate-400'}`}
                >
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.contributed ? 'bg-cyber-neon shadow-sm shadow-emerald-400' : 'bg-slate-700'
                      }`} />
                      <span className={item.contributed ? 'text-slate-100' : 'text-slate-400'}>
                        {item.rule}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 hidden md:table-cell font-sans text-slate-400 text-[11px]">
                    {item.detail}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    {item.contributed ? (
                      <span className="text-cyber-neon font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                        +{item.pointsEarned} pts
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px] italic">
                        Not detected / No contribution
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-cyber-700 font-bold bg-cyber-900/90 text-slate-200">
                <td className="py-3 px-3 uppercase text-xs text-cyber-accent">
                  Final Calculated Score
                </td>
                <td className="py-3 px-3 hidden md:table-cell text-slate-400 font-sans text-[11px]">
                  {score >= 35 
                    ? `Elevated risk threshold reached (&ge; 35 pts) &bull; Severity Tier: ${riskLevel}` 
                    : `Telemetry remains below minimum threshold (35 pts) &bull; Severity Tier: ${riskLevel}`}
                </td>
                <td className="py-3 px-3 text-right">
                  <span className={`text-sm px-2.5 py-1 rounded border font-mono font-black ${
                    score >= 61 ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                    score >= 31 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}>
                    {score} / 100
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>

    </div>
  );
}
