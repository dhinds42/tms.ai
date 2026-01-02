import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/**
 * SectionCard - Consistent card sections
 * 
 * Rules:
 * - Consistent spacing/padding (p-6)
 * - Optional title/description
 * - Standard border and shadow
 */
export default function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
  noPadding = false
}) {
  return (
    <Card className={`border border-slate-200 shadow-sm ${className}`}>
      {(title || description || action) && (
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              {title && <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>}
              {description && <CardDescription className="text-sm text-slate-600 mt-1">{description}</CardDescription>}
            </div>
            {action}
          </div>
        </CardHeader>
      )}
      <CardContent className={noPadding ? "p-0" : "p-6"}>
        {children}
      </CardContent>
    </Card>
  );
}