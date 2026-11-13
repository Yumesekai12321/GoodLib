# GoodLib — Implementation Specification for AI Coding Agents

> **Status:** `DRAFT / implementation baseline`
>
> **Purpose:** Single entry point for coding GoodLib. This document specifies what to build, how modules interact, and how to verify correctness.
>
> **Sources:** Group 11's PowerPoint (17 slides) and Agile WBS spreadsheet (`Ke hoach du an`, S1–S4).
>
> **Authority:** An approved SRS/decision log supersedes this document. The spreadsheet is the execution baseline where it conflicts with the presentation.
>
> **User-facing language:** Vietnamese. **Source code, identifiers, commits, tests:** English.

## 0. Mandatory agent protocol

1. **Inspect the repository first:** existing source, `package.json`, lockfile, migrations, database adapter, tests, Git status, and related task/PR. Never assume this document describes already implemented code.
2. **Implement only the requested WBS task** and its essential dependencies. Follow existing conventions if the repo already has working implementations; explain any necessary divergence.
3. **Keep contracts stable:** routes, DB columns, service interfaces, form field names, and UI components must be agreed upon before parallel implementation.
4. **Business invariants are non-negotiable.** Any operation changing loans or stock must be atomic and tested for failure paths.
5. **Never invent unspecified business rules.** Mark an unresolved policy as `BLOCKED_BY_PRODUCT_DECISION`, implement unrelated work, and report the exact question.
6. **Validate every change:** lint, relevant tests, migration on a clean test DB, and appropriate manual/E2E smoke tests. Report actual commands and results; never claim an unexecuted test passed.
7. **No unauthorized destructive operations:** do not reset real DBs, delete historical loans/backups, push/merge, deploy, or change production settings without explicit approval. Use a dedicated test DB and fixtures.
8. Output per task: `changed files → behavior/contract → tests run/results → unresolved issues → suggested PR summary (WBS ID)`.

## 1. Fixed baseline and scope

### 1.1. Technology (use this stack; do not introduce a new framework)

| Layer | Decision | Implementation notes |
|---|---|---|
| Runtime/language | **Node.js 24.x, JavaScript ESM** | Pin major in `.nvmrc`, `package.json#engines`, CI. Verify native module installation on target OS. |
| HTTP/SSR | **Express + EJS** | Server-rendered HTML forms; no React/Next.js SPA or public REST API requirement. |
| Frontend | Semantic HTML + CSS + small vanilla JS | Reusable EJS partials; no mandatory CSS framework or client-side state library. |
| Database | **SQLite** | One persistent DB file on the same host as Express. Versioned SQL migrations; enforce constraints and use transactions. |
| DB adapter | **better-sqlite3** | Prepared statements; sync service transactions; verify installed version against pinned Node runtime. |
| Validation | **Zod** | Parse/validate on the server; never rely on browser validation. |
| Sessions (Sprint 3) | `express-session` + persistent SQLite session store | `httpOnly`, `sameSite`, `secure` when HTTPS; rotate session on login; no default MemoryStore in deployment. |
| Passwords (Sprint 3) | Maintained bcrypt/Argon2 library | Strong password hashing; never store passwords in plaintext. |
| Tests | Node test runner (`node:test`) + Supertest + Playwright | Unit, HTTP/integration, concurrency, smoke/E2E. |
| Developer tools | ESLint + Prettier + GitHub Actions | Pin deps with lockfile; checks run on PR. |

Architecture: **modular monolith**. Dependency direction:

```text
Browser → Express routes/middleware → controllers → services → repositories → SQLite
                                      ↘ EJS templates/partials → HTML response
```

- **Routes** define URL and middleware.
- **Controllers** parse request, call service, render/redirect with appropriate status and feedback.
- **Services** enforce business policy and own transaction boundaries.
- **Repositories** execute prepared SQL; do not make policy decisions.
- **EJS** renders escaped output and receives view models; never contains SQL or authorization logic.
- No microservices, message broker, Redis, Docker/Kubernetes dependency, PostgreSQL migration, or external paid services for this four-sprint MVP.

### 1.2. MVP features, ordered by dependency

