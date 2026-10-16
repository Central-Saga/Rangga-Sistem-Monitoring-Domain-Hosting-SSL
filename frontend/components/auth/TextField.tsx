"use client";

import { useId } from "react";

export interface TextFieldProps {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function TextField({
  label,
  type = "text",
  value,
  onChange,
  required,
  autoComplete,
  placeholder,
  error,
  className,
}: TextFieldProps) {
  const id = useId();

  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label htmlFor={id} className="block text-sm font-medium text-soft">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder ?? ""}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-xl border bg-card px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-mute focus:border-accent focus:ring-2 focus:ring-accent/30 ${
          error ? "border-danger" : "border-line"
        }`}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
