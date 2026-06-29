const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const username = process.env.DEMO_USERNAME ?? "demo";
const password = process.env.DEMO_PASSWORD ?? "demo123";

const scenarios = [
  "duplicate-autopay",
  "misapplied-payment-late-fee",
  "suspicious-payoff-scam",
  "escrow-charge-dispute",
];

async function login() {
  const response = await fetch(`${appUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }
  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error("Login did not return a session cookie");
  return cookie;
}

async function main() {
  const cookie = await login();
  for (const scenarioKey of scenarios) {
    const response = await fetch(`${appUrl}/api/demo/scenarios`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie,
      },
      body: JSON.stringify({ scenarioKey }),
    });
    const json = await response.json();
    if (!response.ok || !json.ok) {
      throw new Error(`Seed failed for ${scenarioKey}: ${JSON.stringify(json)}`);
    }
    console.log(`${scenarioKey}: ${json.data.externalDisputeId}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

export {};
