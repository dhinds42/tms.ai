import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Truck,
  Users,
  FileText,
  Shield,
  DollarSign,
  Mail,
  Radio,
  Search,
  Navigation,
  PieChart,
  UserPlus,
  Wrench,
  TrendingUp,
  Fuel,
  BarChart3,
  MessageSquare,
  Brain,
  Package,
  Zap,
  Award,
  FileEdit,
  CreditCard
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [operatingMode, setOperatingMode] = useState(
    localStorage.getItem('tms_operating_mode') || 'broker'
  );

  const handleModeToggle = () => {
    const newMode = operatingMode === 'carrier' ? 'broker' : 'carrier';
    setOperatingMode(newMode);
    localStorage.setItem('tms_operating_mode', newMode);
    window.location.reload();
  };

  const navigationItems = [
    {
      title: "Dashboard",
      url: createPageUrl("Dashboard"),
      icon: LayoutDashboard,
      badge: null
    },
    {
      title: "Advanced Analytics",
      url: createPageUrl("AdvancedAnalytics"),
      icon: BarChart3,
      badge: <Badge className="ml-auto bg-purple-500">NEW</Badge>
    },
    {
      title: "Load Board",
      url: createPageUrl("LoadBoard"),
      icon: Truck,
      badge: null
    },
    {
      title: "Carrier Portal",
      url: createPageUrl("CarrierPortal"),
      icon: Users,
      badge: <Badge className="ml-auto bg-blue-500">Portal</Badge>
    },
    {
      title: "Shipper Portal",
      url: createPageUrl("ShipperPortal"),
      icon: Package,
      badge: <Badge className="ml-auto bg-cyan-500">Portal</Badge>
    },
    ...(operatingMode === 'broker' ? [{
      title: "Quote Management",
      url: createPageUrl("QuoteManagement"),
      icon: FileEdit,
      badge: null
    }] : []),
    {
      title: operatingMode === 'broker' ? "Carriers" : "Drivers",
      url: operatingMode === 'broker' ? createPageUrl("Carriers") : createPageUrl("Drivers"),
      icon: Users,
      badge: null
    },
    {
      title: "Carrier Scoring",
      url: createPageUrl("CarrierScoring"),
      icon: Award,
      badge: <Badge className="ml-auto bg-yellow-500">AI</Badge>
    },
    ...(operatingMode === 'carrier' ? [
      {
        title: "Driver Performance",
        url: createPageUrl("DriverPerformance"),
        icon: TrendingUp,
        badge: null
      },
      {
        title: "Payroll Management",
        url: createPageUrl("PayrollManagement"),
        icon: DollarSign,
        badge: null
      },
      {
        title: "Fuel Management",
        url: createPageUrl("FuelManagement"),
        icon: Fuel,
        badge: null
      },
      {
        title: "Backhaul Optimizer",
        url: createPageUrl("BackhaulOptimizer"),
        icon: Navigation,
        badge: <Badge className="ml-auto bg-cyan-500">AI</Badge>
      }
    ] : []),
    {
      title: "Route Optimizer",
      url: createPageUrl("RouteOptimizer"),
      icon: Navigation,
      badge: <Badge className="ml-auto bg-orange-500">AI</Badge>
    },
    {
      title: "Shippers",
      url: createPageUrl("Shippers"),
      icon: Users,
      badge: <Badge className="ml-auto bg-indigo-500">CRM</Badge>
    },
    {
      title: "Accounting Integration",
      url: createPageUrl("AccountingIntegration"),
      icon: CreditCard,
      badge: <Badge className="ml-auto bg-emerald-500">NEW</Badge>
    },
    {
      title: "Documents",
      url: createPageUrl("Documents"),
      icon: FileText,
      badge: null
    },
    {
      title: "Document AI",
      url: createPageUrl("DocumentAI"),
      icon: Brain,
      badge: <Badge className="ml-auto bg-purple-500">AI</Badge>
    },
    {
      title: "Document Processor",
      url: createPageUrl("DocumentProcessor"),
      icon: Brain,
      badge: <Badge className="ml-auto bg-purple-500">AI</Badge>
    },
    {
      title: "Compliance",
      url: createPageUrl("Compliance"),
      icon: Shield,
      badge: null
    },
    ...(operatingMode === 'broker' ? [{
      title: "Carrier Compliance",
      url: createPageUrl("CarrierCompliance"),
      icon: Shield,
      badge: <Badge className="ml-auto bg-emerald-500">AI</Badge>
    }] : []),
    {
      title: "Invoicing",
      url: createPageUrl("Invoicing"),
      icon: DollarSign,
      badge: null
    },
    {
      title: "Contract Assistant",
      url: createPageUrl("ContractAssistant"),
      icon: FileText,
      badge: <Badge className="ml-auto bg-indigo-500">AI</Badge>
    },
    {
      title: "Predictive Analytics",
      url: createPageUrl("PredictiveAnalytics"),
      icon: BarChart3,
      badge: <Badge className="ml-auto bg-blue-500">AI</Badge>
    },
    {
      title: "Dispatch Assistant",
      url: createPageUrl("DispatchAssistant"),
      icon: Zap,
      badge: <Badge className="ml-auto bg-purple-500">AI</Badge>
    },
    {
      title: "Market Rate Feed",
      url: createPageUrl("MarketRateFeed"),
      icon: TrendingUp,
      badge: <Badge className="ml-auto bg-emerald-500">LIVE</Badge>
    },
    {
      title: "Performance Score",
      url: createPageUrl("CarrierPerformanceScore"),
      icon: Award,
      badge: null
    },
    {
      title: "Rate Negotiator",
      url: createPageUrl("RateNegotiator"),
      icon: MessageSquare,
      badge: <Badge className="ml-auto bg-purple-500">AI</Badge>
    },
    {
      title: "AI Email Parser",
      url: createPageUrl("EmailParser"),
      icon: Mail,
      badge: <Badge className="ml-auto bg-purple-500">AI</Badge>
    },
    ...(operatingMode === 'broker' ? [
      {
        title: "Scout Agent",
        url: createPageUrl("ScoutAgent"),
        icon: Search,
        badge: <Badge className="ml-auto bg-emerald-500">AI</Badge>
      },
      {
        title: "TenderBot",
        url: createPageUrl("TenderBot"),
        icon: Radio,
        badge: <Badge className="ml-auto bg-indigo-500">AI</Badge>
      },
      {
        title: "Carrier Onboarding",
        url: createPageUrl("CarrierOnboarding"),
        icon: UserPlus,
        badge: <Badge className="ml-auto bg-purple-500">AI</Badge>
      }
    ] : []),
    {
      title: "Rosie (Tracking)",
      url: createPageUrl("Rosie"),
      icon: BarChart3,
      badge: <Badge className="ml-auto bg-cyan-500">AI</Badge>
    },
    {
      title: "Maintenance Alerts",
      url: createPageUrl("MaintenanceAlerts"),
      icon: Wrench,
      badge: <Badge className="ml-auto bg-orange-500">AI</Badge>
    },
    {
      title: "FinanceBot",
      url: createPageUrl("FinanceBot"),
      icon: PieChart,
      badge: <Badge className="ml-auto bg-green-500">AI</Badge>
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">TMS.ai</h2>
                <p className="text-xs text-slate-500">AI-Native Logistics</p>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="mt-6 p-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Operating Mode</span>
              </div>
              <Button
                onClick={handleModeToggle}
                className={`w-full justify-start gap-2 transition-all duration-300 ${
                  operatingMode === 'carrier'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span className="font-semibold capitalize">{operatingMode}</span>
              </Button>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`transition-all duration-200 rounded-lg mb-1 ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm'
                              : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                            <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : ''}`} />
                            <span className="font-medium">{item.title}</span>
                            {item.badge}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-slate-900">TMS.ai</h1>
              </div>
              <Badge className={operatingMode === 'carrier' ? 'bg-blue-600' : 'bg-indigo-600'}>
                {operatingMode}
              </Badge>
            </div>
          </header>

          {/* Main content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}