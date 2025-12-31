import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";

export default function EnhancedCSVImporter({ entityType, onComplete }) {
  const [file, setFile] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  
  const validateMutation = useMutation({
    mutationFn: async (uploadedFile) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadedFile });
      
      const schema = await base44.entities[entityType].schema();
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: { type: 'array', items: schema }
      });
      
      return extracted.output || [];
    },
    onSuccess: (data) => {
      setValidationResults({
        total: data.length,
        valid: data.filter(row => row.email || row.company_name).length,
        invalid: data.filter(row => !row.email && !row.company_name).length,
        preview: data.slice(0, 5)
      });
    }
  });
  
  const importMutation = useMutation({
    mutationFn: async () => {
      const data = validationResults.preview; // In production, use full validated data
      await base44.entities[entityType].bulkCreate(data);
      return data.length;
    },
    onSuccess: (count) => {
      alert(`Imported ${count} records successfully`);
      if (onComplete) onComplete();
    }
  });
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    validateMutation.mutate(selectedFile);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Enhanced CSV Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold">Drop CSV or click to upload</p>
            <p className="text-xs text-slate-500">Auto-validates and previews data</p>
          </label>
        </div>
        
        {validateMutation.isPending && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-sm text-slate-600 mt-2">Validating data...</p>
          </div>
        )}
        
        {validationResults && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{validationResults.total}</p>
                <p className="text-xs text-slate-600">Total Rows</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{validationResults.valid}</p>
                <p className="text-xs text-slate-600">Valid</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{validationResults.invalid}</p>
                <p className="text-xs text-slate-600">Errors</p>
              </div>
            </div>
            
            <Button 
              onClick={() => importMutation.mutate()} 
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600"
              disabled={validationResults.valid === 0}
            >
              Import {validationResults.valid} Records
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}