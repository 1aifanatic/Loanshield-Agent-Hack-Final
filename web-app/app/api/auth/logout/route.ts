import { jsonOk } from "@/lib/api-response";
import { sessionCookieName } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const response = jsonOk({ loggedIn: false });
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
