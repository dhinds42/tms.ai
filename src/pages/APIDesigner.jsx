import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/design-system/PageHeader";
import { Code, Play, Save, Copy, Download, Zap } from "lucide-react";

export default function APIDesigner() {
  const [endpoint, setEndpoint] = useState({
    method: "GET",
    path: "/api/v1/loads",
    description: "",
    parameters: [],
    requestBody: {},
    response: {},
  });

  const [testResponse, setTestResponse] = useState(null);

  const handleTest = async () => {
    setTestResponse({
      status: 200,
      data: { message: "Test successful", loads: [] },
      time: "245ms"
    });
  };

  const handleExport = (format) => {
    const exportData = {
      openapi: "3.0.0",
      info: {
        title: "TMS.ai Custom API",
        version: "1.0.0"
      },
      paths: {
        [endpoint.path]: {
          [endpoint.method.toLowerCase()]: {
            description: endpoint.description,
            parameters: endpoint.parameters,
            responses: {
              "200": {
                description: "Success",
                content: {
                  "application/json": {
                    schema: endpoint.response
                  }
                }
              }
            }
          }
        }
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-spec-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="API Designer"
        subtitle="Design, test, and document custom API endpoints"
        icon={Code}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Designer */}
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Method & Path */}
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border rounded-lg"
                  value={endpoint.method}
                  onChange={(e) => setEndpoint({ ...endpoint, method: e.target.value })}
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>PATCH</option>
                  <option>DELETE</option>
                </select>
                <Input
                  placeholder="/api/v1/endpoint"
                  value={endpoint.path}
                  onChange={(e) => setEndpoint({ ...endpoint, path: e.target.value })}
                  className="flex-1"
                />
              </div>

              {/* Description */}
              <Textarea
                placeholder="Endpoint description..."
                value={endpoint.description}
                onChange={(e) => setEndpoint({ ...endpoint, description: e.target.value })}
                rows={3}
              />

              {/* Tabs for Request/Response */}
              <Tabs defaultValue="request">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="request">Request</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                </TabsList>

                <TabsContent value="request" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Request Body (JSON)
                    </label>
                    <Textarea
                      placeholder='{ "key": "value" }'
                      className="font-mono text-sm"
                      rows={8}
                      value={JSON.stringify(endpoint.requestBody, null, 2)}
                      onChange={(e) => {
                        try {
                          setEndpoint({ ...endpoint, requestBody: JSON.parse(e.target.value) });
                        } catch (err) {}
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="response" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Response Schema (JSON)
                    </label>
                    <Textarea
                      placeholder='{ "data": [], "total": 0 }'
                      className="font-mono text-sm"
                      rows={8}
                      value={JSON.stringify(endpoint.response, null, 2)}
                      onChange={(e) => {
                        try {
                          setEndpoint({ ...endpoint, response: JSON.parse(e.target.value) });
                        } catch (err) {}
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={handleTest} className="gap-2">
                  <Play className="w-4 h-4" />
                  Test
                </Button>
                <Button variant="outline" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => handleExport('openapi')} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right: Preview & Test */}
          <div className="space-y-6">
            {/* Code Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Code Example</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
{`fetch('${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify(${JSON.stringify(endpoint.requestBody, null, 2)})
})
.then(res => res.json())
.then(data => console.log(data));`}
                </pre>
              </CardContent>
            </Card>

            {/* Test Response */}
            {testResponse && (
              <Card>
                <CardHeader>
                  <CardTitle>Test Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-emerald-500">
                      {testResponse.status} OK
                    </Badge>
                    <span className="text-sm text-slate-500">{testResponse.time}</span>
                  </div>
                  <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(testResponse.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}