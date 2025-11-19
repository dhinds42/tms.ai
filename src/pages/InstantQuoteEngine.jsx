import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Award, Loader2 } from "lucide-react";

export default function InstantQuoteEngine() {
  const [quoting, setQuoting] = useState(false);
  const [quotes, setQuotes] = useState(null);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    equipment: 'dry_van',
    weight: '',
    pickup_date: ''
  });

  const generateInstantQuote = async () => {
    setQuoting(true);
    
    try {
      const prompt = `Generate instant freight quotes for:
Origin: ${formData.origin}
Destination: ${formData.destination}
Equipment: ${formData.equipment}
Weight: ${formData.weight} lbs
Pickup: ${formData.pickup_date}

Provide 3 pricing tiers with carrier recommendations and ETAs.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            economy: {
              type: "object",
              properties: {
                price: { type: "number" },
                transit_days: { type: "number" },
                carriers: { type: "array", items: { type: "string" } }
              }
            },
            standard: {
              type: "object",
              properties: {
                price: { type: "number" },
                transit_days: { type: "number" },
                carriers: { type: "array", items: { type: "string" } }
              }
            },
            expedited: {
              type: "object",
              properties: {
                price: { type: "number" },
                transit_days: { type: "number" },
                carriers: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setQuotes(result);
    } catch (error) {
      alert('Failed to generate quote');
    } finally {
      setQuoting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">
            Instant Quote Engine
          </h1>
          <p className="text-slate-600 mt-2">AI-powered real-time rate shopping</p>
          <Badge className="mt-3 bg-emerald-600">⚡ Instant Pricing</Badge>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Get Your Quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Origin City, State</Label>
                <Input
                  value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                  placeholder="Chicago, IL"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Destination City, State</Label>
                <Input
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  placeholder="Los Angeles, CA"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Weight (lbs)</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="40000"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Pickup Date</Label>
                <Input
                  type="date"
                  value={formData.pickup_date}
                  onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>

            <Button
              onClick={generateInstantQuote}
              disabled={quoting}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 py-6"
            >
              {quoting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />}
              Get Instant Quotes
            </Button>
          </CardContent>
        </Card>

        {quotes && (
          <div className="grid grid-cols-3 gap-4">
            {['economy', 'standard', 'expedited'].map((tier) => (
              <Card key={tier} className={`border-2 ${tier === 'standard' ? 'border-emerald-500 shadow-lg scale-105' : 'border-slate-200'}`}>
                <CardHeader>
                  <CardTitle className="capitalize">{tier}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600 mb-4">
                    ${quotes[tier]?.price?.toLocaleString()}
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    {quotes[tier]?.transit_days} days transit
                  </p>
                  <Button className="w-full">Book Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}