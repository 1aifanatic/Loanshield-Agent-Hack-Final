import "server-only";

import { env } from "@/lib/env";
import {
  disputeIdFromCaseKey,
  generateExternalDisputeId,
  newCorrelationId,
  newDecisionId,
  newEventId,
  newEvidenceId,
  sourceSystem,
  toExternalCaseKey,
} from "@/lib/ids";
import { getScenario } from "@/lib/scenario-data";
import {
  eventExists,
  getDisputeBundle,
  getDisputeByCaseKey,
  insertAuditLog,
  insertDecisionIfNew,
  insertDispute,
  insertEventIfNew,
  insertEvidenceIfNew,
  updateDispute,
  type CaseEventRecord,
  type DecisionRecord,
  type DisputeRecord,
  type EvidenceRecord,
} from "@/lib/store";
import {
  type CaseStage,
  inferCaseStageFromEventType,
  isCaseStageCompleteEvent,
  nextCaseStage,
  normalizeCaseStage,
} from "@/lib/stages";
import { sendUiPathWebhook, type UiPathWebhookPayload } from "@/lib/uipath-webhook";
import type {
  CreateDisputeInput,
  CustomerEventInput,
  EvidenceInput,
  ScenarioKey,
  UiPathCaseUpdateInput,
} from "@/lib/validators";

function now() {
  return new Date().toISOString();
}

function makeDispute(input: CreateDisputeInput): DisputeRecord {
  const createdAt = now();
  const externalDisputeId =
    input.externalDisputeId ?? generateExternalDisputeId();

  return {
    externalDisputeId,
    externalCaseKey: toExternalCaseKey(externalDisputeId),
    sourceSystem,
    uipathCaseId: null,
    uipathCaseUrl: null,
    status: "created",
    currentStage: "Webhook Intake",
    slaStatus: "on_track",
    priority: input.priority,
    eventType: input.eventType,
    disputeType: input.disputeType,
    loanType: input.loanType,
    loanIdMasked: input.loanIdMasked,
    transactionId: input.transactionId || null,
    customerName: input.customerName,
    customerSegment: input.customerSegment,
    vulnerableCustomerFlag: input.vulnerableCustomerFlag,
    disputedAmount: input.disputedAmount,
    currency: input.currency,
    narrative: input.narrative,
    riskScore: null,
    evidenceScore: input.evidence.length > 0 ? 0.6 : null,
    recommendedOutcome: null,
    finalOutcome: null,
    approvedAmount: null,
    webhookDeliveryStatus: "not_sent",
    webhookStatusCode: null,
    webhookError: null,
    lastCallbackAt: null,
    createdAt,
    updatedAt: createdAt,
  };
}

function makeEvidence(
  externalDisputeId: string,
  evidence: EvidenceInput,
  uploadedBy = "customer",
): EvidenceRecord {
  const createdAt = now();
  return {
    externalDisputeId,
    evidenceId: newEvidenceId(),
    documentType: evidence.documentType,
    fileName: evidence.fileName,
    fileUrl: evidence.fileUrl ?? null,
    description: evidence.description ?? null,
    uploadedBy,
    validationStatus: "pending",
    extractedFields: {},
    createdAt,
    updatedAt: createdAt,
  };
}

function makePortalEvent(
  dispute: DisputeRecord,
  eventType: string,
  title: string,
  description: string,
  correlationId: string,
  payload: Record<string, unknown> = {},
): CaseEventRecord {
  return {
    eventId: newEventId("evt-portal"),
    externalDisputeId: dispute.externalDisputeId,
    externalCaseKey: dispute.externalCaseKey,
    correlationId,
    eventType,
    source: "LoanShield Demo Portal",
    actorType: "portal",
    actorName: "Demo Presenter",
    stage: dispute.currentStage,
    taskName: null,
    status: "completed",
    title,
    description,
    severity: "info",
    payload,
    createdAt: now(),
  };
}

