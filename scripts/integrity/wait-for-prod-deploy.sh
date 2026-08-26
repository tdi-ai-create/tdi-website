#!/bin/sh
# Waits for the newest production deployment to stop building, then reports it.
# Usage: sh scripts/integrity/wait-for-prod-deploy.sh
i=0
while [ "$i" -lt 45 ]; do
  line=$(npx vercel ls teachersdeserveit --scope raes-projects-94e0788c 2>/dev/null | grep -i "production" | head -1)
  case "$line" in
    *Building*|*Queued*) : ;;
    "") : ;;
    *) echo "PRODUCTION DEPLOY SETTLED"; echo "$line"; exit 0 ;;
  esac
  sleep 20
  i=$((i + 1))
done
echo "TIMED OUT waiting for the production deploy"
npx vercel ls teachersdeserveit --scope raes-projects-94e0788c 2>/dev/null | head -6
exit 1
