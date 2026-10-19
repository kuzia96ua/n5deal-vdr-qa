# 📑 QA Test Plan: Virtual Data Room (VDR) MVP

> **Candidate:** Dmytro Pasko (Product QA Engineer) | **Scope:** VDR MVP Web & API | **Date:** October 19, 2026

---

## 1. Objective & Risk Focus

To ensure release stability, data confidentiality, and compliance for the Virtual Data Room MVP during financial M&A due diligence.
* **Core Priorities:** Zero-Trust multi-tenant isolation (IDOR protection), strict RBAC (`VIEWER` read-only enforcement), secure public link lifecycle (`410 Gone`), and file/folder data integrity.

---

## 2. Scope & Target Matrix

| Module | In-Scope Verification | Out-of-Scope (MVP) |
|---|---|---|
| **Auth & Session** | Registration constraints, login, JWT issuance, 401 unauthenticated barrier | Social OAuth (Google / Microsoft) |
| **Folders** | Creation, arbitrary nesting, case-insensitive collision (`409`), renaming, cascade deletion | OCR / Full-text search |
| **Files** | 3-step upload intent, PDF mime-type & 50MB limits, auto-suffix on clash, UI deletion | Dynamic document watermarking |
| **Sharing** | Public link token access, unauthenticated viewing, link revocation, user-to-user email sharing | Multi-user live co-editing |

---

## 3. High-Value Test Scenarios & Traceability

| ID | Module | Scenario Description | Expected Outcome | Priority |
|---|---|---|---|:---:|
| **SEC-01** | Multi-Tenancy | External user requests another tenant's room contents directly | `404 Not Found` (Oracle-safe) | **P0** |
| **SEC-02** | Security | Unauthenticated requests or forged JWT tokens to protected routes | `401 Unauthorized` | **P0** |
| **SEC-03** | Sharing | Revoked public link accessed via browser or direct API | `410 Gone` with clear alert | **P1** |
| **SEC-04** | Sharing | User-to-user email sharing and access revocation lifecycle | Recipient sees item in "Shared with me"; access lost on revoke | **P1** |
| **SEC-05** | Security | Script / HTML tags injected into folder names (`POST /folders`) | Sanitized before persistence (Blocked XSS) | **P1** |
| **FNC-01** | Folders | Create duplicate folder name in same directory (case-insensitive) | `409 Conflict` (e.g. `test` vs `TEST`) | **P1** |
| **FNC-02** | Folders | Full folder lifecycle: Create, rename, delete via UI modals | Dialogs work, toast alerts appear, row removed | **P1** |
| **FNC-03** | Files | Upload sample PDF via relative path and delete via UI actions | Progress bar completes, listing updates, deletion succeeds | **P1** |
| **FNC-04** | Files | Upload file with duplicate name (`sample.pdf`) | Auto-suffix applied (`sample (1).pdf`), no clash | **P2** |
| **UX-01** | Navigation | Responsive breadcrumb navigation across deep nested folders | Breadcrumb updates smoothly; back navigation works | **P2** |

---

## 4. Release Acceptance Criteria (Exit Criteria)

* **100% of P0 & P1 scenarios** executed and passing in automated CI suite.
* **0 flaky tests** across API and E2E browser projects.
* **0 critical security leaks** (no IDOR vulnerabilities, strict 401/404 barriers).
* **Deterministic cleanup:** Automated test suites leave 0 leftover entities on the live server.
