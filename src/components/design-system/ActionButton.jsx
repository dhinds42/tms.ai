import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * Standardized action button with consistent loading states
 * 
 * Variants:
 * - primary: Main action (indigo)
 * - secondary: Secondary action (outline)
 * - danger: Destructive action (red)
 * - success: Success action (green)
 */
export default function ActionButton({
  onClick,
  isLoading = false,
  disabled = false,
  variant = "primary",
  icon: Icon,
  children,
  loadingText = "Processing...",
  className = "",
  ...props
}) {
  const variantStyles = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: "border border-slate-300 hover:bg-slate-50 text-slate-700",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white"
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {children}
        </>
      )}
    </Button>
  );
}