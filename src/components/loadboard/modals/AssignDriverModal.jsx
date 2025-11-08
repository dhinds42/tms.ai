import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Search, Truck } from "lucide-react";

export default function AssignDriverModal({ load, drivers, onClose, onAssign }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);

  const availableDrivers = drivers.filter(d => 
    d.status === 'available' && 
    (d.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     d.phone?.includes(searchTerm) ||
     d.equipment_assigned?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAssign = () => {
    if (selectedDriver) {
      onAssign({
        load_id: load.id,
        driver_id: selectedDriver.id
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Assign Driver</h2>
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
              placeholder="Search drivers by name, phone, or equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Driver List */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px]">
            {availableDrivers.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No available drivers found</p>
              </div>
            ) : (
              availableDrivers.map(driver => (
                <div
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedDriver?.id === driver.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{driver.full_name}</h4>
                      <p className="text-sm text-slate-600">{driver.phone}</p>
                      {driver.equipment_assigned && (
                        <p className="text-sm text-slate-600">Truck: {driver.equipment_assigned}</p>
                      )}
                      {driver.current_location && (
                        <p className="text-xs text-slate-500 mt-1">
                          Location: {driver.current_location.city}, {driver.current_location.state}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className="bg-emerald-100 text-emerald-800 mb-2">
                        Available
                      </Badge>
                      {driver.hos_remaining && (
                        <p className="text-xs text-slate-600">
                          HOS: {driver.hos_remaining}h
                        </p>
                      )}
                      {driver.rating && (
                        <p className="text-xs text-slate-600">
                          ⭐ {driver.rating}/5
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
            disabled={!selectedDriver}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            Assign Driver
          </Button>
        </div>
      </div>
    </div>
  );
}