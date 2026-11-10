import type { Metadata } from "next";
import { Alert } from "@investkea/ui";

export const metadata: Metadata = { title: "Privacy notice — InvestKea" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <h1 className="type-h1 text-fg">Privacy notice</h1>
      <Alert tone="warning" title="Draft for the prototype">
        This summary describes how the prototype handles data. It has not yet been reviewed by a lawyer and
        will be replaced by a full notice before public launch.
      </Alert>
      <section className="space-y-2">
        <h2 className="type-h2 text-fg">What we store</h2>
        <ul className="list-disc space-y-1 pl-6 type-body text-fg">
          <li>Your name and email address, to run your account.</li>
          <li>Goals, income, expenses and holdings that you choose to enter.</li>
          <li>Session requests you make to consultants, and your messages in them.</li>
          <li>When you confirmed you are 18 or older and accepted this notice.</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="type-h2 text-fg">Who can see it</h2>
        <p className="type-body text-fg">
          Only you. A consultant sees your goals, cash flow and holdings only after you turn on sharing with
          that consultant, and loses access as soon as you turn it off.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="type-h2 text-fg">Where it is stored</h2>
        <p className="type-body text-fg">In our database hosted in Mumbai, India.</p>
      </section>
    </article>
  );
}
