import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, AlertTriangle, CheckCircle, TrendingUp, RefreshCw } from "lucide-react";

export default function DataQualityDashboard() {
  const qualityMetrics = [
    { category: 'Addresses', score: 98, issues: 12, severity: 'low' },
    { category: 'Phone Numbers', score: 94, issues: 45, severity: 'medium' },
    { category: 'Email Addresses', score: 99, issues: 5, severity: 'low' },
    { category: 'Duplicate Records', score: 87, issues: 89, severity: 'high' }
  ];

  const recentIssues = [
    { id: 1, type: 'Invalid Address', record: 'Shipper: ABC Corp', impact: 'high' },
    { id: 2, type: 'Duplicate Carrier', record: 'Carrier: XYZ Transport', impact: 'medium' },
    { id: 3, type: 'Missing Email', record: 'Contact: John Doe', impact: 'low' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            Data Quality Dashboard
          </CardTitle>
          <Button className="bg-indigo-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Scan
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg text-center">
            <p className="text-xs text-emerald-900 font-semibold mb-1">Overall Score</p>
            <p className="text-4xl font-bold text-emerald-600">94.5</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg text-center">
            <p className="text-xs text-amber-900 font-semibold mb-1">Active Issues</p>
            <p className="text-4xl font-bold text-amber-600">151</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-xs text-blue-900 font-semibold mb-1">Auto-Fixed</p>
            <p className="text-4xl font-bold text-blue-600">89</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 mb-3">Quality Metrics</h4>
          {qualityMetrics.map((metric, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {metric.score >= 95 ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="font-semibold text-slate-900">{metric.category}</span>
                </div>
                <Badge className={
                  metric.severity === 'high' ? 'bg-red-600' :
                  metric.severity === 'medium' ? 'bg-amber-600' :
                  'bg-emerald-600'
                }>
                  {metric.issues} issues
                </Badge>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full"
                  style={{ width: `${metric.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-600 mt-1">{metric.score}% quality score</p>
            </div>
          ))}
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Recent Issues</h4>
          <div className="space-y-2">
            {recentIssues.map(issue => (
              <div key={issue.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded">
                <div>
                  <p className="font-semibold text-sm text-slate-900">{issue.type}</p>
                  <p className="text-xs text-slate-600">{issue.record}</p>
                </div>
                <Button size="sm" variant="outline">Fix</Button>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}