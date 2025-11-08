import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Send, CheckCircle, Clock, AlertCircle, Sparkles, Loader2 } from "lucide-react";

export default function ContractManagement({ shippers, isLoading, operatingMode }) {
  const [generating, setGenerating] = useState(null);
  const [contracts, setContracts] = useState({});

  const generateContract = async (shipper) => {
    setGenerating(shipper.id);

    try {
      const contractType = operatingMode === 'broker' 
        ? 'Broker-Shipper Service Agreement'
        : 'Carrier-Shipper Transportation Agreement';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a legal contract AI assistant for ${operatingMode} operations.

Generate a comprehensive ${contractType} for the following shipper:

SHIPPER DETAILS:
- Company: ${shipper.company_name}
- Contact: ${shipper.contact_name}
- Address: ${shipper.address?.city}, ${shipper.address?.state}
- Payment Terms: ${shipper.payment_terms}
- Credit Limit: $${shipper.credit_limit?.toLocaleString() || 'Not set'}

CONTRACT REQUIREMENTS:

${operatingMode === 'broker' ? `
**BROKER-SHIPPER SERVICE AGREEMENT MUST INCLUDE:**

1. **Scope of Services**:
   - Freight brokerage services definition
   - Transportation arrangement responsibilities
   - Coverage areas and modes

2. **Load Tendering Procedures**:
   - How shipper tenders loads (portal, email, EDI)
   - Required load information
   - Acceptance timeframes
   - Load modification procedures

3. **Pricing & Billing**:
   - Rate quotation process
   - Rate confirmation requirements
   - Invoice submission timeline
   - Payment terms (${shipper.payment_terms})
   - Late payment penalties

4. **Proof of Delivery (POD) Requirements**:
   - POD submission deadline (typically 24-48 hours)
   - Required documentation
   - Electronic POD acceptance
   - Lost POD procedures

5. **Accessorial Charges**:
   - Definition of all accessorials:
     * Detention (after 2 hours free time)
     * Layover charges
     * Lumper fees
     * Inside delivery
     * Residential delivery
     * Liftgate service
     * Re-delivery charges
   - Notification and approval requirements
   - Documentation requirements

6. **Dispute Resolution**:
   - Dispute filing window (30-90 days from invoice date)
   - Dispute resolution process
   - Escalation procedures
   - Arbitration clause

7. **Liability & Insurance**:
   - Broker liability limitations
   - Carrier insurance requirements ($1M minimum)
   - Claims process and timeline
   - Claim documentation requirements

8. **Service Level Commitments**:
   - On-time delivery targets
   - Communication requirements
   - Tracking and visibility standards

9. **Termination Conditions**:
   - Notice period (typically 30 days)
   - Termination for cause
   - Outstanding obligations

10. **Legal Provisions**:
    - Governing law
    - Force majeure
    - Confidentiality
    - Independent contractor relationship
` : `
**CARRIER-SHIPPER TRANSPORTATION AGREEMENT MUST INCLUDE:**

1. **Transportation Services**:
   - Types of freight services offered
   - Equipment types available
   - Service territories

2. **Load Assignment & Acceptance**:
   - Load tender procedures
   - Driver assignment process
   - Load acceptance/rejection protocols
   - Rate confirmation requirements

3. **Pricing & Payment**:
   - Rate structure and calculation
   - Fuel surcharge policies
   - Payment terms (${shipper.payment_terms})
   - Invoice requirements

4. **Delivery Requirements**:
   - On-time delivery commitments
   - POD submission requirements
   - Appointment scheduling
   - Communication protocols

5. **Accessorial Services & Charges**:
   - Detention policies and rates
   - Lumper service handling
   - Special handling requirements
   - Additional service fees

6. **Claims & Liability**:
   - Cargo liability coverage
   - Damage claim procedures
   - Insurance requirements
   - Loss prevention measures

7. **Compliance & Safety**:
   - DOT/FMCSA compliance
   - Safety standards
   - Driver qualification requirements
   - Vehicle maintenance standards

8. **Dispute Resolution**:
   - Dispute notification requirements
   - Resolution timeline
   - Mediation/arbitration process

9. **Contract Terms**:
   - Contract duration
   - Renewal provisions
   - Termination conditions
   - Notice requirements
`}

Generate a professional, legally sound contract with:
- Clear section headers
- Numbered clauses
- Professional legal language
- All required provisions
- Signature blocks

Return the contract in structured sections.`,
        response_json_schema: {
          type: "object",
          properties: {
            contract_title: { type: "string" },
            effective_date: { type: "string" },
            parties: {
              type: "object",
              properties: {
                party1: { type: "string" },
                party2: { type: "string" }
              }
            },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section_number: { type: "string" },
                  section_title: { type: "string" },
                  content: { type: "string" }
                }
              }
            },
            signature_requirements: {
              type: "array",
              items: { type: "string" }
            },
            key_terms: {
              type: "object",
              properties: {
                payment_terms: { type: "string" },
                dispute_window: { type: "string" },
                pod_deadline: { type: "string" },
                termination_notice: { type: "string" }
              }
            }
          }
        }
      });

      setContracts(prev => ({
        ...prev,
        [shipper.id]: result
      }));

    } catch (error) {
      console.error('Contract generation error:', error);
      alert('Failed to generate contract');
    } finally {
      setGenerating(null);
    }
  };

  const getContractStatusBadge = (status) => {
    switch (status) {
      case 'signed': 
        return <Badge className="bg-emerald-600"><CheckCircle className="w-3 h-3 mr-1" /> Signed</Badge>;
      case 'pending_signature': 
        return <Badge className="bg-amber-600"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'expired': 
        return <Badge className="bg-red-600"><AlertCircle className="w-3 h-3 mr-1" /> Expired</Badge>;
      default: 
        return <Badge className="bg-slate-600"><FileText className="w-3 h-3 mr-1" /> Not Started</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading contract management...</div>;
  }

  const activeContracts = shippers.filter(s => s.contract_status === 'signed');
  const pendingContracts = shippers.filter(s => s.contract_status === 'pending_signature');
  const noContracts = shippers.filter(s => !s.contract_status || s.contract_status === 'not_started');

  return (
    <div className="space-y-6">
      
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-900 mb-1">Active Contracts</p>
                <p className="text-3xl font-bold text-emerald-600">{activeContracts.length}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-emerald-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">Pending Signature</p>
                <p className="text-3xl font-bold text-amber-600">{pendingContracts.length}</p>
              </div>
              <Clock className="w-12 h-12 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-1">Not Started</p>
                <p className="text-3xl font-bold text-slate-600">{noContracts.length}</p>
              </div>
              <FileText className="w-12 h-12 text-slate-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contract Type Info */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50 border-l-4 border-l-indigo-500">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-indigo-600 mt-1" />
            <div>
              <h4 className="font-bold text-indigo-900 mb-2">
                {operatingMode === 'broker' 
                  ? 'Broker-Shipper Service Agreement'
                  : 'Carrier-Shipper Transportation Agreement'}
              </h4>
              <p className="text-sm text-indigo-700 mb-3">
                {operatingMode === 'broker'
                  ? 'Comprehensive agreement covering load tendering, POD requirements, accessorials, and dispute resolution windows.'
                  : 'Transportation services agreement covering load assignments, delivery requirements, and compliance standards.'}
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-indigo-900 mb-1">Includes:</p>
                  <ul className="text-indigo-700 space-y-1">
                    <li>✓ Service scope definition</li>
                    <li>✓ Pricing & payment terms</li>
                    <li>✓ POD requirements & deadlines</li>
                    <li>✓ Accessorial charge definitions</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-indigo-900 mb-1">Key Provisions:</p>
                  <ul className="text-indigo-700 space-y-1">
                    <li>✓ Dispute resolution (30-90 day windows)</li>
                    <li>✓ Liability & insurance requirements</li>
                    <li>✓ Termination conditions</li>
                    <li>✓ E-signature workflow</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shippers Contract Status */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-6">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Contract Management Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {shippers.map((shipper) => {
              const contract = contracts[shipper.id];
              
              return (
                <div key={shipper.id} className="p-5 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-1">
                        {shipper.company_name}
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">{shipper.contact_name}</p>
                      <div className="flex items-center gap-2">
                        {getContractStatusBadge(shipper.contract_status)}
                        {shipper.contract_expiration_date && (
                          <span className="text-xs text-slate-600">
                            Expires: {new Date(shipper.contract_expiration_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!contract && (
                        <Button
                          onClick={() => generateContract(shipper)}
                          disabled={generating === shipper.id}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                        >
                          {generating === shipper.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Contract
                            </>
                          )}
                        </Button>
                      )}
                      {shipper.contract_document_url && (
                        <Button variant="outline" className="border-indigo-300 text-indigo-700">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>

                  {contract && (
                    <div className="mt-4 space-y-4">
                      <div className="p-4 bg-white rounded-xl border border-indigo-200">
                        <h5 className="font-bold text-slate-900 mb-2">{contract.contract_title}</h5>
                        <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-slate-600">Party 1: {contract.parties?.party1}</p>
                            <p className="text-slate-600">Party 2: {contract.parties?.party2}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Effective Date: {contract.effective_date}</p>
                          </div>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {contract.sections?.map((section, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                              <h6 className="font-semibold text-slate-900 mb-2">
                                {section.section_number}. {section.section_title}
                              </h6>
                              <p className="text-sm text-slate-700">{section.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {contract.key_terms && (
                        <div className="p-4 bg-indigo-50 rounded-xl">
                          <h6 className="font-semibold text-indigo-900 mb-3">Key Contract Terms</h6>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-indigo-700 font-medium">Payment Terms</p>
                              <p className="text-indigo-900">{contract.key_terms.payment_terms}</p>
                            </div>
                            <div>
                              <p className="text-indigo-700 font-medium">Dispute Window</p>
                              <p className="text-indigo-900">{contract.key_terms.dispute_window}</p>
                            </div>
                            <div>
                              <p className="text-indigo-700 font-medium">POD Deadline</p>
                              <p className="text-indigo-900">{contract.key_terms.pod_deadline}</p>
                            </div>
                            <div>
                              <p className="text-indigo-700 font-medium">Termination Notice</p>
                              <p className="text-indigo-900">{contract.key_terms.termination_notice}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                          <Send className="w-4 h-4 mr-2" />
                          Send for E-Signature
                        </Button>
                        <Button variant="outline" className="border-slate-300">
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}