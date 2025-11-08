import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, MessageSquare, Lightbulb, AlertTriangle, X } from "lucide-react";

export default function NegotiationAssistant({ context, operatingMode, onClose }) {
  const { load, counterparty, analysis } = context;

  const successColor = analysis.success_probability >= 70 ? 'text-emerald-600' : 
                       analysis.success_probability >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      
      {/* Strategy Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader className="border-b border-purple-200 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-900">
                  Negotiation Strategy: {load.load_number || `Load #${load.id.slice(0, 8)}`}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  AI-powered negotiation plan for {counterparty.company_name || counterparty.full_name}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-xl">
              <p className="text-xs text-slate-600 mb-1">Market Range</p>
              <p className="font-bold text-slate-900">
                ${analysis.market_rate_min?.toLocaleString()} - ${analysis.market_rate_max?.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl">
              <p className="text-xs text-slate-600 mb-1">Your Target</p>
              <p className="font-bold text-purple-600 text-xl">
                ${analysis.target_rate?.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl">
              <p className="text-xs text-slate-600 mb-1">Opening Offer</p>
              <p className="font-bold text-blue-600 text-xl">
                ${analysis.opening_offer?.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl">
              <p className="text-xs text-slate-600 mb-1">Success Probability</p>
              <p className={`font-bold text-xl ${successColor}`}>
                {analysis.success_probability}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Negotiation Script */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Opening Negotiation Script
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="p-5 bg-indigo-50 rounded-xl border-2 border-indigo-200">
            <p className="text-slate-800 leading-relaxed italic">
              "{analysis.negotiation_script}"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Your Leverage */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-emerald-600" />
              Your Leverage Points
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {analysis.leverage_points?.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Their Motivators */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              What Motivates Them
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {analysis.counterparty_motivators?.map((motivator, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{motivator}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

      </div>

      {/* Objection Handling */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            Objection Handling Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {analysis.objection_responses?.map((obj, idx) => (
              <div key={idx} className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="mb-2">
                  <Badge className="bg-blue-600 text-white mb-2">Objection</Badge>
                  <p className="font-semibold text-slate-900">{obj.objection}</p>
                </div>
                <div>
                  <Badge className="bg-emerald-600 text-white mb-2">Your Response</Badge>
                  <p className="text-sm text-slate-700">{obj.response}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alternative Value Props */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            Alternative Value Propositions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {analysis.alternative_value_props?.map((prop, idx) => (
              <div key={idx} className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-900">• {prop}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Context */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg">Market Conditions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-700 leading-relaxed">{analysis.market_conditions}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg">Timing Strategy</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-700 leading-relaxed">{analysis.timing_strategy}</p>
          </CardContent>
        </Card>
      </div>

      {/* Fallback Options */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
        <CardHeader>
          <CardTitle className="text-lg text-amber-900">Fallback Options</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.fallback_options?.map((option, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-bold text-amber-600">{idx + 1}.</span>
                <span className="text-sm text-amber-900">{option}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}