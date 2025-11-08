import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, Upload, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DocumentCard from "../components/documents/DocumentCard";
import UploadDocumentModal from "../components/documents/UploadDocumentModal";
import DocumentStats from "../components/documents/DocumentStats";
import DataBotProcessor from "../components/documents/DataBotProcessor";

export default function Documents() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [documentToProcess, setDocumentToProcess] = useState(null);

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
    mutationFn: (documentData) => base44.entities.Document.create(documentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowUploadModal(false);
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Document.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleUploadDocument = async (documentData) => {
    createDocumentMutation.mutate(documentData);
  };

  const handleProcessComplete = (processedData) => {
    if (documentToProcess) {
      updateDocumentMutation.mutate({
        id: documentToProcess.id,
        data: {
          extracted_data: processedData,
          verified: true
        }
      });
      setDocumentToProcess(null);
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const typeMatch = typeFilter === 'all' || doc.document_type === typeFilter;
    const searchMatch = searchTerm === '' ||
      doc.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.load_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return typeMatch && searchMatch;
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
              AI-powered document processing and intelligent organization
            </p>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
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
          </div>

          {/* Type Filter Tabs */}
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all">
                All ({typeCounts.all})
              </TabsTrigger>
              <TabsTrigger value="bol">
                BOL ({typeCounts.bol})
              </TabsTrigger>
              <TabsTrigger value="pod">
                POD ({typeCounts.pod})
              </TabsTrigger>
              <TabsTrigger value="rate_confirmation">
                Rate Con ({typeCounts.rate_confirmation})
              </TabsTrigger>
              <TabsTrigger value="invoice">
                Invoice ({typeCounts.invoice})
              </TabsTrigger>
              <TabsTrigger value="other">
                Other ({typeCounts.other})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Unverified Documents Alert */}
        {unverifiedDocs.length > 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
            <CardContent className="p-6">
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
              {searchTerm || typeFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to get started'}
            </p>
            {!searchTerm && typeFilter === 'all' && (
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
                onVerify={(id) => updateDocumentMutation.mutate({ 
                  id, 
                  data: { verified: true } 
                })}
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