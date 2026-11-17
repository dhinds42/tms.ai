import { openFileInNewTab } from '../../api/integrations';
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Eye } from "lucide-react";

export default function ProcessingQueue({ documents, isLoading }) {
  if (isLoading) {
    return <div className="text-center py-12">Loading documents...</div>;
  }

  if (documents.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h3>
          <p className="text-slate-600">No documents pending processing</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          Processing Queue ({documents.length})
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Documents awaiting verification
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {documents.map((doc, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-slate-900">{doc.file_name}</h4>
                    <p className="text-xs text-slate-600 capitalize">
                      {doc.document_type?.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-amber-100 text-amber-700">
                    Pending Verification
                  </Badge>
                  <Button size="sm" variant="outline" asChild>
                    <a href="#" onClick={(e) => { e.preventDefault(); openFileInNewTab(doc.file_url); }}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}