import { openFileInNewTab } from '../api/integrations';
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Upload, Download, Eye, CheckCircle, Clock } from "lucide-react";

export default function TMSBDocuments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: driver } = useQuery({
    queryKey: ['currentDriver', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const drivers = await base44.entities.Driver.filter({ linked_user_id: user.id });
      return drivers[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: loads } = useQuery({
    queryKey: ['driverLoads', driver?.id],
    queryFn: async () => {
      if (!driver?.id) return [];
      return await base44.entities.Load.filter({ 
        driver_id: driver.id,
        synced_to_tms_b: true
      }, '-created_date', 50);
    },
    enabled: !!driver?.id,
    initialData: [],
  });

  const { data: allDocuments = [] } = useScopedEntity('Document', { limit: 200 });
  const documents = allDocuments.filter(doc => {
    if (!loads || loads.length === 0) return false;
    const loadIds = loads.map(l => l.id);
    return loadIds.includes(doc.load_id) && doc.synced_to_tms_b === true && doc.visible_to_driver === true;
  });

  const handleFileUpload = async (e, loadId, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_uri: file_url } = await base44.integrations.Core.UploadPrivateFile({ file });
      
      await base44.entities.Document.create({
        load_id: loadId,
        document_type: docType,
        file_url,
        file_name: file.name,
        uploaded_by: user?.email,
        synced_to_tms_b: true,
        visible_to_driver: true
      });

      queryClient.invalidateQueries(['driverDocuments']);
      alert('Document uploaded successfully!');
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDocTypeColor = (type) => {
    const colors = {
      bol: 'bg-blue-600',
      pod: 'bg-emerald-600',
      rate_confirmation: 'bg-purple-600',
      lumper_receipt: 'bg-amber-600',
      scale_ticket: 'bg-cyan-600'
    };
    return colors[type] || 'bg-slate-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My Documents</h1>
              <p className="text-purple-100 mt-2">Driver Document Center</p>
              {driver && <p className="text-sm mt-1">{driver.first_name} {driver.last_name}</p>}
            </div>
            <FileText className="w-16 h-16 opacity-30" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Documents</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{documents.length}</p>
                </div>
                <FileText className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">PODs Submitted</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {documents.filter(d => d.document_type === 'pod').length}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Upload</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {loads.filter(l => !documents.find(d => d.load_id === l.id && d.document_type === 'pod')).length}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Loads</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{loads.length}</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upload Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {loads.slice(0, 4).map(load => (
                <Card key={load.id} className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <p className="font-bold text-slate-900">{load.load_number}</p>
                      <p className="text-sm text-slate-600">
                        {load.pickup_location?.city} → {load.dropoff_location?.city}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" disabled={uploading}>
                        <Upload className="w-4 h-4 mr-2" />
                        <label className="cursor-pointer">
                          POD
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, load.id, 'pod')}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </label>
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" disabled={uploading}>
                        <Upload className="w-4 h-4 mr-2" />
                        <label className="cursor-pointer">
                          BOL
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, load.id, 'bol')}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </label>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Documents</CardTitle>
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredDocs.map(doc => (
                <Card key={doc.id} className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-900">{doc.file_name}</p>
                            <Badge className={getDocTypeColor(doc.document_type)}>
                              {doc.document_type?.toUpperCase()}
                            </Badge>
                            {doc.verified && <Badge className="bg-emerald-600">Verified</Badge>}
                          </div>
                          <p className="text-sm text-slate-600">
                            Uploaded: {new Date(doc.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openFileInNewTab(doc.file_url)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openFileInNewTab(doc.file_url)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredDocs.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No documents found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}