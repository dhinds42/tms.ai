import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Eye,
  AlertTriangle,
  Copy,
  Sparkles
} from "lucide-react";

export default function ProspectCard({ prospect, onView, onStatusChange }) {
  const getStatusColor = (status) => {
    const colors = {
      intake: 'bg-blue-100 text-blue-800',
      qualified: 'bg-purple-100 text-purple-800',
      contacted: 'bg-cyan-100 text-cyan-800',
      meeting_scheduled: 'bg-indigo-100 text-indigo-800',
      proposal_sent: 'bg-amber-100 text-amber-800',
      negotiating: 'bg-orange-100 text-orange-800',
      converted: 'bg-emerald-100 text-emerald-800',
      lost: 'bg-red-100 text-red-800',
      disqualified: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getTypeColor = (type) => {
    const colors = {
      shipper: 'bg-blue-600',
      carrier: 'bg-emerald-600',
      vendor: 'bg-purple-600',
      partner: 'bg-indigo-600',
      other: 'bg-slate-600'
    };
    return colors[type] || 'bg-slate-600';
  };

  return (
    <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all group">
      <CardContent className="p-6">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getTypeColor(prospect.prospect_type)}>
                {prospect.prospect_type}
              </Badge>
              {prospect.is_duplicate && (
                <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Copy className="w-3 h-3" />
                  Duplicate
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {prospect.company_name || 'Unknown Company'}
            </h3>
            <p className="text-sm text-slate-600">
              {prospect.contact_name || 'No contact name'}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {prospect.email && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{prospect.email}</span>
            </div>
          )}
          {prospect.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{prospect.phone}</span>
            </div>
          )}
          {prospect.address?.city && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{prospect.address.city}, {prospect.address.state}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {prospect.tags && prospect.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {prospect.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {prospect.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{prospect.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Status & Confidence */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={getStatusColor(prospect.status)}>
            {prospect.status.replace('_', ' ').toUpperCase()}
          </Badge>
          {prospect.extraction_confidence && (
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Sparkles className="w-3 h-3" />
              {prospect.extraction_confidence}% confidence
            </div>
          )}
        </div>

        {/* Alerts */}
        {prospect.requires_review && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-xs text-amber-800">Incomplete data - review required</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onView(prospect)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Eye className="w-3 h-3 mr-1" />
            View Details
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}