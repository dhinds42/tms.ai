import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Brain } from "lucide-react";

export default function DocumentInsights({ documents }) {
  const docTypeCounts = documents.reduce((acc, doc) => {
    acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(docTypeCounts).map(([type, count]) => ({
    name: type.replace(/_/g, ' ').toUpperCase(),
    count
  }));

  const processingAccuracy = documents.filter(d => d.verified).length / Math.max(documents.filter(d => d.extracted_data).length, 1) * 100;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="border-b border-indigo-200 pb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-indigo-600" />
          <div>
            <CardTitle className="text-xl">Document Processing Insights</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              AI accuracy: {processingAccuracy.toFixed(0)}% verified
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="count" fill="url(#docGradient)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="docGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                <stop offset="100%" stopColor="#6366f1" stopOpacity={1}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}