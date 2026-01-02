import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, CheckCircle, Shield, Zap, TrendingUp, Loader2 } from "lucide-react";

export default function AISecurityAuditor() {
  const [auditResults, setAuditResults] = useState(null);
  const [auditing, setAuditing] = useState(false);

  const { data: auditLogs } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 500),
    initialData: []
  });

  const { data: memberships } = useQuery({
    queryKey: ['memberships'],
    queryFn: () => base44.entities.Membership.list('-created_date', 200),
    initialData: []
  });

  const { data: userRoles } = useQuery({
    queryKey: ['userRoles'],
    queryFn: () => base44.entities.UserRole.list('-created_date', 200),
    initialData: []
  });

  const runAIAudit = async () => {
    setAuditing(true);
    try {
      const accessDenials = auditLogs.filter(log => 
        log.action === 'ACCESS_DENIED' || log.metadata?.reason?.includes('permission')
      );
      
      const statusChanges = auditLogs.filter(log => log.action === 'STATUS_CHANGE');
      
      const recentActivity = auditLogs.slice(0, 100);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI security auditor for a multi-tenant TMS system with RBAC.

AUDIT LOGS SUMMARY:
- Total logs analyzed: ${auditLogs.length}
- Access denials: ${accessDenials.length}
- Status changes: ${statusChanges.length}
- Active memberships: ${memberships.filter(m => m.status === 'active').length}
- Locked memberships: ${memberships.filter(m => m.status === 'locked').length}
- Total role assignments: ${userRoles.length}

RECENT ACCESS DENIALS:
${accessDenials.slice(0, 10).map(log => `
- User: ${log.actor_email}
- Action: ${log.action}
- Entity: ${log.entity_type} (${log.entity_id})
- Reason: ${log.metadata?.reason || 'Unknown'}
- Time: ${log.created_date}
`).join('\n')}

RECENT STATUS CHANGES:
${statusChanges.slice(0, 10).map(log => `
- User: ${log.metadata?.user_email}
- From: ${log.before_values?.status} → To: ${log.after_values?.status}
- Reason: ${log.metadata?.reason}
- By: ${log.actor_email}
- Time: ${log.created_date}
`).join('\n')}

PERFORM COMPREHENSIVE SECURITY AUDIT:

1. **Access Pattern Analysis**
   - Identify unusual access denial patterns
   - Detect potential brute force attempts
   - Flag repeated permission violations

2. **Privilege Escalation Detection**
   - Check for suspicious role assignments
   - Identify users with excessive permissions
   - Flag admin role grants without justification

3. **Tenant Isolation Validation**
   - Verify no cross-org data access attempts
   - Check for org_id bypass attempts
   - Validate query filters working correctly

4. **Membership Lifecycle Issues**
   - Find locked users still attempting access
   - Detect offboarded users with active sessions
   - Check for stale memberships

5. **Compliance & Policy Violations**
   - Identify policy violations
   - Check for missing audit trails
   - Flag high-risk activities

6. **Threat Score** (0-100, where 0 = secure, 100 = critical)
   - Calculate overall security posture
   - Identify threat level

7. **Actionable Recommendations**
   - Immediate actions needed
   - Security improvements
   - Policy updates

Provide data-driven security insights with specific recommendations.`,
        response_json_schema: {
          type: "object",
          properties: {
            threat_score: {
              type: "number",
              description: "0-100 security score"
            },
            threat_level: {
              type: "string",
              enum: ["low", "medium", "high", "critical"]
            },
            summary: {
              type: "string"
            },
            access_patterns: {
              type: "object",
              properties: {
                unusual_denials: {
                  type: "array",
                  items: { type: "string" }
                },
                brute_force_attempts: {
                  type: "array",
                  items: { type: "string" }
                },
                repeated_violations: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            privilege_escalation: {
              type: "object",
              properties: {
                suspicious_grants: {
                  type: "array",
                  items: { type: "string" }
                },
                excessive_permissions: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            tenant_isolation: {
              type: "object",
              properties: {
                cross_org_attempts: {
                  type: "array",
                  items: { type: "string" }
                },
                isolation_score: {
                  type: "number"
                }
              }
            },
            compliance_issues: {
              type: "array",
              items: { type: "string" }
            },
            high_risk_activities: {
              type: "array",
              items: { type: "string" }
            },
            immediate_actions: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAuditResults(result);
    } catch (error) {
      console.error('AI audit error:', error);
      alert('Failed to run AI security audit');
    } finally {
      setAuditing(false);
    }
  };

  const getThreatColor = (level) => {
    switch(level) {
      case 'low': return 'text-emerald-600 bg-emerald-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">AI Security Auditor</h3>
                  <p className="text-sm text-slate-600">Intelligent threat detection and compliance monitoring</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={runAIAudit}
              disabled={auditing}
              className="bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              {auditing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" />Run Security Audit</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Total Logs</p>
            <p className="text-2xl font-bold text-indigo-600">{auditLogs.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Active Members</p>
            <p className="text-2xl font-bold text-emerald-600">{memberships.filter(m => m.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Locked Members</p>
            <p className="text-2xl font-bold text-amber-600">{memberships.filter(m => m.status === 'locked').length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Role Assignments</p>
            <p className="text-2xl font-bold text-blue-600">{userRoles.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Results */}
      {auditResults && (
        <>
          {/* Threat Score */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-purple-50">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase mb-2">Security Threat Score</p>
                  <div className="flex items-center gap-4">
                    <div className="text-6xl font-bold text-slate-900">{auditResults.threat_score}</div>
                    <Badge className={`text-lg px-4 py-2 ${getThreatColor(auditResults.threat_level)}`}>
                      {auditResults.threat_level?.toUpperCase()} RISK
                    </Badge>
                  </div>
                </div>
                <Shield className="w-24 h-24 text-purple-200" />
              </div>
              <p className="text-slate-700 mt-4">{auditResults.summary}</p>
            </CardContent>
          </Card>

          {/* Findings Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Access Patterns */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Access Pattern Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditResults.access_patterns?.unusual_denials?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Unusual Denials:</p>
                    <ul className="space-y-1">
                      {auditResults.access_patterns.unusual_denials.map((item, idx) => (
                        <li key={idx} className="text-sm text-amber-900 flex items-start gap-2 p-2 bg-amber-50 rounded">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {auditResults.access_patterns?.brute_force_attempts?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Brute Force Attempts:</p>
                    <ul className="space-y-1">
                      {auditResults.access_patterns.brute_force_attempts.map((item, idx) => (
                        <li key={idx} className="text-sm text-red-900 flex items-start gap-2 p-2 bg-red-50 rounded">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privilege Escalation */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600" />
                  Privilege Escalation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditResults.privilege_escalation?.suspicious_grants?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Suspicious Grants:</p>
                    <ul className="space-y-1">
                      {auditResults.privilege_escalation.suspicious_grants.map((item, idx) => (
                        <li key={idx} className="text-sm text-red-900 flex items-start gap-2 p-2 bg-red-50 rounded">
                          <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {auditResults.privilege_escalation?.excessive_permissions?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Excessive Permissions:</p>
                    <ul className="space-y-1">
                      {auditResults.privilege_escalation.excessive_permissions.map((item, idx) => (
                        <li key={idx} className="text-sm text-amber-900 flex items-start gap-2 p-2 bg-amber-50 rounded">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tenant Isolation */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Tenant Isolation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-600">Isolation Score</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {auditResults.tenant_isolation?.isolation_score || 100}/100
                  </Badge>
                </div>
                {auditResults.tenant_isolation?.cross_org_attempts?.length > 0 ? (
                  <ul className="space-y-1">
                    {auditResults.tenant_isolation.cross_org_attempts.map((item, idx) => (
                      <li key={idx} className="text-sm text-red-900 flex items-start gap-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-emerald-600">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No isolation violations detected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* High Risk Activities */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  High Risk Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditResults.high_risk_activities?.length > 0 ? (
                  <ul className="space-y-1">
                    {auditResults.high_risk_activities.map((item, idx) => (
                      <li key={idx} className="text-sm text-red-900 flex items-start gap-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-emerald-600">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No high-risk activities detected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Immediate Actions */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50 border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Zap className="w-5 h-5" />
                Immediate Actions Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {auditResults.immediate_actions?.map((action, idx) => (
                  <li key={idx} className="text-sm text-red-900 p-3 bg-white rounded-lg border border-red-200 font-semibold">
                    {idx + 1}. {action}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {auditResults.recommendations?.map((rec, idx) => (
                  <li key={idx} className="text-sm text-slate-700 p-3 bg-white rounded-lg border border-blue-200">
                    <span className="font-bold text-blue-600">{idx + 1}. </span>{rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

    </div>
  );
}