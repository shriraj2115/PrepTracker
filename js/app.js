/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — App Controller
   Routing, initialization, theme toggle, global state
   ═══════════════════════════════════════════════════════════════ */

const App = (() => {
  let currentView = 'dashboard';
  let timerInterval = null;
  let sessionSeconds = 0;
  let timerRunning = false;
  let timerTaskName = '';

  // ─── Initialize ───
  function init() {
    loadTheme();
    setupNavigation();
    setupThemeToggle();
    setupTimer();
    setupMobileMenu();
    initMorningBriefing();

    // Initialize all modules
    Dashboard.init();
    MockEntry.init();
    Analytics.init();
    Resources.init();
    Settings.init();
    StudyTimer.init();
    Achievements.init();

    // Bind morning briefing "Let's Go" button
    const goBtn = document.getElementById('morning-go-btn');
    if (goBtn) goBtn.addEventListener('click', closeMorningBriefing);

    // Navigate to the current hash or default
    const hash = window.location.hash.slice(1) || 'dashboard';
    navigateTo(hash);

    // Notification permission request
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        Notification.requestPermission();
      }, 5000);
    }

    // Check for pending reminders
    checkReminders();
    setInterval(checkReminders, 60000); // every minute
  }

  // ─── Navigation ───
  function setupNavigation() {
    document.querySelectorAll('.sidebar-nav-item[data-view]').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        navigateTo(view);
      });
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || 'dashboard';
      navigateTo(hash);
    });
  }

  function navigateTo(view) {
    currentView = view;
    window.location.hash = view;

    // Update sidebar active state
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === view);
    });

    // Show correct view
    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('active', v.id === `view-${view}`);
    });

    // Update topbar title
    const titles = {
      'dashboard': 'Dashboard',
      'enter-score': 'Enter Mock Score',
      'analytics': 'Analytics',
      'resources': 'Free Mocks & Practice',
      'timer': 'Study Timer',
      'current-affairs': 'Current Affairs',
      'settings': 'Settings'
    };
    const topTitle = document.getElementById('topbar-title');
    if (topTitle) topTitle.textContent = titles[view] || 'Dashboard';

    // Refresh view data
    if (view === 'dashboard') Dashboard.refresh();
    if (view === 'analytics') Analytics.refresh();
    if (view === 'resources') Resources.refresh();
    Achievements.refreshCount();

    // Close mobile sidebar
    document.querySelector('.sidebar')?.classList.remove('open');
  }

  // ─── Theme ───
  function loadTheme() {
    const settings = PrepData.getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    updateThemeIcon(settings.theme || 'light');
  }

  function setupThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const settings = PrepData.getSettings();
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        settings.theme = newTheme;
        PrepData.saveSettings(settings);
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
      });
    }
  }

  function updateThemeIcon(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      toggle.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
  }

  // ─── Global Timer (Topbar) ───
  function setupTimer() {
    const timerEl = document.getElementById('topbar-timer');
    if (timerEl) {
      timerEl.addEventListener('click', () => {
        if (timerRunning) {
          navigateTo('timer');
        } else {
          openQuickTimerModal();
        }
      });
    }
    updateTimerDisplay();
  }

  function openQuickTimerModal() {
    const modal = document.getElementById('quick-timer-modal');
    if (modal) modal.classList.add('active');
  }

  function closeQuickTimerModal() {
    const modal = document.getElementById('quick-timer-modal');
    if (modal) modal.classList.remove('active');
  }

  function quickStartTimer(mode) {
    closeQuickTimerModal();
    StudyTimer.setMode(mode);
    StudyTimer.start();
    showToast('⏱ Timer Started', mode === 'pomodoro' ? 'Pomodoro session running' : 'Stopwatch running', 'success', 2000);
  }

  function startGlobalTimer(taskName = 'Study Session') {
    if (timerRunning) return;
    timerRunning = true;
    timerTaskName = taskName;
    const timerEl = document.getElementById('topbar-timer');
    if (timerEl) timerEl.classList.add('running');

    timerInterval = setInterval(() => {
      sessionSeconds++;
      updateTimerDisplay();
    }, 1000);
  }

  function pauseGlobalTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    const timerEl = document.getElementById('topbar-timer');
    if (timerEl) timerEl.classList.remove('running');
  }

  function resetGlobalTimer() {
    pauseGlobalTimer();
    sessionSeconds = 0;
    timerTaskName = '';
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    if (display) {
      const h = Math.floor(sessionSeconds / 3600);
      const m = Math.floor((sessionSeconds % 3600) / 60);
      const s = sessionSeconds % 60;
      display.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    const label = document.getElementById('timer-label');
    if (label) {
      label.textContent = timerRunning ? timerTaskName : 'Start Timer';
    }
  }

  function getTimerState() {
    return { running: timerRunning, seconds: sessionSeconds, taskName: timerTaskName };
  }

  // ─── Mobile Menu ───
  function setupMobileMenu() {
    const burger = document.getElementById('mobile-menu-btn');
    if (burger) {
      burger.addEventListener('click', () => {
        document.querySelector('.sidebar')?.classList.toggle('open');
      });
    }
  }

  // ─── Morning Briefing ───
  function initMorningBriefing() {
    const settings = PrepData.getSettings();
    const today = new Date().toISOString().split('T')[0];

    if (settings.morningBriefingShown !== today) {
      setTimeout(() => showMorningBriefing(), 500);
      settings.morningBriefingShown = today;
      PrepData.saveSettings(settings);
    }
  }

  function showMorningBriefing() {
    const modal = document.getElementById('morning-modal');
    if (!modal) return;

    const settings = PrepData.getSettings();
    const data = PrepData.getData();
    const now = new Date();
    const hour = now.getHours();

    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if (hour >= 17) greeting = 'Good Evening';

    // Populate modal content
    const greetEl = modal.querySelector('.morning-greeting');
    if (greetEl) greetEl.textContent = `${greeting}! 👋`;

    const dateEl = modal.querySelector('.morning-date');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Stats
    const primaryExam = settings.targetExams[0] || 'CAT';
    const daysLeft = PrepData.getDaysUntilExam(primaryExam);
    const streak = data.streakData.current;
    const studyStats = PrepData.getStudyStats();

    const statsContainer = modal.querySelector('.morning-stats');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="morning-stat">
          <div class="morning-stat-value">${daysLeft !== null ? daysLeft : '—'}</div>
          <div class="morning-stat-label">${primaryExam} Days Left</div>
        </div>
        <div class="morning-stat">
          <div class="morning-stat-value">🔥 ${streak}</div>
          <div class="morning-stat-label">Day Streak</div>
        </div>
        <div class="morning-stat">
          <div class="morning-stat-value">${studyStats.totalHours}h</div>
          <div class="morning-stat-label">Total Study</div>
        </div>
      `;
    }

    // Weak area alert
    const weakTopics = PrepData.getWeakTopics(primaryExam);
    const alertEl = modal.querySelector('.morning-alert');
    if (alertEl && weakTopics.length > 0) {
      const weakest = weakTopics[0];
      alertEl.innerHTML = `
        <span class="morning-alert-icon">⚠️</span>
        <span class="morning-alert-text">Priority: ${weakest.topic} (${Math.round(weakest.avgAccuracy)}% accuracy)</span>
      `;
      alertEl.style.display = 'flex';
    } else if (alertEl) {
      alertEl.style.display = 'none';
    }

    // Today's tasks preview
    const tasksEl = modal.querySelector('.morning-tasks');
    if (tasksEl) {
      const todayLog = PrepData.getOrCreateTodayLog();
      tasksEl.innerHTML = todayLog.tasks.map(t => `
        <li class="morning-task">
          <span class="morning-task-icon">${getTaskIcon(t.type)}</span>
          <span>${t.name}</span>
          <span class="morning-task-time">${t.duration}m</span>
        </li>
      `).join('');
    }

    // Revisions due + anything left unfinished from yesterday
    const revisions = PrepData.getRevisionsDue();
    const pendingYesterday = PrepData.getPendingFromYesterday();
    const revContainer = modal.querySelector('.morning-revisions');
    if (revContainer && (revisions.length > 0 || pendingYesterday)) {
      let html = '';
      if (pendingYesterday) {
        html += `<div class="morning-alert" style="border-left-color: var(--danger); margin-bottom: 8px;">
          <span class="morning-alert-icon">⚠️</span>
          <span class="morning-alert-text">${pendingYesterday.tasks.length} task(s) left unfinished from yesterday: ${pendingYesterday.tasks.map(t => t.name).join(', ')}</span>
        </div>`;
      }
      if (revisions.length > 0) {
        html += `<div class="morning-alert" style="border-left-color: var(--info);">
          <span class="morning-alert-icon">🔁</span>
          <span class="morning-alert-text">${revisions.length} revision(s) due today</span>
        </div>`;
      }
      revContainer.innerHTML = html;
      revContainer.style.display = 'block';
    } else if (revContainer) {
      revContainer.style.display = 'none';
    }

    modal.classList.add('active');
  }

  function closeMorningBriefing() {
    const modal = document.getElementById('morning-modal');
    if (modal) modal.classList.remove('active');
  }

  // ─── Toast Notifications ───
  function showToast(title, message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <span class="toast-close">✕</span>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
    toast.addEventListener('click', () => removeToast(toast));
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => removeToast(toast), duration);
  }

  function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }

  // ─── Desktop Notifications ───
  function sendDesktopNotification(title, body, tag = '') {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '🎯',
        tag,
        requireInteraction: false
      });
    }
  }

  // ─── Reminders ───
  function checkReminders() {
    const settings = PrepData.getSettings();
    if (!settings.notificationsEnabled) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Study start reminder
    if (currentTime === settings.studyStartTime) {
      sendDesktopNotification('⏰ Time to Study!', 'Your study session is scheduled to start now.', 'study-start');
      showToast('⏰ Study Time', 'Your study session is scheduled to start now!', 'info');

      const dueAtStart = PrepData.getRevisionsDue();
      if (dueAtStart.length > 0) {
        sendDesktopNotification('🔁 Revisions Due', `${dueAtStart.length} topic(s) due for revision today`, 'revision-due');
      }
    }

    // Check for pending tasks (midway through study hours)
    const todayLog = PrepData.getTodayLog();
    if (todayLog) {
      const pendingTasks = todayLog.tasks.filter(t => t.status === 'pending');
      const doneTasks = todayLog.tasks.filter(t => t.status === 'done');

      // If it's been 2 hours since start and less than half done
      const startParts = settings.studyStartTime.split(':');
      const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const elapsed = nowMinutes - startMinutes;

      if (elapsed >= 120 && doneTasks.length < todayLog.tasks.length / 2) {
        if (now.getMinutes() === 0) { // Check once per hour
          showToast('📋 Tasks Pending', `${pendingTasks.length} tasks still pending for today`, 'warning');
          sendDesktopNotification('📋 Tasks Pending', `${pendingTasks.length} task(s) still pending for today`, 'tasks-pending');
        }
      }
    }

    // Update pending notification badge
    const revisions = PrepData.getRevisionsDue();
    const badge = document.querySelector('.topbar-btn .badge');
    if (badge) {
      badge.style.display = revisions.length > 0 ? 'block' : 'none';
    }
  }

  // ─── Helpers ───
  function getTaskIcon(type) {
    const icons = {
      'learn': '📚',
      'practice': '📝',
      'test': '📝',
      'read': '📰',
      'review': '🔁',
      'mock': '🎯'
    };
    return icons[type] || '📋';
  }

  function formatDuration(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  // ─── Public API ───
  return {
    init,
    navigateTo,
    showToast,
    sendDesktopNotification,
    showMorningBriefing,
    closeMorningBriefing,
    startGlobalTimer,
    pauseGlobalTimer,
    resetGlobalTimer,
    openQuickTimerModal,
    closeQuickTimerModal,
    quickStartTimer,
    getTimerState,
    getTaskIcon,
    formatDuration,
    get currentView() { return currentView; }
  };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
