import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/design-system/PageHeader";
import { LayoutDashboard, Plus, Save, Settings } from "lucide-react";

export default function DashboardBuilder() {
  const [dashboardName, setDashboardName] = useState("My Custom Dashboard");
  const [widgets, setWidgets] = useState([
    { id: 1, type: "kpi", title: "Active Loads", value: "45", x: 0, y: 0 },
    { id: 2, type: "chart", title: "Revenue Trend", x: 1, y: 0 },
  ]);

  const availableWidgets = [
    { type: "kpi", label: "KPI Card", icon: "📊" },
    { type: "chart", label: "Chart", icon: "📈" },
    { type: "table", label: "Data Table", icon: "📋" },
    { type: "map", label: "Map", icon: "🗺️" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Dashboard Builder"
        subtitle="Create custom dashboards with drag-and-drop widgets"
        icon={LayoutDashboard}
        primaryAction={{
          label: 'Save Dashboard',
          icon: Save,
          onClick: () => {}
        }}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Widget Library */}
          <Card>
            <CardHeader>
              <CardTitle>Widgets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableWidgets.map(widget => (
                <Button
                  key={widget.type}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <span className="mr-2">{widget.icon}</span>
                  {widget.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Main Canvas */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Input
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  className="text-lg font-semibold"
                />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {widgets.map(widget => (
                <Card key={widget.id} className="hover:shadow-lg transition-shadow cursor-move">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{widget.title}</CardTitle>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {widget.type === "kpi" && (
                      <div className="text-4xl font-bold text-indigo-600">
                        {widget.value}
                      </div>
                    )}
                    {widget.type === "chart" && (
                      <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                        <p className="text-slate-400">Chart Widget</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Card className="border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-colors cursor-pointer">
                <CardContent className="py-12 text-center">
                  <Plus className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Drag widget here</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}