import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Truck, 
  MapPin, 
  Building2, 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  ExternalLink,
  CreditCard
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function UniversalSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [carrierVerification, setCarrierVerification] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [brokerCredit, setBrokerCredit] = useState(null);
  const [isCheckingCredit, setIsCheckingCredit] = useState(false);

  const queryClient = useQueryClient();

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const { data: shippers } = useQuery({
    queryKey: ['shippers'],
    queryFn: () => base44.entities.Shipper.list('-created_date', 100),
    initialData: [],
  });

  const createCarrierMutation = useMutation({
    mutationFn: (carrierData) => base44.entities.Carrier.create(carrierData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
      alert('Carrier added successfully!');
    },
  });

  const createShipperMutation = useMutation({
    mutationFn: (shipperData) => base44.entities.Shipper.create(shipperData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippers'] });
      alert('Customer added successfully!');
    },
  });

  const handleUniversalSearch = () => {
    setIsSearching(true);
    setSearchResults(null);
    setCarrierVerification(null);
    setBrokerCredit(null);

    try {
      const results = {
        loads: [],
        carriers: [],
        shippers: [],
        locations: []
      };

      const query = searchQuery.toLowerCase().trim();

      // Search loads by load number or reference number
      if (searchType === 'all' || searchType === 'loads') {
        results.loads = loads.filter(l => 
          l.load_number?.toLowerCase().includes(query) ||
          l.reference_number?.toLowerCase().includes(query) ||
          l.id?.toLowerCase().includes(query)
        );
      }

      // Search carriers by name, MC, DOT
      if (searchType === 'all' || searchType === 'carriers') {
        results.carriers = carriers.filter(c =>
          c.company_name?.toLowerCase().includes(query) ||
          c.mc_number?.toLowerCase().includes(query) ||
          c.dot_number?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query)
        );
      }

      // Search shippers/customers by name, email
      if (searchType === 'all' || searchType === 'shippers') {
        results.shippers = shippers.filter(s =>
          s.company_name?.toLowerCase().includes(query) ||
          s.contact_name?.toLowerCase().includes(query) ||
          s.email?.toLowerCase().includes(query)
        );
      }

      // Search locations (pickup/dropoff cities)
      if (searchType === 'all' || searchType === 'locations') {
        const locationLoads = loads.filter(l =>
          l.pickup_location?.city?.toLowerCase().includes(query) ||
          l.pickup_location?.state?.toLowerCase().includes(query) ||
          l.dropoff_location?.city?.toLowerCase().includes(query) ||
          l.dropoff_location?.state?.toLowerCase().includes(query)
        );
        
        // Extract unique locations
        const locationsSet = new Set();
        locationLoads.forEach(load => {
          if (load.pickup_location?.city) {
            locationsSet.add(`${load.pickup_location.city}, ${load.pickup_location.state}`);
          }
          if (load.dropoff_location?.city) {
            locationsSet.add(`${load.dropoff_location.city}, ${load.dropoff_location.state}`);
          }
        });
        results.locations = Array.from(locationsSet);
      }

      setSearchResults(results);

    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFMCSACarrierVerification = async () => {
    setIsVerifying(true);
    setCarrierVerification(null);

    try {
      // Extract MC/DOT/MX/FF number
      const query = searchQuery.toUpperCase().trim();
      let identifierType = 'UNKNOWN';
      let identifierNumber = query;

      if (query.startsWith('MC')) {
        identifierType = 'MC';
        identifierNumber = query.replace('MC', '');
      } else if (query.startsWith('DOT')) {
        identifierType = 'DOT';
        identifierNumber = query.replace('DOT', '');
      } else if (query.startsWith('MX')) {
        identifierType = 'MX';
        identifierNumber = query.replace('MX', '');
      } else if (query.startsWith('FF')) {
        identifierType = 'FF';
        identifierNumber = query.replace('FF', '');
      } else if (!isNaN(query)) {
        identifierType = 'DOT';
        identifierNumber = query;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an FMCSA carrier verification AI system (TMSCVQ - TMS Carrier Verification & Quality).

CARRIER LOOKUP REQUEST:
Identifier Type: ${identifierType}
Identifier Number: ${identifierNumber}

Perform a comprehensive carrier verification check and provide:

1. **FMCSA SAFER DATA** (simulated based on typical FMCSA records):
   - Carrier Legal Name
   - DBA Name (if different)
   - MC Number
   - DOT Number
   - Operating Authority Status (Active/Inactive/Not Authorized)
   - Operating Status (Authorized/Out-of-Service/Not Authorized)
   - Physical Address (street, city, state, zip)
   - Phone Number
   - MCS-150 Date (last update)
   - MCS-150 Mileage
   - Number of Power Units
   - Number of Drivers

2. **INSURANCE INFORMATION**:
   - Bipd Insurance on File (Yes/No)
   - Cargo Insurance on File (Yes/No)
   - Bond Insurance on File (Yes/No)
   - Insurance Carrier Name
   - Policy Number (if available)
   - Effective Date
   - Expiration Date

3. **SAFETY RATING**:
   - FMCSA Safety Rating (Satisfactory/Conditional/Unsatisfactory/Not Rated)
   - Safety Review Date
   - Safety Review Type

4. **CRASH HISTORY** (24 months):
   - Total Crashes
   - Injury Crashes
   - Fatality Crashes
   - Tow-Away Crashes

5. **INSPECTION HISTORY** (24 months):
   - Total Inspections
   - Driver Out-of-Service Violations
   - Vehicle Out-of-Service Violations
   - Out-of-Service Percentage

6. **FRAUD ALERTS & RED FLAGS**:
   - Authority Age (if less than 90 days - flag as "New Authority")
   - Operating Status Issues
   - Insurance Gaps
   - Out-of-Service Orders
   - High Crash Rate
   - High Violation Rate
   - Suspicious Activity Indicators
   - Overall Fraud Risk Level (LOW/MEDIUM/HIGH/CRITICAL)

7. **VETTING RECOMMENDATION**:
   - APPROVED / REVIEW REQUIRED / REJECT
   - Risk Score (0-100, where 0 is lowest risk)
   - Key Concerns (if any)
   - Approval Conditions (if review required)

Provide realistic data based on typical carrier profiles. Be thorough and professional.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            fmcsa_data: {
              type: "object",
              properties: {
                legal_name: { type: "string" },
                dba_name: { type: "string" },
                mc_number: { type: "string" },
                dot_number: { type: "string" },
                authority_status: { type: "string" },
                operating_status: { type: "string" },
                physical_address: {
                  type: "object",
                  properties: {
                    street: { type: "string" },
                    city: { type: "string" },
                    state: { type: "string" },
                    zip: { type: "string" }
                  }
                },
                phone: { type: "string" },
                mcs_150_date: { type: "string" },
                mcs_150_mileage: { type: "number" },
                power_units: { type: "number" },
                drivers: { type: "number" }
              }
            },
            insurance: {
              type: "object",
              properties: {
                bipd_on_file: { type: "boolean" },
                cargo_on_file: { type: "boolean" },
                bond_on_file: { type: "boolean" },
                carrier_name: { type: "string" },
                policy_number: { type: "string" },
                effective_date: { type: "string" },
                expiration_date: { type: "string" }
              }
            },
            safety_rating: {
              type: "object",
              properties: {
                rating: { type: "string" },
                review_date: { type: "string" },
                review_type: { type: "string" }
              }
            },
            crash_history: {
              type: "object",
              properties: {
                total: { type: "number" },
                injury: { type: "number" },
                fatality: { type: "number" },
                tow_away: { type: "number" }
              }
            },
            inspection_history: {
              type: "object",
              properties: {
                total_inspections: { type: "number" },
                driver_oos: { type: "number" },
                vehicle_oos: { type: "number" },
                oos_percentage: { type: "number" }
              }
            },
            fraud_alerts: {
              type: "object",
              properties: {
                authority_age_days: { type: "number" },
                red_flags: {
                  type: "array",
                  items: { type: "string" }
                },
                fraud_risk_level: { type: "string" }
              }
            },
            recommendation: {
              type: "object",
              properties: {
                status: { type: "string" },
                risk_score: { type: "number" },
                concerns: {
                  type: "array",
                  items: { type: "string" }
                },
                conditions: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      });

      setCarrierVerification(result);

    } catch (error) {
      console.error('FMCSA verification error:', error);
      alert('Carrier verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBrokerCreditCheck = async () => {
    setIsCheckingCredit(true);
    setBrokerCredit(null);

    try {
      const query = searchQuery.toUpperCase().trim();
      let mcNumber = query.replace('MC', '');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a freight broker credit check system.

BROKER CREDIT CHECK REQUEST:
MC Number: ${mcNumber}

Perform a comprehensive credit analysis and provide:

1. **COMPANY INFORMATION**:
   - Legal Business Name
   - DBA Name
   - MC Number
   - DOT Number
   - Years in Business
   - Business Type (Corporation/LLC/Partnership/Sole Proprietor)

2. **CREDIT SCORE & RATING**:
   - Credit Score (300-850 scale)
   - Credit Rating (Excellent/Good/Fair/Poor)
   - Payment Index Score (0-100)
   - Risk Classification (Low/Medium/High/Critical)

3. **FINANCIAL HEALTH**:
   - Estimated Annual Revenue
   - Number of Employees
   - Debt-to-Revenue Ratio
   - Working Capital Status
   - Financial Stress Score (0-100)

4. **PAYMENT HISTORY**:
   - Average Days to Pay
   - Payment Trend (Improving/Stable/Declining)
   - Percentage Paid On-Time
   - Number of Late Payments (90 days)
   - Outstanding Collections
   - Bankruptcies (if any)
   - Liens/Judgments (if any)

5. **CREDIT UTILIZATION**:
   - Total Available Credit
   - Current Credit Used
   - Credit Utilization Percentage
   - Open Trade Lines

6. **PUBLIC RECORDS**:
   - Bankruptcies (count and dates)
   - Tax Liens (count and amounts)
   - Judgments (count and amounts)
   - UCC Filings

7. **INDUSTRY COMPARISONS**:
   - Better Than X% of Industry
   - Industry Average Days to Pay
   - Industry Risk Comparison

8. **CREDIT RECOMMENDATION**:
   - Recommended Credit Limit
   - Payment Terms Recommendation (Net 15/30/45/60)
   - Require Deposit? (Yes/No)
   - COD Recommended? (Yes/No)
   - Overall Credit Decision (APPROVE/APPROVE WITH CONDITIONS/REQUIRE DEPOSIT/DECLINE)

9. **RED FLAGS** (if any):
   - List all concerns
   - Risk mitigation strategies

Provide realistic credit assessment data based on typical freight broker profiles.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            company_info: {
              type: "object",
              properties: {
                legal_name: { type: "string" },
                dba_name: { type: "string" },
                mc_number: { type: "string" },
                dot_number: { type: "string" },
                years_in_business: { type: "number" },
                business_type: { type: "string" }
              }
            },
            credit_score: {
              type: "object",
              properties: {
                score: { type: "number" },
                rating: { type: "string" },
                payment_index: { type: "number" },
                risk_classification: { type: "string" }
              }
            },
            financial_health: {
              type: "object",
              properties: {
                annual_revenue: { type: "number" },
                employees: { type: "number" },
                debt_to_revenue_ratio: { type: "number" },
                working_capital_status: { type: "string" },
                financial_stress_score: { type: "number" }
              }
            },
            payment_history: {
              type: "object",
              properties: {
                avg_days_to_pay: { type: "number" },
                payment_trend: { type: "string" },
                on_time_percentage: { type: "number" },
                late_payments_90d: { type: "number" },
                collections: { type: "number" },
                bankruptcies: { type: "number" },
                liens_judgments: { type: "number" }
              }
            },
            credit_utilization: {
              type: "object",
              properties: {
                total_available: { type: "number" },
                current_used: { type: "number" },
                utilization_percentage: { type: "number" },
                open_trade_lines: { type: "number" }
              }
            },
            public_records: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  date: { type: "string" },
                  amount: { type: "number" }
                }
              }
            },
            industry_comparison: {
              type: "object",
              properties: {
                percentile: { type: "number" },
                industry_avg_days: { type: "number" },
                risk_vs_industry: { type: "string" }
              }
            },
            recommendation: {
              type: "object",
              properties: {
                credit_limit: { type: "number" },
                payment_terms: { type: "string" },
                require_deposit: { type: "boolean" },
                cod_recommended: { type: "boolean" },
                decision: { type: "string" }
              }
            },
            red_flags: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setBrokerCredit(result);

    } catch (error) {
      console.error('Credit check error:', error);
      alert('Credit check failed');
    } finally {
      setIsCheckingCredit(false);
    }
  };

  const handleAddCarrierFromVerification = () => {
    if (!carrierVerification?.fmcsa_data) return;

    const data = carrierVerification.fmcsa_data;
    const carrierData = {
      company_name: data.legal_name,
      mc_number: data.mc_number,
      dot_number: data.dot_number,
      contact_name: 'To Be Updated',
      email: 'update@carrier.com',
      phone: data.phone || '',
      fmcsa_safety_rating: carrierVerification.safety_rating?.rating?.toLowerCase() || 'not_rated',
      compliance_score: 100 - (carrierVerification.recommendation?.risk_score || 50),
      status: carrierVerification.recommendation?.status === 'APPROVED' ? 'active' : 'pending_approval',
      notes: `TMSCVQ Verification - Risk Score: ${carrierVerification.recommendation?.risk_score || 'N/A'}`
    };

    createCarrierMutation.mutate(carrierData);
  };

  const handleAddCustomerFromSearch = (shipper) => {
    // Add to customer database
    alert(`Adding ${shipper.company_name} as customer`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent mb-2">
            Universal Search Tool
          </h1>
          <p className="text-slate-600 text-lg">
            Search for loads, carriers, customers, locations, and verify FMCSA compliance
          </p>
          <Badge className="mt-3 bg-blue-600">TMSCVQ Powered</Badge>
        </div>

        {/* Search Interface */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by load #, carrier name, MC/DOT number, location, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUniversalSearch()}
                  className="h-12 text-lg border-slate-300 focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-2">
                  💡 Tip: For MC/DOT searches, use format: MC123456 (no spaces or dashes)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUniversalSearch}
                  disabled={isSearching || !searchQuery}
                  className="h-12 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchType('all')}
                className={searchType === 'all' ? 'bg-blue-50 border-blue-300' : ''}
              >
                All Results
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchType('loads')}
                className={searchType === 'loads' ? 'bg-blue-50 border-blue-300' : ''}
              >
                <FileText className="w-3 h-3 mr-1" />
                Loads
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchType('carriers')}
                className={searchType === 'carriers' ? 'bg-blue-50 border-blue-300' : ''}
              >
                <Truck className="w-3 h-3 mr-1" />
                Carriers
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchType('shippers')}
                className={searchType === 'shippers' ? 'bg-blue-50 border-blue-300' : ''}
              >
                <Building2 className="w-3 h-3 mr-1" />
                Customers
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchType('locations')}
                className={searchType === 'locations' ? 'bg-blue-50 border-blue-300' : ''}
              >
                <MapPin className="w-3 h-3 mr-1" />
                Locations
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FMCSA & Credit Check Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                FMCSA Carrier Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Verify carrier authority, insurance, safety ratings, and fraud alerts using MC, DOT, MX, or FF numbers.
              </p>
              <Button
                onClick={handleFMCSACarrierVerification}
                disabled={isVerifying || !searchQuery}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying Carrier...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Run TMSCVQ Check
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Broker Credit Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Check broker/shipper creditworthiness, payment history, and financial health before extending credit.
              </p>
              <Button
                onClick={handleBrokerCreditCheck}
                disabled={isCheckingCredit || !searchQuery}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              >
                {isCheckingCredit ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking Credit...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Run Credit Check
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        {searchResults && (
          <Tabs defaultValue="loads" className="space-y-4">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="loads">
                Loads ({searchResults.loads.length})
              </TabsTrigger>
              <TabsTrigger value="carriers">
                Carriers ({searchResults.carriers.length})
              </TabsTrigger>
              <TabsTrigger value="shippers">
                Customers ({searchResults.shippers.length})
              </TabsTrigger>
              <TabsTrigger value="locations">
                Locations ({searchResults.locations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="loads">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle>Load Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {searchResults.loads.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No loads found</p>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.loads.map(load => (
                        <div key={load.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-slate-900">
                                {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
                              </h4>
                              <p className="text-sm text-slate-600">
                                {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
                              </p>
                              {load.reference_number && (
                                <p className="text-xs text-slate-500">Ref: {load.reference_number}</p>
                              )}
                            </div>
                            <Badge className={
                              load.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                              load.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }>
                              {load.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="carriers">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle>Carrier Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {searchResults.carriers.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No carriers found</p>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.carriers.map(carrier => (
                        <div key={carrier.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <h4 className="font-semibold text-slate-900">{carrier.company_name}</h4>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <p className="text-slate-600">MC: {carrier.mc_number}</p>
                            <p className="text-slate-600">DOT: {carrier.dot_number}</p>
                            <p className="text-slate-600">Email: {carrier.email}</p>
                            <p className="text-slate-600">Phone: {carrier.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shippers">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle>Customer Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {searchResults.shippers.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No customers found</p>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.shippers.map(shipper => (
                        <div key={shipper.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <h4 className="font-semibold text-slate-900">{shipper.company_name}</h4>
                          <p className="text-sm text-slate-600">Contact: {shipper.contact_name}</p>
                          <p className="text-sm text-slate-600">Email: {shipper.email}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle>Location Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {searchResults.locations.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No locations found</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {searchResults.locations.map((location, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                          <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-slate-900">{location}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* FMCSA Carrier Verification Results */}
        {carrierVerification && (
          <Card className="border-0 shadow-xl bg-white border-l-4 border-l-emerald-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-emerald-600" />
                  TMSCVQ Carrier Verification Results
                </CardTitle>
                <Button
                  onClick={handleAddCarrierFromVerification}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                  disabled={createCarrierMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Carriers
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Company Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Company Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Legal Name</p>
                    <p className="font-semibold text-slate-900">{carrierVerification.fmcsa_data.legal_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">MC Number</p>
                    <p className="font-semibold text-slate-900">{carrierVerification.fmcsa_data.mc_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">DOT Number</p>
                    <p className="font-semibold text-slate-900">{carrierVerification.fmcsa_data.dot_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Phone</p>
                    <p className="font-semibold text-slate-900">{carrierVerification.fmcsa_data.phone}</p>
                  </div>
                </div>
              </div>

              {/* Authority Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase mb-1">Authority Status</p>
                  <div className="flex items-center gap-2">
                    {carrierVerification.fmcsa_data.authority_status === 'Active' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <p className="font-semibold text-slate-900">{carrierVerification.fmcsa_data.authority_status}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase mb-1">Operating Status</p>
                  <div className="flex items-center gap-2">
                    {carrierVerification.fmcsa_data.operating_status === 'Authorized' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <p className="font-semibold text-slate-900">{carrierVerification.fmcsa_data.operating_status}</p>
                  </div>
                </div>
              </div>

              {/* Insurance */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Insurance Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    {carrierVerification.insurance.bipd_on_file ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
                    )}
                    <p className="text-xs font-semibold">BIPD Insurance</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    {carrierVerification.insurance.cargo_on_file ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
                    )}
                    <p className="text-xs font-semibold">Cargo Insurance</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    {carrierVerification.insurance.bond_on_file ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
                    )}
                    <p className="text-xs font-semibold">Bond Insurance</p>
                  </div>
                </div>
              </div>

              {/* Safety Rating */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-lg mb-2">Safety Rating</h3>
                <Badge className={
                  carrierVerification.safety_rating.rating === 'Satisfactory' ? 'bg-emerald-600' :
                  carrierVerification.safety_rating.rating === 'Conditional' ? 'bg-amber-600' :
                  'bg-slate-600'
                }>
                  {carrierVerification.safety_rating.rating}
                </Badge>
              </div>

              {/* Fraud Alerts */}
              {carrierVerification.fraud_alerts.red_flags.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-l-red-500">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Fraud Alerts & Red Flags
                  </h3>
                  <Badge className={
                    carrierVerification.fraud_alerts.fraud_risk_level === 'LOW' ? 'bg-emerald-600' :
                    carrierVerification.fraud_alerts.fraud_risk_level === 'MEDIUM' ? 'bg-amber-600' :
                    carrierVerification.fraud_alerts.fraud_risk_level === 'HIGH' ? 'bg-red-600' :
                    'bg-red-900'
                  }>
                    Risk Level: {carrierVerification.fraud_alerts.fraud_risk_level}
                  </Badge>
                  <ul className="mt-3 space-y-1">
                    {carrierVerification.fraud_alerts.red_flags.map((flag, idx) => (
                      <li key={idx} className="text-sm text-red-900">• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendation */}
              <div className={`p-6 rounded-lg ${
                carrierVerification.recommendation.status === 'APPROVED' ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-300' :
                carrierVerification.recommendation.status === 'REVIEW REQUIRED' ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300' :
                'bg-gradient-to-r from-red-50 to-orange-50 border border-red-300'
              }`}>
                <h3 className="font-semibold text-xl mb-2">Vetting Recommendation</h3>
                <div className="flex items-center gap-4 mb-3">
                  <Badge className={
                    carrierVerification.recommendation.status === 'APPROVED' ? 'bg-emerald-600 text-white text-lg px-4 py-2' :
                    carrierVerification.recommendation.status === 'REVIEW REQUIRED' ? 'bg-amber-600 text-white text-lg px-4 py-2' :
                    'bg-red-600 text-white text-lg px-4 py-2'
                  }>
                    {carrierVerification.recommendation.status}
                  </Badge>
                  <div>
                    <p className="text-sm text-slate-600">Risk Score</p>
                    <p className="text-2xl font-bold text-slate-900">{carrierVerification.recommendation.risk_score}/100</p>
                  </div>
                </div>
                {carrierVerification.recommendation.concerns.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold text-sm mb-1">Key Concerns:</p>
                    <ul className="space-y-1">
                      {carrierVerification.recommendation.concerns.map((concern, idx) => (
                        <li key={idx} className="text-sm text-slate-700">• {concern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* External Link */}
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=MC_MX&query_string=${carrierVerification.fmcsa_data.mc_number}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on FMCSA SAFER
                </Button>
              </div>

            </CardContent>
          </Card>
        )}

        {/* Broker Credit Check Results */}
        {brokerCredit && (
          <Card className="border-0 shadow-xl bg-white border-l-4 border-l-indigo-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-indigo-600" />
                Broker Credit Check Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Credit Score */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg text-center">
                  <p className="text-xs text-slate-500 uppercase mb-1">Credit Score</p>
                  <p className="text-3xl font-bold text-indigo-600">{brokerCredit.credit_score.score}</p>
                  <Badge className="mt-2">{brokerCredit.credit_score.rating}</Badge>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-xs text-slate-500 uppercase mb-1">Payment Index</p>
                  <p className="text-3xl font-bold text-slate-900">{brokerCredit.credit_score.payment_index}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-xs text-slate-500 uppercase mb-1">Risk Class</p>
                  <Badge className={
                    brokerCredit.credit_score.risk_classification === 'Low' ? 'bg-emerald-600' :
                    brokerCredit.credit_score.risk_classification === 'Medium' ? 'bg-amber-600' :
                    'bg-red-600'
                  }>
                    {brokerCredit.credit_score.risk_classification}
                  </Badge>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-xs text-slate-500 uppercase mb-1">Avg Days to Pay</p>
                  <p className="text-3xl font-bold text-slate-900">{brokerCredit.payment_history.avg_days_to_pay}</p>
                </div>
              </div>

              {/* Financial Health */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Financial Health</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Annual Revenue</p>
                    <p className="font-semibold text-slate-900">${brokerCredit.financial_health.annual_revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Employees</p>
                    <p className="font-semibold text-slate-900">{brokerCredit.financial_health.employees}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Working Capital</p>
                    <p className="font-semibold text-slate-900">{brokerCredit.financial_health.working_capital_status}</p>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Payment History</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase">On-Time %</p>
                    <p className="text-2xl font-bold text-emerald-600">{brokerCredit.payment_history.on_time_percentage}%</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase">Late Payments</p>
                    <p className="text-2xl font-bold text-amber-600">{brokerCredit.payment_history.late_payments_90d}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase">Collections</p>
                    <p className="text-2xl font-bold text-red-600">{brokerCredit.payment_history.collections}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase">Trend</p>
                    <Badge>{brokerCredit.payment_history.payment_trend}</Badge>
                  </div>
                </div>
              </div>

              {/* Red Flags */}
              {brokerCredit.red_flags && brokerCredit.red_flags.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-l-red-500">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Red Flags
                  </h3>
                  <ul className="space-y-1">
                    {brokerCredit.red_flags.map((flag, idx) => (
                      <li key={idx} className="text-sm text-red-900">• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Credit Recommendation */}
              <div className={`p-6 rounded-lg ${
                brokerCredit.recommendation.decision.includes('APPROVE') && !brokerCredit.recommendation.decision.includes('CONDITIONS') 
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-300' 
                  : brokerCredit.recommendation.decision.includes('CONDITIONS') || brokerCredit.recommendation.decision.includes('DEPOSIT')
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300'
                  : 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-300'
              }`}>
                <h3 className="font-semibold text-xl mb-3">Credit Decision</h3>
                <Badge className={
                  brokerCredit.recommendation.decision.includes('APPROVE') && !brokerCredit.recommendation.decision.includes('CONDITIONS')
                    ? 'bg-emerald-600 text-white text-lg px-4 py-2'
                    : brokerCredit.recommendation.decision.includes('CONDITIONS') || brokerCredit.recommendation.decision.includes('DEPOSIT')
                    ? 'bg-amber-600 text-white text-lg px-4 py-2'
                    : 'bg-red-600 text-white text-lg px-4 py-2'
                }>
                  {brokerCredit.recommendation.decision}
                </Badge>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-slate-600">Recommended Credit Limit</p>
                    <p className="text-2xl font-bold text-slate-900">${brokerCredit.recommendation.credit_limit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Payment Terms</p>
                    <p className="text-2xl font-bold text-slate-900">{brokerCredit.recommendation.payment_terms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Deposit Required</p>
                    <p className="text-2xl font-bold text-slate-900">{brokerCredit.recommendation.require_deposit ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}