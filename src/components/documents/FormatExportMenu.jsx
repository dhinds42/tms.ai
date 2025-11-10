
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { exportDocument, logDocumentAction } from "../utils/documentFormatHandler";
import { base44 } from "@/api/base44Client";

export default function FormatExportMenu({ 
  document, 
  module = "Documents", 
  feature = "Export",
  onExportComplete,
  disabled = false 
}) {
  const [exporting, setExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null);

  const handleExport = async (format) => {
    setExporting(true);
    setExportingFormat(format);

    try {
      // Get current user
      const user = await base44.auth.me();

      // Log export action
      await logDocumentAction({
        documentId: document.id,
        documentName: document.file_name || 'Untitled',
        documentType: document.document_type,
        actionType: 'exported',
        actionBy: user.email,
        fileFormat: format,
        module: module,
        feature: feature,
        notes: `Exported to ${format.toUpperCase()}`,
        loadId: document.load_id,
        invoiceNumber: document.invoice_number,
        quoteNumber: document.quote_number
      });

      // Export document
      const result = await exportDocument(document, format, { module, feature });

      if (result.success) {
        // Download the file
        window.open(result.url, '_blank');
        
        if (onExportComplete) {
          onExportComplete(result);
        }
      } else {
        alert(`Export failed: ${result.message}`);
      }

    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export document');
    } finally {
      setExporting(false);
      setExportingFormat(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={disabled || exporting}
          className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          disabled={exporting}
        >
          <FileText className="w-4 h-4 mr-2 text-red-600" />
          <span>Export as PDF</span>
          {exportingFormat === 'pdf' && (
            <Loader2 className="w-3 h-3 ml-2 animate-spin" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport('xlsx')}
          disabled={exporting}
        >
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          <span>Export as Excel</span>
          {exportingFormat === 'xlsx' && (
            <Loader2 className="w-3 h-3 ml-2 animate-spin" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport('docx')}
          disabled={exporting}
        >
          <FileText className="w-4 h-4 mr-2 text-blue-600" />
          <span>Export as Word</span>
          {exportingFormat === 'docx' && (
            <Loader2 className="w-3 h-3 ml-2 animate-spin" />
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => window.open(document.file_url, '_blank')}
          disabled={exporting}
        >
          <Download className="w-4 h-4 mr-2 text-slate-600" />
          <span>Download Original</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
