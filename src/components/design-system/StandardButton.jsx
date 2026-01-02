import React from "react";
import { Button } from "@/components/ui/button";

/**
 * StandardButton - Consistent button variants
 * 
 * Labels: Create, Save, Save Draft, Submit, Approve, Reject, Export, Cancel, Delete
 */

export function PrimaryButton({ children, icon: Icon, onClick, disabled, className = "", ...props }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`bg-indigo-600 hover:bg-indigo-700 text-white ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
}

export function SecondaryButton({ children, icon: Icon, onClick, disabled, className = "", ...props }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className={`border-slate-300 text-slate-700 hover:bg-slate-50 ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
}

export function DestructiveButton({ children, icon: Icon, onClick, disabled, className = "", ...props }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`bg-red-600 hover:bg-red-700 text-white ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
}

export function SuccessButton({ children, icon: Icon, onClick, disabled, className = "", ...props }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`bg-emerald-600 hover:bg-emerald-700 text-white ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
}