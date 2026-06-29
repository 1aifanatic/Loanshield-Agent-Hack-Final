import type { CreateDisputeInput, ScenarioKey } from "@/lib/validators";

export type ScenarioDefinition = {
  key: ScenarioKey;
  title: string;
  description: string;
  exceptionPath: string;
  actors: string[];
  payload: CreateDisputeInput;
};

export const scenarios: ScenarioDefinition[] = [
  {
    key: "duplicate-autopay",
    title: "Duplicate autopay dispute",
    description:
      "Customer claims the monthly loan autopay was debited twice from the same checking account.",
    exceptionPath:
      "Duplicate payment confirmation, fee reversal, refund approval, settlement posting.",
    actors: ["Webhook", "Policy Agent", "Servicing Robot", "Human Reviewer"],
    payload: {
      eventType: "loan_dispute.created",
      disputeType: "duplicate_autopay",
      customerName: "Maya Thompson",
      customerSegment: "Retail",
      vulnerableCustomerFlag: false,
      loanType: "auto_loan",
      loanIdMasked: "LN-****-2049",
      transactionId: "PMT-883920",
      disputedAmount: 640.12,
      currency: "USD",
      priority: "normal",
      narrative:
        "Customer states the June autopay was debited twice from her checking account.",
      hasEvidence: true,
      evidence: [
        {
          documentType: "bank_statement",
          fileName: "checking_statement_june.pdf",
          description: "Shows two ACH debits for the same monthly payment.",
        },
      ],
      scenarioKey: "duplicate-autopay",
    },
  },
  {
    key: "misapplied-payment-late-fee",
    title: "Misapplied payment late fee",
    description:
      "Customer says a payment was made on time but posted to the wrong loan, causing a late fee.",
    exceptionPath:
      "Payment history robot, servicing error review, missing bank confirmation, approval.",
    actors: ["Webhook", "Payment Robot", "Ops Analyst", "Letter Agent"],
    payload: {
      eventType: "loan_dispute.created",
      disputeType: "misapplied_payment",
      customerName: "Ethan Brooks",
      customerSegment: "Retail",
      vulnerableCustomerFlag: false,
      loanType: "mortgage",
      loanIdMasked: "MTG-****-1180",
      transactionId: "PMT-442781",
      disputedAmount: 85,
      currency: "USD",
      priority: "normal",
      narrative:
        "Customer says payment was made on time but was applied to the wrong loan, causing a late fee.",
      hasEvidence: false,
      evidence: [],
      scenarioKey: "misapplied-payment-late-fee",
    },
  },
  {
    key: "suspicious-payoff-scam",
    title: "Suspicious payoff scam",
    description:
      "Customer reports receiving a fake payoff instruction and sending money to an unknown beneficiary.",
    exceptionPath:
      "Fraud hold, supervisor review, compliance referral, customer communication.",
    actors: ["Webhook", "Fraud Agent", "Supervisor", "Compliance Workflow"],
    payload: {
      eventType: "loan_scam.reported",
      disputeType: "suspected_loan_scam",
      customerName: "Sofia Patel",
      customerSegment: "Vulnerable Customer",
      vulnerableCustomerFlag: true,
      loanType: "personal_loan",
      loanIdMasked: "PL-****-6621",
      transactionId: "WIRE-771921",
      disputedAmount: 4200,
      currency: "USD",
      priority: "high",
      narrative:
        "Customer reports receiving a suspicious payoff instruction and sending funds to an unknown beneficiary.",
      hasEvidence: true,
      evidence: [
        {
          documentType: "customer_message",
          fileName: "suspicious_payoff_email.eml",
          description: "Customer-provided email with payoff instructions.",
        },
      ],
      scenarioKey: "suspicious-payoff-scam",
    },
  },
  {
    key: "escrow-charge-dispute",
    title: "Escrow charge dispute",
    description:
      "Borrower disputes an insurance-related escrow charge and asks servicing to review the shortage.",
    exceptionPath:
      "Evidence collection, escrow investigation, missing tax or insurance document, explanation.",
    actors: ["Webhook", "Escrow Agent", "Document Robot", "Human Reviewer"],
    payload: {
      eventType: "loan_dispute.created",
      disputeType: "escrow_charge_dispute",
      customerName: "Northstar Dental LLC",
      customerSegment: "Small Business",
      vulnerableCustomerFlag: false,
      loanType: "small_business_loan",
      loanIdMasked: "SBL-****-9022",
      transactionId: "ESC-112092",
      disputedAmount: 1180.45,
      currency: "USD",
      priority: "normal",
      narrative:
        "Borrower disputes an insurance-related escrow charge and requests review.",
      hasEvidence: false,
      evidence: [],
      scenarioKey: "escrow-charge-dispute",
    },
  },
];

export function getScenario(key: ScenarioKey) {
  return scenarios.find((scenario) => scenario.key === key);
}
