import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, XCircle } from "lucide-react";

export default function AuditChecklist() {
  const [checklist, setChecklist] = useState([
    { category: 'Driver Files', items: [
      { name: 'CDL License verification', checked: true },
      { name: 'Medical certificates current', checked: true },
      { name: 'Road test certificates', checked: false },
      { name: 'Annual MVR reviews', checked: true }
    ]},
    { category: 'Vehicle Files', items: [
      { name: 'Annual inspections current', checked: true },
      { name: 'Maintenance records complete', checked: false },
      { name: 'Registration documents', checked: true }
    ]},
    { category: 'HOS Compliance', items: [
      { name: 'ELD malfunction logs', checked: true },
      { name: 'Driver log corrections', checked: true },
      { name: '8-day HOS logs available', checked: true }
    ]},
    { category: 'Safety', items: [
      { name: 'Accident register current', checked: true },
      { name: 'Drug/alcohol testing records', checked: true },
      { name: 'Safety training documentation', checked: false }
    ]}
  ]);

  const totalItems = checklist.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedItems = checklist.reduce((sum, cat) => 
    sum + cat.items.filter(i => i.checked).length, 0);
  const readinessScore = ((completedItems / totalItems) * 100).toFixed(0);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          DOT Audit Readiness Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-900 font-semibold">Audit Readiness Score</p>
              <p className="text-4xl font-bold text-blue-600 mt-1">{readinessScore}%</p>
            </div>
            <CheckCircle className="w-16 h-16 text-blue-600 opacity-20" />
          </div>
          <div className="mt-3">
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: `${readinessScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-600">Complete</p>
            <p className="text-2xl font-bold text-emerald-600">{completedItems}</p>
          </div>
          <div className="p-3 bg-red-50 rounded border border-red-200">
            <p className="text-xs text-red-600">Incomplete</p>
            <p className="text-2xl font-bold text-red-600">{totalItems - completedItems}</p>
          </div>
        </div>

        <div className="space-y-3">
          {checklist.map((category, idx) => (
            <div key={idx} className="p-4 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-3">{category.category}</h4>
              <div className="space-y-2">
                {category.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center justify-between">
                    <span className="text-sm">{item.name}</span>
                    {item.checked ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}