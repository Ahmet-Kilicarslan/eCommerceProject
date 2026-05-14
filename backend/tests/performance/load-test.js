import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics
const responseTime = new Trend('response_time');
const errorRate = new Rate('error_rate');

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
        // Error rate must stay below 10%
        error_rate: ['rate<0.1'],
    },
};

const BASE_URL = 'http://localhost:3000';

export default function () {

    // ── Test 1: GET /User/status ─────────────────────────────────────────────
    // Normal use case — check auth status
    const statusRes = http.get(`${BASE_URL}/User/status`);
    responseTime.add(statusRes.timings.duration);

    check(statusRes, {
        'PT-001 status endpoint returns 200': (r) => r.status === 200,
        'PT-001 response time under 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(statusRes.status !== 200);

    sleep(0.5);

    // ── Test 2: GET /Product/ ────────────────────────────────────────────────
    // Load test — fetch all products repeatedly
    const productsRes = http.get(`${BASE_URL}/Product/`);
    responseTime.add(productsRes.timings.duration);

    check(productsRes, {
        'PT-002 products endpoint returns 200': (r) => r.status === 200,
        'PT-002 response time under 300ms': (r) => r.timings.duration < 300,
    });
    errorRate.add(productsRes.status !== 200);

    sleep(0.5);

    // ── Test 3: GET /Product/getALL ──────────────────────────────────────────
    // Load test — fetch products with details (heavier query)
    const productsDetailRes = http.get(`${BASE_URL}/Product/getALL`);
    responseTime.add(productsDetailRes.timings.duration);

    check(productsDetailRes, {
        'PT-003 products with details returns 200': (r) => r.status === 200,
        'PT-003 response time under 400ms': (r) => r.timings.duration < 400,
    });
    errorRate.add(productsDetailRes.status !== 200);

    sleep(0.5);

    // ── Test 4: GET /Supplier/ ───────────────────────────────────────────────
    // Load test — fetch all suppliers
    const suppliersRes = http.get(`${BASE_URL}/Supplier/`);
    responseTime.add(suppliersRes.timings.duration);

    check(suppliersRes, {
        'PT-004 suppliers endpoint returns 200': (r) => r.status === 200,
        'PT-004 response time under 300ms': (r) => r.timings.duration < 300,
    });
    errorRate.add(suppliersRes.status !== 200);

    sleep(0.5);

    // ── Test 5: POST /User/login ─────────────────────────────────────────────
    // Load test — login endpoint under load
    const loginRes = http.post(
        `${BASE_URL}/User/login`,
        JSON.stringify({
            username: 'loginuser',
            password: 'Test1234!'
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    responseTime.add(loginRes.timings.duration);

    check(loginRes, {
        'PT-005 login endpoint returns 200': (r) => r.status === 200,
        'PT-005 login response time under 500ms': (r) => r.timings.duration < 500,
    });
    errorRate.add(loginRes.status !== 200);

    sleep(1);
}