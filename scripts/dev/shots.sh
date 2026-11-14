#!/bin/bash
# record + shoot a stage route and make a sheet: scripts/dev/shots.sh ID [fracs]
ID=$1; FR=${2:-0.04,0.1,0.16,0.24,0.32,0.4,0.48,0.56,0.64,0.72,0.8,0.88,0.94,0.98,0.995}
node scripts/dev/routeshots.mjs $ID $FR > /dev/null 2>&1
files=""
for f in ${FR//,/ }; do files="$files shots/route/$ID-${f/./}.png"; done
python3 scripts/dev/sheet.py shots/route/$ID-sheet.png 3 $files
