import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Calendar, Zap, TrendingUp, Target, Rocket } from "lucide-react";

export default function MVPRoadmap() {
  const [selectedPhase, setSelectedPhase] = useState(0);

  const phases = [
    {
      phase: "Phase 1",
      title: "Core Broker TMS (MVP)",
      timeline: "Months 1-3",
      status: "ready",
      icon: <Rocket className="w-6 h-6" />,
      color: "indigo",
      goal: "Launch as functional freight broker TMS with essential features",
      modules: [
        {
          name: "Auth & User Management",
          features: [
            "User authentication (OAuth 2.0)",
            "Role-based access control (Admin, Dispatcher, Broker, Accounting)",
            "User profiles with basic HR fields",
            "Password reset and session management"
          ],
          entities: ["User", "Employee (basic)", "Role"],
          priority: "P0"
        },
        {
          name: "Organizations & Parties",
          features: [
            "Customer onboarding and profiles",
            "Carrier onboarding with compliance tracking",
            "Company/organization master data",
            "Contact management",
            "Insurance certificate tracking"
          ],
          entities: ["Organization", "Party", "Customer", "Carrier", "Contact", "InsurancePolicy"],
          priority: "P0"
        },
        {
          name: "Locations Master Data",
          features: [
            "Location database (shipper/consignee facilities)",
            "Address validation",
            "Geocoding (lat/lng)",
            "Operating hours and appointment requirements",
            "Location search and autocomplete"
          ],
          entities: ["Location"],
          priority: "P0"
        },
        {
          name: "Load Management (Single-Leg)",
          features: [
            "Create load with origin/destination",
            "Add stops (pickup/delivery)",
            "Commodity/line item entry",
            "Status lifecycle (quote → delivered)",
            "Manual carrier assignment",
            "Basic load board view"
          ],
          entities: ["Load", "Stop (basic)", "Commodity"],
          priority: "P0"
        },
        {
          name: "Basic Rating & Margin",
          features: [
            "Manual rate entry (linehaul, fuel, accessorials)",
            "Margin calculation (revenue - cost)",
            "Accessorial charge codes",
            "Simple customer rate tables"
          ],
          entities: ["AccessorialCode", "CustomerContract (basic)", "LaneRate (basic)"],
          priority: "P0"
        },
        {
          name: "Document Management",
          features: [
            "Upload BOL, POD, rate confirmation",
            "Document library per load/carrier/customer",
            "Basic document tagging",
            "File storage and retrieval"
          ],
          entities: ["Document"],
          priority: "P0"
        },
        {
          name: "Invoicing (AR) - Basic",
          features: [
            "Generate invoice from load",
            "Invoice status tracking (draft, sent, paid)",
            "Payment recording",
            "Aging report (30/60/90 days)"
          ],
          entities: ["Invoice", "Payment"],
          priority: "P0"
        },
        {
          name: "Carrier Settlements (AP) - Basic",
          features: [
            "Create carrier settlement per load",
            "Settlement approval workflow",
            "Payment method selection",
            "Settlement export (CSV/Excel)"
          ],
          entities: ["Settlement", "SettlementLine"],
          priority: "P0"
        },
        {
          name: "Tracking - Manual",
          features: [
            "Manual status updates",
            "Check call logging",
            "ETA entry and updates",
            "Customer notifications (email)"
          ],
          entities: ["TrackingEvent (basic)"],
          priority: "P1"
        }
      ],
      deliverables: [
        "✅ Functional broker TMS for quoting, dispatching, tracking loads",
        "✅ Customer & carrier management",
        "✅ Basic invoicing and carrier pay",
        "✅ Document upload and storage",
        "✅ Load board with status tracking",
        "✅ Margin visibility"
      ]
    },
    {
      phase: "Phase 2",
      title: "Dual Broker/Carrier + Multi-Leg + HRM",
      timeline: "Months 4-6",
      status: "planned",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "purple",
      goal: "Enable asset carrier operations, multi-leg shipments, and workforce management",
      modules: [
        {
          name: "Asset Management (Carrier Mode)",
          features: [
            "Tractor and trailer fleet management",
            "Equipment assignment to drivers",
            "Equipment status tracking",
            "Ownership types (owned, leased, owner-operator)",
            "Preventive maintenance scheduling"
          ],
          entities: ["Tractor", "Trailer", "MaintenanceRecord"],
          priority: "P0"
        },
        {
          name: "Driver Management",
          features: [
            "Driver profiles with CDL tracking",
            "Endorsements and qualifications",
            "Medical card expiration alerts",
            "Driver availability dashboard",
            "Owner-operator support"
          ],
          entities: ["Driver (enhanced)", "OwnerOperator", "DriverQualificationFile"],
          priority: "P0"
        },
        {
          name: "Multi-Leg Load Support",
          features: [
            "Create loads with multiple legs",
            "Split load wizard (divide commodities across carriers/trucks)",
            "Transfer operations (crossdock, intermodal)",
            "Reconsignment workflow (change destination)",
            "Per-leg cost and revenue tracking"
          ],
          entities: ["LoadLeg", "LegCommodity (for splits)", "Stop (enhanced)"],
          priority: "P0"
        },
        {
          name: "Advanced Routing",
          features: [
            "Route planning with distance/time calculation",
            "Truck stop recommendations along route",
            "Manual route waypoints",
            "Route versioning (planned vs actual)",
            "Multiple routing profiles"
          ],
          entities: ["RoutePlan", "RouteSegment", "RouteWaypoint"],
          priority: "P1"
        },
        {
          name: "HR Management - Core",
          features: [
            "Employee records (all staff)",
            "Department and supervisor hierarchy",
            "Payroll structure configuration",
            "Training records with expiration tracking",
            "Time-off request workflow",
            "Performance review templates"
          ],
          entities: ["Employee (enhanced)", "TrainingRecord", "TimeOffRequest", "PerformanceReview"],
          priority: "P1"
        },
        {
          name: "Basic Analytics",
          features: [
            "Revenue and margin reports by customer, lane, dispatcher",
            "Load volume trends",
            "On-time delivery metrics",
            "Customer profitability dashboard",
            "Carrier performance leaderboard"
          ],
          entities: ["FactShipment (basic)", "KPISnapshot"],
          priority: "P1"
        },
        {
          name: "Compliance Tracking",
          features: [
            "Compliance item library (insurance, license, docs)",
            "Expiration alerts and dashboards",
            "Carrier compliance scoring",
            "Document auto-reminders"
          ],
          entities: ["ComplianceItem", "ComplianceProfile"],
          priority: "P1"
        }
      ],
      deliverables: [
        "✅ Full dual broker + carrier operations",
        "✅ Fleet and driver management",
        "✅ Load splits, transfers, reconsignments",
        "✅ Basic route planning",
        "✅ Complete HR foundation",
        "✅ Analytics and reporting",
        "✅ Compliance automation"
      ]
    },
    {
      phase: "Phase 3",
      title: "Advanced Routing, EIA/USDA, Telemetry, Full HRM",
      timeline: "Months 7-10",
      status: "future",
      icon: <Zap className="w-6 h-6" />,
      color: "emerald",
      goal: "Transform into AI-native smart TMS with decision support and intelligence",
      modules: [
        {
          name: "Real-Time Tracking & Telemetry",
          features: [
            "GPS ping ingestion from ELD/telematics",
            "Real-time map with fleet location",
            "Geofencing and arrival/departure automation",
            "ETA prediction using ML",
            "WebSocket live updates for customers",
            "Reefer temperature monitoring"
          ],
          entities: ["GPSPing", "TrackingEvent (enhanced)", "GeofenceZone"],
          priority: "P0"
        },
        {
          name: "HOS & ELD Integration",
          features: [
            "HOS event logging (on_duty, driving, sleeper, off_duty)",
            "Violation detection and alerts",
            "Driver availability based on HOS remaining",
            "ELD device integration (API)",
            "Compliance reporting (FMCSA)",
            "Driver log certification workflow"
          ],
          entities: ["HOSEvent", "ELDDevice"],
          priority: "P0"
        },
        {
          name: "Advanced Routing Intelligence",
          features: [
            "Route segment-level toll cost estimation",
            "Live construction/road closure overlays (511 API)",
            "Weather risk scoring per segment (NWS/NOAA)",
            "Automatic reroute suggestions on delays",
            "Truck stop finder with parking availability",
            "Toll transaction reconciliation"
          ],
          entities: ["RouteSegment (enhanced)", "RoadEvent", "WeatherAlert", "TollLocation", "TollTransaction", "TruckStop"],
          priority: "P0"
        },
        {
          name: "EIA Fuel Integration",
          features: [
            "Weekly EIA diesel price import (scheduled job)",
            "Fuel surcharge auto-calculation by region & date",
            "Customer fuel programs with tiered pricing",
            "Carrier fuel programs with index linking",
            "Fuel surcharge variance reporting"
          ],
          entities: ["FuelIndex (EIA)", "FuelProgram", "FuelSurchargeProgram (enhanced)"],
          priority: "P0"
        },
        {
          name: "USDA Commodity Pricing",
          features: [
            "USDA freight rate benchmark ingestion",
            "Commodity-lane pricing comparison",
            "Rate benchmarking dashboard",
            "Profitable lane identification",
            "Market rate alerts (above/below market)"
          ],
          entities: ["CommodityPricingIndex (USDA)"],
          priority: "P1"
        },
        {
          name: "Safety & Incident Management",
          features: [
            "Incident reporting workflow",
            "DOT inspection logging",
            "Safety score calculation",
            "CSA point tracking",
            "Preventability determination",
            "Investigation and corrective actions"
          ],
          entities: ["SafetyIncident", "InspectionRecord"],
          priority: "P0"
        },
        {
          name: "Claims & Insurance",
          features: [
            "Cargo claim submission and tracking",
            "Insurance policy management",
            "Claim resolution workflow",
            "Liability determination",
            "Settlement tracking"
          ],
          entities: ["Claim", "InsurancePolicy (enhanced)"],
          priority: "P1"
        },
        {
          name: "Exception Management",
          features: [
            "Auto-exception detection (late pickup/delivery, OS&D)",
            "Root cause categorization",
            "Assignment and escalation workflow",
            "Customer notification automation",
            "Financial impact tracking"
          ],
          entities: ["ExceptionCase"],
          priority: "P1"
        },
        {
          name: "Full HR & Workforce Management",
          features: [
            "Recruiting pipeline for drivers",
            "Interview and onboarding workflow",
            "Annual performance reviews with scorecards",
            "Training compliance dashboard",
            "Time-off approval workflow",
            "Payroll calculation and reporting",
            "Driver incentive programs"
          ],
          entities: ["Employee (full)", "TrainingRecord (enhanced)", "PerformanceReview (enhanced)", "PayrollRecord", "Lead (recruiting)"],
          priority: "P1"
        },
        {
          name: "Fuel & Environmental Tracking",
          features: [
            "Fuel transaction logging",
            "Fuel card integration (Comdata, WEX, EFS)",
            "Fuel efficiency reporting (MPG by tractor)",
            "CO2 emissions calculation per shipment",
            "Carbon offset tracking",
            "EPA SmartWay reporting"
          ],
          entities: ["FuelTransaction", "FuelCard", "EmissionFactor", "ShipmentEmission"],
          priority: "P1"
        },
        {
          name: "Advanced Analytics & BI",
          features: [
            "Fact table ETL (daily aggregation)",
            "Margin analytics by any dimension",
            "Asset utilization reports (loaded vs empty miles)",
            "Driver scorecard (safety, performance, efficiency)",
            "Lane profitability analysis",
            "Forecast modeling (revenue, volume)"
          ],
          entities: ["FactShipment", "FactTripLeg", "FactFinance", "FactCompliance", "KPISnapshot (enhanced)"],
          priority: "P1"
        },
        {
          name: "Alerts & Automation",
          features: [
            "Configurable alert rules (threshold-based)",
            "Real-time alert triggering",
            "Multi-channel notifications (email, SMS, in-app, Slack)",
            "Alert acknowledgment and resolution workflow",
            "Automated customer status updates"
          ],
          entities: ["AlertRule", "AlertEvent"],
          priority: "P1"
        }
      ],
      deliverables: [
        "✅ Real-time GPS tracking and ETA predictions",
        "✅ HOS compliance and ELD integration",
        "✅ Smart routing with toll/weather/construction overlays",
        "✅ EIA fuel index-driven fuel surcharges",
        "✅ USDA commodity pricing benchmarks",
        "✅ Complete safety and claims management",
        "✅ Full HR and workforce features",
        "✅ Advanced analytics and BI",
        "✅ Alert and exception automation",
        "✅ Environmental tracking (CO2)"
      ]
    },
    {
      phase: "Phase 4",
      title: "AI, Portals, Mobile & Ecosystem Integration",
      timeline: "Months 11-14",
      status: "future",
      icon: <Target className="w-6 h-6" />,
      color: "blue",
      goal: "AI-native TMS with ecosystem integrations and mobile experience",
      modules: [
        {
          name: "Customer Portal",
          features: [
            "Self-service load creation and quoting",
            "Real-time shipment tracking",
            "Document downloads (BOL, POD, invoices)",
            "Invoice payment portal",
            "Custom reporting and analytics"
          ],
          tech: ["React Portal App", "Shared Auth", "API Integration"]
        },
        {
          name: "Carrier Portal",
          features: [
            "Available load tender board",
            "Accept/reject tenders",
            "Update tracking and status",
            "Upload PODs and documents",
            "View settlement statements",
            "Performance metrics dashboard"
          ],
          tech: ["React Portal App", "Shared Auth"]
        },
        {
          name: "Driver Mobile App",
          features: [
            "View assigned loads and routes",
            "Turn-by-turn navigation",
            "Update status and location (auto GPS)",
            "Upload POD with signature capture",
            "In-app messaging with dispatch",
            "HOS timer and alerts",
            "Fuel and expense logging"
          ],
          tech: ["React Native", "GPS Background Tracking", "Offline Mode"]
        },
        {
          name: "AI-Powered Dispatch Assistant",
          features: [
            "Auto-suggest best carrier/driver for load",
            "Capacity matching based on location/equipment/performance",
            "Load-to-driver matching with HOS consideration",
            "Backhaul recommendations",
            "Lane optimization suggestions"
          ],
          tech: ["ML Model", "Real-time Matching Engine"]
        },
        {
          name: "AI Document Processing",
          features: [
            "OCR for BOL, POD, invoices",
            "Auto-extract data (dates, locations, amounts)",
            "Auto-create loads from BOL",
            "Document verification and fraud detection",
            "Rate confirmation matching"
          ],
          tech: ["Vision AI", "NLP", "Base44 InvokeLLM Integration"]
        },
        {
          name: "Predictive Analytics",
          features: [
            "Demand forecasting by lane",
            "Rate volatility predictions",
            "Carrier performance predictions",
            "Risk scoring (late delivery, claim probability)",
            "Revenue forecasting"
          ],
          tech: ["Time-Series Models", "ML Pipeline"]
        },
        {
          name: "External Integrations",
          features: [
            "EDI (204, 214, 210, 990) with large shippers/carriers",
            "Load board posting (DAT, Truckstop.com)",
            "Accounting sync (QuickBooks, Xero, NetSuite)",
            "Factoring company integration",
            "ELD/telematics APIs (Samsara, KeepTruckin, Geotab)",
            "TMS-to-TMS API (with partners)"
          ],
          entities: ["IntegrationEndpoint", "MessageLog", "EDITransaction"],
          tech: ["EDI Parser", "API Connectors", "Webhook Handlers"]
        },
        {
          name: "RFP & Bidding System",
          features: [
            "Create RFP events with multiple lanes",
            "Invite carriers to bid",
            "Bid submission and evaluation",
            "Auto-scoring (price + service)",
            "Award workflow and contract generation"
          ],
          entities: ["RfpEvent", "RfpLane", "RfpBid", "RfpAward"],
          priority: "P1"
        }
      ],
      deliverables: [
        "✅ Customer, carrier, and driver portals",
        "✅ Driver mobile app with navigation",
        "✅ AI dispatch and document automation",
        "✅ Predictive analytics suite",
        "✅ EDI and external integrations",
        "✅ RFP/bidding platform",
        "✅ Complete ecosystem connectivity"
      ]
    }
  ];

  const currentPhase = phases[selectedPhase];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            TMS Development Roadmap
          </h1>
          <p className="text-slate-600 text-lg mb-4">
            Phased approach to building enterprise-grade dual Broker/Carrier TMS
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge className="bg-purple-600 text-white">4 Phases</Badge>
            <Badge className="bg-indigo-600 text-white">14 Months</Badge>
            <Badge className="bg-emerald-600 text-white">51+ Entities</Badge>
            <Badge className="bg-blue-600 text-white">Production Ready</Badge>
          </div>
        </div>

        {/* Phase Timeline */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Phase Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {phases.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhase(idx)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedPhase === idx
                      ? `border-${p.color}-500 bg-${p.color}-50 shadow-lg`
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-${p.color}-600 to-${p.color}-700 rounded-xl mb-3`}>
                    {p.icon}
                    {p.icon && React.cloneElement(p.icon, { className: "w-6 h-6 text-white" })}
                  </div>
                  <p className="font-bold text-slate-900 mb-1">{p.phase}</p>
                  <p className="text-xs text-slate-600 mb-2">{p.timeline}</p>
                  <Badge className={`bg-${p.color}-100 text-${p.color}-800 text-xs`}>
                    {p.status === 'ready' && '🚀 Ready to Build'}
                    {p.status === 'planned' && '📋 Planned'}
                    {p.status === 'future' && '🔮 Future'}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Phase Details */}
        <Card className={`border-0 shadow-2xl bg-gradient-to-br from-${currentPhase.color}-50 via-white to-white`}>
          <CardHeader className={`border-b border-${currentPhase.color}-100`}>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{currentPhase.title}</CardTitle>
                <p className="text-slate-600">{currentPhase.goal}</p>
              </div>
              <Badge className={`bg-${currentPhase.color}-600 text-white text-sm px-4 py-2`}>
                {currentPhase.timeline}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Modules */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle className={`w-5 h-5 text-${currentPhase.color}-600`} />
                Core Modules ({currentPhase.modules.length})
              </h3>
              <div className="space-y-4">
                {currentPhase.modules.map((module, mIdx) => (
                  <div key={mIdx} className="border border-slate-200 rounded-xl p-5 bg-white hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-slate-900">{module.name}</h4>
                      {module.priority && (
                        <Badge className={
                          module.priority === 'P0' ? 'bg-red-100 text-red-800' :
                          module.priority === 'P1' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }>
                          {module.priority}
                        </Badge>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Features</p>
                      <ul className="space-y-1">
                        {module.features.map((feature, fIdx) => (
                          <li key={fIdx} className="text-sm text-slate-700 flex items-start gap-2">
                            <Circle className="w-3 h-3 mt-1 text-emerald-600 fill-emerald-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Entities */}
                    {module.entities && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Entities Required</p>
                        <div className="flex flex-wrap gap-2">
                          {module.entities.map((entity, eIdx) => (
                            <Badge key={eIdx} variant="outline" className={`text-xs bg-${currentPhase.color}-50 text-${currentPhase.color}-800 border-${currentPhase.color}-200`}>
                              {entity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tech Stack */}
                    {module.tech && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Technology</p>
                        <div className="flex flex-wrap gap-2">
                          {module.tech.map((tech, tIdx) => (
                            <Badge key={tIdx} className="bg-slate-100 text-slate-700 text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverables */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target className={`w-5 h-5 text-${currentPhase.color}-600`} />
                Phase Deliverables
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {currentPhase.deliverables.map((deliverable, dIdx) => (
                  <div key={dIdx} className={`p-4 bg-${currentPhase.color}-50 border border-${currentPhase.color}-200 rounded-lg`}>
                    <p className="text-sm text-slate-800">{deliverable}</p>
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Implementation Guidelines */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white">
          <CardHeader>
            <CardTitle>Implementation Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">🏗️ Database Design Principles</h4>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Use PostgreSQL for relational integrity and GIS support (PostGIS for routing)</li>
                <li>• Partition large tables (gps_pings, audit_logs) by month/year</li>
                <li>• Use UUIDs for primary keys (better for distributed systems)</li>
                <li>• Create composite indexes on FK + filter columns</li>
                <li>• Implement soft deletes (is_active flag) for audit trail</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">🔧 Backend Architecture</h4>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Microservices: Loads Service, Tracking Service, Rating Service, Analytics Service</li>
                <li>• Message queue (RabbitMQ/Kafka) for event-driven updates</li>
                <li>• Redis cache for frequently accessed data (locations, rate tables)</li>
                <li>• Async workers for ETL, EIA import, USDA import, email sending</li>
                <li>• GraphQL option for complex nested queries (load + legs + stops + tracking)</li>
              </ul>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h4 className="font-semibold text-emerald-900 mb-2">📱 Frontend Strategy</h4>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• React + TypeScript for main TMS web app</li>
                <li>• React Native for driver mobile app</li>
                <li>• Shared component library for portals</li>
                <li>• Real-time updates via WebSocket (Socket.io)</li>
                <li>• Offline-first mobile app with sync</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🔐 Security & Compliance</h4>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• SOC 2 Type II compliance (data encryption at rest and in transit)</li>
                <li>• Field-level access control (hide sensitive data by role)</li>
                <li>• Audit logging for all mutations (who, what, when, why)</li>
                <li>• Data retention policies (7 years for DOT, 3 years for financial)</li>
                <li>• PII encryption (SSN, driver licenses, credit card data)</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2">⚡ Performance Optimization</h4>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Database read replicas for analytics queries</li>
                <li>• CDN for document storage and retrieval</li>
                <li>• Elasticsearch for full-text search (loads, customers, carriers)</li>
                <li>• Background jobs for heavy computations (route optimization, emissions calc)</li>
                <li>• API response caching with TTL (locations, rate tables)</li>
              </ul>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <h4 className="font-semibold text-rose-900 mb-2">🧪 Testing Strategy</h4>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Unit tests for business logic (rating engine, margin calculation)</li>
                <li>• Integration tests for API endpoints</li>
                <li>• E2E tests for critical workflows (create load → dispatch → track → invoice)</li>
                <li>• Load testing for tracking endpoints (10,000 concurrent GPS pings)</li>
                <li>• Chaos engineering for resilience testing</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Success Metrics */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Success Metrics by Phase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-5 bg-white border border-indigo-200 rounded-xl">
                <p className="text-sm font-semibold text-indigo-900 mb-3">Phase 1 MVP</p>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>• 100+ loads managed per month</li>
                  <li>• 10+ active customers</li>
                  <li>• 50+ active carriers</li>
                  <li>• 95%+ invoice accuracy</li>
                  <li>• $0 in manual data entry errors</li>
                </ul>
              </div>
              <div className="p-5 bg-white border border-purple-200 rounded-xl">
                <p className="text-sm font-semibold text-purple-900 mb-3">Phase 2 Full System</p>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>• 500+ loads/month (broker + carrier)</li>
                  <li>• 50+ company drivers managed</li>
                  <li>• 20+ tractors tracked</li>
                  <li>• 98%+ on-time delivery</li>
                  <li>• 15%+ avg margin maintained</li>
                </ul>
              </div>
              <div className="p-5 bg-white border border-emerald-200 rounded-xl">
                <p className="text-sm font-semibold text-emerald-900 mb-3">Phase 3 Intelligence</p>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>• Real-time tracking 100% of loads</li>
                  <li>• 90%+ HOS compliance</li>
                  <li>• 50%+ reduction in empty miles</li>
                  <li>• 80%+ carrier auto-match rate</li>
                  <li>• Zero safety score impact</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}