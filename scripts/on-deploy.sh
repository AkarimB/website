#!/bin/bash
# Post-deploy: executed by post-receive hook after checkout.
# - npm ci if package.json / package-lock.json changed
# - Fix ownership to nodeapp
# - NO auto-restart: manually restart services after reviewing changes
set -euo pipefail

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

cd /srv/site

echo "==[1/3] Dependencies =="
DEPS_SHA="$(cat package.json package-lock.json | shasum -a 256 | cut -d' ' -f1)"
PREV_SHA="$(cat /srv/.site_deps.sha 2>/dev/null || echo none)"
if [ "$DEPS_SHA" != "$PREV_SHA" ]; then
  echo "-- npm ci"
  npm ci --no-audit --no-fund
  echo "$DEPS_SHA" > /srv/.site_deps.sha
else
  echo "-- deps unchanged, npm ci skipped"
fi

echo "==[2/3] Ownership =="
chown -R nodeapp:nodeapp /srv/site

echo "==[3/3] Done =="
echo "-- Review changes, then restart services manually:"
echo "   systemctl restart site"
