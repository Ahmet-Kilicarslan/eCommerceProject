import request from 'supertest';
import app from '../../app.js';
import { pool } from '../../infrastructure/dbc.js';

let createdProductId = null;

// Runs before all tests — cleans up any leftover test products
beforeAll(async () => {
    await pool.execute('DELETE FROM products WHERE name = ?', ['Test Product']);
});

// Runs after all tests — cleans up and closes db connection
afterAll(async () => {
    await pool.execute('DELETE FROM products WHERE name = ?', ['Test Product']);
    await pool.execute('DELETE FROM products WHERE name = ?', ['Updated Product']);
    await pool.end();
});

// ─── FUNCTIONAL TEST: Get All Products ────────────────────────────────────────
// TC-FUNC-014
describe('Get All Products', () => {

    // TC-FUNC-014: Normal use case — fetch all products
    test('TC-FUNC-014: should return all products successfully', async () => {
        const response = await request(app)
            .get('/Product/');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

});

// ─── FUNCTIONAL TEST: Get All Products With Details ───────────────────────────
// TC-FUNC-015
describe('Get All Products With Details', () => {

    // TC-FUNC-015: Normal use case — fetch products with joined details
    test('TC-FUNC-015: should return all products with details', async () => {
        const response = await request(app)
            .get('/Product/getALL');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

});

// ─── FUNCTIONAL TEST: Create Product ──────────────────────────────────────────
// TC-FUNC-016 to TC-FUNC-018
describe('Create Product', () => {

    // TC-FUNC-016: Normal use case — valid product creation
    test('TC-FUNC-016: should create a new product successfully', async () => {
        const response = await request(app)
            .post('/Product/')
            .send({
                name: 'Test Product',
                amount: 10,
                price: 99.99,
                supplier: 1
            });

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();

        // Save the created product id for later tests
        createdProductId = response.body.id || response.body.insertId;
    });

    // TC-FUNC-017: Duplicate detection — same product name
    test('TC-FUNC-017: should reject product with duplicate name', async () => {
        const response = await request(app)
            .post('/Product/')
            .send({
                name: 'Test Product',
                amount: 5,
                price: 49.99,
                supplier: 1
            });

        expect(response.status).toBe(409);
    });

});

// ─── FUNCTIONAL TEST: Get Product By ID ───────────────────────────────────────
// TC-FUNC-018 to TC-FUNC-019
describe('Get Product By ID', () => {

    // TC-FUNC-018: Normal use case — fetch existing product
    test('TC-FUNC-018: should return product when valid id is provided', async () => {

        // Skip if product was not created
        if (!createdProductId) return;

        const response = await request(app)
            .get(`/Product/getByProductId/${createdProductId}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
    });

    // TC-FUNC-019: Error handling — non-existent product id
    test('TC-FUNC-019: should return 404 for non-existent product id', async () => {
        const response = await request(app)
            .get('/Product/getByProductId/999999');

        expect(response.status).toBe(404);
    });

});

// ─── FUNCTIONAL TEST: Update Product Amount ───────────────────────────────────
// TC-FUNC-020
describe('Update Product Amount', () => {

    // TC-FUNC-020: Normal use case — decrease product amount
    test('TC-FUNC-020: should update product amount successfully', async () => {

        // Skip if product was not created
        if (!createdProductId) return;

        const response = await request(app)
            .put(`/Product/decreaseAmount/${createdProductId}`)
            .send({ amount: 5 });

        expect(response.status).toBe(200);
    });

});

// ─── FUNCTIONAL TEST: Delete Product ──────────────────────────────────────────
// TC-FUNC-021
describe('Delete Product', () => {

    // TC-FUNC-021: Normal use case — delete existing product
    test('TC-FUNC-021: should delete product successfully', async () => {

        // Skip if product was not created
        if (!createdProductId) return;

        const response = await request(app)
            .delete(`/Product/${createdProductId}`);

        expect(response.status).toBe(200);
    });

});