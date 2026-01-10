import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Navigation
} from "lucide-react";
import { PageHeader, EmptyState, SkeletonCard } from "@/components/design-system";

export default function EquipmentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: equipment, isLoading } = useScopedEntity('Equipment', { limit: 100 });
  const { data: trailers, isLoading: trailersLoading } = useScopedEntity('Trailer', { limit: 100 });

  // Filter equipment
  const filteredEquipment = [...equipment, ...trailers].filter(e => {
    const statusMatch = statusFilter === 'all' || e.status === statusFilter;
    const searchMatch = searchTerm === '' ||
      e.unit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.equipment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Calculate stats
  const available = filteredEquipment.filter(e => e.status === 'available').length;
  const inUse = filteredEquipment.filter(e => e.status === 'in_use' || e.status === 'assigned').length;
  const maintenance = filteredEquipment.filter(e => e.status === 'maintenance').length;
  const outOfService = filteredEquipment.filter(e => e.status === 'out_of_service').length;

  const getStatusColor = (status) => {
    const colors = {
      'available': 'bg-emerald-100 text-emerald-800',
      'in_use': 'bg-blue-100 text-blue-800',
      'assigned': 'bg-indigo-100 text-indigo-800',
      'maintenance': 'bg-amber-100 text-amber-800',
      'out_of_service': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getEquipmentIcon = (type) => {
    if (type?.includes('trailer')) return Truck;
    if (type?.includes('container')) return Package;
    return Package;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Equipment Management"
        subtitle={`Trailer and equipment tracking • ${[...equipment, ...trailers].length} total units`}
        icon={Package}
        primaryAction={{
          label: 'Add Equipment',
          icon: Plus,
          onClick: () => alert('Add Equipment modal coming soon')
        }}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Available</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{available}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">In Use</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{inUse}</p>
                </div>
                <Truck className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Maintenance</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{maintenance}</p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Out of Service</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{outOfService}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by unit #, type, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'available' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('available')}
                  size="sm"
                >
                  Available
                </Button>
                <Button
                  variant={statusFilter === 'in_use' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('in_use')}
                  size="sm"
                >
                  In Use
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Grid */}
        {isLoading || trailersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredEquipment.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No equipment found"
            description={searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first equipment to get started'}
            action={!searchTerm && statusFilter === 'all' && {
              label: 'Add Equipment',
              icon: Plus,
              onClick: () => alert('Add Equipment modal coming soon')
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => {
            const Icon = getEquipmentIcon(item.equipment_type || item.trailer_type);
            return (
              <Card key={item.id} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                <CardHeader className="border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-indigo-600" />
                        {item.unit_number || item.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1 capitalize">
                        {item.equipment_type || item.trailer_type || 'Equipment'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3 text-sm">
                    {item.current_location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-900">{item.current_location}</span>
                      </div>
                    )}
                    {item.assigned_to && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Assigned To</span>
                        <span className="font-semibold text-slate-900">{item.assigned_to}</span>
                      </div>
                    )}
                    {item.capacity_lbs && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Capacity</span>
                        <span className="font-semibold text-slate-900">{item.capacity_lbs.toLocaleString()} lbs</span>
                      </div>
                    )}
                    {item.length_ft && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Length</span>
                        <span className="font-semibold text-slate-900">{item.length_ft} ft</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    {item.status === 'available' && (
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600">
                        <Navigation className="w-3 h-3 mr-2" />
                        Assign
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}