import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Navigation, CheckCircle } from "lucide-react";
import DriverWorkflowAutomation from "../components/drivers/DriverWorkflowAutomation";
import FatigueMonitor from "../components/drivers/FatigueMonitor";
import LaneBuilder from "../components/lane-profitability/LaneBuilder";

export default function DriverWorkflowDashboard() {
  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: []
  });
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">
            Driver Workflow Automation
          </h1>
          <p className="text-slate-600 mt-2">Streamlined onboarding, compliance, and daily operations</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <DriverWorkflowAutomation driver={drivers[0]} />
            <FatigueMonitor drivers={drivers} />
          </div>
          
          <div className="space-y-6">
            <LaneBuilder 
              actorType="driver" 
              actorId={user?.id} 
              onComplete={() => alert('Lane preference saved')}
            />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Automated Workflows Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
                <Badge className="bg-emerald-600 mb-2">ACTIVE</Badge>
                <p className="font-semibold text-sm">Pre-Trip Inspections</p>
                <p className="text-xs text-slate-600">Auto-triggered daily at 6 AM</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                <Badge className="bg-blue-600 mb-2">ACTIVE</Badge>
                <p className="font-semibold text-sm">Load Notifications</p>
                <p className="text-xs text-slate-600">Real-time push to driver app</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <Badge className="bg-purple-600 mb-2">ACTIVE</Badge>
                <p className="font-semibold text-sm">HOS Compliance</p>
                <p className="text-xs text-slate-600">Auto-sync with ELD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}