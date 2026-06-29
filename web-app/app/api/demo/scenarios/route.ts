import { jsonError, jsonOk, toApiError } from "@/lib/api-response";
import { launchScenario } from "@/lib/dispute-service";
import { ScenarioLaunchSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenarioKey } = ScenarioLaunchSchema.parse(body);
    const result = await launchScenario(scenarioKey);
    return jsonOk(result, { status: 201 });
  } catch (error) {
    const apiError = toApiError(error, "Unable to launch scenario");
    return jsonError(apiError.code, apiError.message, { status: apiError.status });
  }
}
