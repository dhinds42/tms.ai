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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, Upload, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { validateUploadFormat, logDocumentAction, SUPPORTED_FORMATS, getFormatBadgeColor } from "@/utils/documentFormatHandler";

export default function AddComplianceModal({ onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    entity_type: 'carrier',
    entity_id: '',
    entity_name: '',
    compliance_type: 'insurance',
    status: 'current',
    expiration_date: '',
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
    if (!formData.entity_name || !formData.entity_id) {
      alert('Please provide entity name and ID');
      return;
    }

    setUploading(true);
    try {
      // Get current user
      const user = await base44.auth.me();
      
      let document_url = '';
      
      // Upload file if provided
      if (file) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file });
        document_url = uploadResult.file_url;
        
        // Log upload
        const validation = validateUploadFormat(file.name);
        await logDocumentAction({
          documentId: 'compliance_' + Date.now(),
          documentName: file.name,
          documentType: 'compliance',
          actionType: 'uploaded',
          actionBy: user.email,
          fileFormat: validation.extension,
          fileSize: file.size,
          module: 'Compliance',
          feature: 'Compliance Document Upload',
          notes: `${formData.compliance_type} document uploaded for ${formData.entity_name}`
        });
      }
      
      // Save compliance item
      onSave({
        ...formData,
        document_url
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload compliance document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-900 to-green-900 bg-clip-text text-transparent">
            Add Compliance Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          
          {/* Entity Type */}
          <div>
            <Label>Entity Type *</Label>
            <Select 
              value={formData.entity_type} 
              onValueChange={(value) => setFormData({...formData, entity_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carrier">Carrier</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Entity Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Entity Name *</Label>
              <Input
                value={formData.entity_name}
                onChange={(e) => setFormData({...formData, entity_name: e.target.value})}
                placeholder="ABC Trucking"
              />
            </div>
            <div>
              <Label>Entity ID *</Label>
              <Input
                value={formData.entity_id}
                onChange={(e) => setFormData({...formData, entity_id: e.target.value})}
                placeholder="Entity reference ID"
              />
            </div>
          </div>

          {/* Compliance Type */}
          <div>
            <Label>Compliance Type *</Label>
            <Select 
              value={formData.compliance_type} 
              onValueChange={(value) => setFormData({...formData, compliance_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="mc_dot">MC/DOT Numbers</SelectItem>
                <SelectItem value="cdl">CDL License</SelectItem>
                <SelectItem value="medical_card">Medical Card</SelectItem>
                <SelectItem value="ifta">IFTA</SelectItem>
                <SelectItem value="drug_consortium">Drug Consortium</SelectItem>
                <SelectItem value="vehicle_inspection">Vehicle Inspection</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status and Expiration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Expiration Date</Label>
              <Input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
              />
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <Label>Upload Document (Optional)</Label>
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.docx"
              className="cursor-pointer mt-2"
            />
            
            {/* File Info */}
            {file && !validationError && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-900">File Valid</span>
                </div>
                <p className="text-xs text-emerald-800">
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
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
                <p className="text-xs text-red-800 mt-1">{validationError}</p>
              </div>
            )}

            {/* Supported Formats */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-2">✅ Supported:</p>
              <div className="flex flex-wrap gap-1">
                {['pdf', 'jpg', 'jpeg', 'png', 'xlsx', 'docx'].map(fmt => (
                  <Badge key={fmt} className={getFormatBadgeColor(fmt)} style={{ fontSize: '9px' }}>
                    {fmt.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading || uploading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || uploading || !!validationError}
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
          >
            {uploading || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Compliance Item
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}