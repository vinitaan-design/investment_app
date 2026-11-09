import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "lg" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md type-label transition-colors " +
  "focus-visible:shadow-focus disabled:cursor-not-allowed select-none";

const sizes: Record<ButtonSize, string> = {
  lg: "h-13 px-6", // 52px
  md: "h-11 px-5", // 44px — minimum touch target
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-fg-on-brand hover:bg-brand-hover",
  secondary: "border border-line-brand bg-surface text-fg-brand hover:bg-brand-subtle",
  ghost: "bg-transparent text-fg-brand hover:bg-brand-subtle",
  // Soft danger per design system; always pair with a confirm step.
  danger: "bg-danger-subtle text-fg-danger hover:bg-danger-subtle/80",
};

const disabledStyle = "bg-disabled text-fg-disabled border-transparent hover:bg-disabled";

/** Class string for button-styled elements (e.g. links that look like buttons). */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "lg",
  disabled = false,
): string {
  return cn(base, sizes[size], disabled ? disabledStyle : variants[variant]);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, disables the button and announces busy state. */
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "lg",
  loading = false,
  disabled = false,
  icon,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(buttonClasses(variant, size, isDisabled), className)}
      {...rest}
    >
      {loading ? <Loader2 aria-hidden className="size-5 animate-spin" /> : icon}
      {children}
    </button>
  );
}
