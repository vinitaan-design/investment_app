import Link from "next/link";
import { buttonClasses } from "@investkea/ui";
import { getProfile, getSession, homeFor } from "@/lib/auth/session";
import { SignOutButton } from "./sign-out-button";

/** Sign-in link for visitors; "Open app" + sign out for signed-in users. */
export async function HeaderAccount() {
  const session = await getSession();
  if (!session) {
    return (
      <Link href="/login" className={buttonClasses("secondary", "md")}>
        Sign in
      </Link>
    );
  }
  const profile = await getProfile(session).catch(() => null);
  return (
    <div className="flex items-center gap-2">
      <Link href={profile ? homeFor(profile.role) : "/app"} className={buttonClasses("primary", "md")}>
        Open app
      </Link>
      <SignOutButton />
    </div>
  );
}
