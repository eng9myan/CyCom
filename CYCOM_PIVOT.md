# Cycom ERP — Architecture Pivot

**Date:** 2026-06-15
**Decision:** Cycom ERP is built on **Odoo 19 + Anabtawi custom modules**, with the Next.js UI preserved as the user-facing layer.

---

## TL;DR

| Layer | What it is | Where |
|---|---|---|
| **UI (unchanged)** | Next.js 16 + React 19 — your Cycom design system | `cycom-erp/` |
| **Backend** | Full Odoo 19 source (LGPL) + 75 custom modules + `cycom_theme` + `cycom_core` | `cycom-platform/` |
| **Bridge** | JSON-RPC over Next.js `/api/odoo/*` route handlers | `cycom-erp/lib/odoo.ts`, `cycom-erp/lib/odooServer.ts` |
| **Obsolete** | FastAPI scratch backend (Phase A–D work earlier today) | `cycom-backend.archive/` |

The visual design of the Cycom Next.js app is preserved exactly. The login screen looks identical. The HR Employees page looks identical. The only change is that **data now comes from a real ERP** instead of hardcoded `INITIAL_*` arrays.

---

## Cycom Setup Experience Doctrine *(product principle — non-negotiable)*

> Cycom must not simply duplicate ERP functionality. Every configuration-heavy area must be redesigned with **Smart Setup Wizards, Industry Templates, AI Configuration Assistants, Guided Business Questions, and Auto-Generated Configurations**. Any setup that normally requires an ERP consultant must be executable by a business user with no ERP experience. Advanced configuration must remain available for power users, but the default Cycom experience must reduce implementation effort by **at least 80%** while supporting 100% of enterprise functionality.

This is Cycom's primary differentiator. Every other ERP competes on features; Cycom competes on **enterprise power with consumer-level simplicity**. If a Cycom module page assumes pre-existing config (chart of accounts, payroll rules, tax structures, warehouse zones, POS pricelists, employee structure, fiscal periods, multi-company hierarchy, etc.), it is **not done** until it ships with a Setup Wizard.

### How this lands in the architecture

- **Wizards live in the Next.js layer**, not in Odoo's backend. They preserve the Cycom design language and use the existing `glass-card`, badge, and color system.
- Wizards call Odoo via `lib/odoo.ts` to perform the actual configuration (`create`/`write`/`call` against the underlying setup models).
- Each wizard has three layers:
  1. **Business-language questions** ("How many stores? Where? Who's paid monthly vs. hourly? Which products do you sell?")
  2. **Industry template** — pre-populated defaults per vertical (Retail, Wholesale/Distribution, Manufacturing, Services, Hospitality).
  3. **AI Configuration Assistant** — an LLM-backed advisor that takes free-text input and proposes a config diff *before* applying.
- **Every wizard ships an escape hatch**: a "Configure manually" link that drops directly to the equivalent Odoo settings page. Never hide complexity an admin might legitimately need.
- **Measurement:** track wizard step count vs. the equivalent raw Odoo setup screens. If a Cycom wizard takes more than ~20% of the clicks of the Odoo flow, it's not done yet.

### Modules that absolutely require wizards (priority order)

| Wizard | Replaces (in raw Odoo, consultant-grade complexity) | Industry template inputs |
|---|---|---|
| **Company Setup** | Multi-company hierarchy, branches, fiscal year, currencies | Industry, country, group structure |
| **Chart of Accounts** | Manual COA + tax setup + journal config | Country tax regime, business model |
| **Payroll Structure** | Salary rules, inputs, contribution registers, work entry types | Country labor law, pay frequency, overtime rules |
| **Warehouse & Locations** | Warehouse + location + putaway + routes + reordering rules | Number of sites, business type (retail vs. mfg) |
| **POS Configuration** | Session config + pricelists + payment methods + discount policy + restrictions | Store count, payment types, loyalty? |
| **Sales Pipeline** | Stages + teams + commission + approval thresholds | Sales motion (B2B/B2C), team structure |
| **Procurement** | Vendors + RFQ flow + approval matrix + replenishment | Vendor count, approval policy |
| **Manufacturing** | BOM + routings + work centers + costing method | Manufacturing type (discrete/process/food) |
| **HR Structure** | Departments + positions + competency + onboarding flow | Org size, industry |
| **Permissions & Roles** | RBAC matrix per module | Department list, sensitivity policy |

These are the implementation tickets that turn the doctrine into shipped product. Each is one wizard component (likely under `cycom-erp/app/setup/<area>/`) plus a small server-side action that orchestrates the Odoo calls.

