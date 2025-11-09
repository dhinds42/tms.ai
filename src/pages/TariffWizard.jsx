import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign,
  CheckCircle,
  TrendingUp,
  Truck,
  Info,
  Save,
  FileText
} from "lucide-react";

export default function TariffWizard() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    carrier_id: '',
    carrier_name: '',
    mode: 'truckload',
    service_level: 'standard_truckload',
    direction: '3rd_party',
    dimensions_required: false,
    pallets_required: false,
    freight_class_required: false,
    nmfc_required: false,
    customer_specific: false,
    display_in_front_office: true,
    bill_to_address: '',
    account_number: '',
    api_token: '',
    payment_terms: 'net_30',
    lane_setup: 'all_us',
    tariff_type: 'api',
    effective_date: new Date().toISOString().split('T')[0],
    expiration_date: new Date(new Date().setFullYear(new Date().getFullYear() + 20)).toISOString().split('T')[0]
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 200),
    initialData: [],
  });

  const modeOptions = [
    { value: 'ltl', label: 'LTL (Less Than Truckload)' },
    { value: 'truckload', label: 'Truckload' },
    { value: 'drayage', label: 'Drayage' },
    { value: 'white_glove', label: 'White Glove' },
    { value: 'intermodal', label: 'Intermodal' }
  ];

  const serviceLevelOptions = {
    truckload: [
      { value: 'standard_truckload', label: 'Standard Truckload' },
      { value: 'expedited', label: 'Expedited' },
      { value: 'team', label: 'Team Driver' }
    ],
    ltl: [
      { value: 'standard', label: 'Standard' },
      { value: 'guaranteed', label: 'Guaranteed' },
      { value: 'expedited', label: 'Expedited' }
    ]
  };

  const directionOptions = [
    { value: '3rd_party', label: '3rd Party' },
    { value: 'inbound', label: 'Inbound' },
    { value: 'outbound', label: 'Outbound' }
  ];

  const laneSetupOptions = [
    { value: 'all_us', label: 'All US Points' },
    { value: 'manual', label: 'Manual Configuration' },
    { value: 'state_to_state', label: 'State to State' },
    { value: 'zip_to_zip', label: 'Zip to Zip' }
  ];

  const tariffTypeOptions = [
    { value: 'api', label: 'API Tariff (Real-time rates)' },
    { value: 'loadboard', label: 'Loadboard Source (DAT, Loadsmart)' },
    { value: 'manual', label: 'Manual Tariff (Contact Support)' }
  ];

  const handleCarrierSelect = (carrierId) => {
    const carrier = carriers.find(c => c.id === carrierId);
    setFormData({
      ...formData, 
      carrier_id: carrierId,
      carrier_name: carrier?.company_name || ''
    });
  };

  const handleSave = () => {
    alert('Tariff created successfully! You can now configure lanes and accessorials.');
    // In production: create tariff in database
  };

  const getSourceInstructions = () => {
    if (!formData.carrier_name) return null;
    
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Source Instructions for {formData.carrier_name}
        </h3>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>Verify carrier has API integration capabilities</li>
          <li>Obtain API token/credentials from carrier</li>
          <li>Enter account number for billing</li>
          <li>Configure payment terms</li>
          <li>Set up lane configuration</li>
          <li>Test tariff before enabling in front office</li>
        </ol>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Tariff Wizard
          </h1>
          <p className="text-slate-600 mt-2">
            Create API tariffs and configure carrier connectivity for real-time rating
          </p>
        </div>

        {/* Main Form */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Create Tariff Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Tariff Type */}
            <div>
              <Label>Tariff Type *</Label>
              <select
                value={formData.tariff_type}
                onChange={(e) => setFormData({...formData, tariff_type: e.target.value})}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                {tariffTypeOptions.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {formData.tariff_type === 'manual' && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Manual tariffs require support team assistance. Please contact support to create.
                </p>
              )}
            </div>

            {/* Carrier Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Carrier *</Label>
                <select
                  value={formData.carrier_id}
                  onChange={(e) => handleCarrierSelect(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Carrier...</option>
                  {carriers.map(carrier => (
                    <option key={carrier.id} value={carrier.id}>
                      {carrier.company_name} - MC: {carrier.mc_number}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Instructions */}
              {formData.carrier_id && (
                <div>
                  {getSourceInstructions()}
                </div>
              )}
            </div>

            {/* Mode & Service Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Mode *</Label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({...formData, mode: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border rounded-lg"
                >
                  {modeOptions.map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Service Level *</Label>
                <select
                  value={formData.service_level}
                  onChange={(e) => setFormData({...formData, service_level: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border rounded-lg"
                >
                  {(serviceLevelOptions[formData.mode] || serviceLevelOptions.truckload).map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direction */}
            <div>
              <Label>Direction *</Label>
              <select
                value={formData.direction}
                onChange={(e) => setFormData({...formData, direction: e.target.value})}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                {directionOptions.map(dir => (
                  <option key={dir.value} value={dir.value}>{dir.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Designates whether tariff is 3rd Party, Inbound, or Outbound
              </p>
            </div>

            {/* Requirements Checkboxes */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <Label className="mb-3 block">Tariff Requirements</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.dimensions_required}
                    onChange={(e) => setFormData({...formData, dimensions_required: e.target.checked})}
                  />
                  <span className="text-sm">Dimensions Required</span>
                </label>
                <p className="text-xs text-slate-500 ml-6">
                  Dimensions must exist on shipment for rating
                </p>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.pallets_required}
                    onChange={(e) => setFormData({...formData, pallets_required: e.target.checked})}
                  />
                  <span className="text-sm">Pallets Required</span>
                </label>
                <p className="text-xs text-slate-500 ml-6">
                  Package type must be Pallets or Skids
                </p>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.freight_class_required}
                    onChange={(e) => setFormData({...formData, freight_class_required: e.target.checked})}
                  />
                  <span className="text-sm">Freight Class Required</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.nmfc_required}
                    onChange={(e) => setFormData({...formData, nmfc_required: e.target.checked})}
                  />
                  <span className="text-sm">NMFC Required</span>
                </label>
              </div>
            </div>

            {/* Customer Specific & Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.customer_specific}
                  onChange={(e) => setFormData({...formData, customer_specific: e.target.checked})}
                />
                <div>
                  <span className="font-semibold text-sm">Customer Specific</span>
                  <p className="text-xs text-slate-500">Link to particular customer</p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.display_in_front_office}
                  onChange={(e) => setFormData({...formData, display_in_front_office: e.target.checked})}
                />
                <div>
                  <span className="font-semibold text-sm">Display in Front Office</span>
                  <p className="text-xs text-slate-500">Show in customer portal</p>
                </div>
              </label>
            </div>

            {/* Bill To & Account */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Bill To Address</Label>
                <Input
                  value={formData.bill_to_address}
                  onChange={(e) => setFormData({...formData, bill_to_address: e.target.value})}
                  placeholder="Shows up on BOL"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Account Number</Label>
                <Input
                  value={formData.account_number}
                  onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                  placeholder="Shows on Tariff Profile and BOL"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Pricing Information (API) */}
            {formData.tariff_type === 'api' && (
              <div className="p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50">
                <h3 className="font-bold text-slate-900 mb-4">API Pricing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>API Token *</Label>
                    <Input
                      type="password"
                      value={formData.api_token}
                      onChange={(e) => setFormData({...formData, api_token: e.target.value})}
                      placeholder="Enter API token"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Payment Terms</Label>
                    <select
                      value={formData.payment_terms}
                      onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                      className="w-full mt-2 px-3 py-2 border rounded-lg"
                    >
                      <option value="net_15">Net 15</option>
                      <option value="net_30">Net 30</option>
                      <option value="net_45">Net 45</option>
                      <option value="net_60">Net 60</option>
                      <option value="quick_pay">Quick Pay</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Lane Setup */}
            <div>
              <Label>Lane Configuration *</Label>
              <select
                value={formData.lane_setup}
                onChange={(e) => setFormData({...formData, lane_setup: e.target.value})}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                {laneSetupOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Configure manually or set as All US points
              </p>
            </div>

            {/* Effective/Expiration Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Expiration Date</Label>
                <Input
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1 bg-emerald-600 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save & View Details
              </Button>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-bold text-slate-900 mb-2">API Tariffs</h3>
              <p className="text-sm text-slate-600">
                Real-time rates via direct carrier API integration
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <Truck className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-slate-900 mb-2">Loadboard Rates</h3>
              <p className="text-sm text-slate-600">
                Import rates from DAT, Loadsmart, and more
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <FileText className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="font-bold text-slate-900 mb-2">Manual Tariffs</h3>
              <p className="text-sm text-slate-600">
                Contact support team for manual tariff setup
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}