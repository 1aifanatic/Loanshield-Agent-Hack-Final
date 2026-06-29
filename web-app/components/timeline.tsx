"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { ActorBadge } from "@/components/actor-badge";
import { JsonViewer } from "@/components/json-viewer";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, humanize } from "@/lib/format";
import type { CaseEventRecord } from "@/lib/store";

export function Timeline({ events }: { events: CaseEventRecord[] }) {
  const [newestFirst, setNewestFirst] = useState(true);
  const ordered = useMemo(
    () =>
      [...events].sort((a, b) =>
        newestFirst
          ? b.createdAt.localeCompare(a.createdAt)
          : a.createdAt.localeCompare(b.createdAt),
      ),
    [events, newestFirst],
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Timeline</h2>
          <p className="text-sm text-slate-500">{events.length} case events</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setNewestFirst((current) => !current)}
        >
          <ArrowDownUp className="size-4" aria-hidden />
          {newestFirst ? "Newest" : "Oldest"}
        </Button>
      </div>
      <div className="divide-y divide-slate-100">
        {ordered.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No events yet.</p>
        ) : (
          ordered.map((event) => (
            <article key={event.eventId} className="p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <ActorBadge actor={event.actorType} />
                    <StatusBadge value={event.status} />
                    <span className="text-xs font-medium text-slate-500">
                      {formatDateTime(event.createdAt)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      {event.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {event.description || humanize(event.eventType)}
                    </p>
                  </div>
                </div>
                <div className="text-left text-xs text-slate-500 lg:text-right">
                  <p>{humanize(event.eventType)}</p>
                  <p>{event.stage ?? "No stage"}</p>
                </div>
              </div>
              <JsonViewer value={event.payload} />
            </article>
          ))
        )}
      </div>
    </section>
  );
}
