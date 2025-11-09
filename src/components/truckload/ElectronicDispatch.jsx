import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Send,
  Mail,
  MessageSquare,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Smartphone,
  Truck
} from "lucide-react";

export default function ElectronicDispatch({ load, carrier, driver }) {
  const [dispatchMethod, setDispatchMethod] = useState('email');
  const [isSending, setIsSending] = useState(false);

  const dispatchMethods = [
    { id: 'email', label: 'Email', icon: Mail, description: 'Send rate confirmation via email' },
    { id: 'sms', label: 'SMS', icon: MessageSquare, description: 'Text message to driver' },
    { id: 'app', label: 'Driver App', icon: Smartphone, description: 'Push to mobile app' },
    { id: 'edi', label: 'EDI 204', icon: FileText, description: 'Electronic tender (EDI)' }
  ];

  const handleDispatch = async () => {
    setIsSending(true);
    
    // Simulate dispatch
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert(`Dispatched via ${dispatchMethod}!\n\nLoad: ${load?.load_number || 'LOAD-001'}\nCarrier: ${carrier?.company_name || 'ABC Transport'}\nDriver: ${driver?.full_name || 'John Doe'}\n\nRate confirmation and load details sent.`);
    
    setIsSending(false);
  };

  const dispatchHistory = [
    { 
      id: '1', 
      timestamp: new Date().toISOString(), 
      method: 'email', 
      recipient: 'driver@carrier.com',
      status: 'delivered',
      load_number: load?.load_number || 'LOAD-001'
    },
    { 
      id: '2', 
      timestamp: new Date(Date.now() - 3600000).toISOString(), 
      method: 'sms', 
      recipient: '555-123-4567',
      status: 'delivered',
      load_number: load?.load_number || 'LOAD-001'
    }
  ];

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Electronic Dispatch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Send load details, rate confirmation, and dispatch instructions electronically to carriers and drivers.
          </p>
        </div>

        {/* Load Summary */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h3 className="font-bold text-slate-900 mb-3">Dispatch Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-600">Load Number</p>
              <p className="font-semibold">{load?.load_number || 'LOAD-001'}</p>
            </div>
            <div>
              <p className="text-slate-600">Carrier</p>
              <p className="font-semibold">{carrier?.company_name || 'ABC Transport'}</p>
            </div>
            <div>
              <p className="text-slate-600">Driver</p>
              <p className="font-semibold">{driver?.full_name || 'John Doe'}</p>
            </div>
            <div>
              <p className="text-slate-600">Rate</p>
              <p className="font-semibold text-emerald-600">${load?.carrier_pay?.toFixed(2) || '1,500.00'}</p>
            </div>
          </div>
        </div>

        {/* Dispatch Method Selection */}
        <div>
          <h3 className="font-bold text-slate-900 mb-3">Select Dispatch Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dispatchMethods.map(method => (
              <button
                key={method.id}
                onClick={() => setDispatchMethod(method.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  dispatchMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    dispatchMethod === method.id ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <method.icon className={`w-5 h-5 ${
                      dispatchMethod === method.id ? 'text-blue-600' : 'text-slate-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{method.label}</p>
                    <p className="text-xs text-slate-600 mt-1">{method.description}</p>
                  </div>
                  {dispatchMethod === method.id && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dispatch Button */}
        <Button 
          onClick={handleDispatch}
          disabled={isSending}
          className="w-full bg-blue-600 text-white"
        >
          {isSending ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Sending Dispatch...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Dispatch Load via {dispatchMethods.find(m => m.id === dispatchMethod)?.label}
            </>
          )}
        </Button>

        {/* Documents Included */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-3">Documents Included:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-slate-700">Rate Confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-slate-700">Load Instructions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-slate-700">Pickup/Delivery Details</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-slate-700">Commodity Information</span>
            </div>
          </div>
        </div>

        {/* Dispatch History */}
        <div>
          <h3 className="font-bold text-slate-900 mb-3">Recent Dispatch History</h3>
          <div className="space-y-2">
            {dispatchHistory.map(dispatch => (
              <div key={dispatch.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {dispatch.method === 'email' && <Mail className="w-4 h-4 text-slate-600" />}
                  {dispatch.method === 'sms' && <MessageSquare className="w-4 h-4 text-slate-600" />}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{dispatch.load_number}</p>
                    <p className="text-xs text-slate-600">
                      {dispatch.method.toUpperCase()} to {dispatch.recipient}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(dispatch.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {dispatch.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}