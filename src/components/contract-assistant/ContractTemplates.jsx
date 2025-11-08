import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ExternalLink } from "lucide-react";

export default function ContractTemplates({ operatingMode }) {
  const industryStandardTemplates = [
    { 
      name: "TIA Broker-Carrier Agreement", 
      description: "Industry standard Transportation Intermediaries Association model contract",
      type: "broker_carrier",
      url: "https://tianet.org",
      required: true
    },
    { 
      name: "Broker-Shipper Service Agreement", 
      description: "Comprehensive agreement covering tendering, POD requirements, accessorials, and dispute resolution windows",
      type: "broker_shipper",
      required: true
    }
  ];

  const brokerTemplates = [
    { name: "Standard Carrier Agreement", description: "Basic broker-carrier contract with standard liability terms" },
    { name: "Preferred Carrier Contract", description: "Enhanced terms for high-performing carriers with volume discounts" },
    { name: "Shipper Agreement", description: "Customer agreement with service level commitments" },
    { name: "Spot Market Agreement", description: "Quick turnaround contract for one-time loads" },
    { name: "Dedicated Lane Agreement", description: "Exclusive lane commitment with guaranteed volumes" }
  ];

  const carrierTemplates = [
    { name: "Owner Operator Lease Agreement", description: "Standard lease-to-carrier agreement with payment terms" },
    { name: "Driver Employment Contract", description: "Company driver employment with benefits and conditions" },
    { name: "Equipment Lease Agreement", description: "Truck and trailer lease with maintenance responsibilities" },
    { name: "Independent Contractor Agreement", description: "1099 contractor terms for owner operators" },
    { name: "Fuel Card Agreement", description: "Fuel card usage terms and restrictions" }
  ];

  const templates = operatingMode === 'broker' ? brokerTemplates : carrierTemplates;

  return (
    <div className="space-y-6">
      
      {/* Industry Standard Agreements - Available to BOTH modes */}
      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
          <Badge className="bg-red-600 text-white">REQUIRED</Badge>
          Industry Standard Agreements
        </h3>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {industryStandardTemplates.map((template, index) => (
            <Card key={index} className="border-2 border-red-300 shadow-lg bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-slate-900">{template.name}</h4>
                      <Badge className="bg-red-600 text-white text-xs">REQUIRED</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{template.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                        <Download className="w-3 h-3 mr-2" />
                        Generate
                      </Button>
                      {template.url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-red-300 text-red-700"
                          onClick={() => window.open(template.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          TIA Reference
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mode-Specific Templates */}
      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-4">
          {operatingMode === 'broker' ? 'Broker' : 'Carrier'} Templates
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {templates.map((template, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">{template.name}</h4>
                    <p className="text-sm text-slate-600 mb-4">{template.description}</p>
                    <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700">
                      <Download className="w-3 h-3 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Agreement Components Guide */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardContent className="p-6">
          <h4 className="font-bold text-blue-900 mb-4">Key Agreement Components</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-semibold text-slate-900 text-sm">Broker-Carrier Agreement Must Include:</h5>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• TIA standard terms (baseline)</li>
                <li>• Insurance requirements (min $1M)</li>
                <li>• Payment terms (quick-pay options)</li>
                <li>• Liability and cargo insurance</li>
                <li>• Dispute resolution process</li>
                <li>• Termination conditions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold text-slate-900 text-sm">Broker-Shipper Agreement Must Include:</h5>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Load tendering procedures</li>
                <li>• POD submission requirements</li>
                <li>• Accessorial charge definitions</li>
                <li>• Dispute filing windows (30-90 days)</li>
                <li>• Rate confirmation process</li>
                <li>• Claims procedures</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}