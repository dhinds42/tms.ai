import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Plus, Eye, Download, CheckCircle, AlertTriangle } from "lucide-react";

import ContractGenerator from "../components/contract-assistant/ContractGenerator";
import ContractAnalyzer from "../components/contract-assistant/ContractAnalyzer";
import ContractLibrary from "../components/contract-assistant/ContractLibrary";
import ContractTemplates from "../components/contract-assistant/ContractTemplates";

export default function ContractAssistant() {
  const [activeView, setActiveView] = useState('library');
  const [generatingContract, setGeneratingContract] = useState(null);
  const [analyzingContract, setAnalyzingContract] = useState(null);

  const { data: carriers } = useScopedEntity('Carrier', { limit: 100 });
  const { data: shippers } = useScopedEntity('Shipper', { limit: 100 });
  const { data: ownerOperators } = useScopedEntity('OwnerOperator', { limit: 100 });

  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  // Simulated contract data - in production would be stored in database
  const contracts = [
    {
      id: '1',
      type: 'carrier_agreement',
      party: 'ABC Logistics',
      status: 'active',
      start_date: '2024-01-01',
      end_date: '2025-01-01',
      value: 500000,
      auto_renew: true
    },
    {
      id: '2',
      type: 'shipper_agreement',
      party: 'XYZ Manufacturing',
      status: 'active',
      start_date: '2024-03-01',
      end_date: '2025-03-01',
      value: 750000,
      auto_renew: false
    },
    {
      id: '3',
      type: 'lease_agreement',
      party: 'John Smith (O/O)',
      status: 'pending',
      start_date: '2025-01-01',
      end_date: '2026-01-01',
      value: 150000,
      auto_renew: true
    }
  ];

  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const expiringContracts = contracts.filter(c => {
    if (!c.end_date) return false;
    const daysUntilExpiry = Math.floor((new Date(c.end_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 60 && daysUntilExpiry > 0;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2">
            AI Contract Assistant
          </h1>
          <p className="text-slate-600 text-lg">
            Generate, analyze, and manage contracts with artificial intelligence
          </p>
          <Badge className="mt-3 bg-indigo-600">AI-Powered Legal Tech</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Contracts</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{contracts.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{activeContracts}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Expiring Soon</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{expiringContracts}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Value</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    ${(contracts.reduce((sum, c) => sum + c.value, 0) / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Download className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex gap-2 border-b border-slate-200 pb-4 mb-6">
              <Button
                onClick={() => setActiveView('library')}
                variant={activeView === 'library' ? 'default' : 'ghost'}
                className={activeView === 'library' ? 'bg-indigo-600' : ''}
              >
                <FileText className="w-4 h-4 mr-2" />
                Contract Library
              </Button>
              <Button
                onClick={() => setActiveView('generate')}
                variant={activeView === 'generate' ? 'default' : 'ghost'}
                className={activeView === 'generate' ? 'bg-purple-600' : ''}
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate New
              </Button>
              <Button
                onClick={() => setActiveView('analyze')}
                variant={activeView === 'analyze' ? 'default' : 'ghost'}
                className={activeView === 'analyze' ? 'bg-emerald-600' : ''}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Contract
              </Button>
              <Button
                onClick={() => setActiveView('templates')}
                variant={activeView === 'templates' ? 'default' : 'ghost'}
                className={activeView === 'templates' ? 'bg-blue-600' : ''}
              >
                <Eye className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </div>

            {/* View Content */}
            {activeView === 'library' && (
              <ContractLibrary 
                contracts={contracts}
                onGenerate={(contract) => {
                  setGeneratingContract(contract);
                  setActiveView('generate');
                }}
                onAnalyze={(contract) => {
                  setAnalyzingContract(contract);
                  setActiveView('analyze');
                }}
              />
            )}

            {activeView === 'generate' && (
              <ContractGenerator 
                carriers={carriers}
                shippers={shippers}
                ownerOperators={ownerOperators}
                operatingMode={operatingMode}
                preselectedContract={generatingContract}
              />
            )}

            {activeView === 'analyze' && (
              <ContractAnalyzer 
                preselectedContract={analyzingContract}
              />
            )}

            {activeView === 'templates' && (
              <ContractTemplates operatingMode={operatingMode} />
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}