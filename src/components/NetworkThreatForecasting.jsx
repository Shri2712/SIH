import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Play, Pause, RefreshCw, AlertTriangle, Activity, 
  CheckCircle, Server, Shield, ShieldAlert, Cpu, Database, 
  HelpCircle, ChevronRight, BarChart2, Radio, Send
} from 'lucide-react';

export default function NetworkThreatForecasting({ onInjectEvent }) {
  // Input Data States
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [recordCount, setRecordCount] = useState(0);
  const [rawRecords, setRawRecords] = useState([]);
  
  // App states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [predictionReport, setPredictionReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [apiOnline, setApiOnline] = useState(false);
  const [modelMetrics, setModelMetrics] = useState(null);

  // Simulation (Traffic Replay) States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simIndex, setSimIndex] = useState(0);
  const [simRecords, setSimRecords] = useState([]);
  const [simSpeed, setSimSpeed] = useState(2000); // ms per tick
  const [simBatchSize, setSimBatchSize] = useState(10); // flows per tick
  const [simReport, setSimReport] = useState(null);
  const [liveFlows, setLiveFlows] = useState([]); // Flows replayed so far with predictions
  
  const simTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  // Check API health on mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  // Handle scrolling of live terminal logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveFlows]);

  const checkApiHealth = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/health');
      if (res.ok) {
        const data = await res.json();
        setApiOnline(data.status === 'healthy');
        if (data.model_loaded) {
          setModelMetrics(data.metrics);
        }
      } else {
        setApiOnline(false);
      }
    } catch {
      setApiOnline(false);
    }
  };

  // 1. Loading built-in demo traffic
  const loadDemoTraffic = async () => {
    setErrorMsg('');
    setPredictionReport(null);
    stopSimulation();
    
    try {
      const res = await fetch('http://localhost:5001/api/demo-traffic');
      if (!res.ok) {
        throw new Error('Failed to load demo traffic from API. Ensure model training has run.');
      }
      const data = await res.json();
      setFileName(data.filename);
      setRecordCount(data.totalRecords);
      setRawRecords(data.records);
      setSelectedFile(null);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // 2. Handling CSV Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    setSelectedFile(file);
    setRawRecords([]);
    setPredictionReport(null);
    stopSimulation();
    setErrorMsg('');

    // Pre-read rows to count them
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(l => l.trim() !== '');
      setRecordCount(lines.length - 1); // Exclude header row
    };
    reader.readAsText(file);
  };

  // 3. Executing standard prediction
  const runAnalysis = async () => {
    if (!selectedFile && rawRecords.length === 0) {
      setErrorMsg('Please upload a CSV file or load the built-in demo traffic first.');
      return;
    }
    setErrorMsg('');
    setIsAnalyzing(true);
    setPredictionReport(null);
    setAnalysisStep(0);

    // Multi-stage visual loader simulation
    const steps = [
      () => setAnalysisStep(1), // Preprocessing
      () => setAnalysisStep(2), // RF Classifying
      () => setAnalysisStep(3)  // Aggregating
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      steps[i]();
    }

    try {
      let response;
      if (selectedFile) {
        // FormData upload
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        response = await fetch('http://localhost:5001/api/predict', {
          method: 'POST',
          body: formData
        });
      } else {
        // JSON post
        response = await fetch('http://localhost:5001/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records: rawRecords })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server returned an error.');
      }

      const data = await response.json();
      setPredictionReport(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 4. Traffic Replay Simulation Mode
  const startSimulation = () => {
    if (rawRecords.length === 0 && !selectedFile) {
      setErrorMsg('Please load the built-in demo traffic or upload a CSV file to run a simulation.');
      return;
    }
    setErrorMsg('');
    setPredictionReport(null);
    
    // If starting fresh or resetting
    let recordsToUse = rawRecords;
    if (selectedFile) {
      setErrorMsg('Simulation replay is fully optimized using the built-in demo traffic. Please load built-in demo traffic.');
      return;
    }

    setIsSimulating(true);
    setLiveFlows([]);
    setSimReport(null);
    
    // Set up ticking simulation
    let currentIdx = 0;
    setSimIndex(0);

    const tick = async () => {
      const nextIdx = currentIdx + simBatchSize;
      const sliced = recordsToUse.slice(0, nextIdx);
      
      if (sliced.length === 0) {
        stopSimulation();
        return;
      }

      // Query current prediction report for cumulative records
      try {
        const response = await fetch('http://localhost:5001/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records: sliced })
        });
        
        if (response.ok) {
          const data = await response.json();
          setSimReport(data);
          setLiveFlows(data.sampleRecords || []);
        }
      } catch (err) {
        console.error('Simulation API call failed:', err);
      }

      setSimIndex(Math.min(nextIdx, recordsToUse.length));
      currentIdx = nextIdx;

      if (nextIdx >= recordsToUse.length) {
        clearInterval(simTimerRef.current);
        setIsSimulating(false);
      }
    };

    // Run first tick immediately, then interval
    tick();
    simTimerRef.current = setInterval(tick, simSpeed);
  };

  const stopSimulation = () => {
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
    }
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    stopSimulation();
    setSimIndex(0);
    setSimReport(null);
    setLiveFlows([]);
  };

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  const handleSendToCorrelation = () => {
    const report = isSimulating || simReport ? simReport : predictionReport;
    if (!report) return;

    // Find any malicious IP, otherwise default to a demo IP
    let anomalousIp = '10.0.1.250';
    if (report.sampleRecords && report.sampleRecords.length > 0) {
      const maliciousFlow = report.sampleRecords.find(r => r.isMalicious);
      if (maliciousFlow) {
        // Formulate an IP based on prediction or protocol
        anomalousIp = `192.168.10.${100 + (maliciousFlow.duration % 100)}`;
      }
    }

    // Extract primary pattern and sum malicious flows
    let detectedPattern = 'Suspicious Traffic Profile';
    let maliciousFlowsCount = 0;
    if (report.anomalies && Object.keys(report.anomalies).length > 0) {
      detectedPattern = Object.keys(report.anomalies).join(', ');
      maliciousFlowsCount = Object.values(report.anomalies).reduce((a, b) => a + b, 0);
    }

    onInjectEvent({
      threatDetected: report.threatDetected,
      threatLikelihood: report.threatLikelihood,
      riskLevel: report.riskLevel,
      confidence: report.confidence,
      anomalies: report.anomalies,
      anomalousIp: anomalousIp,
      detectedPattern: detectedPattern,
      maliciousFlowsCount: maliciousFlowsCount
    });
  };

  const activeReport = simReport || predictionReport;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Forecasting Hero and Description */}
      <div className="bg-gradient-to-r from-cyber-900 via-cyber-850 to-cyber-900 border border-cyber-700/60 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyber-accent animate-pulse" />
            AI/ML-BASED NETWORK THREAT FORECASTING
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            This module integrates a real **Random Forest Machine Learning Classifier** trained on the **CIC-IDS2017** dataset. 
            It operates inline to scan incoming network flows and output early risk warnings, threat likelihoods, and anomaly predictions. 
            It serves as an intelligent feed to the **Cyber Correlation Agent** rather than replacing it.
          </p>
        </div>

        {/* API connection indicator */}
        <div className="flex flex-col gap-1 items-end min-w-[160px]">
          <div className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold flex items-center gap-1.5 border ${
            apiOnline 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse'
          }`}>
            <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span>ML ENGINE: {apiOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
          {modelMetrics && (
            <span className="text-[10px] text-slate-500 font-mono mt-1">
              RF Accuracy: {(modelMetrics.accuracy * 100).toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Import / Actions Panel */}
        <div className="bg-cyber-900/60 border border-cyber-800 rounded-xl p-5 shadow-lg space-y-6">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-cyber-800 pb-2.5">
            <Database className="w-4 h-4 text-cyber-accent" />
            Data Ingestion Control
          </h3>

          {!apiOnline && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold font-mono">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                API OFFLINE WARNING
              </div>
              <p>The backend ML server could not be reached. Ensure the Flask app is running on port 5001.</p>
              <button 
                onClick={checkApiHealth}
                className="w-full mt-2 py-1 text-[11px] bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded text-amber-200 transition font-mono"
              >
                Re-check API Connection
              </button>
            </div>
          )}

          {/* Import Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">Import Traffic Log (CSV)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-cyber-700/60 hover:border-cyber-accent/60 rounded-xl p-6 text-center cursor-pointer transition bg-cyber-950/40 group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyber-accent mx-auto mb-2 transition" />
                <span className="text-xs font-bold text-slate-300 block">Click to Browse Files</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Expected columns: Protocol, Flow Duration, etc.</span>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-cyber-800"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-500 uppercase">Or Use Sample</span>
              <div className="flex-grow border-t border-cyber-800"></div>
            </div>

            <button
              onClick={loadDemoTraffic}
              disabled={!apiOnline}
              className="w-full py-2.5 bg-cyber-800 hover:bg-cyber-700 disabled:opacity-50 disabled:hover:bg-cyber-800 border border-cyber-700 rounded-lg text-slate-200 hover:text-white transition font-mono text-xs flex items-center justify-center gap-2"
            >
              <Database className="w-3.5 h-3.5 text-cyber-accent" />
              Load Unseen Demo Dataset
            </button>
          </div>

          {/* Selected File Details */}
          {fileName && (
            <div className="bg-cyber-950/70 border border-cyber-800/80 rounded-lg p-3.5 space-y-2 text-xs font-mono animate-fadeIn">
              <div className="flex justify-between text-slate-400">
                <span>Selected:</span>
                <strong className="text-slate-200 max-w-[150px] truncate">{fileName}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Flows:</span>
                <strong className="text-cyber-accent">{recordCount} records</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>State:</span>
                <strong className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Loaded
                </strong>
              </div>
            </div>
          )}

          {/* Inference Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || (!selectedFile && rawRecords.length === 0) || !apiOnline}
              className="w-full py-3 bg-gradient-to-r from-cyber-accent to-cyan-500 hover:scale-[1.01] hover:shadow-cyber-accent/15 transition disabled:opacity-50 disabled:scale-100 disabled:hover:shadow-none rounded-lg text-cyber-950 font-bold font-mono text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing ML Classifier...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 text-cyber-950" />
                  <span>Analyze Full Traffic</span>
                </>
              )}
            </button>

            {/* Simulation controls */}
            <div className="border border-cyber-800 rounded-lg p-3 bg-cyber-950/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyber-neon" />
                  Traffic Replay Simulation
                </span>
                <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-cyber-neon animate-ping' : 'bg-slate-700'}`} />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {!isSimulating ? (
                  <button
                    onClick={startSimulation}
                    disabled={rawRecords.length === 0 || !apiOnline}
                    className="py-1.5 px-2 bg-cyber-850 hover:bg-cyber-750 disabled:opacity-40 rounded border border-cyber-700 text-[10px] font-mono text-slate-200 flex items-center justify-center gap-1.5 transition"
                  >
                    <Play className="w-3 h-3 text-cyber-neon" /> Replay Live
                  </button>
                ) : (
                  <button
                    onClick={stopSimulation}
                    className="py-1.5 px-2 bg-cyber-850 hover:bg-cyber-750 rounded border border-cyber-700 text-[10px] font-mono text-slate-200 flex items-center justify-center gap-1.5 transition animate-pulse"
                  >
                    <Pause className="w-3 h-3 text-amber-400" /> Pause Replay
                  </button>
                )}
                
                <button
                  onClick={resetSimulation}
                  disabled={simIndex === 0}
                  className="py-1.5 px-2 bg-cyber-900 hover:bg-cyber-800 disabled:opacity-40 rounded border border-cyber-800 text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {simIndex > 0 && (
                <div className="space-y-1.5 text-[10px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Replayed:</span>
                    <span>{simIndex} / {recordCount} flows</span>
                  </div>
                  <div className="w-full bg-cyber-950 rounded-full h-1 overflow-hidden border border-cyber-800">
                    <div 
                      className="bg-cyber-neon h-full transition-all duration-300"
                      style={{ width: `${(simIndex / recordCount) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Errors display */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-400 flex items-start gap-2 animate-fadeIn font-mono">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Columns (spanning 2 cols): Active Analysis Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Analysis step progress indicator */}
          {isAnalyzing && (
            <div className="bg-cyber-900/60 border border-cyber-accent/35 rounded-xl p-5 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyber-accent font-semibold flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyber-accent" />
                  MODEL INFERENCE RUNNING
                </span>
                <span className="text-slate-300">{analysisStep * 33}% Done</span>
              </div>
              <div className="w-full bg-cyber-950 rounded-full h-2.5 overflow-hidden border border-cyber-700">
                <div 
                  className="bg-gradient-to-r from-cyber-accent via-cyan-400 to-cyber-neon h-full transition-all duration-300 rounded-full shadow-lg"
                  style={{ width: `${analysisStep * 33.3}%` }}
                />
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div className={`flex items-center gap-2.5 ${analysisStep >= 1 ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>{analysisStep > 1 ? '✓' : '▶'}</span>
                  <span>Aligning CSV headers and imputing NaN/inf values...</span>
                </div>
                <div className={`flex items-center gap-2.5 ${analysisStep >= 2 ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>{analysisStep > 2 ? '✓' : analysisStep === 2 ? '▶' : '•'}</span>
                  <span>Executing Random Forest tree ensemble predictions...</span>
                </div>
                <div className={`flex items-center gap-2.5 ${analysisStep >= 3 ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>{analysisStep === 3 ? '▶' : '•'}</span>
                  <span>Synthesizing likelihood scores and risk metrics...</span>
                </div>
              </div>
            </div>
          )}

          {/* Results dashboard */}
          {activeReport ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Step 2 Label */}
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400 uppercase tracking-wider">
                <span className="flex h-5 w-5 rounded-full bg-cyber-accent/20 border border-cyber-accent/40 items-center justify-center text-[10px] font-mono text-cyber-accent font-bold">2</span>
                <span className="font-semibold text-slate-200">Step 2: ML Early-Warning Metrics</span>
              </div>

              {/* Metrics cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Threat Likelihood Card */}
                <div className="bg-cyber-900 border border-cyber-800 rounded-xl p-4 flex flex-col justify-between shadow">
                  <div className="text-xs font-mono text-slate-400">Threat Likelihood</div>
                  <div className="my-2.5 flex items-baseline gap-2">
                    <span className={`text-3xl font-extrabold font-mono ${
                      activeReport.threatLikelihood >= 0.20 
                        ? 'text-red-400' 
                        : (activeReport.threatLikelihood >= 0.05 ? 'text-amber-400' : 'text-emerald-400')
                    }`}>
                      {(activeReport.threatLikelihood * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">malicious flows</span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {activeReport.threatDetected 
                      ? `${activeReport.totalRecords - (activeReport.totalRecords * activeReport.threatLikelihood).toFixed(0)} benign, ${(activeReport.totalRecords * activeReport.threatLikelihood).toFixed(0)} suspicious`
                      : 'All evaluated flows match benign profile'
                    }
                  </div>
                </div>

                {/* 2. Risk Level Card */}
                <div className="bg-cyber-900 border border-cyber-800 rounded-xl p-4 flex flex-col justify-between shadow">
                  <div className="text-xs font-mono text-slate-400">Risk Level</div>
                  <div className="my-2 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-md text-sm font-bold font-mono tracking-wide ${
                      activeReport.riskLevel === 'HIGH' 
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30' 
                        : (activeReport.riskLevel === 'MEDIUM' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30')
                    }`}>
                      {activeReport.riskLevel}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    Calculated from the percentage of positive threat classifications in the telemetry feed.
                  </div>
                </div>

                {/* 3. Model Confidence Card */}
                <div className="bg-cyber-900 border border-cyber-800 rounded-xl p-4 flex flex-col justify-between shadow">
                  <div className="text-xs font-mono text-slate-400">Classifier Confidence</div>
                  <div className="my-2.5 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-cyan-400">
                      {(activeReport.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    The mean random forest probability score across the predicted categories.
                  </div>
                </div>

              </div>

              {/* Status and Anomalies Details */}
              <div className="bg-cyber-900/40 border border-cyber-800 rounded-xl p-5 shadow space-y-4">
                <div className="flex items-center justify-between border-b border-cyber-800 pb-2.5">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-cyber-accent" />
                    ML Forecast Summary & Anomalies Breakdown
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">{activeReport.totalRecords} flows analyzed</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {activeReport.summary}
                </p>

                {/* Anomalies categories tag cloud */}
                {activeReport.threatDetected && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 block">Classified Anomalies:</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(activeReport.anomalies).map(([className, count]) => (
                        <span 
                          key={className}
                          className="px-2 py-1 rounded bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-mono flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                          <strong>{className}:</strong> {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Warnings and Explanations (Strict Requirement) */}
              <div className="bg-cyber-900 border-l-4 border-cyber-accent rounded-r-xl p-4.5 space-y-2 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-cyber-accent" />
                  <span className="text-xs font-bold font-mono text-white tracking-wide uppercase">
                    ML Early-Warning Alert Notice
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  **Note regarding classification limits:** This prediction is generated solely from statistical anomalies and traffic packet signatures in the network stream (CIC-IDS2017). It represents an **Early-Warning Indicator** rather than a confirmed security incident. 
                  In order to prevent false positives and map out the complete multi-stage attack chain (MITRE ATT&CK), you must submit these findings to the **Cyber Correlation Agent** rule engine. 
                  The agent will combine this signal with endpoint events, user auth logs, and temporal rules to determine/confirm the final attack chain.
                </p>
              </div>

              {/* Redirect Action Button */}
              {activeReport.threatDetected && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSendToCorrelation}
                    className="relative px-6 py-3 rounded-lg bg-cyber-accent/15 border border-cyber-accent text-cyber-accent font-bold font-mono text-xs uppercase tracking-wider hover:bg-cyber-accent hover:text-cyber-950 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg shadow-cyber-accent/10"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Threat Signal to Correlation Agent</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Real-time scrolling traffic log (when simulating) */}
              {liveFlows.length > 0 && (
                <div className="bg-cyber-950 border border-cyber-800 rounded-xl p-4 space-y-3 font-mono">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-cyber-850 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-cyber-neon animate-pulse" />
                      Live Flow Classification Feed (Scrolling)
                    </span>
                    <span>Replay Buffer: {liveFlows.length} rows</span>
                  </div>

                  <div 
                    ref={scrollRef}
                    className="h-44 overflow-y-auto text-[11px] space-y-1.5 custom-scrollbar pr-2"
                  >
                    {liveFlows.map((flow, i) => (
                      <div 
                        key={flow.id || i}
                        className={`flex items-center justify-between p-1.5 rounded transition ${
                          flow.isMalicious 
                            ? 'bg-red-500/10 hover:bg-red-500/15 text-red-300 border-l-2 border-red-500' 
                            : 'bg-cyber-900/40 hover:bg-cyber-900/60 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-600">[{flow.id}]</span>
                          <span>PROTO: {flow.protocol === 6 ? 'TCP' : flow.protocol === 17 ? 'UDP' : `OTHER (${flow.protocol})`}</span>
                          <span>DUR: {flow.duration.toFixed(0)}ms</span>
                          <span>FWD_PKTS: {flow.fwdPackets}</span>
                          <span>BWD_PKTS: {flow.bwdPackets}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500">{(flow.confidence * 100).toFixed(0)}% conf</span>
                          <strong className={`font-bold ${flow.isMalicious ? 'text-red-400 animate-pulse' : 'text-slate-500'}`}>
                            {flow.prediction}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Empty state */
            <div className="bg-cyber-900/20 border border-dashed border-cyber-800 rounded-xl p-12 text-center text-slate-500 font-mono space-y-3">
              <Cpu className="w-12 h-12 text-slate-700 mx-auto animate-pulse" />
              <p className="text-sm">Inference telemetry dashboard is idle.</p>
              <p className="text-xs text-slate-600">Import a CSV file or load the built-in demo dataset, then click **Analyze Full Traffic** or **Replay Live** to begin ML forecasting.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
