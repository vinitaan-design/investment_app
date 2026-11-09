"use client";

import { Check } from "lucide-react";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> {
  /** Visible label. Can include links (e.g. to the privacy policy). */
  label: ReactNode;
  helper?: ReactNode;
  /** Say what to do next, e.g. "Accept the terms to continue." */
  error?: string;
}

export function Checkbox({ label, helper, error, disabled, className, ...rest }: CheckboxProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? helper;

  return (
    <div className={cn("space-y-1", className)}>
      {/* The whole row is the hit area: at least 44px tall. */}
      <label
        htmlFor={id}
        className={cn(
          "flex min-h-11 items-start gap-3 py-2",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <span className="relative mt-0.5 inline-flex size-5 shrink-0">
          <input
            id={id}
            type="checkbox"
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={message ? messageId : undefined}
            className={cn(
              "peer size-5 appearance-none rounded-sm border-2 bg-surface transition-colors",
              error ? "border-line-danger" : "border-line-strong",
              "checked:border-brand checked:bg-brand",
              "disabled:border-line disabled:bg-disabled",
              "focus-visible:shadow-focus",
            )}
            {...rest}
          />
          {/* Tick mark: the checked state is shown by shape, not only colour. */}
          <Check
            aria-hidden
            strokeWidth={3}
            className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-fg-on-brand peer-checked:block"
          />
        </span>
        <span className={cn("type-body", disabled ? "text-fg-disabled" : "text-fg")}>{label}</span>
      </label>
      {message && (
        <p id={messageId} className={cn("pl-8 type-body-sm", error ? "text-fg-danger" : "text-fg-secondary")}>
          {message}
        </p>
      )}
    </div>
  );
}
