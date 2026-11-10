import { BadgeCheck } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Avatar } from "./avatar";

export interface ConsultantCardProps {
  name: string;
  /** e.g. "SEBI RIA", "CFP". */
  credentialType: string;
  registrationNumber: string;
  languages?: string[];
  bio?: string | null;
  /** Shown when an admin has checked the registration. */
  verified?: boolean;
  /** Primary action, e.g. a "Request a session" button. */
  action?: ReactNode;
  headingLevel?: 2 | 3;
  className?: string;
}

/** Consultant summary. Credential and registration number are always visible. */
export function ConsultantCard({
  name,
  credentialType,
  registrationNumber,
  languages = [],
  bio,
  verified = false,
  action,
  headingLevel = 3,
  className,
}: ConsultantCardProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article
      className={cn("flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 shadow-1", className)}
    >
      <div className="flex items-start gap-3">
        <Avatar name={name} size="lg" decorative />
        <div className="min-w-0 space-y-1">
          <Heading className="type-h4 text-fg">{name}</Heading>
          <p className="type-body-sm text-fg-secondary">
            {credentialType} · Reg. no. <span className="tabular-nums">{registrationNumber}</span>
          </p>
          {verified && (
            <p className="inline-flex items-center gap-1 type-label-sm text-fg-success">
              <BadgeCheck aria-hidden className="size-4" />
              Registration checked by InvestKea
            </p>
          )}
        </div>
      </div>
      {bio && <p className="line-clamp-4 type-body text-fg">{bio}</p>}
      {languages.length > 0 && (
        <p className="type-body-sm text-fg-secondary">
          <span className="text-fg">Languages:</span> {languages.join(", ")}
        </p>
      )}
      {action && <div className="mt-auto pt-1">{action}</div>}
    </article>
  );
}
