
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, Upload, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import DocumentCard from "../components/documents/DocumentCard";
import UploadDocumentModal from "../components/documents/UploadDocumentModal";
import DocumentStats from "../components/documents/DocumentStats";
import DataBotProcessor from "../components/documents/DataBotProcessor";
import { logDocumentAction } from "@/utils/documentFormatHandler";

export default function Documents() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // all, new, edited, verified
  const [documentToProcess, setDocumentToProcess] = useState(null);
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 100),
    initialData: [],
  });

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Document Management
            </h1>
            <p className="text-slate-600 mt-2">
              AI-powered document processing with multi-format support and full audit trails
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`px-4 py-2 ${
              operatingMode === 'carrier' ? 'bg-blue-600' : 'bg-indigo-600'
            }`}>
              {operatingMode.toUpperCase()} MODE
            </Badge>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>

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
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all">
                All ({typeCounts.all})
              </TabsTrigger>
              <TabsTrigger value="bol">
                📋 BOL ({typeCounts.bol})
              </TabsTrigger>
              <TabsTrigger value="pod">
                ✅ POD ({typeCounts.pod})
              </TabsTrigger>
              <TabsTrigger value="rate_confirmation">
                💰 Rate Con ({typeCounts.rate_confirmation})
              </TabsTrigger>
              <TabsTrigger value="invoice">
                💵 Invoice ({typeCounts.invoice})
              </TabsTrigger>
              <TabsTrigger value="other">
                📄 Other ({typeCounts.other})
              </TabsTrigger>
            </TabsList>
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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No documents found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to get started'}
            </p>
            {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            )}
          </div>
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
