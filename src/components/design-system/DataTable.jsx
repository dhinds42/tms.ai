import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import EmptyState from "./EmptyState";
import { SkeletonTable } from "./SkeletonLoader";

/**
 * DataTable - Consistent table wrapper
 * 
 * Rules:
 * - Filters/search header slot
 * - Empty state
 * - Loading state (skeleton)
 * - Consistent spacing
 */
export default function DataTable({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filterSlot,
  isLoading,
  isEmpty,
  emptyState,
  children,
  className = ""
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search & Filters */}
      {(onSearchChange || filterSlot) && (
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              {onSearchChange && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              {filterSlot}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && <SkeletonTable rows={5} columns={4} />}

      {/* Empty State */}
      {!isLoading && isEmpty && emptyState && (
        <EmptyState {...emptyState} />
      )}

      {/* Data */}
      {!isLoading && !isEmpty && children}
    </div>
  );
}