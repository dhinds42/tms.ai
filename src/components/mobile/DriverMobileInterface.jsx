import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Navigation, Camera, CheckCircle, Phone } from "lucide-react";

import AutomatedCheckCalls from "./AutomatedCheckCalls";

export default function DriverMobileInterface() {
  const [demoDriverId] = React.useState('demo_driver_001');
  const [demoLoadId] = React.useState('demo_load_001');
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-cyan-600" />
          Mobile Driver App Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
            <Navigation className="w-8 h-8 text-cyan-600 mb-2" />
            <h4 className="font-semibold text-slate-900 mb-1">Turn-by-Turn Nav</h4>
            <p className="text-xs text-slate-600">Integrated GPS navigation</p>
            <Badge className="mt-2 bg-cyan-600">Active</Badge>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
            <Camera className="w-8 h-8 text-emerald-600 mb-2" />
            <h4 className="font-semibold text-slate-900 mb-1">POD Capture</h4>
            <p className="text-xs text-slate-600">Digital signature & photos</p>
            <Badge className="mt-2 bg-emerald-600">Available</Badge>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <CheckCircle className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-semibold text-slate-900 mb-1">Load Updates</h4>
            <p className="text-xs text-slate-600">Real-time status changes</p>
            <Badge className="mt-2 bg-purple-600">Enabled</Badge>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <Phone className="w-8 h-8 text-amber-600 mb-2" />
            <h4 className="font-semibold text-slate-900 mb-1">In-App Calls</h4>
            <p className="text-xs text-slate-600">Contact dispatch easily</p>
            <Badge className="mt-2 bg-amber-600">Ready</Badge>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <h4 className="font-semibold text-indigo-900 mb-2">Download the App</h4>
          <div className="flex gap-2">
            <Button className="flex-1 bg-black">
              <Smartphone className="w-4 h-4 mr-2" />
              App Store
            </Button>
            <Button className="flex-1 bg-green-600">
              <Smartphone className="w-4 h-4 mr-2" />
              Google Play
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}