import request from 'supertest';
import app from '../../app.js';
import { pool } from '../../infrastructure/dbc.js';

let createdSupplierId = null;

// Clean up any leftover test data before and after all tests
beforeAll(async () => {
    await pool.execute('DELETE FROM supplier WHERE name = ?', ['Test Supplier']);
});

afterAll(async () => {
    await pool.execute('DELETE FROM supplier WHERE name = ?', ['Test Supplier']);
    await pool.execute('DELETE FROM supplier WHERE name = ?', ['Updated Supplier']);
    await pool.end();
});

// ─── FUNCTIONAL TEST: Get All Suppliers ───────────────────────────────────────
// TC-FUNC-022
describe('Get All Suppliers', () => {

    // TC-FUNC-022: Normal use case — fetch all suppliers
    test('TC-FUNC-022: should return all suppliers successfully', async () => {
        const response = await request(app)
            .get('/Supplier/');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

});

// ─── FUNCTIONAL TEST: Create Supplier ─────────────────────────────────────────
// TC-FUNC-023 to TC-FUNC-024
describe('Create Supplier', () => {

    // TC-FUNC-023: Normal use case — valid supplier creation
    test('TC-FUNC-023: should create a new supplier successfully', async () => {
        const response = await request(app)
            .post('/Supplier/')
            .send({
                name: 'Test Supplier',
                contact: 'test@supplier.com'
            });

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();

        // Save created supplier id for later tests
        createdSupplierId = response.body.id;
    });

    // TC-FUNC-024: Duplicate detection — same supplier name
    test('TC-FUNC-024: should reject supplier with duplicate name', async () => {
        const response = await request(app)
            .post('/Supplier/')
            .send({
                name: 'Test Supplier',
                contact: 'other@supplier.com'
            });

        expect(response.status).toBe(409);
    });

});

// ─── FUNCTIONAL TEST: Get Supplier By ID ──────────────────────────────────────
// TC-FUNC-025 to TC-FUNC-026
describe('Get Supplier By ID', () => {

    // TC-FUNC-025: Normal use case — fetch existing supplier
    test('TC-FUNC-025: should return supplier when valid id is provided', async () => {
        if (!createdSupplierId) return;

        const response = await request(app)
            .get(`/Supplier/${createdSupplierId}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
    });

    // TC-FUNC-026: Edge case — non-existent supplier id returns null gracefully
    test('TC-FUNC-026: should return null for non-existent supplier id', async () => {
        const response = await request(app)
            .get('/Supplier/999999');

        expect(response.status).toBe(200);
        expect(response.body).toBeNull();
    });

});

// ─── FUNCTIONAL TEST: Update Supplier ─────────────────────────────────────────
// TC-FUNC-027
describe('Update Supplier', () => {

    // TC-FUNC-027: Normal use case — update existing supplier
    test('TC-FUNC-027: should update supplier successfully', async () => {
        if (!createdSupplierId) return;

        const response = await request(app)
            .put('/Supplier/')
            .send({
                id: createdSupplierId,
                name: 'Updated Supplier',
                contact: 'updated@supplier.com'
            });

        expect(response.status).toBe(200);
    });

});

// ─── FUNCTIONAL TEST: Delete Supplier ─────────────────────────────────────────
// TC-FUNC-028
describe('Delete Supplier', () => {

    // TC-FUNC-028: Normal use case — delete existing supplier
    test('TC-FUNC-028: should delete supplier successfully', async () => {
        if (!createdSupplierId) return;

        const response = await request(app)
            .delete(`/Supplier/${createdSupplierId}`);

        expect(response.status).toBe(200);
    });

});