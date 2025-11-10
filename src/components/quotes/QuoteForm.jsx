
import React, { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Save, X, FileText, FileSpreadsheet, MapPin, Package, DollarSign, Calendar, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { generateDocument, logDocumentAction } from "../utils/documentFormatHandler.jsx";

export default function QuoteForm({ quote, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    mode: 'FTL',
    pickup_location: { city: '', state: '', zip: '' },
    dropoff_location: { city: '', state: '', zip: '' },
    pickup_date: '',
    delivery_date: '',
    commodity: '',
    weight: '',
    equipment_type: 'dry_van',
    quoted_rate: '',
    estimated_cost: '',
    margin: '',
    valid_until: '',
    special_requirements: '',
    export_format: 'pdf'
  });

  const [generatingQuote, setGeneratingQuote] = useState(false);

  useEffect(() => {
    if (quote) {
      setFormData({
        ...quote,
        export_format: 'pdf'
      });
    }
  }, [quote]);

  const handleSubmit = async () => {
    setGeneratingQuote(true);

    try {
      // Get current user
      const user = await base44.auth.me();
      
      // Generate quote document
      const quoteNumber = `Q-${Date.now().toString().slice(-6)}`;
      
      const result = await generateDocument('quote', {
        quote_number: quoteNumber,
        quote_data: formData,
        module: 'Quote Management',
        feature: 'Quote Generation'
      }, formData.export_format);

      if (result.success) {
        // Log generation
        await logDocumentAction({
          documentId: result.document.id,
          documentName: `Quote_${quoteNumber}.${formData.export_format}`,
          documentType: 'quote',
          actionType: 'generated',
          actionBy: user.email,
          fileFormat: formData.export_format,
          module: 'Quote Management',
          feature: 'Quote Generation',
          notes: `Generated quote in ${formData.export_format.toUpperCase()} format`,
          quoteNumber: quoteNumber
        });

        // Save quote
        onSave({
          ...formData,
          quote_number: quoteNumber,
          quote_document_id: result.document.id
        });
      } else {
        alert(`Failed to generate quote: ${result.message}`);
        setGeneratingQuote(false);
      }
    } catch (error) {
      console.error('Quote generation error:', error);
      alert('Failed to generate quote');
      setGeneratingQuote(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-900 to-blue-900 bg-clip-text text-transparent">
            {quote ? 'Edit Quote' : 'Create Quote'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Mode Selection */}
          <div>
            <Label>Transportation Mode *</Label>
            <Select 
              value={formData.mode} 
              onValueChange={(value) => setFormData({...formData, mode: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FTL">Full Truckload (FTL)</SelectItem>
                <SelectItem value="LTL">Less Than Truckload (LTL)</SelectItem>
                <SelectItem value="Intermodal">Intermodal</SelectItem>
                <SelectItem value="Courier">Courier</SelectItem>
                <SelectItem value="Drayage">Drayage</SelectItem>
                <SelectItem value="Air">Air Freight</SelectItem>
                <SelectItem value="Ocean">Ocean Freight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h3 className="font-semibold text-emerald-900 mb-3">Pickup Location *</h3>
              <div className="space-y-3">
                <Input
                  placeholder="City"
                  value={formData.pickup_location.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickup_location: {...formData.pickup_location, city: e.target.value}
                  })}
                />
                <Input
                  placeholder="State"
                  value={formData.pickup_location.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickup_location: {...formData.pickup_location, state: e.target.value}
                  })}
                  maxLength={2}
                />
                <Input
                  placeholder="ZIP"
                  value={formData.pickup_location.zip}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickup_location: {...formData.pickup_location, zip: e.target.value}
                  })}
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Delivery Location *</h3>
              <div className="space-y-3">
                <Input
                  placeholder="City"
                  value={formData.dropoff_location.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    dropoff_location: {...formData.dropoff_location, city: e.target.value}
                  })}
                />
                <Input
                  placeholder="State"
                  value={formData.dropoff_location.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    dropoff_location: {...formData.dropoff_location, state: e.target.value}
                  })}
                  maxLength={2}
                />
                <Input
                  placeholder="ZIP"
                  value={formData.dropoff_location.zip}
                  onChange={(e) => setFormData({
                    ...formData,
                    dropoff_location: {...formData.dropoff_location, zip: e.target.value}
                  })}
                />
              </div>
            </div>
          </div>

          {/* Dates and Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Pickup Date</Label>
              <Input
                type="date"
                value={formData.pickup_date}
                onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
              />
            </div>
            <div>
              <Label>Delivery Date</Label>
              <Input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Commodity</Label>
              <Input
                value={formData.commodity}
                onChange={(e) => setFormData({...formData, commodity: e.target.value})}
                placeholder="General Freight"
              />
            </div>
            <div>
              <Label>Weight (lbs)</Label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="40000"
              />
            </div>
          </div>

          <div>
            <Label>Equipment Type</Label>
            <Select 
              value={formData.equipment_type} 
              onValueChange={(value) => setFormData({...formData, equipment_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dry_van">Dry Van</SelectItem>
                <SelectItem value="reefer">Reefer</SelectItem>
                <SelectItem value="flatbed">Flatbed</SelectItem>
                <SelectItem value="step_deck">Step Deck</SelectItem>
                <SelectItem value="lowboy">Lowboy</SelectItem>
                <SelectItem value="container">Container</SelectItem>
                <SelectItem value="box_truck">Box Truck</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Quoted Rate *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.quoted_rate}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value) || 0;
                  const cost = parseFloat(formData.estimated_cost) || 0;
                  setFormData({
                    ...formData,
                    quoted_rate: e.target.value,
                    margin: (rate - cost).toFixed(2)
                  });
                }}
                placeholder="2500.00"
              />
            </div>
            <div>
              <Label>Estimated Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.estimated_cost}
                onChange={(e) => {
                  const cost = parseFloat(e.target.value) || 0;
                  const rate = parseFloat(formData.quoted_rate) || 0;
                  setFormData({
                    ...formData,
                    estimated_cost: e.target.value,
                    margin: (rate - cost).toFixed(2)
                  });
                }}
                placeholder="2000.00"
              />
            </div>
            <div>
              <Label>Margin</Label>
              <Input
                type="number"
                value={formData.margin}
                readOnly
                className="bg-slate-50"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label>Valid Until</Label>
            <Input
              type="date"
              value={formData.valid_until}
              onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
            />
          </div>

          <div>
            <Label>Special Requirements</Label>
            <Textarea
              value={formData.special_requirements}
              onChange={(e) => setFormData({...formData, special_requirements: e.target.value})}
              rows={3}
              placeholder="Any special requirements or notes..."
            />
          </div>

          {/* Export Format Selection */}
          <div>
            <Label>Quote Document Format *</Label>
            <Select 
              value={formData.export_format} 
              onValueChange={(value) => setFormData({...formData, export_format: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span>📄 PDF - Professional Quote</span>
                  </div>
                </SelectItem>
                <SelectItem value="xlsx">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span>📊 Excel - Rate Comparison</span>
                  </div>
                </SelectItem>
                <SelectItem value="docx">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>📝 Word - Customizable Template</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-2">
              Choose the format for quote generation and customer delivery
            </p>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading || generatingQuote}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || generatingQuote || !formData.quoted_rate}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
          >
            {generatingQuote ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {generatingQuote ? 'Generating...' : (quote ? 'Update Quote' : `Create & Download ${formData.export_format.toUpperCase()}`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
