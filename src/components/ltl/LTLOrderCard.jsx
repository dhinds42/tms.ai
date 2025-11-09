import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  ExternalLink
} from "lucide-react";

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
    <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{order.order_number}</h3>
            <Badge className={getStatusColor(order.status)}>
              {order.status?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          {order.selected_rate && (
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">
                ${order.selected_rate.customer_rate?.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">Customer Rate</p>
            </div>
          )}
        </div>

        {/* Commodity & Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-900">{order.commodity}</span>
          </div>
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
              {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString() : 'TBD'}
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
        <div className="flex flex-wrap gap-2">
          {!isArchived && (
            <>
              {order.status === 'draft' && (
                <>
                  <Button size="sm" variant="outline" onClick={onEdit}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
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
  );
}