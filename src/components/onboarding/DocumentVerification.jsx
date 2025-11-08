import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText, AlertTriangle } from "lucide-react";

export default function DocumentVerification({ carrier, complianceItems, onClose, onApprove, onReject }) {
  const requiredDocs = [
    { type: 'insurance', label: 'Insurance Certificate', required: true },
    { type: 'w9', label: 'W-9 Form', required: true },
    { type: 'mc_dot', label: 'MC/DOT Authority', required: true }
  ];

  const docStatus = requiredDocs.map(doc => {
    const hasDoc = doc.type === 'insurance' ? !!carrier.coi_url :
                   doc.type === 'w9' ? !!carrier.w9_url :
                   !!(carrier.mc_number && carrier.dot_number);
    
    const compliance = complianceItems.find(c => c.compliance_type === doc.type);
    const isValid = compliance ? compliance.status === 'current' : hasDoc;

    return {
      ...doc,
      hasDoc,
      isValid,
      status: compliance?.status || 'missing'
    };
  });

  const allDocsValid = docStatus.every(doc => doc.hasDoc && doc.isValid);
  const missingDocs = docStatus.filter(doc => !doc.hasDoc || !doc.isValid);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Document Verification - {carrier.company_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Carrier Info */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Company</p>
                <p className="font-medium text-slate-900">{carrier.company_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Contact</p>
                <p className="font-medium text-slate-900">{carrier.contact_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">MC Number</p>
                <p className="font-medium text-slate-900">{carrier.mc_number}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">DOT Number</p>
                <p className="font-medium text-slate-900">{carrier.dot_number}</p>
              </div>
            </div>
          </div>

          {/* Document Checklist */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Required Documents</h3>
            <div className="space-y-3">
              {docStatus.map((doc, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${
                  doc.hasDoc && doc.isValid 
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {doc.hasDoc && doc.isValid ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{doc.label}</p>
                        {doc.required && (
                          <p className="text-xs text-slate-600">Required</p>
                        )}
                      </div>
                    </div>
                    <Badge className={
                      doc.hasDoc && doc.isValid 
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }>
                      {doc.hasDoc && doc.isValid ? 'Verified' : doc.hasDoc ? 'Expired' : 'Missing'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Status */}
          <div className={`p-4 rounded-xl border-2 ${
            allDocsValid 
              ? 'bg-emerald-50 border-emerald-300'
              : 'bg-amber-50 border-amber-300'
          }`}>
            <div className="flex items-start gap-3">
              {allDocsValid ? (
                <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5" />
              )}
              <div>
                <h4 className={`font-semibold ${
                  allDocsValid ? 'text-emerald-900' : 'text-amber-900'
                }`}>
                  {allDocsValid ? 'All Documents Verified' : 'Documents Missing or Expired'}
                </h4>
                <p className={`text-sm mt-1 ${
                  allDocsValid ? 'text-emerald-700' : 'text-amber-800'
                }`}>
                  {allDocsValid 
                    ? 'This carrier has submitted all required documents and they are current.'
                    : `${missingDocs.length} document(s) need attention before approval.`
                  }
                </p>
              </div>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={onApprove}
            disabled={!allDocsValid}
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve Carrier
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}