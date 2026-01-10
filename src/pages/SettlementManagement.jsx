import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { DollarSign, Download, Search } from "lucide-react";
import { PageHeader, EmptyState, StandardTabs } from "@/components/design-system";
import SettlementProcessor from "../components/settlement/SettlementProcessor";
import SettlementStats from "../components/settlement/SettlementStats";
import SettlementCard from "../components/settlement/SettlementCard";

export default function SettlementManagement() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: settlements, isLoading: settlementsLoading } = useQuery({
    queryKey: ['settlements'],
    queryFn: () => base44.entities.Settlement.list('-created_date', 100),
    initialData: [],
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers, isLoading: carriersLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const updateSettlementMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Settlement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
    },
  });

  const handleApproveSettlement = (settlementId) => {
    updateSettlementMutation.mutate({
      id: settlementId,
      data: {
        status: 'approved',
        approved_date: new Date().toISOString()
      }
    });
  };

  const handlePaySettlement = (settlementId) => {
    updateSettlementMutation.mutate({
      id: settlementId,
      data: {
        status: 'paid',
        paid_date: new Date().toISOString()
      }
    });
  };

  // Filter settlements
  const filteredSettlements = settlements.filter(s => {
    const statusMatch = statusFilter === 'all' || s.status === statusFilter;
    const searchMatch = searchTerm === '' ||
      s.settlement_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.driver_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.carrier_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Calculate stats
  const totalPending = settlements.filter(s => s.status === 'pending').length;
  const totalApproved = settlements.filter(s => s.status === 'approved').length;
  const totalPaid = settlements.filter(s => s.status === 'paid').length;
  const pendingAmount = settlements
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + (s.total_amount || 0), 0);

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-100 text-amber-800',
      'approved': 'bg-blue-100 text-blue-800',
      'paid': 'bg-emerald-100 text-emerald-800',
      'disputed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Settlement Management"
        subtitle="Driver & carrier payment settlements with detailed pay calculations"
        icon={DollarSign}
        primaryAction={{
          label: 'Export',
          icon: Download,
          onClick: () => alert('Export coming soon')
        }}
        modeBadge={operatingMode.toUpperCase()}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <SettlementStats 
          totalPending={totalPending}
          totalApproved={totalApproved}
          totalPaid={totalPaid}
          pendingAmount={pendingAmount}
        />

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by settlement #, driver, or carrier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <StandardTabs
              tabs={[
                { key: 'all', label: `All (${settlements.length})`, icon: FileText },
                { key: 'pending', label: `Pending (${totalPending})`, icon: Clock },
                { key: 'approved', label: `Approved (${totalApproved})`, icon: CheckCircle },
                { key: 'paid', label: `Paid (${totalPaid})`, icon: DollarSign }
              ]}
              activeTab={statusFilter}
              onTabChange={setStatusFilter}
            />
          </CardContent>
        </Card>

        {/* Settlements List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSettlements.length === 0 ? (
            <div className="lg:col-span-2">
              <EmptyState
                icon={DollarSign}
                title="No settlements found"
                description={searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No settlements available'}
              />
            </div>
          ) : (
            filteredSettlements.map((settlement) => {
              const driver = drivers.find(d => d.id === settlement.driver_id);
              const carrier = carriers.find(c => c.id === settlement.carrier_id);
              const recipient = driver || carrier;

              return (
                <SettlementCard
                  key={settlement.id}
                  settlement={settlement}
                  recipient={recipient}
                  onApprove={handleApproveSettlement}
                  onPay={handlePaySettlement}
                />
              );
            })
          )}
        </div>

        {/* Settlement Processor */}
        <SettlementProcessor />

      </div>
    </div>
  );
}