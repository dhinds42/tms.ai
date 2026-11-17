import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function OnboardingWizard({ onSave, onClose, isLoading }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: '',
    mc_number: '',
    dot_number: '',
    contact_name: '',
    email: '',
    phone: '',
    equipment_types: [],
    insurance_amount: '',
    insurance_expiration: '',
    w9_file: null,
    coi_file: null,
    fmcsa_safety_rating: 'satisfactory',
    payment_structure: 'percentage',
    payment_rate: 82
  });

  const [isAutoVetting, setIsAutoVetting] = useState(false);
  const [vettingResults, setVettingResults] = useState(null);

  const steps = [
    { number: 1, title: "Company Info", description: "Basic company details" },
    { number: 2, title: "Contact & Insurance", description: "Contact and insurance info" },
    { number: 3, title: "Equipment & Payment", description: "Equipment and payment terms" },
    { number: 4, title: "Documents & AI Vetting", description: "Upload docs and AI verification" },
    { number: 5, title: "Review", description: "Final review" }
  ];

  const equipmentOptions = [
    "cargo_van", "sprinter", "box_truck", "dry_van", 
    "reefer", "flatbed", "step_deck", "lowboy"
  ];

  const handleFileUpload = async (fileType, file) => {
    try {
      const { file_uri: file_url } = await base44.integrations.Core.UploadPrivateFile({ file });
      setFormData(prev => ({ ...prev, [`${fileType}_file`]: file_url }));
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file');
    }
  };

  const runAutoVetting = async () => {
    setIsAutoVetting(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI carrier vetting agent. Analyze this carrier application:

CARRIER INFO:
- Company: ${formData.company_name}
- MC: ${formData.mc_number}
- DOT: ${formData.dot_number}
- Safety Rating: ${formData.fmcsa_safety_rating}
- Insurance: $${formData.insurance_amount}
- Equipment: ${formData.equipment_types.join(', ')}

VERIFY AND ASSESS:
1. Auto-Approval Recommendation (APPROVE/REVIEW/REJECT)
2. Verification Score (0-100)
3. Background Check Status (PASS/FAIL/NEEDS_REVIEW)
4. Insurance Adequacy (SUFFICIENT/INSUFFICIENT)
5. Safety Record Assessment
6. Recommended Lane Restrictions (if any)
7. Required Actions (before approval)
8. Risk Flags (any concerns)

Be thorough and conservative. Flag any missing info or concerns.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendation: { type: "string" },
            verification_score: { type: "number" },
            background_check: { type: "string" },
            insurance_adequacy: { type: "string" },
            safety_assessment: { type: "string" },
            lane_restrictions: {
              type: "array",
              items: { type: "string" }
            },
            required_actions: {
              type: "array",
              items: { type: "string" }
            },
            risk_flags: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setVettingResults(result);

    } catch (error) {
      console.error('Auto-vetting error:', error);
      alert('Failed to run auto-vetting');
    } finally {
      setIsAutoVetting(false);
    }
  };

  const toggleEquipment = (equipment) => {
    setFormData(prev => ({
      ...prev,
      equipment_types: prev.equipment_types.includes(equipment)
        ? prev.equipment_types.filter(e => e !== equipment)
        : [...prev.equipment_types, equipment]
    }));
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      insurance_amount: formData.insurance_amount ? parseFloat(formData.insurance_amount) : null,
      payment_rate: formData.payment_rate ? parseFloat(formData.payment_rate) : null,
      status: vettingResults?.recommendation === 'APPROVE' ? 'active' : 'pending_approval',
      compliance_score: vettingResults?.verification_score || 0
    });
  };

  const progress = (currentStep / 5) * 100;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">
            Enhanced Carrier Onboarding
          </DialogTitle>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">
                Step {currentStep} of 5: {steps[currentStep - 1].title}
              </span>
              <span className="text-sm text-slate-500">{progress.toFixed(0)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="py-6">
          
          {/* Step 1: Company Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  placeholder="ABC Logistics Inc."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
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
                    placeholder="DOT-123456"
                  />
                </div>
              </div>
              <div>
                <Label>FMCSA Safety Rating</Label>
                <Select 
                  value={formData.fmcsa_safety_rating} 
                  onValueChange={(value) => setFormData({...formData, fmcsa_safety_rating: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                    <SelectItem value="unsatisfactory">Unsatisfactory</SelectItem>
                    <SelectItem value="not_rated">Not Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Insurance */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Contact Name *</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@abclogistics.com"
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
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Insurance Amount *</Label>
                  <Input
                    type="number"
                    value={formData.insurance_amount}
                    onChange={(e) => setFormData({...formData, insurance_amount: e.target.value})}
                    placeholder="1000000"
                  />
                </div>
                <div>
                  <Label>Insurance Expiration *</Label>
                  <Input
                    type="date"
                    value={formData.insurance_expiration}
                    onChange={(e) => setFormData({...formData, insurance_expiration: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Equipment & Payment */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Equipment Types *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {equipmentOptions.map((equipment) => (
                    <div
                      key={equipment}
                      onClick={() => toggleEquipment(equipment)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.equipment_types.includes(equipment)
                          ? 'bg-indigo-50 border-indigo-500'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-900 capitalize text-center">
                        {equipment.replace(/_/g, ' ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">Payment Terms</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Payment Structure</Label>
                    <Select 
                      value={formData.payment_structure} 
                      onValueChange={(value) => setFormData({...formData, payment_structure: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage of Load Revenue</SelectItem>
                        <SelectItem value="per_load">Flat Rate Per Load</SelectItem>
                        <SelectItem value="per_mile">Rate Per Mile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>
                      Payment Rate 
                      {formData.payment_structure === 'percentage' && ' (%)'}
                      {formData.payment_structure === 'per_mile' && ' ($/mile)'}
                      {formData.payment_structure === 'per_load' && ' ($)'}
                    </Label>
                    <Input
                      type="number"
                      value={formData.payment_rate}
                      onChange={(e) => setFormData({...formData, payment_rate: e.target.value})}
                      placeholder={
                        formData.payment_structure === 'percentage' ? '82' :
                        formData.payment_structure === 'per_mile' ? '1.50' :
                        '1200'
                      }
                    />
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  {formData.payment_structure === 'percentage' 
                    ? `Carrier receives ${formData.payment_rate}% of customer rate (broker keeps ${100 - formData.payment_rate}% margin)`
                    : formData.payment_structure === 'per_mile'
                    ? `Carrier paid $${formData.payment_rate} per mile driven`
                    : `Carrier paid $${formData.payment_rate} flat rate per load`}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Documents & AI Vetting */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>W-9 Form</Label>
                  <Input
                    type="file"
                    onChange={(e) => e.target.files && handleFileUpload('w9', e.target.files[0])}
                    accept=".pdf"
                  />
                  {formData.w9_file && (
                    <Badge className="mt-2 bg-emerald-100 text-emerald-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Uploaded
                    </Badge>
                  )}
                </div>
                <div>
                  <Label>Certificate of Insurance (COI)</Label>
                  <Input
                    type="file"
                    onChange={(e) => e.target.files && handleFileUpload('coi', e.target.files[0])}
                    accept=".pdf"
                  />
                  {formData.coi_file && (
                    <Badge className="mt-2 bg-emerald-100 text-emerald-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Uploaded
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-5 bg-purple-50 rounded-xl border-2 border-purple-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-purple-900">AI Auto-Vetting</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Run Scout AI to verify carrier credentials and assess risk
                    </p>
                  </div>
                  <Button
                    onClick={runAutoVetting}
                    disabled={isAutoVetting || !formData.mc_number || !formData.dot_number}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  >
                    {isAutoVetting ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                        Vetting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Run AI Vetting
                      </>
                    )}
                  </Button>
                </div>

                {vettingResults && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-900">Verification Score</span>
                      <span className={`text-3xl font-bold ${
                        vettingResults.verification_score >= 80 ? 'text-emerald-600' :
                        vettingResults.verification_score >= 60 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {vettingResults.verification_score}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-slate-600">Recommendation</p>
                        <Badge className={
                          vettingResults.recommendation === 'APPROVE' ? 'bg-emerald-600 text-white' :
                          vettingResults.recommendation === 'REVIEW' ? 'bg-amber-600 text-white' :
                          'bg-red-600 text-white'
                        }>
                          {vettingResults.recommendation}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Background Check</p>
                        <Badge className={
                          vettingResults.background_check === 'PASS' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-amber-100 text-amber-700'
                        }>
                          {vettingResults.background_check}
                        </Badge>
                      </div>
                    </div>
                    {vettingResults.risk_flags && vettingResults.risk_flags.length > 0 && (
                      <div className="p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-xs font-semibold text-red-900 mb-1">Risk Flags:</p>
                        <ul className="space-y-1">
                          {vettingResults.risk_flags.map((flag, idx) => (
                            <li key={idx} className="text-xs text-red-800">• {flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-300">
                <h3 className="font-bold text-emerald-900 mb-4 text-lg">Application Summary</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Company</p>
                    <p className="font-semibold text-slate-900">{formData.company_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">MC/DOT</p>
                    <p className="font-semibold text-slate-900">
                      {formData.mc_number} / {formData.dot_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Contact</p>
                    <p className="font-semibold text-slate-900">{formData.contact_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Email</p>
                    <p className="font-semibold text-slate-900">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Payment Terms</p>
                    <Badge className="bg-blue-600 text-white">
                      {formData.payment_structure === 'percentage' 
                        ? `${formData.payment_rate}% of revenue`
                        : formData.payment_structure === 'per_mile'
                        ? `$${formData.payment_rate}/mile`
                        : `$${formData.payment_rate}/load`}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Equipment</p>
                    <p className="font-semibold text-slate-900">
                      {formData.equipment_types.length} types
                    </p>
                  </div>
                </div>

                {vettingResults && (
                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-emerald-300">
                    <h4 className="font-semibold text-emerald-900 mb-2">AI Vetting Results</h4>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-600">Score</p>
                        <p className="text-2xl font-bold text-emerald-600">{vettingResults.verification_score}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Recommendation</p>
                        <Badge className="bg-emerald-600 text-white">
                          {vettingResults.recommendation}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        <DialogFooter>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {currentStep < 5 ? (
            <Button onClick={handleNext} className="bg-indigo-600 text-white">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isLoading ? 'Submitting...' : 'Complete Onboarding'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}