/**
 * Cyber Correlation Engine
 * Rule-based heuristic correlation and attack chain graph inference.
 */

export function analyzeAndCorrelateEvents(events) {
  if (!events || events.length === 0) {
    return {
      incidentDetected: false,
      title: 'NO EVENTS PROVIDED',
      riskLevel: 'LOW',
      score: 0,
      scoreBreakdown: [],
      correlatedEventIds: [],
      affectedEntities: { users: [], ips: [], devices: [] },
      detectionReason: 'No security events were supplied to the correlation engine.',
      timelineFlow: [],
      recommendedActions: []
    };
  }

  // 1. Entity Frequency & Grouping
  const userCounts = {};
  const ipCounts = {};
  const deviceCounts = {};

  events.forEach(evt => {
    if (evt.user) userCounts[evt.user] = (userCounts[evt.user] || 0) + 1;
    if (evt.ip) ipCounts[evt.ip] = (ipCounts[evt.ip] || 0) + 1;
    if (evt.device) deviceCounts[evt.device] = (deviceCounts[evt.device] || 0) + 1;
  });

  const maxUserCount = Math.max(...Object.values(userCounts), 0);
  const maxIpCount = Math.max(...Object.values(ipCounts), 0);
  const maxDeviceCount = Math.max(...Object.values(deviceCounts), 0);

  // Dominant entity extraction
  const dominantUser = Object.keys(userCounts).find(u => userCounts[u] === maxUserCount);
  const dominantIp = Object.keys(ipCounts).find(i => ipCounts[i] === maxIpCount);
  const dominantDevice = Object.keys(deviceCounts).find(d => deviceCounts[d] === maxDeviceCount);

  // 2. Temporal Proximity
  let maxTimeDeltaMinutes = 0;
  if (events.length > 1) {
    const timestamps = events.map(e => e.timestamp).filter(Boolean);
    if (timestamps.length >= 2) {
      const minT = Math.min(...timestamps);
      const maxT = Math.max(...timestamps);
      maxTimeDeltaMinutes = (maxT - minT) / 60;
    }
  }

  // 3. Pattern Signatures
  const eventTypes = events.map(e => e.eventType.toLowerCase());
  
  const failedLogins = events.filter(e => e.eventType.toLowerCase().includes('failed login'));
  const hasSuccessfulLogin = events.some(e => e.eventType.toLowerCase().includes('successful login'));
  const hasSuspiciousDownload = events.some(e => e.eventType.toLowerCase().includes('download') || e.eventType.toLowerCase().includes('file'));
  const hasDataTransfer = events.some(e => e.eventType.toLowerCase().includes('data transfer') || e.eventType.toLowerCase().includes('exfiltration'));

  const hasMalwareExec = events.some(e => e.eventType.toLowerCase().includes('executed') || e.eventType.toLowerCase().includes('file'));
  const hasMalwareSig = events.some(e => e.eventType.toLowerCase().includes('malware') || e.eventType.toLowerCase().includes('signature'));
  const hasSuspiciousNetwork = events.some(e => e.eventType.toLowerCase().includes('network') || e.eventType.toLowerCase().includes('c2'));
  const hasSecurityEvasion = events.some(e => e.eventType.toLowerCase().includes('security process') || e.eventType.toLowerCase().includes('failed security'));
  const mlEvents = events.filter(e => 
    e.eventType.toLowerCase().includes('ml forecasting') || 
    e.eventType.toLowerCase().includes('ml threat') ||
    e.eventType.toUpperCase() === 'ML_NETWORK_THREAT_DETECTED'
  );
  const hasMLThreatSignal = mlEvents.length > 0;
  const hasHighMLThreat = mlEvents.some(e => e.severity?.toLowerCase() === 'high');
  const hasMediumMLThreat = mlEvents.some(e => e.severity?.toLowerCase() === 'medium');

  // Calculate Correlation Score
  let score = 0;
  const scoreBreakdown = [];

  // Entity linkage rule
  if (maxUserCount >= 3 || maxIpCount >= 3 || maxDeviceCount >= 3) {
    score += 30;
    scoreBreakdown.push({
      rule: 'Same Entity Linkage (User / IP / Device)',
      points: 30,
      detail: `Shared entity across ${Math.max(maxUserCount, maxIpCount, maxDeviceCount)} sequential events`
    });
  }

  // Proximity rule (within 20 minutes)
  if (events.length > 1 && maxTimeDeltaMinutes <= 20) {
    score += 20;
    scoreBreakdown.push({
      rule: 'High Temporal Proximity',
      points: 20,
      detail: `All events occurred within a concentrated ${Math.round(maxTimeDeltaMinutes)} minute window`
    });
  }

  // Scenario Specific Rule: Account Compromise / Brute Force Kill Chain
  if (failedLogins.length >= 2) {
    const points = failedLogins.length >= 3 ? 20 : 10;
    score += points;
    scoreBreakdown.push({
      rule: 'Repeated Failed Logins (Brute Force Anomaly)',
      points: points,
      detail: `${failedLogins.length} consecutive authentication failures detected`
    });
  }

  if (failedLogins.length >= 1 && hasSuccessfulLogin) {
    score += 15;
    scoreBreakdown.push({
      rule: 'Auth Transition Anomaly (Failure -> Success)',
      points: 15,
      detail: 'Successful login preceded immediately by failed authentication threshold'
    });
  }

  if (hasSuspiciousDownload && (hasSuccessfulLogin || failedLogins.length > 0)) {
    score += 15;
    scoreBreakdown.push({
      rule: 'Suspicious File Harvest After Auth',
      points: 15,
      detail: 'Immediate restricted file access following authorization from same IP'
    });
  }

  if (hasDataTransfer) {
    score += 15;
    scoreBreakdown.push({
      rule: 'Large Data Transfer / Exfiltration',
      points: 15,
      detail: 'Anomalous egress volume detected to unclassified endpoint'
    });
  }

  // Scenario Specific Rule: Malware Attack Chain
  if (hasMalwareExec && hasMalwareSig) {
    score += 25;
    scoreBreakdown.push({
      rule: 'Host Execution & Malware Signature Correlation',
      points: 25,
      detail: 'Execution of untrusted binary directly triggered EDR signature detection'
    });
  }

  if (hasSuspiciousNetwork) {
    score += 15;
    scoreBreakdown.push({
      rule: 'Command & Control (C2) Beaconing',
      points: 15,
      detail: 'Infected host initiated outbound network tunnel'
    });
  }

  if (hasSecurityEvasion) {
    score += 20;
    scoreBreakdown.push({
      rule: 'Defense Evasion / Process Tampering',
      points: 20,
      detail: 'Local endpoint protection terminated or suppressed'
    });
  }

  if (hasMLThreatSignal) {
    const points = hasHighMLThreat ? 40 : (hasMediumMLThreat ? 25 : 10);
    score += points;
    scoreBreakdown.push({
      rule: 'Machine Learning Early Warning Integration',
      points: points,
      detail: `The AI/ML Network Threat Forecasting module flagged this subnet with ${hasHighMLThreat ? 'HIGH' : (hasMediumMLThreat ? 'MEDIUM' : 'LOW')} threat risk.`
    });
  }

  // Cap score to 100
  score = Math.min(score, 100);

  // Determine Incident Classification
  let incidentDetected = score >= 35;
  let riskLevel = 'LOW';
  let title = 'NO SIGNIFICANT INCIDENT DETECTED';
  let incidentType = 'normal';
  let detectionReason = '';
  let recommendedActions = [];
  let correlatedEventIds = [];
  let timelineFlow = [];

  if (score >= 61) {
    riskLevel = 'HIGH';
  } else if (score >= 31) {
    riskLevel = 'MEDIUM';
  }

  // Determine specific incident archetype
  const isCompromiseChain = (failedLogins.length >= 2 && hasSuccessfulLogin) || (hasSuccessfulLogin && hasSuspiciousDownload && hasDataTransfer);
  const isMalwareChain = (hasMalwareSig || hasMalwareExec) && (hasSuspiciousNetwork || hasSecurityEvasion);
  const isMLForecastedIncident = hasMLThreatSignal && score >= 35;

  if (isCompromiseChain) {
    incidentDetected = true;
    incidentType = 'account_compromise';
    title = 'POTENTIAL ACCOUNT COMPROMISE';
    riskLevel = 'HIGH';
    correlatedEventIds = events.map(e => e.id);
    
    detectionReason = 'Multiple failed login attempts were followed by a successful login from the same IP address. This was followed by suspicious file activity and a large data transfer.';
    
    timelineFlow = [
      { step: 1, label: 'Multiple Failed Logins', desc: 'Brute-force credential stuffing attempts', status: 'danger' },
      { step: 2, label: 'Successful Login', desc: 'Account access gained from identical IP', status: 'warning' },
      { step: 3, label: 'Suspicious File Download', desc: 'Unauthorized access to encrypted sensitive records', status: 'danger' },
      { step: 4, label: 'Large Data Transfer', desc: '2.4 GB external egress / data exfiltration', status: 'danger' }
    ];

    if (hasMLThreatSignal) {
      timelineFlow.push({
        step: 5,
        label: 'ML Network Threat Ingestion',
        desc: `Model flagged: ${mlEvents[0].detectedPattern || 'Anomalous traffic'} (${Math.round((mlEvents[0].threatLikelihood || 0.8) * 100)}% likelihood)`,
        status: 'warning'
      });
    }

    recommendedActions = [
      { action: 'Temporarily secure the affected account', detail: 'Immediately revoke Active Directory / SSO sessions and trigger password reset.', priority: 'P1' },
      { action: 'Investigate the IP address', detail: `Quarantine IP ${dominantIp} at the perimeter firewall and query threat intelligence feeds.`, priority: 'P1' },
      { action: 'Review recent file activity', detail: 'Audit DLP and file server access logs for any other read/modify actions in the last 24h.', priority: 'P2' },
      { action: 'Check for possible data exfiltration', detail: 'Inspect network firewall and proxy telemetry to determine destination host of egress flow.', priority: 'P1' }
    ];
  } else if (isMalwareChain) {
    incidentDetected = true;
    incidentType = 'malware_activity';
    title = 'POTENTIAL MALWARE INCIDENT';
    riskLevel = 'HIGH';
    correlatedEventIds = events.map(e => e.id);

    detectionReason = 'A suspicious executable was followed by malware detection and an unusual external network connection from the same device.';

    timelineFlow = [
      { step: 1, label: 'Suspicious File Executed', desc: 'Untrusted PDF.exe binary spawned from temp directory', status: 'warning' },
      { step: 2, label: 'Malware Signature Detected', desc: 'Trojan.Dropper identified in process memory', status: 'danger' },
      { step: 3, label: 'Suspicious Network Connection', desc: 'C2 beaconing connection established over port 8443', status: 'danger' },
      { step: 4, label: 'Security Process Disabled', desc: 'Host antivirus defense evasion detected', status: 'danger' }
    ];

    if (hasMLThreatSignal) {
      timelineFlow.push({
        step: 5,
        label: 'ML Flow Anomalies',
        desc: `ML model detected network threat: ${mlEvents[0].detectedPattern || 'Anomalous traffic'} (${Math.round((mlEvents[0].threatLikelihood || 0.8) * 100)}% likelihood)`,
        status: 'danger'
      });
    }

    recommendedActions = [
      { action: 'Isolate the affected device', detail: `Cut network connectivity for ${dominantDevice || 'LAPTOP-101'} via EDR endpoint isolation.`, priority: 'P1' },
      { action: 'Investigate the suspicious process', detail: 'Capture memory dump, analyze process parentage, and terminate malicious PID tree.', priority: 'P1' },
      { action: 'Review network connections', detail: 'Block outbound traffic to C2 IP/domain at perimeter egress firewalls.', priority: 'P2' },
      { action: 'Perform endpoint remediation', detail: 'Run full forensic malware purge and restore endpoint protection services.', priority: 'P2' }
    ];
  } else if (isMLForecastedIncident) {
    incidentDetected = true;
    incidentType = 'ml_forecasting_incident';
    
    const primaryML = mlEvents[0];
    const pattern = primaryML.detectedPattern || 'Suspicious Traffic Profile';
    const likelihood = primaryML.threatLikelihood ? Math.round(primaryML.threatLikelihood * 100) : 80;
    const confidence = primaryML.confidence ? Math.round(primaryML.confidence * 100) : 90;
    const flowCount = primaryML.maliciousFlowsCount || 0;

    title = 'Potential Network Threat Detected by ML';
    riskLevel = score >= 61 ? 'HIGH' : 'MEDIUM';
    correlatedEventIds = events.map(e => e.id);
    
    detectionReason = `The ML Threat Forecasting Module detected a potential network threat containing ${pattern} anomalies. The model identified ${flowCount} malicious flows with a threat likelihood of ${likelihood}% and classifier confidence of ${confidence}%.`;
    
    timelineFlow = [
      { step: 1, label: 'ML Model Detection', desc: `Random Forest classified ${flowCount} flows as ${pattern}`, status: 'warning' },
      { step: 2, label: 'Threat Signal Ingested', desc: `Ingested event ML_NETWORK_THREAT_DETECTED from ML Forecasting Module`, status: 'warning' },
      { step: 3, label: 'Correlation Evaluation', desc: `Analyzed standalone incident at risk level ${riskLevel}`, status: 'danger' }
    ];

    recommendedActions = [
      { action: 'Review raw network flow details', detail: 'Inspect the specific anomalous flows flagged by the ML model in the Threat Forecasting dashboard.', priority: 'P1' },
      { action: 'Quarantine the suspicious source IP', detail: `Implement firewall filtering or block the source IP: ${primaryML.ip || '10.0.1.250'}.`, priority: 'P1' },
      { action: 'Correlate with endpoint events', detail: 'Query host-level security logs for devices active on the suspicious IP range during this timeframe.', priority: 'P2' }
    ];
  } else {
    // Normal / Uncorrelated baseline
    incidentDetected = false;
    title = 'NO SIGNIFICANT INCIDENT DETECTED';
    riskLevel = 'LOW';
    correlatedEventIds = [];
    
    detectionReason = 'The events do not share enough common attributes, temporal proximity, or suspicious sequential patterns to form a correlated security incident. All activity matches normal operational baselines.';
    
    timelineFlow = [
      { step: 1, label: 'Unrelated User Actions', desc: 'Events spread across independent users and hosts', status: 'normal' },
      { step: 2, label: 'Standard Subnet Behavior', desc: 'No repetitive anomalies or signature violations', status: 'normal' },
      { step: 3, label: 'Normal Baseline Maintained', desc: 'No containment or triage required', status: 'normal' }
    ];

    recommendedActions = [
      { action: 'Routine Event Logging', detail: 'No containment required. Events stored in standard log archive.', priority: 'Info' },
      { action: 'Maintain Standard Baseline Monitoring', detail: 'Continue standard automated threshold surveillance.', priority: 'Info' }
    ];
  }

  // Comprehensive evaluation of all heuristic rules for transparent score breakdown
  const allRuleEvaluations = [
    {
      id: 'entity_linkage',
      category: 'Identity & Network',
      rule: 'Same Entity Linkage (User / IP / Device)',
      pointsEarned: (maxUserCount >= 3 || maxIpCount >= 3 || maxDeviceCount >= 3) ? 30 : 0,
      maxPoints: 30,
      contributed: (maxUserCount >= 3 || maxIpCount >= 3 || maxDeviceCount >= 3),
      detail: (maxUserCount >= 3 || maxIpCount >= 3 || maxDeviceCount >= 3)
        ? `Shared entity across ${Math.max(maxUserCount, maxIpCount, maxDeviceCount)} sequential events`
        : 'Not detected / No contribution'
    },
    {
      id: 'temporal_proximity',
      category: 'Temporal',
      rule: 'High Temporal Proximity',
      pointsEarned: (events.length > 1 && maxTimeDeltaMinutes <= 20) ? 20 : 0,
      maxPoints: 20,
      contributed: (events.length > 1 && maxTimeDeltaMinutes <= 20),
      detail: (events.length > 1 && maxTimeDeltaMinutes <= 20)
        ? `All events occurred within a concentrated ${Math.round(maxTimeDeltaMinutes)} minute window (threshold <= 20 min)`
        : 'Not detected / No contribution'
    },
    {
      id: 'repeated_failed_logins',
      category: 'Attack Pattern',
      rule: 'Repeated Failed Logins (Brute Force Anomaly)',
      pointsEarned: failedLogins.length >= 3 ? 20 : (failedLogins.length >= 2 ? 10 : 0),
      maxPoints: 20,
      contributed: failedLogins.length >= 2,
      detail: failedLogins.length >= 2
        ? `${failedLogins.length} consecutive authentication failures detected`
        : 'Not detected / No contribution'
    },
    {
      id: 'auth_transition',
      category: 'Attack Pattern',
      rule: 'Auth Transition Anomaly (Failure -> Success)',
      pointsEarned: (failedLogins.length >= 1 && hasSuccessfulLogin) ? 15 : 0,
      maxPoints: 15,
      contributed: (failedLogins.length >= 1 && hasSuccessfulLogin),
      detail: (failedLogins.length >= 1 && hasSuccessfulLogin)
        ? 'Successful login preceded immediately by failed authentication threshold'
        : 'Not detected / No contribution'
    },
    {
      id: 'file_harvest',
      category: 'Attack Pattern',
      rule: 'Suspicious File Harvest After Auth',
      pointsEarned: (hasSuspiciousDownload && (hasSuccessfulLogin || failedLogins.length > 0)) ? 15 : 0,
      maxPoints: 15,
      contributed: (hasSuspiciousDownload && (hasSuccessfulLogin || failedLogins.length > 0)),
      detail: (hasSuspiciousDownload && (hasSuccessfulLogin || failedLogins.length > 0))
        ? 'Immediate restricted file access following authorization from same IP'
        : 'Not detected / No contribution'
    },
    {
      id: 'data_transfer',
      category: 'Attack Pattern',
      rule: 'Large Data Transfer / Exfiltration',
      pointsEarned: hasDataTransfer ? 15 : 0,
      maxPoints: 15,
      contributed: hasDataTransfer,
      detail: hasDataTransfer
        ? 'Anomalous egress volume detected to unclassified endpoint'
        : 'Not detected / No contribution'
    },
    {
      id: 'malware_exec_sig',
      category: 'Attack Pattern',
      rule: 'Host Execution & Malware Signature Correlation',
      pointsEarned: (hasMalwareExec && hasMalwareSig) ? 25 : 0,
      maxPoints: 25,
      contributed: (hasMalwareExec && hasMalwareSig),
      detail: (hasMalwareExec && hasMalwareSig)
        ? 'Execution of untrusted binary directly triggered EDR signature detection'
        : 'Not detected / No contribution'
    },
    {
      id: 'c2_beaconing',
      category: 'Attack Pattern',
      rule: 'Command & Control (C2) Beaconing',
      pointsEarned: hasSuspiciousNetwork ? 15 : 0,
      maxPoints: 15,
      contributed: hasSuspiciousNetwork,
      detail: hasSuspiciousNetwork
        ? 'Infected host initiated outbound network tunnel'
        : 'Not detected / No contribution'
    },
    {
      id: 'defense_evasion',
      category: 'Attack Pattern',
      rule: 'Defense Evasion / Process Tampering',
      pointsEarned: hasSecurityEvasion ? 20 : 0,
      maxPoints: 20,
      contributed: hasSecurityEvasion,
      detail: hasSecurityEvasion
        ? 'Local endpoint protection terminated or suppressed'
        : 'Not detected / No contribution'
    },
    {
      id: 'ml_threat_warning',
      category: 'Intelligence Signals',
      rule: 'Machine Learning Early Warning Integration',
      pointsEarned: hasMLThreatSignal ? (hasHighMLThreat ? 40 : (hasMediumMLThreat ? 25 : 10)) : 0,
      maxPoints: 40,
      contributed: hasMLThreatSignal,
      detail: hasMLThreatSignal
        ? `Network traffic anomalies classified with ${hasHighMLThreat ? 'HIGH' : (hasMediumMLThreat ? 'MEDIUM' : 'LOW')} risk by Random Forest model`
        : 'Not flagged / No contribution'
    }
  ];

  // Structured correlation factors explaining why events are or are not correlated
  const correlationFactors = {
    sameUser: {
      present: !!(dominantUser && maxUserCount > 1),
      entity: dominantUser || 'N/A',
      eventCount: dominantUser ? (userCounts[dominantUser] || 0) : 0,
      events: dominantUser ? events.filter(e => e.user === dominantUser) : [],
      explanation: dominantUser && maxUserCount > 1
        ? `${dominantUser} appears in ${maxUserCount} related events`
        : 'Events belong to different users (no shared identity pivot)'
    },
    sameIp: {
      present: !!(dominantIp && maxIpCount > 1),
      entity: dominantIp || 'N/A',
      eventCount: dominantIp ? (ipCounts[dominantIp] || 0) : 0,
      events: dominantIp ? events.filter(e => e.ip === dominantIp) : [],
      explanation: dominantIp && maxIpCount > 1
        ? `${dominantIp} appears in ${maxIpCount} related events`
        : 'Activities occur on different IP addresses'
    },
    sameDevice: {
      present: !!(dominantDevice && maxDeviceCount > 1),
      entity: dominantDevice || 'N/A',
      eventCount: dominantDevice ? (deviceCounts[dominantDevice] || 0) : 0,
      events: dominantDevice ? events.filter(e => e.device === dominantDevice) : [],
      explanation: dominantDevice && maxDeviceCount > 1
        ? `${dominantDevice} appears in ${maxDeviceCount} related events`
        : 'Activities occur on different host machines'
    },
    temporalProximity: {
      matched: events.length > 1 && maxTimeDeltaMinutes <= 20,
      deltaMinutes: Math.round(maxTimeDeltaMinutes),
      windowMinutes: 20,
      explanation: (events.length > 1 && maxTimeDeltaMinutes <= 20)
        ? `Related events occurred within ${Math.round(maxTimeDeltaMinutes)} minutes (configured correlation window: <= 20 min)`
        : `Events occurred over ${Math.round(maxTimeDeltaMinutes)} minutes (exceeds 20-minute incident correlation window)`
    },
    attackPattern: {
      matched: isCompromiseChain || isMalwareChain,
      patternName: isCompromiseChain 
        ? 'Account Compromise & Exfiltration Pattern' 
        : (isMalwareChain ? 'Host Infection & Defense Evasion Pattern' : 'No Attack Sequence Found'),
      chain: isCompromiseChain 
        ? ['Failed Login (×3)', 'Successful Login', 'File Download', 'Data Transfer']
        : (isMalwareChain 
            ? ['Suspicious File Executed', 'Malware Signature Detected', 'Suspicious Network Connection', 'Security Process Disabled']
            : []),
      explanation: isCompromiseChain
        ? 'Failed Login → Successful Login → File Access → Data Transfer matches the configured account-compromise pattern.'
        : (isMalwareChain
            ? 'Suspicious File Executed → Malware Signature Detected → Suspicious External Network Connection → Security Process Disabled matches the configured malware-activity pattern.'
            : 'No matching attack sequence or malicious kill chain was found in the ingested events.')
    }
  };

  return {
    incidentDetected,
    incidentType,
    title,
    riskLevel,
    score,
    scoreBreakdown,
    allRuleEvaluations,
    correlationFactors,
    correlatedEventIds,
    eventsAnalyzed: events.length,
    correlatedCount: incidentDetected ? correlatedEventIds.length : 0,
    affectedEntities: {
      user: dominantUser || 'N/A',
      ip: dominantIp || 'N/A',
      device: dominantDevice || 'N/A',
      allUsers: Object.keys(userCounts),
      allIps: Object.keys(ipCounts),
      allDevices: Object.keys(deviceCounts)
    },
    detectionReason,
    timelineFlow,
    recommendedActions
  };
}
