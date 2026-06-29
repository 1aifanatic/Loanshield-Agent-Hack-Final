import "server-only";

import { env } from "@/lib/env";

export type UiPathWebhookPayload = {
  eventId: string;
  eventType: string;
  eventVersion: "1.0";
  sourceSystem: "LoanShieldDemoPortal";
  externalDisputeId: string;
  externalCaseKey: string;
  correlationId: string;
  occurredAt: string;
  callback: {
    caseUpdatesUrl: string;
    caseContextUrl: string;
    authScheme: "x-uipath-callback-key";
  };
  customer?: Record<string, unknown>;
  loan?: Record<string, unknown>;
  dispute?: Record<string, unknown>;
  evidence?: Record<string, unknown>[];
  demo?: Record<string, unknown>;
};

export async function sendUiPathWebhook(payload: UiPathWebhookPayload) {
  const url = env.UIPATH_WEBHOOK_URL;
  if (!url) {
    return {
      ok: false,
      status: null,
      bodyText: "",
      error: "UIPATH_WEBHOOK_URL is not configured",
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-source-system": "LoanShieldDemoPortal",
        ...(env.UIPATH_WEBHOOK_API_KEY
          ? { "x-demo-webhook-key": env.UIPATH_WEBHOOK_API_KEY }
          : {}),
      },
      body: JSON.stringify(payload),
    });

    return {
      ok: response.ok,
      status: response.status,
      bodyText: await response.text(),
      error: response.ok ? undefined : response.statusText,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      bodyText: "",
      error: error instanceof Error ? error.message : "Webhook request failed",
    };
  }
}
