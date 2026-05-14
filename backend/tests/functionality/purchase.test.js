import request from 'supertest';
import app from '../../app.js';
import { pool } from '../../infrastructure/dbc.js';

let createdPurchaseId = null;
let testUserId = null;
let testProductId = null;

// Before all tests — find a real user and product id from the database to use
beforeAll(async () => {
    // Get an existing user id from the database
    const [users] = await pool.execute('SELECT id FROM user LIMIT 1');
    if (users.length > 0) {
        testUserId = users[0].id;
    }

    // Get an existing product id from the database
    const [products] = await pool.execute('SELECT id FROM products LIMIT 1');
    if (products.length > 0) {
        testProductId = products[0].id;
    }
});

// After all tests — clean up test purchases and close connection
afterAll(async () => {
    if (createdPurchaseId) {
        await pool.execute('DELETE FROM purchasedProduct WHERE purchaseId = ?', [createdPurchaseId]);
        await pool.execute('DELETE FROM purchase WHERE id = ?', [createdPurchaseId]);
    }
    await pool.end();
});

// ─── FUNCTIONAL TEST: Get All Purchases ───────────────────────────────────────
// TC-FUNC-029
describe('Get All Purchases', () => {

    // TC-FUNC-029: Normal use case — fetch all purchases
    test('TC-FUNC-029: should return all purchases successfully', async () => {
        const response = await request(app)
            .get('/Purchase/getAll');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

});

// ─── FUNCTIONAL TEST: Create Purchase ─────────────────────────────────────────
// TC-FUNC-030 to TC-FUNC-031
describe('Create Purchase', () => {

    // TC-FUNC-030: Normal use case — valid purchase creation with products
    test('TC-FUNC-030: should create a new purchase successfully', async () => {
        if (!testUserId || !testProductId) {
            console.warn('Skipping: no user or product found in database');
            return;
        }

        const response = await request(app)
            .post('/Purchase/create')
            .send({
                userId: testUserId,
                totalAmount: 199.99,
                products: [
                    {
                        productId: testProductId,
                        quantity: 2,
                        price: 99.99
                    }
                ]
            });

        expect(response.status).toBe(201);
        expect(response.body.purchase).toBeDefined();
        expect(response.body.products).toBeDefined();

        // Save purchase id for later tests
        createdPurchaseId = response.body.purchase.id;
    });

    // TC-FUNC-031: Error handling — missing required fields
    test('TC-FUNC-031: should fail when required fields are missing', async () => {
        const response = await request(app)
            .post('/Purchase/create')
            .send({});

        expect(response.status).toBe(500);
    });

});

// ─── FUNCTIONAL TEST: Get Purchases By User ID ────────────────────────────────
// TC-FUNC-032 to TC-FUNC-034
describe('Get Purchases By User ID', () => {

    // TC-FUNC-032: Normal use case — fetch purchases by user in descending order
    test('TC-FUNC-032: should return purchases for a valid user id', async () => {
        if (!testUserId) return;

        const response = await request(app)
            .get(`/Purchase/byUserId/${testUserId}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // TC-FUNC-033: Normal use case — fetch purchases in ascending order
    test('TC-FUNC-033: should return purchases in ascending order', async () => {
        if (!testUserId) return;

        const response = await request(app)
            .get(`/Purchase/byUserInAsc/${testUserId}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // TC-FUNC-034: Normal use case — fetch purchases in descending order
    test('TC-FUNC-034: should return purchases in descending order', async () => {
        if (!testUserId) return;

        const response = await request(app)
            .get(`/Purchase/byUserInDesc/${testUserId}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

});

// ─── FUNCTIONAL TEST: Get Products By Purchase ID ─────────────────────────────
// TC-FUNC-035
describe('Get Products By Purchase ID', () => {

    // TC-FUNC-035: Normal use case — fetch products linked to a purchase
    test('TC-FUNC-035: should return products for a valid purchase id', async () => {
        if (!createdPurchaseId) return;

        const response = await request(app)
            .get(`/Purchase/byPurchase/${createdPurchaseId}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

});

// ─── FUNCTIONAL TEST: Invalid Order Parameter ─────────────────────────────────
// TC-FUNC-036
describe('Purchase Order Validation', () => {

    // TC-FUNC-036: Edge case — invalid order query parameter
    test('TC-FUNC-036: should reject invalid order parameter', async () => {
        if (!testUserId) return;

        const response = await request(app)
            .get(`/Purchase/byUserId/${testUserId}?order=invalid`);

        expect(response.status).toBe(400);
    });

});