import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, DollarSign, Package, Clock, CheckCircle, Star, TrendingUp } from "lucide-react";

import AvailableLoads from "../components/carrier-portal/AvailableLoads";
import MyBookings from "../components/carrier-portal/MyBookings";
import CarrierProfile from "../components/carrier-portal/CarrierProfile";
import PaymentHistory from "../components/carrier-portal/PaymentHistory";
import PerformanceMetrics from "../components/carrier-portal/PerformanceMetrics";

export default function CarrierPortal() {
  const [activeTab, setActiveTab] = useState('available');
  
  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers, isLoading: carriersLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  // Simulate current carrier (in production, this would come from auth)
  const currentCarrier = carriers[0];

  const availableLoads = loads.filter(l => l.status === 'available' && l.mode === 'broker');
  const myBookings = loads.filter(l => l.carrier_id === currentCarrier?.id);
  const completedLoads = myBookings.filter(l => l.status === 'delivered');
  
  const totalEarnings = completedLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
  const pendingPayments = myBookings
    .filter(l => l.status === 'delivered' && l.invoice_status !== 'paid')
    .reduce((sum, l) => sum + (l.carrier_pay || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Carrier Portal
            </h1>
            <p className="text-slate-600 mt-2">
              Welcome back, {currentCarrier?.company_name || 'Carrier'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active Carrier
            </Badge>
            {currentCarrier?.rating && (
              <Badge className="bg-amber-100 text-amber-700 border border-amber-300">
                <Star className="w-3 h-3 mr-1" />
                {currentCarrier.rating.toFixed(1)} Rating
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Available Loads</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{availableLoads.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">My Bookings</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{myBookings.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Earnings</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">${(totalEarnings / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Payment</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">${(pendingPayments / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        {currentCarrier && (
          <PerformanceMetrics carrier={currentCarrier} loads={myBookings} />
        )}

        {/* Tabs */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex gap-2 border-b border-slate-200 pb-4 mb-6">
              <Button
                onClick={() => setActiveTab('available')}
                variant={activeTab === 'available' ? 'default' : 'ghost'}
                className={activeTab === 'available' ? 'bg-blue-600' : ''}
              >
                <Truck className="w-4 h-4 mr-2" />
                Available Loads ({availableLoads.length})
              </Button>
              <Button
                onClick={() => setActiveTab('bookings')}
                variant={activeTab === 'bookings' ? 'default' : 'ghost'}
                className={activeTab === 'bookings' ? 'bg-indigo-600' : ''}
              >
                <Package className="w-4 h-4 mr-2" />
                My Bookings ({myBookings.length})
              </Button>
              <Button
                onClick={() => setActiveTab('payments')}
                variant={activeTab === 'payments' ? 'default' : 'ghost'}
                className={activeTab === 'payments' ? 'bg-emerald-600' : ''}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Payments
              </Button>
              <Button
                onClick={() => setActiveTab('profile')}
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                className={activeTab === 'profile' ? 'bg-purple-600' : ''}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>

            {/* Tab Content */}
            {activeTab === 'available' && (
              <AvailableLoads loads={availableLoads} carrierId={currentCarrier?.id} />
            )}
            {activeTab === 'bookings' && (
              <MyBookings loads={myBookings} />
            )}
            {activeTab === 'payments' && (
              <PaymentHistory loads={completedLoads} />
            )}
            {activeTab === 'profile' && currentCarrier && (
              <CarrierProfile carrier={currentCarrier} />
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}