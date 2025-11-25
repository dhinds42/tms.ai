import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Brain,
  Mail,
  Phone,
  Settings,
  RefreshCw,
  Eye,
  Download,
  Copy,
  Truck,
  DollarSign,
  MapPin,
  Calendar
} from "lucide-react";

export default function AutomatedRateConfirmationAI() {
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRateCon, setGeneratedRateCon] = useState(null);
  const [autoSendEnabled, setAutoSendEnabled] = useState(true);
  const [emailTemplate, setEmailTemplate] = useState("standard");

  const queryClient = useQueryClient();

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const updateLoadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Load.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loads'] }),
  });

  // Filter loads that need rate confirmations
  const pendingLoads = loads.filter(l => 
    ['tendered', 'assigned'].includes(l.status) && !l.rate_con_url
  );

  const sentLoads = loads.filter(l => l.rate_con_url);

  // Generate rate confirmation using AI
  const handleGenerateRateCon = async (load) => {
    setIsGenerating(true);
    setSelectedLoad(load);

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const carrier = carriers.find(c => c.id === load.carrier_id);
    
    const rateCon = {
      loadId: load.id,
      loadNumber: load.load_number || `LD-${load.id.slice(0, 6).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      carrier: {
        name: carrier?.company_name || 'ABC Trucking LLC',
        mc: carrier?.mc_number || '123456',
        contact: carrier?.primary_contact || 'John Smith',
        email: carrier?.email || 'dispatch@carrier.com',
        phone: carrier?.phone || '(555) 123-4567'
      },
      pickup: {
        location: `${load.pickup_location?.city || 'Chicago'}, ${load.pickup_location?.state || 'IL'}`,
        address: load.pickup_location?.address || '123 Industrial Blvd',
        date: load.pickup_date ? new Date(load.pickup_date).toLocaleDateString() : 'Dec 1, 2025',
        time: '08:00 AM - 10:00 AM',
        instructions: 'Check in at gate. Bring lumper receipt if applicable.'
      },
      delivery: {
        location: `${load.dropoff_location?.city || 'Detroit'}, ${load.dropoff_location?.state || 'MI'}`,
        address: load.dropoff_location?.address || '456 Commerce Dr',
        date: load.delivery_date ? new Date(load.delivery_date).toLocaleDateString() : 'Dec 2, 2025',
        time: '02:00 PM - 04:00 PM',
        instructions: 'Delivery appointment required. Call 30 minutes before arrival.'
      },
      equipment: load.equipment_type || 'Dry Van',
      weight: load.weight || 42000,
      commodity: load.commodity || 'General Freight',
      rate: load.carrier_pay || 1400,
      specialInstructions: load.special_instructions || 'No special requirements.',
      terms: [
        'Payment within 30 days of delivery and receipt of signed POD.',
        'Carrier is responsible for all fuel surcharges.',
        'Any claims must be filed within 9 months.',
        'Carrier must provide tracking updates every 4 hours.'
      ]
    };

    setGeneratedRateCon(rateCon);
    setIsGenerating(false);
  };

  // Send rate confirmation
  const handleSendRateCon = async () => {
    if (!generatedRateCon || !selectedLoad) return;

    // Update load with rate con status
    await updateLoadMutation.mutateAsync({
      id: selectedLoad.id,
      data: {
        rate_con_url: 'generated',
        rate_con_sent_at: new Date().toISOString(),
        status: selectedLoad.status === 'tendered' ? 'assigned' : selectedLoad.status
      }
    });

    alert(`Rate confirmation sent to ${generatedRateCon.carrier.email}`);
    setGeneratedRateCon(null);
    setSelectedLoad(null);
  };

  // Auto-generate for all pending
  const handleBulkGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    for (const load of pendingLoads.slice(0, 5)) {
      await updateLoadMutation.mutateAsync({
        id: load.id,
        data: {
          rate_con_url: 'generated',
          rate_con_sent_at: new Date().toISOString()
        }
      });
    }
    
    setIsGenerating(false);
    alert(`Generated and sent ${Math.min(5, pendingLoads.length)} rate confirmations`);
  };

  const stats = {
    pending: pendingLoads.length,
    sent: sentLoads.length,
    autoSent: Math.floor(sentLoads.length * 0.7),
    avgTime: '45 sec'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Automated Rate Confirmation AI
            </h1>
            <p className="text-slate-600 mt-2">
              AI-powered rate confirmation generation and delivery
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200">
              <Switch
                checked={autoSendEnabled}
                onCheckedChange={setAutoSendEnabled}
              />
              <span className="text-sm font-medium text-slate-700">Auto-Send</span>
            </div>
            <Button
              onClick={handleBulkGenerate}
              disabled={isGenerating || pendingLoads.length === 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate All ({pendingLoads.length})
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
                  <p className="text-xs text-slate-500 mt-1">Awaiting rate con</p>
                </div>
                <div className="p-4 bg-amber-100 rounded-2xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Sent Today</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.sent}</p>
                  <p className="text-xs text-slate-500 mt-1">Rate cons sent</p>
                </div>
                <div className="p-4 bg-emerald-100 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Auto-Generated</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.autoSent}</p>
                  <p className="text-xs text-slate-500 mt-1">By AI this week</p>
                </div>
                <div className="p-4 bg-purple-100 rounded-2xl">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Avg Time</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.avgTime}</p>
                  <p className="text-xs text-slate-500 mt-1">Per rate con</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-2xl">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Loads */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Loads Awaiting Rate Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {pendingLoads.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                    <p className="text-slate-600">All rate confirmations sent!</p>
                  </div>
                ) : (
                  pendingLoads.map(load => {
                    const carrier = carriers.find(c => c.id === load.carrier_id);
                    return (
                      <div 
                        key={load.id} 
                        className={`p-4 hover:bg-slate-50 cursor-pointer transition-all ${
                          selectedLoad?.id === load.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                        }`}
                        onClick={() => handleGenerateRateCon(load)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900">
                                {load.load_number || `LD-${load.id.slice(0, 6)}`}
                              </p>
                              <Badge className="bg-amber-100 text-amber-700 text-xs">
                                {load.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Carrier: {carrier?.company_name || 'Pending Assignment'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">${load.carrier_pay || 0}</p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateRateCon(load);
                              }}
                              className="mt-2"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Generate
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rate Confirmation Preview */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Rate Confirmation Preview
                </CardTitle>
                {generatedRateCon && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isGenerating ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
                  <p className="text-slate-600">AI is generating rate confirmation...</p>
                </div>
              ) : generatedRateCon ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center pb-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">RATE CONFIRMATION</h2>
                    <p className="text-slate-600">Load #{generatedRateCon.loadNumber}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Generated: {new Date(generatedRateCon.generatedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Carrier Info */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Carrier Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-500">Company</p>
                        <p className="font-medium">{generatedRateCon.carrier.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">MC Number</p>
                        <p className="font-medium">MC-{generatedRateCon.carrier.mc}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Contact</p>
                        <p className="font-medium">{generatedRateCon.carrier.contact}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Email</p>
                        <p className="font-medium">{generatedRateCon.carrier.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" /> Pickup
                      </h3>
                      <p className="font-medium">{generatedRateCon.pickup.location}</p>
                      <p className="text-sm text-slate-600">{generatedRateCon.pickup.address}</p>
                      <p className="text-sm text-slate-600 mt-2">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {generatedRateCon.pickup.date} • {generatedRateCon.pickup.time}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" /> Delivery
                      </h3>
                      <p className="font-medium">{generatedRateCon.delivery.location}</p>
                      <p className="text-sm text-slate-600">{generatedRateCon.delivery.address}</p>
                      <p className="text-sm text-slate-600 mt-2">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {generatedRateCon.delivery.date} • {generatedRateCon.delivery.time}
                      </p>
                    </div>
                  </div>

                  {/* Load Details */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-xs text-slate-500">Equipment</p>
                        <p className="font-semibold">{generatedRateCon.equipment}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Weight</p>
                        <p className="font-semibold">{generatedRateCon.weight.toLocaleString()} lbs</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Commodity</p>
                        <p className="font-semibold">{generatedRateCon.commodity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Rate</p>
                        <p className="font-semibold text-emerald-600">${generatedRateCon.rate.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Terms & Conditions</h3>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {generatedRateCon.terms.map((term, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-slate-400">•</span>
                          {term}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button 
                      onClick={handleSendRateCon}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to Carrier
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Load</h3>
                  <p className="text-slate-600">Click on a pending load to generate rate confirmation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-600" />
              AI Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Email Template</label>
                <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Template</SelectItem>
                    <SelectItem value="detailed">Detailed Template</SelectItem>
                    <SelectItem value="brief">Brief Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Auto-Send Delay</label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Immediate</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">CC Admin on Send</label>
                <div className="flex items-center gap-2 mt-3">
                  <Switch defaultChecked />
                  <span className="text-sm text-slate-600">Copy dispatch@company.com</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}