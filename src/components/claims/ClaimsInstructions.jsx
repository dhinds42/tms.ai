import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClaimsInstructions({ operatingMode }) {
  
  return (
    <div className="space-y-6 mt-6">
      
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            How to File a Cargo Claim
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Step-by-Step Instructions */}
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
              <h3 className="font-bold text-blue-900 mb-2">Step 1: Document the Damage</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Take clear photos of damaged cargo</li>
                <li>• Photograph packaging and shipping labels</li>
                <li>• Document condition at delivery</li>
                <li>• Note any visible damage on delivery receipt</li>
              </ul>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-l-emerald-500">
              <h3 className="font-bold text-emerald-900 mb-2">Step 2: Gather Required Documents</h3>
              <ul className="text-sm text-emerald-800 space-y-1">
                <li>• Original Bill of Lading (BOL)</li>
                <li>• Proof of Delivery (POD)</li>
                <li>• Commercial invoice showing item value</li>
                <li>• Photographs of damage</li>
                <li>• Repair estimates or replacement quotes</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-l-purple-500">
              <h3 className="font-bold text-purple-900 mb-2">Step 3: File Within Time Limits</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• <strong>Concealed damage:</strong> 5 days after delivery</li>
                <li>• <strong>Visible damage:</strong> Note on delivery receipt</li>
                <li>• <strong>Shortage claims:</strong> 5 days after delivery</li>
                <li>• <strong>Loss/theft:</strong> 9 months from shipment date</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-l-amber-500">
              <h3 className="font-bold text-amber-900 mb-2">Step 4: Submit Your Claim</h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Complete the claim form below</li>
                <li>• Attach all required documents</li>
                <li>• Include itemized list of damaged goods</li>
                <li>• Provide repair/replacement costs</li>
              </ul>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-l-indigo-500">
              <h3 className="font-bold text-indigo-900 mb-2">Step 5: Claims Processing</h3>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• Carrier has 30 days to acknowledge claim</li>
                <li>• Full response required within 120 days</li>
                <li>• Keep all damaged items until claim is resolved</li>
                <li>• Cooperate with carrier inspection if requested</li>
              </ul>
            </div>
          </div>

          {/* Download Claim Form */}
          <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Download Claim Forms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">
                <Download className="w-4 h-4 mr-2" />
                Standard Cargo Claim Form (PDF)
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="w-4 h-4 mr-2" />
                Damage/Loss Documentation Guide
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="w-4 h-4 mr-2" />
                Concealed Damage Claim Form
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="w-4 h-4 mr-2" />
                Freight Shortage Claim Form
              </Button>
            </div>
          </div>

          {/* Important Notes */}
          <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
            <h3 className="font-bold text-red-900 mb-2">⚠️ Important Notes</h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Claims must be filed within 9 months of delivery date</li>
              <li>• Failure to note damage on delivery receipt may void claim</li>
              <li>• Carrier liability limited to $0.50 per pound unless higher value declared</li>
              <li>• Salvage must be made available to carrier for inspection</li>
              <li>• Keep all packaging materials until claim is resolved</li>
            </ul>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}