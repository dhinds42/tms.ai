import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useOrgQueryKey } from "@/components/hooks/useOrgQueryKey";
import { scopedList } from "@/components/api/scopedEntities";
import { useCurrentOrgId } from "@/components/hooks/useCurrentOrg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/design-system/PageHeader";
import { Package, MapPin, DollarSign, Calendar, Truck } from "lucide-react";

export default function CompanyLoadboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const orgId = useCurrentOrgId();
  const loadsKey = useOrgQueryKey('loads');

  const { data: loads = [], isLoading } = useQuery({
    queryKey: loadsKey,
    queryFn: () => scopedList(base44.entities.Load, orgId, { sort: '-created_date', limit: 100 }),
    initialData: [],
  });

  // Filter for available loads only (unassigned or tendered)
  const availableLoads = loads.filter(load => 
    ['available', 'tendered', 'pending'].includes(load.status)
  );

  const filteredLoads = availableLoads.filter(load => {
    const matchesSearch = 
      load.load_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.pickup_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.dropoff_location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEquipment = selectedEquipment === "all" || load.equipment_type === selectedEquipment;
    
    return matchesSearch && matchesEquipment;
  });

  const equipmentTypes = ["all", "Dry Van", "Reefer", "Flatbed", "Step Deck", "Lowboy"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Company Load Board"
        subtitle="Internal loads available for booking"
        icon={Package}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center flex-wrap">
              <Input
                placeholder="Search by load #, origin, destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-[300px]"
              />
              <div className="flex gap-2">
                {equipmentTypes.map(type => (
                  <Button
                    key={type}
                    variant={selectedEquipment === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedEquipment(type)}
                  >
                    {type === "all" ? "All Equipment" : type}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">{availableLoads.length}</div>
              <p className="text-sm text-slate-600 mt-1">Available Loads</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-600">
                {availableLoads.filter(l => l.priority === 'urgent').length}
              </div>
              <p className="text-sm text-slate-600 mt-1">Urgent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">
                ${availableLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0).toLocaleString()}
              </div>
              <p className="text-sm text-slate-600 mt-1">Total Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">
                {new Set(availableLoads.map(l => l.equipment_type)).size}
              </div>
              <p className="text-sm text-slate-600 mt-1">Equipment Types</p>
            </CardContent>
          </Card>
        </div>

        {/* Load Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredLoads.map(load => (
            <Card key={load.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{load.load_number}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{load.equipment_type || 'Dry Van'}</Badge>
                      {load.priority === 'urgent' && (
                        <Badge className="bg-red-500">Urgent</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      ${load.customer_rate?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-slate-500">
                      {load.miles || 0} mi
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">
                        {load.pickup_location?.city || 'Unknown'}, {load.pickup_location?.state || ''}
                      </p>
                      <p className="text-sm text-slate-500">
                        {load.planned_pickup_datetime ? 
                          new Date(load.planned_pickup_datetime).toLocaleDateString() : 
                          'TBD'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">
                        {load.dropoff_location?.city || 'Unknown'}, {load.dropoff_location?.state || ''}
                      </p>
                      <p className="text-sm text-slate-500">
                        {load.planned_delivery_datetime ? 
                          new Date(load.planned_delivery_datetime).toLocaleDateString() : 
                          'TBD'}
                      </p>
                    </div>
                  </div>
                </div>

                {load.commodity && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Package className="w-4 h-4" />
                    <span>{load.commodity}</span>
                    {load.weight && <span>• {load.weight} lbs</span>}
                  </div>
                )}

                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Truck className="w-4 h-4 mr-2" />
                  Book Load
                </Button>
              </CardContent>
            </Card>
          ))}

          {filteredLoads.length === 0 && (
            <div className="col-span-2">
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No available loads</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}