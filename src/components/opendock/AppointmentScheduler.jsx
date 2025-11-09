import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Send,
  XCircle
} from "lucide-react";

// Opendock API helpers
const getOpendockCredential = (key) => {
  const encKey = localStorage.getItem('_enc_key');
  if (!encKey) return null;
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;
  try {
    const decoded = atob(encrypted);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ encKey.charCodeAt(i % encKey.length));
    }
    return decrypted;
  } catch {
    return null;
  }
};

const getBaseURL = () => {
  const environment = getOpendockCredential('carrier_opendock_environment') || 'staging';
  return environment === 'production' 
    ? 'https://neutron.opendock.com' 
    : 'https://neutron.staging.opendock.com';
};

let jwtToken = null;
let jwtExpiry = null;

const authenticate = async () => {
  const username = getOpendockCredential('carrier_opendock_username');
  const password = getOpendockCredential('carrier_opendock_password');
  
  if (!username || !password) {
    throw new Error('Opendock credentials not configured');
  }
  
  if (jwtToken && jwtExpiry && Date.now() < jwtExpiry) {
    return jwtToken;
  }
  
  const response = await fetch(`${getBaseURL()}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (!response.ok) throw new Error('Authentication failed');
  
  const data = await response.json();
  jwtToken = data.token;
  jwtExpiry = Date.now() + (50 * 60 * 1000);
  return jwtToken;
};

const getAuthHeader = async () => {
  const authType = getOpendockCredential('carrier_opendock_auth_type') || 'api_key';
  
  if (authType === 'api_key') {
    const apiKey = getOpendockCredential('carrier_opendock_api_key');
    if (!apiKey) throw new Error('API key not configured');
    return { 'Authorization': `Bearer ${apiKey}` };
  } else {
    const token = await authenticate();
    return { 'Authorization': `Bearer ${token}` };
  }
};

// Appointment API Functions
const getAppointmentWindows = async (loadId) => {
  const authHeader = await getAuthHeader();
  
  const response = await fetch(`${getBaseURL()}/api/v1/loads/${loadId}/appointment-windows`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  });
  
  if (!response.ok) throw new Error('Failed to fetch appointment windows');
  return response.json();
};

const requestAppointment = async (loadId, appointmentData) => {
  const authHeader = await getAuthHeader();
  
  const response = await fetch(`${getBaseURL()}/api/v1/loads/${loadId}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: JSON.stringify(appointmentData)
  });
  
  if (!response.ok) throw new Error('Failed to request appointment');
  return response.json();
};

