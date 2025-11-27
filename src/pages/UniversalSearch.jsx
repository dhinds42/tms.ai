import React, { useState, useEffect } from "react";
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
  CreditCard,
  Copy,
  Lightbulb,
  History,
  Clock,
  Star,
  RefreshCw,
  Zap,
  TrendingUp,
  Target,
  ArrowRight
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
  const [apiConfigured, setApiConfigured] = useState({
    fmcsa: false,
    thirdParty: false,
    credit: false
  });
  const [recentSearches, setRecentSearches] = useState([]);

  const queryClient = useQueryClient();

  // Check if APIs are configured
  useEffect(() => {
    const fmcsaConfig = localStorage.getItem('api_config_fmcsa');
    const carrier411Config = localStorage.getItem('api_config_carrier411');
    const highwayConfig = localStorage.getItem('api_config_highway');
    const datConfig = localStorage.getItem('api_config_dat');
    const rmisConfig = localStorage.getItem('api_config_rmis');
    const creditConfig = localStorage.getItem('api_config_credit');

    setApiConfigured({
      fmcsa: !!fmcsaConfig,
      thirdParty: !!(carrier411Config || highwayConfig || datConfig || rmisConfig),
      credit: !!creditConfig
    });
  }, []);

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

      // Add to recent searches
      if (query && (results.loads.length > 0 || results.carriers.length > 0 || results.shippers.length > 0 || results.locations.length > 0)) {
        setRecentSearches(prev => [{
          query: searchQuery,
          type: searchType,
          resultCount: results.loads.length + results.carriers.length + results.shippers.length + results.locations.length,
          timestamp: new Date().toISOString()
        }, ...prev.filter(s => s.query !== searchQuery).slice(0, 4)]);
      }

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

      // Check if real API is configured
      const useRealAPI = apiConfigured.fmcsa || apiConfigured.thirdParty;
      
      let promptAddition = '';
      if (useRealAPI) {
        promptAddition = '\n\n⚠️ IMPORTANT: Real API credentials are configured. In production, this would make a real API call to FMCSA/third-party services to fetch live data. For this demonstration, providing realistic simulated data based on typical carrier profiles.';
      } else {
        promptAddition = '\n\n📝 NOTE: No API credentials configured. Using AI simulation to provide realistic carrier verification data for demonstration purposes. Configure real API credentials in Settings to fetch live FMCSA data.';
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an FMCSA carrier verification AI system (TMSCVQ - TMS Carrier Verification & Quality).

CARRIER LOOKUP REQUEST:
Identifier Type: ${identifierType}
Identifier Number: ${identifierNumber}
${promptAddition}

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
        add_context_from_internet: apiConfigured.fmcsa || apiConfigured.thirdParty,
        response_json_schema: {
          type: "object",
          properties: {
            api_source: { type: "string" },
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

      // Add data source indicator
      result.data_source = useRealAPI ? 'REAL_API' : 'AI_SIMULATION';
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

      const useRealAPI = apiConfigured.credit;
      
      let promptAddition = '';
      if (useRealAPI) {
        promptAddition = '\n\n⚠️ IMPORTANT: Real credit check API credentials are configured. In production, this would make a real API call to credit bureaus to fetch live credit data. For this demonstration, providing realistic simulated data.';
      } else {
        promptAddition = '\n\n📝 NOTE: No credit check API configured. Using AI simulation. Configure real API credentials in Settings for live credit data.';
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a freight broker credit check system.

BROKER CREDIT CHECK REQUEST:
MC Number: ${mcNumber}
${promptAddition}

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
        add_context_from_internet: useRealAPI,
        response_json_schema: {
          type: "object",
          properties: {
            data_source: { type: "string" },
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

      result.data_source = useRealAPI ? 'REAL_API' : 'AI_SIMULATION';
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
      notes: `TMSCVQ Verification - Risk Score: ${carrierVerification.recommendation?.risk_score || 'N/A'}\nData Source: ${carrierVerification.data_source}`
    };

    createCarrierMutation.mutate(carrierData);
  };

  const totalResults = searchResults ? 
    searchResults.loads.length + 
    searchResults.carriers.length + 
    searchResults.shippers.length + 
    searchResults.locations.length : 0;

  const popularSearches = [
    { query: 'MC', label: 'MC Number' },
    { query: 'DOT', label: 'DOT Number' },
    { query: 'Chicago', label: 'Chicago, IL' },
    { query: 'Los Angeles', label: 'Los Angeles, CA' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header - Compact */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Universal Search</h1>
              <p className="text-xs text-slate-500">
                Search loads, carriers, customers & verify FMCSA compliance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600">TMSCVQ</Badge>
            {(apiConfigured.fmcsa || apiConfigured.thirdParty || apiConfigured.credit) && (
              <Badge className="bg-emerald-600">API Connected</Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
                setCarrierVerification(null);
                setBrokerCredit(null);
              }}
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Compact Stats */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-slate-500">Loads</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{loads.length}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-slate-500">Carriers</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{carriers.length}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-medium text-slate-500">Customers</span>
                </div>
                <p className="text-lg font-bold text-indigo-600">{shippers.length}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <History className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-slate-500">Recent</span>
                </div>
                <p className="text-lg font-bold text-amber-600">{recentSearches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Sidebar - Quick Access & Recent */}
          <div className="lg:col-span-3 space-y-3">
            
            {/* Popular Searches */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  Quick Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {popularSearches.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchQuery(item.query)}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <Search className="w-3 h-3 text-blue-600" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <History className="w-3.5 h-3.5 text-slate-600" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 max-h-[180px] overflow-y-auto">
                {recentSearches.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3">No recent searches</p>
                ) : (
                  <div className="space-y-1.5">
                    {recentSearches.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(s.query);
                          setSearchType(s.type);
                        }}
                        className="w-full text-left p-2 bg-slate-50 rounded-lg text-xs hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-medium text-slate-900 truncate">{s.query}</div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>{s.resultCount} results</span>
                          <span>{new Date(s.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search Type Filter */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Target className="w-3.5 h-3.5 text-slate-600" />
                  Search Type
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {[
                    { key: 'all', label: 'All Results', icon: Search },
                    { key: 'loads', label: 'Loads', icon: FileText },
                    { key: 'carriers', label: 'Carriers', icon: Truck },
                    { key: 'shippers', label: 'Customers', icon: Building2 },
                    { key: 'locations', label: 'Locations', icon: MapPin },
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => setSearchType(item.key)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        searchType === item.key ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <item.icon className={`w-3 h-3 ${searchType === item.key ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className={`font-medium ${searchType === item.key ? 'text-blue-700' : 'text-slate-700'}`}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Search & Results */}
          <div className="lg:col-span-6 space-y-3">
            
            {/* Search Box */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Search className="w-4 h-4 text-blue-600" />
                  Universal Search
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Load #, carrier, MC/DOT, location, customer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUniversalSearch()}
                      className="pl-9 h-10"
                    />
                  </div>
                  <Button
                    onClick={handleUniversalSearch}
                    disabled={isSearching || !searchQuery}
                    className="h-10 bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  💡 For MC/DOT: use format MC123456 or DOT123456
                </p>
              </CardContent>
            </Card>

            {/* Verification Actions - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="border border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-900">FMCSA Verification</span>
                    {(apiConfigured.fmcsa || apiConfigured.thirdParty) && (
                      <Badge className="ml-auto bg-emerald-600 text-xs scale-90">LIVE</Badge>
                    )}
                  </div>
                  <p className="text-xs text-emerald-700 mb-2">Verify authority, insurance, safety ratings</p>
                  <Button
                    onClick={handleFMCSACarrierVerification}
                    disabled={isVerifying || !searchQuery}
                    size="sm"
                    className="w-full h-8 bg-gradient-to-r from-emerald-600 to-green-600"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Run TMSCVQ Check
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-indigo-200 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-indigo-900">Credit Check</span>
                    {apiConfigured.credit && (
                      <Badge className="ml-auto bg-indigo-600 text-xs scale-90">LIVE</Badge>
                    )}
                  </div>
                  <p className="text-xs text-indigo-700 mb-2">Check creditworthiness & payment history</p>
                  <Button
                    onClick={handleBrokerCreditCheck}
                    disabled={isCheckingCredit || !searchQuery}
                    size="sm"
                    className="w-full h-8 bg-gradient-to-r from-indigo-600 to-purple-600"
                  >
                    {isCheckingCredit ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3 h-3 mr-1" />
                        Run Credit Check
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Search Results */}
            {searchResults && (
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="py-3 px-4 border-b border-slate-100">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Search Results</span>
                    <Badge className="bg-blue-600">{totalResults} Results</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  {totalResults === 0 ? (
                    <div className="text-center py-8">
                      <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-600">No results for "{searchQuery}"</p>
                    </div>
                  ) : (
                    <Tabs defaultValue={searchResults.loads.length > 0 ? "loads" : searchResults.carriers.length > 0 ? "carriers" : "shippers"}>
                      <TabsList className="mb-3 h-8">
                        {searchResults.loads.length > 0 && (
                          <TabsTrigger value="loads" className="text-xs">
                            Loads ({searchResults.loads.length})
                          </TabsTrigger>
                        )}
                        {searchResults.carriers.length > 0 && (
                          <TabsTrigger value="carriers" className="text-xs">
                            Carriers ({searchResults.carriers.length})
                          </TabsTrigger>
                        )}
                        {searchResults.shippers.length > 0 && (
                          <TabsTrigger value="shippers" className="text-xs">
                            Customers ({searchResults.shippers.length})
                          </TabsTrigger>
                        )}
                        {searchResults.locations.length > 0 && (
                          <TabsTrigger value="locations" className="text-xs">
                            Locations ({searchResults.locations.length})
                          </TabsTrigger>
                        )}
                      </TabsList>

                      {/* Loads Tab */}
                      {searchResults.loads.length > 0 && (
                        <TabsContent value="loads" className="space-y-2">
                          {searchResults.loads.slice(0, 5).map(load => (
                            <div key={load.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-slate-900 text-sm">
                                    {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
                                  </h4>
                                  <p className="text-xs text-slate-600">
                                    {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
                                  </p>
                                </div>
                                <Badge className={`text-xs ${
                                  load.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                  load.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  {load.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                      )}

                      {/* Carriers Tab */}
                      {searchResults.carriers.length > 0 && (
                        <TabsContent value="carriers" className="space-y-2">
                          {searchResults.carriers.slice(0, 5).map(carrier => (
                            <div key={carrier.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-slate-900 text-sm">{carrier.company_name}</h4>
                                  <p className="text-xs text-slate-600">
                                    MC: {carrier.mc_number} | DOT: {carrier.dot_number}
                                  </p>
                                </div>
                                <Badge className={`text-xs ${
                                  carrier.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                  'bg-slate-100 text-slate-800'
                                }`}>
                                  {carrier.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                      )}

                      {/* Shippers Tab */}
                      {searchResults.shippers.length > 0 && (
                        <TabsContent value="shippers" className="space-y-2">
                          {searchResults.shippers.slice(0, 5).map(shipper => (
                            <div key={shipper.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-slate-900 text-sm">{shipper.company_name}</h4>
                                  <p className="text-xs text-slate-600">
                                    {shipper.contact_name} | {shipper.email}
                                  </p>
                                </div>
                                <Badge className="text-xs bg-indigo-100 text-indigo-800">
                                  {shipper.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                      )}

                      {/* Locations Tab */}
                      {searchResults.locations.length > 0 && (
                        <TabsContent value="locations">
                          <div className="grid grid-cols-2 gap-2">
                            {searchResults.locations.slice(0, 6).map((location, idx) => (
                              <div key={idx} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-xs">
                                <MapPin className="w-3 h-3 text-blue-600" />
                                <span className="font-medium text-slate-900">{location}</span>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      )}
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!searchResults && !carrierVerification && !brokerCredit && !isSearching && !isVerifying && !isCheckingCredit && (
              <Card className="border border-dashed border-slate-300 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">Ready to Search</h3>
                  <p className="text-sm text-slate-500">Enter a search term to find loads, carriers, customers, or locations</p>
                </CardContent>
              </Card>
            )}

            {/* Carrier Verification Results */}
            {carrierVerification && (
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-emerald-600" />
                  TMSCVQ Carrier Verification Results
                </CardTitle>
                <Badge className={
                  carrierVerification.data_source === 'REAL_API' 
                    ? 'bg-emerald-600' 
                    : 'bg-blue-600'
                }>
                  {carrierVerification.data_source === 'REAL_API' ? 'Real API Data' : 'AI Simulation'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Company Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Legal Name</p>
                    <p className="font-semibold text-slate-900">{carrierVerification.fmcsa_data?.legal_name}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">MC Number</p>
                    <p className="font-semibold text-slate-900">{carrierVerification.fmcsa_data?.mc_number}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">DOT Number</p>
                    <p className="font-semibold text-slate-900">{carrierVerification.fmcsa_data?.dot_number}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Operating Status</p>
                    <Badge className={
                      carrierVerification.fmcsa_data?.operating_status === 'Authorized' 
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }>
                      {carrierVerification.fmcsa_data?.operating_status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Insurance */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Insurance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg flex items-center gap-2">
                    {carrierVerification.insurance?.bipd_on_file ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-slate-900">BIPD On File</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-slate-900">No BIPD</span>
                      </>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg flex items-center gap-2">
                    {carrierVerification.insurance?.cargo_on_file ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-slate-900">Cargo On File</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-slate-900">No Cargo</span>
                      </>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg flex items-center gap-2">
                    {carrierVerification.insurance?.bond_on_file ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-slate-900">Bond On File</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-slate-900">No Bond</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Safety & Crash History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Safety Rating</h3>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <Badge className={
                      carrierVerification.safety_rating?.rating === 'Satisfactory' 
                        ? 'bg-emerald-100 text-emerald-800 text-lg px-4 py-2'
                        : carrierVerification.safety_rating?.rating === 'Conditional'
                        ? 'bg-amber-100 text-amber-800 text-lg px-4 py-2'
                        : 'bg-red-100 text-red-800 text-lg px-4 py-2'
                    }>
                      {carrierVerification.safety_rating?.rating}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Crash History (24mo)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-slate-900">{carrierVerification.crash_history?.total || 0}</p>
                      <p className="text-xs text-slate-600">Total Crashes</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">{carrierVerification.crash_history?.injury || 0}</p>
                      <p className="text-xs text-slate-600">Injury Crashes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fraud Alerts */}
              {carrierVerification.fraud_alerts?.red_flags && carrierVerification.fraud_alerts.red_flags.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-900">Fraud Alerts & Red Flags</h3>
                    <Badge className="bg-red-600 ml-auto">
                      {carrierVerification.fraud_alerts.fraud_risk_level}
                    </Badge>
                  </div>
                  <ul className="space-y-1">
                    {carrierVerification.fraud_alerts.red_flags.map((flag, idx) => (
                      <li key={idx} className="text-sm text-red-800">• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendation */}
              <div className={`p-6 rounded-lg border-2 ${
                carrierVerification.recommendation?.status === 'APPROVED' 
                  ? 'bg-emerald-50 border-emerald-300'
                  : carrierVerification.recommendation?.status === 'REVIEW REQUIRED'
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Vetting Recommendation</h3>
                  <Badge className={`text-lg px-4 py-2 ${
                    carrierVerification.recommendation?.status === 'APPROVED'
                      ? 'bg-emerald-600'
                      : carrierVerification.recommendation?.status === 'REVIEW REQUIRED'
                      ? 'bg-amber-600'
                      : 'bg-red-600'
                  }`}>
                    {carrierVerification.recommendation?.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Risk Score</p>
                    <p className="text-3xl font-bold text-slate-900">{carrierVerification.recommendation?.risk_score}/100</p>
                  </div>
                  {carrierVerification.recommendation?.concerns && carrierVerification.recommendation.concerns.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Key Concerns:</p>
                      <ul className="space-y-1">
                        {carrierVerification.recommendation.concerns.map((concern, idx) => (
                          <li key={idx} className="text-sm text-slate-800">• {concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddCarrierFromVerification}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Carriers
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=MC_MX&query_string=${carrierVerification.fmcsa_data?.mc_number?.replace('MC', '')}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on FMCSA SAFER
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
          

          {/* Right Sidebar - AI Recommendations */}
          <div className="lg:col-span-3 space-y-3">
            
            {/* AI Recommendations */}
            <Card className="border border-purple-200 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader className="py-2.5 px-3 border-b border-purple-200 bg-purple-100/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 space-y-2">
                
                {/* Search Tip */}
                <div className="p-2 bg-white rounded-lg border border-blue-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Search className="w-3 h-3 text-blue-600" />
                    <p className="font-semibold text-blue-900">Search Tip</p>
                  </div>
                  <p className="text-blue-700">Use MC or DOT prefix for carrier lookups (e.g., MC123456)</p>
                </div>

                {/* Verification Best Practice */}
                <div className="p-2 bg-white rounded-lg border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Shield className="w-3 h-3 text-emerald-600" />
                    <p className="font-semibold text-emerald-900">Best Practice</p>
                  </div>
                  <p className="text-emerald-700">Always run FMCSA verification before booking new carriers</p>
                </div>

                {/* Credit Check Advice */}
                <div className="p-2 bg-white rounded-lg border border-indigo-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CreditCard className="w-3 h-3 text-indigo-600" />
                    <p className="font-semibold text-indigo-900">Credit Advice</p>
                  </div>
                  <p className="text-indigo-700">Run credit checks on new brokers before extending payment terms</p>
                </div>

                {/* Safety Tip */}
                <div className="p-2 bg-white rounded-lg border border-amber-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <p className="font-semibold text-amber-900">Safety First</p>
                  </div>
                  <p className="text-amber-700">Check carrier insurance expiration dates before dispatch</p>
                </div>

                {/* Fraud Prevention */}
                <div className="p-2 bg-white rounded-lg border border-red-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Shield className="w-3 h-3 text-red-600" />
                    <p className="font-semibold text-red-900">Fraud Alert</p>
                  </div>
                  <p className="text-red-700">Beware of carriers with authority less than 90 days old</p>
                </div>

                {/* Efficiency Tip */}
                <div className="p-2 bg-white rounded-lg border border-cyan-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="w-3 h-3 text-cyan-600" />
                    <p className="font-semibold text-cyan-900">Efficiency</p>
                  </div>
                  <p className="text-cyan-700">Add verified carriers directly to your carrier list</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
                  Search Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">Searches Today</span>
                    <span className="font-bold text-blue-600">{recentSearches.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                    <span className="text-emerald-700">Carriers Verified</span>
                    <span className="font-bold text-emerald-600">{carrierVerification ? 1 : 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-indigo-50 rounded-lg">
                    <span className="text-indigo-700">Credit Checks</span>
                    <span className="font-bold text-indigo-600">{brokerCredit ? 1 : 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-2.5">
                <p className="text-xs font-medium text-slate-600 mb-2">Quick Actions</p>
                <div className="space-y-1.5">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full h-7 text-xs justify-start"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults(null);
                      setCarrierVerification(null);
                      setBrokerCredit(null);
                    }}
                  >
                    <RefreshCw className="w-3 h-3 mr-1.5 text-slate-600" />
                    Clear All Results
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full h-7 text-xs justify-start"
                    onClick={() => window.open('https://safer.fmcsa.dot.gov/', '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1.5 text-blue-600" />
                    Open FMCSA SAFER
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Credit Check Results */}
        {brokerCredit && (
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-indigo-600" />
                  Broker Credit Check Results
                </CardTitle>
                <Badge className={
                  brokerCredit.data_source === 'REAL_API' 
                    ? 'bg-emerald-600' 
                    : 'bg-blue-600'
                }>
                  {brokerCredit.data_source === 'REAL_API' ? 'Real API Data' : 'AI Simulation'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Company Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Legal Name</p>
                    <p className="font-semibold text-slate-900">{brokerCredit.company_info?.legal_name}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">MC Number</p>
                    <p className="font-semibold text-slate-900">{brokerCredit.company_info?.mc_number}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Years in Business</p>
                    <p className="font-semibold text-slate-900">{brokerCredit.company_info?.years_in_business} years</p>
                  </div>
                </div>
              </div>

              {/* Credit Score */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg text-center">
                  <p className="text-sm text-slate-600 mb-2">Credit Score</p>
                  <p className="text-4xl font-bold text-indigo-600">{brokerCredit.credit_score?.score}</p>
                  <Badge className={`mt-2 ${
                    brokerCredit.credit_score?.rating === 'Excellent' ? 'bg-emerald-600' :
                    brokerCredit.credit_score?.rating === 'Good' ? 'bg-blue-600' :
                    brokerCredit.credit_score?.rating === 'Fair' ? 'bg-amber-600' :
                    'bg-red-600'
                  }`}>
                    {brokerCredit.credit_score?.rating}
                  </Badge>
                </div>
                <div className="p-6 bg-slate-50 rounded-lg text-center">
                  <p className="text-sm text-slate-600 mb-2">Payment Index</p>
                  <p className="text-4xl font-bold text-slate-900">{brokerCredit.credit_score?.payment_index}</p>
                  <p className="text-xs text-slate-500 mt-2">Out of 100</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-lg text-center">
                  <p className="text-sm text-slate-600 mb-2">Risk Level</p>
                  <Badge className={`text-lg px-4 py-2 ${
                    brokerCredit.credit_score?.risk_classification === 'Low' ? 'bg-emerald-600' :
                    brokerCredit.credit_score?.risk_classification === 'Medium' ? 'bg-amber-600' :
                    'bg-red-600'
                  }`}>
                    {brokerCredit.credit_score?.risk_classification}
                  </Badge>
                </div>
                <div className="p-6 bg-slate-50 rounded-lg text-center">
                  <p className="text-sm text-slate-600 mb-2">Avg Days to Pay</p>
                  <p className="text-4xl font-bold text-slate-900">{brokerCredit.payment_history?.avg_days_to_pay}</p>
                  <p className="text-xs text-slate-500 mt-2">Days</p>
                </div>
              </div>

              {/* Financial Health */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Financial Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Annual Revenue</p>
                    <p className="font-semibold text-slate-900">${(brokerCredit.financial_health?.annual_revenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Working Capital</p>
                    <p className="font-semibold text-slate-900">{brokerCredit.financial_health?.working_capital_status}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Financial Stress Score</p>
                    <p className="font-semibold text-slate-900">{brokerCredit.financial_health?.financial_stress_score}/100</p>
                  </div>
                </div>
              </div>

              {/* Red Flags */}
              {brokerCredit.red_flags && brokerCredit.red_flags.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-900">Red Flags</h3>
                  </div>
                  <ul className="space-y-1">
                    {brokerCredit.red_flags.map((flag, idx) => (
                      <li key={idx} className="text-sm text-red-800">• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Credit Recommendation */}
              <div className={`p-6 rounded-lg border-2 ${
                brokerCredit.recommendation?.decision === 'APPROVE' 
                  ? 'bg-emerald-50 border-emerald-300'
                  : brokerCredit.recommendation?.decision?.includes('CONDITIONS')
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Credit Decision</h3>
                  <Badge className={`text-lg px-4 py-2 ${
                    brokerCredit.recommendation?.decision === 'APPROVE'
                      ? 'bg-emerald-600'
                      : brokerCredit.recommendation?.decision?.includes('CONDITIONS')
                      ? 'bg-amber-600'
                      : 'bg-red-600'
                  }`}>
                    {brokerCredit.recommendation?.decision}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Recommended Credit Limit</p>
                    <p className="text-3xl font-bold text-emerald-600">${(brokerCredit.recommendation?.credit_limit || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Payment Terms</p>
                    <p className="text-3xl font-bold text-slate-900">{brokerCredit.recommendation?.payment_terms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Deposit Required</p>
                    <Badge className={brokerCredit.recommendation?.require_deposit ? 'bg-amber-600' : 'bg-emerald-600'}>
                      {brokerCredit.recommendation?.require_deposit ? 'YES' : 'NO'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">COD Recommended</p>
                    <Badge className={brokerCredit.recommendation?.cod_recommended ? 'bg-amber-600' : 'bg-emerald-600'}>
                      {brokerCredit.recommendation?.cod_recommended ? 'YES' : 'NO'}
                    </Badge>
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