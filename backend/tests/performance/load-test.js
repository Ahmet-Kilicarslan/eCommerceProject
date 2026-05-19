import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics
const responseTime = new Trend('response_time');
const httpErrorRate = new Rate('http_error_rate');
const slowResponseRate = new Rate('slow_response_rate');

// Test configuration — three stages
export const options = {
    stages: [
        // Stage 1: Response time — normal load, 5 virtual users for 30 seconds
        { duration: '30s', target: 5 },
        // Stage 2: Load test — ramp up to 20 virtual users over 1 minute
        { duration: '1m', target: 20 },
        // Stage 3: Stress test — push to 50 virtual users for 30 seconds
        { duration: '30s', target: 50 },
        // Stage 4: Recovery — ramp down to 0
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        // 95% of requests must complete within 500ms
        http_req_duration: ['p(95)<500'],
        // HTTP errors must stay below 10%
        http_error_rate: ['rate<0.1'],
    },
};

const BASE_URL = 'http://localhost:3000';

export function setup() {
    const uniqueSuffix = `${Date.now()}`;
    const loginUser = {
        username: `loaduser${uniqueSuffix}`,
        email: `loaduser-${uniqueSuffix}@test.com`,
        password: 'Test1234!'
    };

    const registrationRes = http.post(
        `${BASE_URL}/User/register`,
        JSON.stringify(loginUser),
        { headers: { 'Content-Type': 'application/json' } }
    );

    if (registrationRes.status !== 201) {
        console.log(`PT-SETUP WARNING: login test user was not created. Status ${registrationRes.status} - ${registrationRes.body}`);
    }

    return { loginUser };
}

function recordResult(response, expectedStatus, maxDurationMs) {
    responseTime.add(response.timings.duration);
    httpErrorRate.add(response.status !== expectedStatus);
    slowResponseRate.add(response.timings.duration >= maxDurationMs);
}

export default function (data) {

    // ── Test 1: GET /User/status ─────────────────────────────────────────────
    // Normal use case — check auth status
    const statusRes = http.get(`${BASE_URL}/User/status`);
    recordResult(statusRes, 200, 200);

    check(statusRes, {
        'PT-001 auth status returns 200 as expected': (r) => r.status === 200,
        'PT-001 auth status responds under 200ms': (r) => r.timings.duration < 200,
    });

    sleep(0.5);

    // ── Test 2: GET /Product/ ────────────────────────────────────────────────
    // Load test — fetch all products repeatedly
    const productsRes = http.get(`${BASE_URL}/Product/`);
    recordResult(productsRes, 200, 300);

    check(productsRes, {
        'PT-002 product list returns 200 as expected': (r) => r.status === 200,
        'PT-002 product list responds under 300ms': (r) => r.timings.duration < 300,
    });

    sleep(0.5);

    // ── Test 3: GET /Product/getALL ──────────────────────────────────────────
    // Load test — fetch products with details (heavier query)
    const productsDetailRes = http.get(`${BASE_URL}/Product/getALL`);
    recordResult(productsDetailRes, 200, 400);

    check(productsDetailRes, {
        'PT-003 products with details returns 200 as expected': (r) => r.status === 200,
        'PT-003 products with details responds under 400ms': (r) => r.timings.duration < 400,
    });

    sleep(0.5);

    // ── Test 4: GET /Supplier/ ───────────────────────────────────────────────
    // Load test — fetch all suppliers
    const suppliersRes = http.get(`${BASE_URL}/Supplier/`);
    recordResult(suppliersRes, 200, 300);

    check(suppliersRes, {
        'PT-004 supplier list returns 200 as expected': (r) => r.status === 200,
        'PT-004 supplier list responds under 300ms': (r) => r.timings.duration < 300,
    });

    sleep(0.5);

    // ── Test 5: POST /User/login ─────────────────────────────────────────────
    // Load test — login endpoint under load
    const loginRes = http.post(
        `${BASE_URL}/User/login`,
        JSON.stringify({
            username: data.loginUser.username,
            password: data.loginUser.password
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    recordResult(loginRes, 200, 500);

    check(loginRes, {
        'PT-005 login returns 200 as expected': (r) => r.status === 200,
        'PT-005 login responds under 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
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

    const httpErrorRateValue = data.metrics.http_error_rate?.values?.rate ?? 0;
    const slowResponseRateValue = data.metrics.slow_response_rate?.values?.rate ?? 0;
    const p95 = data.metrics.http_req_duration?.values?.['p(95)'] ?? 0;

    return {
        stdout: [
            '',
            'Readable k6 load-test summary',
            '--------------------------------',
            ...checkLines,
            '',
            `HTTP error rate: ${(httpErrorRateValue * 100).toFixed(2)}%`,
            `Slow response check rate: ${(slowResponseRateValue * 100).toFixed(2)}%`,
            `95th percentile response time: ${p95.toFixed(2)}ms`,
            '',
            'Note: check failures and threshold failures are different. A response can return 200 but still fail a speed check.',
            '',
        ].join('\n'),
    };
}
