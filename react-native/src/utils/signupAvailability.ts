import type { SignupAvailability, SignupLimitPeriod } from "../types";

const PERIODS: readonly SignupLimitPeriod[] = ["daily", "weekly", "monthly"];
const RFC3339_INSTANT =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i;

/** Validate the public API/config boundary before rendering quota information. */
export function parseSignupAvailability(
  value: unknown,
): SignupAvailability | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const { remaining, limit, period, resetsAt } = record;
  const resetTime =
    typeof resetsAt === "string" ? Date.parse(resetsAt) : Number.NaN;
  if (
    !Number.isSafeInteger(remaining) ||
    !Number.isSafeInteger(limit) ||
    (remaining as number) < 0 ||
    (limit as number) < 1 ||
    (remaining as number) > (limit as number) ||
    typeof period !== "string" ||
    !PERIODS.includes(period as SignupLimitPeriod) ||
    typeof resetsAt !== "string" ||
    !RFC3339_INSTANT.test(resetsAt) ||
    !Number.isFinite(resetTime) ||
    resetTime <= Date.now()
  ) {
    return undefined;
  }
  return {
    remaining: remaining as number,
    limit: limit as number,
    period: period as SignupLimitPeriod,
    resetsAt,
  };
}
