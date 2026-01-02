import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader, EmptyState, FormField } from "@/components/design-system";
import {
  FileText,
  Download,
  Package,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  Users,
  Loader
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AuditPackExport() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [packType, setPackType] = useState('INTERNAL_AUDIT');
  const [isGenerating, setIsGenerating] = useState(false);

  const queryClient = useQueryClient();

  const { data: auditPacks } = useQuery({
    queryKey: ['audit-packs'],
    queryFn: () => base44.entities.AuditPack.list('-created_date', 50),
    initialData: [],
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // In production, this would call the backend function
      // For now, create a placeholder record
      await base44.entities.AuditPack.create({
        org_id: 'default',
        pack_number: `AUDIT-${Date.now()}`,
        pack_type: packType,
        date_range_start: dateRange.start,
        date_range_end: dateRange.end,
        generated_by: 'current_user@tms.ai',
        generated_at: new Date().toISOString(),
        status: 'READY',
        export_format: 'JSON',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      queryClient.invalidateQueries({ queryKey: ['audit-packs'] });
      alert('Audit pack generated successfully');
    } catch (error) {
      alert('Failed to generate audit pack');
    } finally {
      setIsGenerating(false);
    }
  };

  const readyPacks = auditPacks.filter(p => p.status === 'READY');
  const generatingPacks = auditPacks.filter(p => p.status === 'GENERATING');

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Audit Pack Export"
        subtitle={`Compliance and procurement audit bundles • ${readyPacks.length} ready`}
        icon={Package}
        primaryAction={{
          label: 'Generate Pack',
          icon: Package,
          onClick: handleGenerate,
          disabled: isGenerating
        }}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-600">{readyPacks.length}</p>
              <p className="text-xs text-slate-500">Ready</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-blue-600">{generatingPacks.length}</p>
              <p className="text-xs text-slate-500">Generating</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-purple-600">{auditPacks.length}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-cyan-600">{auditPacks.reduce((sum, p) => sum + (p.download_count || 0), 0)}</p>
              <p className="text-xs text-slate-500">Downloads</p>
            </div>
          </div>
        </div>

        {/* Generate New Pack */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Audit Pack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormField label="Pack Type">
                <Select value={packType} onValueChange={setPackType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERNAL_AUDIT">Internal Audit</SelectItem>
                    <SelectItem value="CUSTOMER_AUDIT">Customer Audit</SelectItem>
                    <SelectItem value="COMPLIANCE_AUDIT">Compliance Audit</SelectItem>
                    <SelectItem value="PROCUREMENT_REVIEW">Procurement Review</SelectItem>
                    <SelectItem value="SOC2_EVIDENCE">SOC2 Evidence</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Start Date">
                <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
              </FormField>
              <FormField label="End Date">
                <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
              </FormField>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 mb-4">
              <p className="font-semibold mb-2">Audit Pack Includes:</p>
              <ul className="space-y-1 text-xs">
                <li>✓ Approval Requests & Decisions</li>
                <li>✓ Audit Logs (all entity changes)</li>
                <li>✓ Pricing Snapshots (quotes & invoices)</li>
                <li>✓ Variance Cases & Resolutions</li>
                <li>✓ Chargebacks & Disputes</li>
                <li>✓ Invoice Line Items</li>
              </ul>
            </div>
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
              {isGenerating ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
              {isGenerating ? 'Generating...' : 'Generate Audit Pack'}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Packs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Audit Packs</CardTitle>
          </CardHeader>
          <CardContent>
            {auditPacks.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No audit packs"
                description="Generate your first audit pack above"
              />
            ) : (
              <div className="space-y-2">
                {auditPacks.map(pack => (
                  <div key={pack.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{pack.pack_number}</h3>
                          <Badge className={
                            pack.status === 'READY' ? 'bg-emerald-100 text-emerald-800' :
                            pack.status === 'GENERATING' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'
                          }>
                            {pack.status}
                          </Badge>
                          <Badge variant="outline">{pack.pack_type}</Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(pack.date_range_start).toLocaleDateString()} - {new Date(pack.date_range_end).toLocaleDateString()}
                        </p>
                      </div>
                      {pack.status === 'READY' && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                      )}
                    </div>
                    {pack.record_counts && (
                      <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                        <div className="p-2 bg-slate-50 rounded">
                          <span className="text-slate-500">Approvals: </span>
                          <span className="font-semibold">{pack.record_counts.approval_requests || 0}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded">
                          <span className="text-slate-500">Invoices: </span>
                          <span className="font-semibold">{pack.record_counts.invoices || 0}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded">
                          <span className="text-slate-500">Variances: </span>
                          <span className="font-semibold">{pack.record_counts.variance_cases || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}