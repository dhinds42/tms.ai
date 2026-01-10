import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, FileText, Sparkles, Clock } from "lucide-react";
import { PageHeader } from "@/components/design-system";

import CarrierComplianceChecklist from "../components/carrier-compliance/CarrierComplianceChecklist";
import AutoComplianceMonitor from "../components/carrier-compliance/AutoComplianceMonitor";
import ComplianceAlertSystem from "../components/carrier-compliance/ComplianceAlertSystem";
import BulkComplianceUpload from "../components/carrier-compliance/BulkComplianceUpload";

export default function CarrierCompliance() {
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditResults, setAuditResults] = useState(null);

  const queryClient = useQueryClient();

  const { data: carriers, isLoading: carriersLoading } = useScopedEntity('Carrier', { limit: 100 });
  const { data: complianceItems, isLoading: complianceLoading } = useScopedEntity('ComplianceItem', { limit: 200 });

  const updateCarrierMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Carrier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
    },
  });

  const runComplianceAudit = async () => {
    setIsRunningAudit(true);

    try {
      const auditPromises = carriers.slice(0, 10).map(async (carrier) => {
        const carrierCompliance = complianceItems.filter(c => c.entity_id === carrier.id);
        
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a compliance auditor for freight carriers.

CARRIER: ${carrier.company_name}
MC: ${carrier.mc_number}
DOT: ${carrier.dot_number}

COMPLIANCE ITEMS:
${carrierCompliance.map(c => `
- ${c.compliance_type}: ${c.status}
  Expiration: ${c.expiration_date || 'N/A'}
`).join('\n')}

CARRIER DATA:
- Insurance Expiration: ${carrier.insurance_expiration || 'Not on file'}
- Insurance Amount: $${carrier.insurance_amount?.toLocaleString() || 'Unknown'}
- FMCSA Rating: ${carrier.fmcsa_safety_rating || 'Not rated'}
- Compliance Score: ${carrier.compliance_score || 0}%

AUDIT REQUIREMENTS:
1. Overall Compliance Status (COMPLIANT/AT_RISK/NON_COMPLIANT)
2. Critical Issues (immediate action items)
3. Expiring Soon (items expiring within 30 days)
4. Missing Documents (required docs not on file)
5. Action Items (prioritized list)
6. Compliance Score (0-100)
7. Risk Level (LOW/MEDIUM/HIGH/CRITICAL)
8. Recommendations (specific next steps)`,
          response_json_schema: {
            type: "object",
            properties: {
              compliance_status: { type: "string" },
              critical_issues: {
                type: "array",
                items: { type: "string" }
              },
              expiring_soon: {
                type: "array",
                items: { type: "string" }
              },
              missing_documents: {
                type: "array",
                items: { type: "string" }
              },
              action_items: {
                type: "array",
                items: { type: "string" }
              },
              compliance_score: { type: "number" },
              risk_level: { type: "string" },
              recommendations: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        });

        // Update carrier compliance score
        if (result.compliance_score) {
          updateCarrierMutation.mutate({
            id: carrier.id,
            data: { compliance_score: result.compliance_score }
          });
        }

        return {
          carrier_id: carrier.id,
          carrier_name: carrier.company_name,
          ...result
        };
      });

      const results = await Promise.all(auditPromises);
      setAuditResults(results);

    } catch (error) {
      console.error('Compliance audit error:', error);
      alert('Failed to run compliance audit');
    } finally {
      setIsRunningAudit(false);
    }
  };

  const criticalCarriers = carriers.filter(c => 
    (c.compliance_score || 0) < 70 || 
    !c.insurance_expiration ||
    (c.insurance_expiration && new Date(c.insurance_expiration) < new Date())
  );

  const compliantCarriers = carriers.filter(c => (c.compliance_score || 0) >= 90);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Carrier Compliance"
        subtitle={`Automated compliance monitoring • ${criticalCarriers.length} carriers need attention`}
        icon={Shield}
        primaryAction={{
          label: isRunningAudit ? 'Running Audit...' : 'Run AI Audit',
          icon: Sparkles,
          onClick: runComplianceAudit,
          disabled: isRunningAudit
        }}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Carriers</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{carriers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Compliant</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{compliantCarriers.length}</p>
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">At Risk</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{criticalCarriers.length}</p>
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Compliance</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {carriers.length > 0 
                      ? ((carriers.reduce((sum, c) => sum + (c.compliance_score || 0), 0) / carriers.length).toFixed(0))
                      : 0}%
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auto Monitor */}
        <AutoComplianceMonitor carriers={carriers} />

        {/* Bulk Upload */}
        <BulkComplianceUpload carriers={carriers} />

        {/* Audit Results */}
        {auditResults && (
          <ComplianceAlertSystem auditResults={auditResults} />
        )}

        {/* Compliance Checklist */}
        <CarrierComplianceChecklist 
          carriers={carriers} 
          complianceItems={complianceItems}
          isLoading={carriersLoading || complianceLoading}
        />

      </div>
    </div>
  );
}