#!/bin/sh
# PrepTracker launcher for macOS/Linux
cd "$(dirname "$0")"
echo "Starting PrepTracker on http://localhost:5588 ..."
echo "Keep this window open while you study. Press Ctrl+C to stop."
( sleep 1 && (open http://localhost:5588 2>/dev/null || xdg-open http://localhost:5588 2>/dev/null) ) &
npx --yes http-server . -p 5588 -c-1
