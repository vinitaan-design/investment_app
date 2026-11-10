import { buttonClasses } from "@investkea/ui";

/** POST form: signing out changes state, so it is never a plain link (no prefetch sign-outs). */
export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className={buttonClasses("ghost", "md")}>
        Sign out
      </button>
    </form>
  );
}
