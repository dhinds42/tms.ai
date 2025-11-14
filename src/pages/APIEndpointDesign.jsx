import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Terminal, Zap, Lock, GitBranch, Database, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function APIEndpointDesign() {
  const [searchTerm, setSearchTerm] = useState("");

  const apiSections = [
    {
      category: "Auth & Users",
      icon: "🔐",
      color: "indigo",
      endpoints: [
        {
          method: "POST",
          path: "/auth/login",
          description: "User authentication",
          request: { email: "string", password: "string" },
          response: { access_token: "JWT", refresh_token: "JWT", user: "User", permissions: "[]" }
        },
        {
          method: "GET",
          path: "/auth/me",
          description: "Get current user profile",
          auth: true,
          response: { user_id: "UUID", email: "string", role: "string", permissions: "[]" }
        },
        {
          method: "POST",
          path: "/auth/logout",
          description: "Logout current session",
          auth: true
        },
        {
          method: "GET",
          path: "/users",
          description: "List users (admin only)",
          auth: true,
          params: ["role", "department", "status"],
          response: "User[]"
        },
        {
          method: "POST",
          path: "/users",
          description: "Create new user",
          auth: true,
          request: { email: "string", role: "string", department: "string" }
        }
      ]
    },
    {
      category: "Organizations & Parties",
      icon: "🏢",
      color: "purple",
      endpoints: [
        {
          method: "GET",
          path: "/organizations",
          description: "Search organizations (customers, carriers, vendors)",
          auth: true,
          params: ["org_type", "name", "mc_number", "dot_number", "status"],
          response: "Organization[]"
        },
        {
          method: "POST",
          path: "/organizations",
          description: "Create new organization",
          auth: true,
          request: { org_type: "enum", legal_name: "string", mc_number: "string", address: "object" }
        },
        {
          method: "GET",
          path: "/organizations/{id}",
          description: "Get organization details with relationships",
          auth: true,
          response: { org: "Organization", customers: "[]", carriers: "[]", compliance: "[]" }
        },
        {
          method: "GET",
          path: "/customers",
          description: "List customers with filters",
          auth: true,
          params: ["account_manager_id", "credit_status", "search"],
          response: "Customer[]"
        },
        {
          method: "GET",
          path: "/carriers",
          description: "List carriers with compliance status",
          auth: true,
          params: ["onboarding_status", "compliance_status", "equipment_type", "operating_region"],
          response: "Carrier[]"
        },
        {
          method: "PUT",
          path: "/carriers/{id}/compliance",
          description: "Update carrier compliance status",
          auth: true,
          request: { compliance_status: "enum", notes: "string" }
        }
      ]
    },
    {
      category: "Loads, Legs & Stops (Core TMS)",
      icon: "🚛",
      color: "emerald",
      endpoints: [
        {
          method: "GET",
          path: "/loads",
          description: "List loads with advanced filtering",
          auth: true,
          params: ["status", "customer_id", "date_range", "origin_state", "destination_state", "mode", "equipment_type", "assigned_to_user_id"],
          response: { loads: "Load[]", total: "number", page: "number" }
        },
        {
          method: "POST",
          path: "/loads",
          description: "Create new load with stops and commodities",
          auth: true,
          request: {
            customer_id: "UUID",
            mode: "enum",
            equipment_type: "enum",
            stops: [{ stop_type: "enum", location_id: "UUID", appointment: "object" }],
            commodities: [{ description: "string", weight_lbs: "number" }],
            rating: { rate_basis: "enum", linehaul_revenue: "number" }
          },
          response: { load_id: "UUID", load_number: "string" }
        },
        {
          method: "GET",
          path: "/loads/{id}",
          description: "Get full load details with legs, stops, tracking",
          auth: true,
          response: {
            load: "Load",
            legs: "LoadLeg[]",
            stops: "Stop[]",
            commodities: "Commodity[]",
            tracking: "TrackingEvent[]",
            documents: "Document[]",
            financials: { revenue: "number", cost: "number", margin: "number" }
          }
        },
        {
          method: "POST",
          path: "/loads/{id}/legs",
          description: "Create leg (for splits, transfers, multi-carrier)",
          auth: true,
          request: {
            sequence_number: "number",
            origin_location_id: "UUID",
            destination_location_id: "UUID",
            assigned_carrier_party_id: "UUID (broker)",
            driver_id: "UUID (carrier)",
            commodities: "Commodity[]"
          }
        },
        {
          method: "PUT",
          path: "/loads/{id}/legs/{leg_id}",
          description: "Update leg assignment, status, times",
          auth: true,
          request: { status: "enum", actual_start_datetime: "ISO8601", actual_miles: "number" }
        },
        {
          method: "POST",
          path: "/loads/{id}/stops",
          description: "Add stop (pickup/delivery/transfer/reconsignment)",
          auth: true,
          request: {
            stop_type: "enum",
            location_id: "UUID",
            sequence_number: "number",
            appointment_type: "enum",
            appointment_start: "ISO8601"
          }
        },
        {
          method: "PUT",
          path: "/loads/{id}/stops/{stop_id}",
          description: "Update stop times, status, POD",
          auth: true,
          request: { arrival_time_actual: "ISO8601", signed_pod_document_id: "UUID" }
        }
      ]
    },
    {
      category: "Load Operations (Splits, Transfers, Reconsignment)",
      icon: "⚙️",
      color: "amber",
      endpoints: [
        {
          method: "POST",
          path: "/loads/{id}/operations/split",
          description: "Split load into multiple legs/carriers",
          auth: true,
          request: {
            split_strategy: "enum (by_weight, by_commodity, by_destination)",
            legs: [{
              origin_location_id: "UUID",
              destination_location_id: "UUID",
              assigned_carrier_party_id: "UUID",
              commodities: [{ commodity_id: "UUID", weight_lbs: "number" }]
            }]
          },
          response: { load_id: "UUID", legs_created: "LoadLeg[]" }
        },
        {
          method: "POST",
          path: "/loads/{id}/operations/transfer",
          description: "Create transfer/crossdock operation",
          auth: true,
          request: {
            transfer_location_id: "UUID",
            inbound_leg_id: "UUID",
            outbound_carrier_party_id: "UUID",
            transfer_type: "enum (crossdock, intermodal, transload)"
          }
        },
        {
          method: "POST",
          path: "/loads/{id}/operations/reconsign",
          description: "Change destination mid-transit",
          auth: true,
          request: {
            new_destination_location_id: "UUID",
            new_delivery_datetime: "ISO8601",
            reconsignment_fee: "number",
            reason: "string"
          },
          response: { stops_updated: "Stop[]", route_plan_updated: "boolean" }
        },
        {
          method: "POST",
          path: "/loads/{id}/operations/drop-trailer",
          description: "Drop or hook trailer at location",
          auth: true,
          request: {
            leg_id: "UUID",
            trailer_id: "UUID",
            location_id: "UUID",
            yard_slot_id: "UUID?",
            action: "enum (drop, hook)"
          }
        }
      ]
    },
    {
      category: "Rating & Finance",
      icon: "💰",
      color: "green",
      endpoints: [
        {
          method: "POST",
          path: "/loads/{id}/rate",
          description: "Calculate rate with fuel surcharge & accessorials",
          auth: true,
          request: {
            customer_id: "UUID",
            origin_region: "string",
            destination_region: "string",
            equipment_type: "string",
            commodity_group: "string",
            total_miles: "number",
            pickup_date: "date"
          },
          response: {
            linehaul: "number",
            fuel_surcharge: "number",
            accessorials: "Accessorial[]",
            total_revenue: "number",
            usda_benchmark: { low: "number", avg: "number", high: "number" },
            margin_estimate: "number"
          }
        },
        {
          method: "GET",
          path: "/customers/{id}/rate-programs",
          description: "Get customer rate programs",
          auth: true,
          response: "RateProgram[]"
        },
        {
          method: "GET",
          path: "/fuel-surcharge/calculate",
          description: "Calculate fuel surcharge for date/region",
          auth: true,
          params: ["region", "date", "miles", "program_id"],
          response: { eia_price: "number", surcharge_amount: "number", calculation_details: "object" }
        },
        {
          method: "GET",
          path: "/invoices",
          description: "List invoices (AR)",
          auth: true,
          params: ["customer_id", "status", "date_range", "overdue_only"],
          response: "Invoice[]"
        },
        {
          method: "POST",
          path: "/invoices",
          description: "Create invoice from load",
          auth: true,
          request: { load_id: "UUID", invoice_date: "date", terms: "string" },
          response: { invoice_id: "UUID", invoice_number: "string", total_amount: "number" }
        },
        {
          method: "POST",
          path: "/invoices/{id}/send",
          description: "Send invoice to customer",
          auth: true,
          request: { send_method: "enum (email, portal, edi)", email_to: "string?" }
        },
        {
          method: "GET",
          path: "/settlements",
          description: "List carrier settlements (AP)",
          auth: true,
          params: ["carrier_id", "status", "period_start", "period_end"],
          response: "Settlement[]"
        },
        {
          method: "POST",
          path: "/settlements",
          description: "Create carrier settlement",
          auth: true,
          request: {
            carrier_id: "UUID",
            period_start: "date",
            period_end: "date",
            lines: [{ load_id: "UUID", line_type: "enum", amount: "number" }]
          }
        }
      ]
    },
    {
      category: "Routing & Intelligence",
      icon: "🗺️",
      color: "blue",
      endpoints: [
        {
          method: "POST",
          path: "/routing/plan",
          description: "Generate optimized route plan",
          auth: true,
          request: {
            origin_location_id: "UUID",
            destination_location_id: "UUID",
            waypoints: "UUID[]?",
            departure_time: "ISO8601",
            routing_profile: "enum (truck, hazmat, toll_avoid, fastest, cheapest, weather_safe)",
            vehicle_restrictions: { height_ft: "number?", weight_lbs: "number?", hazmat: "boolean?" }
          },
          response: {
            route_plan_id: "UUID",
            distance_miles: "number",
            duration_minutes: "number",
            tolls_estimated: "number",
            fuel_gallons_estimated: "number",
            segments: "RouteSegment[]",
            waypoints: "Waypoint[]",
            alerts: { construction: "[]", weather: "[]" }
          }
        },
        {
          method: "GET",
          path: "/routing/route-plans/{id}",
          description: "Get route plan with real-time overlays",
          auth: true,
          response: {
            route_plan: "RoutePlan",
            segments: "RouteSegment[]",
            current_traffic: "object",
            active_construction: "RoadEvent[]",
            weather_alerts: "WeatherAlert[]"
          }
        },
        {
          method: "GET",
          path: "/routing/truck-stops",
          description: "Find truck stops along route or near location",
          auth: true,
          params: ["lat", "lng", "radius_miles", "amenities", "parking_available"],
          response: "TruckStop[]"
        },
        {
          method: "GET",
          path: "/routing/weather-alerts",
          description: "Get active weather alerts for region",
          auth: true,
          params: ["state", "geometry (GeoJSON)", "severity"],
          response: "WeatherAlert[]"
        },
        {
          method: "GET",
          path: "/routing/road-events",
          description: "Get construction/closures/incidents",
          auth: true,
          params: ["state", "highway", "event_type", "active_now"],
          response: "RoadEvent[]"
        }
      ]
    },
    {
      category: "Tracking & Telemetry",
      icon: "📡",
      color: "cyan",
      endpoints: [
        {
          method: "POST",
          path: "/tracking/events",
          description: "Push tracking event (GPS ping, status change)",
          auth: true,
          request: {
            load_id: "UUID",
            leg_id: "UUID?",
            tractor_id: "UUID?",
            event_type: "enum",
            event_time: "ISO8601",
            geo_lat: "number",
            geo_lon: "number",
            speed_mph: "number?",
            temperature_f: "number?"
          }
        },
        {
          method: "GET",
          path: "/loads/{id}/tracking",
          description: "Get load tracking history and current location",
          auth: true,
          response: {
            current_location: { lat: "number", lng: "number", location_name: "string", updated_at: "ISO8601" },
            events: "TrackingEvent[]",
            eta_updated: "ISO8601",
            next_stop: "Stop"
          }
        },
        {
          method: "GET",
          path: "/loads/{id}/tracking/realtime",
          description: "WebSocket endpoint for real-time tracking",
          auth: true,
          protocol: "WebSocket",
          events: ["location_update", "status_change", "exception_alert", "eta_change"]
        },
        {
          method: "POST",
          path: "/tracking/gps-pings",
          description: "Bulk GPS ping ingestion from ELD/telematics",
          auth: true,
          request: {
            pings: [{
              tractor_id: "UUID",
              driver_id: "UUID?",
              timestamp: "ISO8601",
              geo_lat: "number",
              geo_lon: "number",
              speed_mph: "number",
              odometer: "number"
            }]
          }
        }
      ]
    },
    {
      category: "HOS & ELD",
      icon: "⏱️",
      color: "orange",
      endpoints: [
        {
          method: "POST",
          path: "/drivers/{id}/hos-events",
          description: "Log HOS event (status change)",
          auth: true,
          request: {
            status: "enum (on_duty, driving, sleeper, off_duty)",
            start_time: "ISO8601",
            end_time: "ISO8601?",
            location: "object",
            eld_device_id: "string"
          }
        },
        {
          method: "GET",
          path: "/drivers/{id}/hos-summary",
          description: "Get driver HOS summary and violations",
          auth: true,
          response: {
            driver_id: "UUID",
            hos_remaining_drive: "number",
            hos_remaining_shift: "number",
            hos_remaining_cycle: "number",
            next_required_break: "ISO8601",
            violations_today: "HOSViolation[]",
            certification_status: "enum"
          }
        },
        {
          method: "GET",
          path: "/drivers/{id}/hos-logs",
          description: "Get driver HOS logs for date range (for DOT audit)",
          auth: true,
          params: ["start_date", "end_date"],
          response: "HOSEvent[]"
        }
      ]
    },
    {
      category: "Safety & Compliance",
      icon: "🛡️",
      color: "red",
      endpoints: [
        {
          method: "POST",
          path: "/safety/incidents",
          description: "Report safety incident",
          auth: true,
          request: {
            incident_type: "enum",
            severity: "enum",
            date_time: "ISO8601",
            load_id: "UUID?",
            driver_id: "UUID?",
            tractor_id: "UUID?",
            description: "string",
            dot_reportable: "boolean"
          }
        },
        {
          method: "GET",
          path: "/safety/incidents",
          description: "List safety incidents with filters",
          auth: true,
          params: ["incident_type", "severity", "date_range", "driver_id", "status"],
          response: "SafetyIncident[]"
        },
        {
          method: "POST",
          path: "/compliance/inspections",
          description: "Log DOT inspection result",
          auth: true,
          request: {
            equipment_id: "UUID",
            equipment_type: "enum",
            driver_id: "UUID",
            inspection_type: "enum",
            result: "enum",
            violations: "Violation[]",
            oos_placed: "boolean"
          }
        },
        {
          method: "GET",
          path: "/drivers/{id}/qualification-file",
          description: "Get driver qualification file status",
          auth: true,
          response: {
            driver_id: "UUID",
            files: [{
              file_type: "enum",
              status: "enum",
              expiration_date: "date",
              days_until_expiry: "number",
              document_id: "UUID"
            }],
            compliance_summary: { is_compliant: "boolean", missing_items: "[]", expiring_soon: "[]" }
          }
        }
      ]
    },
    {
      category: "Assets (Carrier Mode)",
      icon: "🚚",
      color: "slate",
      endpoints: [
        {
          method: "GET",
          path: "/assets/tractors",
          description: "List tractors with availability",
          auth: true,
          params: ["status", "assigned_driver_id", "location_id", "fuel_type"],
          response: "Tractor[]"
        },
        {
          method: "GET",
          path: "/assets/trailers",
          description: "List trailers",
          auth: true,
          params: ["type", "status", "reefer_capable", "current_location_id"],
          response: "Trailer[]"
        },
        {
          method: "POST",
          path: "/assets/tractors/{id}/assign",
          description: "Assign tractor to driver/load",
          auth: true,
          request: { driver_id: "UUID", load_leg_id: "UUID?" }
        },
        {
          method: "GET",
          path: "/assets/tractors/{id}/maintenance-history",
          description: "Get maintenance records for equipment",
          auth: true,
          response: "MaintenanceRecord[]"
        },
        {
          method: "POST",
          path: "/maintenance",
          description: "Log maintenance event",
          auth: true,
          request: {
            asset_type: "enum",
            asset_id: "UUID",
            service_type: "enum",
            service_date: "date",
            odometer: "number",
            vendor_id: "UUID",
            cost: "number",
            work_performed: "string"
          }
        }
      ]
    },
    {
      category: "External Reference Data",
      icon: "🌐",
      color: "teal",
      endpoints: [
        {
          method: "POST",
          path: "/reference/eia-fuel-prices/import",
          description: "Import weekly EIA diesel prices (scheduled job)",
          auth: "service",
          request: { series_codes: "string[]", week_of: "date" },
          response: { records_imported: "number" }
        },
        {
          method: "GET",
          path: "/reference/eia-fuel-prices",
          description: "Get EIA fuel price for region/date",
          auth: true,
          params: ["region", "date"],
          response: { region: "string", diesel_price_per_gallon: "number", week_of: "date" }
        },
        {
          method: "POST",
          path: "/reference/usda-commodity-pricing/import",
          description: "Import USDA freight rate benchmarks",
          auth: "service",
          request: { report_url: "string", report_date: "date" }
        },
        {
          method: "GET",
          path: "/reference/usda-commodity-pricing",
          description: "Get USDA benchmark rates",
          auth: true,
          params: ["commodity_group", "origin_region", "destination_region", "report_date"],
          response: { low: "number", avg: "number", high: "number", volume_estimate: "number" }
        },
        {
          method: "POST",
          path: "/reference/road-events/sync",
          description: "Sync road construction/closures from 511 APIs",
          auth: "service",
          request: { states: "string[]" }
        },
        {
          method: "POST",
          path: "/reference/weather-alerts/sync",
          description: "Sync weather alerts from NWS/NOAA",
          auth: "service",
          request: { regions: "string[]" }
        }
      ]
    },
    {
      category: "Analytics & Reporting",
      icon: "📊",
      color: "violet",
      endpoints: [
        {
          method: "GET",
          path: "/analytics/margins",
          description: "Margin analysis with grouping",
          auth: true,
          params: ["group_by (customer, lane, dispatcher, carrier, driver)", "date_range", "filters"],
          response: {
            groups: [{
              dimension: "string",
              total_revenue: "number",
              total_cost: "number",
              margin_amount: "number",
              margin_percent: "number",
              load_count: "number"
            }]
          }
        },
        {
          method: "GET",
          path: "/analytics/on-time-performance",
          description: "OTP metrics",
          auth: true,
          params: ["date_range", "group_by", "filters"],
          response: {
            overall_otp_pickup: "number",
            overall_otp_delivery: "number",
            by_dimension: "[]"
          }
        },
        {
          method: "GET",
          path: "/analytics/equipment-utilization",
          description: "Asset utilization (carrier mode)",
          auth: true,
          params: ["date_range", "equipment_type"],
          response: {
            tractors: [{ tractor_id: "UUID", loaded_miles: "number", empty_miles: "number", utilization_pct: "number" }],
            trailers: "[]"
          }
        },
        {
          method: "GET",
          path: "/analytics/driver-scorecards",
          description: "Driver performance metrics",
          auth: true,
          params: ["date_range"],
          response: {
            drivers: [{
              driver_id: "UUID",
              loads_completed: "number",
              on_time_pct: "number",
              safety_score: "number",
              hos_violations: "number",
              miles_driven: "number"
            }]
          }
        },
        {
          method: "GET",
          path: "/analytics/kpis",
          description: "Get KPI snapshots",
          auth: true,
          params: ["metric_name", "date_range", "dimension"],
          response: "KPISnapshot[]"
        }
      ]
    },
    {
      category: "Alerts & Monitoring",
      icon: "🚨",
      color: "rose",
      endpoints: [
        {
          method: "GET",
          path: "/alerts/rules",
          description: "List alert rules",
          auth: true,
          params: ["alert_category", "status"],
          response: "AlertRule[]"
        },
        {
          method: "POST",
          path: "/alerts/rules",
          description: "Create alert rule",
          auth: true,
          request: {
            name: "string",
            alert_category: "enum",
            target_metric: "string",
            comparison_operator: "enum",
            threshold_value: "number",
            notify_users: "UUID[]",
            notify_channels: "enum[]"
          }
        },
        {
          method: "GET",
          path: "/alerts/events",
          description: "Get triggered alerts",
          auth: true,
          params: ["status", "alert_category", "date_range"],
          response: "AlertEvent[]"
        },
        {
          method: "PUT",
          path: "/alerts/events/{id}/acknowledge",
          description: "Acknowledge alert",
          auth: true,
          request: { notes: "string?" }
        }
      ]
    },
    {
      category: "Documents & Audit",
      icon: "📄",
      color: "gray",
      endpoints: [
        {
          method: "POST",
          path: "/documents",
          description: "Upload document",
          auth: true,
          request: {
            file: "multipart/form-data",
            entity_type: "string",
            entity_id: "UUID",
            document_type: "enum"
          },
          response: { document_id: "UUID", file_url: "string" }
        },
        {
          method: "GET",
          path: "/documents",
          description: "List documents",
          auth: true,
          params: ["entity_type", "entity_id", "document_type", "verified"],
          response: "Document[]"
        },
        {
          method: "POST",
          path: "/documents/{id}/extract-data",
          description: "AI data extraction from document",
          auth: true,
          request: { schema: "JSONSchema" },
          response: { extracted_data: "object", confidence: "number" }
        },
        {
          method: "GET",
          path: "/audit/logs",
          description: "Get audit trail",
          auth: true,
          params: ["entity_type", "entity_id", "changed_by_user_id", "date_range"],
          response: "AuditLog[]"
        }
      ]
    }
  ];

  const filteredSections = apiSections.map(section => ({
    ...section,
    endpoints: section.endpoints.filter(ep => 
      searchTerm === "" || 
      ep.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.endpoints.length > 0);

  const methodColors = {
    GET: "bg-blue-100 text-blue-800 border-blue-300",
    POST: "bg-emerald-100 text-emerald-800 border-emerald-300",
    PUT: "bg-amber-100 text-amber-800 border-amber-300",
    DELETE: "bg-red-100 text-red-800 border-red-300",
    PATCH: "bg-purple-100 text-purple-800 border-purple-300"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <Terminal className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2">
            TMS API Endpoint Design
          </h1>
          <p className="text-slate-600 text-lg mb-4">
            RESTful API architecture for dual Broker/Carrier operations
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge className="bg-indigo-600 text-white">REST API</Badge>
            <Badge className="bg-purple-600 text-white">100+ Endpoints</Badge>
            <Badge className="bg-emerald-600 text-white">WebSocket Support</Badge>
            <Badge className="bg-blue-600 text-white">OAuth 2.0</Badge>
          </div>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search endpoints... (e.g., '/loads', 'tracking', 'split')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* API Base Info */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-600" />
              Base Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-indigo-200">
                <p className="text-xs font-semibold text-slate-500 mb-1">Base URL</p>
                <code className="text-sm font-mono text-indigo-700">https://api.yourtms.com/v1</code>
              </div>
              <div className="p-4 bg-white rounded-lg border border-indigo-200">
                <p className="text-xs font-semibold text-slate-500 mb-1">Authentication</p>
                <code className="text-sm font-mono text-indigo-700">Bearer {"{access_token}"}</code>
              </div>
              <div className="p-4 bg-white rounded-lg border border-indigo-200">
                <p className="text-xs font-semibold text-slate-500 mb-1">Content-Type</p>
                <code className="text-sm font-mono text-indigo-700">application/json</code>
              </div>
              <div className="p-4 bg-white rounded-lg border border-indigo-200">
                <p className="text-xs font-semibold text-slate-500 mb-1">Rate Limit</p>
                <code className="text-sm font-mono text-indigo-700">1000 req/min (authenticated)</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endpoint Sections */}
        {filteredSections.map((section, idx) => (
          <Card key={idx} className="border-0 shadow-xl bg-white">
            <CardHeader className={`border-b border-slate-100 bg-gradient-to-r from-${section.color}-50 to-white`}>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <span>{section.category}</span>
                <Badge className="ml-auto bg-slate-100 text-slate-700">{section.endpoints.length} endpoints</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {section.endpoints.map((endpoint, eIdx) => (
                  <div key={eIdx} className="border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50">
                    
                    {/* Method & Path */}
                    <div className="flex items-start gap-3 mb-3">
                      <Badge className={`${methodColors[endpoint.method]} border font-mono text-xs px-3 py-1`}>
                        {endpoint.method}
                      </Badge>
                      <code className="flex-1 font-mono text-sm bg-slate-100 px-3 py-2 rounded-lg text-slate-800">
                        {endpoint.path}
                      </code>
                      {endpoint.auth && (
                        <Badge className="bg-red-100 text-red-800 border-red-300">
                          <Lock className="w-3 h-3 mr-1" />
                          Auth Required
                        </Badge>
                      )}
                      {endpoint.protocol === "WebSocket" && (
                        <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300">
                          <Zap className="w-3 h-3 mr-1" />
                          WebSocket
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-slate-700 mb-3">{endpoint.description}</p>

                    {/* Params */}
                    {endpoint.params && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Query Parameters</p>
                        <div className="flex flex-wrap gap-2">
                          {endpoint.params.map((param, pIdx) => (
                            <code key={pIdx} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded border border-blue-200">
                              {param}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Request Body */}
                    {endpoint.request && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Request Body</p>
                        <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto font-mono">
                          {JSON.stringify(endpoint.request, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Response */}
                    {endpoint.response && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2">Response</p>
                        <pre className="text-xs bg-emerald-900 text-emerald-100 p-3 rounded-lg overflow-x-auto font-mono">
                          {typeof endpoint.response === 'string' 
                            ? endpoint.response 
                            : JSON.stringify(endpoint.response, null, 2)}
                        </pre>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Authentication Flow */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              Authentication & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-4 bg-white rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2">🔑 OAuth 2.0 Flow</h4>
              <ol className="list-decimal list-inside space-y-1 text-slate-700">
                <li>Client: <code>POST /auth/login</code> with credentials</li>
                <li>Server: Returns <code>access_token</code> (expires 1hr) + <code>refresh_token</code> (expires 30 days)</li>
                <li>Client: Include <code>Authorization: Bearer {"{access_token}"}</code> header</li>
                <li>Client: Use <code>POST /auth/refresh</code> before access_token expires</li>
              </ol>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-2">🛡️ Role-Based Access Control (RBAC)</h4>
              <p className="text-slate-700 mb-2">Endpoints enforce permissions based on user role:</p>
              <ul className="space-y-1 text-slate-700">
                <li><strong>Admin:</strong> Full access to all endpoints</li>
                <li><strong>Dispatcher:</strong> Loads, drivers, tracking, assignments</li>
                <li><strong>Broker:</strong> Loads, customers, carriers, rating</li>
                <li><strong>Accounting:</strong> Invoices, settlements, payments, analytics</li>
                <li><strong>Safety:</strong> Incidents, inspections, compliance, HOS logs</li>
                <li><strong>Driver (portal):</strong> Assigned loads, HOS, documents, tracking updates</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">📊 Rate Limiting</h4>
              <ul className="space-y-1 text-slate-700">
                <li>Authenticated: <strong>1000 requests/minute</strong> per user</li>
                <li>Service accounts: <strong>10,000 requests/minute</strong></li>
                <li>Public (webhooks): <strong>100 requests/minute</strong> per IP</li>
                <li>Response headers: <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code></li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-900 mb-2">🔄 Webhooks (Event-Driven)</h4>
              <p className="text-slate-700 mb-2">Subscribe to events:</p>
              <ul className="space-y-1 text-slate-700 text-xs font-mono">
                <li>• <code>load.created</code>, <code>load.status_changed</code>, <code>load.delivered</code></li>
                <li>• <code>tracking.location_update</code>, <code>tracking.eta_changed</code></li>
                <li>• <code>exception.triggered</code>, <code>alert.triggered</code></li>
                <li>• <code>invoice.created</code>, <code>invoice.paid</code></li>
                <li>• <code>settlement.approved</code></li>
              </ul>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}