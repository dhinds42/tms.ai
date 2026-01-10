import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/design-system/PageHeader";
import { BarChart2, Plus, Download, Save } from "lucide-react";

export default function ReportBuilder() {
  const [reportName, setReportName] = useState("New Report");
  const [selectedEntity, setSelectedEntity] = useState("Load");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [filters, setFilters] = useState([]);

  const entities = ["Load", "Invoice", "Settlement", "Driver", "Carrier", "Customer"];
  
  const availableColumns = {
    Load: ["load_number", "status", "customer_rate", "carrier_rate", "margin", "miles", "created_date"],
    Invoice: ["invoice_number", "status", "total_amount", "due_date", "paid_date"],
    Settlement: ["settlement_number", "carrier_id", "total_amount", "status", "paid_date"],
  };

  const columns = availableColumns[selectedEntity] || [];

  const toggleColumn = (col) => {
    setSelectedColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Report Builder"
        subtitle="Create custom reports and exports"
        icon={BarChart2}
        primaryAction={{
          label: 'Save Report',
          icon: Save,
          onClick: () => {}
        }}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Builder */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Report Name
                  </label>
                  <Input
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Data Source
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {entities.map(entity => (
                      <Button
                        key={entity}
                        variant={selectedEntity === entity ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedEntity(entity)}
                      >
                        {entity}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Columns ({selectedColumns.length} selected)
                  </label>
                  <div className="border rounded-lg p-4 space-y-2">
                    {columns.map(col => (
                      <div key={col} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(col)}
                          onChange={() => toggleColumn(col)}
                          className="rounded"
                        />
                        <label className="text-sm">{col}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Report: {reportName}</p>
                  <p className="text-sm text-slate-600">Source: {selectedEntity}</p>
                  <p className="text-sm text-slate-600">Columns: {selectedColumns.length}</p>
                </div>

                <div className="border rounded-lg p-4 bg-slate-50">
                  <div className="text-xs font-mono space-y-1">
                    {selectedColumns.length > 0 ? (
                      selectedColumns.map(col => (
                        <div key={col} className="text-slate-700">{col}</div>
                      ))
                    ) : (
                      <div className="text-slate-400">Select columns to preview</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" disabled={selectedColumns.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export to CSV
                  </Button>
                  <Button className="w-full" variant="outline" disabled={selectedColumns.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export to Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}