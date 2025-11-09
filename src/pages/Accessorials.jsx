
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  DollarSign,
  Plus,
  Search,
  Edit,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  Upload
} from "lucide-react";

export default function Accessorials() {
  const [activeTab, setActiveTab] = useState("organization_links");
  const [searchTerm, setSearchTerm] = useState("");
  const [displayTypeFilter, setDisplayTypeFilter] = useState(["show", "show_back_office", "show_managers"]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [shipmentTypeFilter, setShipmentTypeFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAccessorial, setSelectedAccessorial] = useState(null);

  const queryClient = useQueryClient();

  // Mock accessorials data - in production, fetch from database
  const [accessorials] = useState([
    {
      id: '1',
      name: 'Liftgate Pickup',
      type: 'pickup_delivery',
      shipment_type: 'ltl',
      display_type: 'show',
      calculation_type: 'flat',
      amount: 75.00,
      availability: 'normal',
      customer_specific: null,
      organization_specific: null
    },
    {
      id: '2',
      name: 'Fuel Surcharge',
      type: 'fuel',
      shipment_type: 'all',
      display_type: 'required',
      calculation_type: 'schedule',
      amount: 0,
      availability: 'required',
      schedule_id: 'fuel_schedule_1',
      customer_specific: null,
      organization_specific: null
    },
    {
      id: '3',
      name: 'Residential Delivery',
      type: 'pickup_delivery',
      shipment_type: 'ltl',
      display_type: 'show',
      calculation_type: 'flat',
      amount: 95.00,
      availability: 'normal',
      customer_specific: null,
      organization_specific: null
    },
    {
      id: '4',
      name: 'Limited Access',
      type: 'pickup_delivery',
      shipment_type: 'ltl',
      display_type: 'show_back_office',
      calculation_type: 'flat',
      amount: 125.00,
      availability: 'normal',
      customer_specific: null,
      organization_specific: null
    },
    {
      id: '5',
      name: 'Sunday Delivery',
      type: 'shipment',
      shipment_type: 'all',
      display_type: 'show',
      calculation_type: 'percentage',
      amount: 15.0,
      availability: 'normal',
      customer_specific: null,
      organization_specific: null
    },
    {
      id: '6',
      name: 'Reconsignment Fee',
      type: 'accounting',
      shipment_type: 'all',
      display_type: 'show_managers',
      calculation_type: 'flat',
      amount: 150.00,
      availability: 'normal',
      customer_specific: null,
      organization_specific: null
    }
  ]);

  const displayTypeOptions = [
    { value: 'hide', label: 'Hide', description: 'Hidden from customer portal and Back Office' },
    { value: 'required', label: 'Required', description: 'Auto-selected, cannot be unselected in portal' },
    { value: 'selected', label: 'Selected', description: 'Auto-selected, can be unselected' },
    { value: 'show', label: 'Show', description: 'Visible in Customer Portal and Back Office' },
    { value: 'show_back_office', label: 'Show Back Office', description: 'Only visible in Back Office' },
    { value: 'show_managers', label: 'Show Managers', description: 'Only visible for TMS Site Admins' }
  ];

  const accessorialTypes = [
    { value: 'pickup_delivery', label: 'Pickup and Delivery', icon: '🚚' },
    { value: 'shipment', label: 'Shipment Accessorials', icon: '📦' },
    { value: 'rating', label: 'Rating Accessorials', icon: '💰' },
    { value: 'fuel', label: 'Fuel Accessorial', icon: '⛽' },
    { value: 'accounting', label: 'Accounting Accessorials', icon: '📊' }
  ];

  const calculationTypes = [
    { value: 'flat', label: 'Flat Amount' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'cwt', label: 'Per CWT' },
    { value: 'weight', label: 'Per Weight' },
    { value: 'mileage', label: 'Per Mile' },
    { value: 'handling_units', label: 'Per Handling Unit' },
    { value: 'schedule', label: 'Accessorial Schedule' }
  ];

  const availabilityOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'required', label: 'Required' }
  ];

  const filteredAccessorials = accessorials.filter(acc => {
    const matchesSearch = searchTerm === '' || 
      acc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDisplayType = displayTypeFilter.length === 0 || 
      displayTypeFilter.includes(acc.display_type);
    
    const matchesType = typeFilter === 'all' || acc.type === typeFilter;
    const matchesShipmentType = shipmentTypeFilter === 'all' || 
      acc.shipment_type === shipmentTypeFilter || 
      acc.shipment_type === 'all';
    
    const matchesCustomer = customerFilter === '' || acc.customer_specific === customerFilter;
    const matchesOrganization = organizationFilter === '' || acc.organization_specific === organizationFilter;
    
    return matchesSearch && matchesDisplayType && matchesType && matchesShipmentType && 
           (customerFilter === '' || matchesCustomer) && 
           (organizationFilter === '' || matchesOrganization);
  });

  const EditAccessorialModal = ({ accessorial, onClose }) => {
    const [formData, setFormData] = useState(accessorial || {
      name: '',
      type: 'pickup_delivery',
      shipment_type: 'ltl',
      display_type: 'show',
      calculation_type: 'flat',
      amount: 0,
      availability: 'normal',
      minimum_cost: 0,
      maximum_cost: 0
    });

    const handleSave = () => {
      alert(`Accessorial "${formData.name}" updated successfully`);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-2xl font-bold text-slate-900">
              {accessorial ? 'Edit Accessorial' : 'Add New Accessorial'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Name */}
            <div>
              <Label>Accessorial Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Liftgate Pickup"
                className="mt-2"
              />
            </div>

            {/* Type & Shipment Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Accessorial Type *</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border rounded-lg"
                >
                  {accessorialTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Shipment Type *</Label>
                <select
                  value={formData.shipment_type}
                  onChange={(e) => setFormData({...formData, shipment_type: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border rounded-lg"
                >
                  <option value="all">All Shipment Types</option>
                  <option value="ltl">LTL</option>
                  <option value="truckload">Truckload</option>
                  <option value="drayage">Drayage</option>
                  <option value="white_glove">White Glove</option>
                </select>
              </div>
            </div>

            {/* Display Type */}
            <div>
              <Label>Display Type *</Label>
              <select
                value={formData.display_type}
                onChange={(e) => setFormData({...formData, display_type: e.target.value})}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                {displayTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                {displayTypeOptions.find(o => o.value === formData.display_type)?.description}
              </p>
            </div>

            {/* Availability */}
            <div>
              <Label>Availability *</Label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.value})}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                {availabilityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Required: Always display when rating. Normal: Display when selected.
              </p>
            </div>

            {/* Calculation Type & Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Calculation Type *</Label>
                <select
                  value={formData.calculation_type}
                  onChange={(e) => setFormData({...formData, calculation_type: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border rounded-lg"
                >
                  {calculationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Min/Max Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Minimum Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.minimum_cost}
                  onChange={(e) => setFormData({...formData, minimum_cost: parseFloat(e.target.value) || 0})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Maximum Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.maximum_cost}
                  onChange={(e) => setFormData({...formData, maximum_cost: parseFloat(e.target.value) || 0})}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1 bg-emerald-600 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Accessorial
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const clearDisplayTypeFilter = () => {
    setDisplayTypeFilter([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Accessorial Management
            </h1>
            <p className="text-slate-600 mt-2">
              Manage shipment accessorials, fuel schedules, and organization display settings
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Accessorial
          </Button>
        </div>

        {/* Info Banner */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Important Notes:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Only <strong>Pickup and Delivery Accessorials</strong> can be visible in Customer Portal</li>
                  <li>• <strong>Shipment Accessorials</strong> can be set as Required in Back Office</li>
                  <li>• Required accessorials are auto-selected during shipment creation</li>
                  <li>• Customers see required accessorials on invoices even if hidden in portal</li>
                  <li>• 🔏 TMS Site Admin permission required to view Organization Link options</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="organization_links">Accessorial Organization Link</TabsTrigger>
            <TabsTrigger value="fuel_schedules">Fuel Schedules</TabsTrigger>
            <TabsTrigger value="tariff_accessorials">Tariff Accessorials</TabsTrigger>
          </TabsList>

          {/* Accessorial Organization Link */}
          <TabsContent value="organization_links">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Accessorial Organization Display Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <Label>Search Accessorial</Label>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Type accessorial name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Accessorial Type</Label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full mt-2 px-3 py-2 border rounded-lg"
                    >
                      <option value="all">All Types</option>
                      {accessorialTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Shipment Type</Label>
                    <select
                      value={shipmentTypeFilter}
                      onChange={(e) => setShipmentTypeFilter(e.target.value)}
                      className="w-full mt-2 px-3 py-2 border rounded-lg"
                    >
                      <option value="all">All Shipment Types</option>
                      <option value="ltl">LTL</option>
                      <option value="truckload">Truckload</option>
                      <option value="drayage">Drayage</option>
                      <option value="white_glove">White Glove</option>
                    </select>
                  </div>

                  <div>
                    <Label>Customer Filter</Label>
                    <Input
                      placeholder="Type customer name..."
                      value={customerFilter}
                      onChange={(e) => setCustomerFilter(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Organization Filter</Label>
                    <Input
                      placeholder="Type organization name..."
                      value={organizationFilter}
                      onChange={(e) => setOrganizationFilter(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Display Type</Label>
                    <div className="mt-2 flex gap-2">
                      <Badge 
                        className="bg-blue-100 text-blue-800 cursor-pointer"
                        onClick={clearDisplayTypeFilter}
                      >
                        {displayTypeFilter.length === 0 ? 'All' : `${displayTypeFilter.length} selected`}
                        {displayTypeFilter.length > 0 && ' ✕'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Search
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Accessorials List */}
                <div className="space-y-3">
                  {filteredAccessorials.map((acc) => (
                    <div key={acc.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-slate-900">{acc.name}</h4>
                            <Badge className={
                              acc.display_type === 'required' ? 'bg-red-100 text-red-800' :
                              acc.display_type === 'selected' ? 'bg-amber-100 text-amber-800' :
                              acc.display_type === 'show' ? 'bg-emerald-100 text-emerald-800' :
                              acc.display_type === 'show_back_office' ? 'bg-blue-100 text-blue-800' :
                              acc.display_type === 'show_managers' ? 'bg-purple-100 text-purple-800' :
                              'bg-slate-100 text-slate-800'
                            }>
                              {displayTypeOptions.find(o => o.value === acc.display_type)?.label}
                            </Badge>
                            <Badge className="bg-indigo-100 text-indigo-800">
                              {accessorialTypes.find(t => t.value === acc.type)?.label}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-600">Calculation</p>
                              <p className="font-semibold">
                                {calculationTypes.find(c => c.value === acc.calculation_type)?.label}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600">Amount</p>
                              <p className="font-semibold text-emerald-600">
                                {acc.calculation_type === 'percentage' ? `${acc.amount}%` : `$${acc.amount.toFixed(2)}`}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600">Availability</p>
                              <p className="font-semibold capitalize">{acc.availability}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Shipment Type</p>
                              <p className="font-semibold capitalize">{acc.shipment_type}</p>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => {
                            setSelectedAccessorial(acc);
                            setShowCreateModal(true);
                          }}
                          size="sm" 
                          variant="outline"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {filteredAccessorials.length === 0 && (
                    <div className="text-center py-12">
                      <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No accessorials found. Clear filters or adjust search.</p>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Fuel Schedules */}
          <TabsContent value="fuel_schedules">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Fuel Surcharge Schedules</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                    <Button size="sm" className="bg-emerald-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Schedule
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  
                  {/* Example Fuel Schedule */}
                  <div className="p-6 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">National Fuel Surcharge 2024</h3>
                        <p className="text-sm text-slate-600 mt-1">Value Table - Current U.S. Currency</p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-600">Valuation Type</p>
                        <p className="font-semibold">Value Table</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Value Source</p>
                        <p className="font-semibold">Current U.S.</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Offset Days</p>
                        <p className="font-semibold">0</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left p-2 font-semibold">Fuel Price Range</th>
                            <th className="text-left p-2 font-semibold">Calculation Type</th>
                            <th className="text-right p-2 font-semibold">Surcharge %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="p-2">$3.00 - $3.49</td>
                            <td className="p-2">Percentage</td>
                            <td className="p-2 text-right font-semibold text-emerald-600">15.0%</td>
                          </tr>
                          <tr>
                            <td className="p-2">$3.50 - $3.99</td>
                            <td className="p-2">Percentage</td>
                            <td className="p-2 text-right font-semibold text-emerald-600">18.0%</td>
                          </tr>
                          <tr>
                            <td className="p-2">$4.00 - $4.49</td>
                            <td className="p-2">Percentage</td>
                            <td className="p-2 text-right font-semibold text-emerald-600">21.0%</td>
                          </tr>
                          <tr>
                            <td className="p-2">$4.50+</td>
                            <td className="p-2">Percentage</td>
                            <td className="p-2 text-right font-semibold text-amber-600">25.0%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-2">💡 Fuel Schedule Setup:</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Navigate to Rates {'>'} Accessorial Schedule {'>'} Add New Schedule</li>
                      <li>Enter schedule name and select Valuation Type (initially Pieces/Weight)</li>
                      <li>Save, then change Valuation Type to "Value Table"</li>
                      <li>Select Value Source: "Current U.S."</li>
                      <li>Set Offset Days (negative if schedule is outdated)</li>
                      <li>Download template, enter min/max/calculation/amount</li>
                      <li>Import template to populate schedule</li>
                      <li>Add to tariff via Accessorials {'>'} Tariff Accessorials</li>
                    </ol>
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tariff Accessorials */}
          <TabsContent value="tariff_accessorials">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Tariff Accessorials Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-amber-900 mb-1">Manual Tariffs Requirement:</h4>
                        <p className="text-sm text-amber-800">
                          For manual tariffs to rate shipments with accessorials, you must first add the accessorial 
                          to the tariff with the corresponding rate. Otherwise, the tariff may error when rating.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Example Tariff Accessorials */}
                  <div className="space-y-3">
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900">Liftgate Delivery</h4>
                          <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                            <div>
                              <p className="text-slate-600">Availability</p>
                              <p className="font-semibold">Normal</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Calculation</p>
                              <p className="font-semibold">Flat Amount</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Amount</p>
                              <p className="font-semibold text-emerald-600">$85.00</p>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900">Fuel - Fuel Surcharge</h4>
                          <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                            <div>
                              <p className="text-slate-600">Availability</p>
                              <Badge className="bg-red-100 text-red-800">Required</Badge>
                            </div>
                            <div>
                              <p className="text-slate-600">Calculation</p>
                              <p className="font-semibold">Schedule</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Schedule</p>
                              <p className="font-semibold text-blue-600">National Fuel 2024</p>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-indigo-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tariff Accessorial
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {showCreateModal && (
          <EditAccessorialModal 
            accessorial={selectedAccessorial}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedAccessorial(null);
            }}
          />
        )}

      </div>
    </div>
  );
}
