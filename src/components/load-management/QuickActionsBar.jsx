import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Download, RefreshCw } from "lucide-react";

export default function QuickActionsBar({ 
  onCreateLoad, 
  searchTerm, 
  onSearchChange, 
  onToggleFilters,
  onRefresh,
  showFilters 
}) {
  return (
    <div className="sticky top-0 z-30 bg-white shadow-md rounded-xl p-4 border border-slate-200">
      <div className="flex flex-col md:flex-row gap-3">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Search loads by ID, customer, lane, or commodity..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-slate-300 focus:border-indigo-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onToggleFilters}
            className={`${showFilters ? 'bg-indigo-50 border-indigo-300' : ''}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <Button
            variant="outline"
            onClick={onRefresh}
            className="border-slate-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button
            variant="outline"
            className="border-slate-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button
            onClick={onCreateLoad}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Load
          </Button>
        </div>
      </div>
    </div>
  );
}