import { test, expect } from "@playwright/test";

// These tests run against the seeded demo accounts (see prisma/seed.ts).
// Run `npm run db:seed` against a fresh dev database before running e2e.

test("landing page shows student and parent entry points", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "I'm a student" })).toBeVisible();
  await expect(page.getByRole("link", { name: "I'm a parent" })).toBeVisible();
});

test("student can log in with the demo account and reach their dashboard", async ({ page }) => {
  await page.goto("/login?as=student");
  await page.getByLabel("Username").fill("alex");
  await page.getByLabel("Password").fill("student123");
  await page.getByRole("button", { name: "Start learning" }).click();

  await expect(page).toHaveURL(/\/student\/dashboard/);
  await expect(page.getByRole("heading", { name: "Today's Tasks" })).toBeVisible();
});

test("parent can log in with the demo account and reach their dashboard", async ({ page }) => {
  await page.goto("/login?as=parent");
  await page.getByLabel("Email").fill("parent@redbay.demo");
  await page.getByLabel("Password").fill("Parent123!");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/parent\/dashboard/);
  await expect(page.getByText("Alex")).toBeVisible();
});

test("student can complete a maths practice question and see immediate feedback", async ({ page }) => {
  await page.goto("/login?as=student");
  await page.getByLabel("Username").fill("alex");
  await page.getByLabel("Password").fill("student123");
  await page.getByRole("button", { name: "Start learning" }).click();
  await expect(page).toHaveURL(/\/student\/dashboard/);

  await page.locator('a[href="/student/maths"]').click();
  await page.locator('a[href="/student/maths/addition"]').click();
  await page.getByRole("button", { name: "Bronze" }).click();

  // Whatever the answer is, submitting should surface feedback.
  const answerBox = page.getByPlaceholder("Your answer");
  await expect(answerBox).toBeVisible();
  await answerBox.fill("1");
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText(/Correct!|Not quite/)).toBeVisible();
});
