import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function CarrierSearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Search carriers by name, MC number, or contact..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-slate-300 focus:border-blue-500"
        />
      </div>
    </div>
  );
}