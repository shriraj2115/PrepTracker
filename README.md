# PrepTracker

A minimal, local exam-prep dashboard for CAT, XAT, MAH CET, NMAT, SBI PO, IBPS PO, RBI Grade B, SEBI Grade A, SSC CGL and RRB NTPC. Runs entirely on your PC — no account, no internet required except to open the actual mock-test links and load fonts/charts.

## How to run it

### Option A — Desktop app (recommended)

This runs PrepTracker as a real desktop application (Electron) with its own icon, its own window, and — most importantly — **one single, fixed place your data is stored**, so there's no "did I open it the same way as last time" ambiguity at all.

Closing the window minimizes it to the system tray (bottom-right, near the clock) instead of quitting — right-click the tray icon to reopen it or fully quit. This means reminders and notifications keep working even if you've closed the window.

You need [Node.js](https://nodejs.org) installed once, only to build it — after that, the people you share it with never need Node, npm, or a terminal again.

**Step 1 — one-time setup, in this folder:**
```
npm install
```

**Step 2 — build a standalone app you can double-click:**
```
npm run pack
```
This creates `dist\win-unpacked\PrepTracker.exe` — a complete, self-contained app (~180 MB, includes its own runtime). No installer needed:
1. Open the `dist\win-unpacked` folder.
2. Right-click `PrepTracker.exe` → **Send to → Desktop (create shortcut)**.
3. From now on, just double-click that desktop icon — it opens straight to the app, no folder, no terminal, no `npm start`.

You can move the whole `dist\win-unpacked` folder anywhere (a USB drive, another PC, a friend's laptop) and `PrepTracker.exe` still runs — it doesn't need Node.js or this project folder to work.

**Optional — a real installer with Start Menu shortcuts, uninstaller, etc.:**
```
npm run dist
```
This needs one extra Windows permission that `npm run pack` doesn't (creating symlinks while packaging code-signing tools). If it fails with `Cannot create symbolic link: A required privilege is not held by the client`, either:
- turn on **Settings → Privacy & security → For developers → Developer Mode**, then retry, or
- run the command from an **Administrator** terminal.

The finished installer lands in `dist\` (an `.exe` on Windows, `.dmg` on Mac, `.AppImage` on Linux) and, once run, adds Start Menu/Desktop shortcuts and an uninstaller automatically — `npm run pack` above skips all of that friction and gets you a working desktop icon either way.

**Just want to try it without building anything first?**
```
npm start
```
Opens the app directly using the source files — useful for a quick look, but Step 2 above is what gives you a real double-click icon.

### Option B — Browser (no build step)

**Windows** — double-click `start.bat`. It opens `http://localhost:5588` in your browser and keeps a local server running in the window it opens. Keep that window open while you study; closing it stops the server (your saved data is not affected).

**Mac/Linux** — open a terminal in this folder and run:
```
sh start.sh
```

Both scripts need Node.js too (for `npx http-server`). If you don't have Node at all, you can just double-click `index.html` to open it directly in your browser — everything works except the free-resource list falls back to its smaller built-in copy instead of `data/resources.json`.

**Important for Option B only:** always open the app the same way (same shortcut, same URL) — the browser ties your data to the exact URL/method you used, so opening it a different way looks like a separate, empty app. This is exactly what Option A (the desktop app) avoids.

### Option C — Shared hosted link (GitHub Pages)

The app can also be hosted as a live link (e.g. `https://shriraj2115.github.io/PrepTracker/`) so multiple people can use it without installing anything. **This is not a multi-user account system** — there's no login and no shared database. Each person's browser stores its own separate copy of the data at that URL; two people opening the same link on their own devices **cannot see each other's data**, but also can't sync or share progress between them. It behaves exactly like Option B above, just without you needing to run anything locally — same rule applies: always open the same link, and your data will always be there when you come back, even after closing everything.

## Where your data lives

Everything — mocks, scores, streaks, settings — is stored **locally on your PC, never uploaded anywhere**.

- **Desktop app (Option A):** stored in Electron's app-data folder for PrepTracker (e.g. `%APPDATA%\PrepTracker` on Windows). Tied to one fixed app, not a browser or URL — this is the persistence guarantee: as long as you keep using the same installed app, your data is there every time you open it, indefinitely, until you uninstall or explicitly clear it.
- **Browser (Option B) or hosted link (Option C):** stored in that browser's `localStorage` for the exact URL you used. Nobody else — not even someone else using the very same hosted link — can see it, because it never leaves your browser.

**Back up regularly regardless of which option you use:** Settings → Export JSON Backup downloads a file you can restore later via Settings → Import JSON Backup. Do this before uninstalling, clearing browser data, or moving to a new PC.

## What's in the box

- **Dashboard** — today's study plan, exam countdowns, weak-area alerts, revision queue, streak.
- **Enter Score** — 4-field mock/sectional entry (score, attempted, correct, time); everything else (accuracy, attempt rate, error rate, trend, readiness, recommendation) is calculated automatically.
- **Analytics** — score trends, section-strength radar, weakness ranking, study-hours chart, readiness gauges.
- **Resources** — a curated list of real, checked free mock/practice links per exam. Each entry shows whether it's fully free or free-with-login, and when it was last checked.
- **Timer** — stopwatch and Pomodoro; time studied here counts toward your daily stats automatically.
- **Click "START TEST"** anywhere and the app starts a timer for that test's real duration in the background; when it ends (or you click "I'm Done"), it automatically asks for your score — you never have to remember to log it.
- **CAT syllabus curriculum** — the daily plan isn't generic. It rotates through the entire CAT syllabus starting 23 Aug 2026 (one Quant + one VARC + one DILR topic per day, with a direct link to verified topic-wise practice), so you always know exactly what to study and where.
- **15 real past CAT papers (2021–2025), built in** — every 6th day swaps the usual short mock/sectional slot for a full past paper instead. Click it and the Questions PDF opens right inside the app (not a new tab, not an external viewer) with the timer running; when you're done, a "View Solutions" button opens the matching Solutions PDF. All 15 papers cycle through by the time the exam arrives.

## PYQ papers (bundled, `data/pyqs/`)

The 15 real CAT papers (Cracku's Slot 1/2/3 papers, 2021–2025) each shipped as one PDF containing both questions and worked solutions. I split each into two separate files — `*-Questions.pdf` and `*-Solutions.pdf` — at the exact page where the paper's own "Answers" key begins, so you can attempt the paper cold and only open the solutions afterward. Nothing was reformatted or re-typed; each half is just the original pages, split cleanly.

## Formula cheat sheets (bundled, `data/cheatsheets/`)

18 topic-wise formula/cheat-sheet PDFs (Number Systems, Geometry, Time-Speed-Distance, Probability, a VARC cheat sheet, a 168-page complete Quant formula book, etc). Whichever Quant/VARC topic the curriculum has you on today automatically gets a **📐 Cheat Sheet** button on that task, opening the matching formula sheet inside the app. All 18 are also individually browsable/searchable on the Resources page (filter by type "Cheat Sheet") — these are reference material, so clicking one just opens it, no timer or score prompt.

## A note on the resource links

The free mock links were checked at the time they were added (see the "last verified" date on each), but third-party sites change their URLs and offerings over time. If a link looks broken or no longer free, that's the site, not this app — check Settings/Resources periodically, and treat any resource marked "partial" (e.g. the official CAT mock, which only goes live a couple of weeks before the exam) as seasonal.

## Philosophy

Study > Track. If updating this ever takes more than 2-3 minutes a day, something's wrong — the whole point is that everything that *can* be calculated automatically, is.
