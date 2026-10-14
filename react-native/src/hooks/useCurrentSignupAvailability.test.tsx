import React, { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "test-renderer";

import type { SignupAvailability } from "../types";
import { useCurrentSignupAvailability } from "./useCurrentSignupAvailability";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;

function AvailabilityProbe({ value }: { value: unknown }): React.ReactElement {
  return React.createElement("availability-probe", {
    value: useCurrentSignupAvailability(value),
  });
}

function renderedAvailability(): SignupAvailability | undefined {
  const probes = root?.container.queryAll(
    (instance) => instance.type === "availability-probe",
  );
  if (!probes || probes.length !== 1)
    throw new Error("Expected one availability probe");
  return probes[0].props.value as SignupAvailability | undefined;
}

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  root = undefined;
  vi.useRealTimers();
});

describe("useCurrentSignupAvailability", () => {
  it("removes a full snapshot as soon as its period expires", async () => {
    vi.useFakeTimers();
    vi.setSystemTime("2026-09-12T12:00:00Z");
    root = createRoot();
    await act(async () =>
      root?.render(
        <AvailabilityProbe
          value={{
            remaining: 0,
            limit: 100,
            period: "monthly",
            resetsAt: "2026-09-12T12:00:01Z",
          }}
        />,
      ),
    );

    expect(renderedAvailability()?.remaining).toBe(0);
    await act(async () => vi.advanceTimersByTime(1_250));
    expect(renderedAvailability()).toBeUndefined();
  });
});
