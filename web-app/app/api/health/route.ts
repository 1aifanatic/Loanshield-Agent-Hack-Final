import { jsonError, jsonOk } from "@/lib/api-response";
import { healthCheck } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await healthCheck();
    return jsonOk({
      service: "loanshield-demo-portal",
      status: health.status,
      database: health.database,
      time: new Date().toISOString(),
    });
  } catch (error) {
    return jsonError(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Health check failed",
      { status: 503 },
    );
  }
}
