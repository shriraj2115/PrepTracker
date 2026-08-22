@echo off
cd /d "%~dp0"
echo Starting PrepTracker on http://localhost:5588 ...
echo Keep this window open while you study. Close it when done.
start "" "http://localhost:5588"
npx --yes http-server . -p 5588 -c-1
