/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — Timer Module
   Study timer, Pomodoro mode, session tracking
   ═══════════════════════════════════════════════════════════════ */

const StudyTimer = (() => {
  let mode = 'stopwatch'; // stopwatch | pomodoro
  let seconds = 0;
  let targetSeconds = 0;
  let interval = null;
  let isRunning = false;
  let pomodoroState = 'study'; // study | break
  let pomodoroCount = 0;
  let syncedSeconds = 0; // seconds already credited to today's study log

  function init() {
    renderTimer();
  }

  function renderTimer() {
    const container = document.getElementById('timer-content');
    if (!container) return;

    const settings = PrepData.getSettings();

    container.innerHTML = `
      <div class="grid-2" style="gap: 24px;">
        <!-- Timer Card -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">⏱ Study Timer</div>
            <div class="tabs">
              <button class="tab ${mode === 'stopwatch' ? 'active' : ''}" onclick="StudyTimer.setMode('stopwatch')">Stopwatch</button>
              <button class="tab ${mode === 'pomodoro' ? 'active' : ''}" onclick="StudyTimer.setMode('pomodoro')">Pomodoro</button>
            </div>
          </div>
          <div class="card-body">
            <div class="timer-widget">
              ${mode === 'pomodoro' ? `
                <div style="margin-bottom: 12px;">
                  <span class="badge ${pomodoroState === 'study' ? 'badge-primary' : 'badge-success'}">${pomodoroState === 'study' ? '📚 Study' : '☕ Break'}</span>
                  <span style="font-size: 12px; color: var(--text-tertiary); margin-left: 8px">Session ${pomodoroCount + 1}</span>
                </div>
              ` : ''}
              <div class="timer-display" id="main-timer-display">${formatTime(mode === 'pomodoro' ? targetSeconds - seconds : seconds)}</div>
              <div class="timer-task-name" id="timer-task-label">${isRunning ? 'Running...' : 'Ready to start'}</div>
              ${mode === 'pomodoro' ? `
                <div style="margin: 16px auto; width: 200px; height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden;">
                  <div style="height: 100%; background: var(--accent-gradient); border-radius: 3px; width: ${targetSeconds > 0 ? (seconds / targetSeconds * 100) : 0}%; transition: width 1s linear;"></div>
                </div>
              ` : ''}
              <div class="timer-controls">
                <button class="timer-btn timer-btn-secondary" onclick="StudyTimer.reset()" title="Reset">↺</button>
                <button class="timer-btn timer-btn-primary" onclick="StudyTimer.toggle()" title="${isRunning ? 'Pause' : 'Start'}" id="timer-play-btn">${isRunning ? '⏸' : '▶'}</button>
                <button class="timer-btn timer-btn-secondary" onclick="StudyTimer.skip()" title="${mode === 'pomodoro' ? 'Skip to next' : 'Lap'}">⏭</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Session Stats -->
        <div>
          <div class="card mb-16">
            <div class="card-header">
              <div class="card-title">📊 Today's Session</div>
            </div>
            <div class="card-body">
              <div class="calc-result">
                <span class="calc-result-label">Total Study Time</span>
                <span class="calc-result-value">${formatTime(getTodayStudySeconds())}</span>
              </div>
              <div class="calc-result">
                <span class="calc-result-label">Pomodoros Completed</span>
                <span class="calc-result-value">${pomodoroCount}</span>
              </div>
              <div class="calc-result">
                <span class="calc-result-label">Timer Status</span>
                <span class="calc-result-value ${isRunning ? 'good' : ''}">${isRunning ? '🟢 Active' : '⚪ Idle'}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">⚙️ Timer Settings</div>
            </div>
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">Pomodoro Duration</label>
                <input type="number" class="form-input" value="${settings.pomodoroMinutes}" min="15" max="60" id="timer-pomodoro-min" onchange="StudyTimer.updatePomodoroSettings()">
              </div>
              <div class="form-group">
                <label class="form-label">Break Duration</label>
                <input type="number" class="form-input" value="${settings.breakMinutes}" min="3" max="30" id="timer-break-min" onchange="StudyTimer.updatePomodoroSettings()">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function setMode(newMode) {
    stop();
    mode = newMode;
    seconds = 0;
    syncedSeconds = 0;

    if (mode === 'pomodoro') {
      const settings = PrepData.getSettings();
      pomodoroState = 'study';
      targetSeconds = settings.pomodoroMinutes * 60;
    }

    renderTimer();
  }

  function toggle() {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }

  function start() {
    if (isRunning) return;
    isRunning = true;

    if (mode === 'pomodoro' && seconds === 0) {
      const settings = PrepData.getSettings();
      targetSeconds = pomodoroState === 'study' ? settings.pomodoroMinutes * 60 : settings.breakMinutes * 60;
    }

    App.startGlobalTimer(mode === 'pomodoro' ? `Pomodoro — ${pomodoroState}` : 'Study Session');

    interval = setInterval(() => {
      seconds++;
      updateDisplay();

      // Pomodoro completion
      if (mode === 'pomodoro' && seconds >= targetSeconds) {
        completePomodoroPhase();
      }
    }, 1000);

    updatePlayButton();
  }

  function pause() {
    isRunning = false;
    clearInterval(interval);
    App.pauseGlobalTimer();
    syncStudyMinutes();
    renderTimer();
  }

  function stop() {
    isRunning = false;
    clearInterval(interval);
    App.pauseGlobalTimer();
    syncStudyMinutes();
  }

  // Credits elapsed study seconds (stopwatch, or Pomodoro study phases only) to
  // today's log so Timer sessions count toward streaks and the study-hours chart.
  function syncStudyMinutes() {
    if (mode === 'pomodoro' && pomodoroState !== 'study') {
      syncedSeconds = seconds;
      return;
    }
    const delta = seconds - syncedSeconds;
    if (delta > 0) {
      PrepData.addStudyMinutes(Math.round(delta / 60));
    }
    syncedSeconds = seconds;
  }

  function reset() {
    stop();
    seconds = 0;
    syncedSeconds = 0;
    updateDisplay();
    renderTimer();
  }

  function skip() {
    if (mode === 'pomodoro') {
      completePomodoroPhase();
    }
  }

  function completePomodoroPhase() {
    stop();
    seconds = 0;
    syncedSeconds = 0;

    if (pomodoroState === 'study') {
      pomodoroCount++;
      pomodoroState = 'break';
      App.showToast('☕ Break Time!', `Pomodoro #${pomodoroCount} complete! Take a ${PrepData.getSettings().breakMinutes}-min break.`, 'success');
      App.sendDesktopNotification('☕ Break Time!', `Pomodoro #${pomodoroCount} complete!`);
    } else {
      pomodoroState = 'study';
      App.showToast('📚 Back to Study!', 'Break over. Time to focus!', 'info');
      App.sendDesktopNotification('📚 Study Time!', 'Break is over. Let\'s go!');
    }

    const settings = PrepData.getSettings();
    targetSeconds = pomodoroState === 'study' ? settings.pomodoroMinutes * 60 : settings.breakMinutes * 60;

    renderTimer();

    // Auto-start next phase
    setTimeout(() => start(), 1000);
  }

  function updateDisplay() {
    const display = document.getElementById('main-timer-display');
    if (display) {
      display.textContent = formatTime(mode === 'pomodoro' ? Math.max(0, targetSeconds - seconds) : seconds);
    }
  }

  function updatePlayButton() {
    const btn = document.getElementById('timer-play-btn');
    if (btn) btn.textContent = isRunning ? '⏸' : '▶';
    const label = document.getElementById('timer-task-label');
    if (label) label.textContent = isRunning ? 'Running...' : 'Ready to start';
  }

  function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function getTodayStudySeconds() {
    const todayLog = PrepData.getTodayLog();
    return todayLog ? (todayLog.totalActual || 0) * 60 : 0;
  }

  function updatePomodoroSettings() {
    const settings = PrepData.getSettings();
    const pomMin = parseInt(document.getElementById('timer-pomodoro-min')?.value) || 25;
    const breakMin = parseInt(document.getElementById('timer-break-min')?.value) || 5;
    settings.pomodoroMinutes = pomMin;
    settings.breakMinutes = breakMin;
    PrepData.saveSettings(settings);
  }

  return { init, renderTimer, setMode, toggle, start, pause, reset, skip, updatePomodoroSettings };
})();
