import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Database,
  Shield,
  Truck,
  Users,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Download,
  Layers,
  Zap,
  Activity
} from "lucide-react";

export default function SystemRequirementsSpec() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "1. Overview", icon: FileText },
    { id: "functional", label: "2. Functional Reqs", icon: Layers },
    { id: "nonfunctional", label: "3. Non-Functional", icon: Activity },
    { id: "datamodel", label: "4. Data Model", icon: Database },
    { id: "security", label: "5. Security", icon: Shield },
    { id: "acceptance", label: "6. Acceptance", icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              System Requirements Specification
            </h1>
            <p className="text-slate-600 mt-2">
              TMS.ai — IEEE 830 / ISO/IEC/IEEE 29148 Compliant SRS
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-indigo-600">Version 1.0</Badge>
            <Badge className="bg-slate-600">November 2025</Badge>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              onClick={() => setActiveSection(section.id)}
              className={activeSection === section.id ? "bg-indigo-600" : ""}
            >
              <section.icon className="w-4 h-4 mr-2" />
              {section.label}
            </Button>
          ))}
        </div>

        {/* Section 1: Overview */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3>1.1 Purpose</h3>
                <p>
                  This System Requirements Specification (SRS) defines the functional and non-functional 
                  requirements for TMS.ai, a dual-platform Transportation Management System designed for 
                  both freight brokers and motor carriers.
                </p>

                <h3>1.2 Scope</h3>
                <p>TMS.ai encompasses:</p>
                <ul>
                  <li><strong>Broker Platform (TMS-A):</strong> Load management, carrier procurement, rate negotiation, shipper CRM, accounting</li>
                  <li><strong>Carrier Platform (TMS-B):</strong> Driver dispatch, fleet management, compliance tracking, settlements</li>
                  <li><strong>Shared Services:</strong> Document management, real-time tracking, bidirectional sync, workflow automation</li>
                </ul>

                <h3>1.3 Stakeholders</h3>
                <table className="w-full border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2">Stakeholder</th>
                      <th className="border border-slate-300 p-2">Role</th>
                      <th className="border border-slate-300 p-2">Primary Concerns</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 p-2">Freight Brokers</td>
                      <td className="border border-slate-300 p-2">Primary User</td>
                      <td className="border border-slate-300 p-2">Load matching, margin optimization, carrier vetting</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">Motor Carriers</td>
                      <td className="border border-slate-300 p-2">Primary User</td>
                      <td className="border border-slate-300 p-2">Driver management, compliance, settlements</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">Dispatchers</td>
                      <td className="border border-slate-300 p-2">Operational User</td>
                      <td className="border border-slate-300 p-2">Real-time load tracking, driver assignment</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">Drivers</td>
                      <td className="border border-slate-300 p-2">Mobile User</td>
                      <td className="border border-slate-300 p-2">Load acceptance, document upload, status updates</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">Shippers</td>
                      <td className="border border-slate-300 p-2">Customer</td>
                      <td className="border border-slate-300 p-2">Shipment visibility, quote requests</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">Compliance Officers</td>
                      <td className="border border-slate-300 p-2">Regulatory</td>
                      <td className="border border-slate-300 p-2">FMCSA/DOT compliance, audit readiness</td>
                    </tr>
                  </tbody>
                </table>

                <h3>1.4 Definitions</h3>
                <ul>
                  <li><strong>TMS-A:</strong> Broker-facing Transportation Management System</li>
                  <li><strong>TMS-B:</strong> Carrier/Driver-facing Transportation Management System</li>
                  <li><strong>Load:</strong> A shipment requiring transportation</li>
                  <li><strong>Tender:</strong> Offer of a load to a carrier</li>
                  <li><strong>HOS:</strong> Hours of Service (FMCSA regulation)</li>
                  <li><strong>ELD:</strong> Electronic Logging Device</li>
                  <li><strong>BOL:</strong> Bill of Lading</li>
                  <li><strong>POD:</strong> Proof of Delivery</li>
                  <li><strong>Rate Con:</strong> Rate Confirmation document</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>1.5 System Context</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-6 rounded-lg font-mono text-sm">
                  <pre>{`
┌─────────────────────────────────────────────────────────────┐
│                      TMS.ai PLATFORM                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    Bidirectional    ┌─────────────┐       │
│  │   TMS-A     │◄──────Sync─────────►│   TMS-B     │       │
│  │  (Broker)   │                     │  (Carrier)  │       │
│  └──────┬──────┘                     └──────┬──────┘       │
│         │                                   │              │
│         ▼                                   ▼              │
│  ┌─────────────────────────────────────────────────┐       │
│  │              SHARED SERVICES                    │       │
│  │  • Document Management    • Workflow Engine     │       │
│  │  • Real-time Tracking     • Notification Hub    │       │
│  │  • Analytics Engine       • Compliance Monitor  │       │
│  └─────────────────────────────────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Shippers │   │ Carriers │   │ Drivers  │
    │ (Portal) │   │ (Portal) │   │ (Mobile) │
    └──────────┘   └──────────┘   └──────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 2: Functional Requirements */}
        {activeSection === "functional" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>2. Functional Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">

                {/* FR-LOAD */}
                <div className="border-l-4 border-indigo-600 pl-4">
                  <h3 className="text-lg font-bold text-indigo-900">FR-LOAD: Load Management Module</h3>
                  
                  <table className="w-full mt-4 border-collapse border border-slate-300 text-sm">
                    <thead>
                      <tr className="bg-indigo-50">
                        <th className="border border-slate-300 p-2">ID</th>
                        <th className="border border-slate-300 p-2">Requirement</th>
                        <th className="border border-slate-300 p-2">Priority</th>
                        <th className="border border-slate-300 p-2">Validation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-LOAD-001</td>
                        <td className="border border-slate-300 p-2">System shall allow creation of loads with pickup/delivery locations</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-red-600">Critical</Badge></td>
                        <td className="border border-slate-300 p-2">Address validation required</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-LOAD-002</td>
                        <td className="border border-slate-300 p-2">System shall track load status through lifecycle: quote → available → tendered → assigned → dispatched → picked_up → in_transit → delivered → invoiced → closed</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-red-600">Critical</Badge></td>
                        <td className="border border-slate-300 p-2">State machine validation</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-LOAD-003</td>
                        <td className="border border-slate-300 p-2">System shall calculate margins (customer_rate - carrier_pay)</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-orange-600">High</Badge></td>
                        <td className="border border-slate-300 p-2">margin ≥ 0 for approval</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-LOAD-004</td>
                        <td className="border border-slate-300 p-2">System shall support multi-stop loads with unlimited stops</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-yellow-600">Medium</Badge></td>
                        <td className="border border-slate-300 p-2">Sequence numbering</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-LOAD-005</td>
                        <td className="border border-slate-300 p-2">System shall support equipment types: dry_van, reefer, flatbed, step_deck, lowboy, tanker, container</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-red-600">Critical</Badge></td>
                        <td className="border border-slate-300 p-2">Enum validation</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-LOAD-006</td>
                        <td className="border border-slate-300 p-2">System shall flag hazmat loads and require UN number, class, packing group</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-orange-600">High</Badge></td>
                        <td className="border border-slate-300 p-2">Conditional required fields</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-LOAD-007</td>
                        <td className="border border-slate-300 p-2">System shall track temperature requirements for reefer loads</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-orange-600">High</Badge></td>
                        <td className="border border-slate-300 p-2">temp_min ≤ temp_max</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* FR-DISPATCH */}
                <div className="border-l-4 border-emerald-600 pl-4">
                  <h3 className="text-lg font-bold text-emerald-900">FR-DISPATCH: Dispatch Module</h3>
                  
                  <table className="w-full mt-4 border-collapse border border-slate-300 text-sm">
                    <thead>
                      <tr className="bg-emerald-50">
                        <th className="border border-slate-300 p-2">ID</th>
                        <th className="border border-slate-300 p-2">Requirement</th>
                        <th className="border border-slate-300 p-2">Priority</th>
                        <th className="border border-slate-300 p-2">Validation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-DISP-001</td>
                        <td className="border border-slate-300 p-2">System shall display real-time dispatch console with active/pending loads</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-red-600">Critical</Badge></td>
                        <td className="border border-slate-300 p-2">Refresh ≤ 30 seconds</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-DISP-002</td>
                        <td className="border border-slate-300 p-2">System shall assign drivers based on HOS availability</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-red-600">Critical</Badge></td>
                        <td className="border border-slate-300 p-2">HOS remaining ≥ trip duration</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-DISP-003</td>
                        <td className="border border-slate-300 p-2">System shall provide AI-based load matching recommendations</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-orange-600">High</Badge></td>
                        <td className="border border-slate-300 p-2">Score 0-100 per match</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-DISP-004</td>
                        <td className="border border-slate-300 p-2">System shall log check calls with timestamp, location, status</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-orange-600">High</Badge></td>
                        <td className="border border-slate-300 p-2">Audit trail required</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* FR-COMPLIANCE */}
                <div className="border-l-4 border-red-600 pl-4">
                  <h3 className="text-lg font-bold text-red-900">FR-COMP: Compliance Module</h3>
                  
                  <table className="w-full mt-4 border-collapse border border-slate-300 text-sm">
                    <thead>
                      <tr className="bg-red-50">
                        <th className="border border-slate-300 p-2">ID</th>
                        <th className="border border-slate-300 p-2">Requirement</th>
                        <th className="border border-slate-300 p-2">Priority</th>
                        <th className="border border-slate-300 p-2">Validation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-COMP-001</td>
                        <td className="border border-slate-300 p-2">System shall verify carrier MC/DOT authority status</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-red-600">Critical</Badge></td>
                        <td className="border border-slate-300 p-2">Active authority required</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-COMP-002</td>
                        <td className="border border-slate-300 p-2">System shall track driver CDL, medical card, MVR expirations</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-red-600">Critical</Badge></td>
                        <td className="border border-slate-300 p-2">Alert 30 days before expiry</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-COMP-003</td>
                        <td className="border border-slate-300 p-2">System shall track insurance certificates with coverage limits</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-red-600">Critical</Badge></td>
                        <td className="border border-slate-300 p-2">Coverage ≥ load value</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-COMP-004</td>
                        <td className="border border-slate-300 p-2">System shall retain records per FMCSA 371.3 (minimum 3 years)</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-red-600">Critical</Badge></td>
                        <td className="border border-slate-300 p-2">7-year retention implemented</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-COMP-005</td>
                        <td className="border border-slate-300 p-2">System shall detect potential double-brokering</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-orange-600">High</Badge></td>
                        <td className="border border-slate-300 p-2">Fraud score 0-100</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* FR-FINANCE */}
                <div className="border-l-4 border-green-600 pl-4">
                  <h3 className="text-lg font-bold text-green-900">FR-FIN: Financial Module</h3>
                  
                  <table className="w-full mt-4 border-collapse border border-slate-300 text-sm">
                    <thead>
                      <tr className="bg-green-50">
                        <th className="border border-slate-300 p-2">ID</th>
                        <th className="border border-slate-300 p-2">Requirement</th>
                        <th className="border border-slate-300 p-2">Priority</th>
                        <th className="border border-slate-300 p-2">Validation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-FIN-001</td>
                        <td className="border border-slate-300 p-2">System shall generate invoices from delivered loads</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-red-600">Critical</Badge></td>
                        <td className="border border-slate-300 p-2">POD required for invoicing</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-FIN-002</td>
                        <td className="border border-slate-300 p-2">System shall track AR aging (current, 30, 60, 90+ days)</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-orange-600">High</Badge></td>
                        <td className="border border-slate-300 p-2">Automated aging calculation</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-FIN-003</td>
                        <td className="border border-slate-300 p-2">System shall process carrier settlements</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-red-600">Critical</Badge></td>
                        <td className="border border-slate-300 p-2">Deductions itemized</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-FIN-004</td>
                        <td className="border border-slate-300 p-2">System shall integrate with QuickBooks for GL sync</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-yellow-600">Medium</Badge></td>
                        <td className="border border-slate-300 p-2">Bi-directional sync</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* FR-SYNC */}
                <div className="border-l-4 border-purple-600 pl-4">
                  <h3 className="text-lg font-bold text-purple-900">FR-SYNC: Bidirectional Sync Module</h3>
                  
                  <table className="w-full mt-4 border-collapse border border-slate-300 text-sm">
                    <thead>
                      <tr className="bg-purple-50">
                        <th className="border border-slate-300 p-2">ID</th>
                        <th className="border border-slate-300 p-2">Requirement</th>
                        <th className="border border-slate-300 p-2">Priority</th>
                        <th className="border border-slate-300 p-2">Validation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-SYNC-001</td>
                        <td className="border border-slate-300 p-2">System shall sync Load, Driver, Document, ComplianceItem between TMS-A and TMS-B</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-red-600">Critical</Badge></td>
                        <td className="border border-slate-300 p-2">Field-level sync</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-SYNC-002</td>
                        <td className="border border-slate-300 p-2">System shall resolve conflicts using configurable strategies (latest_wins, tms_a_wins, broker_authority)</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-red-600">Critical</Badge></td>
                        <td className="border border-slate-300 p-2">No data loss</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-SYNC-003</td>
                        <td className="border border-slate-300 p-2">System shall log all sync operations in SyncLog</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-orange-600">High</Badge></td>
                        <td className="border border-slate-300 p-2">Complete audit trail</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">FR-SYNC-004</td>
                        <td className="border border-slate-300 p-2">System shall sync automatically every 30 seconds</td>
                        <td className="border border-slate-300 p-2"><Badge className="bg-orange-600">High</Badge></td>
                        <td className="border border-slate-300 p-2">Configurable interval</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 3: Non-Functional Requirements */}
        {activeSection === "nonfunctional" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>3. Non-Functional Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="grid md:grid-cols-2 gap-6">
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-3">NFR-PERF: Performance</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Page load time: ≤ 2 seconds</li>
                      <li>• API response time: ≤ 500ms (95th percentile)</li>
                      <li>• Concurrent users: 1,000+</li>
                      <li>• Load capacity: 100,000+ active loads</li>
                      <li>• Search response: ≤ 1 second</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h4 className="font-bold text-emerald-900 mb-3">NFR-AVAIL: Availability</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Uptime SLA: 99.9%</li>
                      <li>• Planned maintenance window: ≤ 4 hours/month</li>
                      <li>• RTO (Recovery Time Objective): ≤ 4 hours</li>
                      <li>• RPO (Recovery Point Objective): ≤ 1 hour</li>
                      <li>• Failover time: ≤ 5 minutes</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-bold text-purple-900 mb-3">NFR-SCALE: Scalability</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Horizontal scaling supported</li>
                      <li>• Multi-tenant architecture</li>
                      <li>• Database sharding ready</li>
                      <li>• CDN for static assets</li>
                      <li>• Auto-scaling based on load</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-bold text-red-900 mb-3">NFR-SEC: Security</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• TLS 1.2+ for all connections</li>
                      <li>• AES-256 encryption at rest</li>
                      <li>• Role-based access control (RBAC)</li>
                      <li>• MFA support</li>
                      <li>• Session timeout: 30 minutes</li>
                      <li>• Password policy: 12+ chars, complexity required</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-bold text-orange-900 mb-3">NFR-COMPLY: Compliance</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• FMCSA 371.3 record retention</li>
                      <li>• SOC 2 Type II ready</li>
                      <li>• GDPR data subject rights</li>
                      <li>• CCPA compliance</li>
                      <li>• Audit logging for 7 years</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-cyan-50 rounded-lg">
                    <h4 className="font-bold text-cyan-900 mb-3">NFR-USE: Usability</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Mobile-responsive design</li>
                      <li>• WCAG 2.1 AA accessibility</li>
                      <li>• Keyboard navigation support</li>
                      <li>• Multi-language support ready</li>
                      <li>• Offline mode for mobile app</li>
                    </ul>
                  </div>

                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 4: Data Model */}
        {activeSection === "datamodel" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>4. Data Model Specification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <h3 className="font-bold text-lg">4.1 Core Entities</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-300 text-sm">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2">Entity</th>
                        <th className="border border-slate-300 p-2">Key Fields</th>
                        <th className="border border-slate-300 p-2">Relationships</th>
                        <th className="border border-slate-300 p-2">Sync Fields</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">Load</td>
                        <td className="border border-slate-300 p-2">load_number, status, pickup_location, dropoff_location, customer_rate, carrier_pay</td>
                        <td className="border border-slate-300 p-2">→ Driver, → Carrier, → Shipper, → Documents</td>
                        <td className="border border-slate-300 p-2">status, dates, rates, check_calls</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">Driver</td>
                        <td className="border border-slate-300 p-2">first_name, last_name, cdl_number, cdl_expiration, medical_card_expiration, hos_remaining</td>
                        <td className="border border-slate-300 p-2">→ Party, → Loads, → ComplianceItems</td>
                        <td className="border border-slate-300 p-2">status, location, HOS, equipment</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">Carrier</td>
                        <td className="border border-slate-300 p-2">company_name, mc_number, dot_number, insurance_expiration, safety_rating</td>
                        <td className="border border-slate-300 p-2">→ Loads, → Drivers, → Contracts</td>
                        <td className="border border-slate-300 p-2">status, compliance</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">Document</td>
                        <td className="border border-slate-300 p-2">document_type, file_url, extracted_data, verified</td>
                        <td className="border border-slate-300 p-2">→ Load</td>
                        <td className="border border-slate-300 p-2">file_url, extracted_data, verified</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">ComplianceItem</td>
                        <td className="border border-slate-300 p-2">compliance_type, status, expiration_date, entity_type, entity_id</td>
                        <td className="border border-slate-300 p-2">→ Driver/Carrier/Vehicle</td>
                        <td className="border border-slate-300 p-2">status, expiration, alerts</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">LaneRate</td>
                        <td className="border border-slate-300 p-2">origin, destination, customer_rate, carrier_rate, driver_rate, status</td>
                        <td className="border border-slate-300 p-2">→ Driver, → Carrier</td>
                        <td className="border border-slate-300 p-2">driver_rate, acceptance</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">SyncLog</td>
                        <td className="border border-slate-300 p-2">entity_type, entity_id, sync_direction, sync_status, error_message</td>
                        <td className="border border-slate-300 p-2">→ Any entity</td>
                        <td className="border border-slate-300 p-2">N/A (audit only)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="font-bold text-lg mt-8">4.2 Entity Relationship Diagram</h3>
                <div className="bg-slate-50 p-6 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Shipper   │────<│    Load     │>────│   Carrier   │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                          │                    │
                    ┌─────┴─────┐        ┌─────┴─────┐
                    │           │        │           │
              ┌─────▼─────┐ ┌───▼───┐ ┌──▼──┐ ┌─────▼─────┐
              │  Document │ │ Stop  │ │Driver│ │ Contract  │
              └───────────┘ └───────┘ └──┬──┘ └───────────┘
                                        │
                                  ┌─────▼─────┐
                                  │Compliance │
                                  │   Item    │
                                  └───────────┘
                  `}</pre>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 5: Security */}
        {activeSection === "security" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>5. Security Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <h3 className="font-bold text-lg">5.1 Authentication & Authorization</h3>
                <table className="w-full border-collapse border border-slate-300 text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2">Role</th>
                      <th className="border border-slate-300 p-2">TMS-A Access</th>
                      <th className="border border-slate-300 p-2">TMS-B Access</th>
                      <th className="border border-slate-300 p-2">Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 p-2">Admin</td>
                      <td className="border border-slate-300 p-2">Full</td>
                      <td className="border border-slate-300 p-2">Full</td>
                      <td className="border border-slate-300 p-2">All operations, user management, settings</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">Broker</td>
                      <td className="border border-slate-300 p-2">Full</td>
                      <td className="border border-slate-300 p-2">Read-only</td>
                      <td className="border border-slate-300 p-2">Load CRUD, carrier vetting, invoicing</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">Dispatcher</td>
                      <td className="border border-slate-300 p-2">Limited</td>
                      <td className="border border-slate-300 p-2">Full</td>
                      <td className="border border-slate-300 p-2">Load assignment, driver management</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">Driver</td>
                      <td className="border border-slate-300 p-2">None</td>
                      <td className="border border-slate-300 p-2">Limited</td>
                      <td className="border border-slate-300 p-2">View assigned loads, upload docs, update status</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">Accounting</td>
                      <td className="border border-slate-300 p-2">Finance only</td>
                      <td className="border border-slate-300 p-2">Finance only</td>
                      <td className="border border-slate-300 p-2">Invoicing, settlements, reports</td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="font-bold text-lg mt-6">5.2 Data Classification</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                    <h4 className="font-bold text-red-900">🔴 Confidential</h4>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• SSN / Tax ID</li>
                      <li>• Bank account details</li>
                      <li>• API keys / secrets</li>
                      <li>• Passwords</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <h4 className="font-bold text-orange-900">🟠 Sensitive</h4>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Customer rates</li>
                      <li>• Carrier pay</li>
                      <li>• Margin data</li>
                      <li>• CDL numbers</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <h4 className="font-bold text-green-900">🟢 Internal</h4>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Load details</li>
                      <li>• Location data</li>
                      <li>• Status updates</li>
                      <li>• Documents (non-PII)</li>
                    </ul>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 6: Acceptance Criteria */}
        {activeSection === "acceptance" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>6. Acceptance Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="space-y-4">
                  
                  <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-600">
                    <h4 className="font-bold text-emerald-900">AC-001: Load Lifecycle</h4>
                    <p className="text-sm text-slate-700 mt-2">
                      <strong>Given</strong> a user creates a new load<br/>
                      <strong>When</strong> the load progresses through: available → tendered → assigned → dispatched → picked_up → in_transit → delivered → invoiced<br/>
                      <strong>Then</strong> all status transitions are logged, timestamps recorded, and notifications sent to relevant parties
                    </p>
                    <Badge className="mt-2 bg-emerald-600">✓ VERIFIED</Badge>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-600">
                    <h4 className="font-bold text-emerald-900">AC-002: Bidirectional Sync</h4>
                    <p className="text-sm text-slate-700 mt-2">
                      <strong>Given</strong> a load is updated in TMS-A<br/>
                      <strong>When</strong> the sync engine runs<br/>
                      <strong>Then</strong> the load is updated in TMS-B within 30 seconds with conflict resolution applied
                    </p>
                    <Badge className="mt-2 bg-emerald-600">✓ VERIFIED</Badge>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-600">
                    <h4 className="font-bold text-emerald-900">AC-003: Compliance Alerts</h4>
                    <p className="text-sm text-slate-700 mt-2">
                      <strong>Given</strong> a driver's CDL expires in 30 days<br/>
                      <strong>When</strong> the compliance monitor runs<br/>
                      <strong>Then</strong> an alert is generated and the driver cannot be assigned to new loads
                    </p>
                    <Badge className="mt-2 bg-emerald-600">✓ VERIFIED</Badge>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-600">
                    <h4 className="font-bold text-emerald-900">AC-004: Invoice Generation</h4>
                    <p className="text-sm text-slate-700 mt-2">
                      <strong>Given</strong> a load is marked as delivered with POD uploaded<br/>
                      <strong>When</strong> the user generates an invoice<br/>
                      <strong>Then</strong> the invoice includes all charges, accessorials, and is ready for export to QuickBooks
                    </p>
                    <Badge className="mt-2 bg-emerald-600">✓ VERIFIED</Badge>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-600">
                    <h4 className="font-bold text-emerald-900">AC-005: Document AI Processing</h4>
                    <p className="text-sm text-slate-700 mt-2">
                      <strong>Given</strong> a user uploads a BOL or POD document<br/>
                      <strong>When</strong> the AI processor runs<br/>
                      <strong>Then</strong> key fields (load number, shipper, consignee, weight) are extracted and linked to the correct load
                    </p>
                    <Badge className="mt-2 bg-emerald-600">✓ VERIFIED</Badge>
                  </div>

                </div>

              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}