"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Workflow } from "lucide-react";
import { JsonViewer } from "@/components/json-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ScenarioDefinition } from "@/lib/scenario-data";

export function ScenarioCard({ scenario }: { scenario: ScenarioDefinition }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function launch() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/demo/scenarios", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scenarioKey: scenario.key }),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok || !json.ok) {
      setError(json.error?.message ?? "Unable to launch scenario");
      return;
    }
    router.push(json.data.detailUrl);
    router.refresh();
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
            <Workflow className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              {scenario.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{scenario.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-5">
        <div className="space-y-4 text-sm text-slate-600">
          <div>
            <p className="font-semibold text-slate-950">Exception path</p>
            <p>{scenario.exceptionPath}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-950">Actors</p>
            <p>{scenario.actors.join(" -> ")}</p>
          </div>
          <JsonViewer label="View payload" value={scenario.payload} />
        </div>
        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
        <Button onClick={launch} disabled={loading}>
          <Play className="size-4" aria-hidden />
          {loading ? "Launching..." : "Launch Scenario"}
        </Button>
      </CardContent>
    </Card>
  );
}
