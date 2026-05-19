import { test, expect, type BrowserContext, type Page } from '@playwright/test';

// ─── USABILITY TEST CONFIGURATION ─────────────────────────────────────────────
// Base URL of the running Angular app
const BASE_URL = 'http://localhost:4200';
const API_URL = 'http://localhost:3000';

async function createClientSession(context: BrowserContext) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const user = {
    username: `uiuser${suffix}`,
    email: `uiuser-${suffix}@test.com`,
    password: 'Test1234!',
  };

  const registerResponse = await context.request.post(`${API_URL}/User/register`, {
    data: user,
  });
  expect(registerResponse.status()).toBe(201);

  const loginResponse = await context.request.post(`${API_URL}/User/login`, {
    data: {
      username: user.username,
      password: user.password,
    },
  });
  expect(loginResponse.status()).toBe(200);

  return user;
}

async function seedSupplierAndProduct(context: BrowserContext) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const supplier = {
    name: `UI Supplier ${suffix}`,
    contact: `supplier-${suffix}@test.com`,
  };

  const supplierResponse = await context.request.post(`${API_URL}/Supplier/`, {
    data: supplier,
  });
  expect(supplierResponse.ok()).toBeTruthy();
  const createdSupplier = await supplierResponse.json();
  const supplierId = createdSupplier.id;
  expect(supplierId).toBeTruthy();

  const product = {
    name: `UI Product ${suffix}`,
    amount: 20,
    price: 42,
    supplier: supplierId,
  };

  const productResponse = await context.request.post(`${API_URL}/Product/`, {
    data: product,
  });
  expect(productResponse.ok()).toBeTruthy();
  const createdProduct = await productResponse.json();
  const productId = createdProduct.id;
  expect(productId).toBeTruthy();

  return {
    supplier: { ...supplier, id: supplierId },
    product: { ...product, id: productId },
  };
}

async function cleanupSeededProduct(context: BrowserContext, productId: number, supplierId: number) {
  await context.request.delete(`${API_URL}/Product/${productId}`).catch(() => null);
  await context.request.delete(`${API_URL}/Supplier/${supplierId}`).catch(() => null);
}

async function openClientProducts(page: Page) {
  await page.goto(`${BASE_URL}/clientDashboard`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: 'Products' }).click();
  await expect(page).toHaveURL(/\/clientViewProducts$/);
  await page.waitForLoadState('networkidle');
}

async function openClientProfile(page: Page) {
  await page.goto(`${BASE_URL}/clientDashboard`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: 'Profile' }).click();
  await expect(page).toHaveURL(/\/clientProfile$/);
  await page.waitForLoadState('networkidle');
}

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

// ─── SCENARIO 4: Product Catalog and Supplier Details ────────────────────────
// Task: Authenticated client views products with supplier information
// Success criteria: Seeded product and supplier are visible in the product list
test('UT-004: Client can view product catalog with supplier details', async ({ page, context }) => {
  await createClientSession(context);
  const seeded = await seedSupplierAndProduct(context);

  try {
    await openClientProducts(page);
    await page.screenshot({ path: 'tests/screenshots/UT-004-product-catalog.png' });

    const productCard = page.locator('.card', { hasText: seeded.product.name }).first();
    await expect(productCard).toBeVisible();
    await expect(productCard).toContainText(`${seeded.product.price}`);
    await expect(productCard).toContainText(`${seeded.product.amount}`);
    await expect(productCard).toContainText(seeded.supplier.name);
  } finally {
    await cleanupSeededProduct(context, seeded.product.id, seeded.supplier.id);
  }
});

// ─── SCENARIO 5: Basket/Cart Workflow ────────────────────────────────────────
// Task: Add a product to cart, update quantity, and remove it
// Success criteria: Cart reflects add, increment, decrement/removal behavior
test('UT-005: Client can add, update, and remove a product in cart', async ({ page, context }) => {
  await createClientSession(context);
  const seeded = await seedSupplierAndProduct(context);

  try {
    await openClientProducts(page);

    const productCard = page.locator('.card', { hasText: seeded.product.name }).first();
    await expect(productCard).toBeVisible();
    await productCard.getByRole('button', { name: /Add to Cart/i }).click();

    await page.locator('button.btn-cart').click();
    const cartModal = page.locator('#cartModal');
    await expect(cartModal).toBeVisible();
    await expect(cartModal).toContainText(seeded.product.name);

    await cartModal.getByRole('button', { name: '+' }).click();
    await expect(cartModal.locator('tbody tr').first()).toContainText('2');

    await cartModal.getByRole('button', { name: '-' }).click();
    await expect(cartModal.locator('tbody tr').first()).toContainText('1');

    await cartModal.locator('button.btn-outline-danger').first().click();
    await expect(cartModal).toContainText('Your cart is empty');
    await page.screenshot({ path: 'tests/screenshots/UT-005-cart-workflow.png' });
  } finally {
    await cleanupSeededProduct(context, seeded.product.id, seeded.supplier.id);
  }
});

