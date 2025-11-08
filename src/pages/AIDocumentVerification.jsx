import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, AlertTriangle, FileText, Sparkles, Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AIDocumentVerification() {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 100),
    initialData: [],
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Document.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: (data) => base44.entities.Document.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await createDocumentMutation.mutateAsync({
        document_type: 'other',
        file_url,
        file_name: file.name,
        verified: false
      });

      alert('Document uploaded successfully! Select it to verify.');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleVerifyDocument = async (doc) => {
    setSelectedDocument(doc);
    setVerifying(true);
    setVerificationResult(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI document verification agent for freight transportation.

DOCUMENT DETAILS:
- Type: ${doc.document_type}
- File Name: ${doc.file_name}
- Uploaded By: ${doc.uploaded_by || doc.created_by}
- Date: ${doc.created_date}
- Load ID: ${doc.load_id || 'N/A'}

VERIFICATION TASKS:

1. **Document Authenticity**
   - Check for signs of tampering or alteration
   - Verify document format matches industry standards
   - Assess completeness of required fields
   - Detect any suspicious patterns

2. **Data Validation**
   - Validate dates (logical sequence, not future dates)
   - Check signatures (present, legible)
   - Verify company names and addresses
   - Validate amounts and calculations
   - Check for required stamps/seals

3. **Compliance Check**
   - Ensure compliance with FMCSA regulations
   - Verify BOL/POD contains required information
   - Check insurance documentation validity
   - Validate carrier authority documentation

4. **Risk Assessment**
   - Flag any red flags or anomalies
   - Assess fraud risk (low, medium, high)
   - Identify missing critical information
   - Recommend actions if issues found

5. **Data Extraction**
   - Extract key data points from document
   - Structure data for database entry
   - Identify discrepancies with load data

Provide detailed verification report with pass/fail status and confidence score.`,
        file_urls: [doc.file_url],
        response_json_schema: {
          type: "object",
          properties: {
            verification_status: {
              type: "string",
              enum: ["verified", "rejected", "needs_review"]
            },
            confidence_score: {
              type: "number",
              description: "0-100"
            },
            authenticity_check: {
              type: "object",
              properties: {
                is_authentic: { type: "boolean" },
                tampering_detected: { type: "boolean" },
                details: { type: "string" }
              }
            },
            data_validation: {
              type: "object",
              properties: {
                dates_valid: { type: "boolean" },
                signatures_present: { type: "boolean" },
                amounts_valid: { type: "boolean" },
                issues: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            compliance_check: {
              type: "object",
              properties: {
                compliant: { type: "boolean" },
                missing_requirements: {
                  type: "array",
                  items: { type: "string" }
                },
                violations: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            risk_assessment: {
              type: "object",
              properties: {
                fraud_risk: {
                  type: "string",
                  enum: ["low", "medium", "high"]
                },
                red_flags: {
                  type: "array",
                  items: { type: "string" }
                },
                recommended_actions: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            extracted_data: {
              type: "object",
              properties: {
                shipper_name: { type: "string" },
                carrier_name: { type: "string" },
                load_number: { type: "string" },
                pickup_date: { type: "string" },
                delivery_date: { type: "string" },
                weight: { type: "string" },
                commodity: { type: "string" },
                rate: { type: "string" }
              }
            },
            summary: { type: "string" },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setVerificationResult(result);

      // Update document with verification results
      await updateDocumentMutation.mutateAsync({
        id: doc.id,
        data: {
          verified: result.verification_status === 'verified',
          extracted_data: result.extracted_data,
          notes: result.summary
        }
      });

    } catch (error) {
      console.error('Verification error:', error);
      alert('Failed to verify document');
    } finally {
      setVerifying(false);
    }
  };

  const unverifiedDocs = documents.filter(d => !d.verified);
  const verifiedDocs = documents.filter(d => d.verified);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent mb-2">
            AI Document Verification
          </h1>
          <p className="text-slate-600 text-lg">
            Automated document authenticity, compliance checking, and fraud detection
          </p>
          <Badge className="mt-3 bg-emerald-600">AI-Powered</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Unverified</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{unverifiedDocs.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Verified</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{verifiedDocs.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Docs</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{documents.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Upload Document for Verification</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Upload BOL, POD, insurance, or other documents for AI verification
                </p>
              </div>
              <div>
                <input
                  type="file"
                  id="doc-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={uploadingFile}
                />
                <label htmlFor="doc-upload">
                  <Button
                    asChild
                    disabled={uploadingFile}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg hover:shadow-emerald-500/50"
                  >
                    <span>
                      {uploadingFile ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Result */}
        {verificationResult && selectedDocument && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Verification Results: {selectedDocument.file_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <Badge className={
                  verificationResult.verification_status === 'verified' 
                    ? 'bg-emerald-600 text-white text-lg px-4 py-2'
                    : verificationResult.verification_status === 'rejected'
                    ? 'bg-red-600 text-white text-lg px-4 py-2'
                    : 'bg-amber-600 text-white text-lg px-4 py-2'
                }>
                  {verificationResult.verification_status === 'verified' && <CheckCircle className="w-4 h-4 mr-2" />}
                  {verificationResult.verification_status === 'rejected' && <AlertTriangle className="w-4 h-4 mr-2" />}
                  {verificationResult.verification_status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-slate-600">
                  Confidence: <strong>{verificationResult.confidence_score}%</strong>
                </span>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-lg p-4 border border-emerald-200">
                <h4 className="font-semibold text-slate-900 mb-2">Summary</h4>
                <p className="text-slate-700">{verificationResult.summary}</p>
              </div>

              {/* Checks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Authenticity Check
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Authentic:</span>
                      <Badge className={verificationResult.authenticity_check?.is_authentic ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                        {verificationResult.authenticity_check?.is_authentic ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tampering:</span>
                      <Badge className={verificationResult.authenticity_check?.tampering_detected ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}>
                        {verificationResult.authenticity_check?.tampering_detected ? 'Detected' : 'None'}
                      </Badge>
                    </div>
                    <p className="text-slate-600 mt-2">{verificationResult.authenticity_check?.details}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Data Validation
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Dates Valid:</span>
                      <Badge className={verificationResult.data_validation?.dates_valid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                        {verificationResult.data_validation?.dates_valid ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Signatures:</span>
                      <Badge className={verificationResult.data_validation?.signatures_present ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                        {verificationResult.data_validation?.signatures_present ? 'Present' : 'Missing'}
                      </Badge>
                    </div>
                    {verificationResult.data_validation?.issues?.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-red-700">Issues:</p>
                        <ul className="list-disc list-inside text-red-600">
                          {verificationResult.data_validation.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              {verificationResult.risk_assessment && (
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Risk Assessment
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Fraud Risk:</span>
                      <Badge className={
                        verificationResult.risk_assessment.fraud_risk === 'low' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : verificationResult.risk_assessment.fraud_risk === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }>
                        {verificationResult.risk_assessment.fraud_risk.toUpperCase()}
                      </Badge>
                    </div>
                    {verificationResult.risk_assessment.red_flags?.length > 0 && (
                      <div>
                        <p className="font-medium text-red-700 text-sm mb-1">Red Flags:</p>
                        <ul className="list-disc list-inside text-sm text-red-600">
                          {verificationResult.risk_assessment.red_flags.map((flag, idx) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {verificationResult.recommendations?.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-slate-900 mb-3">Recommendations</h4>
                  <ul className="space-y-1">
                    {verificationResult.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Document List */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Documents Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            {unverifiedDocs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <p>All documents verified! Upload new documents to verify.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unverifiedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">{doc.file_name}</p>
                        <p className="text-xs text-slate-500">
                          {doc.document_type} • {new Date(doc.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleVerifyDocument(doc)}
                      disabled={verifying}
                      size="sm"
                      className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                    >
                      {verifying && selectedDocument?.id === doc.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Verify
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}