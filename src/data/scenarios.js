export const SCENARIOS = [
  {
    id: 'account_compromise',
    name: 'Account Compromise',
    badge: 'Credential Attack Chain',
    icon: 'ShieldAlert',
    description: 'Multiple failed brute force logins followed by successful authorization, file harvesting, and data exfiltration.',
    events: [
      {
        id: 'evt-101',
        time: '10:00',
        timestamp: 1700000000 + 0,
        eventType: 'Failed Login',
        user: 'john.doe',
        ip: '192.168.1.25',
        device: 'DESKTOP-AUTH-01',
        category: 'Authentication',
        severity: 'Low',
        rawDetails: 'Authentication failure: Bad password (attempt 1/5)'
      },
      {
        id: 'evt-102',
        time: '10:02',
        timestamp: 1700000000 + 120,
        eventType: 'Failed Login',
        user: 'john.doe',
        ip: '192.168.1.25',
        device: 'DESKTOP-AUTH-01',
        category: 'Authentication',
        severity: 'Low',
        rawDetails: 'Authentication failure: Bad password (attempt 2/5)'
      },
      {
        id: 'evt-103',
        time: '10:04',
        timestamp: 1700000000 + 240,
        eventType: 'Failed Login',
        user: 'john.doe',
        ip: '192.168.1.25',
        device: 'DESKTOP-AUTH-01',
        category: 'Authentication',
        severity: 'Medium',
        rawDetails: 'Authentication failure: Threshold reached (attempt 3/5)'
      },
      {
        id: 'evt-104',
        time: '10:06',
        timestamp: 1700000000 + 360,
        eventType: 'Successful Login',
        user: 'john.doe',
        ip: '192.168.1.25',
        device: 'DESKTOP-AUTH-01',
        category: 'Authentication',
        severity: 'Medium',
        rawDetails: 'Session established: Kerberos ticket granted for john.doe'
      },
      {
        id: 'evt-105',
        time: '10:08',
        timestamp: 1700000000 + 480,
        eventType: 'Suspicious File Download',
        user: 'john.doe',
        ip: '192.168.1.25',
        device: 'DESKTOP-AUTH-01',
        category: 'File Activity',
        severity: 'High',
        rawDetails: 'File download: /restricted/finance/q4_internal_ledger.enc'
      },
      {
        id: 'evt-106',
        time: '10:12',
        timestamp: 1700000000 + 720,
        eventType: 'Large Data Transfer',
        user: 'john.doe',
        ip: '192.168.1.25',
        device: 'DESKTOP-AUTH-01',
        category: 'Exfiltration',
        severity: 'High',
        rawDetails: 'Outbound egress: 2.4 GB transferred to unclassified IP'
      }
    ]
  },
  {
    id: 'malware_activity',
    name: 'Malware Activity',
    badge: 'Host Infection Chain',
    icon: 'Bug',
    description: 'Suspicious payload execution followed by signature alert, beaconing connection, and host process tampering.',
    events: [
      {
        id: 'evt-201',
        time: '14:00',
        timestamp: 1700000000 + 14400,
        eventType: 'Suspicious File Executed',
        user: 'system_svc',
        ip: '10.0.0.45',
        device: 'LAPTOP-101',
        category: 'Execution',
        severity: 'Medium',
        rawDetails: 'Process spawned: invoice_march_2026.pdf.exe from %temp%'
      },
      {
        id: 'evt-202',
        time: '14:03',
        timestamp: 1700000000 + 14580,
        eventType: 'Malware Signature Detected',
        user: 'system_svc',
        ip: '10.0.0.45',
        device: 'LAPTOP-101',
        category: 'EDR Alert',
        severity: 'High',
        rawDetails: 'Signature match: Trojan.Dropper.Win64 in memory space'
      },
      {
        id: 'evt-203',
        time: '14:05',
        timestamp: 1700000000 + 14700,
        eventType: 'Suspicious External Network Connection',
        user: 'system_svc',
        ip: '10.0.0.45',
        device: 'LAPTOP-101',
        category: 'C2 Communication',
        severity: 'High',
        rawDetails: 'Outbound TCP connection to malicious C2 domain on port 8443'
      },
      {
        id: 'evt-204',
        time: '14:08',
        timestamp: 1700000000 + 14880,
        eventType: 'Multiple Failed Security Processes',
        user: 'system_svc',
        ip: '10.0.0.45',
        device: 'LAPTOP-101',
        category: 'Defense Evasion',
        severity: 'High',
        rawDetails: 'Windows Defender service stopped unexpectedly (KillAV technique)'
      }
    ]
  },
  {
    id: 'normal_activity',
    name: 'Normal Activity',
    badge: 'Baseline Noise',
    icon: 'CheckCircle2',
    description: 'Uncorrelated standard operations across multiple users, independent IP addresses, and routine business tasks.',
    events: [
      {
        id: 'evt-301',
        time: '09:00',
        timestamp: 1700000000 + 0,
        eventType: 'Successful Login',
        user: 'alice',
        ip: '192.168.1.10',
        device: 'WORKSTATION-08',
        category: 'Authentication',
        severity: 'Info',
        rawDetails: 'SSO Login verified via Okta for alice@corp'
      },
      {
        id: 'evt-302',
        time: '09:15',
        timestamp: 1700000000 + 900,
        eventType: 'File Access',
        user: 'bob',
        ip: '192.168.1.35',
        device: 'WORKSTATION-22',
        category: 'File Activity',
        severity: 'Info',
        rawDetails: 'Read access to shared folder /marketing/brand_assets.zip'
      },
      {
        id: 'evt-303',
        time: '10:30',
        timestamp: 1700000000 + 5400,
        eventType: 'Successful Login',
        user: 'charlie',
        ip: '192.168.1.50',
        device: 'MACBOOK-PRO-04',
        category: 'Authentication',
        severity: 'Info',
        rawDetails: 'Standard VPN session established from approved subnet'
      }
    ]
  }
];
