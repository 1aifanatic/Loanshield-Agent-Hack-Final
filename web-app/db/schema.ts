import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const disputes = pgTable("disputes", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalDisputeId: text("external_dispute_id").notNull().unique(),
  externalCaseKey: text("external_case_key").notNull().unique(),
  sourceSystem: text("source_system").notNull().default("LoanShieldDemoPortal"),
  uipathCaseId: text("uipath_case_id"),
  uipathCaseUrl: text("uipath_case_url"),
  status: text("status").notNull().default("created"),
  currentStage: text("current_stage").notNull().default("Webhook Intake"),
  slaStatus: text("sla_status").notNull().default("on_track"),
  priority: text("priority").notNull().default("normal"),
  eventType: text("event_type").notNull(),
  disputeType: text("dispute_type").notNull(),
  loanType: text("loan_type").notNull(),
  loanIdMasked: text("loan_id_masked").notNull(),
  transactionId: text("transaction_id"),
  customerName: text("customer_name").notNull(),
  customerSegment: text("customer_segment").notNull().default("Retail"),
  vulnerableCustomerFlag: boolean("vulnerable_customer_flag")
    .notNull()
    .default(false),
  disputedAmount: numeric("disputed_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  currency: text("currency").notNull().default("USD"),
  narrative: text("narrative").notNull(),
  riskScore: numeric("risk_score", { precision: 5, scale: 2 }),
  evidenceScore: numeric("evidence_score", { precision: 5, scale: 2 }),
  recommendedOutcome: text("recommended_outcome"),
  finalOutcome: text("final_outcome"),
  approvedAmount: numeric("approved_amount", { precision: 12, scale: 2 }),
  webhookDeliveryStatus: text("webhook_delivery_status").default("not_sent"),
  webhookStatusCode: integer("webhook_status_code"),
  webhookError: text("webhook_error"),
  lastCallbackAt: timestamp("last_callback_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const caseEvents = pgTable("case_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: text("event_id").notNull().unique(),
  externalDisputeId: text("external_dispute_id")
    .notNull()
    .references(() => disputes.externalDisputeId, { onDelete: "cascade" }),
  externalCaseKey: text("external_case_key").notNull(),
  correlationId: text("correlation_id").notNull(),
  eventType: text("event_type").notNull(),
  source: text("source").notNull(),
  actorType: text("actor_type").notNull(),
  actorName: text("actor_name"),
  stage: text("stage"),
  taskName: text("task_name"),
  status: text("status").notNull().default("completed"),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity").notNull().default("info"),
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const evidenceItems = pgTable("evidence_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalDisputeId: text("external_dispute_id")
    .notNull()
    .references(() => disputes.externalDisputeId, { onDelete: "cascade" }),
  evidenceId: text("evidence_id").notNull().unique(),
  documentType: text("document_type").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url"),
  description: text("description"),
  uploadedBy: text("uploaded_by").notNull().default("customer"),
  validationStatus: text("validation_status").notNull().default("pending"),
  extractedFields: jsonb("extracted_fields").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const decisions = pgTable("decisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalDisputeId: text("external_dispute_id")
    .notNull()
    .references(() => disputes.externalDisputeId, { onDelete: "cascade" }),
  decisionId: text("decision_id").notNull().unique(),
  decisionType: text("decision_type").notNull(),
  recommendedOutcome: text("recommended_outcome"),
  recommendedBy: text("recommended_by"),
  recommendationRationale: text("recommendation_rationale"),
  humanDecision: text("human_decision"),
  decidedBy: text("decided_by"),
  approvedAmount: numeric("approved_amount", { precision: 12, scale: 2 }),
  decisionRationale: text("decision_rationale"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
});

export const integrationAuditLogs = pgTable("integration_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  direction: text("direction").notNull(),
  integrationName: text("integration_name").notNull(),
  externalDisputeId: text("external_dispute_id"),
  eventId: text("event_id"),
  correlationId: text("correlation_id"),
  requestMethod: text("request_method"),
  requestUrl: text("request_url"),
  requestHeaders: jsonb("request_headers").default({}),
  requestBody: jsonb("request_body").default({}),
  responseStatus: integer("response_status"),
  responseBody: jsonb("response_body").default({}),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
