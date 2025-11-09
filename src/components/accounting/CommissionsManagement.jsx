import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Plus, 
  CheckCircle, 
  TrendingUp, 
  Users,
  Settings,
  Edit,
  Trash2,
  Search
} from "lucide-react";

export default function CommissionsManagement({ loads, drivers, carriers, operatingMode }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock commissions data - in production, fetch from database
  const [commissions, setCommissions] = useState([
    {
      id: '1',
      customer_id: 'cust_1',
      customer_name: 'ABC Logistics',
      sales_rep_name: 'John Smith',
      source_organization: 'Main Branch',
      rate: 20,
      calculation_type: 'percentage_of_margin',
      min_amount: 0,
      max_amount: 10000,
      ignore_house_commission: false,
      shipment_types: ['ftl', 'ltl'],
      priority: 1,
      status: 'active'
    }
  ]);

  const calculationTypes = [
    { value: 'percentage_of_margin', label: 'Percentage of Margin' },
    { value: 'percentage_of_buy', label: 'Percentage of Buy' },
    { value: 'percentage_of_sell', label: 'Percentage of Sell' },
    { value: 'percentage_of_sell_margin', label: 'Percentage of Sell Margin' },
    { value: 'percentage_of_buy_margin', label: 'Percentage of Buy Margin' },
    { value: 'flat_rate', label: 'Flat Rate per Load' }
  ];

  const shipmentTypes = [
    { value: 'ftl', label: 'FTL (Full Truckload)' },
    { value: 'ltl', label: 'LTL (Less Than Truckload)' },
    { value: 'intermodal', label: 'Intermodal' },
    { value: 'expedited', label: 'Expedited' },
    { value: 'drayage', label: 'Drayage' }
  ];

  // Calculate commissions from loads
  const calculateCommission = (load, commission) => {
    const margin = (load.customer_rate || 0) - (load.carrier_pay || 0);
    const buy = load.carrier_pay || 0;
    const sell = load.customer_rate || 0;

    let baseAmount = 0;
    switch(commission.calculation_type) {
      case 'percentage_of_margin':
        baseAmount = margin * (commission.rate / 100);
        break;
      case 'percentage_of_buy':
        baseAmount = buy * (commission.rate / 100);
        break;
      case 'percentage_of_sell':
        baseAmount = sell * (commission.rate / 100);
        break;
      case 'percentage_of_sell_margin':
        baseAmount = (sell - margin) * (commission.rate / 100);
        break;
      case 'percentage_of_buy_margin':
        baseAmount = (buy - margin) * (commission.rate / 100);
        break;
      case 'flat_rate':
        baseAmount = commission.rate;
        break;
      default:
        baseAmount = 0;
    }

    // Apply min/max
    if (commission.min_amount && baseAmount < commission.min_amount) {
      baseAmount = commission.min_amount;
    }
    if (commission.max_amount && baseAmount > commission.max_amount) {
      baseAmount = commission.max_amount;
    }

    return baseAmount;
  };

  // Calculate total commissions
  const totalCommissions = loads.reduce((sum, load) => {
    const loadCommissions = commissions
      .filter(c => c.status === 'active')
      .reduce((cSum, commission) => cSum + calculateCommission(load, commission), 0);
    return sum + loadCommissions;
  }, 0);

  const approvedCommissions = commissions.filter(c => c.status === 'approved').length;
  const pendingCommissions = commissions.filter(c => c.status === 'pending').length;

  const AddCommissionModal = () => {
    const [formData, setFormData] = useState({
      customer_id: '',
      customer_name: '',
      sales_rep_name: '',
      source_organization: 'Main Branch',
      rate: 0,
      calculation_type: 'percentage_of_margin',
      min_amount: 0,
      max_amount: 10000,
      ignore_house_commission: false,
      shipment_types: ['ftl'],
      priority: 0
    });

    const handleSave = () => {
      const newCommission = {
        id: Date.now().toString(),
        ...formData,
        status: 'active'
      };
      setCommissions([...commissions, newCommission]);
      setShowAddModal(false);
      alert('Commission added successfully');
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-2xl font-bold text-slate-900">Add New Commission</h2>
            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Sales Rep */}
            <div>
              <Label>Sales Rep Name *</Label>
              <Input
                value={formData.sales_rep_name}
                onChange={(e) => setFormData({...formData, sales_rep_name: e.target.value})}
                placeholder="Type name (auto-populates)"
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">Start typing to see matching sales reps</p>
            </div>

            {/* Customer */}
            <div>
              <Label>Customer Company *</Label>
              <Input
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                placeholder="Select customer"
                className="mt-2"
              />
            </div>

            {/* Source Organization */}
            <div>
              <Label>Source Organization</Label>
              <select
                value={formData.source_organization}
                onChange={(e) => setFormData({...formData, source_organization: e.target.value})}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                <option value="Main Branch">Main Branch</option>
                <option value="East Coast">East Coast</option>
                <option value="West Coast">West Coast</option>
                <option value="Midwest">Midwest</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Controls where commission is calculated from. Defaults to Customer's Accounting Organization.
              </p>
            </div>

            {/* Rate & Calculation Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Rate *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rate}
                  onChange={(e) => setFormData({...formData, rate: parseFloat(e.target.value) || 0})}
                  className="mt-2"
                />
              </div>
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
            </div>

            {/* Min & Max */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Minimum Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.min_amount}
                  onChange={(e) => setFormData({...formData, min_amount: parseFloat(e.target.value) || 0})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Maximum Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.max_amount}
                  onChange={(e) => setFormData({...formData, max_amount: parseFloat(e.target.value) || 0})}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Ignore House Commission */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.ignore_house_commission}
                  onChange={(e) => setFormData({...formData, ignore_house_commission: e.target.checked})}
                  className="mt-1"
                />
                <div>
                  <Label className="font-semibold">Ignore House Commission</Label>
                  <p className="text-sm text-slate-600 mt-1">
                    When enabled, this commission calculates on full amount before house commissions. 
                    When disabled, house commission gets full amount first, then remaining goes to this commission.
                  </p>
                  <div className="mt-2 p-3 bg-white rounded border border-amber-200">
                    <p className="text-xs font-semibold text-slate-900 mb-2">Example: $100 margin</p>
                    <p className="text-xs text-slate-700">
                      <strong>Enabled:</strong> House $90 + Customer $20 = $110 total<br/>
                      <strong>Disabled:</strong> House $90 + Customer $10 = $100 total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipment Types */}
            <div>
              <Label>Shipment Types</Label>
              <div className="mt-2 space-y-2">
                {shipmentTypes.map(type => (
                  <label key={type.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.shipment_types.includes(type.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, shipment_types: [...formData.shipment_types, type.value]});
                        } else {
                          setFormData({...formData, shipment_types: formData.shipment_types.filter(t => t !== type.value)});
                        }
                      }}
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <Label>Priority</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                Set priority if multiple commissions exist. Leave at 0 to distribute evenly.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1 bg-emerald-600 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Add Commission
              </Button>
              <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const filteredCommissions = commissions.filter(c => 
    searchTerm === '' || 
    c.sales_rep_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 mt-6">
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Total Commissions</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  ${(totalCommissions / 1000).toFixed(1)}K
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Approved</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{approvedCommissions}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{pendingCommissions}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Sales Reps</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {new Set(commissions.map(c => c.sales_rep_name)).size}
                </p>
              </div>
              <Users className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="overview">All Commissions</TabsTrigger>
          <TabsTrigger value="by_customer">By Customer</TabsTrigger>
          <TabsTrigger value="by_rep">By Sales Rep</TabsTrigger>
          <TabsTrigger value="search">Commission Search</TabsTrigger>
          <TabsTrigger value="approve">Approve Commissions</TabsTrigger>
        </TabsList>

        {/* All Commissions */}
        <TabsContent value="overview">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Commission Rules</CardTitle>
                <Button onClick={() => setShowAddModal(true)} className="bg-emerald-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Commission
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commissions.map((commission) => (
                  <div key={commission.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-slate-900">{commission.sales_rep_name}</h4>
                          <Badge className="bg-blue-100 text-blue-800">{commission.customer_name}</Badge>
                          <Badge className={
                            commission.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            commission.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }>
                            {commission.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Rate</p>
                            <p className="font-semibold">{commission.rate}%</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Type</p>
                            <p className="font-semibold">
                              {calculationTypes.find(t => t.value === commission.calculation_type)?.label}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600">Min/Max</p>
                            <p className="font-semibold">${commission.min_amount} - ${commission.max_amount}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Priority</p>
                            <p className="font-semibold">{commission.priority}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {commission.ignore_house_commission && (
                            <Badge className="bg-amber-100 text-amber-800 text-xs">Ignores House</Badge>
                          )}
                          {commission.shipment_types.map(type => (
                            <Badge key={type} className="bg-slate-100 text-slate-800 text-xs">
                              {shipmentTypes.find(t => t.value === type)?.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Search */}
        <TabsContent value="search">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle>Commission Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by sales rep or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-3">
                {filteredCommissions.map((commission) => (
                  <div key={commission.id} className="p-4 border border-slate-200 rounded-lg">
                    <p className="font-semibold">{commission.sales_rep_name} - {commission.customer_name}</p>
                    <p className="text-sm text-slate-600">
                      {commission.rate}% {calculationTypes.find(t => t.value === commission.calculation_type)?.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approve Commissions */}
        <TabsContent value="approve">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle>Approve Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commissions.filter(c => c.status === 'pending').map((commission) => (
                  <div key={commission.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{commission.sales_rep_name}</p>
                      <p className="text-sm text-slate-600">{commission.customer_name}</p>
                    </div>
                    <Button size="sm" className="bg-emerald-600 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                  </div>
                ))}
                {commissions.filter(c => c.status === 'pending').length === 0 && (
                  <p className="text-center text-slate-600 py-8">No pending commissions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {showAddModal && <AddCommissionModal />}

    </div>
  );
}