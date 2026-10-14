import { describe, expect, it } from "vitest";
import { validatePassword } from "./validation";

describe("validatePassword", () => {
  it("returns the password length requirement", () => {
    const result = validatePassword("");

    expect(result.requirements.map((requirement) => requirement.key)).toEqual([
      "minLength",
    ]);
    expect(result.requirements.every((requirement) => !requirement.met)).toBe(
      true,
    );
    expect(result.metCount).toBe(0);
    expect(result.isValid).toBe(false);
  });

  it("passes valid passwords and counts every met requirement", () => {
    const result = validatePassword("ValidPassphrase1!");

    expect(result.isValid).toBe(true);
    expect(result.metCount).toBe(result.requirements.length);
    expect(result.requirements.every((requirement) => requirement.met)).toBe(
      true,
    );
    expect(result.strength).toBe("good");
  });

  it("accepts 8 characters and rejects 7, including Unicode passwords", () => {
    expect(validatePassword("x7K#q2L").isValid).toBe(false);
    expect(validatePassword("x7K#q2Lm").isValid).toBe(true);
    expect(validatePassword("🔐".repeat(7)).isValid).toBe(false);
    expect(validatePassword("🔐".repeat(8)).isValid).toBe(true);
  });

  it("does not impose character-class composition rules", () => {
    expect(validatePassword("all lowercase passphrase").isValid).toBe(true);
    expect(validatePassword("123456789012345").isValid).toBe(true);
  });

  it("never reports good or strong strength while invalid", () => {
    const result = validatePassword("aA1!");

    expect(result.isValid).toBe(false);
    expect(result.metCount).toBe(0);
    expect(result.strength).toBe("weak");
  });
});
