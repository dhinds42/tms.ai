import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, CheckCircle, XCircle, AlertTriangle, Download, Eye, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DocumentVerification({ carrier, complianceItems, onClose, onApprove, onReject }) {
  const [verifying, setVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState(null);

  const runDocumentVerification = async () => {
    setVerifying(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI document verification agent for carrier onboarding.

CARRIER: ${carrier.company_name}
MC/DOT: ${carrier.mc_number} / ${carrier.dot_number}

DOCUMENTS:
- W-9: ${carrier.w9_url ? 'Uploaded' : 'Missing'}
- COI: ${carrier.coi_url ? 'Uploaded' : 'Missing'}
- Insurance Amount: $${carrier.insurance_amount?.toLocaleString()}
- Insurance Expiration: ${carrier.insurance_expiration || 'Not provided'}
- Safety Rating: ${carrier.fmcsa_safety_rating}

COMPLIANCE ITEMS:
${complianceItems.length > 0 ? complianceItems.map(c => `
- ${c.compliance_type}: ${c.status} (Expires: ${c.expiration_date || 'N/A'})
`).join('\n') : '- No compliance items recorded'}

VERIFY ALL DOCUMENTS AND COMPLIANCE:

1. Document Completeness (all required docs present?)
2. Insurance Adequacy (meets minimum $1M cargo + $100K general liability?)
3. Expiration Dates (any expired or expiring soon?)
4. Compliance Status (any missing required items?)
5. Red Flags (any concerns or suspicious items?)
6. Overall Readiness (ready for approval?)
7. Required Actions (what needs to be done before approval?)
8. Approval Recommendation (APPROVE / CONDITIONAL / REJECT)

Be thorough and flag ANY concerns.`,
        response_json_schema: {
          type: "object",
          properties: {
            document_completeness: { type: "boolean" },
            completeness_issues: {
              type: "array",
              items: { type: "string" }
            },
            insurance_adequate: { type: "boolean" },
            insurance_notes: { type: "string" },
            expiration_concerns: {
              type: "array",
              items: { type: "string" }
            },
            compliance_issues: {
              type: "array",
              items: { type: "string" }
            },
            red_flags: {
              type: "array",
              items: { type: "string" }
            },
            overall_ready: { type: "boolean" },
            required_actions: {
              type: "array",
              items: { type: "string" }
            },
            recommendation: { type: "string" },
            confidence_score: { type: "number" }
          }
        }
      });

      setVerificationResults(result);

    } catch (error) {
      console.error('Document verification error:', error);
      alert('Failed to verify documents');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Document Verification: {carrier.company_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Carrier Summary */}
          <Card className="border-2 border-indigo-200 bg-indigo-50">
            <CardContent className="p-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Company</p>
                  <p className="font-bold text-slate-900">{carrier.company_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">MC/DOT</p>
                  <p className="font-semibold text-slate-900">
                    {carrier.mc_number} / {carrier.dot_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Safety Rating</p>
                  <Badge className={
                    carrier.fmcsa_safety_rating === 'satisfactory' ? 'bg-emerald-600' : 'bg-amber-600'
                  }>
                    {carrier.fmcsa_safety_rating}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Insurance</p>
                  <p className="font-semibold text-slate-900">
                    ${(carrier.insurance_amount / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className={carrier.w9_url ? "w-5 h-5 text-emerald-600" : "w-5 h-5 text-slate-400"} />
                    <div>
                      <p className="font-semibold text-slate-900">W-9 Form</p>
                      <p className="text-xs text-slate-600">Tax information document</p>
                    </div>
                  </div>
                  {carrier.w9_url ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                      <Button size="sm" variant="outline" asChild>
                        <a href={carrier.w9_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <Badge className="bg-red-100 text-red-700">
                      <XCircle className="w-3 h-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className={carrier.coi_url ? "w-5 h-5 text-emerald-600" : "w-5 h-5 text-slate-400"} />
                    <div>
                      <p className="font-semibold text-slate-900">Certificate of Insurance</p>
                      <p className="text-xs text-slate-600">Proof of insurance coverage</p>
                    </div>
                  </div>
                  {carrier.coi_url ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                      <Button size="sm" variant="outline" asChild>
                        <a href={carrier.coi_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <Badge className="bg-red-100 text-red-700">
                      <XCircle className="w-3 h-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Items */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {complianceItems.length > 0 ? (
                <div className="space-y-2">
                  {complianceItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm capitalize">
                          {item.compliance_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-slate-600">
                          Expires: {item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Badge className={
                        item.status === 'current' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'expiring_soon' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {item.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600 text-center py-4">
                  No compliance items recorded yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Verification */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="border-b border-purple-200 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Document Verification
                </CardTitle>
                <Button
                  onClick={runDocumentVerification}
                  disabled={verifying}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run AI Verification
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {verificationResults ? (
                <div className="space-y-4">
                  {/* Overall Status */}
                  <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-900">Verification Status</span>
                      <Badge className={
                        verificationResults.overall_ready ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                      }>
                        {verificationResults.overall_ready ? 'READY FOR APPROVAL' : 'REQUIRES ATTENTION'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-600">Confidence</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {verificationResults.confidence_score}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Recommendation</p>
                        <Badge className={
                          verificationResults.recommendation === 'APPROVE' ? 'bg-emerald-600 text-white' :
                          verificationResults.recommendation === 'CONDITIONAL' ? 'bg-amber-600 text-white' :
                          'bg-red-600 text-white'
                        }>
                          {verificationResults.recommendation}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Issues */}
                  {(!verificationResults.document_completeness || !verificationResults.insurance_adequate) && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-red-900 mb-2">Critical Issues</p>
                          <ul className="space-y-1 text-sm text-red-800">
                            {!verificationResults.document_completeness && verificationResults.completeness_issues?.map((issue, idx) => (
                              <li key={idx}>• {issue}</li>
                            ))}
                            {!verificationResults.insurance_adequate && (
                              <li>• {verificationResults.insurance_notes}</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Red Flags */}
                  {verificationResults.red_flags && verificationResults.red_flags.length > 0 && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-amber-900 mb-2">Red Flags</p>
                          <ul className="space-y-1 text-sm text-amber-800">
                            {verificationResults.red_flags.map((flag, idx) => (
                              <li key={idx}>• {flag}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Required Actions */}
                  {verificationResults.required_actions && verificationResults.required_actions.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-semibold text-blue-900 mb-2">Required Actions Before Approval:</p>
                      <ul className="space-y-1 text-sm text-blue-800">
                        {verificationResults.required_actions.map((action, idx) => (
                          <li key={idx}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600">
                  <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <p>Run AI verification to analyze all documents and compliance</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={onApprove}
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
            disabled={verificationResults && !verificationResults.overall_ready}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve Carrier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}