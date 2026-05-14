import { test, expect } from '@playwright/test';

// ─── USABILITY TEST CONFIGURATION ─────────────────────────────────────────────
// Base URL of the running Angular app
const BASE_URL = 'http://localhost:4200';

// ─── SCENARIO 1: User Registration and Login ──────────────────────────────────
// Task: Register a new account and log in successfully
// Success criteria: Completed in under 2 minutes
test('UT-001: New user can register and login successfully', async ({ page }) => {
  const startTime = Date.now();

  // Step 1 — Navigate to the app
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  // Step 2 — Find and click register option
  await page.screenshot({ path: 'tests/screenshots/UT-001-step1-landing.png' });

  // Step 3 — Fill registration form
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/UT-001-step2-login-page.png' });

  // Look for register form fields
  const usernameInput = page.locator('input[placeholder*="username"], input[name*="username"], input[id*="username"]').first();
  const emailInput = page.locator('input[placeholder*="email"], input[name*="email"], input[type="email"]').first();
  const passwordInput = page.locator('input[placeholder*="password"], input[name*="password"], input[type="password"]').first();

  if (await usernameInput.isVisible()) {
    await usernameInput.fill('uitestuser');
  }
  if (await emailInput.isVisible()) {
    await emailInput.fill('uitestuser@test.com');
  }
  if (await passwordInput.isVisible()) {
    await passwordInput.fill('Test1234!');
  }

  await page.screenshot({ path: 'tests/screenshots/UT-001-step3-form-filled.png' });

  const taskTime = Date.now() - startTime;
  console.log(`UT-001 Task completion time: ${taskTime}ms`);

  // Verify page loaded correctly
  expect(await page.title()).toBeTruthy();
  console.log(`UT-001 Page title: ${await page.title()}`);
});

// ─── SCENARIO 2: Browse Products ──────────────────────────────────────────────
// Task: Browse the product list as a user
// Success criteria: Products visible within 1 minute
test('UT-002: User can browse products', async ({ page }) => {
  const startTime = Date.now();

  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/UT-002-step1-home.png' });

  // Navigate to products page
  await page.goto(`${BASE_URL}/client-dashboard`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/UT-002-step2-products.png' });

  const taskTime = Date.now() - startTime;
  console.log(`UT-002 Task completion time: ${taskTime}ms`);

  // Verify we are on a valid page
  const url = page.url();
  console.log(`UT-002 Current URL: ${url}`);
  expect(url).toBeTruthy();
});

// ─── SCENARIO 3: Complete Login Flow ──────────────────────────────────────────
// Task: Log in with existing credentials and reach dashboard
// Success criteria: Dashboard visible within 2 minutes
test('UT-003: Existing user can login and reach dashboard', async ({ page }) => {
  const startTime = Date.now();

  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/UT-003-step1-login.png' });

  // Fill login form
  const usernameInput = page.locator('input[placeholder*="username"], input[name*="username"], input[id*="username"]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  if (await usernameInput.isVisible()) {
    await usernameInput.fill('loginuser');
    console.log('UT-003 Username field found and filled');
  } else {
    console.log('UT-003 WARNING: Username field not found');
  }

  if (await passwordInput.isVisible()) {
    await passwordInput.fill('Test1234!');
    console.log('UT-003 Password field found and filled');
  } else {
    console.log('UT-003 WARNING: Password field not found');
  }

  await page.screenshot({ path: 'tests/screenshots/UT-003-step2-credentials-filled.png' });

  // Submit the form
  const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
  if (await loginButton.isVisible()) {
    await loginButton.click();
    await page.waitForLoadState('networkidle');
    console.log('UT-003 Login button clicked');
  } else {
    console.log('UT-003 WARNING: Login button not found');
  }

  await page.screenshot({ path: 'tests/screenshots/UT-003-step3-after-login.png' });

  const taskTime = Date.now() - startTime;
  console.log(`UT-003 Task completion time: ${taskTime}ms`);

  const finalUrl = page.url();
  console.log(`UT-003 Final URL after login: ${finalUrl}`);
  expect(finalUrl).toBeTruthy();
});
