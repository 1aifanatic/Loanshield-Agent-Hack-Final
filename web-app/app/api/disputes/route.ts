import { jsonError, jsonOk, toApiError } from "@/lib/api-response";
import { createDispute } from "@/lib/dispute-service";
import { listDisputes } from "@/lib/store";
import { CreateDisputeSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const disputes = await listDisputes({
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    stage: url.searchParams.get("stage") ?? undefined,
    disputeType: url.searchParams.get("disputeType") ?? undefined,
  });
  return jsonOk({ disputes });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = CreateDisputeSchema.parse(body);
    const result = await createDispute(input);
    return jsonOk(result, { status: 201 });
  } catch (error) {
    const apiError = toApiError(error, "Unable to create dispute");
    return jsonError(apiError.code, apiError.message, { status: apiError.status });
  }
}
