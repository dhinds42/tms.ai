import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Network, TrendingUp, Award, Search } from "lucide-react";

export default function BrokerNetwork() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: carriers, isLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const networkPartners = carriers.filter(c => c.is_network_partner);
  const filteredPartners = networkPartners.filter(p => {
    const searchMatch = searchTerm === '' ||
      p.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mc_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            Broker Network Portal
          </h1>
          <p className="text-slate-600 mt-2">Collaborative broker network and capacity sharing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Network Partners</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{networkPartners.length}</p>
                </div>
                <Users className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Active Connections</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{networkPartners.filter(p => p.status === 'active').length}</p>
                </div>
                <Network className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Shared Loads</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">0</p>
                </div>
                <TrendingUp className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search network partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <Card key={partner.id} className="border-0 shadow-xl">
              <CardHeader className="border-b border-slate-200">
                <CardTitle>{partner.company_name}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">MC Number</span>
                    <span className="font-semibold">{partner.mc_number}</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Network Partner</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}