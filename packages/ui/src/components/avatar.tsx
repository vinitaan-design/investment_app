import { cn } from "../lib/cn";

export type AvatarSize = "sm" | "md" | "lg";

const sizes: Record<AvatarSize, string> = {
  sm: "size-8 type-label-sm",
  md: "size-10 type-label",
  lg: "size-14 type-h4",
};

/** First letter of the first and last words, e.g. "Asha K. Menon" → "AM". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  /** Set true when the name is already shown next to the avatar. */
  decorative?: boolean;
  className?: string;
}

export function Avatar({ name, size = "md", decorative = false, className }: AvatarProps) {
  return (
    <span
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": name })}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-brand-subtle text-fg-brand select-none",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
