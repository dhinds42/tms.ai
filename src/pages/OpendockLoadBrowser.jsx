import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toLoadCreatePayload } from "@/components/utils/loadFieldMapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Search,
  AlertTriangle
} from "lucide-react";

// TODO: CRITICAL SECURITY - Remove all localStorage credential storage
// Credentials should NEVER be stored in browser (even with weak XOR encryption)
// This entire implementation needs backend functions for secure credential storage

const getAuthHeader = async () => {
  // TODO: Replace with backend function call
  throw new Error('Authorization requires backend functions - credentials cannot be stored in browser');
};

// TODO: Replace with backend function calls
const fetchOpendockLoads = async (filters = {}) => {
  throw new Error('This operation requires backend functions to be enabled');
};

const acceptOpendockLoad = async (loadId, acceptanceData) => {
  throw new Error('This operation requires backend functions to be enabled');
};

const declineOpendockLoad = async (loadId, reason) => {
  throw new Error('This operation requires backend functions to be enabled');
};

export default function OpendockLoadBrowser() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [selectedLoad, setSelectedLoad] = useState(null);
  
  const queryClient = useQueryClient();

  // Fetch Opendock loads
  const { data: opendockLoads, isLoading, error, refetch } = useQuery({
    queryKey: ['opendockLoads', searchOrigin, searchDestination, equipmentFilter],
    queryFn: () => fetchOpendockLoads({
      origin: searchOrigin,
      destination: searchDestination,
      equipment: equipmentFilter !== 'all' ? equipmentFilter : undefined
    }),
    enabled: operatingMode === 'carrier',
    retry: 1,
    initialData: []
  });

  // Fetch local drivers for assignment
  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: []
  });

  // Accept load mutation
  const acceptLoadMutation = useMutation({
    mutationFn: ({ loadId, driverId, notes }) => 
      acceptOpendockLoad(loadId, {
        driver_id: driverId,
        acceptance_notes: notes,
        estimated_pickup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }),
    onSuccess: async (data) => {
      // Create local load record
      const pickupDate = data.pickup_date || new Date().toISOString().split('T')[0];
      const deliveryDate = data.delivery_date || new Date().toISOString().split('T')[0];
      
      await base44.entities.Load.create(toLoadCreatePayload({
        mode: 'carrier',
        opendock_load_id: data.load_id,
        external_load_number: data.load_number,
        pickup_location: data.pickup_location,
        dropoff_location: data.dropoff_location,
        pickup_date: pickupDate,
        delivery_date: deliveryDate,
        carrier_pay: data.rate,
        equipment_type: data.equipment_type,
        commodity: data.commodity,
        weight: data.weight,
        status: 'assigned',
        driver_id: selectedLoad?.assignedDriver
      }));
      
      queryClient.invalidateQueries(['opendockLoads']);
      queryClient.invalidateQueries(['loads']);
      setSelectedLoad(null);
      alert('✅ Load accepted successfully and added to your Load Board!');
    },
    onError: (error) => {
      alert(`❌ Failed to accept load: ${error.message}`);
    }
  });

  // Decline load mutation
  const declineLoadMutation = useMutation({
    mutationFn: ({ loadId, reason }) => declineOpendockLoad(loadId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['opendockLoads']);
      alert('Load declined successfully');
    }
  });

  const handleAcceptLoad = (load) => {
    if (!load.assignedDriver) {
      alert('Please assign a driver before accepting');
      return;
    }
    
    if (confirm(`Accept load ${load.load_number}?\n\nDriver: ${drivers.find(d => d.id === load.assignedDriver)?.full_name}\nRate: $${load.rate?.toLocaleString()}`)) {
      acceptLoadMutation.mutate({
        loadId: load.id,
        driverId: load.assignedDriver,
        notes: 'Accepted via TMS'
      });
    }
  };

  const handleDeclineLoad = (load) => {
    const reason = prompt('Reason for declining:');
    if (reason) {
      declineLoadMutation.mutate({ loadId: load.id, reason });
    }
  };

  if (operatingMode !== 'carrier') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Carrier Mode Required</h2>
              <p className="text-red-700">This feature is only available in Carrier Mode.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
              Opendock Load Board
            </h1>
            <p className="text-slate-600 mt-2">Browse and accept available loads from Opendock Neutron</p>
          </div>
          <Button onClick={() => refetch()} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Loads
          </Button>
        </div>

        {/* Search Filters */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Available Loads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Origin city/state"
                value={searchOrigin}
                onChange={(e) => setSearchOrigin(e.target.value)}
              />
              <Input
                placeholder="Destination city/state"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
              />
              <select
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Equipment</option>
                <option value="dry_van">Dry Van</option>
                <option value="reefer">Reefer</option>
                <option value="flatbed">Flatbed</option>
                <option value="step_deck">Step Deck</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Available Loads</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {Array.isArray(opendockLoads) ? opendockLoads.length : 0}
                  </p>
                </div>
                <Truck className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Avg Rate</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    ${Array.isArray(opendockLoads) && opendockLoads.length > 0 
                      ? Math.round(opendockLoads.reduce((sum, l) => sum + (l.rate || 0), 0) / opendockLoads.length)
                      : 0}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Available Drivers</p>
                  <p className="text-3xl font-bold text-cyan-600 mt-2">
                    {drivers.filter(d => d.status === 'available').length}
                  </p>
                </div>
                <Truck className="w-12 h-12 text-cyan-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-2 border-amber-300 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900">Connection Error</h3>
                  <p className="text-sm text-amber-800 mt-1">{error.message}</p>
                  <p className="text-xs text-amber-700 mt-2">
                    Make sure Opendock credentials are configured in Settings → Opendock Integration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loads Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-slate-600">Loading available loads from Opendock...</p>
          </div>
        ) : !Array.isArray(opendockLoads) || opendockLoads.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-12 text-center">
              <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No loads available</h3>
              <p className="text-slate-600">Try adjusting your search filters or check back later</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {opendockLoads.map((load) => (
              <Card key={load.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{load.load_number}</h3>
                      <Badge className="bg-purple-100 text-purple-800 mt-2">
                        {load.equipment_type?.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        ${load.rate?.toLocaleString() || '0'}
                      </p>
                      <p className="text-sm text-slate-600">
                        {load.distance_miles ? `$${(load.rate / load.distance_miles).toFixed(2)}/mi` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">{load.pickup_location?.city}, {load.pickup_location?.state}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">{load.dropoff_location?.city}, {load.dropoff_location?.state}</span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <p className="text-slate-500">Pickup</p>
                      <p className="font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(load.pickup_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Weight</p>
                      <p className="font-semibold">{load.weight?.toLocaleString() || 'N/A'} lbs</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Commodity</p>
                      <p className="font-semibold">{load.commodity || 'General Freight'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Distance</p>
                      <p className="font-semibold">{load.distance_miles || 'N/A'} mi</p>
                    </div>
                  </div>

                  {/* Driver Assignment */}
                  {selectedLoad?.id === load.id && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Assign Driver:
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        value={selectedLoad.assignedDriver || ''}
                        onChange={(e) => setSelectedLoad({...selectedLoad, assignedDriver: e.target.value})}
                      >
                        <option value="">Select driver...</option>
                        {drivers.filter(d => d.status === 'available').map(driver => (
                          <option key={driver.id} value={driver.id}>
                            {driver.full_name} - {driver.current_location?.city || 'Unknown location'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {selectedLoad?.id === load.id ? (
                      <>
                        <Button
                          onClick={() => handleAcceptLoad(selectedLoad)}
                          disabled={!selectedLoad.assignedDriver || acceptLoadMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {acceptLoadMutation.isPending ? 'Accepting...' : 'Confirm Accept'}
                        </Button>
                        <Button
                          onClick={() => setSelectedLoad(null)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => setSelectedLoad(load)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Load
                        </Button>
                        <Button
                          onClick={() => handleDeclineLoad(load)}
                          variant="outline"
                          disabled={declineLoadMutation.isPending}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}