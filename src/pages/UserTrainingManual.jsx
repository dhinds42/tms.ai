import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  Video,
  HelpCircle,
  Truck,
  Users,
  Radio,
  BarChart3,
  Shield,
  DollarSign,
  FileText,
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
  Lightbulb
} from "lucide-react";

export default function UserTrainingManual() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    getting_started: true,
    operating_modes: false,
    load_management: false,
    dispatch: false,
    analytics: false,
    compliance: false,
    financial: false,
    ai_tools: false,
    best_practices: false,
    troubleshooting: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    Object.keys(expandedSections).forEach(key => {
      allExpanded[key] = true;
    });
    setExpandedSections(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed = {};
    Object.keys(expandedSections).forEach(key => {
      allCollapsed[key] = false;
    });
    setExpandedSections(allCollapsed);
  };

  const manualSections = [
    {
      id: 'getting_started',
      title: 'Getting Started',
      icon: Zap,
      color: 'indigo',
      subsections: [
        {
          title: '1.1 Welcome to TMS.ai',
          content: `TMS.ai is a dual-mode Transportation Management System designed for both brokers and carriers. This AI-native platform streamlines freight operations, dispatch, compliance, and financial management with powerful automation and real-time insights.`
        },
        {
          title: '1.2 System Requirements',
          content: `• Modern web browser (Chrome, Firefox, Safari, Edge)
• Stable internet connection
• Admin credentials for initial setup
• Recommended: 1920x1080 resolution or higher`
        },
        {
          title: '1.3 First Login',
          content: `1. Navigate to your TMS.ai URL
2. Enter your email and password
3. Complete two-factor authentication if enabled
4. Select your operating mode (Broker or Carrier)
5. Review the dashboard overview`
        },
        {
          title: '1.4 Navigation Overview',
          content: `• Left Sidebar: Main navigation menu organized by function
• Top Bar: Quick search, notifications, and user settings
• Dashboard: Key metrics and recent activity
• Mode Toggle: Switch between Broker and Carrier modes`
        }
      ]
    },
    {
      id: 'operating_modes',
      title: 'Operating Modes: Broker vs Carrier',
      icon: Radio,
      color: 'purple',
      subsections: [
        {
          title: '2.1 Broker Mode',
          content: `**Purpose**: Manage customer relationships, tender loads to carriers, and broker freight.

**Key Features**:
• Customer/Shipper CRM and management
• Carrier network and procurement
• Load tendering and carrier selection
• Rate negotiation and margin tracking
• Multi-carrier operations
• Customer invoicing and AR management

**Who Uses It**: Freight brokers, 3PLs, freight forwarders`
        },
        {
          title: '2.2 Carrier Mode',
          content: `**Purpose**: Manage your fleet, drivers, and asset-based operations.

**Key Features**:
• Driver management and scheduling
• Owner operator management
• Fleet and equipment tracking
• Direct customer operations
• Driver pay and settlements
• Maintenance and compliance tracking
• HOS and safety management

**Who Uses It**: Asset-based carriers, trucking companies, owner-operators`
        },
        {
          title: '2.3 Switching Modes',
          content: `To switch between Broker and Carrier modes:

1. Locate the "Operating Mode" toggle in the left sidebar (below TMS.ai logo)
2. Click the toggle button
3. Confirm mode switch if prompted
4. The system will reload with mode-specific features
5. Your preference is saved automatically

**Note**: Some features are shared between modes, while others are mode-specific.`
        },
        {
          title: '2.4 Dual Operations',
          content: `If your company operates as both a broker and carrier:

• Use Broker Mode for brokered freight
• Use Carrier Mode for asset-based operations
• Data syncs between modes automatically
• Separate dashboards for each operation type
• Unified financial reporting available`
        }
      ]
    },
    {
      id: 'load_management',
      title: 'Load Management',
      icon: Truck,
      color: 'blue',
      subsections: [
        {
          title: '3.1 Creating a Load',
          content: `**From Load Board**:
1. Click "Create Load" button
2. Enter pickup and delivery locations
3. Select equipment type and service level
4. Add commodity, weight, and dimensions
5. Set pickup/delivery dates and times
6. Enter customer rate and carrier pay (broker mode)
7. Add special instructions or requirements
8. Save or Save & Dispatch

**Quick Tip**: Use Load Templates for recurring lanes to save time.`
        },
        {
          title: '3.2 Load Status Workflow',
          content: `**Status Progression**:
1. **Available** → New load, needs assignment
2. **Tendered** → Sent to carrier (broker mode)
3. **Assigned** → Driver/carrier assigned
4. **Dispatched** → Confirmed and ready for pickup
5. **Picked Up** → Freight collected from shipper
6. **In Transit** → En route to destination
7. **Delivered** → Freight delivered
8. **Invoiced** → Ready for billing
9. **Closed** → Payment complete

**Status Tabs**: Use the Load Board tabs to filter by status (Active, Planning, Accounting, etc.)`
        },
        {
          title: '3.3 Load Board Tabs Explained',
          content: `• **Active**: Loads in motion (Dispatched, In Transit, Picked Up)
• **Planning**: Loads being scheduled (Available, Tendered, Booked)
• **Accounting**: Delivered loads ready for invoicing/payment
• **Misc**: Cancelled or special status loads
• **LTL**: Less-than-truckload shipments
• **My Loads**: Loads you created or are responsible for
• **External**: Loads posted to third-party load boards
• **All**: Complete view of every load`
        },
        {
          title: '3.4 Load Actions & Shortcuts',
          content: `**Three-Dot Menu on Each Load**:
• Edit Load → Modify load details
• View Docs → See BOL, POD, rate con
• Request Docs → Ask driver to upload missing docs
• Send Tracking → Email tracking link to customer
• Log Check Call → Record driver communication
• Post to Load Boards → Advertise on DAT, Truckstop, etc.
• Assign Driver/Carrier → Dispatch the load
• Copy Load → Duplicate for similar shipment
• Archive/Cancel → Remove from active view`
        },
        {
          title: '3.5 Bulk Actions',
          content: `Select multiple loads using checkboxes to:
• Bulk status update
• Bulk document request
• Export to CSV/Excel
• Send mass tracking updates
• Post multiple loads to load boards
• Bulk archive

**Tip**: Use filters to narrow results before bulk selection.`
        },
        {
          title: '3.6 Load Templates',
          content: `Save time on recurring lanes:

1. Navigate to Load Templates page
2. Click "Create Template"
3. Fill in standard load details
4. Name your template (e.g., "Chicago to Dallas - USS Steel")
5. Save template

**Using Templates**:
• From Load Board: "Create from Template"
• Select template and adjust dates
• System pre-fills all saved details`
        }
      ]
    },
    {
      id: 'dispatch',
      title: 'Dispatch & Operations',
      icon: Radio,
      color: 'emerald',
      subsections: [
        {
          title: '4.1 Dispatch Console',
          content: `The Dispatch Console provides real-time visibility into active operations.

**Features**:
• Live load tracking map
• Driver availability dashboard
• Check call management
• ETAs and delivery windows
• Alert notifications for delays or issues
• Quick communication tools (SMS, email, app)

**Best Practice**: Check the console every 2-4 hours for active loads.`
        },
        {
          title: '4.2 Assigning Drivers (Carrier Mode)',
          content: `**Manual Assignment**:
1. Open load details
2. Click "Assign Driver"
3. View available drivers with HOS, location, and status
4. Select driver and confirm
5. System sends load details to driver app

**AI-Powered Assignment**:
• Use Dispatch Optimization AI for smart recommendations
• System considers location, HOS, equipment, and preferences
• One-click acceptance of AI recommendation`
        },
        {
          title: '4.3 Tendering to Carriers (Broker Mode)',
          content: `**Manual Tendering**:
1. Open load details
2. Click "Assign Carrier"
3. Search or filter carrier network
4. Review carrier score, rates, and availability
5. Send tender with rate confirmation

**Automated Tendering**:
• TenderBot automatically matches and tenders loads
• Configure rules in Settings → Automation
• Monitor tender acceptance rates
• Auto-escalation if tender declined`
        },
        {
          title: '4.4 Check Calls',
          content: `Stay updated on load progress:

1. Click "Log Check Call" on load
2. Record current location, status, and ETA
3. Note any issues or delays
4. System timestamps and logs automatically
5. View full check call history in load details

**Frequency**: Every 4-6 hours for active loads, or per customer requirements.`
        },
        {
          title: '4.5 Real-Time Tracking',
          content: `Track loads in real-time using:
• GPS integration with driver mobile app
• ELD data synchronization
• Geofencing and milestone alerts
• Customer tracking portal links
• Rosie AI for predictive ETAs and delay detection

**Tip**: Enable auto-tracking to reduce manual check calls.`
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      icon: BarChart3,
      color: 'cyan',
      subsections: [
        {
          title: '5.1 Dashboard Overview',
          content: `Your main dashboard displays:
• Total loads (active, planning, completed)
• Revenue and margin trends
• Top customers and lanes
• Driver/carrier performance
• Compliance alerts
• Financial summaries

**Customization**: Click gear icon to customize dashboard widgets.`
        },
        {
          title: '5.2 Analytics Dashboard',
          content: `Access advanced analytics:

**Key Metrics**:
• Revenue per mile
• Margin by lane, customer, or carrier
• On-time delivery percentage
• Load volume trends
• Deadhead miles
• Cost per load

**Time Ranges**: Toggle between daily, weekly, monthly, quarterly, or custom ranges.`
        },
        {
          title: '5.3 Predictive Analytics',
          content: `AI-powered forecasting for:
• Revenue projections
• Demand prediction by lane
• Rate volatility analysis
• Carrier performance prediction
• Seasonal trends

**Use Case**: Plan capacity and negotiate contracts using predictive insights.`
        },
        {
          title: '5.4 Reports',
          content: `Generate comprehensive reports:

**Available Reports**:
• Load reports (by status, customer, date range)
• Financial reports (P&L, AR/AP aging)
• Carrier performance reports
• Driver scorecards
• Commission reports
• IFTA fuel tax reports
• Lane profitability reports
• KPI summaries

**Export Options**: PDF, Excel, CSV`
        },
        {
          title: '5.5 Industry Benchmarking',
          content: `Compare your performance against industry standards:
• Average rates by lane
• On-time delivery benchmarks
• Cost per mile industry averages
• Margin benchmarks by segment

**Privacy Note**: Your data is anonymized and aggregated.`
        }
      ]
    },
    {
      id: 'compliance',
      title: 'Compliance & Safety',
      icon: Shield,
      color: 'red',
      subsections: [
        {
          title: '6.1 Carrier Compliance (Broker Mode)',
          content: `**Monitor carrier compliance**:
• MC/DOT authority status
• Insurance coverage (Auto, Cargo, General Liability)
• Safety ratings and CSA scores
• W-9 and tax documents
• Contract agreements

**Automated Alerts**:
• Insurance expiration warnings
• Authority revocation notifications
• Safety score changes
• Document expiration reminders

**FMCSA 371.3 Compliance**: System ensures you meet broker due diligence requirements.`
        },
        {
          title: '6.2 Driver Compliance (Carrier Mode)',
          content: `**Track driver credentials**:
• CDL license and expiration
• Medical card validity
• Drug consortium enrollment
• MVR (Motor Vehicle Record)
• Training certifications
• Endorsements (Hazmat, Tanker, etc.)

**Compliance Dashboard**: View all drivers with expiring documents in one place.`
        },
        {
          title: '6.3 HOS (Hours of Service)',
          content: `**For Carriers**:
• ELD integration for automatic HOS tracking
• Real-time hours remaining
• Violation alerts and prevention
• Driver availability based on HOS
• DOT audit-ready reports

**Regulations**: System supports both Property (70/8) and Passenger (60/7) rules.`
        },
        {
          title: '6.4 Safety Management',
          content: `Track and improve safety:
• Incident logging and reporting
• Safety scores by driver
• Pre-trip and post-trip inspections
• Vehicle inspection reports
• Accident investigation forms
• CSA point tracking

**Goal**: Maintain safety scores above 80 for optimal carrier selection.`
        },
        {
          title: '6.5 Hazmat Compliance',
          content: `For hazardous materials shipments:
• Proper classification and labeling
• Driver endorsement verification
• Placarding requirements
• Emergency response info
• Hazmat training records
• DOT Hazmat declaration forms

**Warning**: System flags hazmat loads requiring special handling.`
        }
      ]
    },
    {
      id: 'financial',
      title: 'Financial Management',
      icon: DollarSign,
      color: 'green',
      subsections: [
        {
          title: '7.1 Invoicing',
          content: `**Create Customer Invoices**:
1. Navigate to Invoicing page
2. Select delivered loads
3. Review line items and accessorials
4. Generate invoice (auto-populated from load)
5. Send via email or download PDF
6. Track payment status (Sent, Partial, Paid, Overdue)

**Automation**: Enable auto-invoicing for delivered loads in Settings.`
        },
        {
          title: '7.2 Accounting Dashboard',
          content: `**Accounts Receivable (AR)**:
• Outstanding invoices
• Aging reports (30, 60, 90+ days)
• Payment tracking
• Credit management

**Accounts Payable (AP)**:
• Carrier pay pending
• Driver settlements
• Fuel card expenses
• Vendor bills

**Integration**: Sync with QuickBooks, Xero, or other accounting software.`
        },
        {
          title: '7.3 Settlements (Carrier Mode)',
          content: `**Pay Drivers and Owner Operators**:
1. Go to Settlement Management
2. Select pay period (weekly, bi-weekly)
3. Review loads completed by each driver
4. Calculate pay based on rate structure (% of load, per mile, flat rate)
5. Deduct fuel advances, tolls, or other expenses
6. Generate settlement statement
7. Process payment (direct deposit, check, or wire)

**Driver Portal**: Drivers can view their settlements in real-time.`
        },
        {
          title: '7.4 Commission Management (Broker Mode)',
          content: `**Track Sales Commissions**:
• Configure commission rules (% of margin, tiered)
• Assign sales reps to customers or loads
• Auto-calculate commissions on completed loads
• Generate commission reports
• Export to payroll

**Commission Structures**: Flat rate, percentage, tiered, or custom formulas.`
        },
        {
          title: '7.5 QuickBooks Integration',
          content: `**Sync Financial Data**:
1. Navigate to Settings → Integrations
2. Connect QuickBooks account
3. Map TMS accounts to QuickBooks chart of accounts
4. Enable auto-sync (invoices, bills, payments)
5. Reconcile transactions

**Supported**: QuickBooks Online and QuickBooks Desktop.`
        },
        {
          title: '7.6 Factoring',
          content: `Manage factoring relationships:
• Connect factoring company integration
• Auto-send invoices to factor
• Track advanced funds
• Reconcile factor fees
• View net payments

**Supported Factoring Companies**: Contact support for integration list.`
        }
      ]
    },
    {
      id: 'ai_tools',
      title: 'AI-Powered Tools',
      icon: Zap,
      color: 'purple',
      subsections: [
        {
          title: '8.1 Smart Load Matching',
          content: `AI automatically matches available loads to best-fit carriers/drivers:

**How It Works**:
• Analyzes load requirements (equipment, weight, distance)
• Evaluates carrier/driver availability, location, and performance
• Calculates cost and margin optimization
• Ranks recommendations by best fit

**Usage**: Click "AI Match" on any available load for instant recommendations.`
        },
        {
          title: '8.2 Rate Negotiation AI',
          content: `Get AI-powered rate recommendations:

**Features**:
• Market rate intelligence from DAT, Truckstop
• Historical lane analysis
• Margin optimization suggestions
• Negotiation talking points
• Competitive positioning

**Tip**: Use before quoting or tendering to ensure competitive rates.`
        },
        {
          title: '8.3 Document AI',
          content: `Intelligent document processing:

**Capabilities**:
• Auto-extract data from BOL, POD, invoices
• OCR for handwritten documents
• Document classification and routing
• Compliance document verification
• Missing document alerts

**Upload**: Drag-and-drop or email documents to docs@[yourcompany].tms.ai`
        },
        {
          title: '8.4 Predictive ETA (Rosie)',
          content: `Rosie AI provides accurate delivery predictions:

**Features**:
• Real-time ETA updates using GPS and traffic data
• Delay prediction and root cause analysis
• Proactive customer notifications
• Alternative route suggestions
• Weather and road event monitoring

**Accuracy**: 95%+ ETA accuracy within 30-minute window.`
        },
        {
          title: '8.5 Dispatch Optimization AI',
          content: `Optimize your dispatch decisions:

**Optimization Factors**:
• Driver location and hours
• Equipment availability
• Lane profitability
• Backhaul opportunities
• Customer priorities
• Fuel efficiency

**Result**: Up to 15% reduction in empty miles and 10% margin improvement.`
        },
        {
          title: '8.6 TenderBot',
          content: `Automated load tendering:

**Setup**:
1. Define carrier preferences by lane
2. Set rate thresholds and margins
3. Configure tender escalation rules
4. Enable auto-tender

**Operation**: TenderBot tenders loads to carriers automatically, escalates if declined, and notifies you of acceptance.`
        }
      ]
    },
    {
      id: 'best_practices',
      title: 'Best Practices',
      icon: Target,
      color: 'amber',
      subsections: [
        {
          title: '9.1 Daily Workflows',
          content: `**Morning Routine**:
1. Check Dashboard for alerts and KPIs
2. Review Active Loads tab for in-transit shipments
3. Log check calls for loads due today
4. Monitor Dispatch Console for delays
5. Address compliance expirations

**Throughout Day**:
• Respond to driver/carrier messages within 1 hour
• Update load statuses as they change
• Document any issues or exceptions

**End of Day**:
• Review Planning tab for tomorrow's pickups
• Confirm appointments and driver assignments
• Send customer tracking updates`
        },
        {
          title: '9.2 Load Documentation',
          content: `**Critical Documents**:
• **BOL (Bill of Lading)**: Upload within 2 hours of pickup
• **POD (Proof of Delivery)**: Upload within 24 hours of delivery
• **Rate Confirmation**: Before dispatch
• **Signed Contracts**: Before first load

**Document Tips**:
• Use mobile app for instant photo upload
• Enable auto-extraction to save time
• Review extracted data for accuracy
• Maintain proper file naming conventions`
        },
        {
          title: '9.3 Communication Standards',
          content: `**Customer Communication**:
• Confirm pickup/delivery appointments 24 hours in advance
• Send tracking links immediately after dispatch
• Proactive delay notifications (before customer asks)
• POD delivery within 24 hours of completion

**Driver/Carrier Communication**:
• Check calls every 4-6 hours on active loads
• Use SMS for quick updates, email for detailed instructions
• Document all conversations in load notes
• Respond to driver inquiries within 1 hour`
        },
        {
          title: '9.4 Data Quality',
          content: `Maintain accurate data for reliable analytics:

**Load Data**:
• Complete addresses with zip codes
• Accurate weights and dimensions
• Correct equipment type selection
• Detailed commodity descriptions

**Contact Data**:
• Current phone numbers and emails
• Valid MC/DOT numbers
• Up-to-date insurance certificates

**Tip**: Use USPS Address Validation tool to verify addresses before dispatch.`
        },
        {
          title: '9.5 Security & Access Control',
          content: `**User Management**:
• Assign role-based permissions (Admin, Dispatcher, Accounting, etc.)
• Use least-privilege principle
• Review user access quarterly
• Disable accounts immediately upon termination

**Data Security**:
• Use strong passwords (12+ characters)
• Enable two-factor authentication
• Don't share login credentials
• Log out on shared devices

**Audit Trail**: System logs all actions for compliance and troubleshooting.`
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting & FAQs',
      icon: HelpCircle,
      color: 'slate',
      subsections: [
        {
          title: '10.1 Common Issues',
          content: `**Issue**: Load not appearing on Load Board
**Solution**: Check status filters and search terms. Try "All" tab.

**Issue**: Driver not receiving load details
**Solution**: Verify driver has mobile app installed and is logged in. Check driver email/phone in profile.

**Issue**: Document not uploading
**Solution**: Check file size (max 10MB) and format (PDF, JPG, PNG). Try refreshing page.

**Issue**: ETA not updating
**Solution**: Ensure driver has GPS enabled on mobile app. Check internet connection.

**Issue**: Invoice not generating
**Solution**: Verify load status is "Delivered" and all required fields are complete (BOL, POD, rates).`
        },
        {
          title: '10.2 Performance Optimization',
          content: `**If system feels slow**:
• Clear browser cache and cookies
• Close unnecessary browser tabs
• Check internet connection speed
• Try different browser (Chrome recommended)
• Disable browser extensions temporarily

**Large Data Sets**:
• Use date filters to limit results
• Export large reports instead of viewing in browser
• Archive old loads (90+ days) to improve performance`
        },
        {
          title: '10.3 Mobile App Issues',
          content: `**Driver Mobile App**:
• Ensure latest version installed (check app store)
• Grant location permissions for GPS tracking
• Enable push notifications for load updates
• Check data/wifi connection
• Force close and restart app if frozen

**Offline Mode**: App caches data for viewing offline, but syncs when back online.`
        },
        {
          title: '10.4 Integration Problems',
          content: `**QuickBooks Sync**:
• Re-authenticate connection in Settings
• Verify API permissions in QuickBooks admin
• Check for duplicate invoice numbers

**ELD Integration**:
• Confirm ELD provider is supported
• Verify API credentials are current
• Contact ELD provider for connection issues

**Load Board Posting**:
• Validate DAT/Truckstop credentials
• Ensure load has all required fields
• Check for posting errors in notification center`
        },
        {
          title: '10.5 Getting Help',
          content: `**Support Resources**:
• **Help Center**: help.tms.ai (searchable knowledge base)
• **Video Tutorials**: Available in each module (click video icon)
• **Live Chat**: Click chat icon in bottom right (9am-6pm EST)
• **Email Support**: support@tms.ai (24-hour response time)
• **Phone Support**: 1-800-TMS-HELP (emergency/urgent only)

**Community**:
• User forums for tips and best practices
• Monthly webinars for new features
• Annual user conference

**When Contacting Support**:
• Provide load number or user ID
• Describe what you were trying to do
• Include screenshots if possible
• Mention any error messages`
        }
      ]
    }
  ];

  const filteredSections = manualSections.filter(section => {
    if (searchTerm === '') return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      section.title.toLowerCase().includes(searchLower) ||
      section.subsections.some(sub =>
        sub.title.toLowerCase().includes(searchLower) ||
        sub.content.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            TMS.ai User Training Manual
          </h1>
          <p className="text-slate-600 mt-2">Complete guide to the dual-mode TMS platform</p>
          <Badge className="mt-3 bg-indigo-600">Version 2.0 - January 2025</Badge>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={expandAll} variant="outline" size="sm">
            <ChevronDown className="w-4 h-4 mr-2" />
            Expand All
          </Button>
          <Button onClick={collapseAll} variant="outline" size="sm">
            <ChevronRight className="w-4 h-4 mr-2" />
            Collapse All
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Video className="w-4 h-4 mr-2" />
            Video Tutorials
          </Button>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search the manual..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 focus:border-indigo-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {manualSections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.id}
                    variant="outline"
                    className="justify-start text-left h-auto py-3"
                    onClick={() => toggleSection(section.id)}
                  >
                    <Icon className={`w-4 h-4 mr-2 text-${section.color}-600`} />
                    <div>
                      <p className="font-semibold text-sm">{idx + 1}. {section.title}</p>
                      <p className="text-xs text-slate-500">{section.subsections.length} topics</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Manual Sections */}
        {filteredSections.map((section, idx) => {
          const Icon = section.icon;
          const isExpanded = expandedSections[section.id];

          return (
            <Card key={section.id} className="border-0 shadow-xl">
              <CardHeader
                className="cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-${section.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${section.color}-600`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {idx + 1}. {section.title}
                      </CardTitle>
                      <p className="text-sm text-slate-600">{section.subsections.length} topics</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-6 pt-0">
                  {section.subsections.map((subsection) => (
                    <div key={subsection.title} className="border-l-4 border-l-indigo-600 pl-4 py-2">
                      <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        {subsection.title}
                      </h3>
                      <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {subsection.content}
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}

        {filteredSections.length === 0 && (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-600">Try different search terms</p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold mb-1">Need More Help?</h3>
                <p className="text-indigo-100 text-sm">Contact support or join our community</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  support@tms.ai
                </Button>
                <Button variant="secondary" size="sm">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Live Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              Quick Reference Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-bold text-slate-900 mb-2">📞 Support Hotline</h4>
                <p className="text-sm text-slate-600">1-800-TMS-HELP</p>
                <p className="text-xs text-slate-500 mt-1">Available 24/7 for urgent issues</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-bold text-slate-900 mb-2">📧 Email Support</h4>
                <p className="text-sm text-slate-600">support@tms.ai</p>
                <p className="text-xs text-slate-500 mt-1">24-hour response time</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-bold text-slate-900 mb-2">🎓 Training Webinars</h4>
                <p className="text-sm text-slate-600">Every Tuesday at 2 PM EST</p>
                <p className="text-xs text-slate-500 mt-1">Free for all users</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-bold text-slate-900 mb-2">💬 Community Forum</h4>
                <p className="text-sm text-slate-600">community.tms.ai</p>
                <p className="text-xs text-slate-500 mt-1">Tips, tricks, and best practices</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}