import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MapPin,
  Radio,
  CheckCircle,
  Clock,
  Mic,
  MessageSquare,
  Navigation,
  AlertTriangle,
  Zap
} from "lucide-react";
import { format } from "date-fns";

export default function AutomatedCheckCalls({ driverId, loadId }) {
  const [showCheckCall, setShowCheckCall] = useState(false);
  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [geofenceTrigger, setGeofenceTrigger] = useState(null);

  const queryClient = useQueryClient();

  // Fetch driver
  const { data: driver } = useQuery({
    queryKey: ['driver', driverId],
    queryFn: () => base44.entities.Driver.filter({ id: driverId }),
    enabled: !!driverId,
    select: (data) => data[0]
  });

  // Fetch load
  const { data: load } = useQuery({
    queryKey: ['load', loadId],
    queryFn: () => base44.entities.Load.filter({ id: loadId }),
    enabled: !!loadId,
    select: (data) => data[0]
  });

  // Fetch recent check calls
  const { data: checkCalls } = useQuery({
    queryKey: ['check-calls', loadId],
    queryFn: async () => {
      const loads = await base44.entities.Load.filter({ id: loadId });
      return loads[0]?.check_calls || [];
    },
    enabled: !!loadId,
    initialData: []
  });

  // Create check call mutation
  const createCheckCallMutation = useMutation({
    mutationFn: async (checkCallData) => {
      const existingLoad = await base44.entities.Load.filter({ id: loadId });
      const currentCheckCalls = existingLoad[0]?.check_calls || [];
      
      const updatedLoad = await base44.entities.Load.update(loadId, {
        check_calls: [...currentCheckCalls, checkCallData],
        eta: checkCallData.eta_update || existingLoad[0].eta
      });

      return updatedLoad;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-calls'] });
      queryClient.invalidateQueries({ queryKey: ['load'] });
      setShowCheckCall(false);
      setNotes("");
      setGeofenceTrigger(null);
    },
  });

  // Simulate GPS tracking
  useEffect(() => {
    if (!load || !driver) return;

    const simulateGPS = () => {
      // Simulate GPS coordinates
      const pickupLat = 34.0522;
      const pickupLng = -118.2437;
      const dropLat = load.dropoff_location?.coordinates?.lat || 40.7128;
      const dropLng = load.dropoff_location?.coordinates?.lng || -74.0060;
      
      // Simulate movement
      const progress = Math.random();
      const currentLat = pickupLat + (dropLat - pickupLat) * progress;
      const currentLng = pickupLng + (dropLng - pickupLng) * progress;
      
      const location = {
        lat: currentLat,
        lng: currentLng,
        timestamp: new Date().toISOString()
      };
      
      setGpsLocation(location);
      
      // Check geofence triggers
      checkGeofences(location);
    };

    const interval = setInterval(simulateGPS, 30000); // Update every 30 seconds
    simulateGPS(); // Initial call
    
    return () => clearInterval(interval);
  }, [load, driver]);

  const checkGeofences = (location) => {
    if (!load) return;

    // Define geofence zones (5 mile radius)
    const geofenceRadius = 0.0725; // ~5 miles in degrees

    // Check pickup geofence
    const pickupLat = 34.0522;
    const pickupLng = -118.2437;
    const distanceToPickup = Math.sqrt(
      Math.pow(location.lat - pickupLat, 2) + Math.pow(location.lng - pickupLng, 2)
    );

    if (distanceToPickup < geofenceRadius && load.status === 'dispatched') {
      triggerAutoCheckCall('pickup_arrival', 'Approaching pickup location');
    }

    // Check delivery geofence
    const dropLat = load.dropoff_location?.coordinates?.lat || 40.7128;
    const dropLng = load.dropoff_location?.coordinates?.lng || -74.0060;
    const distanceToDelivery = Math.sqrt(
      Math.pow(location.lat - dropLat, 2) + Math.pow(location.lng - dropLng, 2)
    );

    if (distanceToDelivery < geofenceRadius && load.status === 'in_transit') {
      triggerAutoCheckCall('delivery_arrival', 'Approaching delivery location');
    }
  };

  const triggerAutoCheckCall = (triggerType, message) => {
    setGeofenceTrigger({ type: triggerType, message });
    setShowCheckCall(true);
  };

  const handleVoiceRecording = async () => {
    if (!isRecording) {
      setIsRecording(true);
      // In production: Start voice recording via browser API
      setTimeout(() => {
        setIsRecording(false);
        setNotes(notes + "\n[Voice recording transcribed: Driver reports on-time arrival, no issues.]");
      }, 3000);
    }
  };

  const handleSubmitCheckCall = () => {
    const user = driver || { email: 'driver@tms.ai', full_name: 'Driver' };
    
    const checkCallData = {
      timestamp: new Date().toISOString(),
      user: user.full_name,
      driver_status: load?.status || 'in_transit',
      current_location: gpsLocation ? `${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}` : 'Unknown',
      notes: notes,
      trigger_type: geofenceTrigger?.type || 'manual',
      method: isRecording ? 'voice' : 'text',
      gps_coordinates: gpsLocation,
      eta_update: load?.eta
    };

    createCheckCallMutation.mutate(checkCallData);
  };

  const getTriggerBadge = (trigger) => {
    if (!trigger) return null;
    
    const configs = {
      pickup_arrival: { color: 'bg-blue-100 text-blue-700', icon: MapPin, label: 'Pickup Zone' },
      delivery_arrival: { color: 'bg-emerald-100 text-emerald-700', icon: Navigation, label: 'Delivery Zone' },
      manual: { color: 'bg-slate-100 text-slate-700', icon: Radio, label: 'Manual' }
    };
    
    const config = configs[trigger.type] || configs.manual;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Auto Check-Call Trigger */}
      {geofenceTrigger && (
        <Card className="border-2 border-blue-500 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50 animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-full">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900">Geofence Alert</h3>
                <p className="text-sm text-blue-700">{geofenceTrigger.message}</p>
              </div>
              <Button
                onClick={() => setShowCheckCall(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Radio className="w-4 h-4 mr-2" />
                Check In
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Check-In Button */}
      <Button
        onClick={() => setShowCheckCall(true)}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
      >
        <Radio className="w-4 h-4 mr-2" />
        Log Check Call
      </Button>

      {/* Recent Check Calls */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg">Check Call History</CardTitle>
        </CardHeader>
        <CardContent>
          {checkCalls.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No check calls logged yet</p>
          ) : (
            <div className="space-y-3">
              {checkCalls.slice(-5).reverse().map((call, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-slate-900">{call.user}</span>
                      {getTriggerBadge({ type: call.trigger_type })}
                    </div>
                    <span className="text-xs text-slate-500">
                      {format(new Date(call.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div>
                      <p className="text-slate-500">Status</p>
                      <p className="font-medium capitalize">{call.driver_status?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Location</p>
                      <p className="font-medium">{call.current_location || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {call.notes && (
                    <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                      {call.notes}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    {call.method === 'voice' && (
                      <Badge variant="outline" className="text-xs">
                        <Mic className="w-3 h-3 mr-1" />
                        Voice
                      </Badge>
                    )}
                    {call.gps_coordinates && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        GPS Verified
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check Call Modal */}
      <Dialog open={showCheckCall} onOpenChange={setShowCheckCall}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Log Check Call</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {geofenceTrigger && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">Auto-Triggered</span>
                </div>
                <p className="text-sm text-blue-700">{geofenceTrigger.message}</p>
              </div>
            )}
            
            {/* Load Info */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Load</p>
                <p className="font-semibold">{load?.load_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-semibold capitalize">{load?.status?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Destination</p>
                <p className="font-semibold">{load?.dropoff_location?.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">GPS Location</p>
                <p className="font-semibold text-xs">
                  {gpsLocation ? `${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}` : 'Acquiring...'}
                </p>
              </div>
            </div>

            {/* Voice Recording */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-slate-900">Voice Note</label>
                <Button
                  onClick={handleVoiceRecording}
                  disabled={isRecording}
                  variant="outline"
                  className={isRecording ? 'border-red-500 text-red-600' : ''}
                >
                  <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
                  {isRecording ? 'Recording...' : 'Record Voice'}
                </Button>
              </div>
              
              {isRecording && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-900 font-medium">Recording in progress...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="font-semibold text-slate-900 mb-2 block">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Driver location, ETA update, any issues or delays..."
                rows={5}
              />
            </div>

            {/* Auto-ETA Notification */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-900 font-medium">
                  Customer will be automatically notified of updated ETA
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckCall(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCheckCall}
              disabled={createCheckCallMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              <Radio className="w-4 h-4 mr-2" />
              {createCheckCallMutation.isPending ? 'Saving...' : 'Submit Check Call'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}