> **Status: all 10 doctrine wizards shipped.** Company, Chart of Accounts, Payroll, Warehouse, POS, Sales, Procurement, Manufacturing, HR Structure, and Permissions are live under `cycom-erp/app/setup/<area>/`, each with a matching orchestrator under `cycom-erp/app/api/odoo/setup/<area>/`. Every wizard reads tenant prefs from `cycom.tenant.*` config params, applies industry-template defaults, installs the right Anabtawi + Odoo modules, and persists a `cycom.tenant.setup.<area>_done` flag. Shared wizard shells live under `components/setup/`. Run the Setup Hub at `/setup` to walk them in order.

### What this changes about "wire up the modules"

The earlier section *"What 'all modules' looks like under this architecture"* is **incomplete on its own.** For every module page we wire to read data, we also need to ask: *what's the setup story?* If a new tenant can't get to a useful page without consultant-level Odoo knowledge, we add a Setup Wizard before declaring the module done.

---

## Why we pivoted

The earlier session direction was to build a from-scratch FastAPI backend that matched the features mocked in the Next.js UI. After surveying both codebases on disk, it became clear:

- `D:\Anabtawi-Group-main\` already contained **75 Odoo custom modules** implementing every feature the Next.js UI was mocking (POS pledge, advance orders, biometric attendance, weekly OT eligibility, mass reconciliation, warehouse restriction, discount-exception approval, etc.).
- The Next.js UI was the **redesign target** for that Odoo deployment, not a new ERP being built from zero.
- Reimplementing in FastAPI would have been a 5–10 person-year effort to reproduce what Odoo + Anabtawi modules already provide today, and would never reach SAP/Workday parity from scratch.

The right move was to keep the UI, drop in Odoo as the real backend, brand it as Cycom, and wire the two together.

---

## What changed in the repo this session

### Created — `cycom-platform/` (the Odoo distribution)
- `docker-compose.yml` — Postgres 16 + `odoo:19` images
- `config/odoo.conf` — addons_path points to `./addons/anabtawi`, `cycom_theme`, `cycom_core`
- `addons/anabtawi/` — **75 modules** copied verbatim from `D:\Anabtawi-Group-main\Anabtawi-Group-main\` (93 MB)
- `addons/cycom_theme/` — new minimal Odoo theme addon: Cycom-branded login screen, custom CSS variables, "Cycom ERP" page titles
- `addons/cycom_core/` — placeholder addon for cross-cutting tweaks; currently empty, depends on `cycom_theme`
- `.env.example`, `.gitignore`, `README.md`

### Created — Next.js Odoo bridge
- `cycom-erp/lib/odoo.ts` — typed browser client (`login`, `whoAmI`, `searchRead`, `create`, `write`, `unlink`, `call`)
- `cycom-erp/lib/odooServer.ts` — server-only helpers that proxy to Odoo via JSON-RPC and translate session cookies. Browser never speaks to Odoo directly → no CORS issue and `session_id` stays in an httpOnly cookie.
- `cycom-erp/app/api/odoo/auth/route.ts` — POST → Odoo `/web/session/authenticate`
- `cycom-erp/app/api/odoo/me/route.ts` — POST → Odoo `/web/session/get_session_info`
- `cycom-erp/app/api/odoo/logout/route.ts` — POST → Odoo `/web/session/destroy`
- `cycom-erp/app/api/odoo/call/route.ts` — POST → Odoo `/web/dataset/call_kw` (generic model call)
- `cycom-erp/context/AuthContext.tsx` — `useAuth()` hook + `<AuthProvider>` for session state
- `cycom-erp/.env.example` — `ODOO_URL`, `ODOO_DB`

### Modified — Next.js (UI design preserved 100%)
- `cycom-erp/app/layout.tsx` — wrapped in `<AuthProvider>`
- `cycom-erp/app/login/page.tsx` — `handleLogin` now calls Odoo (was `setTimeout`). Visual design unchanged except a small error banner appears only on failure.
- `cycom-erp/app/hr/employees/page.tsx` — fetches from Odoo `hr.employee` via `searchRead`. Visual design unchanged; added loading + error states that follow the same Cycom design language.

### Archived
- `cycom-backend/` → `cycom-backend.archive/` — the from-scratch FastAPI work (foundation + HR/Payroll/Attendance/Finance/Sales/Purchase/Inventory/POS/CRM models, schemas, routers). Kept for reference; not used.

---

## How to run it

```bash
# 1) Start Odoo + Postgres
cd "D:/Cycom ERP - Copy/cycom-platform"
cp .env.example .env
docker compose up -d
# wait ~20 seconds for first init

