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
      style={{ 
        backgroundColor: 'var(--primary-default)',
        color: 'white'
      }}
      className={`hover:opacity-90 ${className}`}
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
      style={{
        borderColor: 'var(--border-default)',
        color: 'var(--text-secondary)'
      }}
      className={`hover:bg-[var(--bg-hover)] ${className}`}
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
      style={{
        backgroundColor: 'var(--error)',
        color: 'white'
      }}
      className={`hover:opacity-90 ${className}`}
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
      style={{
        backgroundColor: 'var(--success)',
        color: 'white'
      }}
      className={`hover:opacity-90 ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
}