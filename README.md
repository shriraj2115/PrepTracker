# PrepTracker

A minimal, local exam-prep dashboard for CAT, XAT, MAH CET, NMAT, SBI PO, IBPS PO, RBI Grade B, SEBI Grade A, SSC CGL and RRB NTPC. Runs entirely on your PC — no account, no internet required except to open the actual mock-test links and load fonts/charts.

## How to run it

### Option A — Desktop app (recommended)

This runs PrepTracker as a real desktop application (Electron) with its own icon, its own window, and — most importantly — **one single, fixed place your data is stored**, so there's no "did I open it the same way as last time" ambiguity at all.

Requires [Node.js](https://nodejs.org) once, to build/run it:

```
npm install
npm start
```

That opens the PrepTracker window directly. Closing the window minimizes it to the system tray (bottom-right, near the clock) instead of quitting — right-click the tray icon to reopen it or fully quit. This means reminders and notifications keep working even if you've closed the window.

To build a standalone installer/exe you can double-click without `npm start` every time:
```
npm run dist
```
The finished installer lands in the `dist/` folder (an `.exe` on Windows, `.dmg` on Mac, `.AppImage` on Linux).

### Option B — Browser (no build step)

**Windows** — double-click `start.bat`. It opens `http://localhost:5588` in your browser and keeps a local server running in the window it opens. Keep that window open while you study; closing it stops the server (your saved data is not affected).

**Mac/Linux** — open a terminal in this folder and run:
```
sh start.sh
```

Both scripts need Node.js too (for `npx http-server`). If you don't have Node at all, you can just double-click `index.html` to open it directly in your browser — everything works except the free-resource list falls back to its smaller built-in copy instead of `data/resources.json`.

**Important for Option B only:** always open the app the same way (same shortcut, same URL) — the browser ties your data to the exact URL/method you used, so opening it a different way looks like a separate, empty app. This is exactly what Option A (the desktop app) avoids.

## Where your data lives

Everything — mocks, scores, streaks, settings — is stored **locally on your PC, never uploaded anywhere**.

- **Desktop app (Option A):** stored in Electron's app-data folder for PrepTracker (e.g. `%APPDATA%\PrepTracker` on Windows). Tied to one fixed app, not a browser or URL — this is the persistence guarantee: as long as you keep using the same installed app, your data is there every time you open it, indefinitely, until you uninstall or explicitly clear it.
- **Browser (Option B):** stored in that browser's `localStorage` for the exact URL you used.

**Back up regularly regardless of which option you use:** Settings → Export JSON Backup downloads a file you can restore later via Settings → Import JSON Backup. Do this before uninstalling, clearing browser data, or moving to a new PC.

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
