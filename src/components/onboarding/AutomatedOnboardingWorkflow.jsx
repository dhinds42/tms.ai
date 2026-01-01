import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertTriangle, Zap, FileText, Shield, Award } from "lucide-react";

export default function AutomatedOnboardingWorkflow({ driverId, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();

  const steps = [
    { id: 'documents', label: 'Document Verification', icon: FileText, auto: true },
    { id: 'compliance', label: 'Compliance Check', icon: Shield, auto: true },
    { id: 'training', label: 'Training Assignment', icon: Award, auto: false },
    { id: 'policy', label: 'Policy Setup', icon: CheckCircle, auto: true }
  ];

  const processStepMutation = useMutation({
    mutationFn: async (stepId) => {
      switch (stepId) {
        case 'documents':
          // Auto-verify uploaded documents using AI
          const docs = await base44.entities.Document.filter({ 
            entity_type: 'driver', 
            entity_id: driverId 
          });
          
          for (const doc of docs) {
            if (!doc.verified) {
              // AI verification
              const verification = await base44.integrations.Core.InvokeLLM({
                prompt: `Verify this driver document is valid and not expired. Document type: ${doc.document_type}. Expiration date: ${doc.expiration_date || 'Not provided'}. Is this document valid for driver onboarding?`,
                response_json_schema: {
                  type: "object",
                  properties: {
                    is_valid: { type: "boolean" },
                    reason: { type: "string" },
                    expiry_warning: { type: "boolean" }
                  }
                }
              });

              await base44.entities.Document.update(doc.id, {
                verified: verification.is_valid,
                verification_notes: verification.reason
              });
            }
          }
          return { success: true, message: 'Documents verified' };

        case 'compliance':
          // Auto-create compliance items
          const driver = await base44.entities.Driver.filter({ id: driverId });
          const complianceItems = [
            { item_type: 'medical_card', status: driver[0].medical_card_expiration ? 'compliant' : 'pending' },
            { item_type: 'cdl_license', status: driver[0].cdl_expiration ? 'compliant' : 'pending' },
            { item_type: 'drug_test', status: 'pending' }
          ];

          for (const item of complianceItems) {
            await base44.entities.ComplianceItem.create({
              entity_type: 'driver',
              entity_id: driverId,
              ...item
            });
          }
          return { success: true, message: 'Compliance items created' };

        case 'training':
          // Manual step - carrier assigns training
          return { success: true, message: 'Training ready for assignment' };

        case 'policy':
          // Auto-assign default policies
          const policies = await base44.entities.CarrierDriverPolicy.filter({ 
            carrier_id: driver[0].party_id 
          });

          for (const policy of policies) {
            if (policy.enabled) {
              await base44.entities.DriverFeatureEligibility.create({
                driver_id: driverId,
                feature_key: policy.feature_key,
                eligible: false,
                reason: 'New driver - needs to complete minimum loads',
                metrics_snapshot: { completed_loads: 0 }
              });
            }
          }
          return { success: true, message: 'Policies configured' };

        default:
          return { success: false, message: 'Unknown step' };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['driver', driverId]);
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete && onComplete();
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          Automated Onboarding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isComplete = idx < currentStep;
            const isCurrent = idx === currentStep;
            
            return (
              <div
                key={step.id}
                className={`p-4 rounded-lg border-2 ${
                  isComplete ? 'bg-green-50 border-green-200' :
                  isCurrent ? 'bg-blue-50 border-blue-300' :
                  'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isComplete ? 'bg-green-600' :
                      isCurrent ? 'bg-blue-600' :
                      'bg-slate-400'
                    }`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{step.label}</p>
                      {step.auto && (
                        <Badge className="mt-1 bg-purple-500 text-xs">Auto</Badge>
                      )}
                    </div>
                  </div>
                  {isComplete && <CheckCircle className="w-6 h-6 text-green-600" />}
                  {isCurrent && (
                    <Button
                      size="sm"
                      onClick={() => processStepMutation.mutate(step.id)}
                      disabled={processStepMutation.isPending}
                      className="bg-blue-600"
                    >
                      {processStepMutation.isPending ? 'Processing...' : 'Process'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}