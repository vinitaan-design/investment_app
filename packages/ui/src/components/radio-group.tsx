"use client";

import { useId, useState } from "react";
import { cn } from "../lib/cn";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Question or group label, rendered as the fieldset legend. */
  legend: string;
  options: RadioOption[];
  /** Controlled value. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Native radios inside fieldset/legend. Browsers provide arrow-key navigation and
 * a single tab stop for the group.
 */
export function RadioGroup({
  legend,
  options,
  value,
  defaultValue,
  onChange,
  name,
  error,
  disabled,
  className,
}: RadioGroupProps) {
  const autoName = useId();
  const groupName = name ?? autoName;
  const errorId = `${groupName}-error`;
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;

  const select = (next: string) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <fieldset
      disabled={disabled}
      aria-describedby={error ? errorId : undefined}
      aria-invalid={error ? true : undefined}
      className={cn("space-y-1", className)}
    >
      <legend className="mb-2 type-body-strong text-fg">{legend}</legend>
      {options.map((option) => {
        const id = `${groupName}-${option.value}`;
        const isDisabled = disabled || option.disabled;
        return (
          <div key={option.value}>
            {/* Label wraps radio + text only, so the description stays out of the accessible name. */}
            <label
              htmlFor={id}
              className={cn(
                "flex min-h-11 items-center gap-3 py-2",
                isDisabled ? "cursor-not-allowed" : "cursor-pointer",
              )}
            >
              <span className="relative inline-flex size-5 shrink-0">
                <input
                  id={id}
                  type="radio"
                  name={groupName}
                  value={option.value}
                  checked={selected === option.value}
                  disabled={option.disabled}
                  onChange={() => select(option.value)}
                  aria-describedby={option.description ? `${id}-desc` : undefined}
                  className={cn(
                    "peer size-5 appearance-none rounded-full border-2 bg-surface transition-colors",
                    error ? "border-line-danger" : "border-line-strong",
                    "checked:border-brand disabled:border-line disabled:bg-disabled",
                    "focus-visible:shadow-focus",
                  )}
                />
                {/* Inner dot: selection shown by shape, not only colour. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 m-auto hidden size-2.5 rounded-full bg-brand peer-checked:block"
                />
              </span>
              <span className={cn("type-body", isDisabled ? "text-fg-disabled" : "text-fg")}>
                {option.label}
              </span>
            </label>
            {option.description && (
              <p id={`${id}-desc`} className="-mt-2 pb-2 pl-8 type-body-sm text-fg-secondary">
                {option.description}
              </p>
            )}
          </div>
        );
      })}
      {error && (
        <p id={errorId} className="type-body-sm text-fg-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
