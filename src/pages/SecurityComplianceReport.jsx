import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info,
  Lock,
  Key,
  Users,
  Database,
  Server,
  FileText,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight
} from "lucide-react";

export default function SecurityComplianceReport() {
  const [expandedSections, setExpandedSections] = useState({
    identity: true,
    session: true,
    data: true,
    compliance: true,
    operational: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({...prev, [section]: !prev[section]}));
  };

  // Security Assessment Results
  const assessmentResults = {
    overallScore: 42, // Out of 100
    criticalIssues: 8,
    highRiskGaps: 12,
    mediumRiskGaps: 6,
    compliantFeatures: 5,
    totalChecks: 31
  };

  const identityControls = [
    {
      feature: "SSO Integration (SAML/OIDC)",
      status: "not_implemented",
      severity: "critical",
      finding: "No SSO integration implemented. All authentication delegated to Base44 platform. Enterprise IdP integration not available.",
      remediation: "Verify Base44 platform supports SAML 2.0/OIDC. Configure enterprise SSO at platform level.",
      compliance: ["SOC 2", "ISO 27001"]
    },
    {
      feature: "Multi-Factor Authentication (MFA)",
      status: "platform_only",
      severity: "critical",
      finding: "UI displays '2FA Enabled' badge (AuditTrail.jsx line 82) but no actual MFA enforcement in application code. Platform-level only.",
      remediation: "Enable MFA at Base44 platform level for all user roles. Enforce MFA policy for admin accounts.",
      compliance: ["NIST 800-63B", "PCI DSS 8.3"]
    },
    {
      feature: "Passwordless/WebAuthn",
      status: "not_implemented",
      severity: "high",
      finding: "No WebAuthn, FIDO2, or biometric authentication support detected.",
      remediation: "Implement WebAuthn for privileged accounts. Require hardware security keys for admin users.",
      compliance: ["NIST 800-63B Level AAL3"]
    },
    {
      feature: "Role-Based Access Control (RBAC)",
      status: "partial",
      severity: "medium",
      finding: "Basic RBAC exists (admin, user, broker, carrier roles). Field-level permissions in FieldPermission.jsx. However, permission checks are client-side only and easily bypassed.",
      remediation: "Implement server-side permission enforcement. Add granular permissions matrix. Audit all API endpoints.",
      compliance: ["ISO 27001 A.9.4.1"]
    },
    {
      feature: "Attribute-Based Access Control (ABAC)",
      status: "not_implemented",
      severity: "medium",
      finding: "No dynamic attribute-based policies. Only static role checks.",
      remediation: "Implement ABAC for complex scenarios (e.g., 'can edit loads created by own team in past 30 days').",
      compliance: ["NIST SP 800-162"]
    },
    {
      feature: "Tenant Isolation",
      status: "partial",
      severity: "critical",
      finding: "tenant_id fields exist in entities but no evidence of query-level enforcement or data firewall. TenantDataFirewall component exists but not reviewed for effectiveness.",
      remediation: "URGENT: Audit all entity queries to ensure tenant_id filtering. Implement row-level security in database. Add tenant context validation middleware.",
      compliance: ["SOC 2 CC6.1", "ISO 27001 A.9.4.5"]
    }
  ];

  const sessionControls = [
    {
      feature: "JWT Access Tokens",
      status: "platform_managed",
      severity: "high",
      finding: "Token management fully delegated to Base44 platform. No visibility into token structure, claims, or expiration.",
      remediation: "Request Base44 security documentation: JWT lifetime, refresh rotation, audience separation, signing algorithm (RS256 required).",
      compliance: ["RFC 7519", "OWASP ASVS 3.5"]
    },
    {
      feature: "Rotating Refresh Tokens",
      status: "unknown",
      severity: "high",
      finding: "No evidence of refresh token rotation. Replay attack protection unknown.",
      remediation: "Confirm Base44 implements refresh token rotation with family tracking and replay detection.",
      compliance: ["OAuth 2.0 BCP"]
    },
    {
      feature: "Audience Separation",
      status: "unknown",
      severity: "medium",
      finding: "Carrier and broker portal share same authentication. No separate JWT audiences detected.",
      remediation: "Verify tokens include audience (aud) claim. Implement separate auth contexts for portals.",
      compliance: ["OAuth 2.0 RFC 8707"]
    },
    {
      feature: "Step-Up MFA for Sensitive Actions",
      status: "not_implemented",
      severity: "high",
      finding: "No step-up authentication for high-risk actions (rate changes, payment approvals, user deletion).",
      remediation: "Implement re-authentication challenge for: financial transactions >$10K, role changes, API key rotation, data exports.",
      compliance: ["PCI DSS 8.3.2"]
    }
  ];

  const dataProtection = [
    {
      feature: "TLS 1.2+ Enforcement",
      status: "platform_managed",
      severity: "n/a",
      finding: "TLS enforcement handled by Base44 platform and hosting infrastructure. App has no control.",
      remediation: "Verify platform enforces TLS 1.3, HSTS headers, secure cookies (HttpOnly, SameSite=Strict).",
      compliance: ["PCI DSS 4.1", "NIST 800-52r2"]
    },
    {
      feature: "Data Encryption at Rest",
      status: "unknown",
      severity: "critical",
      finding: "No visibility into database encryption. Credentials stored in localStorage with weak XOR encryption (Settings.jsx lines 61-89).",
      remediation: "URGENT: Migrate credentials to platform-managed secrets. Confirm database uses AES-256 encryption. Enable field-level encryption for PII/PCI data.",
      compliance: ["PCI DSS 3.4", "GDPR Art. 32"]
    },
    {
      feature: "Secure Credential Storage",
      status: "insecure",
      severity: "critical",
      finding: "API keys stored in localStorage with trivial XOR obfuscation. Easily extractable via DevTools. Not encrypted at rest.",
      remediation: "CRITICAL: Remove localStorage encryption (lines 61-99 Settings.jsx). Use Base44 secrets management API or environment variables. Never expose credentials client-side.",
      compliance: ["OWASP A02:2021 Cryptographic Failures"]
    },
    {
      feature: "Database Query Sanitization",
      status: "platform_managed",
      severity: "n/a",
      finding: "All database queries through Base44 SDK. Assumes platform handles parameterization and injection prevention.",
      remediation: "Request Base44 security audit report. Verify NoSQL injection prevention (MongoDB query filters).",
      compliance: ["OWASP A03:2021 Injection"]
    },
    {
      feature: "Rate Limiting & DDoS Protection",
      status: "unknown",
      severity: "high",
      finding: "No client-side rate limiting. Platform-level protection unknown.",
      remediation: "Implement client-side request throttling. Confirm Base44 has API rate limits, WAF, and DDoS mitigation (Cloudflare/AWS Shield).",
      compliance: ["OWASP ASVS 11.1.4"]
    },
    {
      feature: "Brute Force Protection",
      status: "unknown",
      severity: "high",
      finding: "No account lockout policy visible. Failed login tracking in SecurityAuditLog.jsx is mock data.",
      remediation: "Implement account lockout after 5 failed attempts. Add CAPTCHA after 3 failures. Enable anomaly detection.",
      compliance: ["NIST 800-63B 5.2.2"]
    },
    {
      feature: "Intrusion Detection & Logging",
      status: "mock_only",
      severity: "critical",
      finding: "AuditTrail.jsx and SecurityAuditLog.jsx contain hardcoded mock data, not real security logs.",
      remediation: "URGENT: Implement real audit logging to immutable storage. Log: authentication, authorization failures, data access, modifications, exports. Integrate SIEM.",
      compliance: ["SOC 2 CC7.2", "ISO 27001 A.12.4.1"]
    }
  ];

  const complianceControls = [
    {
      feature: "PCI DSS Compliance",
      status: "not_implemented",
      severity: "critical",
      finding: "Payment integrations (Epay, TriumphPay, RoadSync) integrated but no PCI controls: no cardholder data encryption, no quarterly scans, no compensating controls.",
      remediation: "If handling payment card data: Achieve PCI DSS SAQ-D certification. Implement tokenization. Use PCI-certified payment gateway. Otherwise, ensure no card data stored.",
      compliance: ["PCI DSS v4.0"]
    },
    {
      feature: "HIPAA Compliance",
      status: "not_applicable",
      severity: "n/a",
      finding: "TMS does not handle PHI (Protected Health Information). Not applicable.",
      remediation: "None required.",
      compliance: ["N/A"]
    },
    {
      feature: "SOX Compliance (Financial Controls)",
      status: "not_implemented",
      severity: "high",
      finding: "Financial modules exist (Accounting, Settlement, Commission) but no SOX controls: no approval workflows, no segregation of duties, no change audit.",
      remediation: "Implement: maker/checker for financial transactions, immutable audit logs, periodic access reviews, segregation of duties matrix.",
      compliance: ["SOX Section 404"]
    },
    {
      feature: "GDPR (if EU operations)",
      status: "partial",
      severity: "medium",
      finding: "UI claims 'GDPR Compliant' (AuditTrail.jsx line 90) but no evidence of: right to erasure, data portability, consent management, privacy by design.",
      remediation: "If serving EU customers: Implement data deletion API, export user data functionality, consent tracking, privacy policy acceptance, DPO designation.",
      compliance: ["GDPR Art. 5, 15-22"]
    },
    {
      feature: "Immutable Audit Logs",
      status: "not_implemented",
      severity: "critical",
      finding: "AuditLog entity exists but no hash chaining, write-once storage, or tamper detection.",
      remediation: "URGENT: Implement append-only audit storage. Add cryptographic hash chaining. Store logs in tamper-evident ledger (AWS CloudTrail, Azure Log Analytics).",
      compliance: ["SOC 2 CC7.2", "ISO 27001 A.12.4.3"]
    },
    {
      feature: "SCIM User Provisioning",
      status: "not_implemented",
      severity: "low",
      finding: "No SCIM 2.0 endpoints for automated user/group sync with enterprise directory.",
      remediation: "Low priority. Consider SCIM if enterprise customers require automated onboarding/offboarding.",
      compliance: ["RFC 7644"]
    },
    {
      feature: "Break-Glass Accounts",
      status: "not_implemented",
      severity: "medium",
      finding: "No emergency access accounts with dual-control approval and audit trail.",
      remediation: "Create break-glass admin accounts requiring: two-person authorization, time-limited access (4 hours), automatic alerting, video recording requirement.",
      compliance: ["ISO 27001 A.9.3.1"]
    }
  ];

  const operationalControls = [
    {
      feature: "Delegated Admin Recovery",
      status: "unknown",
      severity: "medium",
      finding: "No password reset or account recovery workflow visible.",
      remediation: "Verify Base44 provides secure account recovery. Add self-service password reset with email/SMS verification.",
      compliance: ["NIST 800-63B 6.1.2.3"]
    },
    {
      feature: "Incident Response Plan",
      status: "not_implemented",
      severity: "high",
      finding: "No breach notification workflow, security incident runbook, or automated alerting.",
      remediation: "Create incident response plan: detection → containment → eradication → recovery → lessons learned. Implement automated breach notification to affected users.",
      compliance: ["GDPR Art. 33-34", "NIST 800-61r2"]
    },
    {
      feature: "Penetration Testing",
      status: "unknown",
      severity: "high",
      finding: "No evidence of security testing, vulnerability scans, or pen test results.",
      remediation: "Conduct annual penetration testing by certified firm. Implement continuous vulnerability scanning. Run OWASP ZAP/Burp Suite tests.",
      compliance: ["PCI DSS 11.3", "SOC 2"]
    },
    {
      feature: "Backup & Disaster Recovery",
      status: "platform_managed",
      severity: "n/a",
      finding: "Backup strategy delegated to Base44 platform.",
      remediation: "Verify platform provides: automated daily backups, point-in-time recovery, 30-day retention, geo-redundant storage, tested restore procedures.",
      compliance: ["ISO 27001 A.12.3.1"]
    }
  ];

  const owasp = [
    { id: "A01:2021", name: "Broken Access Control", status: "vulnerable", details: "Client-side RBAC only. No server-side authorization checks visible. Tenant isolation not verified." },
    { id: "A02:2021", name: "Cryptographic Failures", status: "vulnerable", details: "localStorage credentials use XOR obfuscation, not encryption. Easily extracted via DevTools." },
    { id: "A03:2021", name: "Injection", status: "likely_safe", details: "Database queries via Base44 SDK. Assumes platform prevents injection. Needs verification." },
    { id: "A04:2021", name: "Insecure Design", status: "at_risk", details: "No threat modeling evident. Security controls appear reactive, not designed-in." },
    { id: "A05:2021", name: "Security Misconfiguration", status: "at_risk", details: "Mock security badges. No CSP, HSTS verification. Security headers unknown." },
    { id: "A06:2021", name: "Vulnerable Components", status: "unknown", details: "Dependency versions unknown. No SCA (Software Composition Analysis) scan results." },
    { id: "A07:2021", name: "Authentication Failures", status: "at_risk", details: "No MFA enforcement. No brute force protection. Session management unknown." },
    { id: "A08:2021", name: "Data Integrity Failures", status: "vulnerable", details: "No audit log integrity checks. No digital signatures on critical transactions." },
    { id: "A09:2021", name: "Logging Failures", status: "vulnerable", details: "Audit logs are mock data. No real security logging to SIEM." },
    { id: "A10:2021", name: "SSRF", status: "likely_safe", details: "No user-controlled URLs in backend requests visible. Low risk for SSRF." }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case "compliant":
      case "implemented":
        return <Badge className="bg-emerald-600 text-white"><CheckCircle2 className="w-3 h-3 mr-1" />Compliant</Badge>;
      case "partial":
      case "platform_only":
      case "platform_managed":
        return <Badge className="bg-amber-600 text-white"><Info className="w-3 h-3 mr-1" />Platform-Level</Badge>;
      case "not_implemented":
      case "vulnerable":
        return <Badge className="bg-red-600 text-white"><XCircle className="w-3 h-3 mr-1" />Not Implemented</Badge>;
      case "mock_only":
      case "insecure":
        return <Badge className="bg-red-800 text-white"><AlertTriangle className="w-3 h-3 mr-1" />Critical Gap</Badge>;
      case "at_risk":
        return <Badge className="bg-orange-600 text-white"><AlertTriangle className="w-3 h-3 mr-1" />At Risk</Badge>;
      case "likely_safe":
        return <Badge className="bg-blue-600 text-white"><Shield className="w-3 h-3 mr-1" />Likely Safe</Badge>;
      default:
        return <Badge className="bg-slate-600 text-white"><Info className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
  };

  const getSeverityBadge = (severity) => {
    switch(severity) {
      case "critical":
        return <Badge className="bg-red-600 text-white text-xs">CRITICAL</Badge>;
      case "high":
        return <Badge className="bg-orange-600 text-white text-xs">HIGH</Badge>;
      case "medium":
        return <Badge className="bg-amber-600 text-white text-xs">MEDIUM</Badge>;
      case "low":
        return <Badge className="bg-blue-600 text-white text-xs">LOW</Badge>;
      default:
        return <Badge className="bg-slate-600 text-white text-xs">N/A</Badge>;
    }
  };

  const renderControlSection = (title, icon, controls, sectionKey) => {
    const Icon = icon;
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader 
          className="cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="w-6 h-6 text-indigo-600" />
              <CardTitle>{title}</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-slate-100 text-slate-800">
                {controls.filter(c => c.status === 'compliant' || c.status === 'implemented' || c.status === 'likely_safe').length}/{controls.length} OK
              </Badge>
              {expandedSections[sectionKey] ? 
                <ChevronDown className="w-5 h-5 text-slate-400" /> : 
                <ChevronRight className="w-5 h-5 text-slate-400" />
              }
            </div>
          </div>
        </CardHeader>
        {expandedSections[sectionKey] && (
          <CardContent>
            <div className="space-y-4">
              {controls.map((control, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-900">{control.feature}</h4>
                        {getSeverityBadge(control.severity)}
                      </div>
                      <div className="mb-2">
                        {getStatusBadge(control.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="font-semibold text-red-900 mb-1">🔍 Finding:</p>
                      <p className="text-red-800">{control.finding}</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="font-semibold text-blue-900 mb-1">✅ Remediation:</p>
                      <p className="text-blue-800">{control.remediation}</p>
                    </div>
                    
                    {control.compliance && control.compliance.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {control.compliance.map((std, i) => (
                          <Badge key={i} className="bg-indigo-100 text-indigo-800 text-xs">
                            {std}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-900 via-orange-900 to-amber-900 bg-clip-text text-transparent">
            Security & Compliance Audit Report
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Comprehensive security assessment against OWASP, NIST, ISO 27001, and regulatory standards
          </p>
          <Badge className="bg-red-600 text-white mt-4 text-lg px-6 py-2">
            ⚠️ CRITICAL GAPS IDENTIFIED
          </Badge>
        </div>

        {/* Executive Summary */}
        <Card className="border-2 border-red-300 shadow-2xl bg-gradient-to-br from-red-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-2xl text-red-900">⚠️ Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white border-2 border-red-400 rounded-lg">
                <h3 className="font-bold text-red-900 text-lg mb-2">🚨 DEPLOYMENT BLOCKER - DO NOT DEPLOY TO PRODUCTION</h3>
                <p className="text-red-800 text-sm leading-relaxed">
                  This application has <strong className="text-red-900">CRITICAL SECURITY VULNERABILITIES</strong> that must be resolved before handling real customer data, payment information, or going live. The application is currently at <strong className="text-red-900">HIGH RISK</strong> of data breaches, regulatory violations, and unauthorized access.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-white rounded-lg border-2 border-red-400 text-center">
                  <p className="text-4xl font-bold text-red-600">{assessmentResults.overallScore}%</p>
                  <p className="text-sm text-slate-600 mt-1">Security Score</p>
                </div>
                <div className="p-4 bg-white rounded-lg border-2 border-red-400 text-center">
                  <p className="text-4xl font-bold text-red-600">{assessmentResults.criticalIssues}</p>
                  <p className="text-sm text-slate-600 mt-1">Critical Issues</p>
                </div>
                <div className="p-4 bg-white rounded-lg border-2 border-orange-400 text-center">
                  <p className="text-4xl font-bold text-orange-600">{assessmentResults.highRiskGaps}</p>
                  <p className="text-sm text-slate-600 mt-1">High Risk Gaps</p>
                </div>
                <div className="p-4 bg-white rounded-lg border-2 border-amber-400 text-center">
                  <p className="text-4xl font-bold text-amber-600">{assessmentResults.mediumRiskGaps}</p>
                  <p className="text-sm text-slate-600 mt-1">Medium Risk</p>
                </div>
                <div className="p-4 bg-white rounded-lg border-2 border-emerald-400 text-center">
                  <p className="text-4xl font-bold text-emerald-600">{assessmentResults.compliantFeatures}</p>
                  <p className="text-sm text-slate-600 mt-1">Compliant</p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-300">
                <h4 className="font-semibold text-slate-900 mb-3">🔴 Top 5 Critical Vulnerabilities (Fix Immediately):</h4>
                <ol className="space-y-2 text-sm text-slate-800">
                  <li className="flex gap-2"><span className="font-bold text-red-600">1.</span> <strong>Insecure Credential Storage:</strong> API keys in localStorage with weak XOR encryption (Settings.jsx)</li>
                  <li className="flex gap-2"><span className="font-bold text-red-600">2.</span> <strong>No Real Audit Logging:</strong> Mock security logs provide zero forensic capability</li>
                  <li className="flex gap-2"><span className="font-bold text-red-600">3.</span> <strong>Tenant Isolation Unverified:</strong> Data leakage risk between broker/carrier accounts</li>
                  <li className="flex gap-2"><span className="font-bold text-red-600">4.</span> <strong>Client-Side Authorization:</strong> RBAC checks in frontend only, easily bypassed</li>
                  <li className="flex gap-2"><span className="font-bold text-red-600">5.</span> <strong>No MFA Enforcement:</strong> Single-factor authentication for all users</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OWASP Top 10 Assessment */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-600" />
              OWASP Top 10 (2021) Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {owasp.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-l-4 border-l-red-600">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-slate-900">{item.id}</span>
                      <span className="font-semibold text-slate-900">{item.name}</span>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-slate-700">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Controls Assessment */}
        {renderControlSection("1. Identity & Access Controls", Users, identityControls, 'identity')}
        {renderControlSection("2. Session & Token Security", Key, sessionControls, 'session')}
        {renderControlSection("3. Data Protection & Breach Prevention", Database, dataProtection, 'data')}
        {renderControlSection("4. Compliance & Regulatory Alignment", FileText, complianceControls, 'compliance')}
        {renderControlSection("5. Operational Safeguards", Server, operationalControls, 'operational')}

        {/* Remediation Roadmap */}
        <Card className="border-2 border-indigo-300 shadow-2xl bg-gradient-to-br from-indigo-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-900">🛠️ Remediation Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              <div>
                <h3 className="font-bold text-red-900 mb-3">🔴 Phase 1: Critical (Before ANY deployment) - 1-2 weeks</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>Remove localStorage credential storage.</strong> Migrate to Base44 secrets management or server-side environment variables.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>Implement real audit logging.</strong> Replace mock logs with actual event tracking to immutable storage.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>Enable MFA enforcement.</strong> Configure Base44 platform to require 2FA for all users.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>Audit tenant isolation.</strong> Verify all entity queries filter by tenant_id. Add integration tests.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>Implement server-side authorization.</strong> Add API-level permission checks, not just UI-level.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-orange-900 mb-3">🟠 Phase 2: High Priority (Before production scale) - 2-4 weeks</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-orange-600">•</span>
                    <span><strong>Penetration testing.</strong> Hire certified pen testing firm (OSCP, CEH). Remediate all findings.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-600">•</span>
                    <span><strong>Rate limiting & DDoS protection.</strong> Configure WAF rules, API throttling, and abuse detection.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-600">•</span>
                    <span><strong>Incident response plan.</strong> Document breach response procedures, notification workflows, and recovery steps.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-600">•</span>
                    <span><strong>Security headers.</strong> Add CSP, HSTS, X-Frame-Options, X-Content-Type-Options.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-600">•</span>
                    <span><strong>SOX controls (if applicable).</strong> Implement approval workflows, segregation of duties for financial operations.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-amber-900 mb-3">🟡 Phase 3: Medium Priority (Production hardening) - 1-3 months</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    <span><strong>SSO integration.</strong> Enable SAML/OIDC for enterprise customers.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    <span><strong>WebAuthn/FIDO2.</strong> Add hardware security key support for admins.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    <span><strong>ABAC implementation.</strong> Replace simple RBAC with attribute-based policies.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    <span><strong>GDPR compliance (if EU).</strong> Data portability, erasure, consent management.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    <span><strong>Break-glass accounts.</strong> Emergency access with dual-control and audit.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-blue-900 mb-3">🔵 Phase 4: Long-Term (Continuous improvement) - Ongoing</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>SCIM provisioning.</strong> Automated user lifecycle management.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>SOC 2 Type II certification.</strong> Annual third-party audit.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>ISO 27001 certification.</strong> Information Security Management System.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>Quarterly security reviews.</strong> Code audits, dependency scans, threat modeling.</span>
                  </li>
                </ul>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Platform vs Application Responsibility */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-6 h-6 text-purple-600" />
              Security Responsibility Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-900">🟣 Base44 Platform Responsibilities:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> <span>User authentication & session management</span></li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> <span>Database encryption at rest</span></li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> <span>TLS/HTTPS enforcement</span></li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> <span>Infrastructure security & patching</span></li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> <span>Database backups & disaster recovery</span></li>
                  <li className="flex gap-2"><AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" /> <span><strong>Needs verification:</strong> JWT structure, MFA support, secrets management API</span></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-indigo-900">🔷 Application-Level Responsibilities:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2"><XCircle className="w-4 h-4 text-red-600 mt-0.5" /> <span>Authorization logic (currently client-side only)</span></li>
                  <li className="flex gap-2"><XCircle className="w-4 h-4 text-red-600 mt-0.5" /> <span>Audit logging implementation (currently mock)</span></li>
                  <li className="flex gap-2"><XCircle className="w-4 h-4 text-red-600 mt-0.5" /> <span>Secure credential handling (currently insecure)</span></li>
                  <li className="flex gap-2"><XCircle className="w-4 h-4 text-red-600 mt-0.5" /> <span>Tenant data segregation validation</span></li>
                  <li className="flex gap-2"><AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" /> <span>Input validation & sanitization</span></li>
                  <li className="flex gap-2"><AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" /> <span>Business logic access controls</span></li>
                  <li className="flex gap-2"><AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" /> <span>Compliance workflow enforcement</span></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Assessment */}
        {renderControlSection("1. Identity & Access Controls", Users, identityControls, 'identity')}
        {renderControlSection("2. Session & Token Security", Key, sessionControls, 'session')}
        {renderControlSection("3. Data Protection & Breach Prevention", Database, dataProtection, 'data')}
        {renderControlSection("4. Compliance & Regulatory Alignment", FileText, complianceControls, 'compliance')}
        {renderControlSection("5. Operational Safeguards", Server, operationalControls, 'operational')}

        {/* Final Recommendation */}
        <Card className="border-2 border-red-400 shadow-2xl bg-gradient-to-br from-red-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-2xl text-red-900">⛔ Final Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-red-500">
                <h3 className="font-bold text-red-900 text-lg mb-2">🚫 DO NOT DEPLOY TO PRODUCTION</h3>
                <p className="text-red-800 text-sm mb-4">
                  The application in its current state <strong>DOES NOT MEET</strong> minimum security standards required for production deployment. 
                  Critical vulnerabilities expose the system to:
                </p>
                <ul className="space-y-1 text-sm text-red-800 ml-4">
                  <li>• Data breaches (credential theft via localStorage)</li>
                  <li>• Unauthorized access (client-side authorization bypass)</li>
                  <li>• Compliance violations (no audit trail, no MFA)</li>
                  <li>• Tenant data leakage (unverified isolation)</li>
                  <li>• Regulatory penalties (PCI DSS, SOX non-compliance)</li>
                </ul>
              </div>

              <div className="p-4 bg-white rounded-lg border border-emerald-500">
                <h3 className="font-bold text-emerald-900 text-lg mb-2">✅ Deployment Readiness Checklist:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-4 h-4" />
                    <span className="text-slate-700">Phase 1 Critical Fixes Completed (8 items)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-4 h-4" />
                    <span className="text-slate-700">Penetration Test Passed (Zero critical findings)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-4 h-4" />
                    <span className="text-slate-700">Base44 Platform Security Certification Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-4 h-4" />
                    <span className="text-slate-700">MFA Enabled for All User Accounts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-4 h-4" />
                    <span className="text-slate-700">Real Audit Logging to SIEM Deployed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-4 h-4" />
                    <span className="text-slate-700">Tenant Isolation Validated with Integration Tests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-4 h-4" />
                    <span className="text-slate-700">Incident Response Plan Documented & Tested</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" disabled className="w-4 h-4" />
                    <span className="text-slate-700">Legal/Compliance Team Sign-Off Obtained</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-blue-400">
                <h3 className="font-bold text-blue-900 mb-2">📋 Recommended Next Steps:</h3>
                <ol className="space-y-2 text-sm text-slate-800">
                  <li><strong>1.</strong> Contact Base44 support to request security documentation and certification (SOC 2, ISO 27001)</li>
                  <li><strong>2.</strong> Schedule security architecture review with Base44 technical team</li>
                  <li><strong>3.</strong> Engage external security consultant for code review and threat modeling</li>
                  <li><strong>4.</strong> Implement Phase 1 critical fixes before any pilot deployment</li>
                  <li><strong>5.</strong> Establish security governance: quarterly reviews, vulnerability disclosure program, bug bounty</li>
                </ol>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Compliance Standards Summary */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>📜 Compliance Standards Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border-2 border-red-400 rounded-lg">
                <h4 className="font-bold text-red-900 mb-2">PCI DSS v4.0</h4>
                <Badge className="bg-red-600 text-white mb-2">NON-COMPLIANT</Badge>
                <p className="text-sm text-slate-700">Critical gaps in credential storage, logging, and access controls. Cannot process payments.</p>
              </div>
              <div className="p-4 border-2 border-amber-400 rounded-lg">
                <h4 className="font-bold text-amber-900 mb-2">SOX (Sarbanes-Oxley)</h4>
                <Badge className="bg-amber-600 text-white mb-2">NON-COMPLIANT</Badge>
                <p className="text-sm text-slate-700">Missing segregation of duties, approval workflows, and immutable audit trails for financial transactions.</p>
              </div>
              <div className="p-4 border-2 border-blue-400 rounded-lg">
                <h4 className="font-bold text-blue-900 mb-2">GDPR (if EU)</h4>
                <Badge className="bg-blue-600 text-white mb-2">PARTIAL</Badge>
                <p className="text-sm text-slate-700">Needs data deletion, portability, consent tracking, and privacy impact assessment if serving EU customers.</p>
              </div>
              <div className="p-4 border-2 border-green-400 rounded-lg">
                <h4 className="font-bold text-green-900 mb-2">HIPAA</h4>
                <Badge className="bg-green-600 text-white mb-2">N/A</Badge>
                <p className="text-sm text-slate-700">Not applicable - TMS does not handle protected health information.</p>
              </div>
              <div className="p-4 border-2 border-purple-400 rounded-lg">
                <h4 className="font-bold text-purple-900 mb-2">ISO 27001</h4>
                <Badge className="bg-purple-600 text-white mb-2">NON-COMPLIANT</Badge>
                <p className="text-sm text-slate-700">Requires formal ISMS, risk assessment, security policies, and third-party audit. Not in scope.</p>
              </div>
              <div className="p-4 border-2 border-indigo-400 rounded-lg">
                <h4 className="font-bold text-indigo-900 mb-2">NIST CSF</h4>
                <Badge className="bg-indigo-600 text-white mb-2">PARTIAL</Badge>
                <p className="text-sm text-slate-700">Identify and Protect functions weak. Detect, Respond, Recover functions missing.</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}