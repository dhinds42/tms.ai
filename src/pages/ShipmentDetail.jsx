
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  Navigation,
  Activity,
  AlertCircle,
  CheckCircle,
  User,
  Truck,
  Package, // Kept this for Shipment Details card
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DirectionForwardingModal from "../components/loadboard/DirectionForwardingModal";

export default function ShipmentDetail() {
  const [searchParams] = useSearchParams();
  const loadId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState("overview");
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const { data: load, isLoading } = useQuery({
    queryKey: ['load', loadId],
    queryFn: async () => {
      const loads = await base44.entities.Load.list();
      return loads.find(l => l.id === loadId);
    },
    // The query is enabled if loadId exists, which is implicit when loadId is in queryKey for basic cases,
    // but explicit `enabled: !!loadId` can be useful for more complex conditional fetching.
    // However, the outline removed it, so we adhere to the outline.
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    initialData: [],
    enabled: operatingMode === 'carrier' // Only fetch drivers if in carrier mode
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list(),
    initialData: [],
    enabled: operatingMode === 'broker' // Only fetch carriers if in broker mode
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-600">Loading shipment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!load) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Shipment Not Found</h2>
            <p className="text-slate-600 mb-6">The shipment you're looking for doesn't exist.</p>
            <Link to={createPageUrl("LoadBoard")}>
              <Button>Return to Load Board</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const driver = load.driver_id ? drivers.find(d => d.id === load.driver_id) : null;
  const carrier = load.carrier_id ? carriers.find(c => c.id === load.carrier_id) : null;
  const hasRecipient = (operatingMode === 'carrier' && driver) || (operatingMode === 'broker' && carrier);

  // Re-creating the display-only parts of InlineEditField for the Shipment Details card
  const DisplayField = ({ label, value, type = "text" }) => (
    <div className="mb-4">
      <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>
      <p className="font-semibold text-slate-900 mt-1">{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("LoadBoard")}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
              </h1>
              <Badge className={
                load.status === 'delivered' ? 'bg-emerald-600' :
                load.status === 'in_transit' || load.status === 'picked_up' || load.status === 'dispatched' ? 'bg-blue-600' :
                load.status === 'cancelled' ? 'bg-red-600' :
                'bg-amber-600'
              }>
                {load.status?.replace('_', ' ').toUpperCase()}
              </Badge>
              {load.on_hold && (
                <Badge className="bg-amber-600 ml-2">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  ON HOLD
                </Badge>
              )}
            </div>
          </div>
          
          {/* Forward Directions Button */}
          {hasRecipient && ['assigned', 'dispatched', 'picked_up', 'in_transit'].includes(load.status) && (
            <Button
              onClick={() => setShowForwardModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Forward Directions
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="route">Route Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Info - Left Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Route Information */}
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Route Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg">
                      <MapPin className="w-6 h-6 text-emerald-600 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">Pickup Location</p>
                        <p className="text-sm text-slate-600">
                          {load.pickup_location?.address}<br/>
                          {load.pickup_location?.city}, {load.pickup_location?.state} {load.pickup_location?.zip}
                        </p>
                        {load.pickup_date && (
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(load.pickup_date).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {load.additional_stops && load.additional_stops.length > 0 && (
                      <div className="pl-8 space-y-2">
                        {load.additional_stops.map((stop, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                            <Navigation className="w-6 h-6 text-amber-600 mt-1" />
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">Stop {idx + 1} ({stop.type.replace('_', ' ')})</p>
                              <p className="text-sm text-slate-600">{stop.location}</p>
                              {stop.appointment_time && (
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(stop.appointment_time).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">Delivery Location</p>
                        <p className="text-sm text-slate-600">
                          {load.dropoff_location?.address}<br/>
                          {load.dropoff_location?.city}, {load.dropoff_location?.state} {load.dropoff_location?.zip}
                        </p>
                        {load.delivery_date && (
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
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

                {/* Shipment Details (Converted from Inline Editing to Display-only) */}
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Shipment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6">
                    <DisplayField
                      label="Commodity"
                      value={load.commodity}
                    />
                    <DisplayField
                      label="Weight (lbs)"
                      value={load.weight}
                    />
                    <DisplayField
                      label="Reference Number"
                      value={load.reference_number}
                    />
                    <DisplayField
                      label="PO Number"
                      value={load.po_number}
                    />
                    <DisplayField
                      label="Temperature"
                      value={load.temperature_requirements}
                    />
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Hazmat</label>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-slate-600">
                          {load.is_hazmat ? 'Contains Hazardous Materials' : 'No Hazardous Materials'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Sidebar - Right Column */}
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
                      <User className="w-5 h-5" /> {/* Changed from Users to User as per outline */}
                      Assigned
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {operatingMode === 'broker' && (
                      <div>
                        <p className="text-xs text-slate-600">Carrier</p>
                        <p className="font-semibold text-slate-900">{carrier?.name || 'N/A'}</p>
                      </div>
                    )}
                    {operatingMode === 'carrier' && (
                      <div>
                        <p className="text-xs text-slate-600">Driver</p>
                        <p className="font-semibold text-slate-900">{driver?.name || 'N/A'}</p>
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

          {/* Route Details Tab */}
          <TabsContent value="route">
            <Card className="border-0 shadow-xl bg-white p-6">
              <CardTitle className="text-xl font-bold mb-4">Detailed Route Information</CardTitle>
              <p className="text-slate-600">Detailed route visualization and planning will appear here.</p>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="border-0 shadow-xl bg-white p-6">
              <CardTitle className="text-xl font-bold mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> Documents</CardTitle>
              <p className="text-slate-600">Upload and manage shipment related documents here.</p>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="border-0 shadow-xl bg-white p-6">
              <CardTitle className="text-xl font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5" /> Activity Log</CardTitle>
              <p className="text-slate-600">All shipment actions and events will be logged here.</p>
              {/* If there was previous activityLog data, we could display it here.
                  For now, adding a placeholder. */}
            </Card>
          </TabsContent>

        </Tabs>

        {/* Direction Forwarding Modal */}
        {showForwardModal && (
          <DirectionForwardingModal
            load={load}
            driver={driver}
            carrier={carrier}
            operatingMode={operatingMode}
            onClose={() => setShowForwardModal(false)}
          />
        )}

      </div>
    </div>
  );
}
