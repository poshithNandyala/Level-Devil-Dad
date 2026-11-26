#!/usr/bin/env bash
# Re-freeze a city's behaviour snapshot (tests/cities/_frozen/<code>.json) after changing it ON PURPOSE.
#   bash scripts/dev/refreeze.sh TVM      (or TVM,KVT, or all)   ==  npm run refreeze -- TVM
# Then look at the diff: every changed number should be one you meant to change.
set -euo pipefail
cd "$(dirname "$0")/../.."
[ -f /local/home/saiposh/personal/games/_template/scripts/env.sh ] && source /local/home/saiposh/personal/games/_template/scripts/env.sh
LDD_REFREEZE="${1:?usage: scripts/dev/refreeze.sh <CODE>[,<CODE>...] | all}" npx vitest run tests/frozen-behaviour.test.ts
git --no-pager diff --stat -- tests/cities/_frozen
