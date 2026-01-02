import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowRight, Fuel, DollarSign, FileText } from "lucide-react";
import { PageHeader } from "@/components/design-system";

export default function CustomerOnboarding() {
  const [step, setStep] = useState(1);
  const [customerData, setCustomerData] = useState({
    party_id: '',
    default_payment_terms_days: 30,
    default_currency: 'USD',
    default_fsc_enabled: false,
    default_fsc_handling: 'SEPARATE',
    default_fsc_method: 'FLAT_PER_MILE'
  });
  const queryClient = useQueryClient();

  const createCustomerMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setStep(4);
    }
  });

  const steps = [
    { id: 1, name: 'Basic Info', icon: FileText },
    { id: 2, name: 'Payment Terms', icon: DollarSign },
    { id: 3, name: 'FSC Defaults', icon: Fuel },
    { id: 4, name: 'Complete', icon: CheckCircle }
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      createCustomerMutation.mutate(customerData);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Customer Onboarding"
        subtitle="Set up account defaults and preferences"
        icon={FileText}
        badge={step < 4 && <Badge className="bg-blue-600">Step {step} of 4</Badge>}
      />
      
      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Step {step} of 4</span>
                <span className="text-sm text-slate-600">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="flex justify-between">
              {steps.map((s) => (
                <div key={s.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    s.id < step ? 'bg-green-500' :
                    s.id === step ? 'bg-indigo-600' :
                    'bg-slate-200'
                  }`}>
                    {s.id < step ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : s.id === step ? (
                      <s.icon className="w-6 h-6 text-white" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    s.id <= step ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Company Name</Label>
                <Input 
                  placeholder="Enter your company name" 
                  value={customerData.party_id}
                  onChange={(e) => setCustomerData({...customerData, party_id: e.target.value})}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={customerData.default_currency} onValueChange={(val) => setCustomerData({...customerData, default_currency: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Default Payment Terms</Label>
                <Select 
                  value={customerData.default_payment_terms_days.toString()} 
                  onValueChange={(val) => setCustomerData({...customerData, default_payment_terms_days: parseInt(val)})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">Net 15 Days</SelectItem>
                    <SelectItem value="30">Net 30 Days</SelectItem>
                    <SelectItem value="45">Net 45 Days</SelectItem>
                    <SelectItem value="60">Net 60 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-blue-600" />
                Fuel Surcharge Defaults
              </CardTitle>
              <p className="text-sm text-slate-600">These settings will be used for new lanes</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900">Enable Fuel Surcharge</p>
                  <p className="text-sm text-slate-600">Apply FSC to new lane rates</p>
                </div>
                <Switch 
                  checked={customerData.default_fsc_enabled}
                  onCheckedChange={(val) => setCustomerData({...customerData, default_fsc_enabled: val})}
                />
              </div>

              {customerData.default_fsc_enabled && (
                <>
                  <div>
                    <Label>Default FSC Handling</Label>
                    <Select 
                      value={customerData.default_fsc_handling} 
                      onValueChange={(val) => setCustomerData({...customerData, default_fsc_handling: val})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCLUDED">Included in Rate</SelectItem>
                        <SelectItem value="SEPARATE">Separate Line Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {customerData.default_fsc_handling === 'SEPARATE' && (
                    <div>
                      <Label>Default FSC Method</Label>
                      <Select 
                        value={customerData.default_fsc_method} 
                        onValueChange={(val) => setCustomerData({...customerData, default_fsc_method: val})}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FLAT_PER_MILE">Flat Per Mile</SelectItem>
                          <SelectItem value="PERCENT_OF_LINEHAUL">Percent of Linehaul</SelectItem>
                          <SelectItem value="TABLE_LOOKUP">FSC Table</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Onboarding Complete!</h2>
              <p className="text-slate-600 mb-6">Your customer account has been successfully set up.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.href = '/CustomerLaneManagement'} className="bg-indigo-600">
                  Create Your First Lane
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/Dashboard'}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={step === 1 && !customerData.party_id}
              className="bg-indigo-600"
            >
              {step === 3 ? 'Complete Setup' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}