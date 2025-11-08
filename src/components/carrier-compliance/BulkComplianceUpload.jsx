import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet, Sparkles } from "lucide-react";

export default function BulkComplianceUpload({ carriers }) {
  const [file, setFile] = useState(null);

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="border-b border-blue-200 pb-6">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          <div>
            <CardTitle className="text-xl">Bulk Compliance Document Upload</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Upload insurance certificates, W-9s, and other documents in bulk
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0])}
            accept=".csv,.xlsx,.zip"
            className="flex-1"
          />
          <Button
            disabled={!file}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Process Bulk Upload
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Upload ZIP file with carrier documents or CSV with document URLs
        </p>
      </CardContent>
    </Card>
  );
}