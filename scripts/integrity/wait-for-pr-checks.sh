#!/bin/sh
# Waits for a pull request's checks to settle, then prints the result.
# Usage: sh scripts/integrity/wait-for-pr-checks.sh 206
PR="$1"
i=0
while [ "$i" -lt 45 ]; do
  pending=$(gh pr view "$PR" --json statusCheckRollup --jq '[.statusCheckRollup[] | select((.conclusion // .state) as $s | $s == "PENDING" or $s == "IN_PROGRESS" or $s == "")] | length')
  if [ "$pending" = "0" ]; then
    echo "CHECKS SETTLED"
    gh pr view "$PR" --json statusCheckRollup,mergeStateStatus --jq '"state: \(.mergeStateStatus)", (.statusCheckRollup[] | "\(.name // .context): \(.conclusion // .state)")'
    exit 0
  fi
  sleep 20
  i=$((i + 1))
done
echo "TIMED OUT after 15 minutes"
gh pr view "$PR" --json statusCheckRollup --jq '.statusCheckRollup[] | "\(.name // .context): \(.conclusion // .state)"'
exit 1
