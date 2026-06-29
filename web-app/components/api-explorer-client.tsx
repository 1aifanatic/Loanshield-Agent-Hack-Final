"use client";

import { useState } from "react";
import { Activity, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApiExplorerClient({ appUrl }: { appUrl: string }) {
  const [externalDisputeId, setExternalDisputeId] = useState("");
  const [callbackKey, setCallbackKey] = useState("");
  const [response, setResponse] = useState<unknown>(null);

  async function health() {
    const result = await fetch("/api/health");
    setResponse(await result.json());
  }

  async function sendSampleCallback() {
    const id = externalDisputeId.trim();
    if (!id || !callbackKey) {
      setResponse({ ok: false, error: "External dispute ID and callback key required" });
      return;
    }
    const result = await fetch("/api/uipath/case-updates", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-uipath-callback-key": callbackKey,
      },
      body: JSON.stringify({
        eventId: `evt-test-${crypto.randomUUID()}`,
        correlationId: `corr-test-${crypto.randomUUID()}`,
        eventType: "stage.started",
        externalDisputeId: id,
        externalCaseKey: `LoanShieldDemoPortal:${id}`,
        source: "UiPath Maestro Case",
        actorType: "agent",
        actorName: "Intake Classification Agent",
        stage: "Policy Triage",
        status: "completed",
        title: "Policy triage started",
        description: "Case entered policy triage.",
        summaryPatch: {
          currentStage: "Policy Triage",
          status: "in_progress",
        },
        payload: {
          sample: true,
        },
      }),
    });
    setResponse(await result.json());
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-950">Callback test</h2>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              External dispute ID
            </span>
            <input
              value={externalDisputeId}
              onChange={(event) => setExternalDisputeId(event.target.value)}
              placeholder="LDS-20260628-0001"
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Callback API key
            </span>
            <input
              value={callbackKey}
              onChange={(event) => setCallbackKey(event.target.value)}
              type="password"
              placeholder="x-uipath-callback-key"
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={health}>
              <Activity className="size-4" aria-hidden />
              Health
            </Button>
            <Button type="button" onClick={sendSampleCallback}>
              <Send className="size-4" aria-hidden />
              Send sample callback
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-950">Sample curl</h2>
        <pre className="mt-4 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-5 text-slate-100">
{`curl -X POST "${appUrl}/api/uipath/case-updates" \\
  -H "content-type: application/json" \\
  -H "x-uipath-callback-key: $UIPATH_CALLBACK_API_KEY" \\
  -d '{
    "eventId": "evt-test-001",
    "correlationId": "corr-test-001",
    "eventType": "stage.started",
    "externalDisputeId": "LDS-20260628-0001",
    "externalCaseKey": "LoanShieldDemoPortal:LDS-20260628-0001",
    "source": "UiPath Maestro Case",
    "actorType": "agent",
    "actorName": "Intake Classification Agent",
    "stage": "Policy Triage",
    "status": "completed",
    "title": "Policy triage started",
    "description": "Case entered policy triage."
  }'`}
        </pre>
        <h2 className="mt-6 text-base font-semibold text-slate-950">
          Response preview
        </h2>
        <pre className="mt-4 min-h-40 overflow-auto rounded-md bg-slate-50 p-4 text-xs leading-5 text-slate-700">
          {response ? JSON.stringify(response, null, 2) : "No request sent yet."}
        </pre>
      </section>
    </div>
  );
}
