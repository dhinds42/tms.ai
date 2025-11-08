import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export default function ContractTemplates({ operatingMode }) {
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
  );
}