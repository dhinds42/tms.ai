
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  MapPin,
  DollarSign,
  Edit,
  TrendingUp,
  Truck,
  Archive,
  ArchiveRestore,
  CheckCircle,
  XCircle,
  ExternalLink,
  History,
  Calendar,
  MoreVertical,
  Download,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import FormatExportMenu from "../documents/FormatExportMenu";
import DocumentHistoryTimeline from "../documents/DocumentHistoryTimeline";
import { getDocumentHistory } from "../utils/documentFormatHandler";

export default function LTLOrderCard({
  order,
  load,
  onEdit,
  onGetRates,
  onViewLoad,
  onArchive,
  onUnarchive,
  onAcceptQuote,
  onRejectQuote,
  onBookShipment,
  isArchived
}) {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // isNewDocument removed, so removing related state and badge.

  // Create pseudo-document for export menu
  const orderDocument = {
    id: order.id,
    file_name: `LTL_Order_${order.order_number}.pdf`,
    document_type: 'ltl_order',
    file_url: order.bol_url || '#',
    order_id: order.id,
    order_number: order.order_number
  };

  const handleShowHistory = async () => {
    setLoadingHistory(true);
    try {
      const docHistory = await getDocumentHistory(order.id);
      setHistory(docHistory);
      setShowHistory(true);
    } catch (error) {
      console.error('Failed to load history:', error);
      setHistory([]);
      setShowHistory(true); // Still open dialog to show empty state/error
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'quote_sent': return 'bg-purple-100 text-purple-800';
      case 'quote_accepted': return 'bg-emerald-100 text-emerald-800';
      case 'quote_rejected': return 'bg-red-100 text-red-800';
      case 'booked': return 'bg-indigo-100 text-indigo-800';
      case 'on_load': return 'bg-cyan-100 text-cyan-800';
      case 'in_transit': return 'bg-amber-100 text-amber-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <>
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      #{order.order_number || order.id.slice(0, 8)}
                    </h3>
                    {/* NEW Badge removed as isNewDocument is no longer imported */}
                  </div>
                  <p className="text-sm text-slate-600">{order.commodity}</p>
                </div>
              </div>
              {/* Status Badge - kept from original code */}
              <Badge className={getStatusColor(order.status)}>
                {order.status?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3"> {/* Wrapper for rate and dropdown */}
              {order.selected_rate && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">
                    ${order.selected_rate.customer_rate?.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">Customer Rate</p>
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" /> {/* Changed from Edit to MoreVertical */}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(order)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Order
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShowHistory} disabled={loadingHistory}>
                    <History className="w-4 h-4 mr-2" />
                    {loadingHistory ? 'Loading...' : 'View History'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Commodity & Details - modified to remove commodity string, now only items/weight */}
          <div className="space-y-2 mb-4">
            <div className="text-sm text-slate-600">
              {order.items?.length || 0} item(s) | {order.items?.reduce((sum, item) => sum + item.weight, 0)} lbs
            </div>
          </div>

          {/* Route */}
          <div className="space-y-3 mb-4">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase">Pickup</p>
                  <p className="text-sm font-bold text-slate-900">
                    {order.pickup_location?.city}, {order.pickup_location?.state}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-700" />
                <div>
                  <p className="text-xs font-semibold text-red-700 uppercase">Delivery</p>
                  <p className="text-sm font-bold text-slate-900">
                    {order.delivery_location?.city}, {order.delivery_location?.state}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div>
              <p className="text-slate-500">Pickup Date</p>
              <p className="font-semibold text-slate-900">
                {order.pickup_date ? format(new Date(order.pickup_date), 'MMM dd, yyyy') : 'TBD'} {/* Using format from date-fns */}
              </p>
            </div>
            {order.selected_rate && (
              <div>
                <p className="text-slate-500">Transit Days</p>
                <p className="font-semibold text-slate-900">{order.selected_rate.transit_days || 'TBD'}</p>
              </div>
            )}
          </div>

          {/* Selected Carrier */}
          {order.selected_rate && (
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-700" />
                <div>
                  <p className="text-xs font-semibold text-indigo-700 uppercase">Carrier</p>
                  <p className="text-sm font-bold text-slate-900">{order.selected_rate.carrier_name}</p>
                  <p className="text-xs text-slate-600">{order.selected_rate.service_level}</p>
                </div>
              </div>
            </div>
          )}

          {/* Margin */}
          {order.selected_rate?.margin && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-700" />
                <span className="text-sm font-semibold text-blue-700">Margin</span>
              </div>
              <span className="text-lg font-bold text-blue-900">
                ${order.selected_rate.margin?.toLocaleString()}
              </span>
            </div>
          )}

          {/* Load Reference */}
          {order.load_id && (
            <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-cyan-700 uppercase">On Load</p>
                  <p className="text-sm font-bold text-slate-900">Load ID: {order.load_id.slice(0, 8)}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewLoad(order.load_id)}
                  className="border-cyan-300 text-cyan-700 hover:bg-cyan-100"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Load
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
            {!isArchived && (
              <>
                {order.status === 'draft' && (
                  <>
                    {/* Edit button moved to dropdown menu */}
                    <Button
                      size="sm"
                      onClick={onGetRates}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Get LTL Quotes
                    </Button>
                  </>
                )}

                {order.status === 'quote_sent' && (
                  <>
                    <Button
                      size="sm"
                      onClick={onAcceptQuote}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Accept Quote
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onRejectQuote}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject Quote
                    </Button>
                  </>
                )}

                {(order.status === 'quoted' || order.status === 'quote_accepted') && (
                  <Button
                    size="sm"
                    onClick={onBookShipment}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  >
                    <Truck className="w-3 h-3 mr-1" />
                    Book Shipment
                  </Button>
                )}

                {!order.load_id && order.status !== 'archived' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onArchive}
                    className="ml-auto"
                  >
                    <Archive className="w-3 h-3 mr-1" />
                    Archive
                  </Button>
                )}
              </>
            )}

            {isArchived && (
              <Button
                size="sm"
                onClick={onUnarchive}
                className="bg-gradient-to-r from-slate-600 to-slate-700 text-white"
              >
                <ArchiveRestore className="w-3 h-3 mr-1" />
                Unarchive
              </Button>
            )}
            
            {/* Export Menu */}
            {order.status !== 'draft' && (
              <FormatExportMenu 
                document={orderDocument}
                module="LTL Management"
                feature="LTL Order Export"
              />
            )}
          </div>

          {/* Tracking URL */}
          {order.tracking_url && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-700 hover:text-blue-800 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Click Here for Latest Tracking Information
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              LTL Order History: #{order.order_number}
            </DialogTitle>
          </DialogHeader>
          <DocumentHistoryTimeline history={history} />
        </DialogContent>
      </Dialog>
    </>
  );
}
