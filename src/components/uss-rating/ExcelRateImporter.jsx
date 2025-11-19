import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";

export default function ExcelRateImporter({ onImportComplete }) {
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState(null);
  const [revisionNumber, setRevisionNumber] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [importResult, setImportResult] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx?|csv)$/i)) {
        alert('Please select an Excel file (.xlsx, .xls, or .csv)');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file || !revisionNumber || !effectiveDate) {
      alert('Please provide file, revision number, and effective date');
      return;
    }

    setImporting(true);
    try {
      // Step 1: Upload file
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      // Step 2: Extract lane data using AI
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: uploadResult.file_url,
        json_schema: {
          type: "object",
          properties: {
            lanes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  lane_number: { type: "number" },
                  origin_city: { type: "string" },
                  origin_state: { type: "string" },
                  destination_city: { type: "string" },
                  destination_state: { type: "string" },
                  miles: { type: "number" },
                  rate_40m: { type: "number" },
                  rate_60m: { type: "number" },
                  rate_80m: { type: "number" },
                  rate_100m: { type: "number" },
                  rate_flat: { type: "number" },
                  symbol: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (extractResult.status !== 'success') {
        throw new Error(extractResult.details || 'Failed to extract rate data');
      }

      // Step 3: Create rate schedule
      const user = await base44.auth.me();
      const schedule = await base44.entities.USSRateSchedule.create({
        revision_number: parseInt(revisionNumber),
        effective_date: effectiveDate,
        last_revised_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        source_file_name: file.name,
        source_file_url: uploadResult.file_url,
        uploaded_by_user_id: user.id,
        total_lanes_imported: extractResult.output.lanes?.length || 0,
        import_summary: {
          total_lanes: extractResult.output.lanes?.length || 0,
          imported_at: new Date().toISOString()
        }
      });

      // Step 4: Bulk create lane rates
      const laneData = (extractResult.output.lanes || []).map(lane => ({
        rate_schedule_id: schedule.id,
        lane_number: lane.lane_number,
        origin_city: lane.origin_city,
        origin_state: lane.origin_state,
        destination_city: lane.destination_city,
        destination_state: lane.destination_state,
        lane_miles: lane.miles,
        rate_40m: lane.rate_40m,
        rate_60m: lane.rate_60m,
        rate_80m: lane.rate_80m,
        rate_100m: lane.rate_100m,
        rate_flat: lane.rate_flat,
        revision_symbol: lane.symbol || '',
        rate_basis: 'cwt'
      }));

      if (laneData.length > 0) {
        await base44.entities.USSLaneRate.bulkCreate(laneData);
      }

      setImportResult({
        success: true,
        schedule,
        lanesImported: laneData.length
      });

      onImportComplete?.();

    } catch (error) {
      setImportResult({
        success: false,
        error: error.message
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Import U.S. Steel Rate Schedule (Excel)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">📋 Import Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload Excel file from U.S. Steel with rate tables (Section 6)</li>
            <li>• AI will auto-extract lane rates, revision symbols, and mileage</li>
            <li>• Review extracted data before activating schedule</li>
            <li>• Previous schedule will be deactivated when new one is activated</li>
          </ul>
        </div>

        {/* Upload Form */}
        <div className="space-y-4">
          <div>
            <Label>Excel File *</Label>
            <div className="mt-2 flex items-center gap-3">
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="flex-1"
              />
              {file && <Badge className="bg-emerald-600">{file.name}</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Revision Number *</Label>
              <Input
                type="number"
                value={revisionNumber}
                onChange={(e) => setRevisionNumber(e.target.value)}
                placeholder="e.g., 315"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Effective Date *</Label>
              <Input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <Button
            onClick={handleImport}
            disabled={!file || !revisionNumber || !effectiveDate || importing}
            className="w-full bg-blue-600 py-6 text-lg"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Importing & Extracting...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Import Rate Schedule
              </>
            )}
          </Button>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className={`p-4 rounded-lg border-2 ${
            importResult.success 
              ? 'bg-emerald-50 border-emerald-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start gap-3">
              {importResult.success ? (
                <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-bold mb-2 ${
                  importResult.success ? 'text-emerald-900' : 'text-red-900'
                }`}>
                  {importResult.success ? '✅ Import Successful' : '❌ Import Failed'}
                </h3>
                {importResult.success ? (
                  <div className="text-sm text-emerald-800 space-y-1">
                    <p>• Schedule Rev {importResult.schedule.revision_number} created</p>
                    <p>• {importResult.lanesImported} lane rates imported</p>
                    <p>• Status: DRAFT (activate in Rate Schedules tab)</p>
                  </div>
                ) : (
                  <p className="text-sm text-red-800">{importResult.error}</p>
                )}
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}