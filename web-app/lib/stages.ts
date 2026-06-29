export const caseStages = [
  "Webhook Intake",
  "Loan Context",
  "Policy Triage",
  "Evidence Collection",
  "Investigation",
  "Human Decision",
  "Settlement",
  "Closure",
] as const;

export type CaseStage = (typeof caseStages)[number];

const stageAliases: Record<string, CaseStage> = {
  "demo intake": "Webhook Intake",
  intake: "Webhook Intake",
  "load demo intake": "Webhook Intake",
  "vercel webhook clone": "Webhook Intake",
  webhook: "Webhook Intake",
  "webhook intake": "Webhook Intake",

  context: "Loan Context",
  "context retrieved": "Loan Context",
  "loan context": "Loan Context",
  "loan context retrieval": "Loan Context",

  "policy triage": "Policy Triage",
  triage: "Policy Triage",

  evidence: "Evidence Collection",
  "evidence collection": "Evidence Collection",
  "pending customer information": "Evidence Collection",

  fraud: "Investigation",
  investigation: "Investigation",
  "fraud investigation": "Investigation",
  "parallel servicing fraud investigation": "Investigation",
  "parallel servicing / fraud investigation": "Investigation",
  "servicing investigation": "Investigation",

  "human decision": "Human Decision",
  "human review": "Human Decision",

  refund: "Settlement",
  settlement: "Settlement",

  closure: "Closure",
  "closure review": "Closure",
  "customer communication": "Closure",
};

function stageKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizeCaseStage(stage?: string | null): CaseStage | null {
  if (!stage) return null;

  const direct = caseStages.find((item) => item === stage);
  if (direct) return direct;

  const key = stageKey(stage);
  if (stageAliases[key]) return stageAliases[key];

  const containsMatch = caseStages.find((item) =>
    key.includes(stageKey(item)),
  );
  return containsMatch ?? null;
}

export function nextCaseStage(stage?: string | null): CaseStage | null {
  const normalized = normalizeCaseStage(stage);
  if (!normalized) return null;

  const index = caseStages.indexOf(normalized);
  return caseStages[Math.min(index + 1, caseStages.length - 1)] ?? null;
}

export function inferCaseStageFromEventType(eventType: string): CaseStage | null {
  if (eventType.startsWith("human_action.") || eventType.startsWith("decision.")) {
    return "Human Decision";
  }
  if (eventType === "settlement.posted") return "Settlement";
  if (eventType.startsWith("communication.") || eventType === "case.closed") {
    return "Closure";
  }
  if (eventType === "case.created" || eventType === "case.correlated") {
    return "Webhook Intake";
  }
  if (eventType === "sla.at_risk" || eventType === "error.integration") {
    return "Investigation";
  }
  return null;
}

export function isCaseStageCompleteEvent(eventType: string, status?: string | null) {
  return (
    eventType === "case.closed" ||
    eventType.endsWith(".completed") ||
    eventType === "decision.approved" ||
    eventType === "decision.denied" ||
    eventType === "settlement.posted" ||
    eventType === "communication.sent" ||
    status === "completed"
  );
}
