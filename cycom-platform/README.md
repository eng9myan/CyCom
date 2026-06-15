# Cycom Platform — Odoo 19 + Cycom Customizations

This is the **backend** for Cycom ERP. It's an Odoo 19 distribution plus your 75 Cycom custom modules, with a `cycom_theme` addon that re-skins the Odoo backend as Cycom.

The Next.js frontend at `../cycom-erp/` is the **user-facing UI** and keeps its existing design — it talks to this Odoo via JSON-RPC.

## First-time run

```bash
cd cycom-platform
cp .env.example .env
# edit .env if you want non-default DB credentials
docker compose up -d
# wait ~15s on first boot
# open http://localhost:8069 — create the cycom database, master pwd is in config/odoo.conf
```

Once the DB is created, install addons in this order from Apps:

1. `cycom_theme` (installs base + branding)
2. `cycom_core` (placeholder — extension point for cross-cutting tweaks)
3. The Cycom modules you want (they depend on stock Odoo modules like `hr_payroll`, `point_of_sale`, `stock`, `sale`, etc., which Odoo will pull in automatically).

> Click **Apps** → **Update Apps List** first so the system sees `addons/`.

## Layout

```
cycom-platform/
├── docker-compose.yml          # Odoo 19 + Postgres 16
├── config/odoo.conf            # addons_path lists every directory under addons/
├── addons/
│   ├── cycom_modules/          # 75 Cycom custom modules (HR, POS, payroll, sales, stock, ...)
│   ├── cycom_theme/            # brands the Odoo backend as Cycom
│   └── cycom_core/             # extension point (currently empty)
├── odoo-source/                # Full Odoo 19 source, cloned from github.com/odoo/odoo
│                               # — mounted into the container as a secondary addons path
│                               # — gitignored; clone via `bash scripts/clone-odoo.sh`
├── odoo-data/                  # filestore (gitignored)
└── postgres-data/              # DB files (gitignored)
```

## Caveats — read before installing

- The Cycom modules target **Odoo 19** (`version: '19.0.x.x.x'` in their manifests). Make sure you stay on `odoo:19`.
- `hs_zk_attendance` declares an external Python dependency on the `zk` package. If you actually use ZK biometric hardware you'll need to extend the Odoo image to install `pyzk`. Skipping for now.
- One module (`hr_attendance_geofence_config`) has the license string `"Other proprietary"` instead of `LGPL-3` — it will still install but flag at audit time.
- Some Cycom modules depend on each other (e.g. `pos_pledge` → `pos_advance_order`). Install bottom-up if you hit dependency errors.

## What's next

- `cycom_theme` currently re-skins the backend. The Next.js frontend at `../cycom-erp/` keeps its design and talks to this Odoo via JSON-RPC (see `../cycom-erp/lib/odoo.ts`).
- The old `../cycom-backend/` (FastAPI) is obsolete under this architecture — see `../CYCOM_PIVOT.md`.
