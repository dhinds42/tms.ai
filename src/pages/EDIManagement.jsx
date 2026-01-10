import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Radio,
  Send,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp
} from "lucide-react";

export default function EDIManagement() {
  const { data: ediTransactions, isLoading } = useScopedEntity('EDITransaction', { limit: 100 });

  const sentCount = ediTransactions.filter(t => t.direction === 'outbound' && t.status === 'sent').length;
  const receivedCount = ediTransactions.filter(t => t.direction === 'inbound' && t.status === 'processed').length;
  const errorCount = ediTransactions.filter(t => t.status === 'error').length;
  const pendingCount = ediTransactions.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            EDI Management
          </h1>
          <p className="text-slate-600 mt-2">Electronic Data Interchange transaction monitoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Sent</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{sentCount}</p>
                </div>
                <Send className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Received</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{receivedCount}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Errors</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{errorCount}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingCount}</p>
                </div>
                <FileText className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-slate-200">
            <CardTitle>EDI Transactions (204, 214, 990)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-slate-600">EDI transaction monitoring and management interface</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}