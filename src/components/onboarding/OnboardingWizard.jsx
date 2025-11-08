import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";

export default function OnboardingWizard({ onSave, onClose, isLoading }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: '',
    mc_number: '',
    dot_number: '',
    contact_name: '',
    email: '',
    phone: '',
    equipment_types: [],
    status: 'pending_approval',
    compliance_score: 0
  });

  const steps = [
    { num: 1, title: "Company Info", fields: ['company_name', 'mc_number', 'dot_number'] },
    { num: 2, title: "Contact Details", fields: ['contact_name', 'email', 'phone'] },
    { num: 3, title: "Equipment", fields: ['equipment_types'] },
    { num: 4, title: "Review", fields: [] }
  ];

  const equipmentOptions = [
    'cargo_van', 'sprinter', 'box_truck', 'dry_van', 'reefer', 'flatbed', 'step_deck', 'lowboy'
  ];

  const handleEquipmentToggle = (equipment) => {
    setFormData(prev => ({
      ...prev,
      equipment_types: prev.equipment_types.includes(equipment)
        ? prev.equipment_types.filter(e => e !== equipment)
        : [...prev.equipment_types, equipment]
    }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const isStepValid = () => {
    const currentStep = steps[step - 1];
    return currentStep.fields.every(field => {
      if (field === 'equipment_types') return formData.equipment_types.length > 0;
      return formData[field]?.trim();
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">
            Carrier Onboarding Wizard
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step > s.num ? 'bg-emerald-600 text-white' :
                  step === s.num ? 'bg-purple-600 text-white' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                <span className="text-xs font-medium text-slate-600 mt-2">{s.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 ${step > s.num ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px] py-4">
          
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 mb-4">Company Information</h3>
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  placeholder="ABC Trucking Co"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>MC Number *</Label>
                  <Input
                    value={formData.mc_number}
                    onChange={(e) => setFormData({...formData, mc_number: e.target.value})}
                    placeholder="MC-123456"
                  />
                </div>
                <div>
                  <Label>DOT Number *</Label>
                  <Input
                    value={formData.dot_number}
                    onChange={(e) => setFormData({...formData, dot_number: e.target.value})}
                    placeholder="DOT-789012"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 mb-4">Contact Details</h3>
              <div>
                <Label>Contact Name *</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@abctrucking.com"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="555-123-4567"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 mb-4">Equipment Types</h3>
              <p className="text-sm text-slate-600 mb-4">Select all equipment types this carrier operates:</p>
              <div className="grid grid-cols-2 gap-3">
                {equipmentOptions.map(equipment => (
                  <Button
                    key={equipment}
                    onClick={() => handleEquipmentToggle(equipment)}
                    variant="outline"
                    className={`justify-start ${
                      formData.equipment_types.includes(equipment)
                        ? 'border-purple-600 bg-purple-50 text-purple-900'
                        : 'border-slate-300'
                    }`}
                  >
                    {formData.equipment_types.includes(equipment) && (
                      <CheckCircle className="w-4 h-4 mr-2 text-purple-600" />
                    )}
                    <span className="capitalize">{equipment.replace(/_/g, ' ')}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 mb-4">Review & Submit</h3>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold uppercase">Company</p>
                    <p className="text-slate-900 font-medium">{formData.company_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 font-semibold uppercase">MC Number</p>
                      <p className="text-slate-900">{formData.mc_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-semibold uppercase">DOT Number</p>
                      <p className="text-slate-900">{formData.dot_number}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-semibold uppercase">Contact</p>
                    <p className="text-slate-900">{formData.contact_name} - {formData.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-semibold uppercase mb-2">Equipment</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.equipment_types.map(eq => (
                        <Badge key={eq} className="bg-purple-100 text-purple-700 capitalize">
                          {eq.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  ⚠️ This carrier will be submitted for approval. AI verification will run automatically.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isLoading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}