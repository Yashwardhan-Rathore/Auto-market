import { expect, test } from "@playwright/test";
test("login page exposes accessible credentials fields", async ({ page }) => { await page.goto("/login"); await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible(); await expect(page.getByLabel("Email address")).toBeVisible(); await expect(page.getByLabel("Password", { exact: true })).toBeVisible(); });
