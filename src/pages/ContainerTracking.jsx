import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container, Ship, Search, MapPin, Clock } from "lucide-react";

import ContainerTrackerMap from "../components/container/ContainerTrackerMap";

export default function ContainerTracking() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: containers = [] } = useQuery({
    queryKey: ['containers'],
    queryFn: () => base44.entities.Container.list('-created_date', 200),
    initialData: [],
  });

  const filteredContainers = containers.filter(c =>
    searchTerm === '' ||
    c.container_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.booking_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      'at_origin': 'bg-blue-600',
      'in_transit': 'bg-purple-600',
      'at_port': 'bg-orange-600',
      'customs_clearance': 'bg-amber-600',
      'delivered': 'bg-emerald-600'
    };
    return colors[status] || 'bg-slate-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">
            Container Tracking
          </h1>
          <p className="text-slate-600 mt-2">Ocean freight and intermodal container visibility</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Containers</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{containers.length}</p>
                </div>
                <Container className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Transit</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {containers.filter(c => c.status === 'in_transit').length}
                  </p>
                </div>
                <Ship className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">At Port</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {containers.filter(c => c.status === 'at_port').length}
                  </p>
                </div>
                <MapPin className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Transit Time</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">21d</p>
                </div>
                <Clock className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by container or booking number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredContainers.map((container) => (
            <Card key={container.id} className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{container.container_number}</h4>
                    <p className="text-sm text-slate-600">Booking: {container.booking_number}</p>
                  </div>
                  <Badge className={getStatusColor(container.status)}>
                    {container.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">CONTAINER TYPE</p>
                    <p className="font-semibold text-slate-900">{container.container_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">SIZE</p>
                    <p className="font-semibold text-slate-900">{container.size_type}</p>
                  </div>
                </div>

                {container.current_location && (
                  <div className="p-3 bg-blue-50 rounded-lg mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <p className="text-xs font-semibold text-blue-900">CURRENT LOCATION</p>
                    </div>
                    <p className="text-sm text-slate-900">{container.current_location}</p>
                  </div>
                )}

                <Button variant="outline" className="w-full">
                  View Full Tracking History
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContainers.length === 0 && (
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-12 text-center">
              <Container className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No containers found</h3>
              <p className="text-slate-600">Search for a container to track</p>
            </CardContent>
          </Card>
        )}

        {/* Container Tracker Map */}
        <ContainerTrackerMap />

      </div>
    </div>
  );
}