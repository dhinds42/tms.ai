import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Clock,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Search,
  Plus
} from "lucide-react";

export default function DetentionDemurrage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const { data: loads, isLoading } = useScopedEntity('Load', { limit: 100 });

  // Calculate detention/demurrage charges
  const chargesData = loads.map(load => {
    const detentionHours = load.detention_hours || 0;
    const demurrageHours = load.demurrage_hours || 0;
    const detentionRate = 50; // $50/hour default
    const demurrageRate = 75; // $75/hour default
    const detentionCharge = detentionHours * detentionRate;
    const demurrageCharge = demurrageHours * demurrageRate;
    const totalCharge = detentionCharge + demurrageCharge;

    return {
      load,
      detentionHours,
      demurrageHours,
      detentionCharge,
      demurrageCharge,
      totalCharge,
      hasCharges: totalCharge > 0
    };
  }).filter(c => c.hasCharges);

  // Filter charges
  const filteredCharges = chargesData.filter(c => {
    const searchMatch = searchTerm === '' ||
      c.load.load_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.load.shipper_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  // Calculate stats
  const totalDetention = chargesData.reduce((sum, c) => sum + c.detentionCharge, 0);
  const totalDemurrage = chargesData.reduce((sum, c) => sum + c.demurrageCharge, 0);
  const totalCharges = totalDetention + totalDemurrage;
  const avgCharge = chargesData.length > 0 ? totalCharges / chargesData.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 bg-clip-text text-transparent">
              Detention & Demurrage
            </h1>
            <p className="text-slate-600 mt-2">Accessorial charges management and tracking</p>
          </div>
          <Button className="bg-gradient-to-r from-amber-600 to-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Charge
          </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Charges</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">${totalCharges.toLocaleString()}</p>
                </div>
                <DollarSign className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Detention</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">${totalDetention.toLocaleString()}</p>
                </div>
                <Clock className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Demurrage</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">${totalDemurrage.toLocaleString()}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Avg per Load</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">${avgCharge.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by load # or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Charges List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle>Accessorial Charges</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Load #</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Detention Hours</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Detention Charge</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Demurrage Hours</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Demurrage Charge</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCharges.map((charge) => (
                    <tr key={charge.load.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {charge.load.load_number || charge.load.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-900">{charge.detentionHours}h</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-red-600">${charge.detentionCharge.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-900">{charge.demurrageHours}h</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-orange-600">${charge.demurrageCharge.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-2xl font-bold text-amber-600">${charge.totalCharge.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}