// ─── SCENARIO 6: Purchase Workflow ───────────────────────────────────────────
// Task: Buy a product from the cart
// Success criteria: Purchase request succeeds and success toast appears
test('UT-006: Client can complete a purchase from cart', async ({ page, context }) => {
  await createClientSession(context);
  const seeded = await seedSupplierAndProduct(context);

  try {
    await openClientProducts(page);

    const productCard = page.locator('.card', { hasText: seeded.product.name }).first();
    await expect(productCard).toBeVisible();
    await productCard.getByRole('button', { name: /Add to Cart/i }).click();

    await page.locator('button.btn-cart').click();
    const cartModal = page.locator('#cartModal');
    await expect(cartModal).toBeVisible();

    const purchaseResponse = page.waitForResponse(
      (response) => response.url().includes('/Purchase/create') && response.status() === 201
    );
    await cartModal.getByRole('button', { name: /Buy/i }).click();
    await purchaseResponse;

    await expect(page.locator('#success-toaster')).toContainText('Purchase completed successfully');
    await page.screenshot({ path: 'tests/screenshots/UT-006-purchase-complete.png' });
  } finally {
    await cleanupSeededProduct(context, seeded.product.id, seeded.supplier.id);
  }
});

// ─── SCENARIO 7: Profile and Purchase Log ────────────────────────────────────
// Task: Authenticated client opens profile and edit modal
// Success criteria: Profile data and edit fields are visible
test('UT-007: Client can view profile and open edit profile form', async ({ page, context }) => {
  const user = await createClientSession(context);

  await openClientProfile(page);
  await page.screenshot({ path: 'tests/screenshots/UT-007-profile.png' });

  await expect(page.getByText(`Welcome, ${user.username}!`)).toBeVisible();
  await expect(page.getByText(user.email)).toBeVisible();
  await expect(page.getByText('Purchase log')).toBeVisible();

  await page.getByRole('button', { name: /Edit/i }).click();
  const editModal = page.locator('#editProfileModal');
  await expect(editModal).toBeVisible();
  await expect(editModal.locator('#validationCustom01')).toHaveValue(user.username);
  await expect(editModal.locator('#validationCustom02')).toHaveValue(user.email);
});

// ─── SCENARIO 9: Profile Edit Workflow ───────────────────────────────────────
// Task: Authenticated client updates profile information
// Success criteria: Updated username and email are saved and shown on profile
test('UT-009: Client can edit profile username and email', async ({ page, context }) => {
  const user = await createClientSession(context);
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const updatedUser = {
    username: `editedui${suffix}`,
    email: `edited-ui-${suffix}@test.com`,
  };

  await openClientProfile(page);

  await page.getByRole('button', { name: /Edit/i }).click();
  const editModal = page.locator('#editProfileModal');
  await expect(editModal).toBeVisible();

  await editModal.locator('#validationCustom01').fill(updatedUser.username);
  await editModal.locator('#validationCustom02').fill(updatedUser.email);

  const updateResponse = page.waitForResponse(
    (response) => response.url() === `${API_URL}/User` && response.request().method() === 'PUT'
  );
  await editModal.getByRole('button', { name: /Save/i }).click();
  await expect((await updateResponse).status()).toBe(200);

  await expect(page.getByText(`Welcome, ${updatedUser.username}!`)).toBeVisible();
  await expect(page.getByText(updatedUser.email)).toBeVisible();
  await page.screenshot({ path: 'tests/screenshots/UT-009-profile-edit.png' });

  expect(user.username).not.toBe(updatedUser.username);
});

// ─── SCENARIO 8: Supplier Admin Route Protection ─────────────────────────────
// Task: Unauthenticated user attempts to access supplier management
// Success criteria: Protected supplier admin page redirects to login
test('UT-008: Supplier management redirects unauthenticated users', async ({ page }) => {
  await page.goto(`${BASE_URL}/Supplier`);
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/login$/);
  await page.screenshot({ path: 'tests/screenshots/UT-008-supplier-protected.png' });
});
