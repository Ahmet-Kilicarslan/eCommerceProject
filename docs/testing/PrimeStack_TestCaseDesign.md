# Prime Stack Test Case Design

Team: Prime Stack  
Application under test: Frost Inventory and Shopping System  
Report date: 19 May 2026

## 1. Purpose

This document defines the planned test cases for the Frost Inventory and Shopping System. It includes functional, frontend/usability, performance, and security tests, with traceability to the test objectives in the test plan.

## 2. Functional Test Cases

| ID | Feature | Type | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC-FUNC-001 | User registration | Normal | Test email does not exist | POST `/User/register` with valid username, email, password | Status 201, success message, safe user object returned |
| TC-FUNC-002 | User registration | Missing data | None | POST `/User/register` without email | Status 400, registration rejected |
| TC-FUNC-003 | User registration | Missing data | None | POST `/User/register` without password | Status 400, registration rejected |
| TC-FUNC-004 | User registration | Missing data | None | POST `/User/register` without username | Status 400, registration rejected |
| TC-FUNC-005 | User registration | Duplicate | User already exists | POST `/User/register` with duplicate email | Status 409, duplicate rejected |
| TC-FUNC-006 | User registration | Boundary | None | POST username shorter than 3 characters | Status 400, username rejected |
| TC-FUNC-007 | User registration | Boundary | None | POST password shorter than 6 characters | Status 400, password rejected |
| TC-FUNC-008 | User registration | Invalid format | None | POST invalid email format | Status 400, email rejected |
| TC-FUNC-009 | Login | Normal | Login user exists | POST `/User/login` with correct credentials | Status 200, login success message |
| TC-FUNC-010 | Login | Error | Login user exists | POST `/User/login` with wrong password | Status 401; covered by DEF-004 |
| TC-FUNC-011 | Login | Error | None | POST `/User/login` with non-existent username | Status 401; covered by DEF-004 |
| TC-FUNC-012 | Login | Missing data | None | POST `/User/login` with empty body | Status 400; covered by DEF-004 |
| TC-FUNC-013 | Authentication status | Normal | No active session | GET `/User/status` | Status 200, `isAuthenticated=false` |
| TC-FUNC-014 | Product list | Normal | Products exist or empty table allowed | GET `/Product/` | Status 200, array returned |
| TC-FUNC-015 | Product details | Normal | Products/suppliers may exist | GET `/Product/getALL` | Status 200, array returned |
| TC-FUNC-016 | Product creation | Normal | Supplier id exists | POST `/Product/` with valid product | Status 200, product created |
| TC-FUNC-017 | Product creation | Duplicate | Product name already exists | POST duplicate product name | Status 409, duplicate rejected |
| TC-FUNC-018 | Product lookup | Normal | Product exists | GET `/Product/getByProductId/:id` | Status 200, product returned |
| TC-FUNC-019 | Product lookup | Error | Product id does not exist | GET `/Product/getByProductId/999999` | Status 404, product not found |
| TC-FUNC-020 | Product stock | Normal | Product exists | PUT `/Product/decreaseAmount/:id` with amount | Status 200, amount updated |
| TC-FUNC-021 | Product deletion | Normal | Product exists | DELETE `/Product/:id` | Status 200, product deleted |
| TC-FUNC-022 | Supplier list | Normal | None | GET `/Supplier/` | Status 200, array returned |
| TC-FUNC-023 | Supplier creation | Normal | Supplier name does not exist | POST `/Supplier/` with name/contact | Status 200, supplier created |
| TC-FUNC-024 | Supplier creation | Duplicate | Supplier name already exists | POST duplicate supplier name | Status 409, duplicate rejected |
| TC-FUNC-025 | Supplier lookup | Normal | Supplier exists | GET `/Supplier/:id` | Status 200, supplier returned |
| TC-FUNC-026 | Supplier lookup | Edge | Supplier does not exist | GET `/Supplier/999999` | Status 200, body is null |
| TC-FUNC-027 | Supplier update | Normal | Supplier exists | PUT `/Supplier/` with updated name/contact | Status 200, supplier updated |
| TC-FUNC-028 | Supplier deletion | Normal | Supplier exists | DELETE `/Supplier/:id` | Status 200, supplier deleted |
| TC-FUNC-029 | Purchase list | Normal | None | GET `/Purchase/getAll` | Status 200, array returned |
| TC-FUNC-030 | Purchase creation | Normal | Existing user and product | POST `/Purchase/create` with products array | Status 201, purchase and purchased products returned |
| TC-FUNC-031 | Purchase creation | Missing data | None | POST `/Purchase/create` with empty body | Request rejected with validation error |
| TC-FUNC-032 | Purchase by user | Normal | User exists | GET `/Purchase/byUserId/:userId` | Status 200, array returned |
| TC-FUNC-033 | Purchase sorting | Normal | User exists | GET `/Purchase/byUserInAsc/:userId` | Status 200, array returned in ascending order |
| TC-FUNC-034 | Purchase sorting | Normal | User exists | GET `/Purchase/byUserInDesc/:userId` | Status 200, array returned in descending order |
| TC-FUNC-035 | Purchased products | Normal | Purchase exists | GET `/Purchase/byPurchase/:purchaseId` | Status 200, array returned |
| TC-FUNC-036 | Purchase order parameter | Edge | User exists | GET `/Purchase/byUserId/:userId?order=invalid` | Status 400, invalid order rejected |

