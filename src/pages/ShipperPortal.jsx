import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, TrendingUp, Clock, CheckCircle } from "lucide-react";

import ShipperLoadForm from "../components/shipper-portal/ShipperLoadForm";
import ShipperLoadsList from "../components/shipper-portal/ShipperLoadsList";
import ShipperDashboard from "../components/shipper-portal/ShipperDashboard";

export default function ShipperPortal() {
  const [showLoadForm, setShowLoadForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const { data: myLoads, isLoading } = useQuery({
    queryKey: ['shipper-loads', currentUser?.email],
    queryFn: () => base44.entities.Load.filter(
      { created_by: currentUser?.email },
      '-created_date',
      100
    ),
    initialData: [],
    enabled: !!currentUser?.email
  });

  const createLoadMutation = useMutation({
    mutationFn: (loadData) => base44.entities.Load.create(loadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipper-loads'] });
      setShowLoadForm(false);
    },
  });

  const handlePostLoad = (loadData) => {
    createLoadMutation.mutate({
      ...loadData,
      shipper_id: currentUser?.id,
      status: 'available',
      mode: 'broker'
    });
  };

  const activeLoads = myLoads.filter(l => 
    ['available', 'tendered', 'assigned', 'dispatched', 'picked_up', 'in_transit'].includes(l.status)
  ).length;

  const completedLoads = myLoads.filter(l => l.status === 'delivered').length;
  const totalSpend = myLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Shipper Portal
            </h1>
            <p className="text-slate-600 mt-2">
              Post loads, track shipments, and manage your freight
            </p>
          </div>
          <Button
            onClick={() => setShowLoadForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Load
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Loads</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{myLoads.length}</p>
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{activeLoads}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{completedLoads}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Spend</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    ${(totalSpend / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard */}
        <ShipperDashboard loads={myLoads} />

        {/* Loads List */}
        <ShipperLoadsList loads={myLoads} isLoading={isLoading} />

        {/* Post Load Form */}
        {showLoadForm && (
          <ShipperLoadForm
            onSubmit={handlePostLoad}
            onClose={() => setShowLoadForm(false)}
            isLoading={createLoadMutation.isPending}
          />
        )}

      </div>
    </div>
  );
}