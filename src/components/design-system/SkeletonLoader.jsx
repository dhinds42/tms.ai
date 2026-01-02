import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * SkeletonLoader - Consistent loading states
 * 
 * Rules:
 * - No inline spinners for full pages
 * - Skeleton shimmer animation from globals.css
 */

export function SkeletonCard() {
  return (
    <Card className="border border-slate-200">
      <CardHeader>
        <div className="skeleton h-6 w-48 rounded"></div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="skeleton h-4 w-full rounded"></div>
        <div className="skeleton h-4 w-3/4 rounded"></div>
        <div className="skeleton h-4 w-1/2 rounded"></div>
      </CardContent>
    </Card>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <Card className="border border-slate-200">
      <CardContent className="p-6">
        <div className="space-y-3">
          {/* Header */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, idx) => (
              <div key={idx} className="skeleton h-5 rounded"></div>
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <div key={colIdx} className="skeleton h-8 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonForm({ fields = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, idx) => (
        <div key={idx} className="space-y-2">
          <div className="skeleton h-4 w-24 rounded"></div>
          <div className="skeleton h-10 w-full rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function PageLoader({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}