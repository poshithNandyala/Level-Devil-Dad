#!/usr/bin/env bash
# Human-timing fairness model over one city's stages (docs/HANDOFF.md section 6, docs/CITY-MODULE.md).
# Prints per stage the win rate at quick/average/relaxed lag, and per stretch between checkpoints.
#   bash scripts/dev/fair.sh PAT            every PAT stage with a route
#   bash scripts/dev/fair.sh PAT-02,PAT-05  just these stages
#   LDD_N=80 bash scripts/dev/fair.sh PAT   more runs per lag (default 40)
set -euo pipefail
cd "$(dirname "$0")/../.."
[ -f /local/home/saiposh/personal/games/_template/scripts/env.sh ] && source /local/home/saiposh/personal/games/_template/scripts/env.sh
arg="${1:?usage: scripts/dev/fair.sh <CODE> | <ID,ID,...>}"
if [[ "$arg" == *-* ]]; then export LDD_IDS="${arg^^}"; else export LDD_CITY="${arg^^}"; fi
LDD_FAIR=1 npx vitest run tests/fair.test.ts --silent=false 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E '^[A-Z]{3}-[0-9]{2}:|^  stretches|FAIL|Error' || true
