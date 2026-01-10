import React from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/design-system/PageHeader";
import { Blocks, ExternalLink, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function BlockchainFreightLedger() {
  const { data: transactions = [], isLoading } = useScopedEntity('BlockchainTransaction', { limit: 50 });

  const statusConfig = {
    confirmed: { icon: CheckCircle2, color: "bg-emerald-500", label: "Confirmed" },
    pending: { icon: Clock, color: "bg-amber-500", label: "Pending" },
    failed: { icon: XCircle, color: "bg-red-500", label: "Failed" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Blockchain Freight Ledger"
        subtitle="Immutable record of freight transactions on blockchain"
        icon={Blocks}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">
                {transactions.length}
              </div>
              <p className="text-sm text-slate-600 mt-1">Total Transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-600">
                {transactions.filter(t => t.status === 'confirmed').length}
              </div>
              <p className="text-sm text-slate-600 mt-1">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-amber-600">
                {transactions.filter(t => t.status === 'pending').length}
              </div>
              <p className="text-sm text-slate-600 mt-1">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">
                {transactions[0]?.network || 'Polygon'}
              </div>
              <p className="text-sm text-slate-600 mt-1">Network</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map(tx => {
                const StatusIcon = statusConfig[tx.status]?.icon || Clock;
                return (
                  <div key={tx.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="capitalize">
                            {tx.transaction_type?.replace(/_/g, ' ')}
                          </Badge>
                          <Badge className={`${statusConfig[tx.status]?.color} text-white`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[tx.status]?.label}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Load ID:</span>
                            <span className="ml-2 font-mono">{tx.load_id || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Block:</span>
                            <span className="ml-2 font-mono">{tx.block_number || 'Pending'}</span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-slate-500">Hash:</span>
                            <span className="ml-2 font-mono text-xs">{tx.transaction_hash || 'Generating...'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Gas Fee:</span>
                            <span className="ml-2">${((tx.gas_fee_cents || 0) / 100).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Network:</span>
                            <span className="ml-2 capitalize">{tx.network}</span>
                          </div>
                        </div>
                      </div>
                      {tx.immutable_proof_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(tx.immutable_proof_url, '_blank')}
                          className="gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on Chain
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {transactions.length === 0 && (
                <div className="py-12 text-center">
                  <Blocks className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No blockchain transactions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}