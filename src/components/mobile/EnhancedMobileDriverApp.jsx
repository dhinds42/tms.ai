import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Smartphone,
  Navigation,
  Camera,
  MessageSquare,
  Clock,
  Package,
  Shield,
  Zap,
  CheckCircle,
  MapPin,
  FileText,
  Bell,
  DollarSign,
  Settings
} from "lucide-react";

export default function EnhancedMobileDriverApp() {
  const [activeTab, setActiveTab] = useState("features");

  const coreFeatures = [
    {
      icon: Navigation,
      title: "Smart Navigation",
      description: "AI-optimized routes with real-time traffic, truck restrictions, and fuel-efficient paths",
      status: "Live",
      color: "blue"
    },
    {
      icon: Camera,
      title: "Digital POD Capture",
      description: "Instant photo/signature capture with auto-upload and OCR data extraction",
      status: "Live",
      color: "emerald"
    },
    {
      icon: MessageSquare,
      title: "2-Way Messaging",
      description: "Direct communication with dispatch, emergency alerts, and read receipts",
      status: "Live",
      color: "purple"
    },
    {
      icon: Clock,
      title: "HOS Tracking",
      description: "ELD integration, automated HOS calculations, and rest stop recommendations",
      status: "Live",
      color: "amber"
    },
    {
      icon: Package,
      title: "Load Management",
      description: "View assigned loads, update status, manage appointments, and track earnings",
      status: "Live",
      color: "indigo"
    },
    {
      icon: Shield,
      title: "Offline Mode",
      description: "Full functionality without internet, auto-sync when connected",
      status: "Live",
      color: "cyan"
    }
  ];

  const advancedFeatures = [
    {
      icon: FileText,
      title: "Document Scanner",
      description: "Scan receipts, BOLs, scale tickets with AI data extraction",
      badge: "AI"
    },
    {
      icon: Zap,
      title: "Pre-Trip Inspection",
      description: "Digital DVIR with photo evidence and automated reporting",
      badge: "Required"
    },
    {
      icon: DollarSign,
      title: "Earnings Dashboard",
      description: "Real-time pay tracking, load history, and performance bonuses",
      badge: "New"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Push alerts for new loads, check calls, document requests",
      badge: "Live"
    },
    {
      icon: MapPin,
      title: "Truck Stop Finder",
      description: "Find nearby parking, fuel, food with real-time availability",
      badge: "Live"
    },
    {
      icon: Settings,
      title: "Driver Preferences",
      description: "Set home time, preferred lanes, equipment, and availability",
      badge: "New"
    }
  ];

  const screenshots = [
    { title: "Dashboard", description: "Clean overview of active loads and earnings" },
    { title: "Navigation", description: "Turn-by-turn with truck routing" },
    { title: "POD Capture", description: "Quick photo + signature workflow" },
    { title: "Messages", description: "Real-time dispatch communication" }
  ];

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Mobile Driver App</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Native iOS & Android • Built with React Native</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button className="bg-black hover:bg-gray-900">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              App Store
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              Google Play
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">Core Features</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="demo">Screenshots</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {coreFeatures.map((feature, i) => (
              <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 bg-${feature.color}-100 rounded-xl`}>
                      <feature.icon className={`w-5 h-5 text-${feature.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 text-sm">{feature.title}</h3>
                        <Badge className={`bg-${feature.color}-600 text-xs`}>{feature.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {advancedFeatures.map((feature, i) => (
              <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                      <feature.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 text-sm">{feature.title}</h3>
                        <Badge variant="outline" className="text-xs">{feature.badge}</Badge>
                      </div>
                      <p className="text-xs text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="demo" className="space-y-3">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {screenshots.map((screen, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-4 mb-2 h-40 flex items-center justify-center">
                      <Smartphone className="w-16 h-16 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{screen.title}</p>
                    <p className="text-xs text-slate-600">{screen.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tech Stack */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-base">Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Platform</span>
            <span className="text-sm font-semibold text-slate-900">React Native (iOS & Android)</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Offline Support</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Push Notifications</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Background GPS</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Biometric Auth</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}