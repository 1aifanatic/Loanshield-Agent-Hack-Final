import { jsonError, jsonOk, toApiError } from "@/lib/api-response";
import { assertUiPathCallbackAuth } from "@/lib/auth";
import { applyUiPathCaseUpdate } from "@/lib/dispute-service";
import { UiPathCaseUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertUiPathCallbackAuth(request);
    const body = await request.json();
    const update = UiPathCaseUpdateSchema.parse(body);
    const result = await applyUiPathCaseUpdate(update);
    return jsonOk(result);
  } catch (error) {
    const apiError = toApiError(error, "Unable to accept UiPath callback");
    return jsonError(apiError.code, apiError.message, {
      status:
        error instanceof Error &&
        error.message.includes("x-uipath-callback-key")
          ? 401
          : apiError.status,
    });
  }
}
