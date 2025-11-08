import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentStats({ documents, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalDocs = documents.length;
  const verifiedDocs = documents.filter(d => d.verified).length;
  const unverifiedDocs = totalDocs - verifiedDocs;
  const aiProcessedDocs = documents.filter(d => d.extracted_data && Object.keys(d.extracted_data).length > 0).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Documents</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{totalDocs}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Verified</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{verifiedDocs}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Needs Review</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{unverifiedDocs}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">AI Processed</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{aiProcessedDocs}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}