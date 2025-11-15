import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Truck, 
  UserPlus, 
  GraduationCap, 
  Award, 
  Calendar, 
  DollarSign,
  Building,
  TrendingUp
} from "lucide-react";

// Import existing components
import { default as DriversContent } from "./Drivers";
import { default as OwnerOperatorsContent } from "./OwnerOperators";
import { default as PayrollContent } from "./PayrollManagement";

// Import sub-components
import EmployeesTab from "../components/hr/EmployeesTab";
import RecruitingTab from "../components/hr/RecruitingTab";
import TrainingTab from "../components/hr/TrainingTab";
import PerformanceTab from "../components/hr/PerformanceTab";
import TimeOffTab from "../components/hr/TimeOffTab";

export default function HRManagement() {
  const [activeTab, setActiveTab] = useState("employees");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  // Fetch summary stats
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list(),
    initialData: [],
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    initialData: [],
  });

  const { data: ownerOperators = [] } = useQuery({
    queryKey: ['ownerOperators'],
    queryFn: () => base44.entities.OwnerOperator.list(),
    initialData: [],
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ['recruitingCandidates'],
    queryFn: () => base44.entities.RecruitingCandidate.list(),
    initialData: [],
  });

  const { data: timeOffRequests = [] } = useQuery({
    queryKey: ['timeOffRequests'],
    queryFn: () => base44.entities.TimeOffRequest.list(),
    initialData: [],
  });

  const activeEmployees = employees.filter(e => e.is_active);
  const activeDrivers = drivers.filter(d => d.status === 'active');
  const activeOOs = ownerOperators.filter(o => o.status === 'active');
  const pendingTimeOff = timeOffRequests.filter(t => t.status === 'pending');
  const activeCandidates = candidates.filter(c => !['converted', 'disqualified'].includes(c.status));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  HR Management
                </h1>
                <p className="text-slate-600 mt-1">
                  Complete workforce management for {operatingMode === 'carrier' ? 'carriers' : 'brokers'}
                </p>
              </div>
            </div>
          </div>
          <Badge className={`px-4 py-2 ${operatingMode === 'carrier' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
            {operatingMode.toUpperCase()} MODE
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employees</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{activeEmployees.length}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                  <Building className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {operatingMode === 'carrier' && (
            <>
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Drivers</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{activeDrivers.length}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner Ops</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{activeOOs.length}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidates</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{activeCandidates.length}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time Off</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{pendingTimeOff.length}</p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-xl p-2 border-0">
            <TabsTrigger value="employees" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              <Building className="w-4 h-4 mr-2" />
              Employees
            </TabsTrigger>
            
            {operatingMode === 'carrier' && (
              <>
                <TabsTrigger value="drivers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white">
                  <Truck className="w-4 h-4 mr-2" />
                  Drivers
                </TabsTrigger>
                <TabsTrigger value="owner-operators" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                  <Award className="w-4 h-4 mr-2" />
                  Owner Operators
                </TabsTrigger>
              </>
            )}

            <TabsTrigger value="recruiting" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Recruiting
            </TabsTrigger>
            <TabsTrigger value="training" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              <GraduationCap className="w-4 h-4 mr-2" />
              Training
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="time-off" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Time Off
            </TabsTrigger>
            <TabsTrigger value="payroll" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Payroll
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <EmployeesTab />
          </TabsContent>

          {operatingMode === 'carrier' && (
            <>
              <TabsContent value="drivers">
                <DriversContent />
              </TabsContent>

              <TabsContent value="owner-operators">
                <OwnerOperatorsContent />
              </TabsContent>
            </>
          )}

          <TabsContent value="recruiting">
            <RecruitingTab />
          </TabsContent>

          <TabsContent value="training">
            <TrainingTab />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceTab />
          </TabsContent>

          <TabsContent value="time-off">
            <TimeOffTab />
          </TabsContent>

          <TabsContent value="payroll">
            <PayrollContent />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}