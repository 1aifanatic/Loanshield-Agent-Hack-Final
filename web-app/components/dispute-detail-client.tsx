"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  FilePlus2,
  MessageSquareWarning,
  RefreshCw,
  RotateCcw,
  Send,
  UserCheck,
} from "lucide-react";
import { ActorBadge } from "@/components/actor-badge";
import { StageStepper } from "@/components/stage-stepper";
import { StatusBadge } from "@/components/status-badge";
import { Timeline } from "@/components/timeline";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatMoney, humanize } from "@/lib/format";
import {
  caseStages,
  isCaseStageCompleteEvent,
  normalizeCaseStage,
} from "@/lib/stages";
import type { DisputeBundle } from "@/lib/store";

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}

export function DisputeDetailClient({
  initialBundle,
}: {
  initialBundle: DisputeBundle;
}) {
  const [bundle, setBundle] = useState(initialBundle);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { dispute, events, evidence, decisions } = bundle;

  const actorCounts = useMemo(
    () => ({
      agents: events.filter((event) => event.actorType === "agent").length,
      robots: events.filter((event) => event.actorType === "robot").length,
      humans: events.filter((event) => event.actorType === "human").length,
    }),
    [events],
  );

  const completedStages = useMemo(() => {
    const completed = new Set<string>();
    let legacyCloneIndex = 0;

    for (const event of [...events].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    )) {
      const isLegacyCloneEvent =
        event.stage === "Vercel Webhook Clone" ||
        event.source.includes("Vercel Clone");
      const stage = isLegacyCloneEvent
        ? caseStages[Math.min(legacyCloneIndex++, caseStages.length - 1)]
        : normalizeCaseStage(event.stage);

      if (event.eventType === "case.closed") {
        caseStages.forEach((item) => completed.add(item));
        continue;
      }

      if (
        stage &&
        (isLegacyCloneEvent ||
          isCaseStageCompleteEvent(event.eventType, event.status))
      ) {
        completed.add(stage);
      }
    }

    if (dispute.status === "closed") {
      caseStages.forEach((stage) => completed.add(stage));
    }

    return [...completed];
  }, [dispute.status, events]);

  async function refresh() {
    const response = await fetch(`/api/disputes/${dispute.externalDisputeId}`, {
      cache: "no-store",
    });
    const json = await response.json();
    if (response.ok && json.ok) {
      setBundle(json.data);
      setLastRefreshed(new Date());
    }
  }

  useEffect(() => {
    async function poll() {
      const response = await fetch(`/api/disputes/${dispute.externalDisputeId}`, {
        cache: "no-store",
      });
      const json = await response.json();
      if (response.ok && json.ok) {
        setBundle(json.data);
        setLastRefreshed(new Date());
      }
    }

    const interval = window.setInterval(() => {
      if (!document.hidden) {
        void poll();
      }
    }, Number(process.env.NEXT_PUBLIC_POLL_INTERVAL_MS ?? 3000));
    return () => window.clearInterval(interval);
  }, [dispute.externalDisputeId]);

  async function runAction(
    key: string,
    request: () => Promise<Response>,
    successText: string,
  ) {
    setBusy(key);
    setMessage(null);
    const response = await request();
    const json = await response.json();
    setBusy(null);
    if (!response.ok || !json.ok) {
      setMessage(json.error?.message ?? "Action failed");
      return;
    }
    setBundle(json.data);
    setLastRefreshed(new Date());
    setMessage(successText);
  }

  async function simulateStageUpdate() {
    const key = window.prompt("UiPath callback API key");
    if (!key) return;
    const stage = window.prompt("Stage name", "Policy Triage") ?? "Policy Triage";
    setBusy("simulate");
    setMessage(null);
    const response = await fetch("/api/uipath/case-updates", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-uipath-callback-key": key,
      },
      body: JSON.stringify({
        eventId: `evt-uipath-${crypto.randomUUID()}`,
        correlationId: crypto.randomUUID(),
        eventType: "stage.started",
        externalDisputeId: dispute.externalDisputeId,
        externalCaseKey: dispute.externalCaseKey,
        uipathCaseId: dispute.uipathCaseId ?? "CASE-DEMO-001",
        source: "UiPath Maestro Case",
        actorType: "agent",
        actorName: "Loan Policy Triage Agent",
        stage,
        status: "completed",
        severity: "info",
        title: `${stage} update received`,
        description: "Local presenter-triggered callback simulation.",
        summaryPatch: {
          currentStage: stage,
          status: "in_progress",
          riskScore: 0.22,
          evidenceScore: 0.78,
          recommendedOutcome:
            "Continue review; human approval may be required.",
        },
        payload: {
          agentOutput: {
            confidence: 0.91,
            requiresHumanApproval: stage === "Human Decision",
          },
        },
      }),
    });
    const json = await response.json();
    setBusy(null);
    if (!response.ok || !json.ok) {
      setMessage(json.error?.message ?? "Callback simulation failed");
      return;
    }
    setMessage("Stage update accepted");
    await refresh();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={dispute.status} />
              <StatusBadge value={dispute.webhookDeliveryStatus} />
              <StatusBadge value={dispute.slaStatus} />
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {dispute.externalDisputeId}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {dispute.narrative}
            </p>
          </div>
          <div className="grid min-w-full gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2 lg:min-w-[420px]">
            <Metric label="Customer" value={dispute.customerName} />
            <Metric label="UiPath case" value={dispute.uipathCaseId ?? "Pending"} />
            <Metric label="Loan type" value={humanize(dispute.loanType)} />
            <Metric label="Amount" value={formatMoney(dispute.disputedAmount)} />
          </div>
        </div>
      </section>

      <StageStepper
        currentStage={dispute.currentStage}
        completedStages={completedStages}
        status={dispute.status}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <Timeline events={events} />
        <div className="space-y-6">
          <Panel title="Actors">
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Bot className="size-4 text-indigo-700" aria-hidden /> Agents
                </span>
                <span className="font-semibold">{actorCounts.agents}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Activity className="size-4 text-teal-700" aria-hidden /> Robots
                </span>
                <span className="font-semibold">{actorCounts.robots}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <UserCheck className="size-4 text-amber-700" aria-hidden /> Human actions
                </span>
                <span className="font-semibold">{actorCounts.humans}</span>
              </div>
            </div>
          </Panel>

          <Panel title="Evidence">
            <div className="space-y-3">
              {evidence.length === 0 ? (
                <p className="text-sm text-slate-500">No evidence metadata yet.</p>
              ) : (
                evidence.map((item) => (
                  <div
                    key={item.evidenceId}
                    className="rounded-md border border-slate-200 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">
                        {item.fileName}
                      </p>
                      <StatusBadge value={item.validationStatus} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {humanize(item.documentType)} · {item.description}
                    </p>
                  </div>
                ))
              )}
              <Button
                type="button"
                variant="secondary"
                disabled={busy === "evidence"}
                onClick={() =>
                  runAction(
                    "evidence",
                    () =>
                      fetch(
                        `/api/disputes/${dispute.externalDisputeId}/evidence`,
                        {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({
                            documentType: "bank_statement",
                            fileName: `updated_statement_${Date.now()}.pdf`,
                            description:
                              "Customer uploaded additional proof for review.",
                          }),
                        },
                      ),
                    "Evidence update sent",
                  )
                }
              >
                <FilePlus2 className="size-4" aria-hidden />
                Send evidence update
              </Button>
            </div>
          </Panel>

          <Panel title="Decision">
            {decisions.length === 0 ? (
              <p className="text-sm text-slate-500">
                No recommendation or human decision has been received.
              </p>
            ) : (
              <div className="space-y-3">
                {decisions.map((decision) => (
                  <div
                    key={decision.decisionId}
                    className="rounded-md border border-slate-200 p-3 text-sm"
                  >
                    <p className="font-semibold text-slate-950">
                      {humanize(decision.decisionType)}
                    </p>
                    <p className="mt-1 text-slate-600">
                      {decision.recommendedOutcome ?? decision.humanDecision}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {decision.approvedAmount
                        ? formatMoney(decision.approvedAmount)
                        : "No approved amount"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Integration">
            <div className="grid gap-4 text-sm">
              <Metric label="Webhook delivery" value={<StatusBadge value={dispute.webhookDeliveryStatus} />} />
              <Metric label="Webhook status code" value={dispute.webhookStatusCode ?? "None"} />
              <Metric label="Last callback" value={formatDateTime(dispute.lastCallbackAt)} />
              {dispute.webhookError ? (
                <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">
                  {dispute.webhookError}
                </p>
              ) : null}
            </div>
          </Panel>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Demo controls</h2>
            <p className="text-sm text-slate-500">
              Last refreshed {formatDateTime(lastRefreshed.toISOString())}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={refresh}>
              <RefreshCw className="size-4" aria-hidden />
              Refresh
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy === "withdrawal"}
              onClick={() =>
                runAction(
                  "withdrawal",
                  () =>
                    fetch(
                      `/api/disputes/${dispute.externalDisputeId}/customer-event`,
                      {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({
                          eventType: "customer.withdrawal.requested",
                          message: "Customer asked to withdraw the dispute.",
                        }),
                      },
                    ),
                  "Withdrawal event sent",
                )
              }
            >
              <MessageSquareWarning className="size-4" aria-hidden />
              Withdrawal
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy === "appeal"}
              onClick={() =>
                runAction(
                  "appeal",
                  () =>
                    fetch(
                      `/api/disputes/${dispute.externalDisputeId}/customer-event`,
                      {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({
                          eventType: "appeal.submitted",
                          message:
                            "Customer says the prior decision did not consider updated evidence.",
                        }),
                      },
                    ),
                  "Appeal event sent",
                )
              }
            >
              <RotateCcw className="size-4" aria-hidden />
              Appeal
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy === "simulate"}
              onClick={simulateStageUpdate}
            >
              <Send className="size-4" aria-hidden />
              Simulate callback
            </Button>
          </div>
        </div>
        {message ? (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-teal-50 p-3 text-sm font-medium text-teal-800">
            <CheckCircle2 className="size-4" aria-hidden />
            {message}
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          <ActorBadge actor="portal" />
          <span>{dispute.externalCaseKey}</span>
          <span>Current stage: {dispute.currentStage}</span>
        </div>
      </section>
    </div>
  );
}
