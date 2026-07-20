import { expect, test } from "@playwright/test";
test("protected route redirects without a session", async ({ page }) => { await page.goto("/super-admin/dashboard"); await expect(page).toHaveURL(/\/login$/); });
