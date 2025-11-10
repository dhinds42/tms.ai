
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Sparkles, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { validateUploadFormat, logDocumentAction, SUPPORTED_FORMATS, getFormatBadgeColor } from "../utils/documentFormatHandler.jsx";

export default function AIDocumentUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('bol');
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate format
      const validation = validateUploadFormat(selectedFile.name);
      
      if (!validation.valid) {
        setValidationError(validation.message);
        setFile(null);
      } else {
        setValidationError(null);
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Get current user
      const user = await base44.auth.me();
      
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Create document record
      const documentData = {
        document_type: documentType,
        file_url,
        file_name: file.name,
        file_size: file.size,
        verified: false,
        uploaded_by: user.email
      };
      
      // Log upload action
      const validation = validateUploadFormat(file.name);
      await logDocumentAction({
        documentId: 'temp_' + Date.now(),
        documentName: file.name,
        documentType: documentType,
        actionType: 'uploaded',
        actionBy: user.email,
        fileFormat: validation.extension,
        fileSize: file.size,
        module: 'Document Processor',
        feature: 'AI Document Upload',
        notes: 'Document uploaded for AI processing'
      });
      
      onUploadComplete(documentData);
      
      // Reset form
      setFile(null);
      setDocumentType('bol');
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <div>
            <CardTitle className="text-xl">AI-Powered Document Upload</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Upload documents for automatic data extraction with multi-format support
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        
        {/* File Upload */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Select Document *</Label>
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv,.docx,.doc"
              className="cursor-pointer mt-2"
            />
            
            {/* File Info */}
            {file && !validationError && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-900">File Valid</span>
                </div>
                <p className="text-sm text-emerald-800">
                  <strong>Name:</strong> {file.name}
                </p>
                <p className="text-sm text-emerald-800">
                  <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            {/* Validation Error */}
            {validationError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-900">Invalid Format</span>
                </div>
                <p className="text-sm text-red-800 mt-1">{validationError}</p>
              </div>
            )}

            {/* Supported Formats */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-2">✅ Supported Formats:</p>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_FORMATS.UPLOAD.map(fmt => (
                  <Badge key={fmt} className={getFormatBadgeColor(fmt)} style={{ fontSize: '10px' }}>
                    {fmt.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <Label>Document Type *</Label>
            <Select value={documentType} onValueChange={setDocumentType} className="mt-2">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bol">📋 Bill of Lading</SelectItem>
                <SelectItem value="pod">✅ Proof of Delivery</SelectItem>
                <SelectItem value="rate_confirmation">💰 Rate Confirmation</SelectItem>
                <SelectItem value="invoice">💵 Invoice</SelectItem>
                <SelectItem value="lumper_receipt">🧾 Lumper Receipt</SelectItem>
                <SelectItem value="scale_ticket">⚖️ Scale Ticket</SelectItem>
                <SelectItem value="other">📄 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-900">
            <strong>🤖 AI Processing:</strong> After upload, this document will be automatically processed to extract:
          </p>
          <ul className="text-sm text-purple-800 mt-2 space-y-1 ml-5 list-disc">
            <li>Shipper/Consignee information</li>
            <li>Pickup/Delivery dates and locations</li>
            <li>Commodity details and weights</li>
            <li>Reference numbers (BOL, PRO, PO)</li>
            <li>Rates and charges</li>
          </ul>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || !!validationError || isUploading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 text-lg"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Uploading & Processing...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Upload & Auto-Process with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
