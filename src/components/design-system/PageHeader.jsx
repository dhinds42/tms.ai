import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * PageHeader - Standard header component for all pages
 * 
 * Rules:
 * - Neutral background (no gradients by default)
 * - Left: Title + optional subtitle
 * - Right: ONE primary action max + optional menu
 * - Optional mode badge
 */
export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  primaryAction,
  secondaryActions = [],
  modeBadge,
  children
}) {
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', borderBottomColor: 'var(--border-default)' }} className="border-b px-6 py-4 sticky top-0 z-10 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          {Icon && (
            <div style={{ backgroundColor: 'var(--primary-bg)' }} className="p-2 rounded-lg">
              <Icon style={{ color: 'var(--primary-default)' }} className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">
              {title}
            </h1>
            {subtitle && (
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {modeBadge && (
            <Badge className="ml-2 mt-1">
              {modeBadge}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              style={{ backgroundColor: 'var(--primary-default)', color: 'white' }}
              className="hover:opacity-90"
            >
              {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
              {primaryAction.label}
            </Button>
          )}
          
          {secondaryActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {secondaryActions.map((action, idx) => (
                  <DropdownMenuItem key={idx} onClick={action.onClick}>
                    {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {children}
        </div>
      </div>
    </div>
  );
}