# 2) Create the cycom database
# → http://localhost:8069 → "Manage Databases" → create DB named "cycom"
# → master password lives in config/odoo.conf

# 3) Install the addons
# In Apps → "Update Apps List" → search "Cycom Theme" → install
# Then install Anabtawi modules from Apps. Most depend on stock modules; Odoo will pull those in.

# 4) Start the Next.js UI
cd "D:/Cycom ERP - Copy/cycom-erp"
cp .env.example .env.local
npm install
npm run dev
# → http://localhost:3000

# 5) Log in
# Use the Odoo admin user you created in step 2. The Next.js login posts to /api/odoo/auth,
# which proxies to Odoo's /web/session/authenticate.
```

---

## Trade-offs you should know about

1. **Odoo version lock.** All 75 Anabtawi modules declare `'version': '19.0.x.x.x'`. Use `odoo:19`. Don't drift to master.
2. **Licensing.** Odoo Community = LGPLv3. You can brand the system "Cycom ERP" and sell/host it. Anything you derive from Odoo's core stays LGPL (give recipients the source). Your custom `anabtawi/*` and `cycom_theme/*` modules can remain proprietary if you keep them in separate addon directories.
3. **External Python deps.** `hs_zk_attendance` declares `external_dependencies: {python: ['zk']}`. If you actually use ZK biometric hardware, extend the Odoo Docker image to `pip install pyzk`. Skipped here.
4. **Odoo Enterprise features are paid.** Advanced accounting/MRP II/helpdesk SLA/IoT box/marketing automation in your prompt are Enterprise-only. Community covers ~70% of the listed scope; OCA modules fill many gaps for free.
5. **UX redesign scope.** Your Next.js frontend stays as the primary UI — it doesn't need any redesign work. The Odoo backend admin UI is only lightly re-skinned by `cycom_theme`; a deeper Odoo-side redesign would be a separate project if you ever exposed Odoo's UI to end users.
6. **One module wired so far.** Only the login flow + HR Employees page are connected to Odoo. The other ~28 module pages still render hardcoded `INITIAL_*` data. Wiring the rest is a per-module job (find the matching Odoo model, list fields, map onto the existing UI shape) — none of it changes the visual design.

---

## What "all modules" looks like under this architecture

For each of the remaining Next.js module pages (`accounting`, `attendance`, `crm`, `documents`, `expenses`, `fleet`, `helpdesk`, `hr/*`, `inventory`, `knowledge`, `maintenance`, `marketing`, `payroll`, `planning`, `plm`, `portal`, `pos`, `project`, `purchase`, `quality`, `recruitment`, `sales`, `subscriptions`):

1. Identify the matching Odoo model(s) — almost all already exist (`account.move`, `hr.attendance`, `crm.lead`, `documents.document`, `hr.expense`, `fleet.vehicle`, `helpdesk.ticket`, `stock.picking`, `mrp.bom`, `pos.order`, `project.task`, `purchase.order`, `quality.check`, `marketing.campaign`, `hr.applicant`, `sale.order`, `sale.subscription`, etc.).
2. In the page, replace the hardcoded `INITIAL_*` array with a `useEffect` + `searchRead('that.model', domain, fields, opts)` — exactly the pattern in `hr/employees/page.tsx`.
3. Keep every JSX node, Tailwind class, and Framer Motion transition untouched.
4. For domain-specific actions (approve, generate payslip, dispatch transfer, etc.) call `create` / `write` / `call` with the appropriate Odoo method.

That's the entire pattern. It's mechanical work, not architectural work. Each page is ~30 minutes to wire if the Odoo fields are obvious.

---

## What to look at next, in order

1. **Boot the platform** (steps 1–5 above) — verify Odoo starts, `cycom_theme` installs cleanly, you can log in via Next.js.
2. **Verify HR Employees works** — confirm the directory grid shows real Odoo employees with the Cycom design intact.
3. **Triage Anabtawi modules** — install them in dependency order. Some may need fixes; record which ones in `cycom-platform/README.md`. The one to watch is `hr_attendance_geofence_config` (license string differs).
4. **Wire 3–5 more pages** as small, predictable chunks: Accounting (`account.move`), Sales (`sale.order`), Inventory (`stock.picking`), POS (`pos.order`), Payroll (`hr.payslip`). Same pattern as HR Employees.
5. **Delete `cycom-backend.archive/`** once you're sure nothing useful is in it.

---

*The earlier audit at [AUDIT_REPORT.md](AUDIT_REPORT.md) is now historical — it analyzed the pre-pivot state. Use this file as the source of truth going forward.*
