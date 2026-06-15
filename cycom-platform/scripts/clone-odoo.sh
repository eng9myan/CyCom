#!/usr/bin/env bash
# Clone the full Odoo 19 community source into ./odoo-source/ for in-repo visibility and
# customization. The docker-compose.yml mounts this directory into the container at
# /mnt/odoo-source and odoo.conf adds it as a secondary addons path, so any module under
# odoo-source/addons/ becomes installable alongside the cycom_modules/ tree.
#
# Safe to re-run: skips if odoo-source/ already contains a checkout. Use git pull manually
# inside odoo-source/ to update.

set -euo pipefail
cd "$(dirname "$0")/.."

if [ -d odoo-source/.git ]; then
  echo "odoo-source/ already cloned. Pull manually if you need updates."
  exit 0
fi

echo "Cloning Odoo 19 (community) — this is several hundred MB, expect 1-3 minutes…"
git clone --depth=1 --branch 19.0 --single-branch https://github.com/odoo/odoo.git odoo-source

echo "Done. odoo-source/ is mounted into the container at /mnt/odoo-source."
echo "Restart the stack to pick up new addons: docker compose restart odoo"
