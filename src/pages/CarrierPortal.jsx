import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, DollarSign, Package, Clock, CheckCircle, Star, TrendingUp, User } from "lucide-react";
import { PageHeader, StandardTabs } from "@/components/design-system";

import AvailableLoads from "../components/carrier-portal/AvailableLoads";
import MyBookings from "../components/carrier-portal/MyBookings";
import CarrierProfile from "../components/carrier-portal/CarrierProfile";
import PaymentHistory from "../components/carrier-portal/PaymentHistory";
import PerformanceMetrics from "../components/carrier-portal/PerformanceMetrics";

export default function CarrierPortal() {
  const [activeTab, setActiveTab] = useState('available');
  
  const { data: loads, isLoading: loadsLoading } = useScopedEntity('Load', { limit: 100 });
  const { data: carriers, isLoading: carriersLoading } = useScopedEntity('Carrier', { limit: 100 });

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
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Carrier Portal"
        subtitle={`Welcome back, ${currentCarrier?.company_name || 'Carrier'}`}
        icon={Truck}
        badge={
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
            {currentCarrier?.rating && (
              <Badge className="bg-amber-100 text-amber-700">
                <Star className="w-3 h-3 mr-1" />
                {currentCarrier.rating.toFixed(1)}
              </Badge>
            )}
          </div>
        }
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

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
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <StandardTabs
              tabs={[
                { key: 'available', label: 'Available', icon: Truck, badge: availableLoads.length },
                { key: 'bookings', label: 'My Bookings', icon: Package, badge: myBookings.length },
                { key: 'payments', label: 'Payments', icon: DollarSign },
                { key: 'profile', label: 'Profile', icon: User }
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            
            <div className="mt-6">

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
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}