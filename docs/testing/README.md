# Software Validation, Verification and Security Testing Documentation

Application under test: Frost Inventory and Shopping System

Test target:
- Backend API: `http://localhost:3000`
- Frontend UI: `http://localhost:4200`
- Main modules: user authentication, product catalog, supplier management, purchases, cart, dashboard, and profile workflows.

Team: Prime Stack

This folder contains the four documents requested by the project guide:

| Required document | File |
| --- | --- |
| Test Plan | [PrimeStack_TestPlan.md](PrimeStack_TestPlan.md) |
| Test Case Design Document | [PrimeStack_TestCaseDesign.md](PrimeStack_TestCaseDesign.md) |
| Test Execution Report | [PrimeStack_TestExecutionReport.md](PrimeStack_TestExecutionReport.md) |
| Defect Report | [PrimeStack_DefectReport.md](PrimeStack_DefectReport.md) |

Evidence files are stored in [evidence](evidence). The ZAP report was generated on 14 May 2026 at 14:16:40 using ZAP 2.17.0.

PDF versions are generated in [pdf](pdf) when the local PDF render step is run.

## How to Run Tests

### Backend Functional Tests

Run all Jest/Supertest functional tests:

```bash
cd backend
npm test
```

Run all functional tests with detailed per-test output:

```bash
cd backend
npx jest --config jest.config.json --runInBand --verbose
```

Functional test files are located in:

```text
backend/tests/functionality/
```

Run a single functional test file:

```bash
cd backend
npx jest tests/functionality/user.test.js --config jest.config.json
npx jest tests/functionality/product.test.js --config jest.config.json
npx jest tests/functionality/supplier.test.js --config jest.config.json
npx jest tests/functionality/purchase.test.js --config jest.config.json
```

### Performance Test

Start the backend first:

```bash
cd backend
node server.js
```

Then run the k6 performance test in another terminal:

```bash
cd backend
k6 run tests/performance/load-test.js
```

### Security Script Test

Keep the backend running, then execute:

```bash
cd backend
k6 run tests/performance/security-test.js
```

### Frontend Playwright Usability Tests

Start the Angular frontend:

```bash
cd frontend
npm start
```

The frontend should run at:

```text
http://localhost:4200
```

Run the Playwright tests in another terminal:

```bash
cd frontend
npx playwright test
```

Playwright test file:

```text
frontend/tests/example.spec.ts
```

Open the Playwright HTML report:

```bash
cd frontend
npx playwright show-report
```

Run only Chromium:

```bash
cd frontend
npx playwright test --project=chromium
```

Run with the browser visible:

```bash
cd frontend
npx playwright test --headed
```

### ZAP Security Scan

Use ZAP only against the local application that you own/control. For this project, scan the backend API on port `3000`.

#### 1. Start the backend

Open a terminal and run:

```bash
cd backend
node server.js
```

Confirm the backend is reachable:

```bash
curl -i http://localhost:3000/Product/
```

If the response is not returned, fix the backend/database first. ZAP will produce misleading results if the server is not reachable.

#### 2. Open ZAP

Launch **OWASP ZAP / ZAP by Checkmarx** from the application menu or terminal.

Use **Standard Mode** when ZAP asks for a mode. A saved session is optional; for this assignment it is fine to use an untitled session.

#### 3. Run Automated Scan

Open the **Quick Start** tab and choose **Automated Scan**.

Use this target URL:

```text
http://localhost:3000/Product/
```

Recommended options:

- Keep **Use traditional spider** enabled.
- Keep **Use ajax spider** set to `Never`.
- Browser selection can stay as Firefox.
- Click **Attack**.

Wait until ZAP shows that the attack/scan is complete. Then open the **Alerts** tab at the bottom.

#### 4. Evidence to Capture

Take screenshots of the main ZAP window and each important alert. For our report, the important alert types were:

- `CSP: Failure to Define Directive with No Fallback`
- `Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s)`
- `X-Content-Type-Options Header Missing`
- `User Agent Fuzzer`

For each screenshot, make sure the right-side alert detail panel shows:

- URL
- Risk
- Confidence
- Parameter
- Evidence
- CWE ID
- Description

Store screenshots in:

```text
docs/testing/evidence/
```

#### 5. Export HTML Report

In ZAP, use:

```text
Report -> Generate Report
```

Recommended report settings:

- Format: `HTML`
- Scope: current sites/session
- Include alerts and evidence
- Save location: `docs/testing/evidence/`

Use a clear filename, for example:

```text
docs/testing/evidence/2026-05-14-ZAP-Security-Report.html
```

The existing evidence file in this project is:

```text
docs/testing/evidence/2026-05-14-ZAP-Secuirty-Report-.html
```

Note: that filename contains a typo, but it is already referenced by the reports, so do not rename it unless the report links are updated too.

#### 6. Re-test After Fixes

After security fixes, restart the backend and run the same ZAP scan again. Confirm:

- `X-Powered-By` is no longer present.
- `X-Content-Type-Options: nosniff` is present.
- CSP includes explicit no-fallback directives such as `frame-ancestors` and `form-action`.

Quick header check without ZAP:

```bash
curl -i http://localhost:3000/robots.txt
curl -i http://localhost:3000/Product/
```

### Other Available Tests

Angular's default test command is available:

```bash
cd frontend
npm test
```

For this project documentation, the frontend/usability evidence is based on Playwright rather than Karma/Jasmine.
