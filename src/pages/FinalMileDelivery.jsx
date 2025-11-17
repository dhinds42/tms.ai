import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Clock, CheckCircle } from "lucide-react";

export default function FinalMileDelivery() {
  const { data: loads = [] } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 200),
    initialData: [],
  });

  const finalMileLoads = loads.filter(l => 
    l.service_level === 'white_glove' || l.requires_installation
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 bg-clip-text text-transparent">
            Final Mile Delivery
          </h1>
          <p className="text-slate-600 mt-2">White glove, installation, and last-mile services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Deliveries</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{finalMileLoads.length}</p>
                </div>
                <Package className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">On-Time Rate</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">97.2%</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Delivery Time</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">2.3h</p>
                </div>
                <Clock className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Delivery Zones</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">47</p>
                </div>
                <MapPin className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Final Mile Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-2">White Glove Delivery</h4>
                <p className="text-sm text-slate-600">
                  Premium delivery with room-of-choice placement and unpacking
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Installation Services</h4>
                <p className="text-sm text-slate-600">
                  Professional installation and setup at customer location
                </p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Scheduled Delivery</h4>
                <p className="text-sm text-slate-600">
                  Appointment-based delivery with 2-hour time windows
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Active Final Mile Deliveries</h3>
            {finalMileLoads.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No active final mile deliveries</p>
              </div>
            ) : (
              <div className="space-y-3">
                {finalMileLoads.map((load) => (
                  <div key={load.id} className="p-4 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{load.load_number}</h4>
                        <p className="text-sm text-slate-600">
                          Delivery to: {load.destination_city}
                        </p>
                      </div>
                      <Badge className="bg-amber-600">Final Mile</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}