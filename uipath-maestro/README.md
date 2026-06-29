# UiPath Maestro Assets

This folder contains the UiPath side of LoanShield.

## Folder Layout

```text
case-management/
  LoanShieldMaestroCase/

agent-projects/
  Agent Builder projects used by the case stages.

api-workflows/
  API workflow projects used for webhook intake, callbacks, mock services, email/sheets, and audit events.
```

## Main Case

`case-management/LoanShieldMaestroCase` is the primary UiPath Maestro Case Management project.

The demo path is:

1. Demo intake or webhook intake.
2. Loan context retrieval.
3. Eligibility and policy triage.
4. Evidence collection.
5. Parallel servicing and fraud investigation.
6. Action Center human decision.
7. Settlement and correction.
8. Customer communication.
9. Closure and audit QA.

## Sanitization

The public copy replaces live generated webhook URLs and personal connection identifiers with placeholders. Rebind connections and process references in your own UiPath tenant before running from this repository.
