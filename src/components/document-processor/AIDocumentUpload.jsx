import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Sparkles, Loader2 } from "lucide-react";

export default function AIDocumentUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('bol');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Create document record
      const documentData = {
        document_type: documentType,
        file_url,
        file_name: file.name,
        verified: false
      };
      
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
              Upload documents for automatic data extraction
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label>Select Document</Label>
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-1">
              Supported: PDF, JPG, PNG
            </p>
          </div>
          
          <div>
            <Label>Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bol">Bill of Lading</SelectItem>
                <SelectItem value="pod">Proof of Delivery</SelectItem>
                <SelectItem value="rate_confirmation">Rate Confirmation</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="lumper_receipt">Lumper Receipt</SelectItem>
                <SelectItem value="scale_ticket">Scale Ticket</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading & Processing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload & Auto-Process with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}