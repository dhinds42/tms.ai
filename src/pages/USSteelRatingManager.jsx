import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, DollarSign, Zap } from "lucide-react";

import ExcelRateImporter from "../components/uss-rating/ExcelRateImporter";
import RateScheduleManager from "../components/uss-rating/RateScheduleManager";
import FuelSurchargeManager from "../components/uss-rating/FuelSurchargeManager";
import USSRatingEngine from "../components/uss-rating/USSRatingEngine";

export default function USSteelRatingManager() {
  const [activeTab, setActiveTab] = useState('schedules');

  const queryClient = useQueryClient();

  const { data: schedules } = useQuery({
    queryKey: ['uss_schedules'],
    queryFn: () => base44.entities.USSRateSchedule.list('-created_date', 50),
    initialData: [],
  });

  const { data: lanes } = useQuery({
    queryKey: ['uss_lanes'],
    queryFn: () => base44.entities.USSLaneRate.list(),
    initialData: [],
  });

  const { data: fuelBrackets } = useQuery({
    queryKey: ['uss_fuel'],
    queryFn: () => base44.entities.USSFuelSurchargeBracket.list(),
    initialData: [],
  });

  const activeSchedule = schedules.find(s => s.status === 'active');
  const activeLanes = lanes.filter(l => l.rate_schedule_id === activeSchedule?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <FileSpreadsheet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            U.S. Steel Rating Manager
          </h1>
          <p className="text-slate-600 mt-2">
            Excel-based contract import, versioned rate schedules, fuel surcharge engine
          </p>
          <Badge className="mt-3 bg-blue-600">CARRIER TMS ONLY - Firewall Protected</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Schedule</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {activeSchedule ? `Rev ${activeSchedule.revision_number}` : 'None'}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Lane Rates</p>
                  <p className="text-3xl font-bold text-indigo-600">{activeLanes.length}</p>
                </div>
                <FileSpreadsheet className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">FSC Brackets</p>
                  <p className="text-3xl font-bold text-emerald-600">{fuelBrackets.length}</p>
                </div>
                <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Revisions</p>
                  <p className="text-3xl font-bold text-purple-600">{schedules.length}</p>
                </div>
                <Upload className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <Button
            onClick={() => setActiveTab('schedules')}
            variant={activeTab === 'schedules' ? 'default' : 'ghost'}
            className={activeTab === 'schedules' ? 'bg-blue-600' : ''}
          >
            📋 Rate Schedules
          </Button>
          <Button
            onClick={() => setActiveTab('import')}
            variant={activeTab === 'import' ? 'default' : 'ghost'}
            className={activeTab === 'import' ? 'bg-blue-600' : ''}
          >
            📥 Import Excel
          </Button>
          <Button
            onClick={() => setActiveTab('fuel')}
            variant={activeTab === 'fuel' ? 'default' : 'ghost'}
            className={activeTab === 'fuel' ? 'bg-blue-600' : ''}
          >
            ⛽ Fuel Surcharge
          </Button>
          <Button
            onClick={() => setActiveTab('rating')}
            variant={activeTab === 'rating' ? 'default' : 'ghost'}
            className={activeTab === 'rating' ? 'bg-blue-600' : ''}
          >
            💰 Rate Calculator
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'schedules' && <RateScheduleManager schedules={schedules} lanes={lanes} />}
        {activeTab === 'import' && <ExcelRateImporter onImportComplete={() => queryClient.invalidateQueries()} />}
        {activeTab === 'fuel' && <FuelSurchargeManager />}
        {activeTab === 'rating' && <USSRatingEngine activeSchedule={activeSchedule} />}

      </div>
    </div>
  );
}