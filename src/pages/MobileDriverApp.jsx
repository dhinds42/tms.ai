import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Navigation, Camera, MessageSquare, Clock, CheckCircle } from "lucide-react";

export default function MobileDriverApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent">
            Mobile Driver App
          </h1>
          <p className="text-slate-600 mt-2">React Native mobile app for driver workflow and communication</p>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 to-blue-50 border-l-4 border-l-cyan-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-8 h-8 text-cyan-600" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">📱 Native Mobile Application</h3>
                <p className="text-sm text-slate-600">Available for iOS and Android devices</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-cyan-600">iOS</Badge>
              <Badge className="bg-blue-600">Android</Badge>
              <Badge className="bg-purple-600">React Native</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900">Turn-by-Turn Navigation</h3>
              </div>
              <p className="text-sm text-slate-600">
                Integrated GPS navigation with optimized routing and real-time traffic updates
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900">Document Capture</h3>
              </div>
              <p className="text-sm text-slate-600">
                Scan and upload BOLs, PODs, and inspection reports with OCR technology
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-900">Real-Time Messaging</h3>
              </div>
              <p className="text-sm text-slate-600">
                Direct communication with dispatch and customer support teams
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-900">HOS Integration</h3>
              </div>
              <p className="text-sm text-slate-600">
                Hours of Service tracking and ELD compliance monitoring
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="font-bold text-slate-900">Load Management</h3>
              </div>
              <p className="text-sm text-slate-600">
                View assigned loads, update status, and manage delivery workflows
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-bold text-slate-900">Offline Mode</h3>
              </div>
              <p className="text-sm text-slate-600">
                Continue working without connectivity with automatic sync when online
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Digital Signature Capture</p>
                  <p className="text-sm text-slate-600">Touchscreen signature for POD</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Pre-Trip Inspections</p>
                  <p className="text-sm text-slate-600">Digital DVIR with photo documentation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Fuel Card Integration</p>
                  <p className="text-sm text-slate-600">Track fuel purchases and optimize stops</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Pay Statements</p>
                  <p className="text-sm text-slate-600">View earnings and settlement details</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Push Notifications</p>
                  <p className="text-sm text-slate-600">Load updates and dispatch messages</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Multi-Language Support</p>
                  <p className="text-sm text-slate-600">English, Spanish, and more</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}