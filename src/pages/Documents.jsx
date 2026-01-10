import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, Upload, Sparkles, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader, EmptyState, SkeletonCard, StandardTabs } from "@/components/design-system";

import DocumentCard from "../components/documents/DocumentCard";
import UploadDocumentModal from "../components/documents/UploadDocumentModal";
import DocumentStats from "../components/documents/DocumentStats";
import AutomatedDocumentProcessor from "../components/documents/AutomatedDocumentProcessor";
import DataBotProcessor from "../components/documents/DataBotProcessor";
import { logDocumentAction } from "../components/utils/documentFormatHandler.jsx";

export default function Documents() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // all, new, edited, verified
  const [documentToProcess, setDocumentToProcess] = useState(null);
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useScopedEntity('Document', { limit: 100 });
  const { data: loads, isLoading: loadsLoading } = useScopedEntity('Load', { limit: 100 });

  const createDocumentMutation = useMutation({
    mutationFn: async (documentData) => {
      const doc = await base44.entities.Document.create(documentData);
      return doc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowUploadModal(false);
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, data, logAction }) => {
      // Get current user
      const user = await base44.auth.me();
      
      // Update document
      const updated = await base44.entities.Document.update(id, data);
      
      // Log action if requested
      if (logAction) {
        await logDocumentAction({
          documentId: id,
          documentName: updated.file_name || 'Untitled',
          documentType: updated.document_type,
          actionType: logAction.type,
          actionBy: user.email,
          module: 'Documents',
          feature: logAction.feature || 'Document Management',
          notes: logAction.notes,
          loadId: updated.load_id
        });
      }
      
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentHistory'] });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id) => {
      // Get document before deleting
      const doc = documents.find(d => d.id === id);
      
      // Get current user
      const user = await base44.auth.me();
      
      // Log deletion
      if (doc) {
        await logDocumentAction({
          documentId: id,
          documentName: doc.file_name || 'Untitled',
          documentType: doc.document_type,
          actionType: 'deleted',
          actionBy: user.email,
          module: 'Documents',
          feature: 'Document Management',
          notes: 'Document deleted',
          loadId: doc.load_id
        });
      }
      
      // Delete document
      await base44.entities.Document.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentHistory'] });
    },
  });

  const handleUploadDocument = async (documentData) => {
    const doc = await createDocumentMutation.mutateAsync(documentData);
    return doc;
  };

  const handleProcessComplete = (processedData) => {
    if (documentToProcess) {
      updateDocumentMutation.mutate({
        id: documentToProcess.id,
        data: {
          extracted_data: processedData,
          verified: true
        },
        logAction: {
          type: 'processed',
          feature: 'DataBot Processing',
          notes: 'Document processed with AI data extraction'
        }
      });
      setDocumentToProcess(null);
    }
  };

  const handleVerify = (docId) => {
    updateDocumentMutation.mutate({
      id: docId,
      data: { verified: true },
      logAction: {
        type: 'verified',
        feature: 'Manual Verification',
        notes: 'Document manually verified'
      }
    });
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const typeMatch = typeFilter === 'all' || doc.document_type === typeFilter;
    const searchMatch = searchTerm === '' ||
      doc.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.load_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter (new, edited, verified)
    let statusMatch = true;
    if (statusFilter === 'new') {
      const createdDate = new Date(doc.created_date);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      statusMatch = createdDate > dayAgo;
    } else if (statusFilter === 'verified') {
      statusMatch = doc.verified === true;
    } else if (statusFilter === 'unverified') {
      statusMatch = doc.verified === false || !doc.verified;
    }
    
    return typeMatch && searchMatch && statusMatch;
  });

  const typeCounts = {
    all: documents.length,
    bol: documents.filter(d => d.document_type === 'bol').length,
    pod: documents.filter(d => d.document_type === 'pod').length,
    rate_confirmation: documents.filter(d => d.document_type === 'rate_confirmation').length,
    invoice: documents.filter(d => d.document_type === 'invoice').length,
    other: documents.filter(d => !['bol', 'pod', 'rate_confirmation', 'invoice'].includes(d.document_type)).length
  };

  const unverifiedDocs = documents.filter(d => !d.verified);
  const newDocs = documents.filter(doc => {
    const createdDate = new Date(doc.created_date);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return createdDate > dayAgo;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Documents"
        subtitle="AI-powered processing with multi-format support and audit trails"
        icon={FileText}
        primaryAction={{
          label: 'Upload',
          icon: Upload,
          onClick: () => setShowUploadModal(true)
        }}
        secondaryActions={[
          { label: 'Export', icon: Download, onClick: () => alert('Export coming soon') }
        ]}
        modeBadge={operatingMode.toUpperCase()}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <DocumentStats documents={documents} isLoading={isLoading} />

        {/* DataBot Processor */}
        {documentToProcess && (
          <DataBotProcessor
            document={documentToProcess}
            onProcessComplete={handleProcessComplete}
            onClose={() => setDocumentToProcess(null)}
          />
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search documents by name, load ID, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 focus:border-blue-500"
              />
            </div>

            {/* Status Quick Filters */}
            <div className="flex gap-2">
              <Button
                onClick={() => setStatusFilter(statusFilter === 'all' ? 'new' : 'all')}
                variant={statusFilter === 'new' ? 'default' : 'outline'}
                size="sm"
                className={statusFilter === 'new' ? 'bg-blue-600' : ''}
              >
                New ({newDocs.length})
              </Button>
              <Button
                onClick={() => setStatusFilter(statusFilter === 'all' ? 'unverified' : 'all')}
                variant={statusFilter === 'unverified' ? 'default' : 'outline'}
                size="sm"
                className={statusFilter === 'unverified' ? 'bg-amber-600' : ''}
              >
                Unverified ({unverifiedDocs.length})
              </Button>
            </div>
          </div>

          {/* Type Filter Tabs */}
          <StandardTabs
            tabs={[
              { key: 'all', label: `All (${typeCounts.all})`, icon: FileText },
              { key: 'bol', label: `BOL (${typeCounts.bol})`, icon: FileText },
              { key: 'pod', label: `POD (${typeCounts.pod})`, icon: FileText },
              { key: 'rate_confirmation', label: `Rate Con (${typeCounts.rate_confirmation})`, icon: FileText },
              { key: 'invoice', label: `Invoice (${typeCounts.invoice})`, icon: FileText },
              { key: 'other', label: `Other (${typeCounts.other})`, icon: FileText }
            ]}
            activeTab={typeFilter}
            onTabChange={setTypeFilter}
          />
          
          <Tabs value={typeFilter} onValueChange={setTypeFilter} className="hidden">
            <TabsList className="hidden"></TabsList>
          </Tabs>
        </div>

        {/* Unverified Documents Alert */}
        {unverifiedDocs.length > 0 && statusFilter === 'all' && (
          <Card className="border-0 shadow-xl bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                  <div>
                    <h3 className="font-semibold text-amber-900">
                      {unverifiedDocs.length} documents need AI processing
                    </h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Use DataBot to automatically extract and verify document data
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setStatusFilter('unverified')}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents Grid */}
        {isLoading || loadsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents found"
            description={searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Upload your first document to get started'}
            action={!searchTerm && typeFilter === 'all' && statusFilter === 'all' && {
              label: 'Upload Document',
              icon: Upload,
              onClick: () => setShowUploadModal(true)
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                loads={loads}
                onDelete={(id) => deleteDocumentMutation.mutate(id)}
                onProcess={(doc) => setDocumentToProcess(doc)}
                onVerify={handleVerify}
              />
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadDocumentModal
            loads={loads}
            onSave={handleUploadDocument}
            onClose={() => setShowUploadModal(false)}
            isLoading={createDocumentMutation.isPending}
          />
        )}

      </div>
    </div>
  );
}