const confirmAppointment = async (loadId, appointmentId) => {
  const authHeader = await getAuthHeader();
  
  const response = await fetch(`${getBaseURL()}/api/v1/loads/${loadId}/appointments/${appointmentId}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  });
  
  if (!response.ok) throw new Error('Failed to confirm appointment');
  return response.json();
};

const rescheduleAppointment = async (loadId, appointmentId, newTime) => {
  const authHeader = await getAuthHeader();
  
  const response = await fetch(`${getBaseURL()}/api/v1/loads/${loadId}/appointments/${appointmentId}/reschedule`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: JSON.stringify({ new_appointment_time: newTime })
  });
  
  if (!response.ok) throw new Error('Failed to reschedule appointment');
  return response.json();
};

const cancelAppointment = async (loadId, appointmentId, reason) => {
  const authHeader = await getAuthHeader();
  
  const response = await fetch(`${getBaseURL()}/api/v1/loads/${loadId}/appointments/${appointmentId}/cancel`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: JSON.stringify({ cancellation_reason: reason })
  });
  
  if (!response.ok) throw new Error('Failed to cancel appointment');
  return response.json();
};

export default function AppointmentScheduler() {
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [appointmentType, setAppointmentType] = useState('pickup'); // pickup or delivery
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeStart, setSelectedTimeStart] = useState('');
  const [selectedTimeEnd, setSelectedTimeEnd] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch loads with Opendock IDs that need appointments
  const { data: loadsNeedingAppointments, refetch } = useQuery({
    queryKey: ['opendockAppointments'],
    queryFn: async () => {
      const loads = await base44.entities.Load.list('-created_date', 100);
      return loads.filter(l => 
        l.opendock_load_id && 
        ['assigned', 'dispatched', 'picked_up'].includes(l.status) &&
        (!l.pickup_appointment?.confirmed || !l.delivery_appointment?.confirmed)
      );
    },
    initialData: []
  });

  // Fetch available appointment windows
  const { data: appointmentWindows, isLoading: loadingWindows } = useQuery({
    queryKey: ['appointmentWindows', selectedLoad?.opendock_load_id],
    queryFn: () => getAppointmentWindows(selectedLoad.opendock_load_id),
    enabled: !!selectedLoad?.opendock_load_id,
    initialData: { pickup_windows: [], delivery_windows: [] }
  });

  // Request appointment mutation
  const requestAppointmentMutation = useMutation({
    mutationFn: async () => {
      const appointmentData = {
        type: appointmentType,
        requested_date: selectedDate,
        time_window_start: selectedTimeStart,
        time_window_end: selectedTimeEnd,
        notes: appointmentNotes
      };
      
      const result = await requestAppointment(
        selectedLoad.opendock_load_id,
        appointmentData
      );
      
      // Update local TMS load record
      const updateData = appointmentType === 'pickup' 
        ? {
            pickup_appointment: {
              scheduled: true,
              required: true,
              time_window_start: selectedTimeStart,
              time_window_end: selectedTimeEnd,
              confirmation_number: result.confirmation_number,
              opendock_appointment_id: result.appointment_id
            }
          }
        : {
            delivery_appointment: {
              scheduled: true,
              required: true,
              time_window_start: selectedTimeStart,
              time_window_end: selectedTimeEnd,
              confirmation_number: result.confirmation_number,
              opendock_appointment_id: result.appointment_id
            }
          };
      
      await base44.entities.Load.update(selectedLoad.id, updateData);
      
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(['opendockAppointments']);
      setSelectedLoad(null);
      setSelectedDate('');
      setSelectedTimeStart('');
      setSelectedTimeEnd('');
      setAppointmentNotes('');
      alert(`✅ Appointment requested successfully!\n\nConfirmation: ${result.confirmation_number}`);
    },
    onError: (error) => {
      alert(`❌ Failed to request appointment: ${error.message}`);
    }
  });

  // Confirm appointment mutation
  const confirmAppointmentMutation = useMutation({
    mutationFn: async ({ load, type }) => {
      const appointment = type === 'pickup' 
        ? load.pickup_appointment 
        : load.delivery_appointment;
      
      const result = await confirmAppointment(
        load.opendock_load_id,
        appointment.opendock_appointment_id
      );
      
      // Update local record
      const updateData = type === 'pickup'
        ? {
            pickup_appointment: {
              ...load.pickup_appointment,
              confirmed: true,
              confirmed_date: new Date().toISOString()
            }
          }
        : {
            delivery_appointment: {
              ...load.delivery_appointment,
              confirmed: true,
              confirmed_date: new Date().toISOString()
            }
          };
      
      await base44.entities.Load.update(load.id, updateData);
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['opendockAppointments']);
      alert('✅ Appointment confirmed successfully!');
    }
  });

  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: async ({ load, type, reason }) => {
      const appointment = type === 'pickup' 
        ? load.pickup_appointment 
        : load.delivery_appointment;
      
      await cancelAppointment(
        load.opendock_load_id,
        appointment.opendock_appointment_id,
        reason
      );
      
      // Update local record
      const updateData = type === 'pickup'
        ? { pickup_appointment: null }
        : { delivery_appointment: null };
      
      await base44.entities.Load.update(load.id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['opendockAppointments']);
      alert('✅ Appointment cancelled');
    }
  });

  const handleRequestAppointment = () => {
    if (!selectedDate || !selectedTimeStart || !selectedTimeEnd) {
      alert('Please fill in all appointment details');
      return;
    }
    
    requestAppointmentMutation.mutate();
  };

  const handleConfirmAppointment = (load, type) => {
    if (confirm(`Confirm ${type} appointment for load ${load.load_number || load.external_load_number}?`)) {
      confirmAppointmentMutation.mutate({ load, type });
    }
  };

  const handleCancelAppointment = (load, type) => {
    const reason = prompt('Reason for cancellation:');
    if (reason) {
      cancelAppointmentMutation.mutate({ load, type, reason });
    }
  };

  const needsPickupAppointment = (load) => {
    return !load.pickup_appointment?.scheduled || !load.pickup_appointment?.confirmed;
  };

  const needsDeliveryAppointment = (load) => {
    return !load.delivery_appointment?.scheduled || !load.delivery_appointment?.confirmed;
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Opendock Appointment Scheduler
          </CardTitle>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <p className="text-sm font-semibold text-slate-500 uppercase">Needs Appointment</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {loadsNeedingAppointments.length}
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-slate-500 uppercase">Pickup Pending</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {loadsNeedingAppointments.filter(needsPickupAppointment).length}
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <p className="text-sm font-semibold text-slate-500 uppercase">Delivery Pending</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {loadsNeedingAppointments.filter(needsDeliveryAppointment).length}
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
            <p className="text-sm font-semibold text-slate-500 uppercase">Confirmed Today</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {loadsNeedingAppointments.filter(l => 
                l.pickup_appointment?.confirmed || l.delivery_appointment?.confirmed
              ).length}
            </p>
          </div>
        </div>

        {/* Appointment Request Form */}
        {selectedLoad && (
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-indigo-900">
                Request Appointment: {selectedLoad.load_number || selectedLoad.external_load_number}
              </h3>
              <Button onClick={() => setSelectedLoad(null)} variant="outline" size="sm">
                <XCircle className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="font-semibold">Appointment Type</Label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="pickup">Pickup Appointment</option>
                  <option value="delivery">Delivery Appointment</option>
                </select>
              </div>

              <div>
                <Label className="font-semibold">Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-2"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label className="font-semibold">Time Window Start</Label>
                <Input
                  type="time"
                  value={selectedTimeStart}
                  onChange={(e) => setSelectedTimeStart(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="font-semibold">Time Window End</Label>
                <Input
                  type="time"
                  value={selectedTimeEnd}
                  onChange={(e) => setSelectedTimeEnd(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="mb-4">
              <Label className="font-semibold">Notes (Optional)</Label>
              <Input
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                placeholder="Special instructions, reference numbers, etc."
                className="mt-2"
              />
            </div>

            {/* Available Windows */}
            {loadingWindows ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-600">Loading available windows...</p>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-white rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Available {appointmentType === 'pickup' ? 'Pickup' : 'Delivery'} Windows:
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {(appointmentType === 'pickup' 
                    ? appointmentWindows.pickup_windows 
                    : appointmentWindows.delivery_windows
                  ).map((window, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDate(window.date);
                        setSelectedTimeStart(window.start_time);
                        setSelectedTimeEnd(window.end_time);
                      }}
                      className="p-3 text-left border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                    >
                      <p className="font-semibold text-slate-900">{window.date}</p>
                      <p className="text-sm text-slate-600">
                        {window.start_time} - {window.end_time}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleRequestAppointment}
              disabled={requestAppointmentMutation.isPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {requestAppointmentMutation.isPending ? 'Requesting...' : 'Request Appointment'}
            </Button>
          </div>
        )}

        {/* Loads Needing Appointments */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Loads Needing Appointments:</h4>
          
          {loadsNeedingAppointments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>All appointments are scheduled and confirmed!</p>
            </div>
          ) : (
            loadsNeedingAppointments.map(load => (
              <div
                key={load.id}
                className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-slate-900">
                        {load.load_number || load.external_load_number}
                      </span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {load.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pickup Appointment Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className={`p-3 rounded-lg border ${
                    load.pickup_appointment?.confirmed 
                      ? 'bg-emerald-50 border-emerald-300' 
                      : load.pickup_appointment?.scheduled
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-amber-50 border-amber-300'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">Pickup Appointment</span>
                      {load.pickup_appointment?.confirmed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : load.pickup_appointment?.scheduled ? (
                        <Clock className="w-4 h-4 text-blue-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    {load.pickup_appointment?.scheduled ? (
                      <>
                        <p className="text-xs text-slate-600 mb-2">
                          {load.pickup_appointment.time_window_start} - {load.pickup_appointment.time_window_end}
                        </p>
                        {load.pickup_appointment.confirmation_number && (
                          <p className="text-xs text-slate-500 mb-2">
                            Conf: {load.pickup_appointment.confirmation_number}
                          </p>
                        )}
                        {!load.pickup_appointment.confirmed && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleConfirmAppointment(load, 'pickup')}
                              size="sm"
                              className="flex-1 bg-emerald-600 text-white text-xs"
                            >
                              Confirm
                            </Button>
                            <Button
                              onClick={() => handleCancelAppointment(load, 'pickup')}
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedLoad(load);
                          setAppointmentType('pickup');
                        }}
                        size="sm"
                        className="w-full bg-amber-600 text-white text-xs"
                      >
                        Schedule Pickup
                      </Button>
                    )}
                  </div>

                  {/* Delivery Appointment Status */}
                  <div className={`p-3 rounded-lg border ${
                    load.delivery_appointment?.confirmed 
                      ? 'bg-emerald-50 border-emerald-300' 
                      : load.delivery_appointment?.scheduled
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-amber-50 border-amber-300'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">Delivery Appointment</span>
                      {load.delivery_appointment?.confirmed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : load.delivery_appointment?.scheduled ? (
                        <Clock className="w-4 h-4 text-blue-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    {load.delivery_appointment?.scheduled ? (
                      <>
                        <p className="text-xs text-slate-600 mb-2">
                          {load.delivery_appointment.time_window_start} - {load.delivery_appointment.time_window_end}
                        </p>
                        {load.delivery_appointment.confirmation_number && (
                          <p className="text-xs text-slate-500 mb-2">
                            Conf: {load.delivery_appointment.confirmation_number}
                          </p>
                        )}
                        {!load.delivery_appointment.confirmed && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleConfirmAppointment(load, 'delivery')}
                              size="sm"
                              className="flex-1 bg-emerald-600 text-white text-xs"
                            >
                              Confirm
                            </Button>
                            <Button
                              onClick={() => handleCancelAppointment(load, 'delivery')}
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedLoad(load);
                          setAppointmentType('delivery');
                        }}
                        size="sm"
                        className="w-full bg-amber-600 text-white text-xs"
                      >
                        Schedule Delivery
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Appointment Scheduling</h4>
              <p className="text-sm text-blue-800">
                Request pickup and delivery appointments for Opendock loads. Available time windows are provided by the shipper. 
                Once scheduled, confirm appointments to notify all parties. Appointments sync back to the TMS Load Board automatically.
              </p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}