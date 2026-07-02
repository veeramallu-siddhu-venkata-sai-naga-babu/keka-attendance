import { chromium } from "playwright";

console.log("Started");

async function run() {
  // Read credentials from environment variables
  const email = process.env.KEKA_EMAIL;
  const password = process.env.KEKA_PASSWORD;

  if (!email || !password) {
    console.error(
      "Error: KEKA_EMAIL or KEKA_PASSWORD environment variables are missing.",
    );
    process.exit(1);
  }

  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navigating to Keka portal...");
    await page.goto("https://sumerutechnology.keka.com/", {
      waitUntil: "domcontentloaded",
    });

    // Microsoft Login
    console.log("Clicking on Microsoft login...");
    await page.click('text="Continue with Microsoft"');

    // Email
    console.log("Filling email...");
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', email);
    await page.click(
      'input[type="submit"], button[type="submit"], #idSIButton9',
    );

    // Password
    console.log("Filling password...");
    await page.waitForSelector('input[type="password"]');
    await page.fill('input[type="password"]', password);
    await page.click(
      'input[type="submit"], button[type="submit"], #idSIButton9',
    );

    // Stay signed in (if shown)
    try {
      await page.waitForSelector("#idSIButton9", { timeout: 5000 });
      await page.click("#idSIButton9");
      console.log('Cleared "Stay signed in" prompt.');
    } catch {
      console.log("No 'Stay signed in' prompt.");
    }

    // Wait for Keka dashboard
    console.log("Waiting for Keka dashboard...");
    await page.waitForURL("**/dashboard**", { timeout: 30000 });

    // Click Clock-out twice
    console.log('Looking for "Clock-out"...');

    const clockOutButton = page.getByText("Clock-out", { exact: true });

    await clockOutButton.waitFor({
      state: "visible",
      timeout: 15000,
    });

    // First click
    await clockOutButton.click();
    console.log("First Clock-out click completed.");

    // Wait for UI to settle
    await page.waitForTimeout(1000);

    // Wait until button is available again
    await clockOutButton.waitFor({
      state: "visible",
      timeout: 10000,
    });

    // Second click
    await clockOutButton.click();
    console.log("Second Clock-out click completed.");

    console.log("Automation completed successfully.");
  } catch (error) {
    console.error("Automation failed:", error);

    await page.screenshot({
      path: "failure-screenshot.png",
      fullPage: true,
    });

    console.log("Saved failure-screenshot.png");
    process.exit(1);
  } finally {
    await browser.close();
    console.log("Browser closed safely.");
  }
}

run();
