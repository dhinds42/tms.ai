import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Database,
  Shield,
  Truck,
  Users,
  Code,
  Layers,
  Activity,
  AlertTriangle
} from "lucide-react";

export default function EngineeringRoadmap() {
  const [activePhase, setActivePhase] = useState("current");

  const phases = [
    {
      id: "completed",
      name: "Completed",
      period: "Days 0-90",
      progress: 100,
      color: "emerald"
    },
    {
      id: "current",
      name: "Current Sprint",
      period: "Days 91-120",
      progress: 75,
      color: "indigo"
    },
    {
      id: "next",
      name: "Next Quarter",
      period: "Days 121-180",
      progress: 0,
      color: "purple"
    },
    {
      id: "future",
      name: "Long-term",
      period: "Days 180+",
      progress: 0,
      color: "slate"
    }
  ];

  const roadmapItems = {
    completed: [
      {
        category: "Core Infrastructure",
        icon: Database,
        items: [
          { name: "Entity schema design (50+ entities)", status: "done" },
          { name: "Base44 platform integration", status: "done" },
          { name: "Authentication & authorization", status: "done" },
          { name: "Multi-tenant architecture", status: "done" },
          { name: "API layer setup", status: "done" }
        ]
      },
      {
        category: "Broker Platform (TMS-A)",
        icon: Truck,
        items: [
          { name: "Load board & management", status: "done" },
          { name: "Quote management system", status: "done" },
          { name: "Shipper CRM", status: "done" },
          { name: "Carrier onboarding", status: "done" },
          { name: "Dispatch console", status: "done" },
          { name: "Document management", status: "done" },
          { name: "Accounting (AP/AR)", status: "done" },
          { name: "Invoicing system", status: "done" }
        ]
      },
      {
        category: "Carrier Platform (TMS-B)",
        icon: Users,
        items: [
          { name: "Driver management", status: "done" },
          { name: "Fleet management", status: "done" },
          { name: "Driver portal", status: "done" },
          { name: "Mobile driver interface", status: "done" },
          { name: "Settlement management", status: "done" },
          { name: "Compliance tracking", status: "done" }
        ]
      },
      {
        category: "AI & Automation",
        icon: Zap,
        items: [
          { name: "Document AI extraction", status: "done" },
          { name: "Smart load matching", status: "done" },
          { name: "Route optimizer", status: "done" },
          { name: "Dispatch assistant", status: "done" },
          { name: "Rate negotiator AI", status: "done" }
        ]
      }
    ],
    current: [
      {
        category: "Bidirectional Sync",
        icon: Activity,
        items: [
          { name: "Enhanced sync engine with conflict resolution", status: "done" },
          { name: "Field-level sync configuration", status: "done" },
          { name: "SyncLog audit trail", status: "done" },
          { name: "Sync dashboard UI", status: "done" },
          { name: "Real-time sync status indicators", status: "in_progress" }
        ]
      },
      {
        category: "Workflow Automation",
        icon: Layers,
        items: [
          { name: "Enhanced workflow engine (15+ operators)", status: "done" },
          { name: "8 action types (email, notification, task, etc.)", status: "done" },
          { name: "Template interpolation", status: "done" },
          { name: "Execution tracking", status: "done" },
          { name: "Visual workflow builder", status: "in_progress" }
        ]
      },
      {
        category: "Advanced Analytics",
        icon: Target,
        items: [
          { name: "Advanced filtering system", status: "done" },
          { name: "Date range presets", status: "done" },
          { name: "Multi-field filters with AND/OR logic", status: "done" },
          { name: "Saved filter templates", status: "done" },
          { name: "CSV export functionality", status: "done" },
          { name: "Custom report builder", status: "in_progress" }
        ]
      },
      {
        category: "Documentation",
        icon: Code,
        items: [
          { name: "SRS document", status: "done" },
          { name: "Engineering roadmap", status: "done" },
          { name: "Compliance checklist", status: "done" },
          { name: "API documentation", status: "in_progress" }
        ]
      }
    ],
    next: [
      {
        category: "Backend Functions",
        icon: Database,
        items: [
          { name: "Enable backend functions in Base44", status: "planned" },
          { name: "Custom API endpoints", status: "planned" },
          { name: "Scheduled jobs (cron)", status: "planned" },
          { name: "Webhook handlers", status: "planned" }
        ]
      },
      {
        category: "External Integrations",
        icon: Layers,
        items: [
          { name: "ELD/Telematics API (KeepTruckin, Samsara)", status: "planned" },
          { name: "Load board APIs (DAT, Truckstop)", status: "planned" },
          { name: "Payment processors (TriumphPay, RoadSync)", status: "planned" },
          { name: "QuickBooks live sync", status: "planned" },
          { name: "FMCSA SAFER API integration", status: "planned" }
        ]
      },
      {
        category: "Real-time Features",
        icon: Activity,
        items: [
          { name: "WebSocket implementation", status: "planned" },
          { name: "Live GPS tracking", status: "planned" },
          { name: "Push notifications", status: "planned" },
          { name: "Real-time chat", status: "planned" }
        ]
      },
      {
        category: "Mobile App",
        icon: Users,
        items: [
          { name: "React Native driver app", status: "planned" },
          { name: "Offline mode support", status: "planned" },
          { name: "Camera integration for docs", status: "planned" },
          { name: "GPS background tracking", status: "planned" }
        ]
      }
    ],
    future: [
      {
        category: "Enterprise Features",
        icon: Shield,
        items: [
          { name: "SSO/SAML integration", status: "roadmap" },
          { name: "Advanced RBAC with field-level permissions", status: "roadmap" },
          { name: "White-label capabilities", status: "roadmap" },
          { name: "Multi-region deployment", status: "roadmap" }
        ]
      },
      {
        category: "Advanced AI",
        icon: Zap,
        items: [
          { name: "Predictive demand forecasting", status: "roadmap" },
          { name: "Automated rate optimization", status: "roadmap" },
          { name: "Fraud detection ML model", status: "roadmap" },
          { name: "Voice-controlled dispatch", status: "roadmap" }
        ]
      },
      {
        category: "Compliance Automation",
        icon: Shield,
        items: [
          { name: "FedRAMP certification", status: "roadmap" },
          { name: "SOC 2 Type II audit", status: "roadmap" },
          { name: "ISO 27001 certification", status: "roadmap" },
          { name: "Automated compliance reporting", status: "roadmap" }
        ]
      }
    ]
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "done":
        return <Badge className="bg-emerald-600"><CheckCircle className="w-3 h-3 mr-1" />Done</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-600"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "planned":
        return <Badge className="bg-purple-600"><Target className="w-3 h-3 mr-1" />Planned</Badge>;
      case "roadmap":
        return <Badge className="bg-slate-600"><Calendar className="w-3 h-3 mr-1" />Roadmap</Badge>;
      default:
        return <Badge className="bg-slate-400">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Engineering Roadmap
            </h1>
            <p className="text-slate-600 mt-2">
              TMS.ai Development Timeline & Milestones
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-emerald-600">Q4 2025</Badge>
            <Badge className="bg-indigo-600">Active Development</Badge>
          </div>
        </div>

        {/* Phase Timeline */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {phases.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    activePhase === phase.id
                      ? `border-${phase.color}-600 bg-${phase.color}-50`
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900">{phase.name}</span>
                    <Badge className={`bg-${phase.color}-600`}>{phase.period}</Badge>
                  </div>
                  <Progress value={phase.progress} className="h-2" />
                  <span className="text-xs text-slate-500 mt-1">{phase.progress}% complete</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmapItems[activePhase]?.map((category, idx) => (
            <Card key={idx} className="border-0 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="w-5 h-5 text-indigo-600" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                    >
                      <span className="text-sm text-slate-700">{item.name}</span>
                      {getStatusBadge(item.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dependencies & Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Dependencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge className="bg-orange-600 mt-0.5">Backend</Badge>
                  <span>Backend Functions must be enabled for external API integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="bg-orange-600 mt-0.5">API</Badge>
                  <span>ELD vendor API agreements required for telematics</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="bg-orange-600 mt-0.5">Cert</Badge>
                  <span>SOC 2 audit requires dedicated compliance resources</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl border-l-4 border-l-emerald-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Key Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span><strong>M1:</strong> Core TMS-A/B functionality ✓</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span><strong>M2:</strong> Bidirectional sync engine ✓</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span><strong>M3:</strong> Backend functions integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span><strong>M4:</strong> Mobile app release</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span><strong>M5:</strong> SOC 2 Type II certification</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Team Allocation */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Team Allocation by Module</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { team: "Core Platform", allocation: "30%", focus: "Sync, Workflow, Security" },
                { team: "Broker Features", allocation: "25%", focus: "TMS-A, Quotes, Tendering" },
                { team: "Carrier Features", allocation: "25%", focus: "TMS-B, Fleet, Drivers" },
                { team: "Integrations", allocation: "20%", focus: "APIs, ELD, Accounting" }
              ].map((team, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-bold text-slate-900">{team.team}</h4>
                  <p className="text-2xl font-bold text-indigo-600">{team.allocation}</p>
                  <p className="text-xs text-slate-500">{team.focus}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}