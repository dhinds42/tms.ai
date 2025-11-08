import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";

export default function DocumentUploadZone({ onUpload, processing }) {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }, [onUpload]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
      <CardContent className="p-8">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all ${
            processing 
              ? 'border-purple-400 bg-purple-100' 
              : 'border-purple-300 hover:border-purple-500 hover:bg-purple-100 cursor-pointer'
          }`}
        >
          {processing ? (
            <div>
              <Loader2 className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-bold text-purple-900 mb-2">Processing Document...</h3>
              <p className="text-sm text-purple-700">
                AI is classifying and extracting data from your document
              </p>
            </div>
          ) : (
            <>
              <Upload className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-purple-900 mb-2">
                Upload Document for AI Processing
              </h3>
              <p className="text-sm text-purple-700 mb-4">
                Drag and drop or click to upload BOL, POD, Invoice, or other freight documents
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <div className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold cursor-pointer hover:shadow-lg transition-all">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Select File
                </div>
              </label>
              <p className="text-xs text-slate-600 mt-4">
                Supported: PDF, PNG, JPG • Max 10MB
              </p>
            </>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-white rounded-xl border border-purple-200 text-center">
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-900 text-sm">Auto-Classification</p>
            <p className="text-xs text-slate-600 mt-1">
              AI identifies document type automatically
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-purple-200 text-center">
            <Upload className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-900 text-sm">Data Extraction</p>
            <p className="text-xs text-slate-600 mt-1">
              Extract key fields with OCR + AI
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-purple-200 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-900 text-sm">Instant Processing</p>
            <p className="text-xs text-slate-600 mt-1">
              Results in seconds with 96% accuracy
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}