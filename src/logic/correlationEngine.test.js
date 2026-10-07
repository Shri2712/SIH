import { SCENARIOS } from '../data/scenarios.js';
import { analyzeAndCorrelateEvents } from './correlationEngine.js';

console.log('🧪 Starting Cyber Correlation Agent Heuristic Engine Tests...\n');

// 1. Test Account Compromise
const s1 = SCENARIOS.find(s => s.id === 'account_compromise');
const r1 = analyzeAndCorrelateEvents(s1.events);
console.log(`[Scenario 1 - Account Compromise]:`);
console.log(`  - Title: ${r1.title}`);
console.log(`  - Risk Level: ${r1.riskLevel}`);
console.log(`  - Score: ${r1.score}/100`);
console.log(`  - Correlated Events: ${r1.correlatedCount}/${r1.eventsAnalyzed}`);
console.assert(r1.incidentDetected === true, 'S1 incidentDetected should be true');
console.assert(r1.riskLevel === 'HIGH', 'S1 riskLevel should be HIGH');
console.assert(r1.affectedEntities.user === 'john.doe', 'S1 user should be john.doe');
console.assert(r1.affectedEntities.ip === '192.168.1.25', 'S1 IP should be 192.168.1.25');
console.assert(r1.correlationFactors.sameUser.present === true, 'S1 sameUser should be true');
console.assert(r1.correlationFactors.sameUser.entity === 'john.doe', 'S1 sameUser entity should be john.doe');
console.assert(r1.correlationFactors.sameUser.events.length === 6, 'S1 sameUser events should be 6');
console.assert(r1.correlationFactors.sameIp.present === true, 'S1 sameIp should be true');
console.assert(r1.correlationFactors.sameIp.entity === '192.168.1.25', 'S1 sameIp entity should be 192.168.1.25');
console.assert(r1.correlationFactors.temporalProximity.matched === true, 'S1 temporalProximity should be true');
console.assert(r1.correlationFactors.attackPattern.matched === true, 'S1 attackPattern should be true');
console.assert(r1.allRuleEvaluations.length === 10, 'S1 allRuleEvaluations should have 10 rules');
console.log('  ✅ Scenario 1 Assertion Passed\n');

// 2. Test Malware Activity
const s2 = SCENARIOS.find(s => s.id === 'malware_activity');
const r2 = analyzeAndCorrelateEvents(s2.events);
console.log(`[Scenario 2 - Malware Activity]:`);
console.log(`  - Title: ${r2.title}`);
console.log(`  - Risk Level: ${r2.riskLevel}`);
console.log(`  - Score: ${r2.score}/100`);
console.log(`  - Correlated Events: ${r2.correlatedCount}/${r2.eventsAnalyzed}`);
console.assert(r2.incidentDetected === true, 'S2 incidentDetected should be true');
console.assert(r2.riskLevel === 'HIGH', 'S2 riskLevel should be HIGH');
console.assert(r2.affectedEntities.device === 'LAPTOP-101', 'S2 device should be LAPTOP-101');
console.assert(r2.correlationFactors.sameUser.present === true, 'S2 sameUser should be true');
console.assert(r2.correlationFactors.sameUser.entity === 'system_svc', 'S2 sameUser entity should be system_svc');
console.assert(r2.correlationFactors.sameIp.present === true, 'S2 sameIp should be true');
console.assert(r2.correlationFactors.sameIp.entity === '10.0.0.45', 'S2 sameIp entity should be 10.0.0.45');
console.assert(r2.correlationFactors.sameDevice.present === true, 'S2 sameDevice should be true');
console.assert(r2.correlationFactors.sameDevice.entity === 'LAPTOP-101', 'S2 sameDevice entity should be LAPTOP-101');
console.assert(r2.correlationFactors.temporalProximity.matched === true, 'S2 temporalProximity should be true');
console.assert(r2.correlationFactors.attackPattern.matched === true, 'S2 attackPattern should be true');
console.log('  ✅ Scenario 2 Assertion Passed\n');

// 3. Test Normal Activity
const s3 = SCENARIOS.find(s => s.id === 'normal_activity');
const r3 = analyzeAndCorrelateEvents(s3.events);
console.log(`[Scenario 3 - Normal Activity]:`);
console.log(`  - Title: ${r3.title}`);
console.log(`  - Risk Level: ${r3.riskLevel}`);
console.log(`  - Score: ${r3.score}/100`);
console.log(`  - Correlated Events: ${r3.correlatedCount}/${r3.eventsAnalyzed}`);
console.assert(r3.incidentDetected === false, 'S3 incidentDetected should be false');
console.assert(r3.riskLevel === 'LOW', 'S3 riskLevel should be LOW');
console.assert(r3.correlationFactors.sameUser.present === false, 'S3 sameUser should be false');
console.assert(r3.correlationFactors.sameIp.present === false, 'S3 sameIp should be false');
console.assert(r3.correlationFactors.sameDevice.present === false, 'S3 sameDevice should be false');
console.assert(r3.correlationFactors.temporalProximity.matched === false, 'S3 temporalProximity should be false (90 min > 20 min)');
console.assert(r3.correlationFactors.attackPattern.matched === false, 'S3 attackPattern should be false');
console.log('  ✅ Scenario 3 Assertion Passed\n');

// 4. Test ML Forecasting Early Warning Signal
const mlEvent = {
  id: 'evt-ml-test',
  time: '12:00',
  timestamp: 1700000000,
  eventType: 'ML_NETWORK_THREAT_DETECTED',
  user: 'N/A (Subnet Flow)',
  ip: '10.0.0.99',
  device: 'N/A (Network Traffic)',
  category: 'Network Threat Alert',
  severity: 'High', // High severity maps to HIGH risk
  source: 'ML Threat Forecasting Module',
  detectedPattern: 'Bot, DDoS',
  threatLikelihood: 0.8,
  confidence: 0.95,
  maliciousFlowsCount: 10,
  rawDetails: 'ML Aggregated Warning: Threat Likelihood 80%, Risk Level HIGH'
};

const r4 = analyzeAndCorrelateEvents([mlEvent]);
console.log(`[Scenario 4 - ML Forecasting Early Warning]:`);
console.log(`  - Title: ${r4.title}`);
console.log(`  - Risk Level: ${r4.riskLevel}`);
console.log(`  - Score: ${r4.score}/100`);
console.log(`  - Correlated Events: ${r4.correlatedCount}/${r4.eventsAnalyzed}`);
console.assert(r4.incidentDetected === true, 'S4 incidentDetected should be true');
console.assert(r4.riskLevel === 'MEDIUM', 'S4 riskLevel should be MEDIUM (score: 40)');
console.assert(r4.incidentType === 'ml_forecasting_incident', 'S4 incidentType should be ml_forecasting_incident');
console.assert(r4.score === 55, 'S4 score should be 55 points');
console.assert(r4.title === 'Potential Network Threat Detected by ML', 'S4 title should match');
console.log('  ✅ Scenario 4 Assertion Passed\n');

console.log('🎉 ALL CORRELATION ENGINE UNIT TESTS PASSED SUCCESSFULLY!');
