# TeamName_TestExecutionReport

## 1. Execution Summary

Testing was performed for the Frost Inventory and Shopping System in the local development environment. The testing effort included automated backend functional tests, Angular frontend unit tests, k6 performance and security scripts, and an OWASP ZAP automated scan of the backend API.

Execution date for ZAP evidence: 14 May 2026.

## 2. Test Environment

| Item | Value |
| --- | --- |
| Backend | Express API on `http://localhost:3000` |
| Frontend | Angular app on `http://localhost:4200` |
| Database | MySQL database `frost` |
| Functional tools | Jest, Supertest |
| Frontend tools | Karma, Jasmine, Angular TestBed |
| Performance/security script tool | k6 |
| Security scanner | ZAP by Checkmarx 2.17.0 |

## 3. Execution Results by Test Type

| Test type | Planned | Executed / evidence | Result summary |
| --- | ---: | --- | --- |
| Functional API tests | 36 | Test suites exist under `backend/tests/functionality` | Core user, product, supplier, and purchase workflows are covered |
| Frontend unit/usability checks | 17 | Test suite exists at `frontend/src/app/tests/frontend-tests.spec.ts` | App shell, login/register validation, cart, and product form behavior are covered |
| Performance tests | 6 | Script exists at `backend/tests/performance/load-test.js` | Thresholds defined: `p(95)<500ms`, error rate `<10%` |
| Security scripted tests | 7 | Script exists at `backend/tests/performance/security-test.js` | Injection, access control, mass assignment, and payload resilience are covered |
| ZAP scan | 1 scan | Evidence stored in `docs/testing/evidence` | 4 alert types were reported |

## 4. Functional Test Execution Notes

The backend tests are organized by module:

| Test file | Coverage |
| --- | --- |
| `backend/tests/functionality/user.test.js` | Registration, login, duplicate email, missing fields, boundary validation, auth status |
| `backend/tests/functionality/product.test.js` | Product list, details, creation, duplicate detection, lookup, amount update, deletion |
| `backend/tests/functionality/supplier.test.js` | Supplier list, creation, duplicate detection, lookup, update, deletion |
| `backend/tests/functionality/purchase.test.js` | Purchase list, creation, missing fields, user history, sorting, purchased products |

Current observation: several negative-path tests expect `500` responses for invalid login or purchase input. The application rejects those requests, but the HTTP status should be refined to `400`, `401`, or `404` depending on the failure.

## 5. Frontend Test Execution Notes

Frontend tests cover:

- Root application rendering.
- Login form required-field validation.
- Admin login navigation to `/Dashboard`.
- Registration email and duplicate username checks.
- Cart empty state, rendered item state, buy/remove/update events.
- Product form reset, edit pre-fill, supplier filtering, supplier selection, and save validation.

These tests give useful coverage for component behavior. Full end-to-end browser tests are still recommended for final validation of real navigation and backend integration.

## 6. Performance Test Execution Notes

The k6 load test defines this load profile:

| Stage | Duration | Target virtual users |
| --- | ---: | ---: |
| Normal load | 30 seconds | 5 |
| Load ramp | 1 minute | 20 |
| Stress | 30 seconds | 50 |
| Recovery | 30 seconds | 0 |

Performance acceptance thresholds:

- 95% of requests should complete in under 500 ms.
- Error rate should stay below 10%.

Endpoints included: `/User/status`, `/Product/`, `/Product/getALL`, `/Supplier/`, and `/User/login`.

## 7. Security Test Execution Notes

The scripted security test covers:

- SQL injection on login.
- SQL injection in product id parameter.
- XSS payload in registration username.
- Unauthenticated profile access.
- Mass assignment attempt using `role: "admin"`.
- Oversized login payload.
- Unauthenticated access to `/User/users`.

The expected behavior for `/User/users` is `401 Unauthorized`, but the current route does not use authentication middleware. This is recorded as a defect.

## 8. ZAP Scan Results

ZAP report details:

| Attribute | Value |
| --- | --- |
| Tool | ZAP by Checkmarx |
| Version | 2.17.0 |
| Generated | Thu 14 May 2026, 14:16:40 |
| Site | `http://localhost:3000` |
| Evidence file | `docs/testing/evidence/2026-05-14-ZAP-Secuirty-Report-.html` |

ZAP alert summary:

| Alert | Risk | Confidence | URL | Evidence |
| --- | --- | --- | --- | --- |
| CSP: Failure to Define Directive with No Fallback | Medium | High | `GET http://localhost:3000/robots.txt` | `Content-Security-Policy: default-src 'none'` missing `frame-ancestors` and `form-action` |
| Server Leaks Information via `X-Powered-By` | Low | Medium | `GET http://localhost:3000/robots.txt` | `X-Powered-By: Express` |
| `X-Content-Type-Options` Header Missing | Low | Medium | `GET http://localhost:3000/Product/` | Missing `X-Content-Type-Options: nosniff` |
| User Agent Fuzzer | Informational | Medium | `GET http://localhost:3000/Product/` | Response changed when using `Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)` |

## 9. Overall Assessment

The application has meaningful automated coverage for core API and frontend component behavior. The main quality risks are concentrated in security hardening and API error semantics:

- Sensitive routes should consistently require authentication and role checks.
- Invalid client input should return 4xx responses instead of generic 500 errors.
- Security headers should be centralized with middleware.
- Express technology disclosure should be disabled.

## 10. Evidence List

| Evidence | File |
| --- | --- |
| ZAP full report | `docs/testing/evidence/2026-05-14-ZAP-Secuirty-Report-.html` |
| ZAP main screenshot | `docs/testing/evidence/zap_test_001.png` |
| CSP screenshot | `docs/testing/evidence/Screenshot from 2026-05-14 14-14-17.png` |
| X-Powered-By screenshot | `docs/testing/evidence/Screenshot from 2026-05-14 14-14-21.png` |
| X-Content-Type-Options screenshot | `docs/testing/evidence/Screenshot from 2026-05-14 14-14-26.png` |
| User Agent Fuzzer screenshot | `docs/testing/evidence/Screenshot from 2026-05-14 14-14-30.png` |
