import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search, Truck } from "lucide-react";

export default function AssignCarrierModal({ load, carriers, onClose, onAssign }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState(null);

  const activeCarriers = carriers.filter(c =>
    c.status === 'active' &&
    (c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     c.mc_number?.includes(searchTerm) ||
     c.dot_number?.includes(searchTerm))
  );

  const handleAssign = () => {
    if (selectedCarrier) {
      onAssign({
        load_id: load.id,
        carrier_id: selectedCarrier.id
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Assign Carrier</h2>
            <p className="text-slate-600 mt-1">
              {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search carriers by name, MC, or DOT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Carrier List */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px]">
            {activeCarriers.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No carriers found</p>
              </div>
            ) : (
              activeCarriers.map(carrier => (
                <div
                  key={carrier.id}
                  onClick={() => setSelectedCarrier(carrier)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCarrier?.id === carrier.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{carrier.company_name}</h4>
                      <p className="text-sm text-slate-600">MC: {carrier.mc_number} | DOT: {carrier.dot_number}</p>
                      <p className="text-sm text-slate-600">{carrier.email}</p>
                      {carrier.equipment_types && carrier.equipment_types.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          Equipment: {carrier.equipment_types.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className="bg-emerald-100 text-emerald-800 mb-2">
                        Active
                      </Badge>
                      {carrier.rating && (
                        <p className="text-xs text-slate-600">
                          ⭐ {carrier.rating}/5
                        </p>
                      )}
                      {carrier.on_time_percentage && (
                        <p className="text-xs text-slate-600">
                          On-Time: {carrier.on_time_percentage}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedCarrier}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            Assign Carrier
          </Button>
        </div>
      </div>
    </div>
  );
}