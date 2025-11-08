
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
  Menu,
  X,
  Radio,
  Search,
  Navigation,
  PieChart,
  UserPlus, // Added import
  Wrench    // Added import
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
      title: "Load Board",
      url: createPageUrl("LoadBoard"),
      icon: Truck,
      badge: null
    },
    {
      title: operatingMode === 'broker' ? "Carriers" : "Drivers",
      url: operatingMode === 'broker' ? createPageUrl("Carriers") : createPageUrl("Drivers"),
      icon: Users,
      badge: null
    },
    {
      title: "Shippers",
      url: createPageUrl("Shippers"),
      icon: Users,
      badge: null
    },
    {
      title: "Documents",
      url: createPageUrl("Documents"),
      icon: FileText,
      badge: null
    },
    {
      title: "Compliance",
      url: createPageUrl("Compliance"),
      icon: Shield,
      badge: null
    },
    {
      title: "Invoicing",
      url: createPageUrl("Invoicing"),
      icon: DollarSign,
      badge: null
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
      }
    ] : []),
    {
      title: "Rosie (Tracking)",
      url: createPageUrl("Rosie"),
      icon: Navigation,
      badge: <Badge className="ml-auto bg-cyan-500">AI</Badge>
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
