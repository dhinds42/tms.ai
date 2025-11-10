
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { validateUploadFormat, logDocumentAction, SUPPORTED_FORMATS, getFormatBadgeColor } from "../utils/documentFormatHandler.jsx";

export default function UploadDocumentModal({ loads, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    load_id: '',
    document_type: 'other',
    notes: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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

  const handleSubmit = async () => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      // Get current user
      const user = await base44.auth.me();
      
      // Upload file using Core integration
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      // Create document record with file URL
      const documentData = {
        ...formData,
        file_url: uploadResult.file_url,
        file_name: file.name,
        file_size: file.size,
        verified: false,
        uploaded_by: user.email
      };

      // Save document
      const newDocument = await onSave(documentData);

      // Log upload action
      await logDocumentAction({
        documentId: newDocument?.id || 'temp_' + Date.now(),
        documentName: file.name,
        documentType: formData.document_type,
        actionType: 'uploaded',
        actionBy: user.email,
        fileFormat: validateUploadFormat(file.name).extension,
        fileSize: file.size,
        module: 'Documents',
        feature: 'Upload',
        notes: formData.notes || 'Document uploaded',
        loadId: formData.load_id
      });

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
      setUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Upload Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          
          {/* File Upload */}
          <div>
            <Label>Select File *</Label>
            <div className="mt-2">
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx,.xls,.csv"
                className="cursor-pointer"
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
                  <p className="text-sm text-emerald-800">
                    <strong>Type:</strong> {file.type || 'Unknown'}
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

              {/* Supported Formats Info */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1">✅ Supported Formats:</p>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_FORMATS.UPLOAD.map(fmt => (
                    <Badge key={fmt} className={getFormatBadgeColor(fmt)} style={{ fontSize: '10px' }}>
                      {fmt.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Document Type */}
          <div>
            <Label>Document Type *</Label>
            <Select 
              value={formData.document_type} 
              onValueChange={(value) => setFormData({...formData, document_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bol">📋 Bill of Lading (BOL)</SelectItem>
                <SelectItem value="pod">✅ Proof of Delivery (POD)</SelectItem>
                <SelectItem value="rate_confirmation">💰 Rate Confirmation</SelectItem>
                <SelectItem value="invoice">💵 Invoice</SelectItem>
                <SelectItem value="lumper_receipt">🧾 Lumper Receipt</SelectItem>
                <SelectItem value="scale_ticket">⚖️ Scale Ticket</SelectItem>
                <SelectItem value="customs">🛃 Customs Document</SelectItem>
                <SelectItem value="other">📄 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Associated Load */}
          <div>
            <Label>Associate with Load (Optional)</Label>
            <Select 
              value={formData.load_id} 
              onValueChange={(value) => setFormData({...formData, load_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a load..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>None</SelectItem>
                {loads?.slice(0, 20).map(load => (
                  <SelectItem key={load.id} value={load.id}>
                    {load.load_number || `#${load.id.slice(0, 8)}`} - {load.pickup_location?.city} → {load.dropoff_location?.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Add any relevant notes about this document..."
              rows={3}
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-sm text-indigo-900">
              💡 <strong>Tip:</strong> After uploading, you can use DataBot to automatically extract and verify data from your document.
            </p>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading || isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || !!validationError || uploading || isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            {uploading || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