function makeWebhookPayload(
  dispute: DisputeRecord,
  eventId: string,
  correlationId: string,
  eventType: string,
  evidence: EvidenceRecord[],
  demo?: Record<string, unknown>,
): UiPathWebhookPayload {
  return {
    eventId,
    eventType,
    eventVersion: "1.0",
    sourceSystem,
    externalDisputeId: dispute.externalDisputeId,
    externalCaseKey: dispute.externalCaseKey,
    correlationId,
    occurredAt: now(),
    callback: {
      caseUpdatesUrl: `${env.NEXT_PUBLIC_APP_URL}/api/uipath/case-updates`,
      caseContextUrl: `${env.NEXT_PUBLIC_APP_URL}/api/uipath/case-context`,
      authScheme: "x-uipath-callback-key",
    },
    customer: {
      name: dispute.customerName,
      segment: dispute.customerSegment,
      vulnerableCustomerFlag: dispute.vulnerableCustomerFlag,
      preferredChannel: "email",
    },
    loan: {
      loanIdMasked: dispute.loanIdMasked,
      loanType: dispute.loanType,
      servicingStatus: "active",
      daysPastDue: 0,
    },
    dispute: {
      disputeType: dispute.disputeType,
      transactionId: dispute.transactionId,
      disputedAmount: dispute.disputedAmount,
      currency: dispute.currency,
      priority: dispute.priority,
      narrative: dispute.narrative,
      requestedResolution: "Review dispute and post approved customer outcome.",
    },
    evidence: evidence.map((item) => ({
      evidenceId: item.evidenceId,
      documentType: item.documentType,
      fileName: item.fileName,
      description: item.description,
      fileUrl: item.fileUrl,
    })),
    demo,
  };
}

async function deliverWebhook(
  dispute: DisputeRecord,
  payload: UiPathWebhookPayload,
) {
  const result = await sendUiPathWebhook(payload);
  await insertAuditLog({
    direction: "outbound",
    integrationName: "UiPath HTTP Webhook",
    externalDisputeId: dispute.externalDisputeId,
    eventId: payload.eventId,
    correlationId: payload.correlationId,
    requestMethod: "POST",
    requestUrl: env.UIPATH_WEBHOOK_URL ? "[configured]" : "[not configured]",
    requestHeaders: {
      "content-type": "application/json",
      "x-source-system": "LoanShieldDemoPortal",
      "x-demo-webhook-key": env.UIPATH_WEBHOOK_API_KEY ? "[redacted]" : null,
    },
    requestBody: payload,
    responseStatus: result.status,
    responseBody: { bodyText: result.bodyText?.slice(0, 2000) ?? "" },
    errorMessage: result.error,
  });

  await updateDispute(dispute.externalDisputeId, {
    status: result.ok ? "submitted_to_uipath" : "webhook_pending",
    webhookDeliveryStatus: result.ok ? "sent" : "failed",
    webhookStatusCode: result.status,
    webhookError: result.error ?? null,
  });

  return result;
}

export async function createDispute(input: CreateDisputeInput) {
  const correlationId = newCorrelationId();
  const dispute = makeDispute(input);
  const evidence = input.evidence.map((item) =>
    makeEvidence(dispute.externalDisputeId, item),
  );

  await insertDispute(dispute);
  await insertEventIfNew(
    makePortalEvent(
      dispute,
      "portal.dispute.created",
      "Dispute submitted to portal",
      "LoanShield created a local case record and prepared the UiPath webhook payload.",
      correlationId,
      { input: { ...input, evidence: input.evidence.length } },
    ),
  );
  await Promise.all(evidence.map((item) => insertEvidenceIfNew(item)));

  const outboundEventId = newEventId("evt-webhook");
  const payload = makeWebhookPayload(
    dispute,
    outboundEventId,
    correlationId,
    input.eventType,
    evidence,
    { scenarioKey: input.scenarioKey, presenterMode: true },
  );
  const webhook = await deliverWebhook(dispute, payload);
  const bundle = await getDisputeBundle(dispute.externalDisputeId);

  return {
    externalDisputeId: dispute.externalDisputeId,
    externalCaseKey: dispute.externalCaseKey,
    status: webhook.ok ? "submitted_to_uipath" : "webhook_pending",
    currentStage: dispute.currentStage,
    webhookDeliveryStatus: webhook.ok ? "sent" : "failed",
    detailUrl: `/disputes/${dispute.externalDisputeId}`,
    bundle,
  };
}

