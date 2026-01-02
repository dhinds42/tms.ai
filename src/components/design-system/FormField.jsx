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
        <Label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {helperText && (
          <p className="text-xs text-slate-500 mt-1">{helperText}</p>
        )}
      </div>
      {children}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
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
          className={error ? "border-red-300 focus:border-red-500" : ""}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
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
        className={error ? "border-red-300 focus:border-red-500" : ""}
      />
    </FormField>
  );
}

export function SelectFormField({ label, helperText, error, required, value, onChange, placeholder, options }) {
  return (
    <FormField label={label} helperText={helperText} error={error} required={required}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-red-300 focus:border-red-500" : ""}>
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