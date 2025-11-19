import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, DollarSign } from "lucide-react";

export default function AccessorialRulesEngine() {
  const [selectedRules, setSelectedRules] = useState([]);

  const { data: schedules } = useQuery({
    queryKey: ['uss-rate-schedules'],
    queryFn: () => base44.entities.USSRateSchedule.list('-effective_date', 1),
    initialData: [],
  });

  const activeSchedule = schedules.find(s => s.status === 'active');

  const { data: rules } = useQuery({
    queryKey: ['uss-rule-charges', activeSchedule?.id],
    queryFn: () => activeSchedule ? base44.entities.USSRuleCharge.filter({ rate_schedule_id: activeSchedule.id }) : [],
    enabled: !!activeSchedule,
    initialData: [],
  });

  const commonRules = [
    { id: 3, name: 'Detention', amount: 75, per: 'hour after 2 hrs' },
    { id: 8, name: 'Overdimension', amount: 150, per: 'shipment' },
    { id: 15, name: 'TONU', amount: 250, per: 'occurrence' },
    { id: 18, name: 'Single Coil Premium', amount: '10%', per: 'of linehaul' },
    { id: 22, name: 'Winter Tarping', amount: 125, per: 'shipment' }
  ];

  const toggleRule = (ruleId) => {
    setSelectedRules(prev => 
      prev.includes(ruleId) ? prev.filter(r => r !== ruleId) : [...prev, ruleId]
    );
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Accessorial Rules Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {commonRules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedRules.includes(rule.id)}
                onCheckedChange={() => toggleRule(rule.id)}
              />
              <div>
                <p className="font-semibold text-sm text-slate-900">Rule {rule.id}: {rule.name}</p>
                <p className="text-xs text-slate-600">{rule.per}</p>
              </div>
            </div>
            <Badge className="bg-indigo-600">
              <DollarSign className="w-3 h-3 mr-1" />
              {rule.amount}
            </Badge>
          </div>
        ))}

        {selectedRules.length > 0 && (
          <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-300">
            <p className="text-sm text-indigo-900 font-semibold mb-2">
              {selectedRules.length} accessorials selected
            </p>
            <p className="text-xs text-indigo-700">
              These will be applied to the load calculation
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}