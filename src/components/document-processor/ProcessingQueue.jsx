import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, Loader2, Zap } from "lucide-react";
import { format } from "date-fns";

export default function ProcessingQueue({ documents, onProcess, isProcessing, processingId }) {
  if (documents.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-50 to-green-50">
        <CardContent className="p-8 text-center">
          <Zap className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="font-semibold text-emerald-900 mb-2">All Documents Processed!</h3>
          <p className="text-sm text-emerald-700">
            No documents waiting for AI processing
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Processing Queue ({documents.length})
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Documents ready for AI data extraction
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">{doc.file_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-700 text-xs capitalize">
                      {doc.document_type.replace(/_/g, ' ')}
                    </Badge>
                    {doc.created_date && (
                      <span className="text-xs text-slate-500">
                        Uploaded {format(new Date(doc.created_date), "MMM d, h:mm a")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => onProcess(doc)}
                disabled={isProcessing}
                className={`bg-gradient-to-r from-purple-600 to-indigo-600 text-white ${
                  processingId === doc.id ? 'opacity-50' : ''
                }`}
              >
                {isProcessing && processingId === doc.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Extract Data
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}