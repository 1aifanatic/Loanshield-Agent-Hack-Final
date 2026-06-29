import { AppShell } from "@/components/app-shell";
import { ScenarioCard } from "@/components/scenario-card";
import { scenarios } from "@/lib/scenario-data";

export default function DemoPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            One-click scenarios
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Run Demo Scenario
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Launch a prebuilt dispute path, create the local case record, send
            the server-side UiPath webhook, and open the detail timeline.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.key} scenario={scenario} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
