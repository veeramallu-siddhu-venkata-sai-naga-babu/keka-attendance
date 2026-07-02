import { chromium } from "playwright";

console.log("Started");

async function run() {
  // Fetch secrets from the environment variables injected by GitHub
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

    // 1. Click on Microsoft Login Button
    console.log("Clicking on Microsoft login...");
    // Looks for standard Microsoft login anchor or button text
    await page.click('text="Continue with Microsoft"');

    // 2. Wait for Microsoft OAuth page redirection and input email
    console.log("Filling email on Microsoft login page...");
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', email);
    await page.click(
      'input[type="submit"], button[type="submit"], #idSIButton9',
    ); // Clicks "Next"

    // 3. Input Password
    console.log("Filling password...");
    await page.waitForSelector('input[type="password"]');
    await page.fill('input[type="password"]', password);

    // Microsoft often asks "Stay signed in?". We intercept the submission.
    console.log("Submitting login form...");
    await page.click(
      'input[type="submit"], button[type="submit"], #idSIButton9',
    );

    // Optional: Handle Microsoft's "Stay signed in?" screen if it appears
    try {
      await page.waitForSelector("#idSIButton9", { timeout: 5000 });
      await page.click("#idSIButton9"); // Clicks "Yes" or "No" to clear the modal
      console.log('Cleared "Stay signed in" prompt.');
    } catch (e) {
      // Prompt didn't appear, continue safely
    }

    // 4. Wait for redirect back to the Keka Dashboard
    console.log("Waiting for redirection to Keka Dashboard...");
    await page.waitForURL("**/dashboard**", { timeout: 30000 });

    // 5. Click on "Web Clock-in"
    console.log('Dashboard loaded! Attempting to click on "Web Clock-in"...');
    // Finds elements by exact text matching "Web Clock-In"
    const aolTechElement = page.locator('text="Web Clock-In"');
    await aolTechElement.waitFor({ state: "visible", timeout: 15000 });
    await aolTechElement.click();
    console.log("Successfully clicked on Web Clock-In!");

    // Add any post-click action or validation you require here...
  } catch (error) {
    console.error("Automation failed during execution:", error);
    // Take a screenshot of the failure state for debugging purposes
    await page.screenshot({ path: "failure-screenshot.png" });
    console.log("Saved failure-screenshot.png to repository root.");
    process.exit(1);
  } finally {
    await browser.close();
    console.log("Browser closed safely.");
  }
}

run();
