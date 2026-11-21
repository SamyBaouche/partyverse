import { expect, test } from "@playwright/test";

/**
 * #62 — smoke: host opens Draw → 2 phones join (mock realtime).
 * PubSub is skipped via VITE_USE_MOCK=true so CI stays reliable.
 */
test.describe("party smoke (mock)", () => {
  test("host picks Draw Vote; two players join; start continues", async ({ browser }) => {
    const host = await browser.newPage();
    await host.goto("/host?phase=draw-modes");
    await expect(host.getByRole("heading", { name: "Choose a mode" })).toBeVisible();

    await host.getByRole("button", { name: /Vote/i }).click();
    await expect(host.getByRole("heading", { name: "Scan to join" })).toBeVisible();
    await expect(host.getByTestId("room-code")).toHaveText("KXPM");
    await expect(host.getByText(/\/play\/KXPM/i)).toBeVisible();

    const playerA = await browser.newPage();
    await playerA.goto("/play/KXPM?mock=1");
    await playerA.getByLabel("Your name").fill("Alice");
    await playerA.getByRole("button", { name: "Join →" }).click();
    await expect(playerA.getByText("You're in")).toBeVisible({ timeout: 15_000 });
    await expect(playerA.getByText("Alice")).toBeVisible();

    const playerB = await browser.newPage();
    await playerB.goto("/play/KXPM?mock=1");
    await playerB.getByLabel("Your name").fill("Bob");
    await playerB.getByRole("button", { name: "Join →" }).click();
    await expect(playerB.getByText("You're in")).toBeVisible({ timeout: 15_000 });
    await expect(playerB.getByText("Bob")).toBeVisible();

    // Mock lobby auto-fills players every 2s; wait until Start is enabled.
    const start = host.getByRole("button", { name: "Continue" });
    await expect(start).toBeEnabled({ timeout: 20_000 });
    await start.click();
    await expect(host.getByText("Phones are synced")).toBeVisible();
    await expect(host.getByRole("button", { name: "Open draw board" })).toBeVisible();

    await playerA.close();
    await playerB.close();
    await host.close();
  });

  test("how-to-play page renders", async ({ page }) => {
    await page.goto("/how-to-play");
    await expect(page.getByRole("heading", { name: /How to play/i })).toBeVisible();
    await expect(page.getByText(/Scan the QR/i)).toBeVisible();
  });
});
