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
  Radio,
  Navigation,
  PieChart,
  BarChart3,
  Brain,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronRight,
  Zap,
  Package,
  CreditCard,
  Wrench,
  Activity,
  Search,
  TrendingUp,
  Mail,
  FileEdit,
  Webhook,
  AlertTriangle,
  Award,
  MessageSquare,
  UserPlus,
  Layers,
  MapPin,
  Fuel,
  Clock,
  Calendar,
  Building,
  ArrowLeftRight,
  Scale
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
  
  // Collapsible section states
  const [expandedSections, setExpandedSections] = useState({
    operations: true,
    analytics: false,
    aiTools: false,
    customers: false,
    appointments: false,
    financial: false,
    documents: false,
    tools: false,
    settings: false,
    maintenance: false
  });

  const handleModeToggle = () => {
    const newMode = operatingMode === 'carrier' ? 'broker' : 'carrier';
    setOperatingMode(newMode);
    localStorage.setItem('tms_operating_mode', newMode);
    window.location.reload();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Navigation structure
  const navigationSections = [
    {
      id: 'core',
      label: null,
      collapsible: false,
      items: [
        {
          title: "Dashboard",
          url: createPageUrl("Dashboard"),
          icon: LayoutDashboard,
          badge: null,
          roles: ['broker', 'carrier']
        }
      ]
    },
    {
      id: 'operations',
      label: "Operations",
      collapsible: true,
      items: [
        {
          title: "Load Board",
          url: createPageUrl("LoadBoard"),
          icon: Truck,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Trip Planner",
          url: createPageUrl("TripPlanner"),
          icon: Navigation,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">NEW</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Real-Time Tracking",
          url: createPageUrl("RealtimeTracking"),
          icon: Activity,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">LIVE</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Quote Management",
          url: createPageUrl("QuoteManagement"),
          icon: FileEdit,
          badge: <Badge className="ml-auto bg-cyan-500 text-xs">SPOT</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Load Templates",
          url: createPageUrl("LoadTemplates"),
          icon: Layers,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Universal Search",
          url: createPageUrl("UniversalSearch"),
          icon: Search,
          badge: <Badge className="ml-auto bg-blue-500 text-xs">TMSCVQ</Badge>,
          roles: ['broker', 'carrier']
        }
      ]
    },
    {
      id: 'appointments',
      label: "Appointment Management",
      collapsible: true,
      carrierOnly: true,
      items: [
        {
          title: "Appointment Booking",
          url: createPageUrl("AppointmentBooking"),
          icon: Calendar,
          badge: <Badge className="ml-auto bg-cyan-500 text-xs">UNIFIED</Badge>,
          roles: ['carrier']
        },
        {
          title: "Appointments Book",
          url: createPageUrl("AppointmentsBook"),
          icon: Clock,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">CALENDAR</Badge>,
          roles: ['carrier']
        }
      ]
    },
    {
      id: 'analytics',
      label: "Analytics & Insights",
      collapsible: true,
      items: [
        {
          title: "Analytics Dashboard",
          url: createPageUrl("AnalyticsDashboard"),
          icon: BarChart3,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Advanced Analytics",
          url: createPageUrl("AdvancedAnalytics"),
          icon: PieChart,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Predictive Analytics",
          url: createPageUrl("PredictiveAnalytics"),
          icon: TrendingUp,
          badge: <Badge className="ml-auto bg-blue-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Market Rate Feed",
          url: createPageUrl("MarketRateFeed"),
          icon: TrendingUp,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">LIVE</Badge>,
          roles: ['broker']
        },
        {
          title: "Performance Score",
          url: createPageUrl("CarrierPerformanceScore"),
          icon: Award,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Reports",
          url: createPageUrl("Reports"),
          icon: FileText,
          badge: null,
          roles: ['broker', 'carrier']
        }
      ]
    },
    {
      id: 'aiTools',
      label: "AI Assistant Suite",
      collapsible: true,
      items: [
        {
          title: "Dispatch Assistant",
          url: createPageUrl("DispatchAssistant"),
          icon: Zap,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Route Optimizer",
          url: createPageUrl("RouteOptimizer"),
          icon: Navigation,
          badge: <Badge className="ml-auto bg-orange-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Backhaul Optimizer",
          url: createPageUrl("BackhaulOptimizer"),
          icon: ArrowLeftRight,
          badge: <Badge className="ml-auto bg-cyan-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Rate Negotiator",
          url: createPageUrl("RateNegotiator"),
          icon: MessageSquare,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">AI</Badge>,
          roles: ['broker']
        },
        {
          title: "Scout Agent",
          url: createPageUrl("ScoutAgent"),
          icon: Search,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">AI</Badge>,
          roles: ['broker']
        },
        {
          title: "TenderBot",
          url: createPageUrl("TenderBot"),
          icon: Radio,
          badge: <Badge className="ml-auto bg-indigo-500 text-xs">AI</Badge>,
          roles: ['broker']
        },
        {
          title: "Carrier Scoring",
          url: createPageUrl("CarrierScoring"),
          icon: Award,
          badge: <Badge className="ml-auto bg-yellow-500 text-xs">AI</Badge>,
          roles: ['broker']
        },
        {
          title: "Document AI",
          url: createPageUrl("DocumentAI"),
          icon: Brain,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "AI Email Parser",
          url: createPageUrl("EmailParser"),
          icon: Mail,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Contract Assistant",
          url: createPageUrl("ContractAssistant"),
          icon: FileText,
          badge: <Badge className="ml-auto bg-indigo-500 text-xs">AI</Badge>,
          roles: ['broker']
        },
        {
          title: "FinanceBot",
          url: createPageUrl("FinanceBot"),
          icon: DollarSign,
          badge: <Badge className="ml-auto bg-green-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Rosie Tracking",
          url: createPageUrl("Rosie"),
          icon: Activity,
          badge: <Badge className="ml-auto bg-cyan-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        }
      ]
    },
    {
      id: 'customers',
      label: "Customer Management",
      collapsible: true,
      items: [
        // Broker: Manages carriers as vendors
        // Carrier: Manages drivers and owner operators as resources
        {
          title: operatingMode === 'broker' ? "Carriers" : "Drivers",
          url: operatingMode === 'broker' ? createPageUrl("Carriers") : createPageUrl("Drivers"),
          icon: Users,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Owner Operators",
          url: createPageUrl("OwnerOperators"),
          icon: Truck,
          badge: null,
          roles: ['carrier']
        },
        // Both broker and carrier can have shippers/customers
        {
          title: operatingMode === 'broker' ? "Shippers (CRM)" : "Customers (CRM)",
          url: createPageUrl(operatingMode === 'broker' ? "Shippers" : "CustomerManagement"),
          icon: Package,
          badge: <Badge className="ml-auto bg-indigo-500 text-xs">CRM</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Carrier Portal",
          url: createPageUrl("CarrierPortal"),
          icon: Truck,
          badge: <Badge className="ml-auto bg-blue-500 text-xs">Portal</Badge>,
          roles: ['broker']
        },
        {
          title: "Driver Portal",
          url: createPageUrl("DriverPortal"),
          icon: Users,
          badge: <Badge className="ml-auto bg-cyan-500 text-xs">Portal</Badge>,
          roles: ['carrier']
        },
        {
          title: "Owner Operator Portal",
          url: createPageUrl("OwnerOperatorPortal"),
          icon: Truck,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">Portal</Badge>,
          roles: ['carrier']
        },
        {
          title: "Shipper Portal",
          url: createPageUrl("ShipperPortal"),
          icon: Package,
          badge: <Badge className="ml-auto bg-cyan-500 text-xs">Portal</Badge>,
          roles: ['broker']
        },
        {
          title: "Customer Portal",
          url: createPageUrl("ShipperPortal"),
          icon: Building,
          badge: <Badge className="ml-auto bg-cyan-500 text-xs">Portal</Badge>,
          roles: ['carrier']
        },
        {
          title: "Carrier Onboarding",
          url: createPageUrl("CarrierOnboarding"),
          icon: UserPlus,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">AI</Badge>,
          roles: ['broker']
        },
        {
          title: "Driver Onboarding",
          url: createPageUrl("DriverOnboarding"),
          icon: UserPlus,
          badge: <Badge className="ml-auto bg-blue-500 text-xs">NEW</Badge>,
          roles: ['carrier']
        },
        {
          title: "Owner Op Onboarding",
          url: createPageUrl("OwnerOperatorOnboarding"),
          icon: UserPlus,
          badge: <Badge className="ml-auto bg-indigo-500 text-xs">NEW</Badge>,
          roles: ['carrier']
        },
        {
          title: "Carrier Compliance",
          url: createPageUrl("CarrierCompliance"),
          icon: Shield,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">AI</Badge>,
          roles: ['broker']
        },
        {
          title: "Driver Compliance",
          url: createPageUrl("DriverCompliance"),
          icon: Shield,
          badge: <Badge className="ml-auto bg-blue-500 text-xs">NEW</Badge>,
          roles: ['carrier']
        },
        {
          title: "Owner Op Compliance",
          url: createPageUrl("OwnerOperatorCompliance"),
          icon: Shield,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">NEW</Badge>,
          roles: ['carrier']
        }
      ]
    },
    {
      id: 'financial',
      label: "Financial Management",
      collapsible: true,
      items: [
        {
          title: "Accounting",
          url: createPageUrl("Accounting"),
          icon: CreditCard,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Invoicing",
          url: createPageUrl("Invoicing"),
          icon: DollarSign,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Accounting Integration",
          url: createPageUrl("AccountingIntegration"),
          icon: CreditCard,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">NEW</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Payroll Management",
          url: createPageUrl("PayrollManagement"),
          icon: DollarSign,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Tariff Management",
          url: createPageUrl("Tariffs"),
          icon: DollarSign,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Tariff Wizard",
          url: createPageUrl("TariffWizard"),
          icon: TrendingUp,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">NEW</Badge>,
          roles: ['broker']
        },
        {
          title: "Accessorials",
          url: createPageUrl("Accessorials"),
          icon: SettingsIcon,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Freight Rate Estimator",
          url: createPageUrl("FreightRateEstimator"),
          icon: DollarSign,
          badge: <Badge className="ml-auto bg-blue-500 text-xs">Intl</Badge>,
          roles: ['broker']
        },
        {
          title: "LTL Management",
          url: createPageUrl("LTLManagement"),
          icon: Package,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">LTL</Badge>,
          roles: ['broker', 'carrier']
        }
      ]
    },
    {
      id: 'documents',
      label: "Documents & Compliance",
      collapsible: true,
      items: [
        {
          title: "Documents",
          url: createPageUrl("Documents"),
          icon: FileText,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Document Processor",
          url: createPageUrl("DocumentProcessor"),
          icon: Brain,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "AI Doc Verification",
          url: createPageUrl("AIDocumentVerification"),
          icon: Shield,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Compliance",
          url: createPageUrl("Compliance"),
          icon: Shield,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Claims & Insurance",
          url: createPageUrl("ClaimsInsurance"),
          icon: Scale,
          badge: null,
          roles: ['broker', 'carrier']
        }
      ]
    },
    {
      id: 'maintenance',
      label: "Maintenance & Assets",
      collapsible: true,
      carrierOnly: true,
      items: [
        {
          title: "Maintenance Tracking",
          url: createPageUrl("MaintenanceTracking"),
          icon: Wrench,
          badge: <Badge className="ml-auto bg-orange-500 text-xs">NEW</Badge>,
          roles: ['carrier']
        },
        {
          title: "Asset Management",
          url: createPageUrl("AssetManagement"),
          icon: CreditCard,
          badge: <Badge className="ml-auto bg-cyan-500 text-xs">NEW</Badge>,
          roles: ['carrier']
        },
        {
          title: "Maintenance Alerts",
          url: createPageUrl("MaintenanceAlerts"),
          icon: AlertTriangle,
          badge: <Badge className="ml-auto bg-orange-500 text-xs">AI</Badge>,
          roles: ['carrier']
        },
        {
          title: "Fuel Management",
          url: createPageUrl("FuelManagement"),
          icon: Fuel,
          badge: null,
          roles: ['carrier']
        }
      ]
    },
    {
      id: 'opendock',
      label: "Opendock Integration",
      collapsible: true,
      carrierOnly: true,
      items: [
        {
          title: "Opendock Configuration",
          url: createPageUrl("OpendockIntegration"),
          icon: Radio,
          badge: <Badge className="ml-auto bg-indigo-500 text-xs">CONFIG</Badge>,
          roles: ['carrier']
        },
        {
          title: "Opendock Load Board",
          url: createPageUrl("OpendockLoadBrowser"),
          icon: Truck,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">LIVE</Badge>,
          roles: ['carrier']
        }
      ]
    },
    {
      id: 'tools',
      label: "Tools & Utilities",
      collapsible: true,
      items: [
        {
          title: "Integrations Hub",
          url: createPageUrl("Integrations"),
          icon: Layers,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">HUB</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "USPS Address Validation",
          url: createPageUrl("USPSAddressValidation"),
          icon: MapPin,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">NEW</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Shipment Consolidation",
          url: createPageUrl("ShipmentConsolidation"),
          icon: Layers,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">NEW</Badge>,
          roles: ['broker']
        },
        {
          title: "Saved Searches",
          url: createPageUrl("SavedSearches"),
          icon: Search,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Company Loadboard",
          url: createPageUrl("CompanyLoadboard"),
          icon: Truck,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "AI Route Cost Analysis",
          url: createPageUrl("AIRouteCostAnalysis"),
          icon: DollarSign,
          badge: <Badge className="ml-auto bg-blue-500 text-xs">AI</Badge>,
          roles: ['broker']
        },
        {
          title: "AI Carrier Risk",
          url: createPageUrl("AICarrierRisk"),
          icon: AlertTriangle,
          badge: <Badge className="ml-auto bg-red-500 text-xs">AI</Badge>,
          roles: ['broker']
        }
      ]
    },
    {
      id: 'settings',
      label: "Settings & Admin",
      collapsible: true,
      items: [
        {
          title: "Settings",
          url: createPageUrl("Settings"),
          icon: SettingsIcon,
          badge: <Badge className="ml-auto bg-slate-500 text-xs">API</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "User Roles",
          url: createPageUrl("UserRoles"),
          icon: Shield,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Webhook Integrations",
          url: createPageUrl("WebhookIntegrations"),
          icon: Webhook,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">API</Badge>,
          roles: ['broker', 'carrier']
        }
      ]
    }
  ];

  // Filter sections based on operating mode
  const filteredSections = navigationSections
    .filter(section => {
      if (section.carrierOnly && operatingMode === 'broker') return false;
      return true;
    })
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(operatingMode))
    }))
    .filter(section => section.items.length > 0);

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

          <SidebarContent className="p-3 overflow-y-auto">
            {filteredSections.map((section) => (
              <SidebarGroup key={section.id}>
                {section.label && section.collapsible ? (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors mb-2"
                  >
                    <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {section.label}
                    </SidebarGroupLabel>
                    {expandedSections[section.id] ? (
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                ) : section.label ? (
                  <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                    {section.label}
                  </SidebarGroupLabel>
                ) : null}
                
                {(!section.collapsible || expandedSections[section.id]) && (
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => {
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
                                <span className="font-medium text-sm">{item.title}</span>
                                {item.badge}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            ))}
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