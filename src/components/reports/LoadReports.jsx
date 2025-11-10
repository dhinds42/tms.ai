
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format as formatDate, startOfMonth, endOfMonth } from "date-fns";
import { logDocumentAction, exportDocument } from "../utils/documentFormatHandler.jsx";
import { base44 } from "@/api/base44Client";

export default function LoadReports({ loads, isLoading, operatingMode, drivers, carriers, shippers }) {
  const [dateRange, setDateRange] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [generating, setGenerating] = useState(false);

  // Filter loads by date range
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date() };
      case 'this_week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return { start: weekStart, end: new Date() };
      case 'this_month':
        return { start: startOfMonth(new Date()), end: endOfMonth(new Date()) };
      case 'last_month':
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'custom':
        return { start: startDate ? new Date(startDate) : null, end: endDate ? new Date(endDate) : null };
      default:
        return { start: null, end: null };
    }
  };

  const { start, end } = getDateRange();

  const filteredLoads = loads.filter(load => {
    if (!load.created_date) return false;
    const loadDate = new Date(load.created_date);
    
    if (start && loadDate < start) return false;
    if (end && loadDate > end) return false;
    
    return true;
  });

  // Calculate stats
  const totalRevenue = filteredLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const totalCost = filteredLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
  const totalMargin = totalRevenue - totalCost;
  const avgMargin = filteredLoads.length > 0 ? totalMargin / filteredLoads.length : 0;
  const completedLoads = filteredLoads.filter(l => l.status === 'delivered').length;

  const handleGenerateReport = async () => {
    setGenerating(true);

    try {
      const user = await base44.auth.me();
      
      // Generate report document
      const result = await exportDocument('report', { // Changed to exportDocument
        report_type: 'load_report',
        date_range: dateRange,
        start_date: start?.toISOString(),
        end_date: end?.toISOString(),
        loads: filteredLoads,
        stats: {
          totalRevenue,
          totalCost,
          totalMargin,
          avgMargin,
          completedLoads
        },
        module: 'Reports',
        feature: 'Load Reports'
      }, exportFormat);

      if (result.success) {
        // Log generation
        await logDocumentAction({
          documentId: result.document.id,
          documentName: `Load_Report_${formatDate(new Date(), 'yyyy-MM-dd')}.${exportFormat}`,
          documentType: 'report',
          actionType: 'generated',
          actionBy: user.email,
          fileFormat: exportFormat,
          module: 'Reports',
          feature: 'Load Reports',
          notes: `Generated load report for ${dateRange} in ${exportFormat.toUpperCase()} format with ${filteredLoads.length} loads`
        });

        alert(`✅ Report generated successfully!\n\n${filteredLoads.length} loads included\nFormat: ${exportFormat.toUpperCase()}`);
        
        // In production, would download the file
        window.open(result.document.file_url, '_blank');
      } else {
        alert(`Failed to generate report: ${result.message}`);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Load Activity Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span>Excel (.xlsx)</span>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span>PDF (.pdf)</span>
                  </div>
                </SelectItem>
                <SelectItem value="docx">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Word (.docx)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">
              ${(totalRevenue / 1000).toFixed(1)}K
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Total Margin</p>
            <p className="text-2xl font-bold text-blue-600">
              ${(totalMargin / 1000).toFixed(1)}K
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Completed</p>
            <p className="text-2xl font-bold text-purple-600">{completedLoads}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Total Loads</p>
            <p className="text-2xl font-bold text-amber-600">{filteredLoads.length}</p>
          </div>
        </div>

        {/* Report Preview */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-3">Report Preview</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Period:</span>
              <span className="font-medium text-slate-900">
                {start && end ? `${formatDate(start, 'MMM d')} - ${formatDate(end, 'MMM d, yyyy')}` : 'All Time'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Loads Included:</span>
              <span className="font-medium text-slate-900">{filteredLoads.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Export Format:</span>
              <Badge className={
                exportFormat === 'xlsx' ? 'bg-green-100 text-green-800' :
                exportFormat === 'pdf' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }>
                {exportFormat.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Operating Mode:</span>
              <Badge className={operatingMode === 'carrier' ? 'bg-blue-600' : 'bg-indigo-600'}>
                {operatingMode.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateReport}
          disabled={filteredLoads.length === 0 || generating}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 text-lg"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Generate & Download {exportFormat.toUpperCase()} Report
            </>
          )}
        </Button>

        {/* Info */}
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-sm text-indigo-900">
            <strong>📊 Report Includes:</strong> Load numbers, dates, routes, customer rates, carrier pay, margins, 
            {operatingMode === 'carrier' ? ' driver assignments,' : ' carrier assignments,'} 
            {' '}status, and detailed analytics. All fields timestamped and audit-ready.
          </p>
        </div>

      </CardContent>
    </Card>
  );
}
