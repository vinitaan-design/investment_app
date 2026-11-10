import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { DataTable, EmptyState, StatCard, formatINR } from "@investkea/ui";
import { PageLoading } from "@/components/page-loading";
import { requireAdvisor } from "@/lib/auth/advisor";
import { loadSnapshot } from "@/lib/data/finances";
import { activeShareClientIds } from "@/lib/data/shares";
import { formatDate } from "@/lib/format";
import { uuid } from "@/lib/validation";

export const metadata: Metadata = { title: "Client — InvestKea" };

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="space-y-6">
      <Link href="/advisor/clients" className="type-label text-fg-brand underline-offset-2 hover:underline">
        ← All clients
      </Link>
      <Suspense fallback={<PageLoading label="Loading client" />}>
        <ClientDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = uuid.safeParse(rawId);
  if (!id.success) notFound();
  const { supabase, userId } = await requireAdvisor(`/advisor/clients/${rawId}`, { verified: true });

  // RLS only returns this profile if the person booked you or shares with you.
  const { data: client, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", id.data)
    .maybeSingle();
  if (error) {
    console.error("[db] loading client failed", { code: error.code });
    throw new Error("We couldn't load this client. Please refresh the page.");
  }
  if (!client) notFound();
  const name = client.full_name?.trim() || "Client";

  const sharing = (await activeShareClientIds(supabase, userId)).has(client.id);
  if (!sharing) {
    return (
      <div className="space-y-6">
        <h1 className="type-h1 text-fg">{name}</h1>
        <EmptyState
          icon={<Lock className="size-6" />}
          title={`${name} isn't sharing their data with you`}
          description="Their goals, cash flow and holdings stay private until they turn on sharing for you in their account. You can ask them during your session."
        />
      </div>
    );
  }

  const { goals, ledger, holdings } = await loadSnapshot(supabase, client.id);
  const income = ledger.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
  const spend = ledger.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
  const holdingsTotal = holdings.reduce((s, h) => s + h.current_value, 0);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="type-h1 text-fg">{name}</h1>
        <p className="type-body text-fg-secondary">
          Shared with you. View only; you can&apos;t change their data.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Holdings total"
          value={formatINR(holdingsTotal)}
          context={`${holdings.length} entries`}
        />
        <StatCard label="Income (latest 50 entries)" value={formatINR(income)} />
        <StatCard label="Spending (latest 50 entries)" value={formatINR(spend)} />
      </div>

      <DataTable
        caption="Goals"
        rows={goals}
        rowKey={(g) => g.id}
        empty={
          <EmptyState
            headingLevel={2}
            title="No goals saved"
            description={`${name} hasn't saved any goals yet.`}
          />
        }
        columns={[
          { key: "name", header: "Goal", cell: (g) => g.name, isRowHeader: true },
          { key: "year", header: "Target year", cell: (g) => g.target_year, align: "end" },
          { key: "cost", header: "Cost today", cell: (g) => formatINR(g.present_cost), align: "end" },
          { key: "saved", header: "Saved", cell: (g) => formatINR(g.current_savings), align: "end" },
          {
            key: "infl",
            header: "Inflation",
            cell: (g) => `${(g.inflation_rate * 100).toFixed(1)}%`,
            align: "end",
          },
        ]}
      />

      <DataTable
        caption="Holdings"
        rows={holdings}
        rowKey={(h) => h.id}
        empty={
          <EmptyState
            headingLevel={2}
            title="No holdings entered"
            description={`${name} hasn't added holdings yet.`}
          />
        }
        columns={[
          { key: "label", header: "Holding", cell: (h) => h.label, isRowHeader: true },
          { key: "class", header: "Asset class", cell: (h) => h.asset_class },
          { key: "value", header: "Value", cell: (h) => formatINR(h.current_value), align: "end" },
          { key: "updated", header: "Updated", cell: (h) => formatDate(h.updated_at), align: "end" },
        ]}
      />

      <DataTable
        caption="Recent cash flow"
        rows={ledger}
        rowKey={(e) => e.id}
        empty={
          <EmptyState
            headingLevel={2}
            title="No income or spending entered"
            description={`${name} hasn't added any entries yet.`}
          />
        }
        columns={[
          { key: "date", header: "Date", cell: (e) => formatDate(e.occurred_on), isRowHeader: true },
          { key: "cat", header: "Category", cell: (e) => e.category },
          { key: "kind", header: "Type", cell: (e) => (e.kind === "income" ? "Income" : "Spending") },
          { key: "amt", header: "Amount", cell: (e) => formatINR(e.amount), align: "end" },
        ]}
      />
    </div>
  );
}
