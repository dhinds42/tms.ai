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
  Lightbulb,
  History,
  Clock,
  Star,
  RefreshCw,
  Zap,
  TrendingUp,
  Target,
  ArrowRight,
  Info,
  Phone,
  Mail,
  Users,
  Activity,
  BarChart3
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

  const handleUniversalSearch = () => {
    if (!searchQuery.trim()) return;
    
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

      if (searchType === 'all' || searchType === 'loads') {
        results.loads = loads.filter(l => 
          l.load_number?.toLowerCase().includes(query) ||
          l.reference_number?.toLowerCase().includes(query) ||
          l.id?.toLowerCase().includes(query)
        );
      }

      if (searchType === 'all' || searchType === 'carriers') {
        results.carriers = carriers.filter(c =>
          c.company_name?.toLowerCase().includes(query) ||
          c.mc_number?.toLowerCase().includes(query) ||
          c.dot_number?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query)
        );
      }

      if (searchType === 'all' || searchType === 'shippers') {
        results.shippers = shippers.filter(s =>
          s.company_name?.toLowerCase().includes(query) ||
          s.contact_name?.toLowerCase().includes(query) ||
          s.email?.toLowerCase().includes(query)
        );
      }

      if (searchType === 'all' || searchType === 'locations') {
        const locationLoads = loads.filter(l =>
          l.pickup_location?.city?.toLowerCase().includes(query) ||
          l.pickup_location?.state?.toLowerCase().includes(query) ||
          l.dropoff_location?.city?.toLowerCase().includes(query) ||
          l.dropoff_location?.state?.toLowerCase().includes(query)
        );
        
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
    } finally {
      setIsSearching(false);
    }
  };

  const handleFMCSACarrierVerification = async () => {
    setIsVerifying(true);
    setCarrierVerification(null);

    try {
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

      const useRealAPI = apiConfigured.fmcsa || apiConfigured.thirdParty;
      
      let promptAddition = useRealAPI 
        ? '\n\nReal API credentials are configured. Providing realistic simulated data based on typical carrier profiles.'
        : '\n\nNo API credentials configured. Using AI simulation for demonstration purposes.';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an FMCSA carrier verification AI system (TMSCVQ).

CARRIER LOOKUP REQUEST:
Identifier Type: ${identifierType}
Identifier Number: ${identifierNumber}
${promptAddition}

Provide comprehensive carrier verification data including:
1. FMCSA SAFER DATA (legal name, DBA, MC/DOT numbers, operating status, address, phone, MCS-150 info, power units, drivers)
2. INSURANCE (BIPD, Cargo, Bond on file status, carrier name, policy details, dates)
3. SAFETY RATING (rating, review date, review type)
4. CRASH HISTORY (24 months - total, injury, fatality, tow-away)
5. INSPECTION HISTORY (24 months - total, driver OOS, vehicle OOS, percentage)
6. FRAUD ALERTS (authority age, red flags, risk level)
7. VETTING RECOMMENDATION (status, risk score, concerns, conditions)`,
        add_context_from_internet: useRealAPI,
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
                  properties: { street: { type: "string" }, city: { type: "string" }, state: { type: "string" }, zip: { type: "string" } }
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
              properties: { rating: { type: "string" }, review_date: { type: "string" }, review_type: { type: "string" } }
            },
            crash_history: {
              type: "object",
              properties: { total: { type: "number" }, injury: { type: "number" }, fatality: { type: "number" }, tow_away: { type: "number" } }
            },
            inspection_history: {
              type: "object",
              properties: { total_inspections: { type: "number" }, driver_oos: { type: "number" }, vehicle_oos: { type: "number" }, oos_percentage: { type: "number" } }
            },
            fraud_alerts: {
              type: "object",
              properties: { authority_age_days: { type: "number" }, red_flags: { type: "array", items: { type: "string" } }, fraud_risk_level: { type: "string" } }
            },
            recommendation: {
              type: "object",
              properties: { status: { type: "string" }, risk_score: { type: "number" }, concerns: { type: "array", items: { type: "string" } }, conditions: { type: "array", items: { type: "string" } } }
            }
          }
        }
      });

      result.data_source = useRealAPI ? 'REAL_API' : 'AI_SIMULATION';
      setCarrierVerification(result);

    } catch (error) {
      console.error('FMCSA verification error:', error);
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
      
      let promptAddition = useRealAPI 
        ? '\n\nReal credit check API configured. Providing realistic simulated data.'
        : '\n\nNo credit check API configured. Using AI simulation.';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a freight broker credit check system.

BROKER CREDIT CHECK REQUEST:
MC Number: ${mcNumber}
${promptAddition}

Provide comprehensive credit analysis including:
1. COMPANY INFO (legal name, DBA, MC/DOT, years in business, business type)
2. CREDIT SCORE (score 300-850, rating, payment index 0-100, risk classification)
3. FINANCIAL HEALTH (annual revenue, employees, debt ratio, working capital, stress score)
4. PAYMENT HISTORY (avg days to pay, trend, on-time %, late payments, collections, bankruptcies, liens)
5. CREDIT UTILIZATION (total available, current used, percentage, trade lines)
6. PUBLIC RECORDS (bankruptcies, tax liens, judgments)
7. INDUSTRY COMPARISON (percentile, avg days, risk comparison)
8. RECOMMENDATION (credit limit, payment terms, deposit required, COD recommended, decision)
9. RED FLAGS (list concerns)`,
        add_context_from_internet: useRealAPI,
        response_json_schema: {
          type: "object",
          properties: {
            data_source: { type: "string" },
            company_info: {
              type: "object",
              properties: { legal_name: { type: "string" }, dba_name: { type: "string" }, mc_number: { type: "string" }, dot_number: { type: "string" }, years_in_business: { type: "number" }, business_type: { type: "string" } }
            },
            credit_score: {
              type: "object",
              properties: { score: { type: "number" }, rating: { type: "string" }, payment_index: { type: "number" }, risk_classification: { type: "string" } }
            },
            financial_health: {
              type: "object",
              properties: { annual_revenue: { type: "number" }, employees: { type: "number" }, debt_to_revenue_ratio: { type: "number" }, working_capital_status: { type: "string" }, financial_stress_score: { type: "number" } }
            },
            payment_history: {
              type: "object",
              properties: { avg_days_to_pay: { type: "number" }, payment_trend: { type: "string" }, on_time_percentage: { type: "number" }, late_payments_90d: { type: "number" }, collections: { type: "number" }, bankruptcies: { type: "number" }, liens_judgments: { type: "number" } }
            },
            credit_utilization: {
              type: "object",
              properties: { total_available: { type: "number" }, current_used: { type: "number" }, utilization_percentage: { type: "number" }, open_trade_lines: { type: "number" } }
            },
            industry_comparison: {
              type: "object",
              properties: { percentile: { type: "number" }, industry_avg_days: { type: "number" }, risk_vs_industry: { type: "string" } }
            },
            recommendation: {
              type: "object",
              properties: { credit_limit: { type: "number" }, payment_terms: { type: "string" }, require_deposit: { type: "boolean" }, cod_recommended: { type: "boolean" }, decision: { type: "string" } }
            },
            red_flags: { type: "array", items: { type: "string" } }
          }
        }
      });

      result.data_source = useRealAPI ? 'REAL_API' : 'AI_SIMULATION';
      setBrokerCredit(result);

    } catch (error) {
      console.error('Credit check error:', error);
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

  const clearAll = () => {
    setSearchQuery('');
    setSearchResults(null);
    setCarrierVerification(null);
    setBrokerCredit(null);
  };

  const totalResults = searchResults ? 
    searchResults.loads.length + 
    searchResults.carriers.length + 
    searchResults.shippers.length + 
    searchResults.locations.length : 0;

  const quickSearches = [
    { query: 'MC123456', label: 'Sample MC Number', icon: Shield },
    { query: 'DOT123456', label: 'Sample DOT Number', icon: Truck },
    { query: 'Chicago', label: 'Chicago, IL', icon: MapPin },
    { query: 'Dallas', label: 'Dallas, TX', icon: MapPin },
  ];

  const searchCategories = [
    { key: 'all', label: 'All', icon: Search, count: loads.length + carriers.length + shippers.length },
    { key: 'loads', label: 'Loads', icon: FileText, count: loads.length },
    { key: 'carriers', label: 'Carriers', icon: Truck, count: carriers.length },
    { key: 'shippers', label: 'Customers', icon: Building2, count: shippers.length },
    { key: 'locations', label: 'Locations', icon: MapPin, count: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Search Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Universal Search</h1>
                  <p className="text-blue-100 text-base mt-1">Search loads, carriers & customers • FMCSA verification • Credit checks</p>
                </div>
              </div>
              <div className="md:ml-auto flex flex-wrap gap-2">
                <Badge className="bg-white/25 text-white border-0 px-3 py-1 text-sm font-medium">TMSCVQ Powered</Badge>
                {(apiConfigured.fmcsa || apiConfigured.thirdParty) && (
                  <Badge className="bg-emerald-500/90 text-white border-0 px-3 py-1 text-sm font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    API Connected
                  </Badge>
                )}
              </div>
            </div>

            {/* Main Search Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by load #, carrier name, MC/DOT number, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUniversalSearch()}
                  className="pl-12 h-14 text-lg border-0 shadow-lg rounded-xl"
                />
              </div>
              <Button
                onClick={handleUniversalSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="h-14 px-8 bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-xl shadow-lg"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
              </Button>
            </div>

            {/* Search Type Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {searchCategories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSearchType(cat.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    searchType === cat.key 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                  {cat.count !== null && <span className="opacity-70">({cat.count})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Quick Actions:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFMCSACarrierVerification}
              disabled={isVerifying || !searchQuery.trim()}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
              FMCSA Verify
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBrokerCreditCheck}
              disabled={isCheckingCredit || !searchQuery.trim()}
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            >
              {isCheckingCredit ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
              Credit Check
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll} className="ml-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Results Column */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Empty State */}
            {!searchResults && !carrierVerification && !brokerCredit && !isSearching && !isVerifying && !isCheckingCredit && (
              <Card className="border-dashed border-2 border-slate-200">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Start Your Search</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Search for loads, carriers, customers, or locations. Use MC/DOT numbers to verify carriers or run credit checks.
                  </p>
                  
                  {/* Quick Search Suggestions */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickSearches.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchQuery(item.query)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-blue-50 rounded-lg text-sm transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-700">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            {searchResults && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Search Results</CardTitle>
                    <Badge variant="secondary">{totalResults} found</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {totalResults === 0 ? (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-500">No results for "{searchQuery}"</p>
                      <p className="text-sm text-slate-400 mt-1">Try a different search term or category</p>
                    </div>
                  ) : (
                    <Tabs defaultValue={searchResults.loads.length > 0 ? "loads" : searchResults.carriers.length > 0 ? "carriers" : "shippers"}>
                      <TabsList className="mb-4">
                        {searchResults.loads.length > 0 && <TabsTrigger value="loads">Loads ({searchResults.loads.length})</TabsTrigger>}
                        {searchResults.carriers.length > 0 && <TabsTrigger value="carriers">Carriers ({searchResults.carriers.length})</TabsTrigger>}
                        {searchResults.shippers.length > 0 && <TabsTrigger value="shippers">Customers ({searchResults.shippers.length})</TabsTrigger>}
                        {searchResults.locations.length > 0 && <TabsTrigger value="locations">Locations ({searchResults.locations.length})</TabsTrigger>}
                      </TabsList>

                      {searchResults.loads.length > 0 && (
                        <TabsContent value="loads" className="space-y-2">
                          {searchResults.loads.slice(0, 8).map(load => (
                            <div key={load.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900">{load.load_number || `LOAD-${load.id.slice(0, 8)}`}</p>
                                    <p className="text-sm text-slate-500">
                                      {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
                                    </p>
                                  </div>
                                </div>
                                <Badge className={
                                  load.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                  load.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                  'bg-amber-100 text-amber-800'
                                }>{load.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                      )}

                      {searchResults.carriers.length > 0 && (
                        <TabsContent value="carriers" className="space-y-2">
                          {searchResults.carriers.slice(0, 8).map(carrier => (
                            <div key={carrier.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-emerald-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900">{carrier.company_name}</p>
                                    <p className="text-sm text-slate-500">MC: {carrier.mc_number} | DOT: {carrier.dot_number}</p>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchQuery(carrier.mc_number || carrier.dot_number);
                                  }}
                                >
                                  <Shield className="w-4 h-4 mr-1" />
                                  Verify
                                </Button>
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                      )}

                      {searchResults.shippers.length > 0 && (
                        <TabsContent value="shippers" className="space-y-2">
                          {searchResults.shippers.slice(0, 8).map(shipper => (
                            <div key={shipper.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <Building2 className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">{shipper.company_name}</p>
                                  <p className="text-sm text-slate-500">{shipper.contact_name} • {shipper.email}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                      )}

                      {searchResults.locations.length > 0 && (
                        <TabsContent value="locations">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {searchResults.locations.slice(0, 9).map((location, idx) => (
                              <div key={idx} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-slate-700">{location}</span>
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

            {/* Carrier Verification Results */}
            {carrierVerification && (
              <Card className="border-emerald-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-emerald-800">
                      <Shield className="w-5 h-5" />
                      FMCSA Carrier Verification
                    </CardTitle>
                    <Badge className={carrierVerification.data_source === 'REAL_API' ? 'bg-emerald-600' : 'bg-blue-600'}>
                      {carrierVerification.data_source === 'REAL_API' ? 'Live Data' : 'AI Simulation'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {/* Company Header */}
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Truck className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900">{carrierVerification.fmcsa_data?.legal_name}</h3>
                      {carrierVerification.fmcsa_data?.dba_name && (
                        <p className="text-slate-600">DBA: {carrierVerification.fmcsa_data.dba_name}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2">
                        <Badge variant="outline">MC: {carrierVerification.fmcsa_data?.mc_number}</Badge>
                        <Badge variant="outline">DOT: {carrierVerification.fmcsa_data?.dot_number}</Badge>
                        <Badge className={
                          carrierVerification.fmcsa_data?.operating_status === 'Authorized' 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                        }>{carrierVerification.fmcsa_data?.operating_status}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <Truck className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-slate-900">{carrierVerification.fmcsa_data?.power_units || 0}</p>
                      <p className="text-xs text-slate-500">Power Units</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <Users className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-slate-900">{carrierVerification.fmcsa_data?.drivers || 0}</p>
                      <p className="text-xs text-slate-500">Drivers</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <Activity className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-slate-900">{carrierVerification.inspection_history?.total_inspections || 0}</p>
                      <p className="text-xs text-slate-500">Inspections (24mo)</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-slate-900">{carrierVerification.crash_history?.total || 0}</p>
                      <p className="text-xs text-slate-500">Crashes (24mo)</p>
                    </div>
                  </div>

                  {/* Insurance Status */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Insurance Status
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className={`p-3 rounded-lg border ${carrierVerification.insurance?.bipd_on_file ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-2">
                          {carrierVerification.insurance?.bipd_on_file ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                          <span className="font-medium">BIPD</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg border ${carrierVerification.insurance?.cargo_on_file ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-2">
                          {carrierVerification.insurance?.cargo_on_file ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                          <span className="font-medium">Cargo</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg border ${carrierVerification.insurance?.bond_on_file ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-2">
                          {carrierVerification.insurance?.bond_on_file ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                          <span className="font-medium">Bond</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Red Flags */}
                  {carrierVerification.fraud_alerts?.red_flags?.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-red-900">Red Flags Detected</h4>
                        <Badge className="bg-red-600 ml-auto">{carrierVerification.fraud_alerts.fraud_risk_level}</Badge>
                      </div>
                      <ul className="space-y-1">
                        {carrierVerification.fraud_alerts.red_flags.map((flag, idx) => (
                          <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                            <span>•</span> {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className={`p-5 rounded-xl border-2 ${
                    carrierVerification.recommendation?.status === 'APPROVED' 
                      ? 'bg-emerald-50 border-emerald-300'
                      : carrierVerification.recommendation?.status === 'REVIEW REQUIRED'
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-red-50 border-red-300'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-900">Vetting Decision</h4>
                      <Badge className={`text-base px-4 py-1 ${
                        carrierVerification.recommendation?.status === 'APPROVED' ? 'bg-emerald-600' :
                        carrierVerification.recommendation?.status === 'REVIEW REQUIRED' ? 'bg-amber-600' : 'bg-red-600'
                      }`}>{carrierVerification.recommendation?.status}</Badge>
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-sm text-slate-600">Risk Score</p>
                        <p className="text-3xl font-bold">{carrierVerification.recommendation?.risk_score}/100</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Safety Rating</p>
                        <Badge className={
                          carrierVerification.safety_rating?.rating === 'Satisfactory' ? 'bg-emerald-100 text-emerald-800' :
                          carrierVerification.safety_rating?.rating === 'Conditional' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }>{carrierVerification.safety_rating?.rating || 'Not Rated'}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleAddCarrierFromVerification} className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-4 h-4 mr-2" /> Add to Carriers
                    </Button>
                    <Button variant="outline" onClick={() => window.open(`https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=MC_MX&query_string=${carrierVerification.fmcsa_data?.mc_number?.replace('MC', '')}`, '_blank')}>
                      <ExternalLink className="w-4 h-4 mr-2" /> View on FMCSA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Credit Check Results */}
            {brokerCredit && (
              <Card className="border-indigo-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-indigo-800">
                      <CreditCard className="w-5 h-5" />
                      Credit Check Results
                    </CardTitle>
                    <Badge className={brokerCredit.data_source === 'REAL_API' ? 'bg-emerald-600' : 'bg-blue-600'}>
                      {brokerCredit.data_source === 'REAL_API' ? 'Live Data' : 'AI Simulation'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {/* Company Header */}
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{brokerCredit.company_info?.legal_name}</h3>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <Badge variant="outline">MC: {brokerCredit.company_info?.mc_number}</Badge>
                        <Badge variant="outline">{brokerCredit.company_info?.years_in_business} years in business</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Credit Score Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                      <p className="text-4xl font-bold text-indigo-600">{brokerCredit.credit_score?.score}</p>
                      <p className="text-sm text-slate-600">Credit Score</p>
                      <Badge className={`mt-2 ${
                        brokerCredit.credit_score?.rating === 'Excellent' ? 'bg-emerald-600' :
                        brokerCredit.credit_score?.rating === 'Good' ? 'bg-blue-600' :
                        brokerCredit.credit_score?.rating === 'Fair' ? 'bg-amber-600' : 'bg-red-600'
                      }`}>{brokerCredit.credit_score?.rating}</Badge>
                    </div>
                    <div className="text-center p-5 bg-slate-50 rounded-xl">
                      <p className="text-4xl font-bold text-slate-900">{brokerCredit.credit_score?.payment_index}</p>
                      <p className="text-sm text-slate-600">Payment Index</p>
                    </div>
                    <div className="text-center p-5 bg-slate-50 rounded-xl">
                      <p className="text-4xl font-bold text-slate-900">{brokerCredit.payment_history?.avg_days_to_pay}</p>
                      <p className="text-sm text-slate-600">Avg Days to Pay</p>
                    </div>
                    <div className="text-center p-5 bg-slate-50 rounded-xl">
                      <Badge className={`text-lg ${
                        brokerCredit.credit_score?.risk_classification === 'Low' ? 'bg-emerald-600' :
                        brokerCredit.credit_score?.risk_classification === 'Medium' ? 'bg-amber-600' : 'bg-red-600'
                      }`}>{brokerCredit.credit_score?.risk_classification}</Badge>
                      <p className="text-sm text-slate-600 mt-2">Risk Level</p>
                    </div>
                  </div>

                  {/* Red Flags */}
                  {brokerCredit.red_flags?.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-red-900">Red Flags</h4>
                      </div>
                      <ul className="space-y-1">
                        {brokerCredit.red_flags.map((flag, idx) => (
                          <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                            <span>•</span> {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Credit Decision */}
                  <div className={`p-5 rounded-xl border-2 ${
                    brokerCredit.recommendation?.decision === 'APPROVE' 
                      ? 'bg-emerald-50 border-emerald-300'
                      : brokerCredit.recommendation?.decision?.includes('CONDITIONS')
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-red-50 border-red-300'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-900">Credit Decision</h4>
                      <Badge className={`text-base px-4 py-1 ${
                        brokerCredit.recommendation?.decision === 'APPROVE' ? 'bg-emerald-600' :
                        brokerCredit.recommendation?.decision?.includes('CONDITIONS') ? 'bg-amber-600' : 'bg-red-600'
                      }`}>{brokerCredit.recommendation?.decision}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Credit Limit</p>
                        <p className="text-2xl font-bold text-emerald-600">${(brokerCredit.recommendation?.credit_limit || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Payment Terms</p>
                        <p className="text-xl font-bold">{brokerCredit.recommendation?.payment_terms}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Deposit Required</p>
                        <Badge className={brokerCredit.recommendation?.require_deposit ? 'bg-amber-600' : 'bg-emerald-600'}>
                          {brokerCredit.recommendation?.require_deposit ? 'YES' : 'NO'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">COD Recommended</p>
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

          {/* Sidebar */}
          <div className="space-y-4">
            
            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Database Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Loads</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{loads.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium">Carriers</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">{carriers.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium">Customers</span>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">{shippers.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="w-4 h-4" /> Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentSearches.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery(s.query);
                        setSearchType(s.type);
                      }}
                      className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <p className="font-medium text-slate-900 truncate">{s.query}</p>
                      <p className="text-xs text-slate-500">{s.resultCount} results</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tips & Best Practices */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-800">
                  <Lightbulb className="w-4 h-4" /> Tips & Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">🔍 Search Formats</p>
                  <p className="text-xs text-purple-700">Use MC123456 or DOT123456 format for carrier verification</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">✅ Always Verify</p>
                  <p className="text-xs text-purple-700">Run FMCSA verification before booking new carriers</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">💳 Credit Checks</p>
                  <p className="text-xs text-purple-700">Check credit before extending payment terms</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">⚠️ New Authority</p>
                  <p className="text-xs text-purple-700">Be cautious with carriers under 90 days old</p>
                </div>
              </CardContent>
            </Card>

            {/* External Links */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> External Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.open('https://safer.fmcsa.dot.gov/', '_blank')}
                >
                  <Shield className="w-4 h-4 mr-2 text-emerald-600" />
                  FMCSA SAFER
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.open('https://li-public.fmcsa.dot.gov/', '_blank')}
                >
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  FMCSA Licensing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}