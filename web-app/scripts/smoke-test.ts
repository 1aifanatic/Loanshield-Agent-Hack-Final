const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const username = process.env.DEMO_USERNAME ?? "demo";
const password = process.env.DEMO_PASSWORD ?? "demo123";
const callbackKey = process.env.UIPATH_CALLBACK_API_KEY ?? "demo-callback-key";

async function readJson(response: Response) {
  const json = await response.json();
  if (!response.ok || !json.ok) {
    throw new Error(JSON.stringify(json));
  }
  return json;
}

async function main() {
  const health = await readJson(await fetch(`${appUrl}/api/health`));
  console.log(`health: ${health.data.status} (${health.data.database})`);

  const loginResponse = await fetch(`${appUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const cookie = loginResponse.headers.get("set-cookie")?.split(";")[0];
  await readJson(loginResponse);
  if (!cookie) throw new Error("Missing login cookie");
  console.log("login: ok");

  const launch = await readJson(
    await fetch(`${appUrl}/api/demo/scenarios`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie,
      },
      body: JSON.stringify({ scenarioKey: "suspicious-payoff-scam" }),
    }),
  );
  const externalDisputeId = launch.data.externalDisputeId;
  console.log(`scenario: ${externalDisputeId}`);

  await readJson(
    await fetch(`${appUrl}/api/uipath/case-updates`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-uipath-callback-key": callbackKey,
      },
      body: JSON.stringify({
        eventId: `evt-smoke-${crypto.randomUUID()}`,
        correlationId: `corr-smoke-${crypto.randomUUID()}`,
        eventType: "stage.started",
        externalDisputeId,
        externalCaseKey: `LoanShieldDemoPortal:${externalDisputeId}`,
        source: "UiPath Maestro Case",
        actorType: "agent",
        actorName: "Smoke Test Agent",
        stage: "Policy Triage",
        status: "completed",
        title: "Smoke callback accepted",
        description: "Smoke test stage update.",
        summaryPatch: {
          currentStage: "Policy Triage",
          status: "in_progress",
        },
        payload: { smoke: true },
      }),
    }),
  );
  console.log("callback: ok");

  await readJson(
    await fetch(
      `${appUrl}/api/uipath/case-context?externalCaseKey=${encodeURIComponent(
        `LoanShieldDemoPortal:${externalDisputeId}`,
      )}`,
      {
        headers: {
          "x-uipath-callback-key": callbackKey,
        },
      },
    ),
  );
  console.log("case-context: ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

export {};
