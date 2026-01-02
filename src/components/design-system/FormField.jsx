import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * FormField - Consistent form field wrapper
 * 
 * Rules:
 * - Label always on top
 * - Helper text below label (optional)
 * - Error text below input (red, consistent placement)
 * - Numeric fields show unit hints (USD, miles, lbs)
 */
export default function FormField({
  label,
  helperText,
  error,
  required = false,
  children
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">
          {label}
          {required && <span style={{ color: 'var(--error)' }} className="ml-1">*</span>}
        </Label>
        {helperText && (
          <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">{helperText}</p>
        )}
      </div>
      {children}
      {error && (
        <p style={{ color: 'var(--error)' }} className="text-xs flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// Convenience wrappers for common field types
export function TextFormField({ label, helperText, error, required, value, onChange, placeholder, type = "text", unit }) {
  return (
    <FormField label={label} helperText={helperText} error={error} required={required}>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={error ? { borderColor: 'var(--error-border)' } : {}}
          className={error ? "focus:border-[var(--error)]" : ""}
        />
        {unit && (
          <span style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-hover)' }} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded">
            {unit}
          </span>
        )}
      </div>
    </FormField>
  );
}

export function TextareaFormField({ label, helperText, error, required, value, onChange, placeholder, rows = 4 }) {
  return (
    <FormField label={label} helperText={helperText} error={error} required={required}>
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={error ? { borderColor: 'var(--error-border)' } : {}}
        className={error ? "focus:border-[var(--error)]" : ""}
      />
    </FormField>
  );
}

export function SelectFormField({ label, helperText, error, required, value, onChange, placeholder, options }) {
  return (
    <FormField label={label} helperText={helperText} error={error} required={required}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          style={error ? { borderColor: 'var(--error-border)' } : {}}
          className={error ? "focus:border-[var(--error)]" : ""}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}