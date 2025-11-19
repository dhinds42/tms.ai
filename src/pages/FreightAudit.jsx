import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingDown,
  Search,
  Download
} from "lucide-react";

import AutomatedAudit from "../components/freight-audit/AutomatedAudit";

export default function FreightAudit() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 200),
    initialData: [],
  });

  // Simulate audit findings (in production, this would be from an Audit entity)
  const audits = loads.map(load => {
    const expectedRate = load.carrier_pay || 0;
    const actualRate = expectedRate + (Math.random() > 0.8 ? Math.random() * 100 - 50 : 0); // 20% have discrepancies
    const variance = actualRate - expectedRate;
    const hasDiscrepancy = Math.abs(variance) > 10;

    return {
      id: load.id,
      load_number: load.load_number,
      carrier_id: load.carrier_id,
      expected_rate: expectedRate,
      actual_rate: actualRate,
      variance: variance,
      status: hasDiscrepancy ? 'flagged' : 'approved',
      audit_date: new Date().toISOString(),
      notes: hasDiscrepancy ? 'Rate discrepancy detected' : null
    };
  });

  // Filter audits
  const filteredAudits = audits.filter(a => {
    const statusMatch = statusFilter === 'all' || a.status === statusFilter;
    const searchMatch = searchTerm === '' ||
      a.load_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.carrier_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Calculate stats
  const totalAudits = audits.length;
  const flaggedCount = audits.filter(a => a.status === 'flagged').length;
  const approvedCount = audits.filter(a => a.status === 'approved').length;
  const totalSavings = audits
    .filter(a => a.variance < 0)
    .reduce((sum, a) => sum + Math.abs(a.variance), 0);

  const getStatusColor = (status) => {
    const colors = {
      'flagged': 'bg-red-100 text-red-800',
      'approved': 'bg-emerald-100 text-emerald-800',
      'reviewed': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">
              Freight Audit & Payment
            </h1>
            <p className="text-slate-600 mt-2">Invoice auditing and automated payment processing</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Audits</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{totalAudits}</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Flagged</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{flaggedCount}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Approved</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{approvedCount}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Savings</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">${totalSavings.toLocaleString()}</p>
                </div>
                <TrendingDown className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by load # or carrier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="bg-slate-100">
                <TabsTrigger value="all">All ({totalAudits})</TabsTrigger>
                <TabsTrigger value="flagged">Flagged ({flaggedCount})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Audits Table */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Load #</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Expected Rate</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Actual Rate</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Variance</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAudits.map((audit) => (
                    <tr key={audit.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{audit.load_number || audit.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">${audit.expected_rate.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">${audit.actual_rate.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${
                          audit.variance > 0 ? 'text-red-600' : audit.variance < 0 ? 'text-emerald-600' : 'text-slate-600'
                        }`}>
                          {audit.variance > 0 && '+'}${audit.variance.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(audit.status)}>{audit.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {audit.status === 'flagged' && (
                            <>
                              <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-300 text-red-700">
                                <XCircle className="w-3 h-3 mr-1" />
                                Dispute
                              </Button>
                            </>
                          )}
                          {audit.status === 'approved' && (
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                              <DollarSign className="w-3 h-3 mr-1" />
                              Process Payment
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Automated Audit */}
        <AutomatedAudit />

      </div>
    </div>
  );
}