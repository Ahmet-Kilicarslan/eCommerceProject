import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000';

export const options = {
    vus: 1,
    iterations: 1,
};

function logSecurityResult(id, description, response, passed) {
    const outcome = passed ? 'PASS' : 'FAIL';
    const bodyPreview = response.body ? ` - ${response.body.slice(0, 180)}` : '';
    console.log(`${outcome} ${id}: ${description}. Status ${response.status}${bodyPreview}`);
}

export default function () {
    const uniqueSuffix = `${Date.now()}-${__VU}-${__ITER}`;

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
    const st001Passed = sqlInjectionLogin.status !== 200;
    check(sqlInjectionLogin, {
        'ST-001 SQL injection on login is rejected': (r) =>
            r.status !== 200,
    });
    logSecurityResult('ST-001', 'SQL injection login rejected as expected', sqlInjectionLogin, st001Passed);

    sleep(0.5);

    // ── ST-002: SQL Injection on Product ID ──────────────────────────────────
    // Attack vector: inject SQL into URL parameter
    // Expected: app returns error, not database contents
    const sqlInjectionProduct = http.get(
        `${BASE_URL}/Product/getByProductId/1' OR '1'='1`
    );
    const st002Passed = sqlInjectionProduct.status !== 200 || !sqlInjectionProduct.body.includes('OR');
    check(sqlInjectionProduct, {
        'ST-002 SQL injection on product ID is rejected': (r) =>
            r.status !== 200 || !r.body.includes('OR'),
    });
    logSecurityResult('ST-002', 'SQL injection product lookup rejected as expected', sqlInjectionProduct, st002Passed);

    sleep(0.5);

    // ── ST-003: XSS in Registration ──────────────────────────────────────────
    // Attack vector: inject script tag into username field
    // Expected: app sanitizes or rejects the input
    const xssRegistration = http.post(
        `${BASE_URL}/User/register`,
        JSON.stringify({
            username: '<script>alert("xss")</script>',
            email: `xss-${uniqueSuffix}@test.com`,
            password: 'Test1234!'
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    const st003Passed = xssRegistration.status >= 400 ||
        (xssRegistration.status === 201 && !xssRegistration.body.includes('<script>'));
    check(xssRegistration, {
        'ST-003 XSS payload in username is handled': (r) =>
            r.status >= 400 || (r.status === 201 && !r.body.includes('<script>')),
    });
    logSecurityResult('ST-003', 'XSS registration payload rejected as expected', xssRegistration, st003Passed);

    sleep(0.5);

    // ── ST-004: Access Protected Route Without Auth ──────────────────────────
    // Attack vector: access /User/profile without session cookie
    // Expected: 401 Unauthorized
    const unauthProfile = http.get(`${BASE_URL}/User/profile`);
    const st004Passed = unauthProfile.status === 401;
    check(unauthProfile, {
        'ST-004 protected route rejects unauthenticated request': (r) =>
            r.status === 401,
    });
    logSecurityResult('ST-004', 'profile without login returned 401 as expected', unauthProfile, st004Passed);

    sleep(0.5);

    // ── ST-005: Mass Assignment on Registration ──────────────────────────────
    // Attack vector: try to register with role: 'admin'
    // Expected: role is ignored, user gets default role
    const massAssignment = http.post(
        `${BASE_URL}/User/register`,
        JSON.stringify({
            username: `hackerman${uniqueSuffix}`,
            email: `hackerman-${uniqueSuffix}@test.com`,
            password: 'Test1234!',
            role: 'admin'
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    let st005Passed = true;
    if (massAssignment.status === 201) {
        const body = JSON.parse(massAssignment.body);
        st005Passed = body.user?.role !== 'admin';
    }
    check(massAssignment, {
        'ST-005 mass assignment does not grant admin role': (r) => {
            if (r.status === 201) {
                const body = JSON.parse(r.body);
                return body.user?.role !== 'admin';
            }
            return true;
        },
    });
    logSecurityResult('ST-005', 'role admin was not granted during public registration', massAssignment, st005Passed);

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
    const st006Passed = oversizedRequest.status !== 0;
    check(oversizedRequest, {
        'ST-006 oversized payload does not crash server': (r) =>
            r.status !== 0,
    });
    logSecurityResult('ST-006', 'oversized login payload did not crash the server', oversizedRequest, st006Passed);

    sleep(0.5);

    // ── ST-007: Access Admin Data Without Auth ───────────────────────────────
    // Attack vector: fetch all users without being logged in
    // Expected: should require authentication
    const allUsers = http.get(`${BASE_URL}/User/users`);
    const st007Passed = allUsers.status === 401;
    check(allUsers, {
        'ST-007 user list requires authentication': (r) =>
            r.status === 401,
    });
    logSecurityResult('ST-007', 'user list without login returned 401 as expected', allUsers, st007Passed);

    sleep(0.5);

    // ── ST-011: Authenticated Profile Access ────────────────────────────────
    // Security/session check: login should create a usable session cookie
    // Expected: authenticated client can access /User/profile
    const profileUser = {
        username: `profileuser${uniqueSuffix}`,
        email: `profileuser-${uniqueSuffix}@test.com`,
        password: 'Test1234!'
    };

    const profileRegister = http.post(
        `${BASE_URL}/User/register`,
        JSON.stringify(profileUser),
        { headers: { 'Content-Type': 'application/json' } }
    );

    const profileLogin = http.post(
        `${BASE_URL}/User/login`,
        JSON.stringify({
            username: profileUser.username,
            password: profileUser.password
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    const authenticatedProfile = http.get(`${BASE_URL}/User/profile`);
    const st011Passed = profileRegister.status === 201 &&
        profileLogin.status === 200 &&
        authenticatedProfile.status === 200 &&
        authenticatedProfile.body.includes(profileUser.username);

    check(authenticatedProfile, {
        'ST-011 authenticated user can access own profile': () => st011Passed,
    });
    logSecurityResult('ST-011', 'authenticated profile access returned the logged-in user as expected', authenticatedProfile, st011Passed);

}

function collectChecks(group, checks = []) {
    for (const checkResult of group.checks || []) {
        checks.push(checkResult);
    }

    for (const childGroup of group.groups || []) {
        collectChecks(childGroup, checks);
    }

    return checks;
}

export function handleSummary(data) {
    const checks = collectChecks(data.root_group);
    const checkLines = checks.map((checkResult) => {
        const passes = checkResult.passes || 0;
        const fails = checkResult.fails || 0;
        const total = passes + fails;
        const outcome = fails === 0 ? 'PASS' : 'FAIL';
        return `  ${outcome} ${checkResult.name}: ${passes}/${total} passed`;
    });

    return {
        stdout: [
            '',
            'Readable k6 security-test summary',
            '---------------------------------',
            ...checkLines,
            '',
        ].join('\n'),
    };
}
