import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/design-system/PageHeader";
import { Database, Play, Download, Save, Plus, X } from "lucide-react";

export default function AdvancedQueryBuilder() {
  const [queryName, setQueryName] = useState("Revenue Analysis");
  const [selectedFacts, setSelectedFacts] = useState(["FactShipment", "FactFinance"]);
  const [selectedDimensions, setSelectedDimensions] = useState(["DimDate"]);
  const [measures, setMeasures] = useState([
    { field: "revenue", aggregation: "SUM", alias: "Total Revenue" }
  ]);
  const [filters, setFilters] = useState([]);
  const [groupBy, setGroupBy] = useState(["date"]);
  const [results, setResults] = useState(null);

  const factTables = [
    { name: "FactShipment", label: "Shipments", fields: ["miles", "weight", "stops"] },
    { name: "FactFinance", label: "Finance", fields: ["revenue", "cost", "margin"] },
    { name: "FactTripLeg", label: "Trip Legs", fields: ["duration", "distance", "fuel_used"] },
    { name: "FactCompliance", label: "Compliance", fields: ["violations", "inspections"] }
  ];

  const dimensions = [
    { name: "DimDate", label: "Date", fields: ["date", "month", "quarter", "year"] },
    { name: "Customer", label: "Customer", fields: ["customer_name", "customer_type"] },
    { name: "Carrier", label: "Carrier", fields: ["carrier_name", "carrier_type"] },
    { name: "Lane", label: "Lane", fields: ["origin_city", "destination_city"] }
  ];

  const aggregations = ["SUM", "AVG", "COUNT", "MIN", "MAX"];

  const addMeasure = () => {
    setMeasures([...measures, { field: "", aggregation: "SUM", alias: "" }]);
  };

  const removeMeasure = (index) => {
    setMeasures(measures.filter((_, i) => i !== index));
  };

  const addFilter = () => {
    setFilters([...filters, { field: "", operator: "=", value: "" }]);
  };

  const executeQuery = async () => {
    // Simulate query execution
    const mockData = [
      { date: "2026-01-01", total_revenue: 125000, load_count: 45 },
      { date: "2026-01-02", total_revenue: 138000, load_count: 52 },
      { date: "2026-01-03", total_revenue: 142000, load_count: 48 }
    ];
    setResults(mockData);
  };

  const exportQuery = () => {
    const queryDef = {
      name: queryName,
      facts: selectedFacts,
      dimensions: selectedDimensions,
      measures,
      filters,
      groupBy
    };
    const blob = new Blob([JSON.stringify(queryDef, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-${queryName.replace(/\s/g, '-')}-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Advanced Query Builder"
        subtitle="Build complex BI queries across fact tables"
        icon={Database}
        primaryAction={{
          label: 'Save Query',
          icon: Save,
          onClick: () => {}
        }}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Query Builder */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Query Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Query Name
                  </label>
                  <Input
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                  />
                </div>

                <Tabs defaultValue="facts">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="facts">Fact Tables</TabsTrigger>
                    <TabsTrigger value="measures">Measures</TabsTrigger>
                    <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
                    <TabsTrigger value="filters">Filters</TabsTrigger>
                  </TabsList>

                  <TabsContent value="facts" className="space-y-4">
                    <p className="text-sm text-slate-600">Select fact tables to query</p>
                    <div className="space-y-2">
                      {factTables.map(fact => (
                        <div key={fact.name} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedFacts.includes(fact.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFacts([...selectedFacts, fact.name]);
                              } else {
                                setSelectedFacts(selectedFacts.filter(f => f !== fact.name));
                              }
                            }}
                            className="rounded"
                          />
                          <label className="text-sm font-medium">{fact.label}</label>
                          <Badge variant="outline" className="text-xs">
                            {fact.fields.length} fields
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="measures" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">Define aggregations</p>
                      <Button size="sm" onClick={addMeasure}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    {measures.map((measure, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <select
                          className="flex-1 px-3 py-2 border rounded-lg"
                          value={measure.aggregation}
                          onChange={(e) => {
                            const newMeasures = [...measures];
                            newMeasures[idx].aggregation = e.target.value;
                            setMeasures(newMeasures);
                          }}
                        >
                          {aggregations.map(agg => (
                            <option key={agg}>{agg}</option>
                          ))}
                        </select>
                        <Input
                          placeholder="Field"
                          className="flex-1"
                          value={measure.field}
                          onChange={(e) => {
                            const newMeasures = [...measures];
                            newMeasures[idx].field = e.target.value;
                            setMeasures(newMeasures);
                          }}
                        />
                        <Input
                          placeholder="Alias"
                          className="flex-1"
                          value={measure.alias}
                          onChange={(e) => {
                            const newMeasures = [...measures];
                            newMeasures[idx].alias = e.target.value;
                            setMeasures(newMeasures);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMeasure(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="dimensions" className="space-y-4">
                    <p className="text-sm text-slate-600">Select dimension tables</p>
                    <div className="space-y-2">
                      {dimensions.map(dim => (
                        <div key={dim.name} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedDimensions.includes(dim.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDimensions([...selectedDimensions, dim.name]);
                              } else {
                                setSelectedDimensions(selectedDimensions.filter(d => d !== dim.name));
                              }
                            }}
                            className="rounded"
                          />
                          <label className="text-sm font-medium">{dim.label}</label>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="filters" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">Add filter conditions</p>
                      <Button size="sm" onClick={addFilter}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    {filters.map((filter, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input placeholder="Field" className="flex-1" />
                        <select className="px-3 py-2 border rounded-lg">
                          <option>=</option>
                          <option>!=</option>
                          <option>&gt;</option>
                          <option>&lt;</option>
                          <option>IN</option>
                        </select>
                        <Input placeholder="Value" className="flex-1" />
                        <Button variant="ghost" size="sm">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button className="flex-1" onClick={executeQuery}>
                    <Play className="w-4 h-4 mr-2" />
                    Execute Query
                  </Button>
                  <Button variant="outline" onClick={exportQuery}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SQL Preview & Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated SQL</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
{`SELECT
  ${measures.map(m => `${m.aggregation}(${m.field}) as ${m.alias}`).join(',\n  ')}
FROM ${selectedFacts.join(', ')}
${selectedDimensions.length > 0 ? `JOIN ${selectedDimensions.join(', ')}` : ''}
${filters.length > 0 ? 'WHERE ...' : ''}
GROUP BY ${groupBy.join(', ')}`}
                </pre>
              </CardContent>
            </Card>

            {results && (
              <Card>
                <CardHeader>
                  <CardTitle>Results ({results.length} rows)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {Object.keys(results[0]).map(key => (
                            <th key={key} className="text-left py-2 font-semibold">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((row, idx) => (
                          <tr key={idx} className="border-b">
                            {Object.values(row).map((val, i) => (
                              <td key={i} className="py-2">
                                {typeof val === 'number' ? val.toLocaleString() : val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}