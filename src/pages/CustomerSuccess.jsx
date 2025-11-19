import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Heart, AlertTriangle } from "lucide-react";

export default function CustomerSuccess() {
  const { data: shippers } = useQuery({
    queryKey: ['shippers'],
    queryFn: () => base44.entities.Shipper.list(),
    initialData: [],
  });

  const healthyCustomers = Math.floor(shippers.length * 0.7);
  const atRiskCustomers = Math.floor(shippers.length * 0.2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-pink-900 to-rose-900 bg-clip-text text-transparent">
            Customer Success Management
          </h1>
          <p className="text-slate-600 mt-2">Retention tracking, NPS scoring, and growth opportunities</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Customers</p>
                  <p className="text-3xl font-bold text-slate-900">{shippers.length}</p>
                </div>
                <Users className="w-12 h-12 text-slate-900 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Healthy</p>
                  <p className="text-3xl font-bold text-emerald-600">{healthyCustomers}</p>
                </div>
                <Heart className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">At Risk</p>
                  <p className="text-3xl font-bold text-red-600">{atRiskCustomers}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">NPS Score</p>
                  <p className="text-3xl font-bold text-indigo-600">72</p>
                </div>
                <TrendingUp className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>At-Risk Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shippers.slice(0, 3).map(shipper => (
                  <div key={shipper.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-semibold text-red-900">{shipper.company_name}</p>
                      <p className="text-sm text-red-700">Last load: 45 days ago</p>
                    </div>
                    <Badge className="bg-red-600">High Risk</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Upsell Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shippers.slice(3, 6).map(shipper => (
                  <div key={shipper.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div>
                      <p className="font-semibold text-emerald-900">{shipper.company_name}</p>
                      <p className="text-sm text-emerald-700">Growth potential: High</p>
                    </div>
                    <Badge className="bg-emerald-600">+15% potential</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}