- **S1 — Books:** book CRUD, soft delete, code/title search, quantity integrity, SQLite persistence.
- **S2 — Readers + loans:** reader CRUD/search, one-copy-per-loan checkout, return, stock accounting, reader loan history.
- **S3 — Operations + security:** renewal **after policy approval**, overdue list, login, `ADMIN`/`LIBRARIAN` RBAC.
- **S4 — Completion:** basic statistics, UI/UX hardening, full regression, runnable seed/demo/README.

**Not in committed MVP:** reader self-service account/portal, reservations, per-physical-copy barcodes, fines/online fine payment, e-books, multi-library sync, ISBN/author full-text search, charts beyond simple optional graphs. Do not implement these just because the slides show them. The PowerPoint is the product vision, not authorization to expand Sprint scope.

### 1.3. Decision register: resolve conflicts before coding related features

| ID | Execution baseline (spreadsheet) | Alternative in slides | Agent action |
|---|---|---|---|
| `BR-01` | **Max 10 active loans per reader** | Max 5 books | Implement **10**; confirm with PO before S2 integration. |
| `BR-02` | **Due date = borrow date + 4 calendar months**, clamp missing day to last valid day | 14 days | Implement **4 calendar months**, not 120 days. |
| `BR-03` | **One loan row represents one borrowed book**; quantity tracked on `books` | Separate book copies, borrowing slip and slip items | Implement quantity-based MVP; avoid a premature `book_copies` table. |
| `BR-04` | Renewals planned for S3; details **not decided** | One renewal maximum | **Do not hard-code** max renewals or extension length until approved. |
| `BR-05` | List overdue loans; **no fine computation task** | 2,000 VND/day/book; possibly 200,000 VND cap in test slide | Do **not** compute fines, apply caps or block borrowing for overdue debt without approval. |
| `BR-06` | Two authenticated roles; reader role only if time permits | Three roles including reader portal | Implement `ADMIN` and `LIBRARIAN`; readers are data records, not login users. |
| `BR-07` | Search contains code/title, case-insensitive; diacritic removal not required | Search also by author/ISBN | Deliver code/title search first. |

**Product decisions still missing:** exact renewal eligibility and duration; role-specific permissions beyond minimum; whether/when to add fines/reservations. Log decisions in `docs/decisions.md` before implementing. Do not silently decide them in code.

## 2. Data contract (SQLite)

### 2.1. Domain semantics

- `books` = **book titles / stock records**, not distinct physical copies. `total_quantity` is catalogued quantity. `available_quantity` is derived operational stock and **must never be edited directly from a form**.
- `readers` = library patrons managed by librarians; **not** `users`.
- `loans` = exactly **one copy of one book borrowed by one reader**. `returned_on IS NULL` means open. Loan records are never physically deleted.
- Date-only values (`borrowed_on`, `due_on`, `returned_on`) use `YYYY-MM-DD` **in library-local calendar time** (`Asia/Ho_Chi_Minh`). Timestamps use UTC ISO 8601 consistently.
- Store a minimal `loan_events` history of `BORROW`, `RETURN`, `RENEW` to preserve an audit trail; do not infer an old due date from a changed loan row.

### 2.2. Required migration strategy

Implement separate, repeatable-once migrations and a `schema_migrations` version ledger. Recommended minimal SQL contract (split into `001_books.sql`, `002_readers_loans.sql`, `003_users.sql`; details may evolve before first deployment):

