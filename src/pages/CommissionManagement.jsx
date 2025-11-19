import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  TrendingUp,
  Users,
  Award,
  Search,
  Download,
  Calendar
} from "lucide-react";

import CommissionCalculator from "../components/commission/CommissionCalculator";

export default function CommissionManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('this_month');

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 100),
    initialData: [],
  });

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 500),
    initialData: [],
  });

  // Calculate commissions for sales reps
  const salesReps = employees.filter(e => e.role === 'sales' || e.role === 'broker');
  
  const commissionsData = salesReps.map(rep => {
    const repLoads = loads.filter(l => l.created_by === rep.email);
    const totalRevenue = repLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
    const totalMargin = repLoads.reduce((sum, l) => sum + (l.margin || 0), 0);
    const commissionRate = rep.commission_rate || 0.1; // 10% default
    const commissionAmount = totalMargin * commissionRate;

    return {
      employee: rep,
      loadsCount: repLoads.length,
      totalRevenue,
      totalMargin,
      commissionRate,
      commissionAmount
    };
  });

  // Sort by commission amount
  const sortedCommissions = commissionsData.sort((a, b) => b.commissionAmount - a.commissionAmount);

  // Filter by search
  const filteredCommissions = sortedCommissions.filter(c => {
    const name = `${c.employee.first_name} ${c.employee.last_name}`.toLowerCase();
    return searchTerm === '' || name.includes(searchTerm.toLowerCase());
  });

  // Calculate totals
  const totalCommissions = commissionsData.reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalRevenue = commissionsData.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalLoads = commissionsData.reduce((sum, c) => sum + c.loadsCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
              Commission Management
            </h1>
            <p className="text-slate-600 mt-2">Sales rep commission tracking and reporting</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Commissions</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">${totalCommissions.toLocaleString()}</p>
                </div>
                <DollarSign className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">${totalRevenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Sales Reps</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{salesReps.length}</p>
                </div>
                <Users className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Loads</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{totalLoads}</p>
                </div>
                <Award className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by sales rep name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={dateRange === 'this_month' ? 'default' : 'outline'}
                  onClick={() => setDateRange('this_month')}
                  size="sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  This Month
                </Button>
                <Button
                  variant={dateRange === 'last_month' ? 'default' : 'outline'}
                  onClick={() => setDateRange('last_month')}
                  size="sm"
                >
                  Last Month
                </Button>
                <Button
                  variant={dateRange === 'ytd' ? 'default' : 'outline'}
                  onClick={() => setDateRange('ytd')}
                  size="sm"
                >
                  YTD
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commissions Table */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Commission Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Rank</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Sales Rep</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Loads</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Revenue</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Margin</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Rate</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommissions.map((commission, index) => (
                    <tr key={commission.employee.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <Badge className={
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-slate-200 text-slate-800' :
                          index === 2 ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }>
                          #{index + 1}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {commission.employee.first_name} {commission.employee.last_name}
                          </p>
                          <p className="text-sm text-slate-600">{commission.employee.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{commission.loadsCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-emerald-600">
                          ${commission.totalRevenue.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-600">
                          ${commission.totalMargin.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-indigo-100 text-indigo-800">
                          {(commission.commissionRate * 100).toFixed(0)}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-2xl font-bold text-purple-600">
                          ${commission.commissionAmount.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Commission Calculator */}
        <CommissionCalculator />

      </div>
    </div>
  );
}