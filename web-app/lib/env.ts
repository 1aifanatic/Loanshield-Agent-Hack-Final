import "server-only";

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_DEMO_TITLE:
    process.env.NEXT_PUBLIC_DEMO_TITLE ?? "LoanShield Demo Portal",
  NEXT_PUBLIC_POLL_INTERVAL_MS: Number(
    process.env.NEXT_PUBLIC_POLL_INTERVAL_MS ?? 3000,
  ),

  DATABASE_URL: process.env.DATABASE_URL,

  UIPATH_WEBHOOK_URL: process.env.UIPATH_WEBHOOK_URL,
  UIPATH_WEBHOOK_API_KEY: process.env.UIPATH_WEBHOOK_API_KEY,
  UIPATH_CALLBACK_API_KEY:
    process.env.UIPATH_CALLBACK_API_KEY ?? "demo-callback-key",
  UIPATH_CALLBACK_HMAC_SECRET: process.env.UIPATH_CALLBACK_HMAC_SECRET,

  DEMO_ADMIN_TOKEN: process.env.DEMO_ADMIN_TOKEN ?? "demo-admin-token",
  ENABLE_DEV_RESET: process.env.ENABLE_DEV_RESET === "true",
  DEMO_USERNAME: process.env.DEMO_USERNAME ?? "demo",
  DEMO_PASSWORD: process.env.DEMO_PASSWORD ?? "demo123",
  DEMO_SESSION_TOKEN:
    process.env.DEMO_SESSION_TOKEN ?? "loanshield-demo-session",
};

export function isDatabaseConfigured() {
  return Boolean(env.DATABASE_URL);
}
