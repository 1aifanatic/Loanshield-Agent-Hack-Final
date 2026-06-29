import { jsonError, jsonOk, toApiError } from "@/lib/api-response";
import { assertDemoAdminAuth } from "@/lib/auth";
import { getDisputeBundle, updateDispute } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ externalDisputeId: string }> };

export async function GET(_request: Request, context: Context) {
  const { externalDisputeId } = await context.params;
  const bundle = await getDisputeBundle(externalDisputeId);
  if (!bundle) {
    return jsonError("NOT_FOUND", "Dispute not found", { status: 404 });
  }
  return jsonOk(bundle);
}

export async function PATCH(request: Request, context: Context) {
  try {
    assertDemoAdminAuth(request);
    const { externalDisputeId } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const updated = await updateDispute(externalDisputeId, {
      status: typeof body.status === "string" ? body.status : undefined,
      currentStage:
        typeof body.currentStage === "string" ? body.currentStage : undefined,
      slaStatus: typeof body.slaStatus === "string" ? body.slaStatus : undefined,
    });
    if (!updated) {
      return jsonError("NOT_FOUND", "Dispute not found", { status: 404 });
    }
    return jsonOk({ dispute: updated });
  } catch (error) {
    const apiError = toApiError(error, "Unable to update dispute");
    return jsonError(apiError.code, apiError.message, { status: apiError.status });
  }
}
