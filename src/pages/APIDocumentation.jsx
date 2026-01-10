import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/design-system/PageHeader";
import { Code, Copy, Play, Book } from "lucide-react";

export default function APIDocumentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [authToken, setAuthToken] = useState("");

  const apiEndpoints = [
    {
      category: "Loads",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/loads",
          description: "List all loads",
          auth: "Bearer token required",
          params: [
            { name: "status", type: "string", required: false, description: "Filter by status" },
            { name: "limit", type: "number", required: false, description: "Max results" }
          ],
          response: {
            data: [{ id: "123", load_number: "L-001", status: "active" }],
            total: 1
          }
        },
        {
          method: "POST",
          path: "/api/v1/loads",
          description: "Create a new load",
          auth: "Bearer token required",
          body: {
            customer_id: "string",
            pickup_location: { city: "string", state: "string" },
            dropoff_location: { city: "string", state: "string" }
          },
          response: { id: "123", load_number: "L-001" }
        }
      ]
    },
    {
      category: "Carriers",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/carriers",
          description: "List all carriers",
          auth: "Bearer token required",
          params: [
            { name: "mc_number", type: "string", required: false }
          ],
          response: {
            data: [{ id: "456", mc_number: "MC123456" }],
            total: 1
          }
        }
      ]
    },
    {
      category: "Invoices",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/invoices",
          description: "List invoices",
          auth: "Bearer token required",
          response: { data: [], total: 0 }
        }
      ]
    }
  ];

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const tryEndpoint = (endpoint) => {
    // Simulate API call
    console.log("Testing:", endpoint.path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="API Documentation"
        subtitle="Interactive REST API reference"
        icon={Book}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Endpoint List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiEndpoints.map(category => (
                <div key={category.category}>
                  <h3 className="font-semibold text-sm text-slate-700 mb-2">
                    {category.category}
                  </h3>
                  <div className="space-y-1">
                    {category.endpoints.map((endpoint, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedEndpoint(endpoint)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedEndpoint === endpoint
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Badge
                          className={`mr-2 text-xs ${
                            endpoint.method === 'GET' ? 'bg-blue-500' :
                            endpoint.method === 'POST' ? 'bg-emerald-500' :
                            endpoint.method === 'PUT' ? 'bg-amber-500' :
                            'bg-red-500'
                          } text-white`}
                        >
                          {endpoint.method}
                        </Badge>
                        <span className="font-mono text-xs">{endpoint.path}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Main Content - Endpoint Details */}
          <div className="lg:col-span-3">
            {selectedEndpoint ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          className={`${
                            selectedEndpoint.method === 'GET' ? 'bg-blue-500' :
                            selectedEndpoint.method === 'POST' ? 'bg-emerald-500' :
                            selectedEndpoint.method === 'PUT' ? 'bg-amber-500' :
                            'bg-red-500'
                          } text-white`}
                        >
                          {selectedEndpoint.method}
                        </Badge>
                        <code className="text-lg font-mono">{selectedEndpoint.path}</code>
                      </div>
                      <p className="text-slate-600">{selectedEndpoint.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs defaultValue="description">
                    <TabsList>
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="parameters">Parameters</TabsTrigger>
                      <TabsTrigger value="request">Request</TabsTrigger>
                      <TabsTrigger value="response">Response</TabsTrigger>
                      <TabsTrigger value="try">Try It</TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Authentication</h3>
                        <p className="text-sm text-slate-600">{selectedEndpoint.auth}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-slate-600">{selectedEndpoint.description}</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="parameters">
                      {selectedEndpoint.params ? (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Name</th>
                              <th className="text-left py-2">Type</th>
                              <th className="text-left py-2">Required</th>
                              <th className="text-left py-2">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEndpoint.params.map((param, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="py-2 font-mono">{param.name}</td>
                                <td className="py-2">
                                  <Badge variant="outline">{param.type}</Badge>
                                </td>
                                <td className="py-2">
                                  {param.required ? (
                                    <Badge className="bg-red-500">Required</Badge>
                                  ) : (
                                    <Badge variant="outline">Optional</Badge>
                                  )}
                                </td>
                                <td className="py-2 text-slate-600">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-slate-500">No parameters</p>
                      )}
                    </TabsContent>

                    <TabsContent value="request">
                      {selectedEndpoint.body ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">Request Body</h3>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyCode(JSON.stringify(selectedEndpoint.body, null, 2))}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                            {JSON.stringify(selectedEndpoint.body, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-slate-500">No request body</p>
                      )}
                    </TabsContent>

                    <TabsContent value="response">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Response (200 OK)</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyCode(JSON.stringify(selectedEndpoint.response, null, 2))}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(selectedEndpoint.response, null, 2)}
                      </pre>
                    </TabsContent>

                    <TabsContent value="try" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Authorization Token
                        </label>
                        <Input
                          placeholder="Bearer token..."
                          value={authToken}
                          onChange={(e) => setAuthToken(e.target.value)}
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => tryEndpoint(selectedEndpoint)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Send Request
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Code className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Select an endpoint to view documentation</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}