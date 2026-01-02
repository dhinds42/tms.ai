import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PrimaryButton } from "./StandardButton";

/**
 * EmptyState - Consistent empty state component
 * 
 * Rules:
 * - Icon (standard size 48px, text-slate-300)
 * - Title (text-lg, font-semibold)
 * - Description (text-sm, text-slate-600)
 * - ONE CTA button (if actionable)
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = ""
}) {
  return (
    <Card className={`border border-slate-200 ${className}`}>
      <CardContent className="p-12 text-center">
        {Icon && <Icon className="w-12 h-12 text-muted mx-auto mb-4" />}
        <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-6">{description}</p>
        )}
        {action && (
          <PrimaryButton
            onClick={action.onClick}
            icon={action.icon}
            disabled={action.disabled}
          >
            {action.label}
          </PrimaryButton>
        )}
      </CardContent>
    </Card>
  );
}