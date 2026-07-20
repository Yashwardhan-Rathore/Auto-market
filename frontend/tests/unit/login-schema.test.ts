import { describe, expect, it } from "vitest";
import { loginSchema } from "@/components/auth/login-form";

describe("login schema", () => {
  it("matches backend email and eight-character password validation", () => {
    expect(loginSchema.safeParse({ email: "invalid", password: "short" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "user@example.com", password: "12345678" }).success).toBe(true);
  });
});
