import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("CedrosLoginProvider auth routes", () => {
  it("uses the supported current-user endpoint", () => {
    const filePath = path.resolve(
      process.cwd(),
      "src/context/CedrosLoginProvider.tsx",
    );
    const source = fs.readFileSync(filePath, "utf8");
    expect(source).toContain('AUTH_USER_ENDPOINT = "/auth/user"');
  });
});
