import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Send
} from "lucide-react";
import { opendockUploadDocument } from "@/components/api/integrations/opendock";

export default function DocumentUploadBridge() {
  const [autoUploadEnabled, setAutoUploadEnabled] = useState(
    localStorage.getItem('opendock_auto_upload_docs') === 'true'
  );
  
  const queryClient = useQueryClient();

  // Fetch documents for Opendock loads
  const { data: documents } = useQuery({
    queryKey: ['opendockDocuments'],
    queryFn: async () => {
      const docs = await base44.entities.Document.list('-created_date', 100);
      const loads = await base44.entities.Load.list('-created_date', 100);
      
      // Filter documents for loads with Opendock IDs
      const opendockLoadIds = loads
        .filter(l => l.opendock_load_id)
        .map(l => l.id);
      
      return docs.filter(d => opendockLoadIds.includes(d.load_id));
    },
    initialData: []
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ document, load }) => {
      await opendockUploadDocument({
        loadId: load.opendock_load_id,
        documentUrl: document.file_url,
        documentType: document.document_type
      });
      
      // Mark as synced in TMS
      await base44.entities.Document.update(document.id, {
        ...document,
        opendock_synced: true,
        opendock_synced_date: new Date().toISOString()
      });
      
      return { document, load };
    },
    onSuccess: ({ document, load }) => {
      queryClient.invalidateQueries(['opendockDocuments']);
      console.log(`✅ Document ${document.document_type} uploaded for load ${load.load_number}`);
    },
    onError: (error, { document, load }) => {
      console.error(`❌ Failed to upload ${document.document_type} for load ${load.load_number}:`, error.message);
    }
  });

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: async () => {
      const loads = await base44.entities.Load.list('-created_date', 100);
      const pendingDocs = documents.filter(d => !d.opendock_synced);
      
      const results = await Promise.allSettled(
        pendingDocs.map(async document => {
          const load = loads.find(l => l.id === document.load_id);
          if (load && load.opendock_load_id) {
            return uploadMutation.mutateAsync({ document, load });
          }
        })
      );
      
      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      alert(`✅ Bulk upload complete!\n\nSuccess: ${successful}\nFailed: ${failed}`);
    }
  });

  const toggleAutoUpload = () => {
    const newState = !autoUploadEnabled;
    setAutoUploadEnabled(newState);
    localStorage.setItem('opendock_auto_upload_docs', newState.toString());
  };

  const pendingDocs = documents.filter(d => !d.opendock_synced);
  const syncedDocs = documents.filter(d => d.opendock_synced);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Upload Bridge
          </CardTitle>
          <Badge className={autoUploadEnabled ? 'bg-emerald-600' : 'bg-slate-400'}>
            {autoUploadEnabled ? '🟢 Auto-Upload ON' : '⚫ Auto-Upload OFF'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-slate-500 uppercase">Total Docs</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{documents.length}</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <p className="text-sm font-semibold text-slate-500 uppercase">Pending</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingDocs.length}</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
            <p className="text-sm font-semibold text-slate-500 uppercase">Synced</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{syncedDocs.length}</p>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div>
            <h4 className="font-semibold text-indigo-900">Auto-Upload Documents</h4>
            <p className="text-sm text-indigo-700">
              Automatically upload POD, BOL, and other documents to Opendock
            </p>
          </div>
          <Button
            onClick={toggleAutoUpload}
            className={autoUploadEnabled 
              ? 'bg-amber-600 hover:bg-amber-700' 
              : 'bg-emerald-600 hover:bg-emerald-700'}
          >
            {autoUploadEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>

        <Button
          onClick={() => bulkUploadMutation.mutate()}
          disabled={pendingDocs.length === 0 || bulkUploadMutation.isPending}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
        >
          <Send className="w-4 h-4 mr-2" />
          {bulkUploadMutation.isPending 
            ? 'Uploading All...' 
            : `Upload All Pending (${pendingDocs.length})`}
        </Button>

        {/* Document List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Pending Documents:</h4>
          
          {pendingDocs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>All documents are synced to Opendock</p>
            </div>
          ) : (
            pendingDocs.map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {doc.document_type?.toUpperCase()} - {doc.file_name}
                    </p>
                    <p className="text-sm text-slate-600">
                      Load ID: {doc.load_id?.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    const loads = await base44.entities.Load.list();
                    const load = loads.find(l => l.id === doc.load_id);
                    if (load) {
                      uploadMutation.mutate({ document: doc, load });
                    }
                  }}
                  disabled={uploadMutation.isPending}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload Now
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Supported Document Types</h4>
              <p className="text-sm text-blue-800">
                BOL (Bill of Lading), POD (Proof of Delivery), Rate Confirmations, Invoices, Lumper Receipts, Scale Tickets
              </p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}