import { openFileInNewTab } from '../../api/integrations';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, FileText, Loader2, Download, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { generateDocument, logDocumentAction } from "../utils/documentFormatHandler.jsx";

export default function ContractGenerator({ carriers, shippers, ownerOperators, operatingMode, preselectedContract }) {
  const [formData, setFormData] = useState({
    contract_type: preselectedContract?.type || 'carrier_agreement',
    party_name: '',
    party_id: '',
    effective_date: '',
    end_date: '',
    payment_terms: 'net_30',
    rates: '',
    special_terms: '',
    auto_renew: false,
    export_format: 'pdf'
  });
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!formData.party_name || !formData.effective_date) {
      alert('Please provide party name and effective date');
      return;
    }

    setGenerating(true);
    try {
      const user = await base44.auth.me();
      
      // Use AI to generate contract
      const contractPrompt = `Generate a professional ${formData.contract_type.replace(/_/g, ' ')} agreement with the following details:
      
      Party Name: ${formData.party_name}
      Effective Date: ${formData.effective_date}
      End Date: ${formData.end_date || 'N/A'}
      Payment Terms: ${formData.payment_terms}
      Rates: ${formData.rates}
      Special Terms: ${formData.special_terms}
      Auto-Renew: ${formData.auto_renew ? 'Yes' : 'No'}
      
      Include all standard legal clauses for ${operatingMode} operations, indemnification, insurance requirements, 
      termination conditions, and dispute resolution. Make it legally sound and professionally formatted.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: contractPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            contract_text: { type: "string" },
            key_terms: {
              type: "array",
              items: { type: "string" }
            },
            legal_review_notes: { type: "string" }
          }
        }
      });

      // Generate document in selected format
      const docResult = await generateDocument('contract', {
        contract_type: formData.contract_type,
        party_name: formData.party_name,
        contract_data: formData,
        ai_generated_content: result.contract_text,
        module: 'Contract Assistant',
        feature: 'Contract Generation'
      }, formData.export_format);

      if (docResult.success) {
        // Log generation
        await logDocumentAction({
          documentId: docResult.document.id,
          documentName: `Contract_${formData.party_name.replace(/\s+/g, '_')}.${formData.export_format}`,
          documentType: 'contract',
          actionType: 'generated',
          actionBy: user.email,
          fileFormat: formData.export_format,
          module: 'Contract Assistant',
          feature: 'AI Contract Generation',
          notes: `AI-generated ${formData.contract_type} in ${formData.export_format.toUpperCase()} format`
        });

        alert(`✅ Contract Generated Successfully!\n\nFormat: ${formData.export_format.toUpperCase()}\nParty: ${formData.party_name}\n\nKey Terms:\n${result.key_terms.slice(0, 3).map(t => `• ${t}`).join('\n')}\n\n⚠️ Legal Review Recommended:\n${result.legal_review_notes}`);

        // In production, would download the file
        openFileInNewTab(docResult.document.file_url);
      } else {
        alert(`Failed to generate contract: ${docResult.message}`);
      }
    } catch (error) {
      console.error('Contract generation error:', error);
      alert('Failed to generate contract');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI-Powered Contract Generation
        </h3>
        <p className="text-sm text-purple-800">
          Generate professional, legally-sound contracts instantly using artificial intelligence. 
          Select your format, fill in details, and let AI create a complete agreement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Contract Type */}
        <div>
          <Label>Contract Type *</Label>
          <Select 
            value={formData.contract_type} 
            onValueChange={(value) => setFormData({...formData, contract_type: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {operatingMode === 'broker' && (
                <>
                  <SelectItem value="carrier_agreement">Carrier Agreement</SelectItem>
                  <SelectItem value="shipper_agreement">Shipper Agreement</SelectItem>
                  <SelectItem value="broker_carrier_agreement">Broker-Carrier Agreement</SelectItem>
                </>
              )}
              {operatingMode === 'carrier' && (
                <>
                  <SelectItem value="driver_employment">Driver Employment Agreement</SelectItem>
                  <SelectItem value="lease_agreement">Owner Operator Lease Agreement</SelectItem>
                  <SelectItem value="independent_contractor">Independent Contractor Agreement</SelectItem>
                </>
              )}
              <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
              <SelectItem value="service_agreement">Service Agreement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Party Selection */}
        <div>
          <Label>Party Name *</Label>
          <Input
            value={formData.party_name}
            onChange={(e) => setFormData({...formData, party_name: e.target.value})}
            placeholder="Company or individual name"
          />
        </div>

        {/* Dates */}
        <div>
          <Label>Effective Date *</Label>
          <Input
            type="date"
            value={formData.effective_date}
            onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
          />
        </div>

        <div>
          <Label>End Date (Optional)</Label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
          />
        </div>

        {/* Payment Terms */}
        <div>
          <Label>Payment Terms</Label>
          <Select 
            value={formData.payment_terms} 
            onValueChange={(value) => setFormData({...formData, payment_terms: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="net_15">Net 15</SelectItem>
              <SelectItem value="net_30">Net 30</SelectItem>
              <SelectItem value="net_45">Net 45</SelectItem>
              <SelectItem value="net_60">Net 60</SelectItem>
              <SelectItem value="quick_pay">Quick Pay (7 days)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rates */}
        <div>
          <Label>Rates/Compensation</Label>
          <Input
            value={formData.rates}
            onChange={(e) => setFormData({...formData, rates: e.target.value})}
            placeholder="e.g., $2.50/mile, 75% of gross, $50,000/year"
          />
        </div>

        {/* Export Format */}
        <div className="md:col-span-2">
          <Label>Contract Document Format *</Label>
          <Select 
            value={formData.export_format} 
            onValueChange={(value) => setFormData({...formData, export_format: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>📄 PDF - Final Execution Ready</span>
                </div>
              </SelectItem>
              <SelectItem value="docx">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>📝 Word - Editable for Legal Review</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-2">
            PDF for final contracts, Word for customization and legal review
          </p>
        </div>

        {/* Auto-Renew */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              checked={formData.auto_renew}
              onChange={(e) => setFormData({...formData, auto_renew: e.target.checked})}
              className="w-5 h-5 text-indigo-600 rounded"
            />
            <div>
              <Label className="font-semibold">Auto-Renewal Clause</Label>
              <p className="text-sm text-slate-600">
                Automatically renew contract for successive terms unless terminated
              </p>
            </div>
          </div>
        </div>

        {/* Special Terms */}
        <div className="md:col-span-2">
          <Label>Special Terms & Conditions</Label>
          <Textarea
            value={formData.special_terms}
            onChange={(e) => setFormData({...formData, special_terms: e.target.value})}
            rows={4}
            placeholder="Any specific clauses, requirements, or special conditions..."
          />
        </div>

      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={generating || !formData.party_name || !formData.effective_date}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 text-lg"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating Contract with AI...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate {formData.export_format.toUpperCase()} Contract with AI
          </>
        )}
      </Button>

      {/* Disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          <strong>⚠️ Legal Disclaimer:</strong> AI-generated contracts should be reviewed by a qualified attorney 
          before execution. This tool provides templates and suggestions but does not constitute legal advice.
        </p>
      </div>

    </div>
  );
}
