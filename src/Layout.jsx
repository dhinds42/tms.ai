import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import BidirectionalSyncEngine from "@/components/sync/BidirectionalSyncEngine";
import EnhancedWorkflowEngine from "@/components/workflow/EnhancedWorkflowEngine";
import LiveUpdates from "@/components/realtime/LiveUpdates";
import NotificationCenter, { useNotificationBadge } from "@/components/notifications/NotificationCenter";
import ErrorAlertSystem from "@/components/alerts/ErrorAlertSystem";
import ErrorBoundary from "@/components/providers/ErrorBoundary";
import { OperatingModeProvider, useOperatingMode } from "@/components/providers/OperatingModeContext";
import DriverPerformanceMetrics from "@/components/drivers/DriverPerformanceMetrics";
import { ToastProvider } from "@/components/design-system";
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
  BarChart2,
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
  Scale,
  Database,
  Terminal,
  Rocket,
  Thermometer,
  Network,
  Leaf,
  Smartphone,
  Globe,
  FileSpreadsheet,
  Car,
  Bell,
  Sparkles
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

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const { operatingMode, setOperatingMode } = useOperatingMode();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = useNotificationBadge();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
    enabled: operatingMode === 'carrier',
  });

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
    enabled: operatingMode === 'carrier',
  });

  const { data: complianceItems } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.ComplianceItem.list('-created_date', 100),
    initialData: [],
    enabled: operatingMode === 'carrier',
  });
  
  // Collapsible section states
  const [expandedSections, setExpandedSections] = useState({
    operations: true,
    analytics: false,
    aiTools: false,
    hr: false,
    customers: false,
    appointments: false,
    financial: false,
    documents: false,
    tools: false,
    systemDesign: false,
    settings: false,
    maintenance: false,
    execution: false,
    specialized: false,
    network: false,
    sustainability: false,
    safety: false,
    mobile: false,
    detention: false
  });

  const handleModeToggle = () => {
    const newMode = operatingMode === 'carrier' ? 'broker' : 'carrier';
    setOperatingMode(newMode);

    // P0 FRONTEND FIX F-4: Clear cache on mode switch to prevent stale data
    queryClient.invalidateQueries();
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
          url: createPageUrl(operatingMode === 'carrier' && user?.role !== 'admin' ? "TMSBDashboard" : "Dashboard"),
          icon: LayoutDashboard,
          badge: null,
          roles: ['broker', 'carrier']
        }
      ]
    },
    {
      id: 'operations',
      label: "Operations & Dispatch",
      collapsible: true,
      items: [
        {
          title: "Dispatch Console",
          url: createPageUrl("DispatchConsole"),
          icon: Radio,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">LIVE</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Dispatch Optimization AI",
          url: createPageUrl("DispatchOptimizationAI"),
          icon: Zap,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Smart Load Matching",
          url: createPageUrl("SmartLoadMatching"),
          icon: Zap,
          badge: <Badge className="ml-auto bg-indigo-500 text-xs">AI</Badge>,
          roles: ['broker']
        },
        {
          title: "Load Board",
          url: createPageUrl("LoadBoard"),
          icon: Truck,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Load Tendering",
          url: createPageUrl("LoadTendering"),
          icon: Radio,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">NEW</Badge>,
          roles: ['broker']
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
          title: "Instant Quote Engine",
          url: createPageUrl("InstantQuoteEngine"),
          icon: Zap,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">⚡ AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Rate Shopping",
          url: createPageUrl("RateShoppingAggregator"),
          icon: Search,
          badge: <Badge className="ml-auto bg-blue-500 text-xs">Live</Badge>,
          roles: ['broker']
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
        },
        {
          title: "Multi-Modal Orchestration",
          url: createPageUrl("MultiModalOrchestration"),
          icon: Layers,
          badge: <Badge className="ml-auto bg-cyan-500 text-xs">NEW</Badge>,
          roles: ['broker']
        },
        {
          title: "3D Load Planning",
          url: createPageUrl("LoadPlanning3D"),
          icon: Package,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">3D</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Load Consolidation AI",
          url: createPageUrl("LoadConsolidation"),
          icon: Layers,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">AI</Badge>,
          roles: ['broker']
        }
        ]
        },
    {
      id: 'appointments',
      label: "Appointments",
      collapsible: true,
      carrierOnly: false,
      items: [
        {
          title: "Activity Planning",
          url: createPageUrl("ActivityPlanning"),
          icon: Calendar,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">NEW</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Appointment Booking",
          url: createPageUrl("AppointmentBooking"),
          icon: Calendar,
          badge: <Badge className="ml-auto bg-cyan-500 text-xs">UNIFIED</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Appointments Book",
          url: createPageUrl("AppointmentsBook"),
          icon: Clock,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">CALENDAR</Badge>,
          roles: ['broker', 'carrier']
        }
      ]
    },
    {
      id: 'analytics',
      label: "Analytics & Reports",
      collapsible: true,
      items: [
        {
          title: "Analytics Dashboard",
          url: createPageUrl("AnalyticsDashboard"),
          icon: BarChart2,
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
          title: "Predictive Dashboard",
          url: createPageUrl("PredictiveAnalyticsDashboard"),
          icon: Brain,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "AI Load Forecasting",
          url: createPageUrl("AILoadForecasting"),
          icon: Brain,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Carrier Scorecards",
          url: createPageUrl("CarrierPerformanceScorecards"),
          icon: Award,
          badge: <Badge className="ml-auto bg-amber-500 text-xs">Score</Badge>,
          roles: ['broker']
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
        },
        {
          title: "Advanced Reports",
          url: createPageUrl("AdvancedReporting"),
          icon: PieChart,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">P&L</Badge>,
          roles: ['broker', 'carrier']
        }
      ]
    },
    {
      id: 'aiTools',
      label: "AI Assistants",
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
          title: "Auto Rate Confirmation",
          url: createPageUrl("AutomatedRateConfirmationAI"),
          icon: FileText,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">AI</Badge>,
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
      id: 'network',
      label: "Network & Partners",
      collapsible: true,
      items: [
        {
          title: "HR Management",
          url: createPageUrl("HRManagement"),
          icon: Users,
          badge: <Badge className="ml-auto bg-blue-500 text-xs">HUB</Badge>,
          roles: ['broker', 'carrier']
        },
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
        {
          title: operatingMode === 'broker' ? "Shippers" : "Customers",
          url: createPageUrl(operatingMode === 'broker' ? "Shippers" : "CustomerManagement"),
          icon: Package,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Vendors",
          url: createPageUrl("VendorManagement"),
          icon: Building,
          badge: null,
          roles: ['broker']
        },

        {
          title: "Onboard Carrier",
          url: createPageUrl("CarrierOnboarding"),
          icon: UserPlus,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Onboard Driver",
          url: createPageUrl("DriverOnboarding"),
          icon: UserPlus,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Onboard Owner Op",
          url: createPageUrl("OwnerOperatorOnboarding"),
          icon: UserPlus,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Onboard Customer",
          url: createPageUrl("CustomerOnboarding"),
          icon: UserPlus,
          badge: null,
          roles: ['broker', 'carrier']
        },

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
          title: "Settlement Management",
          url: createPageUrl("SettlementManagement"),
          icon: DollarSign,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">NEW</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Commission Management",
          url: createPageUrl("CommissionManagement"),
          icon: Award,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">NEW</Badge>,
          roles: ['broker']
        },
        {
          title: "Freight Audit & Payment",
          url: createPageUrl("FreightAudit"),
          icon: FileText,
          badge: <Badge className="ml-auto bg-blue-500 text-xs">NEW</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Quote-to-Cash",
          url: createPageUrl("QuoteToCash"),
          icon: DollarSign,
          badge: <Badge className="ml-auto bg-indigo-500 text-xs">Pipeline</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Revenue Management",
          url: createPageUrl("RevenueManagement"),
          icon: TrendingUp,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">AI</Badge>,
          roles: ['broker', 'carrier']
        },
        {
          title: "Expense Management",
          url: createPageUrl("ExpenseManagement"),
          icon: CreditCard,
          badge: <Badge className="ml-auto bg-green-500 text-xs">NEW</Badge>,
          roles: ['carrier']
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
      id: 'portals',
      label: "Portals",
      collapsible: true,
      items: [
        {
          title: "Carrier Portal",
          url: createPageUrl("CarrierPortal"),
          icon: Truck,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Driver Portal",
          url: createPageUrl("DriverPortal"),
          icon: Users,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Owner Op Portal",
          url: createPageUrl("OwnerOperatorPortal"),
          icon: Truck,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Shipper Portal",
          url: createPageUrl("ShipperPortal"),
          icon: Package,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Customer Portal",
          url: createPageUrl("ShipperPortal"),
          icon: Building,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Customer Self-Service",
          url: createPageUrl("CustomerSelfServicePortal"),
          icon: Users,
          badge: null,
          roles: ['broker', 'carrier']
        }
      ]
    },
    {
      id: 'rates_contracts',
      label: "Rates & Contracts",
      collapsible: true,
      items: [
        {
          title: "Quotes",
          url: createPageUrl("QuoteManagement"),
          icon: FileEdit,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Lane Rates",
          url: createPageUrl("LaneRateManagement"),
          icon: TrendingUp,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Tariffs",
          url: createPageUrl("Tariffs"),
          icon: DollarSign,
          badge: null,
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
          title: "U.S. Steel Rating",
          url: createPageUrl("USSteelRatingManager"),
          icon: FileSpreadsheet,
          badge: null,
          roles: ['carrier']
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
          title: "Load Document Processor",
          url: createPageUrl("LoadDocumentProcessor"),
          icon: Brain,
          badge: <Badge className="ml-auto bg-purple-500 text-xs">AI</Badge>,
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
        },
        {
          title: "FMCSA Compliance",
          url: createPageUrl("FMCSAComplianceCenter"),
          icon: Shield,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Carrier Compliance",
          url: createPageUrl("CarrierCompliance"),
          icon: Shield,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Driver Compliance",
          url: createPageUrl("DriverCompliance"),
          icon: Shield,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Owner Op Compliance",
          url: createPageUrl("OwnerOperatorCompliance"),
          icon: Shield,
          badge: null,
          roles: ['carrier']
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
          title: "Fleet Management",
          url: createPageUrl("FleetManagement"),
          icon: Truck,
          badge: <Badge className="ml-auto bg-blue-500 text-xs">NEW</Badge>,
          roles: ['carrier']
        },
        {
          title: "Equipment Management",
          url: createPageUrl("EquipmentManagement"),
          icon: Package,
          badge: <Badge className="ml-auto bg-indigo-500 text-xs">NEW</Badge>,
          roles: ['carrier']
        },
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
          title: "Asset Utilization",
          url: createPageUrl("AssetUtilization"),
          icon: Package,
          badge: <Badge className="ml-auto bg-cyan-500 text-xs">Analytics</Badge>,
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
      id: 'specialized',
      label: "Specialized",
      collapsible: true,
      items: [
        {
          title: "Car Transport",
          url: createPageUrl("CarTransportModule"),
          icon: Car,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Hazmat",
          url: createPageUrl("HazmatCompliance"),
          icon: AlertTriangle,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Reefer",
          url: createPageUrl("ReeferManagement"),
          icon: Thermometer,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Oversized/Heavy",
          url: createPageUrl("OversizedHeavyHaul"),
          icon: Truck,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Final Mile",
          url: createPageUrl("FinalMileDelivery"),
          icon: Package,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "LTL Management",
          url: createPageUrl("LTLManagement"),
          icon: Package,
          badge: null,
          roles: ['broker', 'carrier']
        }
      ]
    },
      {
      id: 'performance',
      label: "Performance",
      collapsible: true,
      items: [
        {
          title: "Driver Performance",
          url: createPageUrl("DriverPerformanceScoring"),
          icon: Award,
          badge: <Badge className="ml-auto bg-amber-500 text-xs">Score</Badge>,
          roles: ['carrier']
        },
        {
          title: "Performance Dashboard",
          url: createPageUrl("DriverPerformanceDashboard"),
          icon: Award,
          badge: <Badge className="ml-auto bg-blue-500 text-xs">AI</Badge>,
          roles: ['carrier']
        },
        {
          title: "Carrier Policies",
          url: createPageUrl("CarrierPolicyManagementUI"),
          icon: Shield,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Campaigns",
          url: createPageUrl("FeatureAdoptionCampaigns"),
          icon: TrendingUp,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Lane Profitability",
          url: createPageUrl("LaneProfitability"),
          icon: TrendingUp,
          badge: <Badge className="ml-auto bg-emerald-500 text-xs">NEW</Badge>,
          roles: ['carrier']
        },
        {
          title: "Predictive Eligibility",
          url: createPageUrl("PredictiveEligibilityDashboard"),
          icon: Sparkles,
          badge: null,
          roles: ['carrier', 'broker']
        },
        {
          title: "Driver Coaching",
          url: createPageUrl("DriverCoachingHub"),
          icon: MessageSquare,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Profitability",
          url: createPageUrl("AdvancedProfitabilityDashboard"),
          icon: TrendingUp,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Driver Workflows",
          url: createPageUrl("DriverWorkflowDashboard"),
          icon: Zap,
          badge: null,
          roles: ['carrier']
        }
      ]
      },
      {
      id: 'strategy',
      label: "Strategy & Planning",
      collapsible: true,
      items: [
        {
          title: "Carrier Procurement",
          url: createPageUrl("CarrierProcurement"),
          icon: Search,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Capacity Exchange",
          url: createPageUrl("CarrierCapacityExchange"),
          icon: Truck,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Broker Network",
          url: createPageUrl("BrokerNetwork"),
          icon: Users,
          badge: null,
          roles: ['broker']
        },
        {
          title: "RFP Management",
          url: createPageUrl("RFPManagement"),
          icon: FileText,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Network Optimization",
          url: createPageUrl("NetworkOptimization"),
          icon: Network,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Dynamic Pricing",
          url: createPageUrl("DynamicPricing"),
          icon: TrendingUp,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Lane Bidding",
          url: createPageUrl("LaneBidding"),
          icon: TrendingUp,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Capacity Planning",
          url: createPageUrl("CapacityPlanning"),
          icon: BarChart2,
          badge: null,
          roles: ['broker', 'carrier']
        }
        ]
        },
    {
      id: 'execution',
      label: "Execution",
      collapsible: true,
      items: [
        {
          title: "Warehouse",
          url: createPageUrl("WarehouseManagement"),
          icon: Package,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Yard Management",
          url: createPageUrl("YardManagement"),
          icon: MapPin,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Cross-Dock",
          url: createPageUrl("CrossDockOperations"),
          icon: ArrowLeftRight,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Intermodal",
          url: createPageUrl("IntermodalOperations"),
          icon: Layers,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Drayage",
          url: createPageUrl("DrayageOperations"),
          icon: Truck,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Container Tracking",
          url: createPageUrl("ContainerTracking"),
          icon: Package,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Detention & Demurrage",
          url: createPageUrl("DetentionDemurrage"),
          icon: Clock,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "EDI Management",
          url: createPageUrl("EDIManagement"),
          icon: Radio,
          badge: null,
          roles: ['broker', 'carrier']
        }
      ]
    },
    {
      id: 'international',
      label: "International",
      collapsible: true,
      items: [
        {
          title: "Customs",
          url: createPageUrl("CustomsCompliance"),
          icon: Shield,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Global Trade",
          url: createPageUrl("GlobalTradeManagement"),
          icon: Globe,
          badge: null,
          roles: ['broker']
        }
      ]
    },
    {
      id: 'tools',
      label: "Tools",
      collapsible: true,
      items: [
        {
          title: "Communications",
          url: createPageUrl("UnifiedCommunicationHub"),
          icon: MessageSquare,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Voice Assistant",
          url: createPageUrl("VoiceAssistant"),
          icon: Radio,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "USPS Validation",
          url: createPageUrl("USPSAddressValidation"),
          icon: MapPin,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Carbon Dashboard",
          url: createPageUrl("CarbonDashboard"),
          icon: Leaf,
          badge: null,
          roles: ['broker', 'carrier']
        },
        {
          title: "Fraud Detection",
          url: createPageUrl("FraudDetection"),
          icon: Shield,
          badge: null,
          roles: ['broker']
        },
        {
          title: "Benchmarking",
          url: createPageUrl("IndustryBenchmarking"),
          icon: BarChart2,
          badge: null,
          roles: ['broker', 'carrier']
        }
        ]
        },
    {
      id: 'settings',
      label: "Admin",
      collapsible: true,
      items: [
                  {
                    title: "Organizations",
                    url: createPageUrl("OrganizationAdmin"),
                    icon: Building,
                    badge: null,
                    roles: ['broker', 'carrier']
                  },
                  {
                    title: "Members",
                    url: createPageUrl("MemberManagement"),
                    icon: Users,
                    badge: null,
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
                    title: "Settings",
                    url: createPageUrl("Settings"),
                    icon: SettingsIcon,
                    badge: null,
                    roles: ['broker', 'carrier']
                  },
                  {
                    title: "Integrations",
                    url: createPageUrl("Integrations"),
                    icon: Layers,
                    badge: null,
                    roles: ['broker', 'carrier']
                  },
                  {
                    title: "Webhooks",
                    url: createPageUrl("WebhookIntegrations"),
                    icon: Webhook,
                    badge: null,
                    roles: ['broker', 'carrier']
                  },
                  {
                    title: "Data Sync",
                    url: createPageUrl("SyncDashboard"),
                    icon: ArrowLeftRight,
                    badge: null,
                    roles: ['broker', 'carrier']
                  },
                  {
                    title: "Data Archive",
                    url: createPageUrl("DataArchive"),
                    icon: Database,
                    badge: null,
                    roles: ['broker', 'carrier']
                  },
                  {
                    title: "Security Audit",
                    url: createPageUrl("SecurityAuditCenter"),
                    icon: Shield,
                    badge: null,
                    roles: ['broker', 'carrier']
                  },
                  {
                    title: "Policy Alerts",
                    url: createPageUrl("PolicyAlertsManagement"),
                    icon: AlertTriangle,
                    badge: null,
                    roles: ['broker', 'carrier']
                  },
        {
          title: "Go-Live Checklist",
          url: createPageUrl("GoLiveReadiness"),
          icon: Rocket,
          badge: null,
          roles: ['broker', 'carrier']
        }
      ]
    },
    {
      id: 'maintenance_assets',
      label: "Assets & Maintenance",
      collapsible: true,
      items: [
        {
          title: "Fleet",
          url: createPageUrl("FleetManagement"),
          icon: Truck,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Equipment",
          url: createPageUrl("EquipmentManagement"),
          icon: Package,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Maintenance",
          url: createPageUrl("MaintenanceTracking"),
          icon: Wrench,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Fuel",
          url: createPageUrl("FuelManagement"),
          icon: Fuel,
          badge: null,
          roles: ['carrier']
        },
        {
          title: "Safety",
          url: createPageUrl("SafetyManagement"),
          icon: Shield,
          badge: null,
          roles: ['carrier']
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
    <ErrorBoundary>
      <ToastProvider>
      <SidebarProvider>
        <BidirectionalSyncEngine enabled={true} interval={30000} />
        <EnhancedWorkflowEngine enabled={true} interval={30000} />
        <LiveUpdates entities={['loads', 'drivers', 'documents']} interval={15000} enabled={true} />
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
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
            <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Operating Mode</span>
              </div>
              <Button
                onClick={handleModeToggle}
                className={`w-full justify-start gap-2 transition-all duration-300 ${
                  operatingMode === 'carrier'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
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
                              className={`transition-all duration-200 rounded-xl mb-1 ${
                                                                    isActive
                                                                      ? 'bg-indigo-100 text-indigo-700 shadow-md border border-indigo-200'
                                                                      : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 hover:shadow-sm'
                                                                  }`}
                            >
                              <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                                <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : ''}`} />
                                <span className="font-medium text-xs">{item.title}</span>
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
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-slate-900">TMS.ai</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-slate-600" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
                <Badge className={operatingMode === 'carrier' ? 'bg-blue-600' : 'bg-indigo-600'}>
                  {operatingMode}
                </Badge>
              </div>
            </div>
          </header>

          {/* Main content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>

          {/* Notification Center */}
          {showNotifications && (
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          )}

          {/* Error Alert System */}
          <ErrorAlertSystem />
        </main>
      </div>
      </SidebarProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <OperatingModeProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </OperatingModeProvider>
  );
}