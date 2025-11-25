import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Shield,
  Clock,
  Database,
  FileText,
  Trash2,
  Eye,
  Play,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { executeRetentionJob, previewRetentionJob } from "../components/data-retention/DataRetentionJob";

export default function DataRetentionPolicyPage() {
  const [previewResults, setPreviewResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handlePreview = async () => {
    setIsRunning(true);
    const results = await previewRetentionJob();
    setPreviewResults(results);
    setIsRunning(false);
  };

  // Policy documentation
  const policies = [
    {
      entity: 'Load',
      retention: '7 years',
      action: 'Anonymize',
      legal: 'FMCSA 49 CFR 371.3',
      fields: 'contact_person, special_instructions, check_calls',
      notes: 'Transaction records must be retained for minimum 3 years; we retain 7 years for compliance margin'
    },
    {
      entity: 'Document',
      retention: '7 years',
      action: 'Anonymize',
      legal: 'FMCSA 49 CFR 371.3, SOC 2',
      fields: 'extracted_data, notes',
      notes: 'BOL, POD, Rate Confirmations retained; PII in extracted data anonymized'
    },
    {
      entity: 'AuditLog',
      retention: '7 years',
      action: 'Anonymize',
      legal: 'SOC 2, ISO 27001',
      fields: 'ip_address, user_agent, details',
      notes: 'Audit trail preserved; IP addresses and user agents redacted after retention period'
    },
    {
      entity: 'SessionToken',
      retention: '90 days',
      action: 'Delete',
      legal: 'Security best practice',
      fields: 'All fields',
      notes: 'Expired session tokens permanently deleted for security'
    },
    {
      entity: 'UserConsent',
      retention: '7 years',
      action: 'Retain',
      legal: 'GDPR Art. 7, CCPA',
      fields: 'None (full retention)',
      notes: 'Consent records must be retained to prove lawful basis for processing'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Data Retention & Deletion Policy
            </h1>
            <p className="text-slate-600 mt-2">
              Compliance documentation for legal review
            </p>
          </div>
          <Badge className="bg-indigo-600">Version 1.0 | Nov 2025</Badge>
        </div>

        <Tabs defaultValue="policy">
          <TabsList>
            <TabsTrigger value="policy">📋 Policy Document</TabsTrigger>
            <TabsTrigger value="preview">🔍 Preview Job</TabsTrigger>
          </TabsList>

          <TabsContent value="policy" className="space-y-6">
            {/* Executive Summary */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>1. Executive Summary</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  This policy defines data retention periods and deletion/anonymization procedures for TMS.ai 
                  in compliance with FMCSA regulations (49 CFR Part 371), GDPR, CCPA, SOC 2, and ISO 27001.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-bold text-blue-900">Default Retention</h4>
                    <p className="text-2xl font-bold text-blue-600">7 Years</p>
                    <p className="text-xs text-blue-700">For transaction records</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h4 className="font-bold text-emerald-900">Primary Action</h4>
                    <p className="text-2xl font-bold text-emerald-600">Anonymize</p>
                    <p className="text-xs text-emerald-700">PII redacted, records preserved</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-bold text-purple-900">Job Frequency</h4>
                    <p className="text-2xl font-bold text-purple-600">Monthly</p>
                    <p className="text-xs text-purple-700">Automated execution</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policy Table */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>2. Retention Rules by Entity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border p-3 text-left">Entity</th>
                        <th className="border p-3 text-left">Retention</th>
                        <th className="border p-3 text-left">Action</th>
                        <th className="border p-3 text-left">Legal Basis</th>
                        <th className="border p-3 text-left">Affected Fields</th>
                      </tr>
                    </thead>
                    <tbody>
                      {policies.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="border p-3 font-bold">{p.entity}</td>
                          <td className="border p-3">
                            <Badge className="bg-blue-600">{p.retention}</Badge>
                          </td>
                          <td className="border p-3">
                            <Badge className={
                              p.action === 'Delete' ? 'bg-red-600' :
                              p.action === 'Anonymize' ? 'bg-amber-600' : 'bg-emerald-600'
                            }>{p.action}</Badge>
                          </td>
                          <td className="border p-3 text-xs">{p.legal}</td>
                          <td className="border p-3 text-xs font-mono">{p.fields}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Legal Requirements */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>3. Legal Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                  <h4 className="font-bold text-blue-900">FMCSA 49 CFR 371.3 - Record Retention</h4>
                  <p className="text-sm text-slate-700 mt-1">
                    Brokers must retain records of each transaction for a period of three years. 
                    Records must include: name/address of consignor/consignee, bill of lading, 
                    gross charges, and carrier identification.
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    <strong>TMS.ai Implementation:</strong> 7-year retention (exceeds requirement), 
                    anonymization preserves transaction records while removing PII.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600">
                  <h4 className="font-bold text-purple-900">GDPR Article 17 - Right to Erasure</h4>
                  <p className="text-sm text-slate-700 mt-1">
                    Data subjects have the right to obtain erasure of personal data without undue delay.
                    Exceptions apply when processing is necessary for legal compliance.
                  </p>
                  <p className="text-xs text-purple-700 mt-2">
                    <strong>TMS.ai Implementation:</strong> Legal hold process for FMCSA-required records,
                    immediate deletion for non-required data upon request.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-600">
                  <h4 className="font-bold text-emerald-900">SOC 2 / ISO 27001 - Audit Trails</h4>
                  <p className="text-sm text-slate-700 mt-1">
                    Audit logs must be retained for review and investigation purposes.
                    Logs should be protected from unauthorized modification.
                  </p>
                  <p className="text-xs text-emerald-700 mt-2">
                    <strong>TMS.ai Implementation:</strong> 7-year audit log retention,
                    IP addresses anonymized after retention period for privacy.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Procedures */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>4. Operational Procedures</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">4.1 Automated Retention Job</h4>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    <li>Runs monthly on the 1st at 02:00 UTC</li>
                    <li>Processes records older than configured retention period</li>
                    <li>Generates audit log of all actions taken</li>
                    <li>Sends summary report to compliance team</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">4.2 Manual Deletion Requests</h4>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    <li>DSAR requests processed within 30 days</li>
                    <li>Legal hold check performed before deletion</li>
                    <li>Confirmation sent to requestor upon completion</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">4.3 Legal Hold Process</h4>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    <li>Records flagged for legal hold exempt from automated deletion</li>
                    <li>Hold must be authorized by Legal/Compliance team</li>
                    <li>Hold reviewed quarterly and released when no longer required</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Approvals */}
            <Card className="border-0 shadow-xl bg-slate-50">
              <CardHeader>
                <CardTitle>5. Policy Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-xs text-slate-500">Prepared By</p>
                    <p className="font-bold">Engineering Team</p>
                    <p className="text-sm text-slate-600">November 2025</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-xs text-slate-500">Reviewed By</p>
                    <p className="font-bold">Legal / Compliance</p>
                    <p className="text-sm text-slate-600">Pending Review</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-xs text-slate-500">Approved By</p>
                    <p className="font-bold">Executive Leadership</p>
                    <p className="text-sm text-slate-600">Pending Approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Retention Job Preview</span>
                  <Button onClick={handlePreview} disabled={isRunning} className="bg-indigo-600">
                    {isRunning ? 'Running...' : 'Run Preview (Dry Run)'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewResults ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {previewResults.success ? (
                        <Badge className="bg-emerald-600"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>
                      ) : (
                        <Badge className="bg-red-600"><AlertTriangle className="w-3 h-3 mr-1" />Failed</Badge>
                      )}
                      <span className="text-sm text-slate-500">Dry run - no data modified</span>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      {Object.entries(previewResults.results || {}).map(([entity, stats]) => (
                        <div key={entity} className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-bold">{entity}</h4>
                          <p className="text-sm">Processed: {stats.processed}</p>
                          <p className="text-sm">Would Delete: {stats.deleted}</p>
                          <p className="text-sm">Would Anonymize: {stats.anonymized}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">Click "Run Preview" to see what would be affected</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}