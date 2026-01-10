import React from "react";
import { DollarSign, TrendingUp, Truck, BarChart2, Target } from "lucide-react";

export default function QuickStatsBar({ totalRevenue, totalMargin, loadsCount, avgLoadValue, marginPercent }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-emerald-600">${(totalRevenue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-slate-500">Revenue</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-blue-600">${(totalMargin / 1000).toFixed(0)}K</p>
          <p className="text-xs text-slate-500">Margin</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Truck className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-purple-600">{loadsCount}</p>
          <p className="text-xs text-slate-500">Loads</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-amber-600">${avgLoadValue}</p>
          <p className="text-xs text-slate-500">Avg Load</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
        <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-cyan-600">{marginPercent}%</p>
          <p className="text-xs text-slate-500">Margin %</p>
        </div>
      </div>
    </div>
  );
}