import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Upload, Loader2, CheckCircle, AlertTriangle, Wrench } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { validateUploadFormat, logDocumentAction, SUPPORTED_FORMATS, getFormatBadgeColor } from "@/utils/documentFormatHandler";

export default function MaintenanceRecordUpload({ onUploadComplete }) {
  const [formData, setFormData] = useState({
    record_type: 'service',
    vehicle_id: '',
    service_date: '',
    mileage: '',
    cost: '',
    vendor: '',
    description: '',
    next_service_due: ''
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
    setUploading(true);
    try {
      const user = await base44.auth.me();
      
      let document_url = '';
      
      // Upload file if provided
      if (file) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file });
        document_url = uploadResult.file_url;
        
        // Log upload
        const validation = validateUploadFormat(file.name);
        await logDocumentAction({
          documentId: 'maintenance_' + Date.now(),
          documentName: file.name,
          documentType: 'maintenance',
          actionType: 'uploaded',
          actionBy: user.email,
          fileFormat: validation.extension,
          fileSize: file.size,
          module: 'Maintenance',
          feature: 'Maintenance Record Upload',
          notes: `${formData.record_type} record uploaded for vehicle ${formData.vehicle_id}`
        });
      }
      
      onUploadComplete({
        ...formData,
        document_url
      });
      
      // Reset form
      setFormData({
        record_type: 'service',
        vehicle_id: '',
        service_date: '',
        mileage: '',
        cost: '',
        vendor: '',
        description: '',
        next_service_due: ''
      });
      setFile(null);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload maintenance record');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <Wrench className="w-5 h-5 text-orange-600" />
          <div>
            <CardTitle className="text-xl">Upload Maintenance Record</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Upload service records, inspection reports, and receipts in multiple formats
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        
        {/* Record Type */}
        <div>
          <Label>Record Type *</Label>
          <Select 
            value={formData.record_type} 
            onValueChange={(value) => setFormData({...formData, record_type: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="service">🔧 Service Record</SelectItem>
              <SelectItem value="inspection">✅ Inspection Report</SelectItem>
              <SelectItem value="repair">🛠️ Repair Invoice</SelectItem>
              <SelectItem value="tire">🛞 Tire Service</SelectItem>
              <SelectItem value="oil_change">🛢️ Oil Change</SelectItem>
              <SelectItem value="other">📄 Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vehicle and Service Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Vehicle ID *</Label>
            <Input
              value={formData.vehicle_id}
              onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
              placeholder="Truck #, VIN, or ID"
            />
          </div>
          <div>
            <Label>Service Date *</Label>
            <Input
              type="date"
              value={formData.service_date}
              onChange={(e) => setFormData({...formData, service_date: e.target.value})}
            />
          </div>
          <div>
            <Label>Mileage</Label>
            <Input
              type="number"
              value={formData.mileage}
              onChange={(e) => setFormData({...formData, mileage: e.target.value})}
              placeholder="150000"
            />
          </div>
          <div>
            <Label>Cost</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: e.target.value})}
              placeholder="500.00"
            />
          </div>
        </div>

        {/* Vendor */}
        <div>
          <Label>Service Vendor</Label>
          <Input
            value={formData.vendor}
            onChange={(e) => setFormData({...formData, vendor: e.target.value})}
            placeholder="ABC Auto Repair"
          />
        </div>

        {/* Description */}
        <div>
          <Label>Service Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            placeholder="Oil change, tire rotation, brake inspection..."
          />
        </div>

        {/* File Upload */}
        <div>
          <Label>Upload Receipt/Report (Optional)</Label>
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
            <p className="text-xs font-semibold text-blue-900 mb-2">✅ Supported Formats:</p>
            <div className="flex flex-wrap gap-1">
              {['pdf', 'xlsx', 'docx', 'jpg', 'jpeg', 'png'].map(fmt => (
                <Badge key={fmt} className={getFormatBadgeColor(fmt)} style={{ fontSize: '9px' }}>
                  {fmt.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleSubmit}
          disabled={uploading || !!validationError || !formData.vehicle_id || !formData.service_date}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-6 text-lg"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Upload Maintenance Record
            </>
          )}
        </Button>

        {/* Info */}
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-900">
            <strong>📋 Supported Documents:</strong> Service invoices, inspection reports, repair receipts, 
            tire service records, oil change documentation - in PDF, Excel, Word, or image formats.
          </p>
        </div>

      </CardContent>
    </Card>
  );
}