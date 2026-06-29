import { jsonError, jsonOk, toApiError } from "@/lib/api-response";
import { addEvidence } from "@/lib/dispute-service";
import { EvidenceInputSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ externalDisputeId: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { externalDisputeId } = await context.params;
    const body = await request.json();
    const input = EvidenceInputSchema.parse(body);
    const bundle = await addEvidence(externalDisputeId, input);
    return jsonOk(bundle, { status: 201 });
  } catch (error) {
    const apiError = toApiError(error, "Unable to add evidence");
    return jsonError(apiError.code, apiError.message, { status: apiError.status });
  }
}
