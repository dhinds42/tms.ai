import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Building,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  FileText,
  DollarSign,
  TrendingUp
} from "lucide-react";

import VendorScorecard from "../components/vendor/VendorScorecard";

export default function VendorManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: prospects, isLoading } = useQuery({
    queryKey: ['prospects'],
    queryFn: () => base44.entities.Prospect.list('-created_date', 100),
    initialData: [],
  });

  // Filter for vendors and 3PLs
  const vendors = prospects.filter(p => p.prospect_type === 'vendor' || p.prospect_type === 'partner');

  // Filter vendors
  const filteredVendors = vendors.filter(v => {
    const categoryMatch = categoryFilter === 'all' || v.industry === categoryFilter;
    const searchMatch = searchTerm === '' ||
      v.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Calculate stats
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === 'converted' || v.status === 'qualified').length;
  const pendingVendors = vendors.filter(v => v.status === 'intake' || v.status === 'contacted').length;

  // Get unique industries
  const industries = [...new Set(vendors.map(v => v.industry).filter(Boolean))];

  const getStatusColor = (status) => {
    const colors = {
      'intake': 'bg-blue-100 text-blue-800',
      'qualified': 'bg-indigo-100 text-indigo-800',
      'contacted': 'bg-purple-100 text-purple-800',
      'converted': 'bg-emerald-100 text-emerald-800',
      'disqualified': 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Vendor Management
            </h1>
            <p className="text-slate-600 mt-2">3PL and vendor management (different from carriers)</p>
          </div>
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Vendors</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{totalVendors}</p>
                </div>
                <Building className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Active</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{activeVendors}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingVendors}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-amber-600 opacity-20" />
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
                  placeholder="Search by company, contact, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={categoryFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setCategoryFilter('all')}
                  size="sm"
                >
                  All
                </Button>
                {industries.slice(0, 5).map(industry => (
                  <Button
                    key={industry}
                    variant={categoryFilter === industry ? 'default' : 'outline'}
                    onClick={() => setCategoryFilter(industry)}
                    size="sm"
                  >
                    {industry}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader className="border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-indigo-600" />
                      {vendor.company_name || 'Unnamed Vendor'}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{vendor.industry || 'Unspecified'}</p>
                  </div>
                  <Badge className={getStatusColor(vendor.status)}>{vendor.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm">
                  {vendor.contact_name && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Contact</span>
                      <span className="font-semibold text-slate-900">{vendor.contact_name}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Email</span>
                      <span className="font-semibold text-slate-900">{vendor.email}</span>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phone</span>
                      <span className="font-semibold text-slate-900">{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.address?.city && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Location</span>
                      <span className="font-semibold text-slate-900">
                        {vendor.address.city}, {vendor.address.state}
                      </span>
                    </div>
                  )}
                </div>

                {vendor.services_offered && vendor.services_offered.length > 0 && (
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs font-semibold text-indigo-900 mb-2">Services Offered:</p>
                    <div className="flex flex-wrap gap-1">
                      {vendor.services_offered.slice(0, 3).map((service, idx) => (
                        <Badge key={idx} className="bg-indigo-100 text-indigo-800 text-xs">
                          {service}
                        </Badge>
                      ))}
                      {vendor.services_offered.length > 3 && (
                        <Badge className="bg-slate-100 text-slate-600 text-xs">
                          +{vendor.services_offered.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="w-3 h-3 mr-2" />
                    Details
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <DollarSign className="w-3 h-3 mr-2" />
                    Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No vendors found</h3>
              <p className="text-slate-600">
                {searchTerm || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first vendor to get started'}
              </p>
            </CardContent>
          </Card>
        )}

        <VendorScorecard />
        
      </div>
    </div>
  );
}