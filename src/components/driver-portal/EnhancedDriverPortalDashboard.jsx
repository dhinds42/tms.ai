import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  DollarSign, 
  FileText, 
  Award, 
  MessageSquare,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

import FeatureEligibilityDashboard from "./FeatureEligibilityDashboard";
import DetentionTimer from "./DetentionTimer";
import AccessorialRequestForm from "./AccessorialRequestForm";
import AccessorialRequestList from "./AccessorialRequestList";
import PayConfidenceWidget from "./PayConfidenceWidget";
import DocumentChecklistWidget from "./DocumentChecklistWidget";
import EscalationForm from "./EscalationForm";
import EscalationList from "./EscalationList";
import MessageTemplateSelector from "./MessageTemplateSelector";
import ProfitExplainDrawer from "./ProfitExplainDrawer";

export default function EnhancedDriverPortalDashboard({ driverId }) {
  const { data: driver } = useQuery({
    queryKey: ['driver', driverId],
    queryFn: async () => {
      const drivers = await base44.entities.Driver.filter({ id: driverId });
      return drivers[0];
    }
  });

  const { data: loads } = useQuery({
    queryKey: ['driverLoads', driverId],
    queryFn: () => base44.entities.Load.filter({ driver_id: driverId }),
    initialData: []
  });

  const { data: eligibility } = useQuery({
    queryKey: ['driverEligibility', driverId],
    queryFn: () => base44.entities.DriverFeatureEligibility.filter({ driver_id: driverId }),
    initialData: []
  });

  const activeLoad = loads.find(l => 
    ['assigned', 'dispatched', 'picked_up', 'in_transit', 'at_pickup', 'at_delivery'].includes(l.status)
  );

  const isFeatureEnabled = (featureKey) => {
    const feature = eligibility.find(e => e.feature_key === featureKey);
    return feature?.eligible || false;
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Performance</p>
                <p className="text-2xl font-bold text-indigo-600">{driver?.performance_score || 0}</p>
              </div>
              <Award className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">On-Time</p>
                <p className="text-2xl font-bold text-green-600">{driver?.on_time_percentage || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Loads</p>
                <p className="text-2xl font-bold text-blue-600">{driver?.total_loads || 0}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Tier</p>
                <Badge className="text-base px-3 py-1">
                  {driver?.performance_tier || 'Training'}
                </Badge>
              </div>
              <Award className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loads">Loads</TabsTrigger>
          <TabsTrigger value="pay">Pay & Earnings</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {activeLoad && (
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle>Active Load</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="font-bold text-lg">#{activeLoad.load_number}</p>
                <p className="text-sm text-slate-600">
                  {activeLoad.pickup_city} → {activeLoad.delivery_city}
                </p>
                <Badge className="mt-2">{activeLoad.status}</Badge>
              </CardContent>
            </Card>
          )}

          <PayConfidenceWidget loadId={activeLoad?.id} />
          <DocumentChecklistWidget loadId={activeLoad?.id} />
        </TabsContent>

        <TabsContent value="loads" className="space-y-4">
          {loads.slice(0, 5).map(load => (
            <Card key={load.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">#{load.load_number || load.id.slice(0, 8)}</p>
                    <p className="text-sm text-slate-600">{load.pickup_city} → {load.delivery_city}</p>
                  </div>
                  <Badge>{load.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pay" className="space-y-4">
          {isFeatureEnabled('profit_explain') && activeLoad && (
            <ProfitExplainDrawer 
              load={activeLoad} 
              laneRate={null} 
              isEligible={true} 
            />
          )}
          
          {isFeatureEnabled('accessorial_requests') && (
            <>
              <AccessorialRequestForm loadId={activeLoad?.id} driverId={driverId} />
              <AccessorialRequestList driverId={driverId} />
            </>
          )}

          {isFeatureEnabled('detention_timer') && activeLoad && (
            <DetentionTimer session={null} onEditSubmit={() => {}} />
          )}
        </TabsContent>

        <TabsContent value="features">
          <FeatureEligibilityDashboard driverId={driverId} />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <MessageTemplateSelector loadId={activeLoad?.id} driverId={driverId} />
          <EscalationForm loadId={activeLoad?.id} driverId={driverId} />
          <EscalationList driverId={driverId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}