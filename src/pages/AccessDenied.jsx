import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, Home, ArrowLeft } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/design-system";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-slate-900 mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600">
            You don't have permission to access this page. Contact your administrator if you believe this is an error.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <SecondaryButton icon={ArrowLeft} onClick={() => window.history.back()}>
            Go Back
          </SecondaryButton>
          <Link to={createPageUrl("Dashboard")}>
            <PrimaryButton icon={Home}>
              Go to Dashboard
            </PrimaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
}