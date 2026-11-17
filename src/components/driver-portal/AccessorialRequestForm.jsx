import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AccessorialRequestForm({ loadId, stopId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    accessorial_type: 'detention',
    claimed_amount_cents: '',
    description: '',
    occurred_at: new Date().toISOString().slice(0, 16)
  });
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const result = await base44.integrations.Core.UploadPrivateFile({ file });
          return {
            file_url: result.file_uri,
            file_name: file.name,
            uploaded_at: new Date().toISOString()
          };
        })
      );
      setAttachments([...attachments, ...uploads]);
    } catch (error) {
      alert('File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      load_id: loadId,
      stop_id: stopId,
      claimed_amount_cents: parseFloat(formData.claimed_amount_cents) * 100,
      evidence_attachments: attachments
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-indigo-600" />
          Request Accessorial Pay
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type *</Label>
            <Select
              value={formData.accessorial_type}
              onValueChange={(value) => setFormData({ ...formData, accessorial_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detention">Detention</SelectItem>
                <SelectItem value="detention_pickup">Detention - Pickup</SelectItem>
                <SelectItem value="detention_delivery">Detention - Delivery</SelectItem>
                <SelectItem value="tonu">TONU (Truck Ordered Not Used)</SelectItem>
                <SelectItem value="layover">Layover</SelectItem>
                <SelectItem value="lumper">Lumper Fee</SelectItem>
                <SelectItem value="stopoff">Stop-Off Charge</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Amount Claimed ($) *</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.claimed_amount_cents}
              onChange={(e) => setFormData({ ...formData, claimed_amount_cents: e.target.value })}
              placeholder="0.00"
              required
            />
            <p className="text-xs text-slate-500 mt-1">System will calculate eligible amount</p>
          </div>

          <div>
            <Label>When did this occur? *</Label>
            <Input
              type="datetime-local"
              value={formData.occurred_at}
              onChange={(e) => setFormData({ ...formData, occurred_at: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain what happened (e.g., 'Arrived at 2pm, waited 4 hours for dock door')"
              rows={4}
              required
            />
          </div>

          <div>
            <Label>Evidence (Photos, Receipts)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading && <span className="text-xs text-slate-500">Uploading...</span>}
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((att, idx) => (
                  <div key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    {att.file_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
              disabled={uploading}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}