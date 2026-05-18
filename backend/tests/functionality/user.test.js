import request from 'supertest';
import app from '../../app.js';
import { pool } from '../../infrastructure/dbc.js';

// Runs before all tests — cleans up any leftover test data
beforeAll(async () => {
    await pool.execute('DELETE FROM user WHERE email = ?', ['testuser@test.com']);
    await pool.execute('DELETE FROM user WHERE email = ?', ['loginuser@test.com']);
    await pool.execute('DELETE FROM user WHERE email = ?', ['profileuser@test.com']);
});

// Runs after all tests — cleans up and closes db connection
afterAll(async () => {
    await pool.execute('DELETE FROM user WHERE email = ?', ['testuser@test.com']);
    await pool.execute('DELETE FROM user WHERE email = ?', ['loginuser@test.com']);
    await pool.execute('DELETE FROM user WHERE email = ?', ['profileuser@test.com']);
    await pool.end();
});

// ─── FUNCTIONAL TEST: User Registration ───────────────────────────────────────
// TC-FUNC-001 to TC-FUNC-005
describe('User Registration', () => {

    // TC-FUNC-001: Normal use case — valid registration
    test('TC-FUNC-001: should register a new user successfully', async () => {
        const response = await request(app)
            .post('/User/register')
            .send({
                username: 'testuser',
                email: 'testuser@test.com',
                password: 'Test1234!'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User registered successfully');
    });

    // TC-FUNC-002: Error handling — missing email
    test('TC-FUNC-002: should reject registration with missing email', async () => {
        const response = await request(app)
            .post('/User/register')
            .send({
                username: 'testuser',
                password: 'Test1234!'
            });

        expect(response.status).toBe(400);
    });

    // TC-FUNC-003: Error handling — missing password
    test('TC-FUNC-003: should reject registration with missing password', async () => {
        const response = await request(app)
            .post('/User/register')
            .send({
                username: 'testuser',
                email: 'testuser@test.com'
            });

        expect(response.status).toBe(400);
    });

    // TC-FUNC-004: Error handling — missing username
    test('TC-FUNC-004: should reject registration with missing username', async () => {
        const response = await request(app)
            .post('/User/register')
            .send({
                email: 'testuser@test.com',
                password: 'Test1234!'
            });

        expect(response.status).toBe(400);
    });

    // TC-FUNC-005: Duplicate detection — same email
    test('TC-FUNC-005: should reject registration with duplicate email', async () => {
        const response = await request(app)
            .post('/User/register')
            .send({
                username: 'testuser',
                email: 'testuser@test.com',
                password: 'Test1234!'
            });

        expect(response.status).toBe(409);
    });

    // TC-FUNC-006: Boundary — username too short (less than 3 characters)
    test('TC-FUNC-006: should reject username shorter than 3 characters', async () => {
        const response = await request(app)
            .post('/User/register')
            .send({
                username: 'ab',
                email: 'short@test.com',
                password: 'Test1234!'
            });

        expect(response.status).toBe(400);
    });

    // TC-FUNC-007: Boundary — password too short (less than 6 characters)
    test('TC-FUNC-007: should reject password shorter than 6 characters', async () => {
        const response = await request(app)
            .post('/User/register')
            .send({
                username: 'validuser',
                email: 'valid@test.com',
                password: '123'
            });

        expect(response.status).toBe(400);
    });

    // TC-FUNC-008: Error handling — invalid email format
    test('TC-FUNC-008: should reject invalid email format', async () => {
        const response = await request(app)
            .post('/User/register')
            .send({
                username: 'validuser',
                email: 'notanemail',
                password: 'Test1234!'
            });

        expect(response.status).toBe(400);
    });

});

// ─── FUNCTIONAL TEST: User Login ──────────────────────────────────────────────
// TC-FUNC-009 to TC-FUNC-012
describe('User Login', () => {

    // Create a user to log in with before these tests run
    beforeAll(async () => {
        await request(app)
            .post('/User/register')
            .send({
                username: 'loginuser',
                email: 'loginuser@test.com',
                password: 'Test1234!'
            });
    });

    // TC-FUNC-009: Normal use case — valid login
    test('TC-FUNC-009: should login successfully with correct credentials', async () => {
        const response = await request(app)
            .post('/User/login')
            .send({
                username: 'loginuser',
                password: 'Test1234!'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
    });

    // TC-FUNC-010: Error handling — wrong password
    test('TC-FUNC-010: should reject login with wrong password', async () => {
        const response = await request(app)
            .post('/User/login')
            .send({
                username: 'loginuser',
                password: 'WrongPassword!'
            });

        expect(response.status).toBe(401);
    });

    // TC-FUNC-011: Error handling — non-existent username
    test('TC-FUNC-011: should reject login with non-existent username', async () => {
        const response = await request(app)
            .post('/User/login')
            .send({
                username: 'ghostuser',
                password: 'Test1234!'
            });

        expect(response.status).toBe(401);
    });

    // TC-FUNC-012: Error handling — missing credentials
    test('TC-FUNC-012: should reject login with missing credentials', async () => {
        const response = await request(app)
            .post('/User/login')
            .send({});

        expect(response.status).toBe(400);
    });

});

// ─── FUNCTIONAL TEST: Auth Status ─────────────────────────────────────────────
// TC-FUNC-013
describe('Auth Status', () => {

    // TC-FUNC-013: Normal use case — check status without session
    test('TC-FUNC-013: should return not authenticated when no session exists', async () => {
        const response = await request(app)
            .get('/User/status');

        expect(response.status).toBe(200);
        expect(response.body.isAuthenticated).toBe(false);
    });

});