export async function launchScenario(key: ScenarioKey) {
  const scenario = getScenario(key);
  if (!scenario) {
    throw new Error(`Unknown scenario: ${key}`);
  }
  return createDispute({ ...scenario.payload, scenarioKey: scenario.key });
}

export async function addEvidence(
  externalDisputeId: string,
  input: EvidenceInput,
) {
  const bundle = await getDisputeBundle(externalDisputeId);
  if (!bundle) throw new Error("Dispute not found");

  const correlationId = newCorrelationId();
  const evidence = makeEvidence(externalDisputeId, input);
  await insertEvidenceIfNew(evidence);
  await insertEventIfNew(
    makePortalEvent(
      bundle.dispute,
      "portal.evidence.received",
      "Evidence received",
      input.description || "Customer evidence metadata was added.",
      correlationId,
      { evidenceId: evidence.evidenceId, fileName: evidence.fileName },
    ),
  );

  const payload = makeWebhookPayload(
    bundle.dispute,
    newEventId("evt-webhook"),
    correlationId,
    "evidence.received",
    [evidence],
    { action: "evidence.received" },
  );
  await deliverWebhook(bundle.dispute, payload);
  return getDisputeBundle(externalDisputeId);
}

export async function sendCustomerEvent(
  externalDisputeId: string,
  input: CustomerEventInput,
) {
  const bundle = await getDisputeBundle(externalDisputeId);
  if (!bundle) throw new Error("Dispute not found");

  const correlationId = newCorrelationId();
  await insertEventIfNew(
    makePortalEvent(
      bundle.dispute,
      `portal.${input.eventType}`,
      "Customer event sent",
      input.message,
      correlationId,
      { eventType: input.eventType, evidenceIds: input.evidenceIds },
    ),
  );
  const payload = makeWebhookPayload(
    bundle.dispute,
    newEventId("evt-webhook"),
    correlationId,
    input.eventType,
    bundle.evidence,
    {
      action: input.eventType,
      message: input.message,
      evidenceIds: input.evidenceIds,
    },
  );
  await deliverWebhook(bundle.dispute, payload);
  return getDisputeBundle(externalDisputeId);
}

type LegacyCloneProgress = {
  currentStage: CaseStage;
  eventStage: CaseStage;
  eventStatus?: string;
  eventType?: UiPathCaseUpdateInput["eventType"];
  status?: string;
};

const legacyCloneProgression: LegacyCloneProgress[] = [
  {
    currentStage: "Webhook Intake",
    eventStage: "Webhook Intake",
    eventType: "case.created",
    status: "in_progress",
    eventStatus: "completed",
  },
  {
    currentStage: "Loan Context",
    eventStage: "Loan Context",
    eventType: "stage.completed",
    status: "in_progress",
    eventStatus: "completed",
  },
  {
    currentStage: "Policy Triage",
    eventStage: "Policy Triage",
    eventType: "stage.completed",
    status: "in_progress",
    eventStatus: "completed",
  },
  {
    currentStage: "Evidence Collection",
    eventStage: "Evidence Collection",
    eventType: "stage.completed",
    status: "in_progress",
    eventStatus: "completed",
  },
  {
    currentStage: "Investigation",
    eventStage: "Investigation",
    eventType: "secondary_stage.completed",
    status: "in_progress",
    eventStatus: "completed",
  },
  {
    currentStage: "Human Decision",
    eventStage: "Human Decision",
    eventType: "decision.approved",
    status: "in_progress",
    eventStatus: "completed",
  },
  {
    currentStage: "Settlement",
    eventStage: "Settlement",
    eventType: "settlement.posted",
    status: "in_progress",
    eventStatus: "completed",
  },
  {
    currentStage: "Closure",
    eventStage: "Closure",
    eventType: "communication.sent",
    status: "in_progress",
    eventStatus: "completed",
  },
  {
    currentStage: "Closure",
    eventStage: "Closure",
    eventType: "case.closed",
    status: "closed",
    eventStatus: "completed",
  },
];

function isLegacyCloneUpdate(update: UiPathCaseUpdateInput) {
  return (
    update.stage === "Vercel Webhook Clone" ||
    update.source.toLowerCase().includes("vercel clone")
  );
}

