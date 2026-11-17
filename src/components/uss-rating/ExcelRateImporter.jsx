import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle } from "lucide-react";

export default function ExcelRateImporter() {
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const queryClient = useQueryClient();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload file to storage
      const { file_uri: file_url } = await base44.integrations.Core.UploadPrivateFile({ file });

      // Extract data from Excel
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            revision_number: { type: "number" },
            effective_date: { type: "string" },
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
                  rate_80m: { type: "number" }
                }
              }
            }
          }
        }
      });

      if (extracted.status === 'success') {
        // Create rate schedule
        const schedule = await base44.entities.USSRateSchedule.create({
          customer_party_id: 'us_steel',
          revision_number: extracted.output.revision_number,
          effective_date: extracted.output.effective_date,
          source_file_name: file.name,
          source_file_url: file_url,
          status: 'draft',
          total_lanes_imported: extracted.output.lanes.length
        });

        // Import lanes in bulk
        const laneData = extracted.output.lanes.map(lane => ({
          ...lane,
          rate_schedule_id: schedule.id,
          rate_basis: 'cwt'
        }));

        await base44.entities.USSLaneRate.bulkCreate(laneData);

        setImportResult({
          success: true,
          schedule_id: schedule.id,
          lanes_imported: laneData.length
        });

        queryClient.invalidateQueries({ queryKey: ['uss-rate-schedules'] });
      } else {
        throw new Error(extracted.details || 'Import failed');
      }

    } catch (error) {
      setImportResult({
        success: false,
        error: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          Excel Rate Schedule Importer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 mb-2">
            Import USS rate schedules from Excel files
          </p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Section 3: Point-to-Point Rates</li>
            <li>• Section 5: Mileage Brackets</li>
            <li>• Section 6: Chicago Zone Rates</li>
            <li>• Section 7: Rules and Accessorials</li>
          </ul>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900">
              {uploading ? 'Importing...' : 'Click to upload Excel file'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports .xlsx and .xls formats
            </p>
          </label>
        </div>

        {importResult && (
          <div className={`p-4 rounded-lg border-2 ${
            importResult.success 
              ? 'bg-emerald-50 border-emerald-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {importResult.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-bold ${
                importResult.success ? 'text-emerald-900' : 'text-red-900'
              }`}>
                {importResult.success ? 'Import Successful!' : 'Import Failed'}
              </span>
            </div>
            {importResult.success ? (
              <p className="text-sm text-emerald-700">
                Imported {importResult.lanes_imported} lanes
              </p>
            ) : (
              <p className="text-sm text-red-700">{importResult.error}</p>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}