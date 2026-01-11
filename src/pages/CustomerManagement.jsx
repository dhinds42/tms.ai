import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { PageHeader, SkeletonLoader } from "@/components/design-system";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Package, 
  Search, 
  TrendingUp,
  DollarSign,
  Award,
  Building
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CustomerManagement() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch shippers (customers for carrier mode)
  const { data: shippers, isLoading: shippersLoading } = useScopedEntity('Shipper', { limit: 100, sort: '-created_date' });

  const filteredShippers = shippers.filter(shipper => {
    const searchMatch = searchTerm === '' || 
      shipper.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const activeCustomers = shippers.filter(s => s.status === 'active');
  const totalRevenue = shippers.reduce((sum, s) => sum + (s.total_revenue || 0), 0);
  const avgRating = shippers.length > 0
    ? (shippers.reduce((sum, s) => sum + (s.rating || 0), 0) / shippers.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
              {operatingMode === 'carrier' ? 'Customer Management' : 'Customer Management'}
            </h1>
            <p className="text-slate-600 mt-2">
              {operatingMode === 'carrier' 
                ? 'Manage your shipper relationships and customer accounts'
                : 'Manage customer relationships and accounts'
              }
            </p>
          </div>
          <Link to={createPageUrl("Shippers")}>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <Package className="w-4 h-4 mr-2" />
              View Full CRM
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Customers</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{activeCustomers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl">
                  <Building className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Rating</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{avgRating} ⭐</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search customers by company name, contact, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Customer Grid */}
        {shippersLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-slate-600">Loading customers...</p>
          </div>
        ) : filteredShippers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No customers found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Add your first customer to get started'}
            </p>
            <Link to={createPageUrl("Shippers")}>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <Package className="w-4 h-4 mr-2" />
                Go to Full CRM
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredShippers.map((shipper) => (
              <Card key={shipper.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {shipper.company_name}
                      </h3>
                      <p className="text-sm text-slate-600">{shipper.contact_name}</p>
                      <Badge className={
                        shipper.status === 'active' ? 'bg-emerald-100 text-emerald-800 mt-2' :
                        'bg-slate-100 text-slate-800 mt-2'
                      }>
                        {shipper.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Loads</span>
                      <span className="font-semibold">{shipper.total_loads || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Revenue</span>
                      <span className="font-semibold text-emerald-600">
                        ${(shipper.total_revenue || 0).toLocaleString()}
                      </span>
                    </div>
                    {shipper.rating && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Rating</span>
                        <span className="font-semibold text-amber-600">
                          {shipper.rating.toFixed(1)} ⭐
                        </span>
                      </div>
                    )}
                  </div>

                  <Link to={createPageUrl("Shippers")}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}