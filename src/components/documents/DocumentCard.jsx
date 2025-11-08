import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const documentTypeColors = {
  bol: "bg-blue-100 text-blue-700 border-blue-300",
  pod: "bg-emerald-100 text-emerald-700 border-emerald-300",
  rate_confirmation: "bg-purple-100 text-purple-700 border-purple-300",
  invoice: "bg-amber-100 text-amber-700 border-amber-300",
  lumper_receipt: "bg-orange-100 text-orange-700 border-orange-300",
  scale_ticket: "bg-cyan-100 text-cyan-700 border-cyan-300",
  customs: "bg-indigo-100 text-indigo-700 border-indigo-300",
  other: "bg-slate-100 text-slate-700 border-slate-300"
};

const documentTypeIcons = {
  bol: "📋",
  pod: "✅",
  rate_confirmation: "💰",
  invoice: "💵",
  lumper_receipt: "🧾",
  scale_ticket: "⚖️",
  customs: "🛃",
  other: "📄"
};

export default function DocumentCard({ document, loads, onDelete, onProcess, onVerify }) {
  const typeColor = documentTypeColors[document.document_type] || documentTypeColors.other;
  const typeIcon = documentTypeIcons[document.document_type] || documentTypeIcons.other;
  
  const associatedLoad = loads?.find(l => l.id === document.load_id);

  const handleDownload = () => {
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
      <div className={`h-2 ${document.verified ? 'bg-gradient-to-r from-emerald-600 to-green-600' : 'bg-gradient-to-r from-amber-600 to-orange-600'}`}></div>
      <CardContent className="p-5">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-3xl">{typeIcon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">
                {document.file_name || 'Untitled Document'}
              </h3>
              <Badge variant="outline" className={`${typeColor} border font-medium text-xs mt-1`}>
                {document.document_type.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-lg">⋮</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(document.file_url, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </DropdownMenuItem>
              {!document.verified && (
                <>
                  <DropdownMenuItem onClick={() => onProcess(document)}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Process with DataBot
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onVerify(document.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Verified
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(document.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Associated Load */}
        {associatedLoad && (
          <div className="mb-3 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Associated Load
            </p>
            <p className="font-medium text-slate-900 text-sm">
              {associatedLoad.load_number || `#${associatedLoad.id.slice(0, 8)}`}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {associatedLoad.pickup_location?.city} → {associatedLoad.dropoff_location?.city}
            </p>
          </div>
        )}

        {/* Verification Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {document.verified ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Verified</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Needs Review</span>
              </>
            )}
          </div>
        </div>

        {/* Extracted Data Preview */}
        {document.extracted_data && Object.keys(document.extracted_data).length > 0 && (
          <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-xs font-semibold text-indigo-900 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Extracted Data
            </p>
            <div className="space-y-1">
              {Object.entries(document.extracted_data).slice(0, 3).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-indigo-700 font-medium">{key}:</span>{' '}
                  <span className="text-indigo-900">{String(value)}</span>
                </div>
              ))}
              {Object.keys(document.extracted_data).length > 3 && (
                <p className="text-xs text-indigo-600">
                  +{Object.keys(document.extracted_data).length - 3} more fields
                </p>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {document.uploaded_by || 'System'}
            </span>
            <span>
              {document.created_date && format(new Date(document.created_date), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        {/* Actions */}
        {!document.verified && (
          <div className="mt-4">
            <Button
              onClick={() => onProcess(document)}
              variant="outline"
              size="sm"
              className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Process with DataBot
            </Button>
          </div>
        )}

        {/* Notes */}
        {document.notes && (
          <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-800">
            {document.notes}
          </div>
        )}

      </CardContent>
    </Card>
  );
}