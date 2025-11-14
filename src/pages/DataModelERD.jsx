import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Table, Key, Link as LinkIcon, GitBranch } from "lucide-react";

export default function DataModelERD() {
  const sections = [
    {
      title: "1. Organizations & Roles",
      icon: "🏢",
      tables: [
        {
          name: "organizations",
          pk: "org_id",
          fields: ["org_type", "legal_name", "MC_number", "DOT_number", "tax_id", "SCAC", "address", "insurance", "safety_rating", "credit_limit", "payment_terms"],
          relationships: ["1:0..1 → customers", "1:0..1 → carriers", "1:N → loads", "1:N → invoices"]
        },
        {
          name: "customers",
          pk: "customer_id (FK → org_id)",
          fields: ["customer_type", "account_manager_id (FK)", "rate_program_id (FK)", "fuel_surcharge_program_id (FK)", "credit_status"],
          relationships: ["1:1 → organizations", "1:N → loads", "1:N → invoices"]
        },
        {
          name: "carriers",
          pk: "carrier_id (FK → org_id)",
          fields: ["carrier_type", "dispatch_contact", "operating_regions", "equipment_types", "onboarding_status", "compliance_status", "performance_score"],
          relationships: ["1:1 → organizations", "1:N → load_legs", "1:N → carrier_settlements"]
        }
      ]
    },
    {
      title: "2. HR & Workforce",
      icon: "👥",
      tables: [
        {
          name: "employees",
          pk: "employee_id",
          fields: ["user_id (FK)", "role", "department", "employment_status", "hire_date", "supervisor_id (FK → self)", "pay_type", "base_salary", "commission_rate"],
          relationships: ["N:1 → users", "N:1 → employees (supervisor)", "1:N → time_off_requests", "1:N → performance_reviews", "1:N → payroll_records"]
        },
        {
          name: "drivers",
          pk: "driver_id",
          fields: ["employee_id (FK)", "user_id (FK)", "carrier_party_id (FK)", "license_number", "cdl_class", "endorsements", "medical_card_expiry", "driver_status", "hos_remaining", "payment_structure"],
          relationships: ["N:1 → employees", "N:1 → carriers", "1:N → load_legs", "1:N → hos_events", "1:N → safety_incidents"]
        },
        {
          name: "time_off_requests",
          pk: "request_id",
          fields: ["employee_id (FK)", "driver_id (FK)", "request_type", "start_date", "end_date", "status", "reviewed_by (FK)"],
          relationships: ["N:1 → employees"]
        },
        {
          name: "performance_reviews",
          pk: "review_id",
          fields: ["employee_id (FK)", "review_date", "overall_score", "category_scores (JSON)", "goals (JSON)", "promotion_recommended"],
          relationships: ["N:1 → employees"]
        },
        {
          name: "training_records",
          pk: "training_id",
          fields: ["employee_id (FK)", "driver_id (FK)", "training_type", "completed_date", "expires_date", "certificate_number", "evidence_document_id (FK)"],
          relationships: ["N:1 → employees", "N:1 → documents"]
        }
      ]
    },
    {
      title: "3. Assets & Maintenance",
      icon: "🚚",
      tables: [
        {
          name: "tractors",
          pk: "tractor_id",
          fields: ["unit_number", "VIN", "make", "model", "year", "ownership_type", "assigned_driver_id (FK)", "owner_party_id (FK)", "current_odometer", "fuel_type", "status"],
          relationships: ["N:1 → drivers (assignment)", "N:1 → organizations (owner)", "1:N → load_legs", "1:N → maintenance_records", "1:N → gps_pings"]
        },
        {
          name: "trailers",
          pk: "trailer_id",
          fields: ["unit_number", "VIN", "type", "length_ft", "weight_capacity_lbs", "reefer_capable", "temp_range", "ownership_type", "status", "current_location_id (FK)"],
          relationships: ["1:N → load_legs", "1:N → maintenance_records"]
        },
        {
          name: "maintenance_records",
          pk: "maintenance_record_id",
          fields: ["asset_type", "asset_id (polymorphic)", "service_type", "service_date", "odometer", "vendor_id (FK)", "cost", "labor_hours", "parts_cost", "next_service_due"],
          relationships: ["Polymorphic → tractors OR trailers", "N:1 → organizations (vendor)"]
        }
      ]
    },
    {
      title: "4. Locations & Geography",
      icon: "📍",
      tables: [
        {
          name: "locations",
          pk: "location_id",
          fields: ["location_type", "name", "address", "city", "state", "zip", "country", "geo_lat", "geo_lon", "time_zone", "hours_of_operation (JSON)", "appointment_required", "amenities (JSON)", "parking_spaces"],
          relationships: ["1:N → load_stops", "1:N → load_legs (origin/dest)", "1:N → yards", "1:N → warehouses"]
        },
        {
          name: "yards",
          pk: "yard_id",
          fields: ["location_id (FK)", "yard_type", "max_parking_slots", "current_occupancy"],
          relationships: ["1:1 → locations", "1:N → yard_slots"]
        },
        {
          name: "yard_slots",
          pk: "yard_slot_id",
          fields: ["yard_id (FK)", "slot_code", "slot_type", "is_powered", "status", "current_equipment_id"],
          relationships: ["N:1 → yards"]
        },
        {
          name: "warehouses",
          pk: "warehouse_id",
          fields: ["location_id (FK)", "warehouse_type", "total_sqft", "pallet_positions", "temperature_controlled", "wms_integrated"],
          relationships: ["1:1 → locations"]
        }
      ]
    },
    {
      title: "5. Loads, Legs & Stops (Multi-Leg Support)",
      icon: "🚛",
      tables: [
        {
          name: "loads",
          pk: "load_id",
          fields: ["load_number", "customer_id (FK)", "mode", "service_type", "equipment_type", "status", "total_weight_lbs", "rate_basis", "linehaul_revenue", "total_revenue", "margin_actual", "hazmat_flag", "cross_border", "is_split_shipment", "parent_load_id (FK → self)"],
          relationships: ["N:1 → customers", "1:N → load_legs", "1:N → load_stops", "1:N → load_commodities", "1:N → invoices", "1:N → loads (child splits)"]
        },
        {
          name: "load_legs",
          pk: "leg_id",
          fields: ["load_id (FK)", "sequence_number", "origin_location_id (FK)", "destination_location_id (FK)", "assigned_carrier_party_id (FK)", "driver_id (FK)", "tractor_id (FK)", "trailer_id (FK)", "mode", "planned_miles", "actual_miles", "empty_miles", "status", "leg_revenue", "leg_cost"],
          relationships: ["N:1 → loads", "N:1 → carriers", "N:1 → drivers", "N:1 → tractors", "N:1 → trailers", "1:N → load_stops", "1:N → leg_commodities (splits)"]
        },
        {
          name: "load_stops",
          pk: "stop_id",
          fields: ["load_id (FK)", "load_leg_id (FK)", "sequence_number", "location_id (FK)", "stop_type", "appointment_type", "appt_start", "appt_end", "arrival_actual", "departure_actual", "detention_start", "status", "bol_number", "signed_pod_document_id (FK)"],
          relationships: ["N:1 → loads", "N:1 → load_legs", "N:1 → locations", "1:N → accessorial_charges"]
        },
        {
          name: "load_commodities",
          pk: "commodity_id",
          fields: ["load_id (FK)", "description", "product_category", "usda_commodity_code", "nmfc_code", "freight_class", "weight_lbs", "pallet_count", "hazmat_flag", "temperature_range"],
          relationships: ["N:1 → loads", "1:N → leg_commodities"]
        },
        {
          name: "leg_commodities",
          pk: "leg_commodity_id",
          fields: ["leg_id (FK)", "commodity_id (FK)", "weight_on_leg_lbs", "pieces_on_leg", "pallets_on_leg"],
          relationships: ["N:1 → load_legs", "N:1 → load_commodities"]
        }
      ]
    },
    {
      title: "6. Rating & Finance",
      icon: "💰",
      tables: [
        {
          name: "customer_rate_programs",
          pk: "rate_program_id",
          fields: ["customer_id (FK)", "name", "effective_from", "effective_to", "default_fuel_surcharge_program_id (FK)"],
          relationships: ["N:1 → customers", "1:N → customer_lane_rates"]
        },
        {
          name: "customer_lane_rates",
          pk: "customer_lane_rate_id",
          fields: ["rate_program_id (FK)", "origin_region", "destination_region", "equipment_type", "rate_basis", "base_rate", "min_charge"],
          relationships: ["N:1 → customer_rate_programs"]
        },
        {
          name: "carrier_lane_rates",
          pk: "carrier_lane_rate_id",
          fields: ["carrier_id (FK)", "origin_region", "destination_region", "equipment_type", "base_cost", "fuel_surcharge_basis"],
          relationships: ["N:1 → carriers"]
        },
        {
          name: "fuel_surcharge_programs",
          pk: "fs_program_id",
          fields: ["name", "base_index_region", "base_price", "increment", "calculation_method", "cents_per_mile_per_increment", "percent_of_linehaul_per_increment"],
          relationships: ["Referenced by customer_rate_programs", "Links to eia_fuel_index by region"]
        },
        {
          name: "accessorial_charges",
          pk: "accessorial_id",
          fields: ["load_id (FK)", "leg_id (FK)", "stop_id (FK)", "type", "bill_to_type", "rate", "quantity", "total_amount"],
          relationships: ["N:1 → loads", "N:1 → load_legs", "N:1 → load_stops"]
        },
        {
          name: "invoices",
          pk: "invoice_id",
          fields: ["invoice_number", "customer_party_id (FK)", "load_id (FK)", "invoice_date", "due_date", "total_amount", "amount_paid", "status", "erp_invoice_id"],
          relationships: ["N:1 → customers", "N:1 → loads", "1:N → payments"]
        },
        {
          name: "carrier_settlements",
          pk: "settlement_id",
          fields: ["settlement_number", "carrier_party_id (FK)", "period_start", "period_end", "total_linehaul_pay", "net_pay", "status", "payment_method"],
          relationships: ["N:1 → carriers", "1:N → settlement_lines"]
        }
      ]
    },
    {
      title: "7. Routing & Intelligence",
      icon: "🗺️",
      tables: [
        {
          name: "route_plans",
          pk: "route_plan_id",
          fields: ["load_leg_id (FK)", "origin_location_id (FK)", "destination_location_id (FK)", "routing_profile", "distance_miles_est", "total_tolls_estimated", "total_fuel_estimated_gallons", "polyline", "version"],
          relationships: ["N:1 → load_legs", "1:N → route_segments", "1:N → route_waypoints"]
        },
        {
          name: "route_segments",
          pk: "route_segment_id",
          fields: ["route_plan_id (FK)", "sequence_number", "start_lat/lng", "end_lat/lng", "road_name", "road_type", "toll_cost_est", "has_construction", "weather_risk_score"],
          relationships: ["N:1 → route_plans"]
        },
        {
          name: "toll_locations",
          pk: "toll_location_id",
          fields: ["toll_name", "toll_network", "state", "highway", "direction", "rates (JSON)", "lat", "lng"],
          relationships: ["1:N → toll_transactions"]
        },
        {
          name: "toll_transactions",
          pk: "toll_txn_id",
          fields: ["load_leg_id (FK)", "toll_location_id (FK)", "tractor_id (FK)", "txn_time", "amount", "transponder_id (FK)", "is_reimbursable"],
          relationships: ["N:1 → load_legs", "N:1 → toll_locations"]
        },
        {
          name: "road_events",
          pk: "road_event_id",
          fields: ["event_type", "severity", "affected_routes (JSON)", "starts_at", "ends_at", "delay_minutes_estimated", "geometry (GeoJSON)"],
          relationships: ["Overlays route_segments by geometry"]
        },
        {
          name: "weather_alerts",
          pk: "weather_alert_id",
          fields: ["alert_type", "severity", "affected_states (JSON)", "valid_from", "valid_to", "impact_on_trucking", "geometry (GeoJSON)"],
          relationships: ["Overlays route_segments by geometry"]
        }
      ]
    },
    {
      title: "8. Telemetry & Safety",
      icon: "📡",
      tables: [
        {
          name: "tracking_events",
          pk: "tracking_event_id",
          fields: ["load_id (FK)", "leg_id (FK)", "tractor_id (FK)", "event_type", "event_time", "geo_lat", "geo_lon", "speed_mph", "temperature_f (reefer)", "source"],
          relationships: ["N:1 → loads", "N:1 → load_legs", "N:1 → tractors"]
        },
        {
          name: "gps_pings",
          pk: "gps_ping_id (BIGINT)",
          fields: ["load_id", "tractor_id", "driver_id", "timestamp", "geo_lat", "geo_lon", "speed_mph", "heading", "odometer", "fuel_level_percent", "source"],
          relationships: ["High-frequency tracking - partitioned by month"]
        },
        {
          name: "hos_events",
          pk: "hos_event_id",
          fields: ["driver_id (FK)", "status", "start_time", "end_time", "duration_minutes", "odometer_start/end", "violations (JSON)", "eld_device_id", "certification_status"],
          relationships: ["N:1 → drivers"]
        },
        {
          name: "safety_incidents",
          pk: "incident_id",
          fields: ["load_id (FK)", "driver_id (FK)", "tractor_id (FK)", "incident_type", "severity", "date_time", "dot_reportable", "injuries_count", "cost_estimate", "preventable", "insurance_claim_id (FK)"],
          relationships: ["N:1 → loads", "N:1 → drivers", "N:1 → tractors", "N:1 → claims"]
        },
        {
          name: "inspection_records",
          pk: "inspection_record_id",
          fields: ["equipment_id", "equipment_type", "driver_id (FK)", "inspection_type", "inspection_date", "result", "violations (JSON)", "oos_placed", "points_assessed"],
          relationships: ["Polymorphic → tractors OR trailers", "N:1 → drivers"]
        },
        {
          name: "driver_qualification_files",
          pk: "qualification_file_id",
          fields: ["driver_id (FK)", "file_type", "document_id (FK)", "effective_date", "expiration_date", "status", "verified_by (FK)"],
          relationships: ["N:1 → drivers", "N:1 → documents"]
        }
      ]
    },
    {
      title: "9. Fuel & Environmental",
      icon: "⛽",
      tables: [
        {
          name: "eia_fuel_index",
          pk: "eia_price_id",
          fields: ["series_code", "week_of", "region", "diesel_price_per_gallon", "source_url", "raw_payload (JSON)"],
          relationships: ["Referenced by fuel_surcharge_programs", "Referenced by fuel_transactions"]
        },
        {
          name: "fuel_programs",
          pk: "fuel_program_id",
          fields: ["name", "applies_to_party_id", "pricing_basis", "eia_series_code", "base_price", "discount_per_gallon", "fuel_card_program"],
          relationships: ["1:N → fuel_transactions"]
        },
        {
          name: "fuel_transactions",
          pk: "fuel_txn_id",
          fields: ["load_leg_id (FK)", "driver_id (FK)", "tractor_id (FK)", "station_location_id (FK)", "txn_datetime", "gallons", "price_per_gallon", "total_amount", "fuel_program_id (FK)", "eia_price_at_time"],
          relationships: ["N:1 → load_legs", "N:1 → drivers", "N:1 → tractors", "N:1 → locations (truck stop)", "N:1 → fuel_programs"]
        },
        {
          name: "emission_factors",
          pk: "emission_factor_id",
          fields: ["mode", "equipment_type", "fuel_type", "region", "unit", "factor_value", "source (EPA, SmartWay)", "methodology"],
          relationships: ["Referenced by shipment_emissions"]
        },
        {
          name: "shipment_emissions",
          pk: "emission_id",
          fields: ["shipment_id (FK → loads)", "load_leg_id (FK)", "mode", "distance_miles", "weight_tons", "emission_factor_id (FK)", "co2e_kg", "fuel_consumed_gallons", "carbon_offset_purchased"],
          relationships: ["N:1 → loads", "N:1 → load_legs", "N:1 → emission_factors"]
        }
      ]
    },
    {
      title: "10. USDA Commodity Pricing",
      icon: "🌾",
      tables: [
        {
          name: "usda_commodity_pricing_indices",
          pk: "commodity_pricing_index_id",
          fields: ["source", "commodity_group", "origin_region", "destination_region", "unit", "reported_rate_low/high/avg", "load_type", "report_date", "volume_estimate"],
          relationships: ["Referenced by load_commodities.usda_commodity_code", "Used for rate benchmarking"]
        }
      ]
    },
    {
      title: "11. Exception & Claims",
      icon: "🚨",
      tables: [
        {
          name: "exception_cases",
          pk: "exception_id",
          fields: ["load_id (FK)", "exception_type", "discovered_at", "severity", "root_cause_category", "status", "assigned_to_user_id (FK)", "financial_impact", "delay_minutes"],
          relationships: ["N:1 → loads", "N:1 → users (assigned)"]
        },
        {
          name: "claims",
          pk: "claim_id",
          fields: ["claim_number", "load_id (FK)", "claim_type", "incident_date", "reported_date", "claimed_amount", "approved_amount", "status", "insurance_policy_id (FK)"],
          relationships: ["N:1 → loads", "N:1 → insurance_policies"]
        },
        {
          name: "insurance_policies",
          pk: "policy_id",
          fields: ["insured_party_id (FK)", "policy_number", "policy_type", "coverage_limit", "effective_date", "expiration_date", "status"],
          relationships: ["N:1 → organizations", "1:N → claims"]
        }
      ]
    },
    {
      title: "12. Analytics (Fact Tables)",
      icon: "📊",
      tables: [
        {
          name: "fact_shipment",
          pk: "fact_shipment_id (BIGINT)",
          fields: ["shipment_id", "date_key", "customer_party_id", "carrier_party_id", "lane_key", "revenue_total", "cost_total", "margin_amount", "margin_percent", "pickup_on_time_flag", "delivery_on_time_flag", "co2e_kg"],
          relationships: ["Denormalized snapshot for analytics", "Partitioned by year"]
        },
        {
          name: "fact_trip_leg",
          pk: "fact_trip_leg_id (BIGINT)",
          fields: ["trip_leg_id", "date_key", "driver_id", "tractor_id", "planned_miles", "actual_miles", "empty_miles", "fuel_gallons_used", "fuel_cost_total", "tolls_cost_total", "leg_margin"],
          relationships: ["Leg-level analytics"]
        },
        {
          name: "fact_finance",
          pk: "fact_finance_id (BIGINT)",
          fields: ["shipment_id", "invoice_id", "date_key", "ar_amount", "ap_amount", "margin_amount", "days_sales_outstanding", "paid_in_full_flag"],
          relationships: ["Financial analytics"]
        },
        {
          name: "fact_compliance",
          pk: "fact_compliance_id (BIGINT)",
          fields: ["driver_id", "equipment_id", "date_key", "inspection_count", "inspection_pass_rate", "accident_count", "hos_violation_count", "csa_points"],
          relationships: ["Safety/compliance rollups"]
        }
      ]
    },
    {
      title: "13. KPIs & Alerts",
      icon: "⚡",
      tables: [
        {
          name: "kpi_snapshots",
          pk: "kpi_snapshot_id",
          fields: ["snapshot_date", "metric_name", "metric_category", "dimension (JSON filters)", "value", "target_value", "period_type"],
          relationships: ["Time-series KPI tracking"]
        },
        {
          name: "alert_rules",
          pk: "alert_rule_id",
          fields: ["name", "alert_category", "target_metric", "comparison_operator", "threshold_value", "evaluation_frequency", "notify_users (JSON)", "status"],
          relationships: ["1:N → alert_events"]
        },
        {
          name: "alert_events",
          pk: "alert_event_id",
          fields: ["alert_rule_id (FK)", "triggered_at", "metric_value", "entity_type", "entity_id", "status", "acknowledged_by (FK)", "resolution_notes"],
          relationships: ["N:1 → alert_rules"]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2">
            TMS Data Model - Complete ERD
          </h1>
          <p className="text-slate-600 text-lg mb-4">
            Enterprise-grade relational database schema for dual Broker/Carrier operations
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge className="bg-indigo-600 text-white">51+ Entities</Badge>
            <Badge className="bg-purple-600 text-white">API-Ready</Badge>
            <Badge className="bg-emerald-600 text-white">Multi-Leg Support</Badge>
            <Badge className="bg-blue-600 text-white">Dual Broker/Carrier</Badge>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-white">
            <CardContent className="p-6 text-center">
              <Table className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
              <p className="text-2xl font-bold text-slate-900">51+</p>
              <p className="text-sm text-slate-600">Total Entities</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6 text-center">
              <Key className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-slate-900">200+</p>
              <p className="text-sm text-slate-600">Key Relationships</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-6 text-center">
              <LinkIcon className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <p className="text-2xl font-bold text-slate-900">Multi-Leg</p>
              <p className="text-sm text-slate-600">Split/Transfer</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6 text-center">
              <GitBranch className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-slate-900">Dual Mode</p>
              <p className="text-sm text-slate-600">Broker + Carrier</p>
            </CardContent>
          </Card>
        </div>

        {/* Sections */}
        {sections.map((section, idx) => (
          <Card key={idx} className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle className="flex items-center gap-3 text-xl">
                <span className="text-2xl">{section.icon}</span>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {section.tables.map((table, tIdx) => (
                  <div key={tIdx} className="border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-slate-50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-mono font-bold text-lg text-indigo-700">
                          <Table className="w-5 h-5 inline mr-2" />
                          {table.name}
                        </h3>
                        <p className="text-sm text-slate-600 font-mono mt-1">
                          <Key className="w-3 h-3 inline mr-1 text-emerald-600" />
                          PK: {table.pk}
                        </p>
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 font-mono">TABLE</Badge>
                    </div>

                    {/* Fields */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Fields</p>
                      <div className="flex flex-wrap gap-2">
                        {table.fields.map((field, fIdx) => (
                          <Badge key={fIdx} variant="outline" className="text-xs bg-blue-50 text-blue-800 border-blue-200">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Relationships */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Relationships</p>
                      <div className="space-y-1">
                        {table.relationships.map((rel, rIdx) => (
                          <p key={rIdx} className="text-sm text-slate-700 flex items-center gap-2">
                            <LinkIcon className="w-3 h-3 text-purple-600" />
                            <span className="font-mono text-xs bg-purple-50 px-2 py-0.5 rounded">{rel}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Key Design Principles */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-600" />
              Key Design Principles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2">✅ Multi-Leg Architecture</h4>
              <p className="text-slate-700">
                <strong>loads</strong> contain <strong>load_legs</strong>, which enable splits, transfers, crossdocking, and reconsignments. 
                Each leg can have different carriers, drivers, equipment, and routes.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">✅ Dual Broker/Carrier Mode</h4>
              <p className="text-slate-700">
                <strong>load_legs</strong> support BOTH:
                <br />• Broker mode: <code>assigned_carrier_party_id</code> (FK → carriers)
                <br />• Carrier mode: <code>driver_id, tractor_id, trailer_id</code> (your assets)
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-900 mb-2">✅ Comprehensive Tracking</h4>
              <p className="text-slate-700">
                Three-tier tracking: <strong>tracking_events</strong> (business events), <strong>gps_pings</strong> (high-frequency), <strong>hos_events</strong> (compliance).
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">✅ Route Intelligence</h4>
              <p className="text-slate-700">
                <strong>route_plans</strong> → <strong>route_segments</strong> with overlays for tolls, weather, construction. 
                Supports multiple routing profiles (fastest, cheapest, toll-avoid, weather-safe).
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-2">✅ External Data Integration</h4>
              <p className="text-slate-700">
                <strong>eia_fuel_index</strong> for fuel surcharges, <strong>usda_commodity_pricing_indices</strong> for rate benchmarking, 
                <strong>road_events</strong> and <strong>weather_alerts</strong> from 511/NWS APIs.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2">✅ Fact Tables for Analytics</h4>
              <p className="text-slate-700">
                <strong>fact_shipment</strong>, <strong>fact_trip_leg</strong>, <strong>fact_finance</strong>, <strong>fact_compliance</strong> 
                enable powerful BI and reporting with pre-aggregated metrics.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}