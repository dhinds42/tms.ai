import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";
import AISecurityAuditor from "../components/rbac/AISecurityAuditor";

export default function SecurityAuditCenter() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const isBrokerAdmin = user?.role === 'admin';

  if (!isBrokerAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600">Only administrators can access security auditing.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            Security Audit Center
          </h1>
          <p className="text-slate-600 text-lg">
            AI-powered security monitoring and compliance auditing
          </p>
        </div>

        <AISecurityAuditor />

      </div>
    </div>
  );
}