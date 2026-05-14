# TeamName_DefectReport

## 1. Defect Summary

This defect report records issues identified through source review, automated tests, scripted security testing, and ZAP scan evidence for the Frost Inventory and Shopping System.

| ID | Title | Severity | Priority | Status |
| --- | --- | --- | --- | --- |
| DEF-001 | Missing CSP no-fallback directives | Medium | High | Open |
| DEF-002 | Express framework disclosed through `X-Powered-By` header | Low | Medium | Open |
| DEF-003 | Missing `X-Content-Type-Options: nosniff` on product API response | Low | Medium | Open |
| DEF-004 | User-agent fuzzing changes product response body | Low | Medium | Open |
| DEF-005 | Unauthenticated access to user list endpoint | High | High | Open |
| DEF-006 | Invalid login errors return HTTP 500 | Medium | Medium | Open |
| DEF-007 | Invalid purchase creation errors return HTTP 500 | Medium | Medium | Open |

## DEF-001: Missing CSP No-Fallback Directives

| Field | Value |
| --- | --- |
| Severity | Medium |
| Priority | High |
| Source | ZAP passive scan |
| URL | `GET http://localhost:3000/robots.txt` |
| CWE | CWE-693 |
| Evidence | `Content-Security-Policy: default-src 'none'` |
| Status | Open |

Description: ZAP reported that the Content Security Policy does not define directives that have no fallback. In this case, `frame-ancestors` and `form-action` are missing. Missing directives may allow browser behavior that the application owner did not intend.

Steps to reproduce:

1. Start the backend on port `3000`.
2. Run ZAP automated scan against `http://localhost:3000/Product/`.
3. Review alerts for `CSP: Failure to Define Directive with No Fallback`.

Expected result: CSP includes explicit no-fallback directives, for example `frame-ancestors 'none'` and `form-action 'self'`.

Actual result: Error responses expose only `default-src 'none'`.

Suggested fix: Add centralized security headers using Helmet or equivalent Express middleware. Configure CSP explicitly for API responses and error responses.

## DEF-002: Express Framework Disclosed Through `X-Powered-By` Header

| Field | Value |
| --- | --- |
| Severity | Low |
| Priority | Medium |
| Source | ZAP passive scan |
| URL | `GET http://localhost:3000/robots.txt` |
| CWE | CWE-497 |
| Evidence | `X-Powered-By: Express` |
| Status | Open |

Description: The backend discloses that it uses Express. This information can help attackers fingerprint the technology stack and search for framework-specific weaknesses.

Steps to reproduce:

1. Send a request to `http://localhost:3000/robots.txt`.
2. Inspect response headers.

Expected result: The `X-Powered-By` header is absent.

Actual result: Response contains `X-Powered-By: Express`.

Suggested fix: Add `app.disable('x-powered-by')` near Express app initialization, or use Helmet to remove/override this header.

## DEF-003: Missing `X-Content-Type-Options: nosniff` on Product API Response

| Field | Value |
| --- | --- |
| Severity | Low |
| Priority | Medium |
| Source | ZAP passive scan |
| URL | `GET http://localhost:3000/Product/` |
| CWE | CWE-693 |
| Evidence | Response does not include `X-Content-Type-Options: nosniff` |
| Status | Open |

Description: The `/Product/` endpoint returns JSON but does not send the anti-MIME-sniffing header. Some browsers may try to interpret content differently than the declared content type.

Steps to reproduce:

1. Send `GET http://localhost:3000/Product/`.
2. Inspect response headers.

Expected result: Response includes `X-Content-Type-Options: nosniff`.

Actual result: Header is missing from the successful product list response.

Suggested fix: Add centralized header middleware, for example Helmet, so all success and error responses include `X-Content-Type-Options: nosniff`.

## DEF-004: User-Agent Fuzzing Changes Product Response Body

