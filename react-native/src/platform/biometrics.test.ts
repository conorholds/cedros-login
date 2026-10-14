import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  _resetBiometricsClientForTests,
  _setBiometricsClientForTests,
  biometrics,
  type BiometricsAvailability,
} from "./biometrics";

describe("biometrics", () => {
  beforeEach(() => {
    _resetBiometricsClientForTests();
  });

  it("fails closed when the native module is unavailable", async () => {
    _setBiometricsClientForTests(null);

    await expect(biometrics.isAvailable()).resolves.toBe(false);
    await expect(biometrics.authenticate()).resolves.toBe(false);
    await expect(biometrics.getAvailability()).resolves.toMatchObject({
      available: false,
      error: expect.stringContaining("react-native-biometrics"),
    });
  });

  it("reports availability from the native module", async () => {
    const availability: BiometricsAvailability = {
      available: true,
      biometryType: "FaceID",
    };
    _setBiometricsClientForTests({
      isSensorAvailable: vi.fn().mockResolvedValue(availability),
      simplePrompt: vi.fn(),
    });

    await expect(biometrics.getAvailability()).resolves.toEqual(availability);
    await expect(biometrics.isAvailable()).resolves.toBe(true);
  });

  it("passes prompt options to the native module", async () => {
    const simplePrompt = vi.fn().mockResolvedValue({ success: true });
    _setBiometricsClientForTests({
      isSensorAvailable: vi.fn(),
      simplePrompt,
    });

    await expect(
      biometrics.authenticate({
        reason: "Unlock account settings",
        fallbackPromptMessage: "Use passcode",
        cancelButtonText: "Not now",
      }),
    ).resolves.toBe(true);

    expect(simplePrompt).toHaveBeenCalledWith({
      promptMessage: "Unlock account settings",
      fallbackPromptMessage: "Use passcode",
      cancelButtonText: "Not now",
    });
  });

  it("returns false when biometric prompting fails", async () => {
    _setBiometricsClientForTests({
      isSensorAvailable: vi.fn(),
      simplePrompt: vi.fn().mockRejectedValue(new Error("cancelled")),
    });

    await expect(biometrics.authenticate("Confirm")).resolves.toBe(false);
  });
});
