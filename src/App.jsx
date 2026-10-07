import React, { useState, useEffect } from 'react';
import { SCENARIOS } from './data/scenarios';
import { analyzeAndCorrelateEvents } from './logic/correlationEngine';
import { generateAIIncidentAnalysis } from './services/aiAdvisor';
import Header from './components/Header';
import ScenarioSelector from './components/ScenarioSelector';
import EventTable from './components/EventTable';
import CorrelationScanner from './components/CorrelationScanner';
import IncidentResult from './components/IncidentResult';
import ScoringBreakdownModal from './components/ScoringBreakdownModal';
import NetworkThreatForecasting from './components/NetworkThreatForecasting';
import { Shield, Sparkles, AlertCircle, Terminal, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('correlation');
  const [selectedScenarioId, setSelectedScenarioId] = useState('account_compromise');
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCorrelated, setIsCorrelated] = useState(false);
  const [correlationResult, setCorrelationResult] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  // Initialize with selected scenario
  useEffect(() => {
    loadScenario(selectedScenarioId);
  }, []);

  const loadScenario = (scenarioId) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) {
      setSelectedScenarioId(scenarioId);
      setCurrentEvents([...scenario.events]);
      setIsCorrelated(false);
      setCorrelationResult(null);
      setAiInsight(null);
    }
  };

  const handleScenarioChange = (scenarioId) => {
    if (isProcessing) return;
    loadScenario(scenarioId);
  };

  const handleStartAnalysis = async () => {
    if (isProcessing || currentEvents.length === 0) return;
    
    setIsProcessing(true);
    setIsCorrelated(false);
    setCorrelationResult(null);

    // Simulate multi-stage correlation pipeline
    setTimeout(async () => {
      const result = analyzeAndCorrelateEvents(currentEvents);
      setCorrelationResult(result);
      setIsCorrelated(true);
      setIsProcessing(false);

      // Trigger AI Threat Intelligence Insight
      const aiResponse = await generateAIIncidentAnalysis(result, currentEvents);
      setAiInsight(aiResponse);
    }, 2400);
  };

  const handleReset = () => {
    loadScenario('account_compromise');
    setActiveTab('correlation');
  };

  const handleInjectMLEvent = (mlSignal) => {
    // Construct a standardized ML_NETWORK_THREAT_DETECTED security event
    const newEvent = {
      id: `evt-ml-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Math.floor(Date.now() / 1000),
      eventType: 'ML_NETWORK_THREAT_DETECTED',
      user: 'N/A (Subnet Flow)',
      ip: mlSignal.anomalousIp || '10.0.0.99',
      device: 'N/A (Network Traffic)',
      category: 'Network Threat Alert',
      severity: mlSignal.riskLevel === 'HIGH' ? 'High' : (mlSignal.riskLevel === 'MEDIUM' ? 'Medium' : 'Low'),
      source: 'ML Threat Forecasting Module',
      detectedPattern: mlSignal.detectedPattern || 'Suspicious Traffic Profile',
      threatLikelihood: mlSignal.threatLikelihood,
      confidence: mlSignal.confidence,
      riskLevel: mlSignal.riskLevel,
      maliciousFlowsCount: mlSignal.maliciousFlowsCount || 0,
      rawDetails: `ML Threat Warning from ML Threat Forecasting Module: Detected Pattern: ${mlSignal.detectedPattern || 'Suspicious Traffic Profile'}. Threat Likelihood: ${Math.round(mlSignal.threatLikelihood * 100)}%, Risk Level: ${mlSignal.riskLevel}, Classifier Confidence: ${Math.round(mlSignal.confidence * 100)}%, Malicious Flows: ${mlSignal.maliciousFlowsCount}.`
    };

    // Use functional updater to avoid stale closure on currentEvents
    // The ML event becomes the ONLY event so correlation evaluates it standalone
    const mlEvents = [newEvent];
    setCurrentEvents(mlEvents);
    setIsCorrelated(false);
    setCorrelationResult(null);
    setAiInsight(null);
    setActiveTab('correlation');

    // Automatically trigger the full correlation pipeline with scanning animation
    setIsProcessing(true);
    setTimeout(async () => {
      try {
        const result = analyzeAndCorrelateEvents(mlEvents);
        setCorrelationResult(result);
        setIsCorrelated(true);
        setIsProcessing(false);

        // Generate AI Threat Intelligence Insight
        const aiResponse = await generateAIIncidentAnalysis(result, mlEvents);
        setAiInsight(aiResponse);
      } catch (err) {
        console.error('Correlation pipeline error:', err);
        setIsProcessing(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-cyber-950 text-slate-100 flex flex-col grid-bg selection:bg-cyber-accent/30 selection:text-white">
      
      {/* Top Navigation */}
      <Header
        totalEvents={currentEvents.length}
        isCorrelated={isCorrelated}
        onReset={handleReset}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Single Page Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {activeTab === 'correlation' ? (
          <>
            {/* Banner / Value Proposition for Judges */}
            <div className="bg-gradient-to-r from-cyber-900 via-cyber-850 to-cyber-900 border border-cyber-700/60 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-cyber-accent/15 border border-cyber-accent/30 flex items-center justify-center text-cyber-accent">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    CYBER CORRELATION AGENT — PROOF OF CONCEPT
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Security Events &rarr; Correlation Heuristics &rarr; Incident Detection &rarr; AI Response Advisory
                  </p>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-400 flex items-center gap-2 bg-cyber-950/80 px-3 py-1.5 rounded-lg border border-cyber-800">
                <span className="w-2 h-2 rounded-full bg-cyber-neon animate-ping" />
                <span>Rule-Based Correlation Active</span>
              </div>
            </div>

            {/* Step 1: Scenario Selector */}
            <ScenarioSelector
              scenarios={SCENARIOS}
              activeScenarioId={selectedScenarioId}
              onSelectScenario={handleScenarioChange}
              isProcessing={isProcessing}
            />

            {/* Step 2: Ingested Security Events Table */}
            <EventTable
              events={currentEvents}
              correlatedEventIds={correlationResult?.correlatedEventIds || []}
              isCorrelated={isCorrelated}
            />

            {/* Analyze & Correlate Interactive Processing Trigger */}
            <CorrelationScanner
              isProcessing={isProcessing}
              onStartAnalyze={handleStartAnalysis}
              isCorrelated={isCorrelated}
            />

            {/* Step 3: Correlation Result Card */}
            {isCorrelated && correlationResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-mono text-xs text-slate-400 uppercase tracking-wider">
                  <span className="flex h-5 w-5 rounded-full bg-cyber-accent/20 border border-cyber-accent/40 items-center justify-center text-[10px] font-mono text-cyber-accent font-bold">3</span>
                  <span className="font-semibold text-slate-200">Step 3: Correlated Incident Output</span>
                </div>

                <IncidentResult
                  incident={correlationResult}
                  events={currentEvents}
                  aiInsight={aiInsight}
                  onOpenScoreModal={() => setIsScoreModalOpen(true)}
                />
              </div>
            )}
          </>
        ) : (
          <NetworkThreatForecasting onInjectEvent={handleInjectMLEvent} />
        )}

      </main>

      {/* Scoring Heuristic Modal */}
      <ScoringBreakdownModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        score={correlationResult?.score || 0}
        scoreBreakdown={correlationResult?.scoreBreakdown || []}
        riskLevel={correlationResult?.riskLevel || 'LOW'}
      />

      {/* Footer */}
      <footer className="border-t border-cyber-800/80 bg-cyber-900/60 py-4 text-center text-xs font-mono text-slate-500 mt-auto">
        <p>Cyber Correlation Agent Prototype &bull; Hackathon Demonstration &bull; 100% Offline Rule &amp; Threat Engine</p>
      </footer>

    </div>
  );
}
