import { jsonError, jsonOk } from "@/lib/api-response";
import { sessionCookieName, validateDemoCredentials } from "@/lib/auth";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };

  if (!validateDemoCredentials(body.username ?? "", body.password ?? "")) {
    return jsonError("AUTH_REQUIRED", "Invalid demo username or password", {
      status: 401,
    });
  }

  const response = jsonOk({ loggedIn: true });
  response.cookies.set(sessionCookieName, env.DEMO_SESSION_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
