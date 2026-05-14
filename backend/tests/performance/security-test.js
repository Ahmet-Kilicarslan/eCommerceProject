import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000';

export const options = {
    vus: 1,
    iterations: 1,
};

export default function () {

    // ── ST-001: SQL Injection on Login ───────────────────────────────────────
    // Attack vector: inject SQL into username field
    // Expected: app rejects it, does not crash or return user data
    const sqlInjectionLogin = http.post(
        `${BASE_URL}/User/login`,
        JSON.stringify({
            username: "' OR '1'='1",
            password: "' OR '1'='1"
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    check(sqlInjectionLogin, {
        'ST-001 SQL injection on login is rejected': (r) =>
            r.status !== 200,
    });
    console.log(`ST-001 SQL Injection Login: ${sqlInjectionLogin.status} - ${sqlInjectionLogin.body}`);

    sleep(0.5);

    // ── ST-002: SQL Injection on Product ID ──────────────────────────────────
    // Attack vector: inject SQL into URL parameter
    // Expected: app returns error, not database contents
    const sqlInjectionProduct = http.get(
        `${BASE_URL}/Product/getByProductId/1' OR '1'='1`
    );
    check(sqlInjectionProduct, {
        'ST-002 SQL injection on product ID is rejected': (r) =>
            r.status !== 200 || !r.body.includes('OR'),
    });
    console.log(`ST-002 SQL Injection Product: ${sqlInjectionProduct.status}`);

    sleep(0.5);

    // ── ST-003: XSS in Registration ──────────────────────────────────────────
    // Attack vector: inject script tag into username field
    // Expected: app sanitizes or rejects the input
    const xssRegistration = http.post(
        `${BASE_URL}/User/register`,
        JSON.stringify({
            username: '<script>alert("xss")</script>',
            email: 'xss@test.com',
            password: 'Test1234!'
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    check(xssRegistration, {
        'ST-003 XSS payload in username is handled': (r) =>
            r.status !== 200,
    });
    console.log(`ST-003 XSS Registration: ${xssRegistration.status} - ${xssRegistration.body}`);

    sleep(0.5);

    // ── ST-004: Access Protected Route Without Auth ──────────────────────────
    // Attack vector: access /User/profile without session cookie
    // Expected: 401 Unauthorized
    const unauthProfile = http.get(`${BASE_URL}/User/profile`);
    check(unauthProfile, {
        'ST-004 protected route rejects unauthenticated request': (r) =>
            r.status === 401,
    });
    console.log(`ST-004 Unauth Profile Access: ${unauthProfile.status} - ${unauthProfile.body}`);

    sleep(0.5);

    // ── ST-005: Mass Assignment on Registration ──────────────────────────────
    // Attack vector: try to register with role: 'admin'
    // Expected: role is ignored, user gets default role
    const massAssignment = http.post(
        `${BASE_URL}/User/register`,
        JSON.stringify({
            username: 'hackerman',
            email: 'hackerman@test.com',
            password: 'Test1234!',
            role: 'admin'
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    check(massAssignment, {
        'ST-005 mass assignment does not grant admin role': (r) => {
            if (r.status === 201) {
                const body = JSON.parse(r.body);
                return body.user?.role !== 'admin';
            }
            return true;
        },
    });
    console.log(`ST-005 Mass Assignment: ${massAssignment.status} - ${massAssignment.body}`);

    sleep(0.5);

    // ── ST-006: Oversized Payload ────────────────────────────────────────────
    // Attack vector: send extremely large input to crash the server
    // Expected: server handles it gracefully, does not crash
    const largePayload = 'A'.repeat(100000);
    const oversizedRequest = http.post(
        `${BASE_URL}/User/login`,
        JSON.stringify({
            username: largePayload,
            password: largePayload
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    check(oversizedRequest, {
        'ST-006 oversized payload does not crash server': (r) =>
            r.status !== 0,
    });
    console.log(`ST-006 Oversized Payload: ${oversizedRequest.status}`);

    sleep(0.5);

    // ── ST-007: Access Admin Data Without Auth ───────────────────────────────
    // Attack vector: fetch all users without being logged in
    // Expected: should require authentication
    const allUsers = http.get(`${BASE_URL}/User/users`);
    check(allUsers, {
        'ST-007 user list requires authentication': (r) =>
            r.status === 401,
    });
    console.log(`ST-007 Unauth User List: ${allUsers.status} - ${allUsers.body}`);

}