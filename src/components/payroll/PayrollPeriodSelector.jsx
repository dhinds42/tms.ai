import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function PayrollPeriodSelector({ selectedPeriod, onPeriodChange }) {
  const periods = [
    { id: 'current', label: 'Current Period', dates: 'Jan 1-15, 2025' },
    { id: 'previous', label: 'Previous Period', dates: 'Dec 16-31, 2024' },
    { id: 'custom', label: 'Custom Range', dates: 'Select dates' }
  ];

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Select Pay Period</h3>
          </div>
          <div className="flex gap-2">
            {periods.map(period => (
              <Button
                key={period.id}
                onClick={() => onPeriodChange(period.id)}
                variant={selectedPeriod === period.id ? 'default' : 'outline'}
                className={selectedPeriod === period.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <div className="text-left">
                  <p className="font-medium">{period.label}</p>
                  <p className="text-xs opacity-80">{period.dates}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}