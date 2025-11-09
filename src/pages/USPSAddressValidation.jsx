import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  MapPin,
  CheckCircle,
  Search,
  Info,
  Building,
  TrendingUp,
  FileText
} from "lucide-react";

import AddressValidator from "../components/usps/AddressValidator";

export default function USPSAddressValidation() {
  const [validatedAddresses, setValidatedAddresses] = useState([]);
  const uspsConfigured = localStorage.getItem('usps_client_id') && localStorage.getItem('usps_client_secret');

  const handleAddressValidated = (validatedAddress) => {
    setValidatedAddresses([
      {
        ...validatedAddress,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      },
      ...validatedAddresses
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">
              USPS Address Validation
            </h1>
            <p className="text-slate-600 mt-2">
              Validate and standardize addresses using official USPS data
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-blue-600">Powered by USPS</Badge>
              {uspsConfigured ? (
                <Badge className="bg-emerald-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  API Connected
                </Badge>
              ) : (
                <Badge className="bg-amber-600">Not Configured</Badge>
              )}
            </div>
          </div>
          {!uspsConfigured && (
            <Button 
              onClick={() => window.location.href = '/Settings'}
              className="bg-blue-600 text-white"
            >
              Configure USPS API
            </Button>
          )}
        </div>

        {/* Info Banner */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">USPS Address Validation Benefits:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Validates</strong> addresses against official USPS database</li>
                  <li>• <strong>Standardizes</strong> street names, city abbreviations, and ZIP codes</li>
                  <li>• <strong>Provides</strong> missing ZIP+4 codes for accurate delivery</li>
                  <li>• <strong>Confirms</strong> deliverability (DPV confirmation)</li>
                  <li>• <strong>Reduces</strong> delivery errors and returns</li>
                  <li>• <strong>Improves</strong> shipping accuracy and customer satisfaction</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Validated Today</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{validatedAddresses.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Success Rate</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">98%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">API Status</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">Active</p>
                </div>
                <MapPin className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="validator">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="validator">Address Validator</TabsTrigger>
            <TabsTrigger value="history">Validation History</TabsTrigger>
            <TabsTrigger value="docs">API Documentation</TabsTrigger>
          </TabsList>

          {/* Validator Tab */}
          <TabsContent value="validator">
            <div className="grid lg:grid-cols-2 gap-6">
              <AddressValidator onValidAddress={handleAddressValidated} />
              
              <div className="space-y-6">
                {/* Usage Tips */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="text-base">Validation Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900">Required Fields</p>
                        <p className="text-slate-600">Street address, state, and either city OR ZIP code</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900">Suite/Apt Numbers</p>
                        <p className="text-slate-600">Include secondary address for better accuracy</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900">ZIP+4</p>
                        <p className="text-slate-600">Automatically provided when address is validated</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900">DPV Confirmation</p>
                        <p className="text-slate-600">Ensures address is a valid USPS delivery point</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Common Validation Codes */}
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="text-base">Validation Result Codes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <p className="font-semibold text-emerald-900">Code 31 - Exact Match</p>
                      <p className="text-xs text-emerald-700">Address matched to ZIP+4 record</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="font-semibold text-amber-900">Code 32 - More Info Needed</p>
                      <p className="text-xs text-amber-700">Add apartment/suite number</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="font-semibold text-red-900">Code 22 - Multiple Matches</p>
                      <p className="text-xs text-red-700">Address ambiguous, need more details</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Recent Validations</CardTitle>
              </CardHeader>
              <CardContent>
                {validatedAddresses.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No addresses validated yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {validatedAddresses.map((addr) => (
                      <div key={addr.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{addr.streetAddress}</p>
                            {addr.secondaryAddress && (
                              <p className="text-sm text-slate-600">{addr.secondaryAddress}</p>
                            )}
                            <p className="text-sm text-slate-600">
                              {addr.city}, {addr.state} {addr.zip}-{addr.zipPlus4}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                              {new Date(addr.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={addr.isValidated ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                              {addr.isValidated ? 'Validated' : 'Partial'}
                            </Badge>
                            {addr.dpvConfirmed && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                DPV ✓
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>USPS Addresses API Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">API Endpoints</h3>
                  <div className="p-4 bg-slate-50 rounded-lg font-mono text-sm">
                    <p className="font-semibold text-slate-900 mb-2">Production:</p>
                    <p className="text-blue-600">GET https://apis.usps.com/addresses/v3/address</p>
                    <p className="font-semibold text-slate-900 mt-4 mb-2">Testing:</p>
                    <p className="text-blue-600">GET https://apis-tem.usps.com/addresses/v3/address</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Required Parameters</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold">streetAddress</p>
                      <p className="text-slate-600">The number and name of the street</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold">state</p>
                      <p className="text-slate-600">Two-character state code (e.g., CA, TX, NY)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold">city OR ZIPCode</p>
                      <p className="text-slate-600">Must provide at least one</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Optional Parameters</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold">firm</p>
                      <p className="text-slate-600">Business name (max 50 characters)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold">secondaryAddress</p>
                      <p className="text-slate-600">Apt, Suite, or Unit number</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold">ZIPPlus4</p>
                      <p className="text-slate-600">4-digit extension for ZIP+4</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold">urbanization</p>
                      <p className="text-slate-600">Puerto Rico addresses only</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Response Fields</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <p className="font-semibold text-emerald-900">DPVConfirmation</p>
                      <p className="text-emerald-700">Y = Valid delivery point, N = Invalid</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-semibold text-blue-900">business</p>
                      <p className="text-blue-700">Y = Business address, N = Residential</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-semibold text-purple-900">carrierRoute</p>
                      <p className="text-purple-700">USPS carrier route code</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="font-semibold text-amber-900">vacant</p>
                      <p className="text-amber-700">Y = Vacant property, N = Occupied</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> For full API documentation, visit the <a href="https://www.usps.com/business/web-tools-apis/" target="_blank" rel="noopener noreferrer" className="underline">USPS Developer Portal</a>
                  </p>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}