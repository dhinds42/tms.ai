import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/design-system/PageHeader";
import { Zap, Play, Download } from "lucide-react";

export default function LoadTestingScripts() {
  const [selectedScript, setSelectedScript] = useState(null);

  const scripts = [
    {
      id: 1,
      name: "Load Board Stress Test",
      description: "Simulate 1000 concurrent users browsing loads",
      virtualUsers: 1000,
      duration: "10m",
      rampUp: "2m"
    },
    {
      id: 2,
      name: "Quote Generation Load Test",
      description: "Test quote engine under heavy load",
      virtualUsers: 500,
      duration: "5m",
      rampUp: "1m"
    },
    {
      id: 3,
      name: "API Endpoint Performance",
      description: "Benchmark all API endpoints",
      virtualUsers: 200,
      duration: "15m",
      rampUp: "3m"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Load Testing Scripts"
        subtitle="Performance and stress testing suite"
        icon={Zap}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          {scripts.map(script => (
            <Card key={script.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{script.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">{script.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Virtual Users:</span>
                    <span className="font-semibold">{script.virtualUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-semibold">{script.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ramp Up:</span>
                    <span className="font-semibold">{script.rampUp}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    <Play className="w-4 h-4 mr-2" />
                    Run Test
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}