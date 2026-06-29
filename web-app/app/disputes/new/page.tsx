import { AppShell } from "@/components/app-shell";
import { CreateDisputeForm } from "@/components/create-dispute-form";

export default function NewDisputePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Manual intake
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Create New Dispute
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Submit a synthetic dispute or scam report. LoanShield stores it
            locally, records an event, and sends the starting webhook from the
            server route.
          </p>
        </div>
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <CreateDisputeForm />
        </section>
      </div>
    </AppShell>
  );
}
