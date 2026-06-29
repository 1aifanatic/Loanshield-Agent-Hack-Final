import { Plus, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DisputeTable } from "@/components/dispute-table";
import { ResetDemoButton } from "@/components/reset-demo-button";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { env } from "@/lib/env";
import { listDisputes } from "@/lib/store";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const disputes = await listDisputes({ q });
  const stats = {
    total: disputes.length,
    open: disputes.filter((item) => item.status !== "closed").length,
    waiting: disputes.filter((item) => item.status.includes("waiting")).length,
    human: disputes.filter((item) => item.status.includes("human")).length,
    closed: disputes.filter((item) => item.status === "closed").length,
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Case operations
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Case Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Search synthetic loan disputes and follow UiPath orchestration status.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/disputes/new">
              <Plus className="size-4" aria-hidden />
              Create New Dispute
            </LinkButton>
            {env.ENABLE_DEV_RESET ? <ResetDemoButton /> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Total disputes", stats.total],
            ["Open cases", stats.open],
            ["Waiting for customer", stats.waiting],
            ["Human review pending", stats.human],
            ["Closed cases", stats.closed],
          ].map(([label, value]) => (
            <Card key={label}>
              <CardContent>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <form className="flex max-w-xl gap-3" action="/dashboard">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by ID, customer, type, stage, status"
              className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <button className="rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800">
            Search
          </button>
        </form>

        <DisputeTable disputes={disputes} />
      </div>
    </AppShell>
  );
}
