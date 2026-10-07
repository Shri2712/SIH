import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Globe, 
  Monitor, 
  Layers, 
  Sparkles, 
  ListChecks, 
  Bot, 
  Calculator, 
  Share2, 
  CheckSquare, 
  Square,
  Copy,
  Check,
  Zap,
  ChevronRight
} from 'lucide-react';
import AttackChainFlow from './AttackChainFlow';
import ExplainableCorrelation from './ExplainableCorrelation';
import EntityRelationshipView from './EntityRelationshipView';

export default function IncidentResult({ incident, events = [], aiInsight, onOpenScoreModal }) {
  const [completedActions, setCompletedActions] = useState({});
  const [copied, setCopied] = useState(false);

  if (!incident) return null;

  const toggleAction = (idx) => {
    setCompletedActions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const copyIncidentSummary = () => {
    const text = `CYBER CORRELATION AGENT REPORT\n` +
      `Incident: ${incident.title}\n` +
      `Risk Level: ${incident.riskLevel} (${incident.score}/100)\n` +
      `Affected User: ${incident.affectedEntities.user}\n` +
      `Affected IP: ${incident.affectedEntities.ip}\n` +
      `Affected Host: ${incident.affectedEntities.device}\n` +
      `Detection Reason: ${incident.detectionReason}\n\n` +
      `Recommended Actions:\n` +
      incident.recommendedActions.map((a, i) => `${i + 1}. [${a.priority}] ${a.action} - ${a.detail}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHighRisk = incident.riskLevel === 'HIGH';
  const isMediumRisk = incident.riskLevel === 'MEDIUM';
  const isLowRisk = incident.riskLevel === 'LOW' || !incident.incidentDetected;

  let themeHeader = 'border-red-500/50 bg-red-950/20 text-red-100';
  let iconComponent = <ShieldAlert className="w-8 h-8 text-cyber-danger animate-pulse" />;
  let badgeColor = 'bg-red-500/20 text-red-300 border-red-500/40';

  if (isMediumRisk) {
    themeHeader = 'border-amber-500/50 bg-amber-950/20 text-amber-100';
    iconComponent = <AlertTriangle className="w-8 h-8 text-cyber-warning animate-pulse" />;
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else if (isLowRisk) {
    themeHeader = 'border-emerald-500/50 bg-emerald-950/20 text-emerald-100';
    iconComponent = <CheckCircle2 className="w-8 h-8 text-cyber-neon" />;
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ================================================== */}
      {/* 1. CORRELATED INCIDENT HEADER BANNER */}
      {/* ================================================== */}
      <div className={`rounded-xl border shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300 ${
        isHighRisk ? 'border-cyber-danger/60 bg-cyber-900/90 shadow-red-950/40' :
        isMediumRisk ? 'border-cyber-warning/60 bg-cyber-900/90 shadow-amber-950/40' :
        'border-cyber-neon/60 bg-cyber-900/90 shadow-emerald-950/40'
      }`}>
        <div className={`p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${themeHeader}`}>
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-cyber-950/80 border border-cyber-700/60 shadow-inner">
              {iconComponent}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${badgeColor}`}>
                  Risk Level: {incident.riskLevel}
                </span>
                <span className="text-xs font-mono text-slate-300 bg-cyber-950/80 px-2.5 py-0.5 rounded border border-cyber-700">
                  Correlated Events: <strong className="text-cyber-accent">{incident.correlatedCount}</strong> / {incident.eventsAnalyzed}
                </span>
                <button
                  onClick={onOpenScoreModal}
                  className="text-[11px] font-mono text-cyber-accent hover:underline flex items-center gap-1 bg-cyber-950/90 px-2.5 py-0.5 rounded border border-cyber-accent/30"
                  title="View Scoring Matrix Modal"
                >
                  <Calculator className="w-3 h-3" />
                  Score: {incident.score}/100
                </button>
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white font-mono flex items-center gap-2">
                {incident.title}
              </h2>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={copyIncidentSummary}
              className="px-3 py-2 rounded-lg bg-cyber-950 hover:bg-cyber-850 border border-cyber-700 text-slate-200 flex items-center gap-1.5 transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-cyber-neon" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Export Summary'}</span>
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* 2. RISK / CORRELATION SCORE & ENTITY HIGHLIGHTS */}
        {/* ================================================== */}
        <div className="p-5 md:p-6 bg-cyber-950/60 border-b border-cyber-800 space-y-4">
          
          {/* Affected Entity Pills */}
          {incident.incidentDetected ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-cyber-900/90 border border-cyber-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-cyber-800 flex items-center justify-center text-cyber-accent">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Affected User</span>
                  <span className="font-semibold text-slate-100 text-xs">{incident.affectedEntities.user}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyber-900/90 border border-cyber-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-cyber-800 flex items-center justify-center text-cyber-accent">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Origin / Affected IP</span>
                  <span className="font-semibold text-slate-100 text-xs">{incident.affectedEntities.ip}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyber-900/90 border border-cyber-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-cyber-800 flex items-center justify-center text-cyber-accent">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Target Host</span>
                  <span className="font-semibold text-slate-100 text-xs">{incident.affectedEntities.device}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyber-neon" />
              <span>Standard Operational Telemetry Baseline &bull; No High-Risk Correlated Incidents Detected</span>
            </div>
          )}

          {/* Detection Reason Banner */}
          <div className="p-4 rounded-lg bg-cyber-900/80 border border-cyber-800">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyber-accent" />
              Heuristic Correlation Synthesis:
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {incident.detectionReason}
            </p>
          </div>

        </div>
      </div>

      {/* ================================================== */}
      {/* 3. WHY WERE THESE EVENTS CORRELATED? */}
      {/* ================================================== */}
      <ExplainableCorrelation 
        incident={incident} 
        events={events} 
      />

      {/* ================================================== */}
      {/* 4. ENTITY RELATIONSHIP */}
      {/* ================================================== */}
      <EntityRelationshipView 
        incident={incident} 
        events={events} 
      />

      {/* ================================================== */}
      {/* 5. ATTACK PROGRESSION TIMELINE */}
      {/* ================================================== */}
      <div className="rounded-xl border border-cyber-700/70 bg-cyber-900/90 p-5 md:p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2 pb-3 border-b border-cyber-800">
          <span className="flex h-5 w-5 rounded-full bg-cyber-accent/20 border border-cyber-accent/40 items-center justify-center text-[10px] font-mono text-cyber-accent font-bold">
            5
          </span>
          <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
            Attack Progression Timeline
          </h3>
        </div>
        <AttackChainFlow steps={incident.timelineFlow} incidentType={incident.incidentType} />
      </div>

      {/* ================================================== */}
      {/* 6. MITRE ATT&CK / AI THREAT INTELLIGENCE ADVISOR */}
      {/* ================================================== */}
      <div className="rounded-xl border border-cyber-700/70 bg-cyber-900/90 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-4 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cyber-800">
          <div className="flex items-center gap-2 text-cyber-neon font-semibold">
            <span className="flex h-5 w-5 rounded-full bg-cyber-neon/20 border border-cyber-neon/40 items-center justify-center text-[10px] font-mono text-cyber-neon font-bold">
              6
            </span>
            <Sparkles className="w-4 h-4 text-cyber-neon" />
            <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-white">
              MITRE ATT&CK® &amp; AI Advisor
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 bg-cyber-950 px-2.5 py-1 rounded border border-cyber-800">
            Source: {aiInsight?.source || 'Cyber AI Advisor Engine'}
          </span>
        </div>

        {/* AI Summary */}
        <div className="p-4 rounded-lg bg-cyber-950 border border-cyber-800">
          <span className="text-cyber-accent text-[11px] font-bold block mb-1.5 uppercase tracking-wider">
            Executive Incident Briefing
          </span>
          <p className="text-slate-300 font-sans text-xs sm:text-sm leading-relaxed">
            {aiInsight?.summary || 'Generating incident analysis...'}
          </p>
        </div>

        {/* MITRE ATT&CK Matrix Mapping */}
        <div className="p-4 rounded-lg bg-cyber-950 border border-cyber-800">
          <span className="text-cyber-warning text-[11px] font-bold block mb-2 uppercase tracking-wider">
            Correlated MITRE ATT&CK® Techniques
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {aiInsight?.mitreTactics?.map((tactic, idx) => (
              <div key={idx} className="p-2.5 rounded bg-cyber-900 border border-cyber-800 text-slate-300 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-warning flex-shrink-0" />
                <span>{tactic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Reasoning */}
        <div className="p-4 rounded-lg bg-cyber-950 border border-cyber-800">
          <span className="text-cyber-danger text-[11px] font-bold block mb-1.5 uppercase tracking-wider">
            Threat Severity Reasoning
          </span>
          <p className="text-slate-300 font-sans text-xs leading-relaxed">
            {aiInsight?.threatSeverityReasoning}
          </p>
        </div>
      </div>

      {/* ================================================== */}
      {/* 7. RESPONSE CHECKLIST */}
      {/* ================================================== */}
      <div className="rounded-xl border border-cyber-700/70 bg-cyber-900/90 p-5 md:p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyber-800">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 rounded-full bg-cyber-accent/20 border border-cyber-accent/40 items-center justify-center text-[10px] font-mono text-cyber-accent font-bold">
              7
            </span>
            <ListChecks className="w-4 h-4 text-cyber-neon" />
            <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-white font-mono">
              Recommended SOC Incident Response Actions
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-cyber-950 px-2.5 py-1 rounded border border-cyber-800">
            {Object.values(completedActions).filter(Boolean).length} / {incident.recommendedActions.length} Completed
          </span>
        </div>

        <div className="space-y-2.5">
          {incident.recommendedActions.map((action, idx) => {
            const isChecked = !!completedActions[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleAction(idx)}
                className={`p-3.5 rounded-lg border transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'bg-cyber-900/40 border-emerald-500/30 opacity-70'
                    : 'bg-cyber-950 border-cyber-800 hover:border-cyber-700'
                }`}
              >
                <button className="mt-0.5 text-cyber-neon focus:outline-none">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-cyber-neon" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                <div className="flex-1 font-mono">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      action.priority === 'P1' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      action.priority === 'P2' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {action.priority || 'Action'}
                    </span>
                    <span className={`text-xs font-semibold ${isChecked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {action.action}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    {action.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

