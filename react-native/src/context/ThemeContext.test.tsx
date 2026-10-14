import React, { act } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { createRoot, type Root } from "test-renderer";
import { motion } from "../theme/motion";
import { radii } from "../theme/radii";
import {
  CedrosThemeProvider,
  useCedrosTheme,
  type CedrosTheme,
} from "./ThemeContext";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;

function ThemeProbe(): React.ReactElement {
  return React.createElement("theme-probe", { theme: useCedrosTheme() });
}

function renderedTheme(): CedrosTheme {
  const probes = root?.container.queryAll(
    (instance) => instance.type === "theme-probe",
  );
  if (!probes || probes.length !== 1)
    throw new Error("Expected one theme probe");
  return probes[0].props.theme as CedrosTheme;
}

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  root = undefined;
});

describe("CedrosThemeProvider motion foundations", () => {
  it("provides semantic radii and spring defaults", async () => {
    root = createRoot();
    await act(async () => root?.render(<ThemeProbe />));

    expect(renderedTheme().radii).toEqual(radii);
    expect(renderedTheme().motion).toEqual(motion);
    expect(radii.compact).toBeLessThan(radii.field);
    expect(radii.field).toBeLessThan(radii.overlay);
  });

  it("deep-merges spring overrides without dropping production defaults", async () => {
    root = createRoot();
    await act(async () =>
      root?.render(
        <CedrosThemeProvider
          overrides={{
            radii: { card: 20 },
            motion: { springs: { responsive: { damping: 42 } } },
          }}
        >
          <ThemeProbe />
        </CedrosThemeProvider>,
      ),
    );

    expect(renderedTheme().radii.card).toBe(20);
    expect(renderedTheme().radii.field).toBe(radii.field);
    expect(renderedTheme().motion.springs.responsive.damping).toBe(42);
    expect(renderedTheme().motion.springs.responsive.stiffness).toBe(
      motion.springs.responsive.stiffness,
    );
    expect(renderedTheme().motion.springs.settle).toEqual(
      motion.springs.settle,
    );
  });
});