```sql
-- 001_books.sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_search TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  published_year INTEGER,
  total_quantity INTEGER NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),
  available_quantity INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (available_quantity >= 0 AND available_quantity <= total_quantity),
  CHECK (published_year IS NULL OR published_year BETWEEN 0 AND 9999)
);
CREATE INDEX idx_books_title_search ON books(title_search);

-- 002_readers_loans.sql
CREATE TABLE readers (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  name_search TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  reader_id INTEGER NOT NULL REFERENCES readers(id) ON DELETE RESTRICT,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  borrowed_on TEXT NOT NULL,
  due_on TEXT NOT NULL,
  returned_on TEXT,
  renew_count INTEGER NOT NULL DEFAULT 0 CHECK (renew_count >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (due_on >= borrowed_on),
  CHECK (returned_on IS NULL OR returned_on >= borrowed_on)
);
CREATE INDEX idx_open_loans_reader ON loans(reader_id) WHERE returned_on IS NULL;
CREATE INDEX idx_open_loans_book ON loans(book_id) WHERE returned_on IS NULL;
CREATE INDEX idx_open_loans_due ON loans(due_on) WHERE returned_on IS NULL;
CREATE TABLE loan_events (
  id INTEGER PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL CHECK (event_type IN ('BORROW', 'RETURN', 'RENEW')),
  previous_due_on TEXT,
  new_due_on TEXT,
  actor_user_id INTEGER,  -- populated when S3 authentication exists
  occurred_at TEXT NOT NULL
);

-- 003_users.sql: apply an FK-compatible migration strategy for loan_events
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'LIBRARIAN')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**Migration note:** For `loan_events.actor_user_id`, either create `users` in an earlier migration or keep nullable `actor_user_id` without FK until a deliberate table-rebuild migration. Prefer the former if code has not shipped yet. Do not edit already-applied migration files. Session storage uses its chosen maintained library's schema.

Connection bootstrap for **every** SQLite connection: `PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;`. Consider `PRAGMA journal_mode=WAL` on startup on a local disk. Never place a writable SQLite DB on a network share. Keep each transaction short.

### 2.3. Server-side validation

| Field / operation | Rule |
|---|---|
| Book code / reader code | Required, trim, uppercase, allowed pattern `[A-Z0-9_-]{1,32}` (proposed implementation contract), unique in DB including inactive rows. |
| Title / full name | Non-empty after trim, bounded length (e.g. 1–200 chars). |
| Author/category/email/phone | Validate type and reasonable length; email/phone optional until SRS specifies otherwise. |
| Published year | Integer if present, within schema constraint; reject invalid input, never coerce malformed strings to zero. |
| Total quantity | Integer ≥ 0; **new total cannot be less than outstanding loans**. |
| Available quantity | **Not accepted from POST bodies**; computed in service transaction. |
| Search | Contains match on code/title (and reader code/name); case-insensitive **for Vietnamese text**, accents preserved. Normalize NFC and lowercase consistently on write and query. |
| IDs | Positive integers; reject missing/invalid IDs. |
| Archive | `is_active=0`; disallow archiving book/reader with active loans. Existing histories remain readable. |

SQLite's built-in `NOCASE` and `lower()` are ASCII-centric. Do not rely on them alone for Vietnamese title/name case-folding. Maintain `title_search`/`name_search` in application code; search using normalized query. `%query%` may scan for small datasets: benchmark rather than assuming the B-tree index accelerates leading-wildcard `LIKE`.

### 2.4. Invariants checked after every stock-changing transaction

```text
I1: 0 <= books.available_quantity <= books.total_quantity
I2: books.available_quantity = books.total_quantity
    - count(loans where book_id = books.id and returned_on IS NULL)
I3: count(open loans by reader) <= 10
I4: each loan has at most one successful RETURN event
I5: a failed borrow/return/edit cannot partially change stock or history
I6: inactive books/readers cannot be newly borrowed; existing loan history survives
```

Add `npm run db:audit`: **read-only** query comparing actual stock to `total - activeLoans`, plus invalid loan/reader counts. Nonzero exit code on mismatch. Never silently repair production data.

## 3. Critical algorithms and transaction boundaries

### 3.1. Calendar-month due date

Implement `addCalendarMonthsClamped('YYYY-MM-DD', 4) -> 'YYYY-MM-DD'`. Perform calendar arithmetic without timezone-dependent `Date#setMonth` overflow. For target year/month, clamp `day = min(originalDay, daysInTargetMonth)`.

Required test cases:

```text
2026-10-31 + 4 months = 2027-02-28
2023-10-31 + 4 months = 2024-02-29  (leap year)
2026-01-30 + 4 months = 2026-05-30
```

Do not use `+ 120 days` or `+ 14 days`.

### 3.2. Borrow one copy — atomic write transaction

```text
borrow(readerId, bookId, todayLocalDate):
  BEGIN IMMEDIATE
  assert reader exists and active
  assert book exists and active
  assert count(open loans of reader) < 10
  UPDATE books SET available_quantity = available_quantity - 1
    WHERE id = bookId AND is_active = 1 AND available_quantity > 0
  assert exactly 1 row was updated; otherwise rollback (OUT_OF_STOCK)
  INSERT loans(reader_id, book_id, borrowed_on, due_on, returned_on=NULL)
  INSERT loan_events(type=BORROW, loan_id=createdLoan, occurred_at=now)
  COMMIT; return loan and remaining stock
  ON ERROR: ROLLBACK entirely
```

