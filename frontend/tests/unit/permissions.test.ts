import { describe, expect, it } from "vitest";
import { ROLES } from "@/constants/roles";
import { canAccessModule, canPerformAction, getDashboardPath } from "@/permissions/permission-matrix";

describe("verified role permissions", () => {
  it("centralizes dashboard redirects", () => {
    expect(getDashboardPath(ROLES.SUPER_ADMIN)).toBe("/super-admin/dashboard");
    expect(getDashboardPath(ROLES.ADMIN)).toBe("/admin/dashboard");
    expect(getDashboardPath(ROLES.USER)).toBe("/user/dashboard");
  });
  it("does not allow users to manage admins", () => {
    expect(canAccessModule(ROLES.USER, "admins")).toBe(false);
    expect(canPerformAction(ROLES.USER, "admins", "delete")).toBe(false);
  });
});
