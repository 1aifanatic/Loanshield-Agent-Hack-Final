import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";

export type ApiErrorCode =
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFIGURATION_ERROR"
  | "INTEGRATION_ERROR"
  | "SERVER_ERROR";

export function jsonOk<T>(
  data: T,
  init?: ResponseInit & { correlationId?: string },
) {
  const correlationId = init?.correlationId ?? randomUUID();
  return NextResponse.json(
    { ok: true, data, error: null, correlationId },
    { status: init?.status ?? 200, headers: init?.headers },
  );
}

export function jsonError(
  code: ApiErrorCode,
  message: string,
  init?: ResponseInit & { correlationId?: string },
) {
  const correlationId = init?.correlationId ?? randomUUID();
  return NextResponse.json(
    { ok: false, data: null, error: { code, message }, correlationId },
    { status: init?.status ?? 500, headers: init?.headers },
  );
}

export function toApiError(error: unknown, fallback = "Unexpected error") {
  if (error instanceof ZodError) {
    return {
      code: "VALIDATION_ERROR" as const,
      status: 400,
      message: error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    };
  }

  if (error instanceof Error) {
    return {
      code: "SERVER_ERROR" as const,
      status: 500,
      message: error.message,
    };
  }

  return { code: "SERVER_ERROR" as const, status: 500, message: fallback };
}
