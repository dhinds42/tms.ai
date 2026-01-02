import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/design-system';
import KanbanBoard from '@/components/drag-drop/KanbanBoard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, MapPin, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * P0-A: Kanban Dispatch Board with Drag & Drop
 * Secure workflow management with RBAC, approvals, and audit logging
 */
export default function KanbanDispatchBoard() {
  const queryClient = useQueryClient();
  const [pendingApprovals, setPendingApprovals] = useState([]);

  const { data: loads = [], isLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 500),
    initialData: []
  });

  const moveMutation = useMutation({
    mutationFn: async ({ itemId, fromColumn, toColumn }) => {
      return await base44.functions.applyDragDropAction({
        entity_type: 'Load',
        entity_id: itemId,
        from_state: fromColumn,
        to_state: toColumn,
        metadata: {}
      });
    },
    onSuccess: (data) => {
      if (data.status === 'pending_approval') {
        setPendingApprovals(prev => [...prev, data.approval_request_id]);
        toast.error('Stage change requires approval', {
          icon: <AlertCircle className="w-5 h-5" />
        });
      } else {
        toast.success('Load stage updated', {
          icon: <CheckCircle className="w-5 h-5" />
        });
      }
      queryClient.invalidateQueries(['loads']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to move load');
    }
  });

  const columns = [
    { id: 'new', title: 'New', color: 'bg-slate-100' },
    { id: 'tendered', title: 'Tendered', color: 'bg-blue-100' },
    { id: 'covered', title: 'Covered', color: 'bg-purple-100' },
    { id: 'dispatched', title: 'Dispatched', color: 'bg-indigo-100' },
    { id: 'in_transit', title: 'In Transit', color: 'bg-amber-100' },
    { id: 'delivered', title: 'Delivered', color: 'bg-emerald-100' },
    { id: 'invoiced', title: 'Invoiced', color: 'bg-green-100' }
  ];

  const loadsByStage = loads.map(load => ({
    ...load,
    columnId: load.workflow_stage || load.status || 'new'
  }));

  const handleCardMove = ({ itemId, fromColumn, toColumn }) => {
    moveMutation.mutate({ itemId, fromColumn, toColumn });
  };

  const renderLoadCard = (load, isDragging) => {
    const isPendingApproval = pendingApprovals.includes(load.id);

    return (
      <Card className={`cursor-move hover:shadow-md transition-all ${isDragging ? 'shadow-lg' : ''}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-sm text-text-primary">
                {load.load_number || `#${load.id.slice(0, 8)}`}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {new Date(load.created_date).toLocaleDateString()}
              </p>
            </div>
            {isPendingApproval && (
              <Badge className="bg-warning text-warning-border">
                Approval Required
              </Badge>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-text-muted" />
              <span className="text-text-secondary truncate">
                {load.pickup_location?.city || 'N/A'}, {load.pickup_location?.state || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-text-muted" />
              <span className="text-text-secondary truncate">
                {load.dropoff_location?.city || 'N/A'}, {load.dropoff_location?.state || 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border-default">
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-text-muted" />
              <span className="text-xs text-text-secondary">{load.equipment_type || 'Van'}</span>
            </div>
            {load.customer_rate && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-success" />
                <span className="text-xs font-semibold text-success">
                  ${(load.customer_rate / 100).toFixed(0)}
                </span>
              </div>
            )}
          </div>

          {load.assigned_carrier_id && (
            <div className="flex items-center gap-2 pt-2 border-t border-border-default">
              <Truck className="w-3 h-3 text-primary-default" />
              <span className="text-xs text-text-secondary">Assigned</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-default)' }} className="min-h-screen">
        <PageHeader
          title="Dispatch Board"
          subtitle="Drag & drop loads to change workflow stages"
          icon={Truck}
        />
        <div className="max-w-full mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-text-muted">Loading dispatch board...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-default)' }} className="min-h-screen">
      <PageHeader
        title="Dispatch Board"
        subtitle="Drag & drop loads between stages - changes are RBAC-protected and audit-logged"
        icon={Truck}
      />
      
      <div className="max-w-full mx-auto p-6">
        {pendingApprovals.length > 0 && (
          <div className="mb-6 p-4 bg-warning-bg border border-warning-border rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-warning" />
            <div>
              <p className="font-semibold text-warning">
                {pendingApprovals.length} stage change{pendingApprovals.length > 1 ? 's' : ''} pending approval
              </p>
              <p className="text-sm text-text-secondary mt-1">
                High-value loads and backward transitions require manager approval
              </p>
            </div>
          </div>
        )}

        <KanbanBoard
          columns={columns}
          items={loadsByStage}
          onCardMove={handleCardMove}
          renderCard={renderLoadCard}
          disabled={moveMutation.isLoading}
        />
      </div>
    </div>
  );
}