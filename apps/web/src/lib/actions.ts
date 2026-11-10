/** Result shape every form Server Action returns (used with useActionState). */
export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export const idle: ActionState = { status: "idle" };

/** Friendly message for a database error; logs the technical detail server-side only. */
export function dbFailure(context: string, error: { code?: string; message?: string } | null): ActionState {
  console.error(`[db] ${context} failed`, { code: error?.code, message: error?.message });
  if (error?.code === "42501") {
    return { status: "error", message: "You don't have permission to do that." };
  }
  if (error?.code === "23505") {
    return { status: "error", message: "That already exists." };
  }
  return { status: "error", message: "Something went wrong on our side. Please try again." };
}

/** First zod issue per field, as plain messages. */
export function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