The `count` and decrement must be inside the **same write transaction**. SQLite only allows one writer at a time; `BEGIN IMMEDIATE`/equivalent driver mode ensures two requests cannot both borrow the last copy. No HTTP/network requests inside the transaction.

### 3.3. Return one copy — idempotency-safe rejection

```text
returnLoan(loanId, todayLocalDate):
  BEGIN IMMEDIATE
  SELECT loan (including book_id); reject if absent or already returned
  UPDATE loans SET returned_on=todayLocalDate
    WHERE id=loanId AND returned_on IS NULL
  assert affectedRows=1
  UPDATE books SET available_quantity=available_quantity+1
    WHERE id=bookId AND available_quantity < total_quantity
  assert affectedRows=1
  INSERT loan_events(type=RETURN, loan_id=loanId, occurred_at=now)
  COMMIT
  ON ERROR: ROLLBACK entirely
```

Second return request must produce a controlled conflict and **must not** increment stock or append another successful return event.

### 3.4. Edit book total and archive

- Total edit: lock write transaction; obtain `activeCount`; if `newTotal < activeCount`, reject. Otherwise set `total_quantity = newTotal` and `available_quantity = newTotal - activeCount` atomically. Do not trust stock sent by browser.
- Archive: transactionally reject when an open loan exists; otherwise `is_active=0`. Never delete the row because its loans reference it.
- Renewal (S3): **defer policy-dependent logic** until PO explicitly approves the number of renewals, extension duration, and blocking conditions; then atomically update `due_on`, increment `renew_count`, insert `RENEW` event.
- Overdue predicate: `returned_on IS NULL AND due_on < todayLocalDate` (**strictly** less than, not `<=`). Seed past borrow dates to test four-month loan periods.

## 4. HTTP/UI contract (SSR + form posts)

Proposed contracts for parallel work. If an existing repo already has equivalent stable routes, prefer preserving them and record the difference.

| Method | Route | Purpose | Sprint |
|---|---|---|---|
| GET | `/` | Redirect to `/books` (later optional dashboard) | S1 |
| GET | `/books?q=&page=` | List active books, search code/title, paginate | S1 |
| GET | `/books/new` | Book form | S1 |
| POST | `/books` | Create book | S1 |
| GET | `/books/:id/edit` | Edit form | S1 |
| POST | `/books/:id` | Update book (HTML form; no method-override needed) | S1 |
| POST | `/books/:id/archive` | Soft delete book | S1 |
| GET | `/readers?q=&page=` | List/search readers | S2 |
| GET | `/readers/new` | New reader form | S2 |
| POST | `/readers` | Create reader | S2 |
| GET | `/readers/:id/edit` | Edit form | S2 |
| POST | `/readers/:id` | Update reader | S2 |
| POST | `/readers/:id/archive` | Soft delete reader | S2 |
| GET | `/loans/new` | Borrow form with book/reader selection | S2 |
| POST | `/loans` | Borrow one copy | S2 |
| GET | `/loans?status=` | All loans: open/returned filters | S2 |
| GET | `/readers/:id/loans` | Reader borrowing history | S2 |
| POST | `/loans/:id/return` | Confirm return exactly once | S2 |
| GET | `/loans/overdue` | Open overdue loans | S3 |
| POST | `/loans/:id/renew` | Renew per approved policy | S3 |
| GET/POST | `/login` | Login form/session creation | S3 |
| POST | `/logout` | Invalidate session | S3 |
| GET | `/reports` | Basic counts | S4 |

**HTTP response contract:** Successful mutation → `303 See Other` to appropriate GET + flash message (Post/Redirect/Get). Validation error → render same form with preserved safe values and per-field messages (`400`/`422`). Business conflict → visible user-friendly message (`409` or `422` consistently). Unknown item → `404`. Unexpected error → generic `500` with server-side logging; no SQL/stack trace in page. Use meaningful Vietnamese copy.

