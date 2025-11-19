import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Truck, Users, Building } from "lucide-react";

import VehicleLoadManager from "../components/car-transport/VehicleLoadManager";
import DealerManagement from "../components/car-transport/DealerManagement";
import AutoCarrierManagement from "../components/car-transport/AutoCarrierManagement";
import AuctionIntegration from "../components/car-transport/AuctionIntegration";
import VehicleInspectionForm from "../components/car-transport/VehicleInspectionForm";

export default function CarTransportModule() {
  const [activeTab, setActiveTab] = useState('loads');

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list('-created_date', 100),
    initialData: [],
  });

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const autoLoads = loads.filter(l => l.commodity === 'vehicles' || l.load_type === 'auto_transport');
  const inTransit = vehicles.filter(v => v.status === 'in_transit').length;
  const delivered = vehicles.filter(v => v.status === 'delivered').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-orange-900 to-red-900 bg-clip-text text-transparent">
            Car Transport Module
          </h1>
          <p className="text-slate-600 mt-2">
            Auto hauler operations: multi-vehicle loads, VIN tracking, dealer management
          </p>
          <Badge className="mt-3 bg-orange-600">Add-On Module</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Loads</p>
                  <p className="text-3xl font-bold text-orange-600">{autoLoads.length}</p>
                </div>
                <Truck className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Vehicles</p>
                  <p className="text-3xl font-bold text-indigo-600">{vehicles.length}</p>
                </div>
                <Car className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Transit</p>
                  <p className="text-3xl font-bold text-blue-600">{inTransit}</p>
                </div>
                <Truck className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Delivered</p>
                  <p className="text-3xl font-bold text-emerald-600">{delivered}</p>
                </div>
                <Car className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <Button
            onClick={() => setActiveTab('loads')}
            variant={activeTab === 'loads' ? 'default' : 'ghost'}
            className={activeTab === 'loads' ? 'bg-orange-600' : ''}
          >
            🚗 Vehicle Loads
          </Button>
          <Button
            onClick={() => setActiveTab('dealers')}
            variant={activeTab === 'dealers' ? 'default' : 'ghost'}
            className={activeTab === 'dealers' ? 'bg-orange-600' : ''}
          >
            🏢 Dealers
          </Button>
          <Button
            onClick={() => setActiveTab('carriers')}
            variant={activeTab === 'carriers' ? 'default' : 'ghost'}
            className={activeTab === 'carriers' ? 'bg-orange-600' : ''}
          >
            🚛 Auto Carriers
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'loads' && <VehicleLoadManager />}
        {activeTab === 'dealers' && <DealerManagement />}
        {activeTab === 'carriers' && <AutoCarrierManagement />}

      </div>
    </div>
  );
}