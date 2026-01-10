import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package,
  Plus,
  TrendingDown,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Layers,
  Link as LinkIcon
} from "lucide-react";

export default function ShipmentConsolidation() {
  const [selectedLoads, setSelectedLoads] = useState([]);
  const [showConsolidateModal, setShowConsolidateModal] = useState(false);

  const { data: loads = [], isLoading } = useScopedEntity('Load', { limit: 200 });

  // Filter loads eligible for consolidation
  const eligibleLoads = loads.filter(l => 
    ['available', 'tendered'].includes(l.status) &&
    l.equipment_type === 'dry_van' // Example: only dry van for consolidation
  );

  // Group by similar routes (same pickup/delivery state)
  const consolidationOpportunities = {};
  eligibleLoads.forEach(load => {
    const key = `${load.pickup_location?.state}-${load.dropoff_location?.state}`;
    if (!consolidationOpportunities[key]) {
      consolidationOpportunities[key] = [];
    }
    consolidationOpportunities[key].push(load);
  });

  // Filter opportunities with 2+ loads
  const viableOpportunities = Object.entries(consolidationOpportunities)
    .filter(([key, loads]) => loads.length >= 2)
    .map(([key, loads]) => ({
      route: key,
      loads: loads,
      totalWeight: loads.reduce((sum, l) => sum + (l.weight || 0), 0),
      totalRevenue: loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0),
      estimatedSavings: loads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0) * 0.3 // 30% estimated savings
    }));

  const ConsolidateModal = () => {
    const [masterLoad, setMasterLoad] = useState(selectedLoads[0]?.id || '');
    const [consolidationName, setConsolidationName] = useState('');

    const handleConsolidate = () => {
      alert(`Consolidating ${selectedLoads.length} loads into master load: ${masterLoad}\n\nTotal Weight: ${selectedLoads.reduce((sum, l) => sum + (l.weight || 0), 0)} lbs\nTotal Revenue: $${selectedLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0).toFixed(2)}`);
      setShowConsolidateModal(false);
      setSelectedLoads([]);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Consolidate Shipments</h2>
          </div>
          <div className="p-6 space-y-6">
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Consolidating {selectedLoads.length} loads will combine them into a single master shipment, reducing costs and improving efficiency.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Consolidation Name</label>
              <Input
                value={consolidationName}
                onChange={(e) => setConsolidationName(e.target.value)}
                placeholder="e.g., CA-TX Consolidation 01/15"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Master Load</label>
              <select
                value={masterLoad}
                onChange={(e) => setMasterLoad(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {selectedLoads.map(load => (
                  <option key={load.id} value={load.id}>
                    {load.load_number || load.id.slice(0, 8)} - {load.pickup_location?.city} to {load.dropoff_location?.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-900">Loads to Consolidate:</h3>
              {selectedLoads.map(load => (
                <div key={load.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
                    </p>
                    <p className="text-sm text-slate-600">
                      {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">{load.weight} lbs</p>
                    <p className="font-semibold text-emerald-600">${load.customer_rate?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-600">Total Weight</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedLoads.reduce((sum, l) => sum + (l.weight || 0), 0).toLocaleString()} lbs
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${selectedLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-sm font-semibold text-emerald-900">
                  Estimated Savings: ${(selectedLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0) * 0.3).toFixed(2)}
                </p>
                <p className="text-xs text-emerald-700 mt-1">Based on 30% reduction in carrier costs</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleConsolidate} className="flex-1 bg-emerald-600 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Consolidate Loads
              </Button>
              <Button 
                onClick={() => {
                  setShowConsolidateModal(false);
                  setSelectedLoads([]);
                }}
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const handleSelectLoad = (load) => {
    if (selectedLoads.find(l => l.id === load.id)) {
      setSelectedLoads(selectedLoads.filter(l => l.id !== load.id));
    } else {
      setSelectedLoads([...selectedLoads, load]);
    }
  };

  const handleSelectOpportunity = (opportunity) => {
    setSelectedLoads(opportunity.loads);
    setShowConsolidateModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">
              Shipment Consolidation
            </h1>
            <p className="text-slate-600 mt-2">
              Combine multiple loads to reduce costs and improve efficiency
            </p>
          </div>
          {selectedLoads.length >= 2 && (
            <Button onClick={() => setShowConsolidateModal(true)} className="bg-emerald-600 text-white">
              <Layers className="w-4 h-4 mr-2" />
              Consolidate {selectedLoads.length} Loads
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Opportunities</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{viableOpportunities.length}</p>
                </div>
                <LinkIcon className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Eligible Loads</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{eligibleLoads.length}</p>
                </div>
                <Package className="w-12 h-12 text-slate-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Potential Savings</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    ${(viableOpportunities.reduce((sum, o) => sum + o.estimatedSavings, 0) / 1000).toFixed(1)}K
                  </p>
                </div>
                <TrendingDown className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Selected</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{selectedLoads.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consolidation Opportunities */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Consolidation Opportunities</h2>
          <div className="space-y-4">
            {viableOpportunities.map((opportunity, idx) => (
              <Card key={idx} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">
                          {opportunity.route.split('-')[0]} → {opportunity.route.split('-')[1]}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-800">
                          {opportunity.loads.length} loads
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-slate-600">Total Weight</p>
                          <p className="font-semibold">{opportunity.totalWeight.toLocaleString()} lbs</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Total Revenue</p>
                          <p className="font-semibold text-emerald-600">${opportunity.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Est. Savings</p>
                          <p className="font-semibold text-blue-600">${opportunity.estimatedSavings.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {opportunity.loads.map(load => (
                          <div key={load.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={selectedLoads.find(l => l.id === load.id) !== undefined}
                              onChange={() => handleSelectLoad(load)}
                              className="w-4 h-4 rounded border-slate-300"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">
                                {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
                              </p>
                              <p className="text-sm text-slate-600">
                                {load.pickup_location?.city} → {load.dropoff_location?.city} | {load.weight} lbs | ${load.customer_rate?.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleSelectOpportunity(opportunity)}
                      className="ml-4 bg-emerald-600 text-white"
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Consolidate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {viableOpportunities.length === 0 && (
              <Card className="border-0 shadow-xl bg-white p-12 text-center">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Consolidation Opportunities</h3>
                <p className="text-slate-600">
                  There are no eligible loads that can be consolidated at this time.
                </p>
              </Card>
            )}
          </div>
        </div>

        {showConsolidateModal && <ConsolidateModal />}

      </div>
    </div>
  );
}