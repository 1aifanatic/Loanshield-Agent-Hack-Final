import "server-only";

import { neon } from "@neondatabase/serverless";
import { env } from "@/lib/env";

export type DisputeRecord = {
  externalDisputeId: string;
  externalCaseKey: string;
  sourceSystem: string;
  uipathCaseId: string | null;
  uipathCaseUrl: string | null;
  status: string;
  currentStage: string;
  slaStatus: string;
  priority: string;
  eventType: string;
  disputeType: string;
  loanType: string;
  loanIdMasked: string;
  transactionId: string | null;
  customerName: string;
  customerSegment: string;
  vulnerableCustomerFlag: boolean;
  disputedAmount: number;
  currency: string;
  narrative: string;
  riskScore: number | null;
  evidenceScore: number | null;
  recommendedOutcome: string | null;
  finalOutcome: string | null;
  approvedAmount: number | null;
  webhookDeliveryStatus: string | null;
  webhookStatusCode: number | null;
  webhookError: string | null;
  lastCallbackAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CaseEventRecord = {
  eventId: string;
  externalDisputeId: string;
  externalCaseKey: string;
  correlationId: string;
  eventType: string;
  source: string;
  actorType: string;
  actorName: string | null;
  stage: string | null;
  taskName: string | null;
  status: string;
  title: string;
  description: string | null;
  severity: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type EvidenceRecord = {
  evidenceId: string;
  externalDisputeId: string;
  documentType: string;
  fileName: string;
  fileUrl: string | null;
  description: string | null;
  uploadedBy: string;
  validationStatus: string;
  extractedFields: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type DecisionRecord = {
  decisionId: string;
  externalDisputeId: string;
  decisionType: string;
  recommendedOutcome: string | null;
  recommendedBy: string | null;
  recommendationRationale: string | null;
  humanDecision: string | null;
  decidedBy: string | null;
  approvedAmount: number | null;
  decisionRationale: string | null;
  createdAt: string;
  decidedAt: string | null;
};

export type DisputeBundle = {
  dispute: DisputeRecord;
  events: CaseEventRecord[];
  evidence: EvidenceRecord[];
  decisions: DecisionRecord[];
};

type AuditLogInput = {
  direction: string;
  integrationName: string;
  externalDisputeId?: string;
  eventId?: string;
  correlationId?: string;
  requestMethod?: string;
  requestUrl?: string;
  requestHeaders?: Record<string, unknown>;
  requestBody?: Record<string, unknown>;
  responseStatus?: number | null;
  responseBody?: Record<string, unknown>;
  errorMessage?: string;
};

type MemoryStore = {
  disputes: DisputeRecord[];
  events: CaseEventRecord[];
  evidence: EvidenceRecord[];
  decisions: DecisionRecord[];
  auditLogs: AuditLogInput[];
};

declare global {
  var __loanshieldStore: MemoryStore | undefined;
}

let sqlClient: ReturnType<typeof neon> | undefined;
let schemaReady: Promise<void> | undefined;

function getMemoryStore() {
  globalThis.__loanshieldStore ??= {
    disputes: [],
    events: [],
    evidence: [],
    decisions: [],
    auditLogs: [],
  };
  return globalThis.__loanshieldStore;
}

function getSql() {
  if (!env.DATABASE_URL) return null;
  sqlClient ??= neon(env.DATABASE_URL);
  return sqlClient;
}

function iso(value?: string | Date | null) {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function numeric(value: unknown) {
  if (value === null || value === undefined) return null;
  return Number(value);
}

function asRows(value: unknown) {
  return value as Record<string, unknown>[];
}

function rowToDispute(row: Record<string, unknown>): DisputeRecord {
  return {
    externalDisputeId: String(row.external_dispute_id),
    externalCaseKey: String(row.external_case_key),
    sourceSystem: String(row.source_system),
    uipathCaseId: (row.uipath_case_id as string | null) ?? null,
    uipathCaseUrl: (row.uipath_case_url as string | null) ?? null,
    status: String(row.status),
    currentStage: String(row.current_stage),
    slaStatus: String(row.sla_status),
    priority: String(row.priority),
    eventType: String(row.event_type),
    disputeType: String(row.dispute_type),
    loanType: String(row.loan_type),
    loanIdMasked: String(row.loan_id_masked),
    transactionId: (row.transaction_id as string | null) ?? null,
    customerName: String(row.customer_name),
    customerSegment: String(row.customer_segment),
    vulnerableCustomerFlag: Boolean(row.vulnerable_customer_flag),
    disputedAmount: Number(row.disputed_amount ?? 0),
    currency: String(row.currency),
    narrative: String(row.narrative),
    riskScore: numeric(row.risk_score),
    evidenceScore: numeric(row.evidence_score),
    recommendedOutcome: (row.recommended_outcome as string | null) ?? null,
    finalOutcome: (row.final_outcome as string | null) ?? null,
    approvedAmount: numeric(row.approved_amount),
    webhookDeliveryStatus:
      (row.webhook_delivery_status as string | null) ?? "not_sent",
    webhookStatusCode: numeric(row.webhook_status_code),
    webhookError: (row.webhook_error as string | null) ?? null,
    lastCallbackAt: row.last_callback_at ? iso(row.last_callback_at as string) : null,
    createdAt: iso(row.created_at as string),
    updatedAt: iso(row.updated_at as string),
  };
}

function rowToEvent(row: Record<string, unknown>): CaseEventRecord {
  return {
    eventId: String(row.event_id),
    externalDisputeId: String(row.external_dispute_id),
    externalCaseKey: String(row.external_case_key),
    correlationId: String(row.correlation_id),
    eventType: String(row.event_type),
    source: String(row.source),
    actorType: String(row.actor_type),
    actorName: (row.actor_name as string | null) ?? null,
    stage: (row.stage as string | null) ?? null,
    taskName: (row.task_name as string | null) ?? null,
    status: String(row.status),
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    severity: String(row.severity),
    payload: (row.payload as Record<string, unknown>) ?? {},
    createdAt: iso(row.created_at as string),
  };
}

function rowToEvidence(row: Record<string, unknown>): EvidenceRecord {
  return {
    evidenceId: String(row.evidence_id),
    externalDisputeId: String(row.external_dispute_id),
    documentType: String(row.document_type),
    fileName: String(row.file_name),
    fileUrl: (row.file_url as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    uploadedBy: String(row.uploaded_by),
    validationStatus: String(row.validation_status),
    extractedFields: (row.extracted_fields as Record<string, unknown>) ?? {},
    createdAt: iso(row.created_at as string),
    updatedAt: iso(row.updated_at as string),
  };
}

function rowToDecision(row: Record<string, unknown>): DecisionRecord {
  return {
    decisionId: String(row.decision_id),
    externalDisputeId: String(row.external_dispute_id),
    decisionType: String(row.decision_type),
    recommendedOutcome: (row.recommended_outcome as string | null) ?? null,
    recommendedBy: (row.recommended_by as string | null) ?? null,
    recommendationRationale:
      (row.recommendation_rationale as string | null) ?? null,
    humanDecision: (row.human_decision as string | null) ?? null,
    decidedBy: (row.decided_by as string | null) ?? null,
    approvedAmount: numeric(row.approved_amount),
    decisionRationale: (row.decision_rationale as string | null) ?? null,
    createdAt: iso(row.created_at as string),
    decidedAt: row.decided_at ? iso(row.decided_at as string) : null,
  };
}

async function ensureSchema() {
  const sql = getSql();
  if (!sql) return;
  schemaReady ??= (async () => {
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
    await sql`
      CREATE TABLE IF NOT EXISTS disputes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        external_dispute_id TEXT NOT NULL UNIQUE,
        external_case_key TEXT NOT NULL UNIQUE,
        source_system TEXT NOT NULL DEFAULT 'LoanShieldDemoPortal',
        uipath_case_id TEXT,
        uipath_case_url TEXT,
        status TEXT NOT NULL DEFAULT 'created',
        current_stage TEXT NOT NULL DEFAULT 'Webhook Intake',
        sla_status TEXT NOT NULL DEFAULT 'on_track',
        priority TEXT NOT NULL DEFAULT 'normal',
        event_type TEXT NOT NULL,
        dispute_type TEXT NOT NULL,
        loan_type TEXT NOT NULL,
        loan_id_masked TEXT NOT NULL,
        transaction_id TEXT,
        customer_name TEXT NOT NULL,
        customer_segment TEXT NOT NULL DEFAULT 'Retail',
        vulnerable_customer_flag BOOLEAN NOT NULL DEFAULT FALSE,
        disputed_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'USD',
        narrative TEXT NOT NULL,
        risk_score NUMERIC(5,2),
        evidence_score NUMERIC(5,2),
        recommended_outcome TEXT,
        final_outcome TEXT,
        approved_amount NUMERIC(12,2),
        webhook_delivery_status TEXT DEFAULT 'not_sent',
        webhook_status_code INTEGER,
        webhook_error TEXT,
        last_callback_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS case_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id TEXT NOT NULL UNIQUE,
        external_dispute_id TEXT NOT NULL REFERENCES disputes(external_dispute_id) ON DELETE CASCADE,
        external_case_key TEXT NOT NULL,
        correlation_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        source TEXT NOT NULL,
        actor_type TEXT NOT NULL,
        actor_name TEXT,
        stage TEXT,
        task_name TEXT,
        status TEXT NOT NULL DEFAULT 'completed',
        title TEXT NOT NULL,
        description TEXT,
        severity TEXT NOT NULL DEFAULT 'info',
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS evidence_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        external_dispute_id TEXT NOT NULL REFERENCES disputes(external_dispute_id) ON DELETE CASCADE,
        evidence_id TEXT NOT NULL UNIQUE,
        document_type TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_url TEXT,
        description TEXT,
        uploaded_by TEXT NOT NULL DEFAULT 'customer',
        validation_status TEXT NOT NULL DEFAULT 'pending',
        extracted_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS decisions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        external_dispute_id TEXT NOT NULL REFERENCES disputes(external_dispute_id) ON DELETE CASCADE,
        decision_id TEXT NOT NULL UNIQUE,
        decision_type TEXT NOT NULL,
        recommended_outcome TEXT,
        recommended_by TEXT,
        recommendation_rationale TEXT,
        human_decision TEXT,
        decided_by TEXT,
        approved_amount NUMERIC(12,2),
        decision_rationale TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        decided_at TIMESTAMPTZ
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS integration_audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        direction TEXT NOT NULL,
        integration_name TEXT NOT NULL,
        external_dispute_id TEXT,
        event_id TEXT,
        correlation_id TEXT,
        request_method TEXT,
        request_url TEXT,
        request_headers JSONB DEFAULT '{}'::jsonb,
        request_body JSONB DEFAULT '{}'::jsonb,
        response_status INTEGER,
        response_body JSONB DEFAULT '{}'::jsonb,
        error_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  })();
  await schemaReady;
}

export async function healthCheck() {
  const sql = getSql();
  if (!sql) {
    return { database: "memory", status: "healthy" };
  }
  await ensureSchema();
  await sql`SELECT 1`;
  return { database: "connected", status: "healthy" };
}

export async function insertDispute(dispute: DisputeRecord) {
  const sql = getSql();
  if (!sql) {
    const store = getMemoryStore();
    const existingIndex = store.disputes.findIndex(
      (item) => item.externalDisputeId === dispute.externalDisputeId,
    );
    if (existingIndex >= 0) {
      store.disputes[existingIndex] = {
        ...store.disputes[existingIndex],
        ...dispute,
        updatedAt: new Date().toISOString(),
      };
      return store.disputes[existingIndex];
    }
    store.disputes.unshift(dispute);
    return dispute;
  }

  await ensureSchema();
  const rows = asRows(await sql`
    INSERT INTO disputes (
      external_dispute_id, external_case_key, source_system, uipath_case_id,
      uipath_case_url, status, current_stage, sla_status, priority, event_type,
      dispute_type, loan_type, loan_id_masked, transaction_id, customer_name,
      customer_segment, vulnerable_customer_flag, disputed_amount, currency,
      narrative, risk_score, evidence_score, recommended_outcome,
      final_outcome, approved_amount, webhook_delivery_status,
      webhook_status_code, webhook_error, last_callback_at, created_at, updated_at
    )
    VALUES (
      ${dispute.externalDisputeId}, ${dispute.externalCaseKey},
      ${dispute.sourceSystem}, ${dispute.uipathCaseId},
      ${dispute.uipathCaseUrl}, ${dispute.status}, ${dispute.currentStage},
      ${dispute.slaStatus}, ${dispute.priority}, ${dispute.eventType},
      ${dispute.disputeType}, ${dispute.loanType}, ${dispute.loanIdMasked},
      ${dispute.transactionId}, ${dispute.customerName},
      ${dispute.customerSegment}, ${dispute.vulnerableCustomerFlag},
      ${dispute.disputedAmount}, ${dispute.currency}, ${dispute.narrative},
      ${dispute.riskScore}, ${dispute.evidenceScore},
      ${dispute.recommendedOutcome}, ${dispute.finalOutcome},
      ${dispute.approvedAmount}, ${dispute.webhookDeliveryStatus},
      ${dispute.webhookStatusCode}, ${dispute.webhookError},
      ${dispute.lastCallbackAt}, ${dispute.createdAt}, ${dispute.updatedAt}
    )
    ON CONFLICT (external_dispute_id)
    DO UPDATE SET updated_at = NOW()
    RETURNING *
  `);
  return rowToDispute(rows[0]);
}

export async function updateDispute(
  externalDisputeId: string,
  patch: Partial<DisputeRecord>,
) {
  const sql = getSql();
  if (!sql) {
    const store = getMemoryStore();
    const existing = store.disputes.find(
      (item) => item.externalDisputeId === externalDisputeId,
    );
    if (!existing) return null;
    Object.assign(existing, patch, { updatedAt: new Date().toISOString() });
    return existing;
  }

  await ensureSchema();
  const rows = asRows(await sql`
    UPDATE disputes
    SET
      uipath_case_id = COALESCE(${patch.uipathCaseId ?? null}, uipath_case_id),
      uipath_case_url = COALESCE(${patch.uipathCaseUrl ?? null}, uipath_case_url),
      status = COALESCE(${patch.status ?? null}, status),
      current_stage = COALESCE(${patch.currentStage ?? null}, current_stage),
      sla_status = COALESCE(${patch.slaStatus ?? null}, sla_status),
      priority = COALESCE(${patch.priority ?? null}, priority),
      risk_score = COALESCE(${patch.riskScore ?? null}, risk_score),
      evidence_score = COALESCE(${patch.evidenceScore ?? null}, evidence_score),
      recommended_outcome = COALESCE(${patch.recommendedOutcome ?? null}, recommended_outcome),
      final_outcome = COALESCE(${patch.finalOutcome ?? null}, final_outcome),
      approved_amount = COALESCE(${patch.approvedAmount ?? null}, approved_amount),
      webhook_delivery_status = COALESCE(${patch.webhookDeliveryStatus ?? null}, webhook_delivery_status),
      webhook_status_code = COALESCE(${patch.webhookStatusCode ?? null}, webhook_status_code),
      webhook_error = COALESCE(${patch.webhookError ?? null}, webhook_error),
      last_callback_at = COALESCE(${patch.lastCallbackAt ?? null}, last_callback_at),
      updated_at = NOW()
    WHERE external_dispute_id = ${externalDisputeId}
    RETURNING *
  `);
  return rows[0] ? rowToDispute(rows[0]) : null;
}

export async function listDisputes(filters?: {
  q?: string;
  status?: string;
  stage?: string;
  disputeType?: string;
}) {
  const sql = getSql();
  let disputes: DisputeRecord[];

  if (!sql) {
    disputes = [...getMemoryStore().disputes];
  } else {
    await ensureSchema();
    const rows = asRows(
      await sql`SELECT * FROM disputes ORDER BY updated_at DESC LIMIT 200`,
    );
    disputes = rows.map((row) => rowToDispute(row));
  }

  const q = filters?.q?.toLowerCase().trim();
  return disputes.filter((dispute) => {
    if (filters?.status && dispute.status !== filters.status) return false;
    if (filters?.stage && dispute.currentStage !== filters.stage) return false;
    if (filters?.disputeType && dispute.disputeType !== filters.disputeType) {
      return false;
    }
    if (!q) return true;
    return [
      dispute.externalDisputeId,
      dispute.customerName,
      dispute.disputeType,
      dispute.loanType,
      dispute.currentStage,
      dispute.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}

export async function getDisputeBundle(
  externalDisputeId: string,
): Promise<DisputeBundle | null> {
  const sql = getSql();
  if (!sql) {
    const store = getMemoryStore();
    const dispute = store.disputes.find(
      (item) => item.externalDisputeId === externalDisputeId,
    );
    if (!dispute) return null;
    return {
      dispute,
      events: store.events
        .filter((item) => item.externalDisputeId === externalDisputeId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      evidence: store.evidence.filter(
        (item) => item.externalDisputeId === externalDisputeId,
      ),
      decisions: store.decisions.filter(
        (item) => item.externalDisputeId === externalDisputeId,
      ),
    };
  }

  await ensureSchema();
  const disputeRows = asRows(
    await sql`SELECT * FROM disputes WHERE external_dispute_id = ${externalDisputeId} LIMIT 1`,
  );
  if (!disputeRows[0]) return null;
  const [eventRows, evidenceRows, decisionRows] = await Promise.all([
    sql`SELECT * FROM case_events WHERE external_dispute_id = ${externalDisputeId} ORDER BY created_at DESC`,
    sql`SELECT * FROM evidence_items WHERE external_dispute_id = ${externalDisputeId} ORDER BY created_at DESC`,
    sql`SELECT * FROM decisions WHERE external_dispute_id = ${externalDisputeId} ORDER BY created_at DESC`,
  ]);

  return {
    dispute: rowToDispute(disputeRows[0]),
    events: asRows(eventRows).map((row) => rowToEvent(row)),
    evidence: asRows(evidenceRows).map((row) => rowToEvidence(row)),
    decisions: asRows(decisionRows).map((row) => rowToDecision(row)),
  };
}

export async function getDisputeByCaseKey(externalCaseKey: string) {
  const sql = getSql();
  if (!sql) {
    return (
      getMemoryStore().disputes.find(
        (item) => item.externalCaseKey === externalCaseKey,
      ) ?? null
    );
  }
  await ensureSchema();
  const rows = asRows(
    await sql`SELECT * FROM disputes WHERE external_case_key = ${externalCaseKey} LIMIT 1`,
  );
  return rows[0] ? rowToDispute(rows[0]) : null;
}

export async function insertEventIfNew(event: CaseEventRecord) {
  const sql = getSql();
  if (!sql) {
    const store = getMemoryStore();
    const existing = store.events.find((item) => item.eventId === event.eventId);
    if (existing) return { duplicate: true, event: existing };
    store.events.unshift(event);
    return { duplicate: false, event };
  }

  await ensureSchema();
  const rows = asRows(await sql`
    INSERT INTO case_events (
      event_id, external_dispute_id, external_case_key, correlation_id,
      event_type, source, actor_type, actor_name, stage, task_name, status,
      title, description, severity, payload, created_at
    )
    VALUES (
      ${event.eventId}, ${event.externalDisputeId}, ${event.externalCaseKey},
      ${event.correlationId}, ${event.eventType}, ${event.source},
      ${event.actorType}, ${event.actorName}, ${event.stage},
      ${event.taskName}, ${event.status}, ${event.title},
      ${event.description}, ${event.severity}, ${JSON.stringify(event.payload)}::jsonb,
      ${event.createdAt}
    )
    ON CONFLICT (event_id) DO NOTHING
    RETURNING *
  `);
  if (!rows[0]) {
    return { duplicate: true, event };
  }
  return {
    duplicate: false,
    event: rowToEvent(rows[0]),
  };
}

export async function eventExists(eventId: string) {
  const sql = getSql();
  if (!sql) {
    return getMemoryStore().events.some((item) => item.eventId === eventId);
  }
  await ensureSchema();
  const rows = asRows(
    await sql`SELECT event_id FROM case_events WHERE event_id = ${eventId} LIMIT 1`,
  );
  return Boolean(rows[0]);
}

export async function insertEvidenceIfNew(evidence: EvidenceRecord) {
  const sql = getSql();
  if (!sql) {
    const store = getMemoryStore();
    const existing = store.evidence.find(
      (item) => item.evidenceId === evidence.evidenceId,
    );
    if (existing) return existing;
    store.evidence.unshift(evidence);
    return evidence;
  }

  await ensureSchema();
  const rows = asRows(await sql`
    INSERT INTO evidence_items (
      external_dispute_id, evidence_id, document_type, file_name, file_url,
      description, uploaded_by, validation_status, extracted_fields, created_at,
      updated_at
    )
    VALUES (
      ${evidence.externalDisputeId}, ${evidence.evidenceId},
      ${evidence.documentType}, ${evidence.fileName}, ${evidence.fileUrl},
      ${evidence.description}, ${evidence.uploadedBy},
      ${evidence.validationStatus}, ${JSON.stringify(evidence.extractedFields)}::jsonb,
      ${evidence.createdAt}, ${evidence.updatedAt}
    )
    ON CONFLICT (evidence_id) DO NOTHING
    RETURNING *
  `);
  return rows[0] ? rowToEvidence(rows[0]) : evidence;
}

export async function insertDecisionIfNew(decision: DecisionRecord) {
  const sql = getSql();
  if (!sql) {
    const store = getMemoryStore();
    const existing = store.decisions.find(
      (item) => item.decisionId === decision.decisionId,
    );
    if (existing) return existing;
    store.decisions.unshift(decision);
    return decision;
  }

  await ensureSchema();
  const rows = asRows(await sql`
    INSERT INTO decisions (
      external_dispute_id, decision_id, decision_type, recommended_outcome,
      recommended_by, recommendation_rationale, human_decision, decided_by,
      approved_amount, decision_rationale, created_at, decided_at
    )
    VALUES (
      ${decision.externalDisputeId}, ${decision.decisionId},
      ${decision.decisionType}, ${decision.recommendedOutcome},
      ${decision.recommendedBy}, ${decision.recommendationRationale},
      ${decision.humanDecision}, ${decision.decidedBy},
      ${decision.approvedAmount}, ${decision.decisionRationale},
      ${decision.createdAt}, ${decision.decidedAt}
    )
    ON CONFLICT (decision_id) DO NOTHING
    RETURNING *
  `);
  return rows[0] ? rowToDecision(rows[0]) : decision;
}

export async function insertAuditLog(log: AuditLogInput) {
  const sql = getSql();
  if (!sql) {
    getMemoryStore().auditLogs.unshift(log);
    return;
  }

  await ensureSchema();
  await sql`
    INSERT INTO integration_audit_logs (
      direction, integration_name, external_dispute_id, event_id,
      correlation_id, request_method, request_url, request_headers,
      request_body, response_status, response_body, error_message
    )
    VALUES (
      ${log.direction}, ${log.integrationName}, ${log.externalDisputeId},
      ${log.eventId}, ${log.correlationId}, ${log.requestMethod},
      ${log.requestUrl}, ${JSON.stringify(log.requestHeaders ?? {})}::jsonb,
      ${JSON.stringify(log.requestBody ?? {})}::jsonb, ${log.responseStatus ?? null},
      ${JSON.stringify(log.responseBody ?? {})}::jsonb, ${log.errorMessage}
    )
  `;
}

export async function resetDemoData() {
  const sql = getSql();
  if (!sql) {
    globalThis.__loanshieldStore = undefined;
    return;
  }

  await ensureSchema();
  await sql`TRUNCATE integration_audit_logs, decisions, evidence_items, case_events, disputes RESTART IDENTITY CASCADE`;
}
