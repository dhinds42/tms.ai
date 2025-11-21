import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, DollarSign, TrendingUp } from "lucide-react";

export default function CommissionCalculator() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list(),
    initialData: [],
  });

  const brokers = employees.filter(e => e.role === 'broker' || e.role === 'sales');

  const calculateCommission = (employee) => {
    const employeeLoads = loads.filter(l => l.sales_rep_id === employee.id || l.booked_by === employee.email);
    const totalRevenue = employeeLoads.reduce((sum, l) => sum + ((l.customer_charge || 0) - (l.carrier_cost || 0)), 0);
    const commissionRate = employee.commission_rate || 0.05;
    return totalRevenue * commissionRate;
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Commission Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {brokers.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600">No commission-eligible employees</p>
          </div>
        ) : (
          brokers.slice(0, 10).map((employee) => {
            const commission = calculateCommission(employee);
            return (
              <div key={employee.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-slate-900">{employee.first_name} {employee.last_name}</p>
                    <p className="text-xs text-slate-600">{employee.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">${commission.toFixed(2)}</p>
                    <Badge className="bg-purple-600 text-xs">This Period</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>Rate: {((employee.commission_rate || 0.05) * 100).toFixed(1)}%</span>
                </div>
              </div>
            );
          })
        )}

      </CardContent>
    </Card>
  );
}