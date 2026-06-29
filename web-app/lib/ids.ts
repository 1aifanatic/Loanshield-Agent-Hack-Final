import "server-only";

import { randomBytes, randomUUID } from "node:crypto";

export const sourceSystem = "LoanShieldDemoPortal";

export function newCorrelationId() {
  return randomUUID();
}

export function newEventId(prefix = "evt") {
  return `${prefix}-${randomUUID()}`;
}

export function newEvidenceId() {
  return `EVD-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function newDecisionId() {
  return `DEC-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function generateExternalDisputeId() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `LDS-${y}${m}${d}-${suffix}`;
}

export function toExternalCaseKey(externalDisputeId: string) {
  return `${sourceSystem}:${externalDisputeId}`;
}

export function disputeIdFromCaseKey(externalCaseKey: string) {
  const [, externalDisputeId] = externalCaseKey.split(":");
  return externalDisputeId;
}
