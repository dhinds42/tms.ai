import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

export default function SafetyManagement() {
  const { data: safetyIncidents, isLoading } = useQuery({
    queryKey: ['safetyIncidents'],
    queryFn: () => base44.entities.SafetyIncident.list('-created_date', 100),
    initialData: [],
  });

  const totalIncidents = safetyIncidents.length;
  const openIncidents = safetyIncidents.filter(i => i.status === 'open').length;
  const closedIncidents = safetyIncidents.filter(i => i.status === 'closed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-red-900 to-pink-900 bg-clip-text text-transparent">
            Safety Management
          </h1>
          <p className="text-slate-600 mt-2">Safety incident tracking and compliance management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Incidents</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{totalIncidents}</p>
                </div>
                <Shield className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Open</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{openIncidents}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Closed</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{closedIncidents}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-slate-200">
            <CardTitle>Safety Incidents</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-slate-600">Safety incident management and tracking system</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}