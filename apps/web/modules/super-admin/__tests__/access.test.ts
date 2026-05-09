import { describe, expect, it } from "vitest";
import { isActiveSuperAdminRecord } from "../access";

describe("super admin access", () => {
  it("allows active super admin records", () => {
    expect(isActiveSuperAdminRecord({ status: "active" })).toBe(true);
  });

  it("denies missing and suspended records", () => {
    expect(isActiveSuperAdminRecord(null)).toBe(false);
    expect(isActiveSuperAdminRecord({ status: "suspended" })).toBe(false);
  });
});
