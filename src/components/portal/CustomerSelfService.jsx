import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Package, FileText, MessageSquare, DollarSign } from "lucide-react";

export default function CustomerSelfService() {
  const portalFeatures = [
    { name: 'Book Shipments', icon: Package, usage: 145, color: 'blue' },
    { name: 'Track Loads', icon: Package, usage: 289, color: 'emerald' },
    { name: 'View Documents', icon: FileText, usage: 167, color: 'purple' },
    { name: 'Submit Claims', icon: DollarSign, usage: 12, color: 'amber' },
    { name: 'Live Chat', icon: MessageSquare, usage: 78, color: 'cyan' }
  ];

  const recentActivity = [
    { customer: 'ABC Corp', action: 'Booked shipment #12345', time: '15 mins ago' },
    { customer: 'XYZ Inc', action: 'Downloaded POD', time: '1 hour ago' },
    { customer: 'Smith LLC', action: 'Requested quote', time: '2 hours ago' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          Customer Self-Service Portal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-indigo-50 rounded-lg text-center">
            <p className="text-xs text-indigo-900 font-semibold mb-1">Active Users</p>
            <p className="text-4xl font-bold text-indigo-600">142</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg text-center">
            <p className="text-xs text-emerald-900 font-semibold mb-1">Self-Service Rate</p>
            <p className="text-4xl font-bold text-emerald-600">87%</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Portal Usage</h4>
          <div className="space-y-2">
            {portalFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className={`p-3 bg-${feature.color}-50 rounded-lg flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 text-${feature.color}-600`} />
                    <span className="font-semibold text-slate-900">{feature.name}</span>
                  </div>
                  <Badge className={`bg-${feature.color}-600`}>{feature.usage} uses</Badge>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="p-3 bg-white border border-slate-200 rounded">
                <p className="font-semibold text-sm text-slate-900">{activity.customer}</p>
                <p className="text-xs text-slate-600">{activity.action}</p>
                <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📊 Portal Impact</h4>
          <ul className="space-y-1 text-sm text-slate-700">
            <li>• 87% reduction in phone calls</li>
            <li>• 65% faster quote turnaround</li>
            <li>• 92% customer satisfaction rating</li>
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}