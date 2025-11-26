import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, BarChart } from "lucide-react";

export default function QAReport() {
  const testResults = {
    totalTests: 152,
    passed: 148,
    failed: 4,
    passRate: ((148 / 152) * 100).toFixed(1),
    modules: [
      { name: "Load Management", tests: 45, failed: 2 },
      { name: "Carrier Compliance", tests: 28, failed: 1 },
      { name: "Invoicing", tests: 35, failed: 1 },
      { name: "Driver Dispatch", tests: 24, failed: 0 },
      { name: "Reporting", tests: 20, failed: 0 },
    ],
    failedTests: [
      { id: "LM-023", description: "Edge case in multi-stop load creation causes crash", priority: "High" },
      { id: "CC-011", description: "Insurance policy check fails for out-of-state carriers", priority: "High" },
      { id: "INV-007", description: "Incorrect tax calculation for Canadian customers", priority: "Medium" },
      { id: "LM-041", description: "TONU status does not correctly update financials", priority: "Medium" },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-red-500/30">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-red-900 to-orange-900 bg-clip-text text-transparent mb-2">
            Quality Assurance Report
          </h1>
          <p className="text-slate-600 text-lg">
            Automated testing results and issue tracking for the TMS platform.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase">Total Tests</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{testResults.totalTests}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase">Tests Passed</p>
              <p className="text-4xl font-bold text-emerald-600 mt-2">{testResults.passed}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase">Tests Failed</p>
              <p className="text-4xl font-bold text-red-600 mt-2">{testResults.failed}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase">Pass Rate</p>
              <p className="text-4xl font-bold text-emerald-600 mt-2">{testResults.passRate}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Failed Tests */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-red-700">Failed Tests</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {testResults.failedTests.map(test => (
                    <div key={test.id} className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-900">{test.id}</p>
                          <p className="text-sm text-slate-700">{test.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          test.priority === "High" ? "bg-red-200 text-red-800" : "bg-amber-200 text-amber-800"
                        }`}>{test.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Module Breakdown */}
          <div>
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="border-b border-slate-100">
                <CardTitle>Module Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {testResults.modules.map(module => (
                    <div key={module.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{module.name}</span>
                        <span className="text-sm">{module.tests - module.failed} / {module.tests}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            module.failed > 0 ? 'bg-red-500' : 'bg-emerald-500'
                          }`} 
                          style={{ width: `${((module.tests - module.failed) / module.tests) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}