function isLegacyCloneEvent(event: CaseEventRecord) {
  return (
    event.stage === "Vercel Webhook Clone" ||
    event.source.toLowerCase().includes("vercel clone")
  );
}

function inferLegacyCloneProgress(
  update: UiPathCaseUpdateInput,
  events: CaseEventRecord[],
) {
  if (!isLegacyCloneUpdate(update)) return null;

  const priorCloneEvents = events.filter(isLegacyCloneEvent).length;
  return legacyCloneProgression[
    Math.min(priorCloneEvents, legacyCloneProgression.length - 1)
  ];
}

function derivePatch(
  update: UiPathCaseUpdateInput,
  legacyProgress?: LegacyCloneProgress | null,
) {
  const eventStage = normalizeCaseStage(update.stage);
  const requestedStage = normalizeCaseStage(
    update.summaryPatch.currentStage ?? update.stage,
  );
  const inferredStage =
    requestedStage ??
    (isCaseStageCompleteEvent(update.eventType, update.status)
      ? nextCaseStage(eventStage)
      : eventStage) ??
    eventStage ??
    inferCaseStageFromEventType(update.eventType);

  const patch: Partial<DisputeRecord> = {
    uipathCaseId: update.uipathCaseId,
    uipathCaseUrl: update.uipathCaseUrl,
    lastCallbackAt: now(),
    currentStage:
      inferredStage ?? update.summaryPatch.currentStage ?? update.stage,
    status: update.summaryPatch.status,
    slaStatus: update.summaryPatch.slaStatus,
    priority: update.summaryPatch.priority,
    riskScore: update.summaryPatch.riskScore,
    evidenceScore: update.summaryPatch.evidenceScore,
    recommendedOutcome: update.summaryPatch.recommendedOutcome,
    finalOutcome: update.summaryPatch.finalOutcome,
    approvedAmount: update.summaryPatch.approvedAmount,
  };

  if (legacyProgress) {
    patch.currentStage = legacyProgress.currentStage;
    patch.status = legacyProgress.status ?? patch.status ?? "in_progress";
  }
  if (update.eventType === "human_action.created") {
    patch.status = patch.status ?? "human_review_pending";
    patch.currentStage = "Human Decision";
  }
  if (update.eventType === "sla.at_risk") {
    patch.slaStatus = "at_risk";
  }
  if (update.eventType === "case.closed" || legacyProgress?.eventType === "case.closed") {
    patch.status = "closed";
    patch.currentStage = "Closure";
  }
  if (update.eventType === "case.reopened") {
    patch.status = "reopened";
  }

  return patch;
}

function decisionFromUpdate(
  externalDisputeId: string,
  update: UiPathCaseUpdateInput,
): DecisionRecord | null {
  const payloadDecision = update.payload.decision;
  const decision =
    payloadDecision && typeof payloadDecision === "object"
      ? (payloadDecision as Record<string, unknown>)
      : null;

  if (!decision && !update.eventType.startsWith("decision.")) return null;

  const createdAt = now();
  return {
    externalDisputeId,
    decisionId: String(decision?.decisionId ?? newDecisionId()),
    decisionType: update.eventType,
    recommendedOutcome:
      String(decision?.recommendedOutcome ?? update.summaryPatch.recommendedOutcome ?? "") ||
      null,
    recommendedBy: String(decision?.recommendedBy ?? update.actorName ?? "") || null,
    recommendationRationale:
      String(decision?.recommendationRationale ?? update.description ?? "") ||
      null,
    humanDecision: String(decision?.humanDecision ?? "") || null,
    decidedBy: String(decision?.decidedBy ?? update.actorName ?? "") || null,
    approvedAmount:
      typeof decision?.approvedAmount === "number"
        ? decision.approvedAmount
        : update.summaryPatch.approvedAmount ?? null,
    decisionRationale:
      String(decision?.decisionRationale ?? update.description ?? "") || null,
    createdAt,
    decidedAt: update.eventType === "decision.approved" ? createdAt : null,
  };
}

