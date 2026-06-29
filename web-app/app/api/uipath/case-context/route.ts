import { jsonError, jsonOk, toApiError } from "@/lib/api-response";
import { assertUiPathCallbackAuth } from "@/lib/auth";
import { getCaseContext } from "@/lib/dispute-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    assertUiPathCallbackAuth(request);
    const url = new URL(request.url);
    const externalCaseKey = url.searchParams.get("externalCaseKey");
    if (!externalCaseKey) {
      return jsonError("VALIDATION_ERROR", "externalCaseKey is required", {
        status: 400,
      });
    }
    const bundle = await getCaseContext(externalCaseKey);
    if (!bundle) {
      return jsonError("NOT_FOUND", "Case context not found", { status: 404 });
    }
    return jsonOk(bundle);
  } catch (error) {
    const apiError = toApiError(error, "Unable to fetch case context");
    return jsonError(apiError.code, apiError.message, {
      status:
        error instanceof Error &&
        error.message.includes("x-uipath-callback-key")
          ? 401
          : apiError.status,
    });
  }
}
