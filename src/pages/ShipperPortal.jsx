import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Plus, TrendingUp, Clock, CheckCircle, FileText } from "lucide-react";
import { PageHeader, StandardTabs } from "@/components/design-system";

import ShipperLoadForm from "../components/shipper-portal/ShipperLoadForm";
import ShipperLoadsList from "../components/shipper-portal/ShipperLoadsList";
import ShipperDashboard from "../components/shipper-portal/ShipperDashboard";
import ShipperInvoices from "../components/shipper-portal/ShipperInvoices";

export default function ShipperPortal() {
  const [activeTab, setActiveTab] = useState('loads');
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
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Shipper Portal"
        subtitle="Post loads, track shipments, and manage freight"
        icon={Package}
        primaryAction={{
          label: 'Post Load',
          icon: Plus,
          onClick: () => setShowLoadForm(true)
        }}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

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

        {/* Navigation Tabs */}
        <StandardTabs
          tabs={[
            { key: 'loads', label: 'Loads', icon: Package },
            { key: 'invoices', label: 'Invoices', icon: FileText }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden">
          <TabsList className="hidden"></TabsList>
        </Tabs>

        {/* Content */}
        {activeTab === 'loads' ? (
          <>
            <ShipperDashboard loads={myLoads} />
            <ShipperLoadsList loads={myLoads} isLoading={isLoading} />
          </>
        ) : (
          <ShipperInvoices userEmail={currentUser?.email} />
        )}

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