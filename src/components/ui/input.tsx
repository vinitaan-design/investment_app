"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "prefix"> {
  /** Always visible above the field. */
  label: string;
  /** Guidance shown under the field when there is no error. */
  helper?: ReactNode;
  /** Error message: say what happened and what to do next. Replaces helper. */
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export function Input({ label, helper, error, prefix, suffix, disabled, className, ...rest }: InputProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? helper;

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block type-body-strong text-fg">
        {label}
      </label>
      <div
        className={cn(
          "flex h-13 items-center gap-2 rounded-md border bg-surface px-4 transition-colors",
          "focus-within:shadow-focus",
          error ? "border-line-danger" : "border-line-strong focus-within:border-line-focus",
          disabled && "bg-disabled",
        )}
      >
        {prefix && (
          <span aria-hidden className="type-body text-fg-secondary">
            {prefix}
          </span>
        )}
        <input
          id={id}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            "h-full w-full min-w-0 bg-transparent type-body text-fg outline-none disabled:text-fg-disabled",
            // Focus ring is drawn on the wrapper; hide number spinners for a calmer field.
            "focus-visible:shadow-none [appearance:textfield]",
            "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          )}
          {...rest}
        />
        {suffix && (
          <span aria-hidden className="shrink-0 type-body-sm text-fg-secondary">
            {suffix}
          </span>
        )}
      </div>
      {message && (
        <p id={messageId} className={cn("type-body-sm", error ? "text-fg-danger" : "text-fg-secondary")}>
          {message}
        </p>
      )}
    </div>
  );
}
