import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Truck,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  Search,
  Calendar
} from "lucide-react";

export default function FleetManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: tractors, isLoading: tractorsLoading } = useQuery({
    queryKey: ['tractors'],
    queryFn: () => base44.entities.Tractor.list('-created_date', 100),
    initialData: [],
  });

  const { data: trailers, isLoading: trailersLoading } = useQuery({
    queryKey: ['trailers'],
    queryFn: () => base44.entities.Trailer.list('-created_date', 100),
    initialData: [],
  });

  const { data: maintenanceRecords, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['maintenanceRecords'],
    queryFn: () => base44.entities.MaintenanceRecord.list('-created_date', 100),
    initialData: [],
  });

  // Combine tractors and trailers
  const allVehicles = [
    ...tractors.map(t => ({ ...t, type: 'tractor' })),
    ...trailers.map(t => ({ ...t, type: 'trailer' }))
  ];

  // Filter vehicles
  const filteredVehicles = allVehicles.filter(v => {
    const statusMatch = statusFilter === 'all' || v.status === statusFilter;
    const searchMatch = searchTerm === '' ||
      v.unit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.license_plate?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Calculate stats
  const activeVehicles = allVehicles.filter(v => v.status === 'active').length;
  const inMaintenance = allVehicles.filter(v => v.status === 'maintenance').length;
  const outOfService = allVehicles.filter(v => v.status === 'out_of_service').length;
  const upcomingMaintenance = maintenanceRecords.filter(m => {
    const dueDate = new Date(m.due_date);
    const today = new Date();
    const daysUntilDue = (dueDate - today) / (1000 * 60 * 60 * 24);
    return daysUntilDue <= 30 && daysUntilDue > 0;
  }).length;

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-emerald-100 text-emerald-800',
      'maintenance': 'bg-amber-100 text-amber-800',
      'out_of_service': 'bg-red-100 text-red-800',
      'available': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Fleet Management
            </h1>
            <p className="text-slate-600 mt-2">Vehicle lifecycle, registration, titles, and comprehensive fleet tracking</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Active</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{activeVehicles}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">In Maintenance</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{inMaintenance}</p>
                </div>
                <Wrench className="w-12 h-12 text-amber-600 opacity-20" />
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

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Maintenance Due</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{upcomingMaintenance}</p>
                </div>
                <Clock className="w-12 h-12 text-blue-600 opacity-20" />
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
                  placeholder="Search by unit #, VIN, or license plate..."
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
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                  size="sm"
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'maintenance' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('maintenance')}
                  size="sm"
                >
                  Maintenance
                </Button>
                <Button
                  variant={statusFilter === 'out_of_service' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('out_of_service')}
                  size="sm"
                >
                  Out of Service
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader className="border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-blue-600" />
                      {vehicle.unit_number || vehicle.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1 capitalize">{vehicle.type}</p>
                  </div>
                  <Badge className={getStatusColor(vehicle.status)}>{vehicle.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">VIN</span>
                    <span className="font-semibold text-slate-900">{vehicle.vin || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Year/Make/Model</span>
                    <span className="font-semibold text-slate-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">License Plate</span>
                    <span className="font-semibold text-slate-900">{vehicle.license_plate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Mileage</span>
                    <span className="font-semibold text-slate-900">{vehicle.odometer_reading?.toLocaleString() || 0} mi</span>
                  </div>
                  {vehicle.registration_expiry && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Registration Expires</span>
                      <span className="font-semibold text-slate-900">
                        {new Date(vehicle.registration_expiry).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No vehicles found</h3>
              <p className="text-slate-600">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first vehicle to get started'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}