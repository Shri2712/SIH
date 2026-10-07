# Cyber Correlation Agent

> **Security Event Correlation & Attack Chain Detection Prototype**  
> A lightweight, interactive hackathon proof of concept demonstrating how disparate cybersecurity alerts correlate into actionable security incidents.

---

## 📌 Problem

Modern security operations centers (SOCs) receive thousands of fragmented alerts daily. When viewed in isolation, individual alerts (such as a single failed login or an isolated file download) often appear benign or low priority. Consequently, complex multi-stage attack chains slip past analysts until severe damage or data exfiltration has already occurred.

---

## 💡 Solution

**Cyber Correlation Agent** ingests raw security telemetry and applies rule-based heuristic correlation across:
- **Identity Linkage**: Shared user accounts, IP addresses, and host devices
- **Temporal Proximity**: Events occurring in tight time windows
- **Attack Kill-Chain Heuristics**: Recognizing sequences like *Brute Force Failures &rarr; Auth Success &rarr; Staging &rarr; Exfiltration* or *Payload Execution &rarr; Trojan Signature &rarr; C2 Tunnel &rarr; AV Defense Evasion*
- **Scoring Engine**: Calculates an aggregate correlation score (0–100) and severity rating (Low, Medium, High)

---

## 🔄 How It Works

```text
┌─────────────────┐      ┌────────────────────┐      ┌────────────────────┐      ┌────────────────────┐
│ Security Events │ ───▶ │ Correlation Engine │ ───▶ │ Incident Detection│ ───▶ │ AI SOC Advisory    │
│  (Raw Alerts)   │      │ (Heuristic Scoring)│      │  (Kill Chain Flow) │      │  (Action Checklist)│
└─────────────────┘      └────────────────────┘      └────────────────────┘      └────────────────────┘
```

1. **Telemetry Ingestion**: Individual security events populate an unlinked alert queue.
2. **Correlation Processing**: Evaluates common entities, time proximity, and malicious sequence patterns.
3. **Incident Detection**: Unifies related alerts into a single High-Risk incident card with timeline flow.
4. **Actionable Response**: Delivers MITRE ATT&CK mappings and interactive containment checklists.

---

## 🎯 Scenarios Included

1. **Account Compromise (High Risk)**:
   - 3× Failed Logins &rarr; Successful Login &rarr; Restricted File Download &rarr; 2.4 GB Egress Data Transfer
   - **Correlated Entities**: `User: john.doe` | `IP: 192.168.1.25`
   - **Outcome**: 🚨 *POTENTIAL ACCOUNT COMPROMISE* (Score: 100/100, High Risk)

2. **Malware Activity (High Risk)**:
   - Suspicious Executable &rarr; Trojan Signature &rarr; C2 Network Tunnel &rarr; Antivirus Defense Evasion
   - **Correlated Entities**: `Host: LAPTOP-101` | `IP: 10.0.0.45`
   - **Outcome**: ⚠️ *POTENTIAL MALWARE INCIDENT* (Score: 75/100, High Risk)

3. **Normal Activity (Low Risk Baseline)**:
   - Disparate SSO logins and file operations across Alice, Bob, and Charlie on separate machines
   - **Outcome**: ✓ *NO SIGNIFICANT INCIDENT DETECTED* (Score: 0/100, Normal Baseline)

---

## ⚙️ How to Run

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. (Optional) Configure AI Integration
The correlation engine and cybersecurity advisor run **100% offline out-of-the-box**.  
If you wish to test live OpenAI or Gemini analysis, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Add your API key inside `.env`:
```env
VITE_AI_API_KEY=your_api_key_here
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚡ 2-Minute Demo Flow for Judges

1. **Select Scenario**: Click **"Simulate Account Compromise"**.
2. **Observe Raw Events**: Review the 6 individual security alerts in the event table.
3. **Click Analyze & Correlate**: Watch the multi-stage scanner analyze attributes, proximity, and patterns.
4. **Inspect Correlated Incident**:
   - Notice the highlighted rows in the event table.
   - View the **Attack Progression Timeline**.
   - Check the **Correlation Scoring Matrix** modal (`Score: 100/100`).
   - Switch to the **AI Threat Intelligence Advisor** tab for MITRE ATT&CK mapping.
   - Check off containment tasks in the **SOC Incident Response** checklist.
5. **Verify Baseline Normalcy**: Click **"Simulate Normal Activity"** &rarr; **Analyze & Correlate** to demonstrate that non-correlated events correctly produce *"No Significant Incident Detected"*.

---

## 🔬 Prototype Scope

This project is a **functional hackathon proof of concept** designed for clear demonstration of security event correlation. It does not replace enterprise SIEMs or production EDR platforms.