**Controller view-model contract:** `{ pageTitle, currentUser, flash, values, errors, data, pagination }` as relevant. Controllers must not directly write SQL. Parse `q`, `page` and `status` using validation with bounded pagination. EJS should output escaped interpolations (`<%= ... %>`), never raw user-controlled HTML.

### 4.1. Roles/security (S3)

- `ADMIN`: manage account permissions (only if user-management UI is approved); may perform librarian actions.
- `LIBRARIAN`: book/reader/loan operations; reports visibility decided by PO.
- Before S3 authentication exists, run S1/S2 **only on localhost/private development network**, not as a public website.
- Gate all private GET/POST routes server-side after S3, not only by hiding navigation. Public route: login; optional public book catalog requires an explicit product decision.
- Add CSRF defense for state-changing form POSTs, password hash, throttled login, session rotation, authorization integration tests, parameterized SQL, and safe cookie configuration **before any public deployment**.
- Apply `app.set('trust proxy', ...)` deliberately only when deploying behind a trusted reverse proxy; avoid unconditional trust of spoofed forwarding headers.

## 5. Required screens and UI system

Build the screens listed in Section 4 with shared partials, **not** a generic admin dashboard template substituted for working flows.

**Core components:** app header/navigation, page heading, search field, data table (pagination), labelled form fields, inline errors, stock/status badge, confirmation dialog, flash toast/alert, empty state, overdue warning, loading/disabled submit state.

**Non-negotiable UX behavior:**

- Books table shows code, title, author, category, **total/available**, status and actions.
- Borrow form chooses exactly one active reader and one available book; preview due date; clear reason on rejection; display remaining stock after success.
- Loan history shows book, reader, borrowed date, due date, return date, status; returned loans are not deletable.
- Return action requests confirmation, prevents accidental repeat; disabled controls are **not** a substitute for server checks.
- All inputs have labels, visible focus, keyboard access, helpful inline messages and responsive table overflow. UI text in Vietnamese.
- Use one design token stylesheet (`src/public/css/tokens.css`) and reusable EJS partials so parallel contributors do not invent separate themes.

**AI skills: use selectively, not all at once.** These are external/community agent skills; check their instructions and compatibility before installing. They do not execute by virtue of appearing here.

