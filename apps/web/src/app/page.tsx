import Link from "next/link";
import { GoalCard, buttonClasses } from "@investkea/ui";

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
    title: "Talk to a verified consultant",
    body: "Book time with a registered professional when you want a second pair of eyes. You choose what they see.",
  },
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 pt-4 md:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          <h1 className="type-display-lg text-fg">Money planning that feels calm, not complicated.</h1>
          <p className="type-body-lg text-fg-secondary">
            Set your goals, see the real numbers, and move forward at your own pace. You&apos;re in control,
            and you can stop anytime.
          </p>
          <Link href="/goals" className={buttonClasses("primary", "lg")}>
            Try the goal planner
          </Link>
        </div>
        <div aria-label="Example goal" role="figure">
          <GoalCard
            title="Emergency fund"
            saved={188000}
            target={300000}
            status="on-track"
            onTrackDate={new Date(2027, 5, 1)}
          />
          <p className="mt-2 type-caption text-fg-tertiary">Example only</p>
        </div>
      </section>

      <section aria-label="What you can do" className="grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <article key={f.title} className="space-y-2 rounded-lg border border-line bg-surface p-6 shadow-1">
            <h2 className="type-h4 text-fg">{f.title}</h2>
            <p className="type-body text-fg-secondary">{f.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
