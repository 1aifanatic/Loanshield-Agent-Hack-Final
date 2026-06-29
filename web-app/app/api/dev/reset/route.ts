import { jsonError, jsonOk, toApiError } from "@/lib/api-response";
import { assertDemoAdminAuth } from "@/lib/auth";
import { env } from "@/lib/env";
import { resetDemoData } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertDemoAdminAuth(request);
    if (!env.ENABLE_DEV_RESET) {
      return jsonError("AUTH_REQUIRED", "Demo reset is disabled", {
        status: 403,
      });
    }
    await resetDemoData();
    return jsonOk({ reset: true });
  } catch (error) {
    const apiError = toApiError(error, "Unable to reset demo data");
    return jsonError(apiError.code, apiError.message, { status: apiError.status });
  }
}
