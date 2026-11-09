"use client";

import { ChevronDown } from "lucide-react";
import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "children"> {
  label: string;
  options: SelectOption[];
  /** Shown as an empty first option when nothing is selected. */
  placeholder?: string;
  helper?: ReactNode;
  error?: string;
}

/** Native select: best keyboard, screen reader and mobile support. */
export function Select({
  label,
  options,
  placeholder,
  helper,
  error,
  disabled,
  className,
  ...rest
}: SelectProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? helper;

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block type-body-strong text-fg">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            "h-13 w-full appearance-none rounded-md border bg-surface pr-11 pl-4 type-body text-fg",
            "focus-visible:shadow-focus focus-visible:outline-none",
            error ? "border-line-danger" : "border-line-strong focus-visible:border-line-focus",
            "disabled:cursor-not-allowed disabled:bg-disabled disabled:text-fg-disabled",
          )}
          {...rest}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-fg-secondary"
        />
      </div>
      {message && (
        <p id={messageId} className={cn("type-body-sm", error ? "text-fg-danger" : "text-fg-secondary")}>
          {message}
        </p>
      )}
    </div>
  );
}
