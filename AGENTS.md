# GoodLib

Read `initial (1).md`, `docs/decisions.md` and `docs/contracts.md` before changes.
The user-approved current scope is Sprint 1 only. Source code, identifiers and
commits use English; UI and handoff documentation use Vietnamese.

- Preserve Express/EJS/SQLite, Node 24 ESM, better-sqlite3 and Zod.
- Never accept `available_quantity` from form data. Compute total minus open loans
  atomically; Sprint 1 has no loans table and the count is zero.
- Archive instead of deleting. Book codes stay unique including archived rows.
- Normalize Vietnamese search with NFC and lowercase in application code.
- Keep services transactional, SQL in repositories, and templates escaped.
- Use isolated databases for tests. Never reset a real database.
- Run lint, format check, integration and browser tests. Report actual evidence.
- Keep task ownership in `docs/contributions.md`. Do not impersonate contributors
  or create commits with other people's identities.
- Do not push, merge or deploy without authorization.

For each task report files, behavior/contract, checks/results, remaining issues
and a proposed PR title with its WBS ID. S1-09 requires a real second machine and
S1-10 requires the designated human review; automated checks cannot certify them.
