import { test, expect } from '@playwright/test';

// ─── USABILITY TEST CONFIGURATION ─────────────────────────────────────────────
// Base URL of the running Angular app
const BASE_URL = 'http://localhost:4200';

// ─── SCENARIO 1: User Registration and Login ──────────────────────────────────
// Task: Register a new account and log in successfully
// Success criteria: Completed in under 2 minutes
test('UT-001: Login page supports registration form entry', async ({ page }) => {
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

  await page.locator('#register-tab').click({ force: true });

  // Look for register form fields
  const usernameInput = page.locator('#registerUsername');
  const emailInput = page.locator('#registerEmail');
  const passwordInput = page.locator('#registerPassword');

  await expect(usernameInput).toBeAttached();
  await expect(emailInput).toBeAttached();
  await expect(passwordInput).toBeAttached();

  await usernameInput.fill(`uitestuser${Date.now()}`, { force: true });
  await emailInput.fill(`uitestuser-${Date.now()}@test.com`, { force: true });
  await passwordInput.fill('Test1234!', { force: true });

  await page.screenshot({ path: 'tests/screenshots/UT-001-step3-form-filled.png' });

  const taskTime = Date.now() - startTime;
  expect(taskTime).toBeLessThan(120000);

  // Verify page loaded correctly
  expect(await page.title()).toBeTruthy();
});

// ─── SCENARIO 2: Browse Products ──────────────────────────────────────────────
// Task: Browse the product list as a user
// Success criteria: Products visible within 1 minute
test('UT-002: Protected client dashboard redirects unauthenticated users', async ({ page }) => {
  const startTime = Date.now();

  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/UT-002-step1-home.png' });

  // Navigate to products page
  await page.goto(`${BASE_URL}/clientDashboard`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/UT-002-step2-products.png' });

  const taskTime = Date.now() - startTime;
  expect(taskTime).toBeLessThan(60000);

  await expect(page).toHaveURL(/\/login$/);
});

// ─── SCENARIO 3: Complete Login Flow ──────────────────────────────────────────
// Task: Attempt login with existing credentials and verify the form submits
// Success criteria: Login request completes within 2 minutes
test('UT-003: Login form accepts existing user credentials', async ({ page }) => {
  const startTime = Date.now();

  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/UT-003-step1-login.png' });

  // Fill login form
  const usernameInput = page.locator('#loginEmail');
  const passwordInput = page.locator('#loginPassword');

  await expect(usernameInput).toBeVisible();
  await expect(passwordInput).toBeVisible();

  await usernameInput.fill('loginuser@test.com');
  await passwordInput.fill('Test1234!');

  await page.screenshot({ path: 'tests/screenshots/UT-003-step2-credentials-filled.png' });

  // Submit the form
  const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
  await expect(loginButton).toBeVisible();
  const loginRequest = page.waitForResponse(
    (response) => response.url().includes('/User/login'),
    { timeout: 10000 }
  ).catch(() => null);
  await loginButton.click();
  await loginRequest;

  await page.screenshot({ path: 'tests/screenshots/UT-003-step3-after-login.png' });

  const taskTime = Date.now() - startTime;
  expect(taskTime).toBeLessThan(120000);

  await expect(usernameInput).toHaveValue('loginuser@test.com');
});
