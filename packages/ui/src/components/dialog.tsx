"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "../lib/cn";

export interface DialogProps {
  open: boolean;
  /** Called on Esc, the close button, or a backdrop click. */
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Buttons, e.g. Cancel + Confirm. Put the primary action last. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Modal built on the native <dialog>: the browser makes the rest of the page inert
 * (focus stays inside) and Esc fires "cancel". Focus returns to the element that
 * opened it.
 */
export function Dialog({ open, onClose, title, description, children, actions, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    } else if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      returnFocusTo.current?.focus();
      returnFocusTo.current = null;
    }
  }, [open]);

  // Close if unmounted while open, and restore focus.
  useEffect(() => {
    return () => {
      returnFocusTo.current?.focus();
    };
  }, []);

  return (
    // Backdrop click is a mouse shortcut; the keyboard equivalent is Esc (onCancel) and the Close button.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        // Keep React state as the source of truth instead of letting the browser close it.
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2.5rem)] max-w-md rounded-xl bg-surface-raised p-0 text-fg shadow-3",
        "backdrop:bg-[rgb(22_21_19/0.4)]",
        className,
      )}
    >
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="type-h3">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-2 inline-flex size-11 items-center justify-center rounded-md text-fg-secondary hover:bg-subtle focus-visible:shadow-focus"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        {description && (
          <p id={descId} className="type-body text-fg-secondary">
            {description}
          </p>
        )}
        {children}
        {actions && (
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">{actions}</div>
        )}
      </div>
    </dialog>
  );
}
