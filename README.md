# 🛡️ Virtual Data Room (VDR) — Product QA & Automation Deliverables

> **Candidate:** Dmytro Pasko (Product QA Engineer)  
> **Target Position:** Product QA Engineer @ N5Deal  
> **Repository:** [evo9/virtual-data-room](https://github.com/evo9/virtual-data-room)  
> **Live Web App:** [https://virtual-data-room-ten.vercel.app](https://virtual-data-room-ten.vercel.app)  
> **Live Backend API:** [https://virtual-data-room-production.up.railway.app](https://virtual-data-room-production.up.railway.app) (Swagger: `/docs`)  
> **Date:** October 19, 2026

---

## 📂 Deliverables Index

All five core task deliverables are organized in the [`docs/`](./docs) directory and [`playwright/`](./playwright) framework:

| Deliverable | File Path | Summary |
|---|---|---|
| **1. Test Plan** | [`docs/01_TEST_PLAN.md`](./docs/01_TEST_PLAN.md) | Comprehensive test plan covering scope, threat modeling for M&A data rooms, testing pyramid, and traceability matrix. |
| **2. Prioritized Bug Report** | [`docs/02_BUG_REPORT.md`](./docs/02_BUG_REPORT.md) | 6 categorized findings (P1/P2/P3), including **Stored XSS** in folder names, **Double URL encoding** on Cyrillic file downloads, and path traversal vulnerabilities. |
| **3. Testing Approach & AI** | [`docs/03_TESTING_APPROACH_AND_AI.md`](./docs/03_TESTING_APPROACH_AND_AI.md) | Transparent overview of the risk-based testing approach, specialized agentic QA skills, and specific areas where AI accelerated endpoint probes and test design. |
| **4. Final QA Report** | [`docs/04_FINAL_QA_REPORT.md`](./docs/04_FINAL_QA_REPORT.md) | Executive evaluation with a **Conditional GO (Yellow)** release readiness verdict, risk analysis, coverage metrics, and enterprise scale roadmap. |
| **5. Automated Test Suite** | [`playwright/`](./playwright) | Enterprise Playwright + TypeScript framework implementing Page Object Model (POM), custom fixtures, and isolated API + E2E suites. |

---

## 🏗️ Automation Architecture (Playwright + TypeScript)

The automation suite was constructed following enterprise test isolation standards and strict separation of concerns:

```
playwright/
├── src/
│   ├── api/
│   │   └── vdr-api.ts              # Strongly typed API client (Auth, Rooms, Folders, Shares)
│   ├── data/                       # Decoupled test data & sample assets
│   │   ├── app.data.ts             # Base URLs, validation & toast message constants
│   │   ├── user.data.ts            # Persona definitions (Owner, Viewer, Invalid)
│   │   ├── sample.pdf              # Valid minimal sample PDF asset
│   │   └── index.ts                # Barrel export (@data, @data/*)
│   ├── fixtures/
│   │   └── vdr.fixture.ts          # Custom Playwright fixtures (POM injection, API client)
│   ├── helpers/
│   │   └── generator-helper.ts     # Collision-free timestamp, filename & string generators
│   └── pages/                      # Page Object Model (Zero assertions inside POs)
│       ├── base-page.ts
│       ├── login-page.ts
│       ├── data-room-page.ts
│       ├── shared-with-me-page.ts
│       ├── public-share-page.ts
│       └── modals/
│           ├── new-folder-modal.ts
│           ├── rename-folder-modal.ts
│           ├── delete-modal.ts
│           └── share-modal.ts
├── tests/
│   ├── api/                        # Fast, deterministic security & permission checks
│   │   ├── auth-isolation.spec.ts  # IDOR prevention, 401 unauthenticated barrier, input constraints
│   │   ├── folder-lifecycle.spec.ts# Creation, case-insensitive collisions (409), cascade delete
│   │   └── sharing-security.spec.ts# Public links, VIEWER mutation blocks, 410 revocation
│   └── e2e/                        # High-value browser user journeys (Zero antipatterns)
│       ├── auth-flow.spec.ts       # Login, session persistence, logout
│       ├── folder-management.spec.ts# Create, rename, delete + toast notifications
│       ├── file-upload.spec.ts     # Sample PDF upload via relative path, UI deletion
│       ├── public-sharing.spec.ts  # Unauthenticated public link viewing & 410 revocation
│       └── permissioned-sharing.spec.ts # Multi-user sharing by email, access grant & revocation
├── playwright.config.ts            # Multi-project config (API Tests + Desktop Chrome)
├── package.json
└── tsconfig.json                   # Path aliases (@pages/*, @api/*, @fixtures/*, @data/*)
```

---

## 🚀 How to Run the Automated Tests

### 1. Prerequisites
* Node.js 20+ installed.

### 2. Setup
```bash
cd playwright
npm install
# Or install Playwright browsers if running for the first time:
npx playwright install chromium
```

### 3. Execution Commands
```bash
# Run all tests (API + E2E in parallel):
npx playwright test

# Run only API security & contract tests (Ultra-fast, ~2s):
npx playwright test tests/api

# Run E2E UI browser flows:
npx playwright test tests/e2e

# Run with interactive Playwright UI mode:
npx playwright test --ui

# View HTML Test Execution Report:
npx playwright show-report
```
