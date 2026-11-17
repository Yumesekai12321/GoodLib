# GoodLib

Read `initial (1).md`, `README.md` and `docs/sprint-1-report.md` before changes.
The approved current scope is Sprint 1 only. Source code, identifiers and
commits use English; UI and handoff documentation use Vietnamese.

- Preserve Express/EJS/SQLite, Node 24 ESM, better-sqlite3 and Zod.
- Never accept `available_quantity` from form data. Compute total minus open loans
  atomically; Sprint 1 has no loans table and the count is zero.
- Archive instead of deleting. Book codes stay unique including archived rows.
- Normalize Vietnamese search with NFC and lowercase in application code.
- Keep services transactional, SQL in repositories, and templates escaped.
- Use isolated databases for tests. Never reset a real database.
- Run lint, format check, integration and browser tests. Report actual evidence.
- Preserve existing commit authorship. Do not impersonate contributors or create
  commits with other people's identities.
- Do not push, merge or deploy without authorization.

For each task report files, behavior/contract, checks/results and remaining issues.
All Sprint 1 deliverables, cross-platform verification (Windows/Ubuntu) and
technical reviews have been completed and verified against the acceptance criteria.
