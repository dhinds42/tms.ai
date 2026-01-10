import React from "react";
import { Truck, Users, Clock, AlertTriangle, CheckCircle } from "lucide-react";

export default function DispatchQuickStats({ activeCount, driversCount, pendingCount, problemsCount, deliveredCount, onTabChange }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange?.('active')}>
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Truck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-blue-600">{activeCount}</p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-emerald-600">{driversCount}</p>
          <p className="text-xs text-slate-500">Drivers</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange?.('pending')}>
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-slate-500">Pending</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-red-600">{problemsCount}</p>
          <p className="text-xs text-slate-500">Issues</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-purple-600">{deliveredCount}</p>
          <p className="text-xs text-slate-500">Delivered</p>
        </div>
      </div>
    </div>
  );
}