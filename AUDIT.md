# Audit of FarmTracker

## Immediate Fix
**Security & Integrity**
* **XSS Vulnerability:** User data is rendered via `innerHTML` in `index.html`, `animal-detail.html`, and `animals.html`. **Fix:** Use `textContent` or DOM sanitization to prevent script injection.
* **Database Hazards:** Lack of transactions and foreign key enforcement in `animals.js` risks data corruption. **Fix:** Enable `PRAGMA foreign_keys = ON` and use `db.transaction()`.
* **Data Drift:** Moving animals increases new paddock counts without decreasing old ones. **Fix:** Atomic updates for paddock transfers.

**Logic & Stability**
* **Broken Pagination:** Offset logic is incorrect (`page` used instead of `page * limit`).
* **Pagination Button Error:** Next button appears even if no more records exist (fails when total records are exactly divisible by limit).
* **Crash Risks:** UI crashes on 404 errors or divide-by-zero errors when paddock capacity is 0.
* **N+1 Performance:** Fetching health events per animal causes scalability lag. **Fix:** Use SQL JOINs.
* **Operations:** Discarded backend error messages and dangerous `seed.js` scripts that wipe production data.

## Can Wait
**Architecture**
* **Decoupling:** Move inline scripts to dedicated `.js` files and use shared templates for headers/navigation to eliminate code duplication.
* **Namespace:** Prevent global window pollution by modularizing scripts.

**User Experience**
* **Readability:** Replace raw Paddock IDs with names and format raw ISO date strings for users.
* **Accessibility:** Improve A11y with semantic HTML/ARIA labels and implement responsive tables for mobile.
* **Resilience:** Add `AbortController` for fetch timeouts and frontend validation for health event inputs.