## 3. Frontend and Usability Test Cases

| ID | Area | Steps | Expected result |
| --- | --- | --- | --- |
| UT-001 | Registration form usability | Open Angular app, navigate to login/register, fill registration fields, capture screenshots | Registration form fields are visible/fillable and screenshots are saved |
| UT-002 | Protected client route | Open Angular app and navigate to client dashboard without login | Unauthenticated user is redirected to `/login` |
| UT-003 | Existing user login usability | Open login page, fill existing credentials, submit login, capture final screen | Login form accepts credentials and request flow completes |
| UT-004 | Product catalog | Login as a seeded client, create a seeded product/supplier, open Products page | Seeded product, price, stock, and supplier name are visible |
| UT-005 | Cart workflow | Login as client, add seeded product to cart, increment/decrement quantity, remove product | Cart reflects item, quantity updates, and empty-cart state |
| UT-006 | Purchase workflow | Login as client, add seeded product to cart, click Buy | Purchase API returns success and success toast appears |
| UT-007 | Profile view | Login as client, open Profile, click Edit | Profile data, purchase log area, and edit modal fields are visible |
| UT-008 | Supplier route protection | Navigate to `/Supplier` without login | User is redirected to `/login` |
| UT-009 | Profile edit | Login as client, edit username/email in profile modal, save | Updated username/email are shown on the profile page |

Manual usability observations from the teammate review:

| ID | Area | Steps | Expected result |
| --- | --- | --- | --- |
| UT-MAN-001 | Registration visual consistency | Open `/login`, switch to Register, compare input field backgrounds | All active input fields use consistent styling; recorded as DEF-011 |
| UT-MAN-002 | Product discovery/search | Log in as client and inspect dashboard/product discovery workflow | Search or filtering support should be available for larger inventories; recorded as DEF-012 |

## 4. Performance Test Cases

| ID | Endpoint / workflow | Load condition | Expected result |
| --- | --- | --- | --- |
| PT-001 | GET `/User/status` | 5 to 50 virtual users | Status 200, response under 200 ms for individual check |
| PT-002 | GET `/Product/` | 5 to 50 virtual users | Status 200, response under 300 ms for individual check |
| PT-003 | GET `/Product/getALL` | 5 to 50 virtual users | Status 200, response under 400 ms for individual check |
| PT-004 | GET `/Supplier/` | 5 to 50 virtual users | Status 200, response under 300 ms for individual check |
| PT-005 | POST `/User/login` | 5 to 50 virtual users | Status 200, response under 500 ms for individual check |
| PT-006 | Overall API | Ramp 5 VUs for 30s, 20 VUs for 1m, 50 VUs for 30s, ramp down 30s | 95th percentile response time below 500 ms and error rate below 10% |

## 5. Security Test Cases

| ID | Risk area | Attack / input | Expected result |
| --- | --- | --- | --- |
| ST-001 | SQL injection login | Username/password: `' OR '1'='1` | Login rejected, no user data returned |
| ST-002 | SQL injection URL parameter | `/Product/getByProductId/1' OR '1'='1` | Request rejected or sanitized; database contents not exposed |
| ST-003 | XSS registration | Username: `<script>alert("xss")</script>` | Input should be rejected; covered by DEF-007 |
| ST-004 | Broken access control | GET `/User/profile` without session | Status 401 |
| ST-005 | Mass assignment | Register body includes `role: "admin"` | User should not be granted admin role; covered by DEF-005 |
| ST-006 | Oversized payload | 100,000-character username/password | Server does not crash |
| ST-007 | Unauthorized data access | GET `/User/users` without session | Should return 401; covered by DEF-006 |
| ST-008 | Security headers | ZAP scan of `http://localhost:3000/Product/` | `X-Content-Type-Options: nosniff` should be present; covered by DEF-008 |
| ST-009 | Information disclosure | ZAP scan of missing route such as `/robots.txt` | `X-Powered-By` should be suppressed; covered by DEF-008 |
| ST-010 | CSP configuration | ZAP scan of missing route such as `/robots.txt` | CSP should define `frame-ancestors` and `form-action`; covered by DEF-008 |
| ST-011 | Authenticated session access | Register/login a client in k6, then GET `/User/profile` with session cookie | Status 200 and returned profile matches logged-in user |

## 6. Traceability Matrix

| Requirement / objective | Test cases |
| --- | --- |
| User authentication works and validates input | TC-FUNC-001 to TC-FUNC-013, UT-001 to UT-003, UT-007, UT-009, ST-001, ST-004, ST-011 |
| Product inventory can be managed | TC-FUNC-014 to TC-FUNC-021, UT-004 |
| Suppliers can be managed | TC-FUNC-022 to TC-FUNC-028, UT-004, UT-008 |
| Purchases and cart actions work | TC-FUNC-029 to TC-FUNC-036, UT-005, UT-006, UT-007 |
| Application responds under load | PT-001 to PT-006 |
| Security risks are identified | ST-001 to ST-011 |
