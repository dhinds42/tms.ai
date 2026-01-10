import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, DollarSign, TrendingUp } from "lucide-react";

export default function SettlementStats({ totalPending, totalApproved, totalPaid, pendingAmount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Pending Review</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{totalPending}</p>
            </div>
            <Clock className="w-12 h-12 text-amber-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Approved</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totalApproved}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Paid</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{totalPaid}</p>
            </div>
            <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Pending Amount</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">${pendingAmount.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}