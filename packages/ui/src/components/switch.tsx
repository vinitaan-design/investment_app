"use client";

import { useId, useState } from "react";
import { cn } from "../lib/cn";

export interface SwitchProps {
  label: string;
  description?: string;
  /** Controlled state. */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/** On/off setting that takes effect immediately (no submit button). */
export function Switch({
  label,
  description,
  checked,
  defaultChecked = false,
  onChange,
  disabled,
  className,
}: SwitchProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultChecked);
  const isOn = checked ?? internal;

  const toggle = () => {
    if (disabled) return;
    if (checked === undefined) setInternal(!isOn);
    onChange?.(!isOn);
  };

  return (
    <div className={cn("flex min-h-11 items-center justify-between gap-4 py-2", className)}>
      <div className="space-y-0.5">
        <span id={`${id}-label`} className={cn("block type-body", disabled ? "text-fg-disabled" : "text-fg")}>
          {label}
        </span>
        {description && (
          <span id={`${id}-desc`} className="block type-body-sm text-fg-secondary">
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "flex min-h-11 shrink-0 items-center gap-2 rounded-full focus-visible:shadow-focus",
          disabled && "cursor-not-allowed",
        )}
      >
        {/* Visible on/off text so state is not shown by colour alone. */}
        <span aria-hidden className="w-7 text-right type-label-sm text-fg-secondary">
          {isOn ? "On" : "Off"}
        </span>
        <span
          aria-hidden
          className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
            disabled ? "bg-disabled" : isOn ? "bg-brand" : "bg-subtle ring-1 ring-line-strong ring-inset",
          )}
        >
          <span
            className={cn(
              "absolute size-5 rounded-full shadow-1 transition-transform motion-reduce:transition-none",
              isOn ? "translate-x-6 bg-surface" : "translate-x-1",
              !isOn && (disabled ? "bg-fg-disabled" : "bg-fg-secondary"),
            )}
          />
        </span>
      </button>
    </div>
  );
}