export async function applyUiPathCaseUpdate(update: UiPathCaseUpdateInput) {
  if (await eventExists(update.eventId)) {
    return {
      accepted: true,
      duplicate: true,
      externalDisputeId:
        update.externalDisputeId ??
        (update.externalCaseKey
          ? disputeIdFromCaseKey(update.externalCaseKey)
          : "unknown"),
    };
  }

  const externalDisputeId =
    update.externalDisputeId ??
    (update.externalCaseKey ? disputeIdFromCaseKey(update.externalCaseKey) : null);
  if (!externalDisputeId) {
    throw new Error("externalDisputeId or externalCaseKey is required");
  }

  let dispute =
    (update.externalCaseKey
      ? await getDisputeByCaseKey(update.externalCaseKey)
      : null) ?? (await getDisputeBundle(externalDisputeId))?.dispute;

  if (!dispute) {
    dispute = await insertDispute({
      externalDisputeId,
      externalCaseKey: update.externalCaseKey ?? toExternalCaseKey(externalDisputeId),
      sourceSystem,
      uipathCaseId: update.uipathCaseId ?? null,
      uipathCaseUrl: update.uipathCaseUrl ?? null,
      status: "external_update_received",
      currentStage: update.stage ?? "Webhook Intake",
      slaStatus: "on_track",
      priority: "normal",
      eventType: "loan_dispute.created",
      disputeType: "duplicate_autopay",
      loanType: "auto_loan",
      loanIdMasked: "LN-****-0000",
      transactionId: null,
      customerName: "Synthetic Customer",
      customerSegment: "Retail",
      vulnerableCustomerFlag: false,
      disputedAmount: 0,
      currency: "USD",
      narrative: "Placeholder case created from an external UiPath callback.",
      riskScore: null,
      evidenceScore: null,
      recommendedOutcome: null,
      finalOutcome: null,
      approvedAmount: null,
      webhookDeliveryStatus: "not_sent",
      webhookStatusCode: null,
      webhookError: null,
      lastCallbackAt: now(),
      createdAt: now(),
      updatedAt: now(),
    });
  }

  const existingBundle = isLegacyCloneUpdate(update)
    ? await getDisputeBundle(dispute.externalDisputeId)
    : null;
  const legacyProgress = existingBundle
    ? inferLegacyCloneProgress(update, existingBundle.events)
    : null;

  await updateDispute(dispute.externalDisputeId, derivePatch(update, legacyProgress));
  const normalizedEventStage =
    legacyProgress?.eventStage ??
    normalizeCaseStage(update.stage ?? update.summaryPatch.currentStage) ??
    update.stage ??
    update.summaryPatch.currentStage ??
    null;
  const event: CaseEventRecord = {
    eventId: update.eventId,
    externalDisputeId: dispute.externalDisputeId,
    externalCaseKey: dispute.externalCaseKey,
    correlationId: update.correlationId,
    eventType: legacyProgress?.eventType ?? update.eventType,
    source: update.source,
    actorType: update.actorType,
    actorName: update.actorName ?? null,
    stage: normalizedEventStage,
    taskName: update.taskName ?? null,
    status: legacyProgress?.eventStatus ?? update.status,
    title: legacyProgress ? `${legacyProgress.eventStage} update` : update.title,
    description: update.description ?? null,
    severity: update.severity,
    payload: update.payload,
    createdAt: now(),
  };
  await insertEventIfNew(event);

  const decision = decisionFromUpdate(dispute.externalDisputeId, update);
  if (decision) {
    await insertDecisionIfNew(decision);
  }

  await insertAuditLog({
    direction: "inbound",
    integrationName: "UiPath callback",
    externalDisputeId: dispute.externalDisputeId,
    eventId: update.eventId,
    correlationId: update.correlationId,
    requestMethod: "POST",
    requestUrl: "/api/uipath/case-updates",
    requestHeaders: { "x-uipath-callback-key": "[redacted]" },
    requestBody: update,
    responseStatus: 200,
    responseBody: { accepted: true },
  });

  return {
    accepted: true,
    duplicate: false,
    externalDisputeId: dispute.externalDisputeId,
  };
}

export async function getCaseContext(externalCaseKey: string) {
  const dispute = await getDisputeByCaseKey(externalCaseKey);
  if (!dispute) return null;
  return getDisputeBundle(dispute.externalDisputeId);
}