| Skill | When to use | Expected output |
|---|---|---|
| [Anthropic `frontend-design`](https://github.com/anthropics/skills) | First book-list/form design + shared EJS/CSS | One consistent interface direction and reusable components |
| [Vercel `web-design-guidelines`](https://github.com/vercel-labs/agent-skills) | Review completed screens | File-specific accessibility, usability, responsive findings |
| [Anthropic `webapp-testing`](https://github.com/anthropics/skills) | Browser smoke tests with locally running app | Reproducible E2E steps, screenshot/trace evidence |
| [Impeccable](https://github.com/pbakaus/impeccable) **or** [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Optional polish/design exploration, after core works | Targeted improvements, no change to business rules |

For backend/database/security, prioritize **repository conventions + this spec + automated tests + official library docs** over an unverified third-party skill. If creating one repo-local agent instruction file, use `AGENTS.md` pointing to this spec, with explicit domain invariants and the task reporting contract. Avoid proliferating speculative custom skills.

## 6. Repository layout (target, adapt to existing code)

```text
GoodLib/
├── initial.md                   # THIS implementation contract
├── AGENTS.md                    # Short agent entry point linking to initial.md
├── README.md                    # Install/run/migrate/seed/test/demo
├── .env.example                 # Only non-secret example values
├── .nvmrc
├── package.json
├── package-lock.json
├── eslint.config.js
├── .github/workflows/ci.yml
├── docs/
│   ├── decisions.md             # Approved business-rule decisions
│   └── srs.md                   # Updated acceptance criteria (if maintained)
├── db/
│   ├── migrations/001_books.sql
│   ├── migrations/002_readers_loans.sql
│   ├── migrations/003_users.sql
│   └── seeds/demo.js
├── scripts/
│   ├── migrate.js
│   └── audit-stock.js
├── src/
│   ├── app.js                   # Express setup; exported for Supertest
│   ├── server.js                # listen(); avoid import-side effects in app.js
│   ├── config/
│   ├── db/connection.js
│   ├── routes/{books,readers,loans,auth,reports}.js
│   ├── controllers/{book,reader,loan,auth,report}Controller.js
│   ├── services/{book,reader,loan,auth,report}Service.js
│   ├── repositories/{book,reader,loan,user}Repository.js
│   ├── middleware/{validate,auth,errorHandler}.js
│   ├── validators/{book,reader,loan}Schemas.js
│   ├── utils/{date,normalize,errors}.js
│   ├── views/
│   │   ├── partials/{header,nav,formField,flash,table}.ejs
│   │   ├── books/{index,form}.ejs
│   │   ├── readers/{index,form,history}.ejs
│   │   ├── loans/{index,new,overdue}.ejs
│   │   ├── auth/login.ejs
│   │   ├── reports/index.ejs
│   │   └── errors/{404,500}.ejs
│   └── public/{css,js}/
└── tests/
    ├── unit/
    ├── integration/
    ├── concurrency/
    ├── e2e/
    └── fixtures/
```

**Required npm commands:** `dev`, `start`, `db:migrate`, `db:seed`, `db:audit`, `lint`, `format:check`, `test`, `test:e2e`. Tests must use an isolated temporary SQLite DB; seed must not overwrite a real DB. DB migrations must be idempotent at the runner/ledger level and work on a fresh clone.

## 7. Acceptance tests (must automate high-risk cases)

| ID | Test case | Expected outcome |
|---|---|---|
| `BK-01` | Create valid book, total 3 | Stored total=3, available=3 after restart |
| `BK-02` | Duplicate code, missing title, negative/noninteger quantity | Validation/constraint rejects; no partial insert |
| `BK-03` | Edit total 3→1 while 2 copies are on loan | Reject; total and available unchanged |
| `BK-04` | Archive book with an open loan | Reject; existing loan preserved |
| `BK-05` | Search case variation of Vietnamese title | Correct case-insensitive match with accents preserved |
| `RD-01` | Duplicate reader code; archive reader with active loan | Reject correctly; unchanged data |
| `LN-01` | Borrow one available book | One loan and `BORROW` event; stock -1; due +4 calendar months |
| `LN-02` | Reader has 9 open loans → borrow 10th | Success; count=10 |
| `LN-03` | Reader has 10 open loans → attempt 11th | Conflict; count and stock unchanged |
| `LN-04` | Borrow unavailable/inactive book or inactive reader | Rejected; no loan, event or stock change |
| `LN-05` | Two independent DB connections race for last copy | Exactly one success; no negative stock, one new loan |
| `LN-06` | Inject failure after stock decrement but before loan/event insert | Rollback restores stock; no new loan/event |
| `LN-07` | Return once | Loan returned; stock +1; one `RETURN` event |
| `LN-08` | Return same loan twice or simultaneously | Only one success; stock never exceeds total |
| `DT-01` | 2026-10-31 + 4 months | 2027-02-28 |
| `DT-02` | 2023-10-31 + 4 months | 2024-02-29 |
| `DB-01` | Restart application after writes | All books, readers, loans, quantities, history persist |
| `SEC-01` | Unauthenticated or wrong-role request after S3 | Redirect/403; no unauthorized read/write |
| `SEC-02` | Forged POST lacking CSRF token after S3 | Rejected without mutation |
| `OV-01` | Open loan due yesterday vs today | Only yesterday appears overdue |
| `AUD-01` | Run read-only audit on normal DB and intentionally corrupted test DB | Clean passes; corruption reported with nonzero exit code |

Also test 404/400/409 cases, output escaping (stored HTML/XSS payload), basic keyboard navigation, and missing/error/empty UI states. For the slide's **search under 2 seconds** requirement, define hardware, dataset size, query samples and p95 measurement; **do not claim success without benchmarks**. For the **borrow/return in ≤3 main actions** target, verify with a real UI walkthrough.

## 8. WBS-to-code execution plan

Use WBS IDs as PR/issue names. S3/S4 tasks are **coarse estimates** in the sheet and need refinement during their planning meetings. Do not report a WBS task complete without acceptance/test evidence.

| Sprint / date | WBS | Deliverable in code |
|---|---|---|
| **S1 28/10–10/11** | `S1-01` | Confirm book fields, validations and acceptance tests |
| | `S1-02` | Express/EJS/SQLite bootstrap, migration runner, README, demo seed |
| | `S1-03` | Working books list/search EJS UI |
| | `S1-04` | Create-book validation/controller/service/repository/form |
| | `S1-05` | Update quantity safely; soft-archive book |
| | `S1-06` | Case-insensitive code/title contains search |
| | `S1-07` | CRUD/search/negative test cases + seed |
| | `S1-08` | Integration smoke and clean-install verification |
| | `S1-09` | Run on second machine, capture reproducible defects |
| | `S1-10` | Review data integrity, routes and setup instructions |
| **S2 11/11–24/11** | `S2-01` | Confirm max-10, four-month clamp, loan semantics |
| | `S2-02` | Readers migration + CRUD/archive validations |
| | `S2-03` | Reader list/form/search EJS UI |
| | `S2-04` | Loans migration + transactional borrow + stock checks |
| | `S2-05` | Borrow form, due display and reader loan history |
| | `S2-06` | Transactional return-once endpoint and event history |
| | `S2-07` | Boundaries, rollback, race, date and restart tests |
| | `S2-08` | Stock/status/error feedback and UX fixes |
| | `S2-09` | End-to-end demo smoke with issue log |
| | `S2-10` | Review constraints and inventory consistency |
| **S3 25/11–08/12** | `S3-01` | Renewal after policy approval + event/test coverage |
| | `S3-02` | Overdue query/screen with historical loan fixtures |
| | `S3-03` | Secure login/logout, persistent session, server-side RBAC |
| | `S3-04` | Integrated auth/renew/overdue/regression tests |
| **S4 09/12–22/12** | `S4-01` | Counts: total titles, borrow/return transactions, overdue loans |
| | `S4-02` | UI quality, error/empty/responsive states |
| | `S4-03` | Full smoke/regression; defect fixes and results |
| | `S4-04` | README, schema/architecture notes, clean-machine handoff |
| | `S4-05` | Deterministic demo dataset/script and screenshots |
| | `S4-06` | Acceptance checklist, release candidate (no unapproved deploy) |

**Sprint gate:** Feature/test/README work completes **the day before** each review: 09/11, 23/11, 07/12, 21/12; reviews 10/11, 24/11, 08/12, 22/12. The plan's sheet status does **not** prove any task is actually done. Inspect Git/CI before assigning or completing work.

## 9. Engineering completion criteria

A task is **Done** only when:

- Its route/service/schema/UI contract and acceptance criteria are satisfied.
- DB is consistent after failure; migrations work from a fresh test DB and preserve existing data on upgrade.
- Relevant automated tests pass (include concrete command/output); no regression in previously shipped core flows.
- Validation, server-side authorization as applicable, errors, accessibility and empty states are handled.
- PR contains WBS ID, changed files, testing evidence, migrations/behavior changes, and at least one reviewer approval before merge.
- `README.md` and approved SRS/decision log are updated if behavior/contract changed.

**Minimum CI jobs:** `npm ci` → `npm run lint` → `npm run test` → boot/migrate clean ephemeral DB → application smoke. Run Playwright where browser tooling is available; no fake pass status if skipped. Do not commit secrets, personal patron data, `.db` files containing real data, or `node_modules`.

**Deployment assumption:** One Node/Express server and one local persistent SQLite file. Use a DB-aware backup mechanism (SQLite backup API or `VACUUM INTO`) and verify a test restore. No public exposure until S3 security controls are complete.

## 10. Recommended first agent request

```text
Read initial (1).md and inspect the current GoodLib repository before editing.
Identify the requested WBS ID, existing implementations, dependencies,
contract mismatches, and tests. Follow the fixed Express + EJS + SQLite
architecture and preserve all domain invariants.

Implement ONLY [WBS-ID]: [acceptance criteria].
Add validation, negative/boundary tests, and required migrations.
Do not implement speculative features from the slide deck or silently
change the 10-loan / four-calendar-month rules.

Run the relevant checks and report the actual results. Return:
1) files changed, 2) behavior and API/schema decisions,
3) tests and outputs, 4) remaining risks/product decisions,
5) draft PR summary linked to [WBS-ID].
No production DB changes, merges, deployments or destructive operations.
```
