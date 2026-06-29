import { z } from "zod";

export const eventTypes = [
  "loan_dispute.created",
  "loan_scam.reported",
  "evidence.received",
  "customer.message.received",
  "customer.withdrawal.requested",
  "appeal.submitted",
  "merchant_or_servicer_response.received",
] as const;

export const initialEventTypes = [
  "loan_dispute.created",
  "loan_scam.reported",
] as const;

export const disputeTypes = [
  "duplicate_autopay",
  "late_fee_dispute",
  "misapplied_payment",
  "escrow_charge_dispute",
  "payoff_quote_dispute",
  "suspected_loan_scam",
  "unauthorized_ach_payment",
] as const;

export const actorTypes = [
  "customer",
  "portal",
  "webhook",
  "uipath",
  "agent",
  "robot",
  "human",
  "system",
] as const;

export const loanTypes = [
  "auto_loan",
  "mortgage",
  "personal_loan",
  "small_business_loan",
] as const;

export const customerSegments = [
  "Retail",
  "Small Business",
  "Commercial",
  "Vulnerable Customer",
] as const;

export const priorities = ["low", "normal", "high", "urgent"] as const;

export const callbackEventTypes = [
  "case.created",
  "case.correlated",
  "stage.started",
  "stage.completed",
  "secondary_stage.started",
  "secondary_stage.completed",
  "agent.started",
  "agent.completed",
  "robot.started",
  "robot.completed",
  "human_action.created",
  "human_action.completed",
  "decision.recommended",
  "decision.approved",
  "decision.denied",
  "settlement.posted",
  "communication.drafted",
  "communication.sent",
  "case.closed",
  "case.reopened",
  "sla.at_risk",
  "error.integration",
] as const;

export const EvidenceInputSchema = z.object({
  documentType: z.string().min(2),
  fileName: z.string().min(2),
  description: z.string().optional().default(""),
  fileUrl: z.string().url().nullable().optional(),
});

export const CreateDisputeSchema = z.object({
  externalDisputeId: z.string().optional(),
  eventType: z.enum(initialEventTypes),
  disputeType: z.enum(disputeTypes),
  loanType: z.enum(loanTypes),
  loanIdMasked: z.string().min(4),
  transactionId: z.string().optional().default(""),
  customerName: z.string().min(2),
  customerSegment: z.enum(customerSegments).default("Retail"),
  vulnerableCustomerFlag: z.coerce.boolean().default(false),
  disputedAmount: z.coerce.number().nonnegative(),
  currency: z.string().length(3).default("USD"),
  priority: z.enum(priorities).default("normal"),
  narrative: z.string().min(10),
  hasEvidence: z.coerce.boolean().optional(),
  evidence: z.array(EvidenceInputSchema).optional().default([]),
  scenarioKey: z.string().optional(),
});

export const ScenarioLaunchSchema = z.object({
  scenarioKey: z.enum([
    "duplicate-autopay",
    "misapplied-payment-late-fee",
    "suspicious-payoff-scam",
    "escrow-charge-dispute",
  ]),
});

export const CustomerEventSchema = z.object({
  eventType: z.enum(eventTypes),
  message: z.string().min(2),
  evidenceIds: z.array(z.string()).optional().default([]),
});

export const SummaryPatchSchema = z
  .object({
    currentStage: z.string().optional(),
    status: z.string().optional(),
    slaStatus: z.string().optional(),
    priority: z.enum(priorities).optional(),
    riskScore: z.coerce.number().optional(),
    evidenceScore: z.coerce.number().optional(),
    recommendedOutcome: z.string().optional(),
    finalOutcome: z.string().optional(),
    approvedAmount: z.coerce.number().optional(),
  })
  .optional()
  .default({});

export const UiPathCaseUpdateSchema = z.object({
  eventId: z.string().min(3),
  correlationId: z.string().min(3),
  eventType: z.enum(callbackEventTypes),
  externalDisputeId: z.string().optional(),
  externalCaseKey: z.string().optional(),
  uipathCaseId: z.string().optional(),
  uipathCaseUrl: z.string().url().optional(),
  source: z.string().min(2),
  actorType: z.enum(actorTypes),
  actorName: z.string().optional(),
  stage: z.string().optional(),
  taskName: z.string().optional(),
  status: z.string().default("completed"),
  severity: z.string().default("info"),
  title: z.string().min(2),
  description: z.string().optional(),
  summaryPatch: SummaryPatchSchema,
  payload: z.record(z.string(), z.unknown()).optional().default({}),
});

export type CreateDisputeInput = z.infer<typeof CreateDisputeSchema>;
export type EvidenceInput = z.infer<typeof EvidenceInputSchema>;
export type CustomerEventInput = z.infer<typeof CustomerEventSchema>;
export type UiPathCaseUpdateInput = z.infer<typeof UiPathCaseUpdateSchema>;
export type ScenarioKey = z.infer<typeof ScenarioLaunchSchema>["scenarioKey"];
