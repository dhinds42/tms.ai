import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, Upload, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function UploadDocumentModal({ loads, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    load_id: '',
    document_type: 'other',
    notes: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      // Upload file using Core integration
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      // Create document record with file URL
      onSave({
        ...formData,
        file_url: uploadResult.file_url,
        file_name: file.name,
        verified: false
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
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
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                className="cursor-pointer"
              />
              {file && (
                <p className="text-sm text-slate-600 mt-2">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
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
                <SelectItem value="bol">Bill of Lading (BOL)</SelectItem>
                <SelectItem value="pod">Proof of Delivery (POD)</SelectItem>
                <SelectItem value="rate_confirmation">Rate Confirmation</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="lumper_receipt">Lumper Receipt</SelectItem>
                <SelectItem value="scale_ticket">Scale Ticket</SelectItem>
                <SelectItem value="customs">Customs Document</SelectItem>
                <SelectItem value="other">Other</SelectItem>
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
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || uploading || isLoading}
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