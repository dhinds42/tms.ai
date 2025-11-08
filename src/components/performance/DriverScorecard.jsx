import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Clock, Package, DollarSign } from "lucide-react";

export default function DriverScorecard({ driver, loads, onClose }) {
  const driverLoads = loads.filter(l => l.driver_id === driver.id);
  const completedLoads = driverLoads.filter(l => l.status === 'delivered');
  const revenue = driverLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {driver.full_name} - Performance Scorecard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Overview Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-600">Total Loads</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{completedLoads.length}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-600">On-Time %</span>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{driver.on_time_percentage || 0}%</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-slate-600">Rating</span>
              </div>
              <p className="text-3xl font-bold text-amber-600">{driver.rating || 0}/5</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-slate-600">Revenue</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">${(revenue / 1000).toFixed(0)}K</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-4 bg-slate-50 rounded-xl">
            <h3 className="font-semibold text-slate-900 mb-3">Driver Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-600">Equipment</p>
                <p className="font-medium text-slate-900">{driver.equipment_assigned || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">HOS Remaining</p>
                <p className="font-medium text-slate-900">{driver.hos_remaining || 0}h</p>
              </div>
              {driver.home_terminal && (
                <div>
                  <p className="text-xs text-slate-600">Home Terminal</p>
                  <p className="font-medium text-slate-900">
                    {driver.home_terminal.city}, {driver.home_terminal.state}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-600">Status</p>
                <Badge className="bg-emerald-100 text-emerald-700 capitalize">
                  {driver.status}
                </Badge>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}