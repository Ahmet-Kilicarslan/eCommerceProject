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

Start the backend:

```bash
cd backend
node server.js
```

Open ZAP and run an automated scan against:

```text
http://localhost:3000/Product/
```

Export the ZAP report after the scan and store it in the evidence folder.

### Other Available Tests

Angular's default test command is available:

```bash
cd frontend
npm test
```

For this project documentation, the frontend/usability evidence is based on Playwright rather than Karma/Jasmine.
