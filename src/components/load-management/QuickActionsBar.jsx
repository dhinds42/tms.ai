import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Download, RefreshCw, Brain, MapPin, List, LayoutGrid } from "lucide-react";

export default function QuickActionsBar({ 
  onCreateLoad, 
  searchTerm, 
  onSearchChange, 
  onToggleFilters,
  onRefresh,
  showFilters,
  viewMode,
  onViewModeChange,
  onSmartMatch,
  unassignedCount
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
      <div className="flex flex-col lg:flex-row gap-3">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by load #, city, customer, or commodity..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm border-slate-200 focus:border-indigo-400 bg-slate-50"
          />
        </div>

        {/* View Toggle & Filters */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              className={`h-8 px-3 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => onViewModeChange?.('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className={`h-8 px-3 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => onViewModeChange?.('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              className={`h-8 px-3 ${viewMode === 'map' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => onViewModeChange?.('map')}
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <Button
            size="sm"
            variant="outline"
            onClick={onToggleFilters}
            className={`h-9 ${showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : ''}`}
          >
            <Filter className="w-4 h-4 mr-1.5" />
            Filters
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            className="h-9"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-9"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-2">
          {unassignedCount > 0 && (
            <Button
              size="sm"
              onClick={onSmartMatch}
              className="h-9 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Brain className="w-4 h-4 mr-1.5" />
              Smart Match
              <Badge className="ml-1.5 bg-white/20 text-white text-xs">{unassignedCount}</Badge>
            </Button>
          )}

          <Button
            size="sm"
            onClick={onCreateLoad}
            className="h-9 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Load
          </Button>
        </div>
      </div>
    </div>
  );
}