import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Download, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ContractGenerator({ carriers, shippers, ownerOperators, operatingMode, preselectedContract }) {
  const [contractType, setContractType] = useState(preselectedContract?.type || 'carrier_agreement');
  const [party, setParty] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('12');
  const [specialTerms, setSpecialTerms] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContract, setGeneratedContract] = useState(null);

  const contractTypes = operatingMode === 'broker' 
    ? [
        { value: 'carrier_agreement', label: 'Carrier Agreement' },
        { value: 'shipper_agreement', label: 'Shipper Agreement' },
        { value: 'broker_carrier_contract', label: 'Broker-Carrier Contract' }
      ]
    : [
        { value: 'lease_agreement', label: 'Owner Operator Lease' },
        { value: 'driver_employment', label: 'Driver Employment Contract' },
        { value: 'equipment_lease', label: 'Equipment Lease Agreement' }
      ];

  const generateContract = async () => {
    if (!party || !startDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a legal AI assistant specializing in freight transportation contracts.

Generate a comprehensive, legally sound contract with the following details:

CONTRACT TYPE: ${contractType.replace(/_/g, ' ')}
PARTY: ${party}
START DATE: ${startDate}
DURATION: ${duration} months
OPERATING MODE: ${operatingMode}
SPECIAL TERMS: ${specialTerms || 'None'}

The contract should include:
1. Full legal header with parties identified
2. Definitions section
3. Scope of services
4. Rates and payment terms
5. Insurance requirements
6. Indemnification clauses
7. Termination conditions
8. Force majeure
9. Dispute resolution
10. Signature blocks

Make it professional, legally enforceable, and industry-standard. Include all necessary legal protections for the ${operatingMode === 'broker' ? 'broker' : 'carrier'}.

Format the contract with proper sections, numbering, and legal language.`,
        add_context_from_internet: false
      });

      setGeneratedContract(result);

    } catch (error) {
      console.error('Contract generation error:', error);
      alert('Failed to generate contract');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadContract = () => {
    if (!generatedContract) return;
    
    const blob = new Blob([generatedContract], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contractType}_${party.replace(/\s+/g, '_')}_${startDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {!generatedContract ? (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Contract Type *</Label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Party Name *</Label>
              <Input
                value={party}
                onChange={(e) => setParty(e.target.value)}
                placeholder={operatingMode === 'broker' ? 'ABC Logistics Inc.' : 'John Smith'}
              />
            </div>

            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Contract Duration (months)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="12"
              />
            </div>
          </div>

          <div>
            <Label>Special Terms or Requirements</Label>
            <Textarea
              value={specialTerms}
              onChange={(e) => setSpecialTerms(e.target.value)}
              placeholder="Enter any special clauses, rate structures, or unique terms..."
              rows={4}
            />
          </div>

          <Button
            onClick={generateContract}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Contract with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Contract
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          <Card className="border-2 border-emerald-300 bg-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-emerald-900">Contract Generated Successfully</h3>
                    <p className="text-sm text-emerald-700">Review and download your contract</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={downloadContract}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => setGeneratedContract(null)}
                    variant="outline"
                  >
                    Generate Another
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-white rounded-xl border-2 border-slate-200 max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-900">
              {generatedContract}
            </pre>
          </div>
        </>
      )}

    </div>
  );
}