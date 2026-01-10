import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/design-system/PageHeader";
import { Database, Plus, Download, Share2 } from "lucide-react";

export default function ERDDesigner() {
  const [entities, setEntities] = useState([
    {
      id: "1",
      name: "Load",
      x: 100,
      y: 100,
      fields: [
        { name: "id", type: "string", isPrimary: true },
        { name: "customer_id", type: "string", isForeign: true },
        { name: "status", type: "enum" },
        { name: "customer_rate", type: "number" }
      ]
    },
    {
      id: "2",
      name: "Customer",
      x: 400,
      y: 100,
      fields: [
        { name: "id", type: "string", isPrimary: true },
        { name: "party_id", type: "string", isForeign: true },
        { name: "credit_limit_cents", type: "number" }
      ]
    }
  ]);

  const [relationships] = useState([
    { from: "1", to: "2", type: "many-to-one", label: "customer" }
  ]);

  const handleExport = () => {
    const erdData = {
      entities,
      relationships,
      version: "1.0.0",
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(erdData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erd-diagram-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="ERD Designer"
        subtitle="Visual database schema designer"
        icon={Database}
        primaryAction={{
          label: 'Add Entity',
          icon: Plus,
          onClick: () => {}
        }}
        secondaryActions={[
          { label: 'Export', icon: Download, onClick: handleExport },
          { label: 'Share', icon: Share2, onClick: () => {} }
        ]}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Entity List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Entities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {entities.map(entity => (
                <Button
                  key={entity.id}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {entity.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Main Canvas */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full relative bg-slate-50">
                {/* SVG Canvas for ERD */}
                <svg className="w-full h-full">
                  {/* Relationship Lines */}
                  {relationships.map((rel, idx) => {
                    const fromEntity = entities.find(e => e.id === rel.from);
                    const toEntity = entities.find(e => e.id === rel.to);
                    if (!fromEntity || !toEntity) return null;

                    return (
                      <g key={idx}>
                        <line
                          x1={fromEntity.x + 150}
                          y1={fromEntity.y + 50}
                          x2={toEntity.x}
                          y2={toEntity.y + 50}
                          stroke="#4f46e5"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                        <text
                          x={(fromEntity.x + toEntity.x) / 2}
                          y={(fromEntity.y + toEntity.y) / 2 - 10}
                          className="text-xs fill-slate-600"
                        >
                          {rel.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Arrow marker definition */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="#4f46e5" />
                    </marker>
                  </defs>
                </svg>

                {/* Entity Boxes */}
                {entities.map(entity => (
                  <div
                    key={entity.id}
                    className="absolute bg-white border-2 border-slate-300 rounded-lg shadow-md"
                    style={{ left: entity.x, top: entity.y, width: 250 }}
                  >
                    <div className="bg-indigo-600 text-white px-3 py-2 rounded-t-md font-semibold flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      {entity.name}
                    </div>
                    <div className="p-2">
                      {entity.fields.map((field, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-1 text-sm">
                          <span className={field.isPrimary ? "text-amber-600 font-bold" : "text-slate-600"}>
                            {field.name}
                          </span>
                          <span className="text-slate-400 text-xs">{field.type}</span>
                          {field.isForeign && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">FK</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="mt-4">
              <CardContent className="pt-4">
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-600 rounded"></div>
                    <span>Primary Key</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span>Foreign Key</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-indigo-600"></div>
                    <span>Relationship</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}