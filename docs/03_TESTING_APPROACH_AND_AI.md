# 🤖 Testing Approach & AI Utilization

> **Candidate:** Dmytro Pasko (Product QA Engineer) | **Target:** Virtual Data Room MVP

---

## 1. Testing Approach: Risk-Based & Pyramid-Driven

In financial M&A, data confidentiality is existential. The testing strategy applied **Risk-Based Testing (RBT)** centered around authorization and data isolation:

* **70% API Integration Layer:** Directly validates multi-tenant data isolation (oracle-safe 404 IDOR barriers), 401 unauthenticated barriers, cursor pagination, and share revocation in milliseconds without browser overhead.
* **30% E2E Browser Flows (Playwright):** Covers critical end-to-end user journeys — authentication, folder lifecycle & modals, toast notifications, sample PDF upload via relative path, and multi-user permissioned sharing.

---

## 2. AI Utilization: Agentic Intelligence Multiplier

AI was leveraged not for generic text, but as an active technical accelerator through **specialized QA agentic skills**:

* **Contract Exploration:** Parsed the Swagger schema (`/docs-json`) and mapped all 26 endpoints in minutes, surfacing edge-case endpoints like `/folders/:id/delete-preview`.
* **Security & Boundary Probing:** Generated targeted attack payloads that directly uncovered **BUG-01 (Stored XSS)** and **BUG-03 (Path Traversal)**.
* **Root-Cause Analysis:** Isolated double percent-encoding (`%` -> `%25`) on Cyrillic downloads to Supabase SDK URL handling (**BUG-02**).
* **Framework Scaffolding & Zero-Antipattern Enforcement:** Governed by specialized QA skills enforcing modern Playwright standards — strictly prohibiting `waitForTimeout`, `networkidle`, and untyped `: any`, while ensuring semantic ARIA locators and resilient `afterEach` API cleanup.

---

## 3. Key Engineering Decisions & Trade-offs

* **Direct API Automation alongside UI:** Provides instant feedback on security/permission boundaries while keeping total CI execution under 25 seconds.
* **Dynamic Unique Data & Temp Files:** Uses timestamp generators (`getUniqueFileName()`) and temporary file copies to guarantee zero test collisions in shared environments.
* **Real Multi-User Contexts:** Uses separate browser contexts and authentic backend JWTs for Owner and Viewer instead of mocking frontend state.
