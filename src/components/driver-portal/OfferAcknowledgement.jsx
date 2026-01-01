import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, AlertTriangle } from "lucide-react";

export default function OfferAcknowledgement({ offer, onAcknowledge, onDecline }) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!hasReadTerms) {
      alert('Please read and acknowledge the terms before accepting');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAcknowledge(offer);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCents = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <Card className="border-2 border-indigo-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            Load Offer - Version {offer.version_id}
          </CardTitle>
          <Badge className="bg-emerald-500">{offer.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Pay Details */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Pay Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Base Pay:</span>
              <span className="font-bold text-lg text-slate-900">{formatCents(offer.offered_pay_cents)}</span>
            </div>
            {offer.accessorials_included?.length > 0 && (
              <div className="border-t pt-2">
                <p className="text-sm text-slate-600 mb-2">Included Accessorials:</p>
                {offer.accessorials_included.map((acc, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600">{acc.name}:</span>
                    <span className="font-semibold">{formatCents(acc.amount_cents)}</span>
                  </div>
                ))}
              </div>
            )}
            {offer.estimated_miles && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Estimated Miles:</span>
                <span className="font-semibold">{offer.estimated_miles} mi</span>
              </div>
            )}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Terms & Conditions
          </h3>
          <div className="text-sm text-slate-700 max-h-48 overflow-y-auto">
            {offer.terms_text || 'Standard carrier agreement terms apply. Payment subject to completion of delivery and submission of required documentation.'}
          </div>
        </div>

        {/* Acknowledgement Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-slate-100 rounded-lg">
          <Checkbox
            id="terms"
            checked={hasReadTerms}
            onCheckedChange={setHasReadTerms}
          />
          <label
            htmlFor="terms"
            className="text-sm text-slate-700 cursor-pointer"
          >
            I have read and understand the terms and conditions of this offer. I acknowledge that payment is contingent on successful delivery and submission of all required documents.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={isSubmitting}
            className="flex-1"
          >
            Decline Offer
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!hasReadTerms || isSubmitting}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Accepting...' : 'Accept & Acknowledge'}
          </Button>
        </div>

        {offer.expires_at && (
          <p className="text-xs text-slate-500 text-center">
            Offer expires: {new Date(offer.expires_at).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}