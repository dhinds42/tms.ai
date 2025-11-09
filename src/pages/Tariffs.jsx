import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  DollarSign,
  Plus,
  Search,
  Edit,
  Copy,
  Download,
  Upload,
  Link as LinkIcon,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Tariffs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  // Mock tariffs data - in production, fetch from database
  const [tariffs] = useState([
    {
      id: '1',
      name: 'BL-Main Branch-ABCD',
      carrier_name: 'ABC Logistics',
      carrier_scac: 'ABCD',
      mode: 'truckload',
      service_level: 'standard_truckload',
      tariff_type: 'api',
      status: 'active',
      effective_date: '2024-01-01',
      expiration_date: '2044-01-01',
      linked_organizations: 3,
      linked_customers: 5,
      lane_count: 450,
      rates_pulled: 1247
    },
    {
      id: '2',
      name: 'CS-Customer ABC-XYZ',
      carrier_name: 'XYZ Transport',
      carrier_scac: 'XYZ',
      mode: 'ltl',
      service_level: 'standard',
      tariff_type: 'loadboard',
      status: 'active',
      effective_date: '2024-02-01',
      expiration_date: '2025-02-01',
      linked_organizations: 1,
      linked_customers: 1,
      lane_count: 125,
      rates_pulled: 342
    },
    {
      id: '3',
      name: 'DNR-Carrier Block-TEST',
      carrier_name: 'Test Carrier',
      carrier_scac: 'TEST',
      mode: 'truckload',
      service_level: 'standard_truckload',
      tariff_type: 'dnr',
      status: 'active',
      effective_date: '2024-01-15',
      expiration_date: '2044-01-15',
      linked_organizations: 2,
      linked_customers: 0,
      lane_count: 0,
      rates_pulled: 0,
      block_inherited_rates: true
    }
  ]);

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 200),
    initialData: [],
  });

  const filteredTariffs = tariffs.filter(tariff => {
    const matchesSearch = searchTerm === '' || 
      tariff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tariff.carrier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tariff.carrier_scac.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tariff.status === statusFilter;
    const matchesMode = modeFilter === 'all' || tariff.mode === modeFilter;
    
    return matchesSearch && matchesStatus && matchesMode;
  });

  const activeTariffs = tariffs.filter(t => t.status === 'active').length;
  const totalLanes = tariffs.reduce((sum, t) => sum + t.lane_count, 0);
  const totalRatesPulled = tariffs.reduce((sum, t) => sum + t.rates_pulled, 0);

  const handleDuplicate = (tariff) => {
    alert(`Duplicate tariff: ${tariff.name}\n\nChoose what to copy:\n- Tariff Lanes\n- Tariff Links\n- Tariff Accessorials\n- Lane Accessorials\n- Tariff Margins`);
  };

  const handleDisable = (tariffId) => {
    alert('Tariff disabled. Rates will not populate but tariff is preserved for later use.');
  };

  const handleExportCSV = () => {
    alert('Export tariff to Excel using Tariff Import Template');
  };

  const handleImportCSV = () => {
    alert('Import tariff from Excel. Download Tariff Import Template first.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">
              Tariff Management
            </h1>
            <p className="text-slate-600 mt-2">
              Manage carrier rates, API tariffs, and loadboard integrations
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl("TariffWizard")}>
              <Button className="bg-emerald-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add New Tariff
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Active Tariffs</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{activeTariffs}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Total Lanes</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{totalLanes}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Rates Pulled</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {totalRatesPulled.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Carriers</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{carriers.length}</p>
                </div>
                <FileText className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, carrier, or SCAC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                  <option value="expired">Expired</option>
                </select>

                <select
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="all">All Modes</option>
                  <option value="truckload">Truckload</option>
                  <option value="ltl">LTL</option>
                  <option value="drayage">Drayage</option>
                </select>

                <Button onClick={handleImportCSV} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button onClick={handleExportCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tariffs List */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Tariff Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTariffs.map((tariff) => (
                <div key={tariff.id} className="p-6 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{tariff.name}</h3>
                        <Badge className={
                          tariff.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          tariff.status === 'disabled' ? 'bg-slate-100 text-slate-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {tariff.status}
                        </Badge>
                        <Badge className="bg-indigo-100 text-indigo-800">
                          {tariff.tariff_type.toUpperCase()}
                        </Badge>
                        {tariff.block_inherited_rates && (
                          <Badge className="bg-amber-100 text-amber-800">DNR</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-slate-600">Carrier</p>
                          <p className="font-semibold">{tariff.carrier_name} ({tariff.carrier_scac})</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Mode</p>
                          <p className="font-semibold capitalize">{tariff.mode}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Service Level</p>
                          <p className="font-semibold">{tariff.service_level.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Lanes</p>
                          <p className="font-semibold text-blue-600">{tariff.lane_count}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge className="bg-blue-100 text-blue-800">
                          <LinkIcon className="w-3 h-3 mr-1" />
                          {tariff.linked_organizations} Orgs
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          {tariff.linked_customers} Customers
                        </Badge>
                        <Badge className="bg-emerald-100 text-emerald-800">
                          {tariff.rates_pulled.toLocaleString()} Rates Pulled
                        </Badge>
                        <Badge className="bg-slate-100 text-slate-800">
                          Valid: {new Date(tariff.effective_date).toLocaleDateString()} - {new Date(tariff.expiration_date).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        onClick={() => handleDuplicate(tariff)}
                        size="sm" 
                        variant="outline"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Duplicate
                      </Button>
                      {tariff.status === 'active' && (
                        <Button 
                          onClick={() => handleDisable(tariff.id)}
                          size="sm" 
                          variant="outline"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Disable
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredTariffs.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No tariffs found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}