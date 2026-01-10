import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Truck,
  Package,
  CheckCircle,
  Clock,
  Navigation,
  Search,
  ExternalLink
} from "lucide-react";

export default function TrackAndTrace() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchedLoad, setSearchedLoad] = useState(null);

  const { data: loads = [], isLoading } = useScopedEntity('Load', { limit: 100 });

  const handleSearch = () => {
    const found = loads.find(l => 
      l.load_number?.toLowerCase() === trackingNumber.toLowerCase() ||
      l.id.toLowerCase().includes(trackingNumber.toLowerCase()) ||
      l.reference_number?.toLowerCase() === trackingNumber.toLowerCase()
    );
    setSearchedLoad(found || null);
  };

  const getStatusIcon = (status) => {
    const icons = {
      'available': Clock,
      'tendered': Clock,
      'booked': CheckCircle,
      'dispatched': Truck,
      'picked_up': Package,
      'in_transit': Navigation,
      'delivered': CheckCircle
    };
    return icons[status] || Truck;
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': 'bg-slate-100 text-slate-800',
      'tendered': 'bg-amber-100 text-amber-800',
      'booked': 'bg-blue-100 text-blue-800',
      'dispatched': 'bg-purple-100 text-purple-800',
      'picked_up': 'bg-indigo-100 text-indigo-800',
      'in_transit': 'bg-cyan-100 text-cyan-800',
      'delivered': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Track & Trace Portal
          </h1>
          <p className="text-slate-600 mt-2">Customer-facing shipment tracking portal</p>
        </div>

        {/* Search Card */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Enter tracking number, load #, or reference #..."
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 text-lg h-14 border-2"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Track Shipment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {searchedLoad ? (
          <div className="space-y-6">
            {/* Shipment Info Card */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">Shipment #{searchedLoad.load_number || searchedLoad.id.slice(0, 8)}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Reference: {searchedLoad.reference_number || 'N/A'}</p>
                  </div>
                  <Badge className={getStatusColor(searchedLoad.status) + ' text-lg px-4 py-2'}>
                    {searchedLoad.status?.toUpperCase().replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Origin */}
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-emerald-900">Origin</h3>
                    </div>
                    <p className="text-slate-900 font-semibold">
                      {searchedLoad.pickup_location?.city}, {searchedLoad.pickup_location?.state}
                    </p>
                    {searchedLoad.pickup_date && (
                      <p className="text-sm text-slate-600 mt-1">
                        Pickup: {new Date(searchedLoad.pickup_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Destination */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-blue-900">Destination</h3>
                    </div>
                    <p className="text-slate-900 font-semibold">
                      {searchedLoad.dropoff_location?.city}, {searchedLoad.dropoff_location?.state}
                    </p>
                    {searchedLoad.delivery_date && (
                      <p className="text-sm text-slate-600 mt-1">
                        Est. Delivery: {new Date(searchedLoad.delivery_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4">Shipment Timeline</h3>
                  <div className="space-y-4">
                    {['dispatched', 'picked_up', 'in_transit', 'delivered'].map((status, idx) => {
                      const StatusIcon = getStatusIcon(status);
                      const isCompleted = ['dispatched', 'picked_up', 'in_transit', 'delivered'].indexOf(searchedLoad.status) >= idx;
                      const isCurrent = searchedLoad.status === status;

                      return (
                        <div key={status} className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-emerald-100' : 'bg-slate-100'
                          }`}>
                            <StatusIcon className={`w-5 h-5 ${
                              isCompleted ? 'text-emerald-600' : 'text-slate-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                            </p>
                            {isCurrent && (
                              <p className="text-sm text-blue-600">Currently in progress</p>
                            )}
                          </div>
                          {isCompleted && !isCurrent && (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Info */}
                {(searchedLoad.commodity || searchedLoad.weight) && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-3">Shipment Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {searchedLoad.commodity && (
                        <div>
                          <p className="text-slate-600">Commodity</p>
                          <p className="font-semibold text-slate-900">{searchedLoad.commodity}</p>
                        </div>
                      )}
                      {searchedLoad.weight && (
                        <div>
                          <p className="text-slate-600">Weight</p>
                          <p className="font-semibold text-slate-900">{searchedLoad.weight.toLocaleString()} lbs</p>
                        </div>
                      )}
                      {searchedLoad.equipment_type && (
                        <div>
                          <p className="text-slate-600">Equipment</p>
                          <p className="font-semibold text-slate-900 capitalize">{searchedLoad.equipment_type.replace('_', ' ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Support */}
                <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <p className="text-sm text-indigo-900">
                    <strong>Need help?</strong> Contact our support team for assistance with your shipment.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 border-indigo-300 text-indigo-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : trackingNumber && !searchedLoad ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Shipment Not Found</h3>
              <p className="text-slate-600">
                We couldn't find a shipment matching "{trackingNumber}". Please check the tracking number and try again.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Track Your Shipment</h3>
              <p className="text-slate-600">
                Enter your tracking number above to view real-time shipment status and location information.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}