import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/design-system";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-slate-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Page Not Found</h2>
          <p className="text-slate-600">
            The page you're looking for doesn't exist or has been moved.
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