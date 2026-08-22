/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — Settings Module
   Exam dates, study config, notification prefs, data management
   ═══════════════════════════════════════════════════════════════ */

const Settings = (() => {

  function init() {
    // Settings renders on navigateTo
    renderSettings();
  }

  function renderSettings() {
    const container = document.getElementById('settings-content');
    if (!container) return;

    const settings = PrepData.getSettings();

    container.innerHTML = `
      <!-- Profile -->
      <div class="settings-section">
        <div class="settings-section-title">👤 Profile</div>
        <div class="card">
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Your Name</label>
              <input type="text" class="form-input" id="setting-name" value="${settings.userName}" placeholder="Student">
            </div>
          </div>
        </div>
      </div>

      <!-- Study Schedule -->
      <div class="settings-section">
        <div class="settings-section-title">📅 Study Schedule</div>
        <div class="card">
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Study Start Time</label>
                <input type="time" class="form-input" id="setting-start-time" value="${settings.studyStartTime}">
              </div>
              <div class="form-group">
                <label class="form-label">Daily Study Hours</label>
                <input type="number" class="form-input" id="setting-study-hours" value="${settings.dailyStudyHours}" min="1" max="12" step="0.5">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Pomodoro Duration (min)</label>
                <input type="number" class="form-input" id="setting-pomodoro" value="${settings.pomodoroMinutes}" min="15" max="60">
              </div>
              <div class="form-group">
                <label class="form-label">Break Duration (min)</label>
                <input type="number" class="form-input" id="setting-break" value="${settings.breakMinutes}" min="3" max="30">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Target Exams -->
      <div class="settings-section">
        <div class="settings-section-title">🎯 Target Exams & Dates</div>
        <div class="card">
          <div class="card-body">
            <div id="exam-dates-list">
              ${Object.entries(PrepData.EXAM_CONFIG).map(([key, exam]) => {
                const date = settings.examDates[key] || '';
                const isTarget = settings.targetExams.includes(key);
                return `
                  <div class="settings-row">
                    <div class="settings-row-info">
                      <div class="settings-row-label">${exam.name}</div>
                      <div class="settings-row-hint">${exam.fullName} • ${exam.category}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:12px">
                      <input type="date" class="form-input" style="width:160px" id="exam-date-${key}" value="${date}">
                      <div class="toggle ${isTarget ? 'active' : ''}" id="exam-toggle-${key}" onclick="Settings.toggleExam('${key}')"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="settings-section">
        <div class="settings-section-title">🔔 Notifications</div>
        <div class="card">
          <div class="card-body">
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">Desktop Notifications</div>
                <div class="settings-row-hint">Get reminders for study sessions and pending tasks</div>
              </div>
              <div class="toggle ${settings.notificationsEnabled ? 'active' : ''}" id="toggle-notifications" onclick="Settings.toggleNotifications()"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Assistant -->
      <div class="settings-section">
        <div class="settings-section-title">🤖 AI Assistant (optional)</div>
        <div class="card">
          <div class="card-body">
            <div class="form-hint" style="margin-bottom:12px">
              Uses your own <a href="https://openrouter.ai/keys" target="_blank">OpenRouter</a> API key — each request draws from your OpenRouter balance, this is not free. The key is stored only in this browser's local storage, never sent anywhere except OpenRouter.
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">OpenRouter API Key</label>
                <input type="password" class="form-input" id="setting-openrouter-key" value="${settings.openRouterApiKey || ''}" placeholder="sk-or-v1-...">
              </div>
              <div class="form-group">
                <label class="form-label">Model</label>
                <input type="text" class="form-input" id="setting-openrouter-model" value="${settings.openRouterModel || 'openai/gpt-4o-mini'}" placeholder="openai/gpt-4o-mini">
                <div class="form-hint">Any model id from <a href="https://openrouter.ai/models" target="_blank">openrouter.ai/models</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="settings-section">
        <div class="settings-section-title">💾 Data Management</div>
        <div class="card">
          <div class="card-body">
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn btn-secondary" onclick="Settings.exportJSON()">📥 Export JSON Backup</button>
              <button class="btn btn-secondary" onclick="Settings.exportCSV()">📊 Export Mocks as CSV</button>
              <label class="btn btn-secondary" style="cursor:pointer">
                📤 Import JSON Backup
                <input type="file" accept=".json" style="display:none" onchange="Settings.importJSON(event)">
              </label>
              <button class="btn btn-danger" onclick="Settings.clearData()">🗑️ Clear All Data</button>
            </div>
            <div class="form-hint mt-12">Your data is stored locally in this browser. Export regularly for backup.</div>
          </div>
        </div>
      </div>

      <div style="padding: 16px 0">
        <button class="btn btn-primary btn-lg" onclick="Settings.save()" style="width:100%">💾 Save Settings</button>
      </div>
    `;
  }

  function save() {
    const settings = PrepData.getSettings();

    settings.userName = document.getElementById('setting-name')?.value || 'Student';
    settings.studyStartTime = document.getElementById('setting-start-time')?.value || '11:00';
    settings.dailyStudyHours = parseFloat(document.getElementById('setting-study-hours')?.value) || 4;
    settings.pomodoroMinutes = parseInt(document.getElementById('setting-pomodoro')?.value) || 25;
    settings.breakMinutes = parseInt(document.getElementById('setting-break')?.value) || 5;
    settings.openRouterApiKey = document.getElementById('setting-openrouter-key')?.value.trim() || null;
    settings.openRouterModel = document.getElementById('setting-openrouter-model')?.value.trim() || 'openai/gpt-4o-mini';

    // Save exam dates
    Object.keys(PrepData.EXAM_CONFIG).forEach(key => {
      const dateInput = document.getElementById(`exam-date-${key}`);
      if (dateInput) settings.examDates[key] = dateInput.value;
    });

    PrepData.saveSettings(settings);
    App.showToast('✅ Settings Saved', 'Your preferences have been updated', 'success');
  }

  function toggleExam(examKey) {
    const settings = PrepData.getSettings();
    const idx = settings.targetExams.indexOf(examKey);
    if (idx >= 0) {
      settings.targetExams.splice(idx, 1);
    } else {
      settings.targetExams.push(examKey);
    }
    PrepData.saveSettings(settings);

    const toggle = document.getElementById(`exam-toggle-${examKey}`);
    if (toggle) toggle.classList.toggle('active');
  }

  function toggleNotifications() {
    const settings = PrepData.getSettings();
    settings.notificationsEnabled = !settings.notificationsEnabled;
    PrepData.saveSettings(settings);

    const toggle = document.getElementById('toggle-notifications');
    if (toggle) toggle.classList.toggle('active');

    if (settings.notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission();
    }
  }

  function exportJSON() { PrepData.exportJSON(); App.showToast('📥 Exported', 'JSON backup downloaded', 'success'); }
  function exportCSV() { PrepData.exportCSV(); App.showToast('📊 Exported', 'CSV file downloaded', 'success'); }

  function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const success = PrepData.importJSON(e.target.result);
      if (success) {
        App.showToast('📤 Imported', 'Data restored successfully. Refreshing...', 'success');
        setTimeout(() => location.reload(), 1500);
      } else {
        App.showToast('❌ Import Failed', 'Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  }

  function clearData() {
    if (confirm('⚠️ This will delete ALL your data including mocks, daily logs, and settings. This cannot be undone. Are you sure?')) {
      localStorage.clear();
      App.showToast('🗑️ Data Cleared', 'All data has been deleted. Refreshing...', 'warning');
      setTimeout(() => location.reload(), 1500);
    }
  }

  return { init, renderSettings: renderSettings, save, toggleExam, toggleNotifications, exportJSON, exportCSV, importJSON, clearData };
})();
