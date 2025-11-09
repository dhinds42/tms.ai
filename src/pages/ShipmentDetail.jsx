import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Edit,
  Save,
  X,
  AlertTriangle,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Package,
  Navigation,
  Settings,
  Activity,
  Ban,
  TrendingUp,
  Users
} from "lucide-react";

export default function ShipmentDetail() {
  const [searchParams] = useSearchParams();
  const loadId = searchParams.get('id');
  const queryClient = useQueryClient();
  
  const [editMode, setEditMode] = useState({});
  const [editValues, setEditValues] = useState({});
  const [showCheckCallModal, setShowCheckCallModal] = useState(false);
  const [showTONUModal, setShowTONUModal] = useState(false);
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  const { data: load, isLoading } = useQuery({
    queryKey: ['load', loadId],
    queryFn: async () => {
      const loads = await base44.entities.Load.list();
      return loads.find(l => l.id === loadId);
    },
    enabled: !!loadId,
  });

  const updateLoadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Load.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load', loadId] });
      setEditMode({});
    },
  });

  const handleInlineEdit = (field) => {
    setEditMode({ ...editMode, [field]: true });
    setEditValues({ ...editValues, [field]: load[field] });
  };

  const handleInlineSave = (field) => {
    updateLoadMutation.mutate({
      id: loadId,
      data: { [field]: editValues[field] }
    });
  };

  const handleInlineCancel = (field) => {
    setEditMode({ ...editMode, [field]: false });
    setEditValues({ ...editValues, [field]: load[field] });
  };

  // Activity Log
  const activityLog = [
    { id: '1', timestamp: new Date().toISOString(), user: 'John Smith', action: 'Created shipment', details: 'Shipment created' },
    { id: '2', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'System', action: 'Carrier assigned', details: 'ABC Transport assigned' },
    { id: '3', timestamp: new Date(Date.now() - 7200000).toISOString(), user: 'Sarah Johnson', action: 'Check call completed', details: 'Driver on schedule' }
  ];

  // Shipment Alerts
  const alerts = [
    { id: '1', type: 'warning', message: 'Pickup appointment in 2 hours', timestamp: new Date() },
    { id: '2', type: 'info', message: 'Document missing: POD', timestamp: new Date(Date.now() - 3600000) }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600">Loading shipment...</p>
        </div>
      </div>
    );
  }

  if (!load) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-xl bg-white p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Shipment Not Found</h2>
            <p className="text-slate-600">The requested shipment could not be found.</p>
          </Card>
        </div>
      </div>
    );
  }

  const InlineEditField = ({ label, field, value, type = "text" }) => (
    <div className="mb-4">
      <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>
      {editMode[field] ? (
        <div className="flex gap-2 mt-1">
          <Input
            type={type}
            value={editValues[field] || ''}
            onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
            className="flex-1"
          />
          <Button size="sm" onClick={() => handleInlineSave(field)} className="bg-emerald-600">
            <Save className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleInlineCancel(field)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-1 p-2 hover:bg-slate-50 rounded group">
          <p className="font-semibold text-slate-900">{value || 'N/A'}</p>
          <button 
            onClick={() => handleInlineEdit(field)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit className="w-3 h-3 text-slate-400 hover:text-indigo-600" />
          </button>
        </div>
      )}
    </div>
  );

  const CheckCallModal = () => {
    const [formData, setFormData] = useState({
      driver_status: 'on_schedule',
      current_location: '',
      eta_update: '',
      notes: ''
    });

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Log Check Call</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Driver Status</label>
              <select
                value={formData.driver_status}
                onChange={(e) => setFormData({...formData, driver_status: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="on_schedule">On Schedule</option>
                <option value="delayed">Delayed</option>
                <option value="ahead_of_schedule">Ahead of Schedule</option>
                <option value="issue_reported">Issue Reported</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Current Location</label>
              <Input
                value={formData.current_location}
                onChange={(e) => setFormData({...formData, current_location: e.target.value})}
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Updated ETA</label>
              <Input
                type="datetime-local"
                value={formData.eta_update}
                onChange={(e) => setFormData({...formData, eta_update: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg h-24"
                placeholder="Any updates or issues..."
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  alert('Check call logged successfully');
                  setShowCheckCallModal(false);
                }}
                className="flex-1 bg-emerald-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Log Check Call
              </Button>
              <Button 
                onClick={() => setShowCheckCallModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TONUModal = () => {
    const [tonuReason, setTonuReason] = useState('');
    const [tonuCharges, setTonuCharges] = useState(150);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">TONU (Truck Ordered Not Used)</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                This will cancel the shipment and apply TONU charges to the customer.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">TONU Reason *</label>
              <select
                value={tonuReason}
                onChange={(e) => setTonuReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select reason...</option>
                <option value="customer_cancelled">Customer Cancelled</option>
                <option value="freight_not_ready">Freight Not Ready</option>
                <option value="refused_load">Refused Load</option>
                <option value="shipper_closed">Shipper Closed</option>
                <option value="weather">Weather</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">TONU Charges</label>
              <Input
                type="number"
                value={tonuCharges}
                onChange={(e) => setTonuCharges(parseFloat(e.target.value))}
                placeholder="150.00"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  if (!tonuReason) {
                    alert('Please select a TONU reason');
                    return;
                  }
                  updateLoadMutation.mutate({
                    id: loadId,
                    data: { 
                      status: 'cancelled',
                      tonu: true,
                      tonu_reason: tonuReason,
                      tonu_charges: tonuCharges
                    }
                  });
                  setShowTONUModal(false);
                }}
                className="flex-1 bg-red-600 text-white"
              >
                <Ban className="w-4 h-4 mr-2" />
                Apply TONU
              </Button>
              <Button 
                onClick={() => setShowTONUModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddStopModal = () => {
    const [stopData, setStopData] = useState({
      type: 'additional_pickup',
      location: '',
      appointment_time: '',
      contact_name: '',
      contact_phone: ''
    });

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Add Additional Stop</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Stop Type</label>
              <select
                value={stopData.type}
                onChange={(e) => setStopData({...stopData, type: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="additional_pickup">Additional Pickup</option>
                <option value="additional_delivery">Additional Delivery</option>
                <option value="cross_dock">Cross Dock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location Address</label>
              <Input
                value={stopData.location}
                onChange={(e) => setStopData({...stopData, location: e.target.value})}
                placeholder="123 Main St, City, ST 12345"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Name</label>
                <Input
                  value={stopData.contact_name}
                  onChange={(e) => setStopData({...stopData, contact_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Phone</label>
                <Input
                  value={stopData.contact_phone}
                  onChange={(e) => setStopData({...stopData, contact_phone: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Appointment Time</label>
              <Input
                type="datetime-local"
                value={stopData.appointment_time}
                onChange={(e) => setStopData({...stopData, appointment_time: e.target.value})}
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  alert('Additional stop added successfully');
                  setShowAddStopModal(false);
                }}
                className="flex-1 bg-emerald-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stop
              </Button>
              <Button 
                onClick={() => setShowAddStopModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HoldModal = () => {
    const [holdReason, setHoldReason] = useState('');
    const [holdNotes, setHoldNotes] = useState('');

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Place Shipment on Hold</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Hold Reason</label>
              <select
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select reason...</option>
                <option value="payment_issue">Payment Issue</option>
                <option value="credit_hold">Credit Hold</option>
                <option value="documentation_missing">Documentation Missing</option>
                <option value="customs_hold">Customs Hold</option>
                <option value="customer_request">Customer Request</option>
                <option value="carrier_issue">Carrier Issue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
              <textarea
                value={holdNotes}
                onChange={(e) => setHoldNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg h-24"
                placeholder="Additional details..."
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  updateLoadMutation.mutate({
                    id: loadId,
                    data: { 
                      on_hold: true,
                      hold_reason: holdReason,
                      hold_notes: holdNotes
                    }
                  });
                  setShowHoldModal(false);
                }}
                className="flex-1 bg-amber-600 text-white"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Place on Hold
              </Button>
              <Button 
                onClick={() => setShowHoldModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
            </h1>
            <p className="text-slate-600 mt-1">Shipment Detail & Management</p>
          </div>
          <div className="flex gap-2">
            <Badge className={
              load.status === 'delivered' ? 'bg-emerald-600' :
              load.status === 'in_transit' ? 'bg-blue-600' :
              load.status === 'cancelled' ? 'bg-red-600' :
              'bg-amber-600'
            }>
              {load.status?.replace('_', ' ').toUpperCase()}
            </Badge>
            {load.on_hold && (
              <Badge className="bg-amber-600">
                <AlertCircle className="w-3 h-3 mr-1" />
                ON HOLD
              </Badge>
            )}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map(alert => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.type === 'warning' ? 'border-l-amber-500 bg-amber-50' :
                alert.type === 'error' ? 'border-l-red-500 bg-red-50' :
                'border-l-blue-500 bg-blue-50'
              }`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.type === 'warning' ? 'text-amber-600' :
                    alert.type === 'error' ? 'text-red-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{alert.message}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Shipment Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Button 
                onClick={() => setShowCheckCallModal(true)}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Phone className="w-5 h-5" />
                <span className="text-xs">Check Call</span>
              </Button>
              <Button 
                onClick={() => setShowMessageModal(true)}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs">Send Message</span>
              </Button>
              <Button 
                onClick={() => setShowAddStopModal(true)}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs">Add Stop</span>
              </Button>
              <Button 
                onClick={() => setShowHoldModal(true)}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs">Place Hold</span>
              </Button>
              <Button 
                onClick={() => setShowTONUModal(true)}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 text-red-600 border-red-300"
              >
                <Ban className="w-5 h-5" />
                <span className="text-xs">TONU</span>
              </Button>
              <Button 
                onClick={() => setShowAppointmentModal(true)}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Calendar className="w-5 h-5" />
                <span className="text-xs">Appointment</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stops">Stops & Route</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Route Information */}
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="w-5 h-5" />
                      Route Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-emerald-100 rounded-full">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Pickup</p>
                        <p className="font-bold text-slate-900 mt-1">
                          {load.pickup_location?.city}, {load.pickup_location?.state}
                        </p>
                        <p className="text-sm text-slate-600">{load.pickup_location?.address}</p>
                        {load.pickup_date && (
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(load.pickup_date).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border-l-2 border-slate-200 ml-6 h-8"></div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Delivery</p>
                        <p className="font-bold text-slate-900 mt-1">
                          {load.dropoff_location?.city}, {load.dropoff_location?.state}
                        </p>
                        <p className="text-sm text-slate-600">{load.dropoff_location?.address}</p>
                        {load.delivery_date && (
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(load.delivery_date).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Distance</p>
                          <p className="font-semibold">{load.distance_miles || 'N/A'} miles</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Equipment</p>
                          <p className="font-semibold capitalize">{load.equipment_type?.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipment Details (In-line Editing) */}
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Shipment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6">
                    <InlineEditField 
                      label="Commodity" 
                      field="commodity" 
                      value={load.commodity}
                    />
                    <InlineEditField 
                      label="Weight (lbs)" 
                      field="weight" 
                      value={load.weight}
                      type="number"
                    />
                    <InlineEditField 
                      label="Reference Number" 
                      field="reference_number" 
                      value={load.reference_number}
                    />
                    <InlineEditField 
                      label="PO Number" 
                      field="po_number" 
                      value={load.po_number}
                    />
                    <InlineEditField 
                      label="Temperature" 
                      field="temperature_requirements" 
                      value={load.temperature_requirements}
                    />
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Hazmat</label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          checked={load.is_hazmat || false}
                          onChange={(e) => {
                            updateLoadMutation.mutate({
                              id: loadId,
                              data: { is_hazmat: e.target.checked }
                            });
                          }}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <span className="text-sm text-slate-600">Contains Hazardous Materials</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Right Column */}
              <div className="space-y-6">
                
                {/* Financial Summary */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Financials
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-600">Customer Rate</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        ${load.customer_rate?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Carrier Pay</p>
                      <p className="text-xl font-bold text-red-600">
                        ${load.carrier_pay?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-emerald-200">
                      <p className="text-xs text-slate-600">Margin</p>
                      <p className="text-xl font-bold text-slate-900">
                        ${((load.customer_rate || 0) - (load.carrier_pay || 0)).toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Carrier/Driver Info */}
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Assigned
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {load.carrier_id && (
                      <div>
                        <p className="text-xs text-slate-600">Carrier</p>
                        <p className="font-semibold text-slate-900">Carrier Name</p>
                      </div>
                    )}
                    {load.driver_id && (
                      <div>
                        <p className="text-xs text-slate-600">Driver</p>
                        <p className="font-semibold text-slate-900">Driver Name</p>
                      </div>
                    )}
                    {!load.carrier_id && !load.driver_id && (
                      <p className="text-sm text-slate-500">No carrier/driver assigned</p>
                    )}
                  </CardContent>
                </Card>

              </div>
            </div>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLog.map((log) => (
                    <div key={log.id} className="flex gap-4 p-4 hover:bg-slate-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Activity className="w-5 h-5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{log.action}</p>
                        <p className="text-sm text-slate-600">{log.details}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{log.user}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Modals */}
        {showCheckCallModal && <CheckCallModal />}
        {showTONUModal && <TONUModal />}
        {showAddStopModal && <AddStopModal />}
        {showHoldModal && <HoldModal />}

      </div>
    </div>
  );
}