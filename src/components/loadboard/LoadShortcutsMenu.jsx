import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit,
  FileText,
  Shield,
  Send,
  Radio,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle,
  Eye,
  Radio as RadioIcon,
  Search,
  Repeat,
  Copy,
  Archive,
  XCircle,
  Users,
  Truck,
  TrendingUp,
  DollarSign,
  Zap
} from "lucide-react";
import { createPageUrl } from "@/utils";

export default function LoadShortcutsMenu({
  load,
  operatingMode,
  onEditLoad,
  onViewDocs,
  onRequestDocs,
  onManageRoles,
  onSendTracking,
  onEnableAutoTracking,
  onSendTextMessage,
  onSendLoadDetails,
  onLogCheckCall,
  onViewLog,
  onPostLoad,
  onSearchLoadBoards,
  onSwitchBranch,
  onCopyLoad,
  onSendToAccounting,
  onArchiveLoad,
  onCancelLoad,
  onAssignDriver,
  onAssignCarrier,
  onOptimizeRoute,
  onAnalyzeRate
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Load Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Request Spot Quote - NEW */}
        {load.status === 'available' && operatingMode === 'broker' && (
          <>
            <DropdownMenuItem onClick={() => {
              setOpen(false);
              window.location.href = createPageUrl("QuoteManagement");
            }}>
              <Zap className="w-4 h-4 mr-2" />
              Request Spot Quote
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Edit Load */}
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          onEditLoad(load);
        }}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Load
        </DropdownMenuItem>

        {/* View Documents */}
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          onViewDocs(load);
        }}>
          <FileText className="w-4 h-4 mr-2" />
          View Documents
        </DropdownMenuItem>

        {/* Request Documents */}
        {load.driver_id && operatingMode === 'carrier' && (
          <DropdownMenuItem onClick={() => {
            setOpen(false);
            onRequestDocs(load);
          }}>
            <FileText className="w-4 h-4 mr-2" />
            Request Docs from Driver
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Communication Section */}
        <DropdownMenuLabel>Communication</DropdownMenuLabel>

        {/* Send Tracking */}
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          onSendTracking(load);
        }}>
          <Send className="w-4 h-4 mr-2" />
          Send Tracking Link
        </DropdownMenuItem>

        {/* Enable Auto-Tracking */}
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          onEnableAutoTracking(load);
        }}>
          <Radio className="w-4 h-4 mr-2" />
          Enable Auto-Tracking
        </DropdownMenuItem>

        {/* Send Text Message */}
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          onSendTextMessage(load);
        }}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Send Text Message
        </DropdownMenuItem>

        {/* Send Load Details */}
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          onSendLoadDetails(load);
        }}>
          <Mail className="w-4 h-4 mr-2" />
          Send Load Details
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Tracking Section */}
        <DropdownMenuLabel>Tracking</DropdownMenuLabel>

        {/* Log Check Call */}
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          onLogCheckCall(load);
        }}>
          <Phone className="w-4 h-4 mr-2" />
          Log Check Call
        </DropdownMenuItem>

        {/* View Activity Log */}
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          onViewLog(load);
        }}>
          <Eye className="w-4 h-4 mr-2" />
          View Activity Log
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Carrier/Driver Actions */}
        {operatingMode === 'broker' ? (
          <>
            <DropdownMenuLabel>Carrier Actions</DropdownMenuLabel>
            
            {/* Post to Load Boards */}
            <DropdownMenuItem onClick={() => {
              setOpen(false);
              onPostLoad(load);
            }}>
              <RadioIcon className="w-4 h-4 mr-2" />
              Post to Load Boards
            </DropdownMenuItem>

            {/* Search Load Boards */}
            <DropdownMenuItem onClick={() => {
              setOpen(false);
              onSearchLoadBoards(load);
            }}>
              <Search className="w-4 h-4 mr-2" />
              Search Load Boards
            </DropdownMenuItem>

            {/* Assign Carrier */}
            {!load.carrier_id && (
              <DropdownMenuItem onClick={() => {
                setOpen(false);
                onAssignCarrier(load);
              }}>
                <Truck className="w-4 h-4 mr-2" />
                Assign Carrier
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <>
            <DropdownMenuLabel>Driver Actions</DropdownMenuLabel>
            
            {/* Assign Driver */}
            {!load.driver_id && (
              <DropdownMenuItem onClick={() => {
                setOpen(false);
                onAssignDriver(load);
              }}>
                <Users className="w-4 h-4 mr-2" />
                Assign Driver
              </DropdownMenuItem>
            )}
          </>
        )}

        <DropdownMenuSeparator />

        {/* Optimization & Analysis */}
        <DropdownMenuLabel>Optimization</DropdownMenuLabel>

        {/* Optimize Route */}
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          onOptimizeRoute(load);
        }}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Optimize Route
        </DropdownMenuItem>

        {/* Analyze Rate */}
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          onAnalyzeRate(load);
        }}>
          <DollarSign className="w-4 h-4 mr-2" />
          Analyze Rate
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Management Section */}
        <DropdownMenuLabel>Management</DropdownMenuLabel>

        {/* Switch Branch */}
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          onSwitchBranch(load);
        }}>
          <Repeat className="w-4 h-4 mr-2" />
          Switch Branch
        </DropdownMenuItem>

        {/* Copy Load */}
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          onCopyLoad(load);
        }}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Load
        </DropdownMenuItem>

        {/* Send to Accounting */}
        {['delivered', 'completed'].includes(load.status) && (
          <DropdownMenuItem onClick={() => {
            setOpen(false);
            onSendToAccounting(load);
          }}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Send to Accounting
          </DropdownMenuItem>
        )}

        {/* Archive Load */}
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          onArchiveLoad(load);
        }}>
          <Archive className="w-4 h-4 mr-2" />
          Archive Load
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Cancel Load */}
        <DropdownMenuItem 
          onClick={() => {
            setOpen(false);
            onCancelLoad(load);
          }}
          className="text-red-600"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Cancel Load
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}