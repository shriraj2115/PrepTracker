# PrepTracker

A minimal, local exam-prep dashboard for CAT, XAT, MAH CET, NMAT, SBI PO, IBPS PO, RBI Grade B, SEBI Grade A, SSC CGL and RRB NTPC. Runs entirely on your PC — no account, no internet required except to open the actual mock-test links and load fonts/charts.

## How to run it

**Windows** — double-click `start.bat`. It opens `http://localhost:5588` in your browser and keeps a local server running in the window it opens. Keep that window open while you study; closing it stops the server (your saved data is not affected).

**Mac/Linux** — open a terminal in this folder and run:
```
sh start.sh
```

Both scripts need [Node.js](https://nodejs.org) installed (for `npx http-server`). If you don't have Node and don't want to install it, you can instead just double-click `index.html` to open it directly in your browser — everything works except the free-resource list will use its smaller built-in fallback instead of `data/resources.json`.

**Important:** always open the app the same way (same shortcut, same URL). Your data is saved in the browser tied to that exact URL — opening it a different way (e.g. sometimes via the server, sometimes by double-clicking the file) looks like separate apps with separate data.

## Where your data lives

Everything — mocks, scores, streaks, settings — is stored locally in your browser's storage (`localStorage`). Nothing is uploaded anywhere. This also means:
- Data is per-browser. If you switch browsers or computers, it won't follow you automatically.
- Clearing your browser's site data for this app will erase it.

**Back up regularly:** Settings → Export JSON Backup downloads a file you can restore later via Settings → Import JSON Backup. Do this before clearing browser data or moving to a new PC.

## What's in the box

- **Dashboard** — today's study plan, exam countdowns, weak-area alerts, revision queue, streak.
- **Enter Score** — 4-field mock/sectional entry (score, attempted, correct, time); everything else (accuracy, attempt rate, error rate, trend, readiness, recommendation) is calculated automatically.
- **Analytics** — score trends, section-strength radar, weakness ranking, study-hours chart, readiness gauges.
- **Resources** — a curated list of real, checked free mock/practice links per exam. Each entry shows whether it's fully free or free-with-login, and when it was last checked.
- **Timer** — stopwatch and Pomodoro; time studied here counts toward your daily stats automatically.
- **Click "START TEST"** anywhere and the app starts a timer for that test's real duration in the background; when it ends (or you click "I'm Done"), it automatically asks for your score — you never have to remember to log it.

## A note on the resource links

The free mock links were checked at the time they were added (see the "last verified" date on each), but third-party sites change their URLs and offerings over time. If a link looks broken or no longer free, that's the site, not this app — check Settings/Resources periodically, and treat any resource marked "partial" (e.g. the official CAT mock, which only goes live a couple of weeks before the exam) as seasonal.

## Philosophy

Study > Track. If updating this ever takes more than 2-3 minutes a day, something's wrong — the whole point is that everything that *can* be calculated automatically, is.