| Field | Value |
| --- | --- |
| Severity | Low |
| Priority | Medium |
| Source | ZAP active scan |
| URL | `GET http://localhost:3000/Product/` |
| Attack | `Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)` |
| Status | Open |

Description: ZAP observed a response difference when the User-Agent header was changed. The evidence response included additional product records with `null` fields. This may indicate unstable test data, missing validation, or endpoint behavior that changes during scanning.

Steps to reproduce:

1. Send `GET http://localhost:3000/Product/` using a modern browser user agent.
2. Send the same request with `Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)`.
3. Compare status codes and response body hashes.

Expected result: The API should return consistent JSON data independent of User-Agent unless a documented compatibility rule exists.

Actual result: ZAP flagged a response body difference.

Suggested fix: Confirm whether the difference was caused by concurrent data changes during scanning. Add database constraints and request validation to prevent products with `null` name, amount, price, or supplier values.

## DEF-005: Unauthenticated Access to User List Endpoint

| Field | Value |
| --- | --- |
| Severity | High |
| Priority | High |
| Source | Security test design and route review |
| URL | `GET http://localhost:3000/User/users` |
| Status | Open |

Description: The route that returns all users is not protected by authentication or authorization middleware. This can expose user records to unauthenticated clients.

Steps to reproduce:

1. Start backend without logging in.
2. Send `GET http://localhost:3000/User/users`.
3. Observe whether user data is returned.

Expected result: Status `401 Unauthorized` for unauthenticated users, or `403 Forbidden` for non-admin users.

Actual result: Route code currently calls `userApplication.getAllUsers()` without `requireAuth` or admin-role middleware.

Suggested fix: Add authentication and admin authorization middleware to `/User/users`. Return safe user objects only, never password hashes.

## DEF-006: Invalid Login Errors Return HTTP 500

| Field | Value |
| --- | --- |
| Severity | Medium |
| Priority | Medium |
| Source | Functional tests |
| URL | `POST http://localhost:3000/User/login` |
| Related tests | TC-FUNC-010, TC-FUNC-011, TC-FUNC-012 |
| Status | Open |

Description: Invalid login attempts are rejected, but the application returns generic server errors. Wrong password, unknown username, and missing credentials are client/authentication errors, not internal server failures.

Steps to reproduce:

1. POST `/User/login` with a wrong password.
2. POST `/User/login` with an unknown username.
3. POST `/User/login` with an empty body.

Expected result: Use `401` for invalid credentials and `400` for missing fields.

Actual result: Functional tests currently expect `500`, indicating the current implementation returns server error responses.

Suggested fix: Map validation and authentication failures to explicit 4xx responses in `UserRoute.js` and/or the user application/service layer.

## DEF-007: Invalid Purchase Creation Errors Return HTTP 500

| Field | Value |
| --- | --- |
| Severity | Medium |
| Priority | Medium |
| Source | Functional tests |
| URL | `POST http://localhost:3000/Purchase/create` |
| Related test | TC-FUNC-031 |
| Status | Open |

Description: Creating a purchase with missing required fields is rejected, but the route returns a generic `500`. Missing `userId`, `totalAmount`, or `products` should be treated as invalid client input.

Steps to reproduce:

1. Send `POST /Purchase/create` with `{}`.
2. Observe response status.

Expected result: Status `400 Bad Request` with a clear validation message.

Actual result: Functional test currently expects `500`.

Suggested fix: Validate request body at the route boundary before calling application logic. Return `400` for missing fields and `422` for semantically invalid purchase data.

## 2. Recommended Fix Order

1. Protect `/User/users` with authentication and admin authorization.
2. Replace generic 500 responses for invalid client input with clear 4xx responses.
3. Add centralized security middleware for `X-Powered-By`, `X-Content-Type-Options`, and CSP.
4. Add product validation and database constraints to prevent null product rows.
5. Re-run functional tests, k6 security tests, and ZAP scan after fixes.
