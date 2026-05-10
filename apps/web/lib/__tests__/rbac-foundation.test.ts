import { describe, expect, it } from "vitest";
import {
  fleetOSRoles,
  hasPermission,
  rolePermissions,
  type FleetOSPermission,
} from "../../../../packages/rbac/src/index";

describe("FleetOS RBAC foundation", () => {
  it("keeps every V1 role mapped to explicit permissions", () => {
    for (const role of fleetOSRoles) {
      expect(rolePermissions[role], `${role} should have permissions configured`).toBeDefined();
      expect(rolePermissions[role].length, `${role} should not be an empty role`).toBeGreaterThan(0);
    }
  });

  it("allows owners and admins full V1 access", () => {
    const expected: FleetOSPermission[] = [
      "organization.read",
      "jobs.write",
      "runs.write",
      "vehicles.write",
      "users.write",
      "control_tower.read",
    ];

    for (const permission of expected) {
      expect(hasPermission({ role: "owner" }, permission)).toBe(true);
      expect(hasPermission({ role: "admin" }, permission)).toBe(true);
    }
  });

  it("keeps operational roles useful but bounded", () => {
    expect(hasPermission({ role: "ops_manager" }, "jobs.write")).toBe(true);
    expect(hasPermission({ role: "ops_manager" }, "runs.write")).toBe(true);
    expect(hasPermission({ role: "ops_manager" }, "control_tower.read")).toBe(true);
    expect(hasPermission({ role: "ops_manager" }, "users.write")).toBe(false);

    expect(hasPermission({ role: "client" }, "jobs.read")).toBe(true);
    expect(hasPermission({ role: "client" }, "runs.write")).toBe(false);
    expect(hasPermission({ role: "subcontractor" }, "jobs.write")).toBe(false);
  });
});
