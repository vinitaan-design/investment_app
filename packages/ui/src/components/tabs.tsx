"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../lib/cn";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** Accessible name for the tab list, e.g. "Spending period". */
  label: string;
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
}

/**
 * WAI-ARIA tabs with automatic activation: arrow keys move and select,
 * Home/End jump to the ends, disabled tabs are skipped.
 */
export function Tabs({ label, items, value, defaultValue, onChange, className }: TabsProps) {
  const baseId = useId();
  const firstEnabled = items.find((t) => !t.disabled)?.id;
  const [internal, setInternal] = useState(defaultValue ?? firstEnabled);
  const active = value ?? internal;
  const refs = useRef(new Map<string, HTMLButtonElement>());

  const select = (id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  const enabled = items.filter((t) => !t.disabled);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = enabled.findIndex((t) => t.id === active);
    if (index === -1 || enabled.length === 0) return;
    let next: number | undefined;
    if (event.key === "ArrowRight") next = (index + 1) % enabled.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + enabled.length) % enabled.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = enabled.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    const target = enabled[next];
    select(target.id);
    refs.current.get(target.id)?.focus();
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="flex gap-1 border-b border-line">
        {items.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) refs.current.set(tab.id, el);
                else refs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => select(tab.id)}
              onKeyDown={onKeyDown}
              className={cn(
                // Selected state: underline + weight + colour, never colour alone.
                "-mb-px min-h-11 rounded-t-md border-b-2 px-4 transition-colors focus-visible:shadow-focus",
                selected
                  ? "border-brand type-label text-fg-brand"
                  : "border-transparent type-body text-fg-secondary hover:text-fg",
                tab.disabled && "cursor-not-allowed text-fg-disabled hover:text-fg-disabled",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {items.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
          className="pt-4 focus-visible:rounded-md focus-visible:shadow-focus"
        >
          {tab.id === active && tab.content}
        </div>
      ))}
    </div>
  );
}
