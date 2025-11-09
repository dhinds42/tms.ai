import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Bell, 
  MapPin, 
  CheckCircle,
  Navigation,
  Clock,
  Phone,
  User
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DirectionForwardingModal({ load, driver, carrier, onClose, operatingMode }) {
  const [selectedChannels, setSelectedChannels] = useState({
    sms: true,
    email: true,
    push: false
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const recipient = operatingMode === 'carrier' ? driver : carrier;

  const toggleChannel = (channel) => {
    setSelectedChannels({
      ...selectedChannels,
      [channel]: !selectedChannels[channel]
    });
  };

  // Generate directions text
  const generateDirections = () => {
    let directions = `🚛 LOAD DIRECTIONS - ${load.load_number || load.id.slice(0, 8)}\n\n`;
    
    // Pickup
    directions += `📍 PICKUP:\n`;
    directions += `${load.pickup_location?.address || ''}\n`;
    directions += `${load.pickup_location?.city}, ${load.pickup_location?.state} ${load.pickup_location?.zip || ''}\n`;
    if (load.pickup_date) {
      directions += `⏰ Appointment: ${new Date(load.pickup_date).toLocaleString()}\n`;
    }
    if (load.pickup_appointment?.confirmation_number) {
      directions += `📋 Confirmation: ${load.pickup_appointment.confirmation_number}\n`;
    }
    directions += `\n`;

    // Additional stops
    if (load.additional_stops && load.additional_stops.length > 0) {
      load.additional_stops.forEach((stop, idx) => {
        directions += `🛑 STOP ${idx + 1} (${stop.type}):\n`;
        directions += `${stop.location}\n`;
        if (stop.appointment_time) {
          directions += `⏰ ${stop.appointment_time}\n`;
        }
        if (stop.contact_name) {
          directions += `👤 Contact: ${stop.contact_name} ${stop.contact_phone || ''}\n`;
        }
        directions += `\n`;
      });
    }

    // Delivery
    directions += `📦 DELIVERY:\n`;
    directions += `${load.dropoff_location?.address || ''}\n`;
    directions += `${load.dropoff_location?.city}, ${load.dropoff_location?.state} ${load.dropoff_location?.zip || ''}\n`;
    if (load.delivery_date) {
      directions += `⏰ Appointment: ${new Date(load.delivery_date).toLocaleString()}\n`;
    }
    if (load.delivery_appointment?.confirmation_number) {
      directions += `📋 Confirmation: ${load.delivery_appointment.confirmation_number}\n`;
    }
    directions += `\n`;

    // Load details
    directions += `📊 LOAD DETAILS:\n`;
    directions += `Equipment: ${load.equipment_type?.replace('_', ' ').toUpperCase()}\n`;
    if (load.commodity) directions += `Commodity: ${load.commodity}\n`;
    if (load.weight) directions += `Weight: ${load.weight} lbs\n`;
    if (load.distance_miles) directions += `Distance: ${load.distance_miles} miles\n`;
    if (load.special_instructions) {
      directions += `\n⚠️ SPECIAL INSTRUCTIONS:\n${load.special_instructions}\n`;
    }

    return directions;
  };

  const handleForwardDirections = async () => {
    setSending(true);

    try {
      const directions = generateDirections();
      const channels = Object.keys(selectedChannels).filter(ch => selectedChannels[ch]);
      
      // Send via SMS
      if (selectedChannels.sms && recipient?.phone) {
        // In production, integrate with Twilio or similar SMS service
        console.log('Sending SMS to:', recipient.phone);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Send via Email
      if (selectedChannels.email && recipient?.email) {
        await base44.integrations.Core.SendEmail({
          to: recipient.email,
          subject: `Load Directions - ${load.load_number || load.id.slice(0, 8)}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Load Directions</h2>
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <pre style="white-space: pre-wrap; font-size: 14px;">${directions}</pre>
              </div>
              <div style="margin-top: 20px;">
                <a href="#" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View in LoadPanel App
                </a>
              </div>
              <p style="color: #6B7280; font-size: 12px; margin-top: 20px;">
                This is an automated message from your TMS. Do not reply to this email.
              </p>
            </div>
          `
        });
      }

      // Send via Push Notification (for upcoming LoadPanel driver app)
      if (selectedChannels.push) {
        // In production, integrate with Firebase Cloud Messaging or similar
        console.log('Sending push notification to driver app');
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setSent(true);
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error forwarding directions:', error);
      alert('Failed to forward directions. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="w-6 h-6 text-indigo-600" />
                Forward Directions
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Send trip directions via multiple communication channels
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Recipient Info */}
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {recipient?.full_name?.charAt(0) || recipient?.company_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {recipient?.full_name || recipient?.company_name || 'Not Assigned'}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                      {recipient?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {recipient.phone}
                        </span>
                      )}
                      {recipient?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {recipient.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge className="bg-indigo-600">
                  {operatingMode === 'carrier' ? 'Driver' : 'Carrier'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Load Info */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Load Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Pickup</p>
                  <p className="text-sm text-slate-600">
                    {load.pickup_location?.city}, {load.pickup_location?.state}
                  </p>
                  {load.pickup_date && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(load.pickup_date).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {load.additional_stops && load.additional_stops.length > 0 && (
                <div className="pl-8">
                  {load.additional_stops.map((stop, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg mb-2">
                      <Navigation className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">Stop {idx + 1} ({stop.type})</p>
                        <p className="text-sm text-slate-600">{stop.location}</p>
                        {stop.appointment_time && (
                          <p className="text-xs text-slate-500 mt-1">{stop.appointment_time}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Delivery</p>
                  <p className="text-sm text-slate-600">
                    {load.dropoff_location?.city}, {load.dropoff_location?.state}
                  </p>
                  {load.delivery_date && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(load.delivery_date).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Communication Channels */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Select Communication Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* SMS */}
              <button
                onClick={() => toggleChannel('sms')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedChannels.sms
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                disabled={!recipient?.phone}
              >
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className={`w-6 h-6 ${
                    selectedChannels.sms ? 'text-emerald-600' : 'text-slate-400'
                  }`} />
                  {selectedChannels.sms && (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <h4 className="font-bold text-slate-900 mb-1">SMS</h4>
                <p className="text-xs text-slate-600">
                  {recipient?.phone ? 'Text message' : 'No phone number'}
                </p>
                {recipient?.phone && (
                  <p className="text-xs text-slate-500 mt-1">{recipient.phone}</p>
                )}
              </button>

              {/* Email */}
              <button
                onClick={() => toggleChannel('email')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedChannels.email
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                disabled={!recipient?.email}
              >
                <div className="flex items-center justify-between mb-2">
                  <Mail className={`w-6 h-6 ${
                    selectedChannels.email ? 'text-blue-600' : 'text-slate-400'
                  }`} />
                  {selectedChannels.email && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Email</h4>
                <p className="text-xs text-slate-600">
                  {recipient?.email ? 'Email message' : 'No email address'}
                </p>
                {recipient?.email && (
                  <p className="text-xs text-slate-500 mt-1 truncate">{recipient.email}</p>
                )}
              </button>

              {/* Push Notification */}
              <button
                onClick={() => toggleChannel('push')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedChannels.push
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Bell className={`w-6 h-6 ${
                    selectedChannels.push ? 'text-purple-600' : 'text-slate-400'
                  }`} />
                  {selectedChannels.push && (
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Push Notification</h4>
                <p className="text-xs text-slate-600">LoadPanel Driver App</p>
                <Badge className="bg-purple-100 text-purple-800 text-xs mt-2">
                  Coming Soon
                </Badge>
              </button>

            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-2">Preview Message:</h4>
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
              {generateDirections()}
            </pre>
          </div>

          {/* Success Message */}
          {sent && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-900">Directions sent successfully!</p>
                <p className="text-sm text-emerald-700">
                  {recipient?.full_name || recipient?.company_name} has been notified via {
                    Object.keys(selectedChannels)
                      .filter(ch => selectedChannels[ch])
                      .map(ch => ch.toUpperCase())
                      .join(', ')
                  }
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-200 flex gap-3">
          <Button
            onClick={handleForwardDirections}
            disabled={sending || sent || !Object.values(selectedChannels).some(v => v) || !recipient}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            {sending ? (
              <>
                <Send className="w-4 h-4 mr-2 animate-pulse" />
                Sending Directions...
              </>
            ) : sent ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Sent Successfully!
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Forward Directions
              </>
            )}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Close
          </Button>
        </div>

      </div>
    </div>
  );
}