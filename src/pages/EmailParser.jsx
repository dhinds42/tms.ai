import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EmailParser() {
  const [emailText, setEmailText] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();

  const createLoadMutation = useMutation({
    mutationFn: (loadData) => base44.entities.Load.create(loadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
    },
  });

  const parseEmail = async () => {
    setIsProcessing(true);
    setError(null);
    setExtractedData(null);

    try {
      const schema = await base44.entities.Load.schema();
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI assistant that extracts structured load data from emails or text messages about freight shipments.

Extract the following information from the text below:
- Pickup location (city, state, zip if available)
- Dropoff location (city, state, zip if available)
- Pickup date/time (convert to ISO format if possible)
- Delivery date/time (convert to ISO format if possible)
- Commodity/cargo description
- Equipment type (cargo_van, sprinter, box_truck, dry_van, reefer, flatbed, step_deck, lowboy)
- Rate or price
- Weight if mentioned
- Any special instructions

Text to parse:
${emailText}

Return the data in JSON format matching this structure, but only include fields that are clearly mentioned. Use null for missing data.`,
        response_json_schema: {
          type: "object",
          properties: {
            pickup_location: {
              type: "object",
              properties: {
                city: { type: "string" },
                state: { type: "string" },
                zip: { type: "string" }
              }
            },
            dropoff_location: {
              type: "object",
              properties: {
                city: { type: "string" },
                state: { type: "string" },
                zip: { type: "string" }
              }
            },
            pickup_date: { type: "string" },
            delivery_date: { type: "string" },
            commodity: { type: "string" },
            equipment_type: { type: "string" },
            customer_rate: { type: "number" },
            weight: { type: "number" },
            special_instructions: { type: "string" }
          }
        }
      });

      setExtractedData(result);
    } catch (err) {
      setError(err.message || 'Failed to parse email');
      console.error('Parse error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateLoad = () => {
    if (extractedData) {
      const operatingMode = localStorage.getItem('tms_operating_mode') || 'broker';
      createLoadMutation.mutate({
        ...extractedData,
        mode: operatingMode,
        status: 'available',
        load_number: `TED-${Date.now()}`
      });
      setExtractedData(null);
      setEmailText('');
    }
  };

  const exampleEmail = `Need a cargo van from Cleveland, OH to Detroit, MI tomorrow. $550 flat. 1 pallet of auto parts, about 500 lbs. Pickup after 9am, deliver by 5pm. ASAP please.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            TED: AI Email Parser
          </h1>
          <p className="text-slate-600 text-lg">
            Convert emails into structured loads instantly with AI
          </p>
          <Badge className="mt-3 bg-purple-600">Powered by GPT-4</Badge>
        </div>

        {/* Input Card */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Mail className="w-5 h-5 text-purple-600" />
              Paste Email or Load Details
            </CardTitle>
            <p className="text-sm text-slate-500 mt-2">
              Copy and paste an email, text message, or load board posting. TED will extract all the details automatically.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <Textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder={exampleEmail}
              rows={8}
              className="font-mono text-sm border-slate-300"
            />
            
            <div className="flex gap-3 mt-4">
              <Button
                onClick={parseEmail}
                disabled={!emailText.trim() || isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Parse with AI
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEmailText(exampleEmail)}
                disabled={isProcessing}
              >
                Try Example
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Parsing Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extracted Data Display */}
        {extractedData && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardHeader className="border-b border-emerald-200 pb-6">
              <CardTitle className="flex items-center gap-2 text-xl text-emerald-900">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Extracted Load Data
              </CardTitle>
              <p className="text-sm text-emerald-700 mt-2">
                Review the data below and create the load if it looks correct
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              {/* Route */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-emerald-200">
                  <h4 className="font-semibold text-emerald-900 mb-2">Pickup</h4>
                  {extractedData.pickup_location && (
                    <p className="text-slate-900">
                      {extractedData.pickup_location.city}, {extractedData.pickup_location.state}
                      {extractedData.pickup_location.zip && ` ${extractedData.pickup_location.zip}`}
                    </p>
                  )}
                  {extractedData.pickup_date && (
                    <p className="text-sm text-slate-600 mt-1">{extractedData.pickup_date}</p>
                  )}
                </div>
                <div className="p-4 bg-white rounded-xl border border-emerald-200">
                  <h4 className="font-semibold text-emerald-900 mb-2">Dropoff</h4>
                  {extractedData.dropoff_location && (
                    <p className="text-slate-900">
                      {extractedData.dropoff_location.city}, {extractedData.dropoff_location.state}
                      {extractedData.dropoff_location.zip && ` ${extractedData.dropoff_location.zip}`}
                    </p>
                  )}
                  {extractedData.delivery_date && (
                    <p className="text-sm text-slate-600 mt-1">{extractedData.delivery_date}</p>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="grid md:grid-cols-3 gap-4">
                {extractedData.commodity && (
                  <div className="p-4 bg-white rounded-xl border border-emerald-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Commodity</p>
                    <p className="font-medium text-slate-900">{extractedData.commodity}</p>
                  </div>
                )}
                {extractedData.equipment_type && (
                  <div className="p-4 bg-white rounded-xl border border-emerald-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Equipment</p>
                    <p className="font-medium text-slate-900 capitalize">{extractedData.equipment_type.replace(/_/g, ' ')}</p>
                  </div>
                )}
                {extractedData.customer_rate && (
                  <div className="p-4 bg-white rounded-xl border border-emerald-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Rate</p>
                    <p className="font-bold text-emerald-600 text-lg">${extractedData.customer_rate}</p>
                  </div>
                )}
                {extractedData.weight && (
                  <div className="p-4 bg-white rounded-xl border border-emerald-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Weight</p>
                    <p className="font-medium text-slate-900">{extractedData.weight} lbs</p>
                  </div>
                )}
              </div>

              {extractedData.special_instructions && (
                <div className="p-4 bg-white rounded-xl border border-emerald-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Special Instructions</p>
                  <p className="text-slate-900">{extractedData.special_instructions}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateLoad}
                  disabled={createLoadMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300"
                >
                  {createLoadMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Load
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setExtractedData(null)}
                  disabled={createLoadMutation.isPending}
                >
                  Discard
                </Button>
              </div>

              {createLoadMutation.isSuccess && (
                <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl">
                  <p className="text-emerald-900 font-medium text-center">
                    ✓ Load created successfully! Check the Load Board.
                  </p>
                </div>
              )}

            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-900">How TED Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Paste Email</h4>
                <p className="text-sm text-slate-600">Copy any email, text, or load posting into TED</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">AI Extraction</h4>
                <p className="text-sm text-slate-600">GPT-4 extracts pickup, dropoff, rates, and details</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Create Load</h4>
                <p className="text-sm text-slate-600">Review and create the load with one click</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}