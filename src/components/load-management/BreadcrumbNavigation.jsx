import React from "react";
import { ChevronRight, Home } from "lucide-react";

export default function BreadcrumbNavigation({ currentPage, parentPage }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
      <Home className="w-4 h-4" />
      <ChevronRight className="w-4 h-4" />
      <span className="hover:text-indigo-600 cursor-pointer">Dispatch</span>
      {parentPage && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-indigo-600 cursor-pointer">{parentPage}</span>
        </>
      )}
      <ChevronRight className="w-4 h-4" />
      <span className="font-semibold text-slate-900">{currentPage}</span>
    </div>
  );
}