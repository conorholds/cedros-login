import { useState } from "react";

import type { SignupAvailability } from "../types";
import { parseSignupAvailability } from "../utils/signupAvailability";
import { useExternalEffect } from "./effects";

const MAXIMUM_TIMER_DELAY_MS = 2_147_483_647;

/** Validate a quota snapshot and remove it from the UI when its period expires. */
export function useCurrentSignupAvailability(
  value: unknown,
): SignupAvailability | undefined {
  const [, setExpirationCheck] = useState(0);
  const availability = parseSignupAvailability(value);
  const resetsAt = availability?.resetsAt;

  useExternalEffect(() => {
    if (!resetsAt) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const checkExpiration = () => {
      const remainingMs = Date.parse(resetsAt) - Date.now();
      if (remainingMs <= 0) {
        setExpirationCheck((current) => current + 1);
        return;
      }
      timeoutId = setTimeout(
        checkExpiration,
        Math.min(MAXIMUM_TIMER_DELAY_MS, remainingMs + 250),
      );
    };
    checkExpiration();

    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [resetsAt]);

  return availability;
}
