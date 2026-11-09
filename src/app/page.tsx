import Link from "next/link";

const features = [
  {
    title: "Plan goals in tomorrow's rupees",
    body: "See what a goal will really cost once inflation is counted, and how much to set aside each month.",
  },
  {
    title: "Know where your money goes",
    body: "Track income and expenses in one place and spot patterns without spreadsheets.",
  },
  {
    title: "Talk to a certified consultant",
    body: "Book time with a registered professional when you want a second pair of eyes.",
  },
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="max-w-2xl space-y-6 pt-6">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">
          Money planning that feels calm, not complicated.
        </h1>
        <p className="text-lg text-muted">
          Set your goals, see the real numbers, and move forward at your own pace.
        </p>
        <Link
          href="/goals"
          className="inline-block rounded-full bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-hover"
        >
          Try the goal planner
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <article key={f.title} className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-2 font-medium">{f.title}</h2>
            <p className="text-sm text-muted">{f.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
