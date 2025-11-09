
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuLabel, // Added DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Edit,
  FileText,
  Upload,
  Users,
  MapPin,
  Radio,
  MessageSquare,
  Phone,
  ClipboardList,
  Send,
  Search,
  Copy,
  DollarSign,
  Archive,
  XCircle,
  Truck,
  GitBranch,
  CheckCircle,
  Mail,
  Zap // Added Zap icon
} from "lucide-react";

// Assuming createPageUrl is a utility function available globally or imported from a common location.
// If this utility is not available, you would need to define it or import it from its source.
// For the purpose of this exercise, we'll assume it's available, possibly from '@/lib/utils'.
// If it's not from a specific file, remove this line.
import { createPageUrl } from "@/lib/utils"; 

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
  onAssignCarrier
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Load Actions</DropdownMenuLabel> {/* Changed from div to DropdownMenuLabel */}
        <DropdownMenuSeparator />
        
        {/* Request Spot Quote - NEW */}
        {load.status === 'available' && operatingMode === 'broker' && (
          <>
            <DropdownMenuItem onClick={() => {
              setOpen(false);
              // Assuming createPageUrl is defined and works as expected
              window.location.href = createPageUrl("QuoteManagement");
            }}>
              <Zap className="w-4 h-4 mr-2" />
              Request Spot Quote
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Edit Load */}
        <DropdownMenuItem onClick={() => onEditLoad(load)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Load
        </DropdownMenuItem>

        {/* View/Send Documents */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onViewDocs(load)}>
              <FileText className="w-4 h-4 mr-2" />
              View Load Documents
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRequestDocs(load)}>
              <Upload className="w-4 h-4 mr-2" />
              Request Documents from Driver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendLoadDetails(load)}>
              <Mail className="w-4 h-4 mr-2" />
              Send Load Details
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Assign/Manage */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Users className="w-4 h-4 mr-2" />
            Assign & Manage
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {operatingMode === 'carrier' && (
              <DropdownMenuItem onClick={() => onAssignDriver(load)}>
                <Truck className="w-4 h-4 mr-2" />
                Assign Driver
              </DropdownMenuItem>
            )}
            {operatingMode === 'broker' && (
              <DropdownMenuItem onClick={() => onAssignCarrier(load)}>
                <Truck className="w-4 h-4 mr-2" />
                Assign Carrier
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onManageRoles(load)}>
              <Users className="w-4 h-4 mr-2" />
              Manage Load Roles
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Tracking & Communication */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <MapPin className="w-4 h-4 mr-2" />
            Tracking & Communication
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onSendTracking(load)}>
              <MapPin className="w-4 h-4 mr-2" />
              Send Tracking Message
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEnableAutoTracking(load)}>
              <Radio className="w-4 h-4 mr-2" />
              Enable Auto-Tracking
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendTextMessage(load)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Text Message
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLogCheckCall(load)}>
              <Phone className="w-4 h-4 mr-2" />
              Log Check Call
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewLog(load)}>
              <ClipboardList className="w-4 h-4 mr-2" />
              View Load Log
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Load Board Actions */}
        {operatingMode === 'broker' && (
          <>
            <DropdownMenuItem onClick={() => onPostLoad(load)}>
              <Send className="w-4 h-4 mr-2" />
              Post to Load Boards
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSearchLoadBoards(load)}>
              <Search className="w-4 h-4 mr-2" />
              Search Load Boards for Carriers
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Other Actions */}
        <DropdownMenuItem onClick={() => onSwitchBranch(load)}>
          <GitBranch className="w-4 h-4 mr-2" />
          Switch Branch
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onCopyLoad(load)}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Load
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onSendToAccounting(load)}>
          <DollarSign className="w-4 h-4 mr-2" />
          Send to Accounting
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Status Changes */}
        <DropdownMenuItem onClick={() => onArchiveLoad(load)}>
          <Archive className="w-4 h-4 mr-2" />
          Archive Load
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => onCancelLoad(load)}
          className="text-red-600 focus:text-red-600"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Cancel Load
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
