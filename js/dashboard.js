/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — Dashboard Module
   Today's plan, stat cards, weakness alerts, progress tracking
   ═══════════════════════════════════════════════════════════════ */

const Dashboard = (() => {

  function init() {
    // Dashboard initializes on first load via refresh
  }

  function refresh() {
    renderStatCards();
    renderTodaysPlan();
    renderRevisionQueue();
    renderWeaknessPanel();
    renderRecentPerformance();
    renderExamCountdowns();
  }

  // ─── Stat Cards ───
  function renderStatCards() {
    const container = document.getElementById('stat-cards');
    if (!container) return;

    const settings = PrepData.getSettings();
    const data = PrepData.getData();
    const primaryExam = settings.targetExams[0] || 'CAT';
    const examStats = PrepData.getExamStats(primaryExam);
    const studyStats = PrepData.getStudyStats();
    const daysLeft = PrepData.getDaysUntilExam(primaryExam);

    const totalMocks = data.mocks.length;
    const avgAccuracy = examStats ? examStats.avgAccuracy : 0;
    const streak = data.streakData.current;

    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-card-label">
          <span class="badge-dot" style="background: var(--accent-primary)"></span>
          Mocks Taken
        </div>
        <div class="stat-card-value">${totalMocks}</div>
        <div class="stat-card-footer">
          ${examStats ? `<span class="stat-card-trend ${examStats.trend >= 0 ? 'up' : 'down'}">${examStats.trend >= 0 ? '↑' : '↓'} ${Math.abs(examStats.trend).toFixed(1)}%</span>` : ''}
          <span class="stat-card-link" onclick="App.navigateTo('analytics')">View All →</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-label">
          <span class="badge-dot" style="background: var(--success)"></span>
          Avg Accuracy
        </div>
        <div class="stat-card-value">${avgAccuracy.toFixed(1)}%</div>
        <div class="stat-card-footer">
          <span class="stat-card-link" onclick="App.navigateTo('analytics')">Details →</span>
        </div>
        <div class="stat-card-progress">
          <div class="stat-card-progress-bar" style="width: ${Math.min(100, avgAccuracy)}%"></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-label">🔥 Study Streak</div>
        <div class="stat-card-value">${streak} Days</div>
        <div class="stat-card-footer">
          <span style="font-size: 12px; color: var(--text-tertiary)">Longest: ${data.streakData.longest} days</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-label">📅 ${primaryExam} 2026</div>
        <div class="stat-card-value">${daysLeft !== null ? daysLeft : '—'} Days</div>
        <div class="stat-card-footer">
          <span class="stat-card-link" onclick="App.navigateTo('settings')">View Schedule →</span>
        </div>
      </div>
    `;
  }

  // ─── Today's Plan ───
  function renderTodaysPlan() {
    const container = document.getElementById('today-plan');
    if (!container) return;

    let todayLog = PrepData.getTodayLog();
    if (!todayLog) {
      todayLog = PrepData.createDailyLog(PrepData.DEFAULT_ROADMAP_TEMPLATE);
      PrepData.saveTodayLog(todayLog);
    }

    const doneTasks = todayLog.tasks.filter(t => t.status === 'done');
    const totalTasks = todayLog.tasks.length;
    const progressPercent = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;
    const totalPlanned = todayLog.totalPlanned;
    const totalActual = todayLog.totalActual || 0;

    container.innerHTML = `
      <div class="card-header">
        <div>
          <div class="card-title">📋 Today's Plan — ${App.formatDuration(totalPlanned)}</div>
          <div class="card-subtitle">${doneTasks.length}/${totalTasks} tasks completed • ${App.formatDuration(totalActual)} studied</div>
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-primary" onclick="App.navigateTo('enter-score')">+ Enter Score</button>
        </div>
      </div>
      <div class="card-body-compact">
        <div class="today-progress">
          <div class="today-progress-bar" style="width: ${progressPercent}%"></div>
        </div>
        <ul class="task-list" id="task-list">
          ${todayLog.tasks.map(task => renderTaskItem(task)).join('')}
        </ul>
      </div>
    `;

    // Attach event handlers
    todayLog.tasks.forEach(task => {
      const checkbox = document.querySelector(`[data-task-id="${task.id}"] .task-checkbox`);
      if (checkbox) {
        checkbox.addEventListener('click', (e) => handleTaskToggle(task.id, e));
      }

      const startBtn = document.querySelector(`[data-start-test="${task.id}"]`);
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          TestSession.start({
            exam: task.exam,
            section: task.section,
            testType: task.testType || 'Sectional',
            name: task.resourceName || task.name,
            durationMinutes: task.resourceDuration || task.duration,
            taskId: task.id,
            resourceId: task.resourceId
          });
        });
      }
    });
  }

  function renderTaskItem(task) {
    const isCompleted = task.status === 'done';
    const isSkipped = task.status === 'skipped';
    const statusClass = isCompleted ? 'completed' : isSkipped ? 'completed' : '';
    const checkClass = isCompleted ? 'checked' : isSkipped ? 'skipped' : '';
    const checkIcon = isCompleted ? '✓' : isSkipped ? '—' : '';

    let actionHtml = '';
    if (task.type === 'test' && task.resourceLink) {
      actionHtml = `<a href="${task.resourceLink}" target="_blank" class="btn btn-start-test" data-start-test="${task.id}">START TEST →</a>`;
    } else if (task.type === 'test') {
      actionHtml = `<button class="btn btn-sm btn-secondary" onclick="App.navigateTo('resources')">Find Test</button>`;
    }

    return `
      <li class="task-item ${statusClass}" data-task-id="${task.id}">
        <div class="task-checkbox ${checkClass}" title="Click to mark done, right-click to skip">${checkIcon}</div>
        <div class="task-info">
          <div class="task-name">${task.name}</div>
          <div class="task-meta">
            <span class="task-category ${task.category}">${task.category}</span>
            ${task.actualTime ? `<span>Actual: ${task.actualTime}m</span>` : ''}
          </div>
        </div>
        <div class="task-duration">⏱ ${task.duration}m</div>
        ${!isCompleted && !isSkipped ? `<input type="number" class="task-time-input" placeholder="min" title="Actual time (optional)" data-task-time="${task.id}">` : ''}
        <div class="task-action">${actionHtml}</div>
      </li>
    `;
  }

  function handleTaskToggle(taskId, e) {
    e.stopPropagation();
    const todayLog = PrepData.getTodayLog();
    if (!todayLog) return;

    const task = todayLog.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Cycle: pending → done → skipped → pending
    let newStatus;
    if (task.status === 'pending') newStatus = 'done';
    else if (task.status === 'done') newStatus = 'skipped';
    else newStatus = 'pending';

    // Get optional actual time
    const timeInput = document.querySelector(`[data-task-time="${taskId}"]`);
    const actualTime = timeInput ? parseInt(timeInput.value) || null : null;

    PrepData.updateTaskStatus(taskId, newStatus, actualTime);

    // Show toast for completed tasks
    if (newStatus === 'done') {
      App.showToast('✅ Task Done', task.name, 'success', 2000);
    }

    // Re-render
    renderTodaysPlan();
    renderStatCards();
  }

  // ─── Revision Queue (spaced repetition: 1/3/7/14/30 days after each mock) ───
  function renderRevisionQueue() {
    const container = document.getElementById('revision-queue');
    if (!container) return;

    const revisions = PrepData.getRevisionsDue();

    if (revisions.length === 0) {
      container.innerHTML = `
        <div class="card-header">
          <div class="card-title">🔁 Revision Due</div>
        </div>
        <div class="card-body">
          <div class="empty-state" style="padding: 16px 0">
            <div style="font-size: 13px; color: var(--text-tertiary)">Nothing due today — you're caught up</div>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="card-header">
        <div class="card-title">🔁 Revision Due</div>
        <span class="badge badge-warning">${revisions.length}</span>
      </div>
      <div class="card-body-compact">
        <ul class="task-list">
          ${revisions.map(r => `
            <li class="task-item" data-revision-id="${r.id}">
              <div class="task-checkbox" data-revision-check="${r.id}" title="Mark revised"></div>
              <div class="task-info">
                <div class="task-name">${r.topic}</div>
                <div class="task-meta">
                  <span class="task-category ${r.priority === 'high' ? 'review' : 'gk'}">${r.exam}</span>
                  ${r.date < new Date().toISOString().split('T')[0] ? '<span style="color:var(--danger)">Overdue</span>' : ''}
                </div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    revisions.forEach(r => {
      const checkbox = document.querySelector(`[data-revision-check="${r.id}"]`);
      if (checkbox) {
        checkbox.addEventListener('click', () => {
          PrepData.markRevisionDone(r.id);
          App.showToast('✅ Revised', r.topic, 'success', 2000);
          renderRevisionQueue();
          renderStatCards();
        });
      }
    });
  }

  // ─── Weakness Panel ───
  function renderWeaknessPanel() {
    const container = document.getElementById('weakness-panel');
    if (!container) return;

    const settings = PrepData.getSettings();
    const primaryExam = settings.targetExams[0] || 'CAT';
    const weakTopics = PrepData.getWeakTopics(primaryExam).slice(0, 5);

    if (weakTopics.length === 0) {
      container.innerHTML = `
        <div class="card-header">
          <div class="card-title">🎯 Weak Areas</div>
        </div>
        <div class="card-body">
          <div class="empty-state" style="padding: 20px 0">
            <div style="font-size: 32px; margin-bottom: 8px">📊</div>
            <div style="font-size: 13px; color: var(--text-tertiary)">Take a mock to see your weak areas</div>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="card-header">
        <div class="card-title">🎯 Weak Areas</div>
        <span class="badge badge-danger">${weakTopics.length}</span>
      </div>
      <div class="card-body">
        ${weakTopics.map(w => {
          const level = w.avgAccuracy < 50 ? 'critical' : w.avgAccuracy < 70 ? 'moderate' : 'good';
          const color = w.avgAccuracy < 50 ? 'bad' : w.avgAccuracy < 70 ? 'ok' : 'good';
          return `
            <div class="weakness-item">
              <div class="weakness-indicator ${level}"></div>
              <div class="weakness-info">
                <div class="weakness-name">${w.topic}</div>
                <div class="weakness-detail">${w.section} • ${w.occurrences} occurrence(s)</div>
              </div>
              <div class="weakness-value ${color}">${Math.round(w.avgAccuracy)}%</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ─── Recent Performance ───
  function renderRecentPerformance() {
    const container = document.getElementById('recent-performance');
    if (!container) return;

    const mocks = PrepData.getMocks();
    const recent = mocks.slice(-5);

    if (recent.length === 0) {
      container.innerHTML = `
        <div class="card-header">
          <div class="card-title">📈 Recent Performance</div>
        </div>
        <div class="card-body">
          <div class="empty-state" style="padding: 20px 0">
            <div style="font-size: 32px; margin-bottom: 8px">📝</div>
            <div style="font-size: 13px; color: var(--text-tertiary)">No mocks recorded yet</div>
            <button class="btn btn-sm btn-primary mt-12" onclick="App.navigateTo('enter-score')">Enter First Mock →</button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="card-header">
        <div class="card-title">📈 Recent Performance</div>
        <span class="stat-card-link" onclick="App.navigateTo('analytics')">View All →</span>
      </div>
      <div class="card-body">
        ${recent.reverse().map(m => `
          <div class="weakness-item">
            <div class="weakness-indicator ${m.accuracy >= 75 ? 'good' : m.accuracy >= 60 ? 'moderate' : 'critical'}"></div>
            <div class="weakness-info">
              <div class="weakness-name">${m.exam} — ${m.section}</div>
              <div class="weakness-detail">${m.testType} • ${new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
            </div>
            <div class="weakness-value ${m.accuracy >= 75 ? 'good' : m.accuracy >= 60 ? 'ok' : 'bad'}">${m.accuracy}%</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ─── Exam Countdowns ───
  function renderExamCountdowns() {
    const container = document.getElementById('exam-countdowns');
    if (!container) return;

    const settings = PrepData.getSettings();
    const exams = Object.entries(settings.examDates).filter(([_, date]) => date);

    if (exams.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="card-header">
        <div class="card-title">📅 Exam Countdowns</div>
      </div>
      <div class="card-body" style="display: flex; gap: 16px; flex-wrap: wrap;">
        ${exams.map(([exam, date]) => {
          const days = PrepData.getDaysUntilExam(exam);
          if (days === null || days < 0) return '';
          const urgency = days < 30 ? 'danger' : days < 60 ? 'warning' : 'success';
          const readiness = PrepData.getExamStats(exam)?.examReadiness || 0;
          const circumference = 2 * Math.PI * 28;
          const offset = circumference - (readiness / 100) * circumference;

          return `
            <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 180px; padding: 8px 0;">
              <div class="countdown-ring">
                <svg viewBox="0 0 64 64">
                  <circle class="ring-bg" cx="32" cy="32" r="28"/>
                  <circle class="ring-progress" cx="32" cy="32" r="28"
                    stroke="var(--${urgency})"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${offset}"/>
                </svg>
                <span class="countdown-days">${days}</span>
              </div>
              <div>
                <div style="font-weight: 600; font-size: 14px; color: var(--text-primary)">${exam}</div>
                <div style="font-size: 12px; color: var(--text-tertiary)">${new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <div class="badge badge-${urgency}" style="margin-top: 4px">${readiness}% Ready</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return { init, refresh };
})();
