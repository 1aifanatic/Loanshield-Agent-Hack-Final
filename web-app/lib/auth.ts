import "server-only";

import { cookies } from "next/headers";
import { env } from "@/lib/env";

export const sessionCookieName = "loanshield_session";

export function validateDemoCredentials(username: string, password: string) {
  return username === env.DEMO_USERNAME && password === env.DEMO_PASSWORD;
}

export async function isLoggedIn() {
  const cookieStore = await cookies();
  return cookieStore.get(sessionCookieName)?.value === env.DEMO_SESSION_TOKEN;
}

export function isRequestAuthenticated(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookieName}=`));

  return cookie?.split("=")[1] === env.DEMO_SESSION_TOKEN;
}

export function assertUiPathCallbackAuth(request: Request) {
  const supplied = request.headers.get("x-uipath-callback-key");
  if (!supplied || supplied !== env.UIPATH_CALLBACK_API_KEY) {
    throw new Error("Invalid or missing x-uipath-callback-key");
  }
}

export function assertDemoAdminAuth(request: Request) {
  const token = request.headers.get("x-demo-admin-token");
  if (!token || token !== env.DEMO_ADMIN_TOKEN) {
    throw new Error("Invalid or missing x-demo-admin-token");
  }
}
