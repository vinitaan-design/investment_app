import { Skeleton } from "@investkea/ui";

/** Placeholder while request-time data streams in. Announced via aria-busy on the region. */
export function PageLoading({ label }: { label: string }) {
  return (
    <section aria-busy="true" aria-label={label} className="space-y-6">
      <Skeleton lines={2} className="max-w-md" />
      <Skeleton variant="card" />
      <Skeleton variant="row" />
      <Skeleton variant="row" />
    </section>
  );
}
