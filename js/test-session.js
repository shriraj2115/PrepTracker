/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — Test Session Module
   Click START TEST → auto-timer starts → when it ends, auto-prompts for score
   ═══════════════════════════════════════════════════════════════ */

const TestSession = (() => {
  let active = false;
  let seconds = 0;
  let targetSeconds = 0;
  let interval = null;
  let meta = null;

  function start(opts) {
    if (!opts || !opts.exam || !opts.section) {
      console.error('TestSession.start called with incomplete data:', opts);
      App.showToast('⚠️ Couldn\'t Start Timer', 'This resource is missing exam/section info', 'error');
      return;
    }

    if (active) {
      App.showToast('⏱ Timer Already Running', 'Finish or cancel your current test timer first', 'warning');
      return;
    }

    meta = {
      exam: opts.exam,
      section: opts.section,
      testType: opts.testType || 'Sectional',
      name: opts.name || `${opts.exam} ${opts.section}`,
      taskId: opts.taskId || null,
      resourceId: opts.resourceId || null,
      solutionsUrl: opts.solutionsUrl || null
    };

    const durationMinutes = opts.durationMinutes || 30;
    seconds = 0;
    targetSeconds = Math.max(60, Math.round(durationMinutes * 60));
    active = true;

    renderBar();
    App.showToast('▶️ Test Started', `${meta.name} — timer running for ${durationMinutes} min`, 'info', 3000);

    // Bundled PDFs (e.g. PYQ papers) open inside the app itself, not a new tab
    if (opts.pdfUrl && typeof PdfReader !== 'undefined') {
      PdfReader.open(opts.pdfUrl, meta.name);
    }

    interval = setInterval(() => {
      seconds++;
      updateBarTime();
      if (seconds >= targetSeconds) {
        finish(true);
      }
    }, 1000);
  }

  function renderBar() {
    const bar = document.getElementById('test-session-bar');
    if (!bar) return;
    bar.style.display = 'flex';
    const nameEl = document.getElementById('ts-bar-name');
    if (nameEl) nameEl.textContent = meta.name;
    updateBarTime();
  }

  function updateBarTime() {
    const el = document.getElementById('ts-bar-time');
    if (!el) return;
    const remaining = Math.max(0, targetSeconds - seconds);
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    el.textContent = h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function hideBar() {
    const bar = document.getElementById('test-session-bar');
    if (bar) bar.style.display = 'none';
  }

  function finishNow() {
    finish(false);
  }

  function finish(autoEnded) {
    if (!active) return;
    clearInterval(interval);
    active = false;
    const elapsedMinutes = Math.max(1, Math.round(seconds / 60));
    hideBar();
    if (typeof PdfReader !== 'undefined') PdfReader.close();

    if (autoEnded) {
      App.showToast('⏰ Time\'s Up!', `${meta.name} — enter your score now`, 'warning', 6000);
      const notif = App.sendDesktopNotification('⏰ Time\'s Up!', `${meta.name} — enter your score now`, 'test-session-end');
      if (notif) {
        notif.onclick = () => { window.focus(); notif.close(); };
      }
    }

    openScoreModal(elapsedMinutes);
  }

  function cancel() {
    if (!active) return;
    clearInterval(interval);
    active = false;
    hideBar();
    App.showToast('Timer Cancelled', meta ? meta.name : '', 'info', 2000);
    meta = null;
  }

  function openScoreModal(elapsedMinutes) {
    const modal = document.getElementById('test-session-modal');
    if (!modal || !meta) return;

    const subtitle = document.getElementById('ts-modal-subtitle');
    if (subtitle) subtitle.textContent = `${meta.exam} — ${meta.section} (${meta.testType}) — ${meta.name}`;

    document.getElementById('ts-score').value = '';
    document.getElementById('ts-attempted').value = '';
    document.getElementById('ts-correct').value = '';
    document.getElementById('ts-time').value = elapsedMinutes;
    document.getElementById('ts-error-note').value = '';

    const config = PrepData.EXAM_CONFIG[meta.exam];
    const topicSelect = document.getElementById('ts-weak-topic');
    if (topicSelect) {
      topicSelect.innerHTML = '<option value="">None</option>';
      if (config && config.topics[meta.section]) {
        config.topics[meta.section].forEach(t => {
          topicSelect.innerHTML += `<option value="${t}">${t}</option>`;
        });
      }
    }
    const mistakeSelect = document.getElementById('ts-mistake');
    if (mistakeSelect) {
      mistakeSelect.innerHTML = '<option value="">None</option>';
      PrepData.MISTAKE_TYPES.forEach(t => {
        mistakeSelect.innerHTML += `<option value="${t}">${t}</option>`;
      });
    }

    const solutionsBtn = document.getElementById('ts-view-solutions');
    if (solutionsBtn) {
      solutionsBtn.style.display = meta.solutionsUrl ? 'inline-flex' : 'none';
    }

    modal.classList.add('active');
  }

  function viewSolutions() {
    if (meta && meta.solutionsUrl) {
      PdfReader.open(meta.solutionsUrl, `${meta.name} — Solutions`);
    }
  }

  function dismissModal() {
    const modal = document.getElementById('test-session-modal');
    if (modal) modal.classList.remove('active');
    meta = null;
  }

  function submitScore() {
    if (!meta) return;

    const score = parseFloat(document.getElementById('ts-score').value);
    const attempted = parseInt(document.getElementById('ts-attempted').value);
    const correct = parseInt(document.getElementById('ts-correct').value);
    const time = parseFloat(document.getElementById('ts-time').value);
    const weakTopic = document.getElementById('ts-weak-topic').value || null;
    const mistakeType = document.getElementById('ts-mistake').value || null;
    const errorNote = document.getElementById('ts-error-note')?.value.trim() || null;

    if (isNaN(score) || isNaN(attempted) || isNaN(correct) || isNaN(time)) {
      App.showToast('Missing Fields', 'Please fill score, attempted, correct, and time', 'warning');
      return;
    }
    if (correct > attempted) {
      App.showToast('Invalid Data', 'Correct cannot be more than attempted', 'error');
      return;
    }

    const entry = PrepData.addMock({
      exam: meta.exam, testType: meta.testType, section: meta.section,
      score, attempted, correct, time, weakTopic, mistakeType
    });

    if (meta.resourceId) {
      PrepData.markResourceAttempted(meta.resourceId, score, entry.accuracy);
    }
    if (errorNote) {
      PrepData.addErrorLogEntry({ exam: meta.exam, section: meta.section, topic: weakTopic || meta.section, note: errorNote });
    }
    Achievements.refreshCount();
    if (meta.taskId) {
      PrepData.updateTaskStatus(meta.taskId, 'done', Math.round(time));
    }

    App.showToast('✅ Score Saved!', `${entry.exam} ${entry.section} — ${entry.accuracy}% accuracy`, 'success', 3000);
    setTimeout(() => App.showToast('💡 Recommended', entry.recommendedAction, 'info', 5000), 1200);

    const modal = document.getElementById('test-session-modal');
    if (modal) modal.classList.remove('active');
    meta = null;

    if (App.currentView === 'dashboard') Dashboard.refresh();
    if (App.currentView === 'analytics') Analytics.refresh();
    if (App.currentView === 'resources') Resources.refresh();
  }

  return {
    start, finishNow, cancel, dismissModal, submitScore, viewSolutions,
    get isActive() { return active; }
  };
})();
