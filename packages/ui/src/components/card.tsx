import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type CardElevation = "flat" | "resting" | "raised";

const elevations: Record<CardElevation, string> = {
  flat: "",
  resting: "shadow-1",
  raised: "shadow-2",
};

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Render as a semantic element. Use "article" for self-contained items. */
  as?: "div" | "article" | "section";
  elevation?: CardElevation;
  /** Padding: 16px (compact) or 24px (default), per the 16–24px card rule. */
  padding?: "compact" | "default";
}

/** Surface container. Cards are not controls, so the border is decorative. */
export function Card({
  as: Element = "div",
  elevation = "resting",
  padding = "default",
  className,
  ...rest
}: CardProps) {
  return (
    <Element
      className={cn(
        "rounded-lg border border-line bg-surface",
        padding === "compact" ? "p-4" : "p-6",
        elevations[elevation],
        className,
      )}
      {...rest}
    />
  );
}
