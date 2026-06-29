import { AppShell } from "@/components/app-shell";
import { ApiExplorerClient } from "@/components/api-explorer-client";
import { env } from "@/lib/env";

export default function ApiExplorerPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            UiPath integration
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            API Explorer
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Callback endpoint:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">
              {env.NEXT_PUBLIC_APP_URL}/api/uipath/case-updates
            </code>
          </p>
        </div>
        <ApiExplorerClient appUrl={env.NEXT_PUBLIC_APP_URL} />
      </div>
    </AppShell>
  );
}
