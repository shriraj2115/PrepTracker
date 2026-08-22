/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — Mock Entry Module
   30-second mock/sectional score entry with auto-calculations
   ═══════════════════════════════════════════════════════════════ */

const MockEntry = (() => {
  let selectedExam = null;
  let selectedSection = null;

  function init() {
    const form = document.getElementById('mock-entry-form');
    if (!form) return;

    setupExamSelector();
    setupAutoCalc();
    setupFormSubmit();
  }

  function setupExamSelector() {
    const examSelect = document.getElementById('mock-exam');
    const sectionSelect = document.getElementById('mock-section');
    const typeSelect = document.getElementById('mock-type');
    const topicSelect = document.getElementById('mock-weak-topic');

    if (!examSelect) return;

    // Populate exam dropdown
    examSelect.innerHTML = '<option value="">Select Exam</option>';
    Object.keys(PrepData.EXAM_CONFIG).forEach(exam => {
      examSelect.innerHTML += `<option value="${exam}">${exam}</option>`;
    });

    // Populate type dropdown
    if (typeSelect) {
      typeSelect.innerHTML = '<option value="">Select Type</option>';
      PrepData.TEST_TYPES.forEach(type => {
        typeSelect.innerHTML += `<option value="${type}">${type}</option>`;
      });
    }

    // Populate mistake types
    const mistakeSelect = document.getElementById('mock-mistake');
    if (mistakeSelect) {
      mistakeSelect.innerHTML = '<option value="">None</option>';
      PrepData.MISTAKE_TYPES.forEach(type => {
        mistakeSelect.innerHTML += `<option value="${type}">${type}</option>`;
      });
    }

    // Exam change → update sections and topics
    examSelect.addEventListener('change', () => {
      selectedExam = examSelect.value;
      const config = PrepData.EXAM_CONFIG[selectedExam];

      // Update sections
      if (sectionSelect && config) {
        sectionSelect.innerHTML = '<option value="">Select Section</option>';
        Object.entries(config.sections).forEach(([key, sec]) => {
          sectionSelect.innerHTML += `<option value="${key}">${key} — ${sec.name}</option>`;
        });
        // Add "Full Mock" option
        sectionSelect.innerHTML += `<option value="Full Mock">Full Mock</option>`;
      }

      // Auto-select "Sectional" if not full mock
      if (typeSelect && !typeSelect.value) {
        typeSelect.value = 'Sectional';
      }
    });

    // Section change → update topics
    if (sectionSelect) {
      sectionSelect.addEventListener('change', () => {
        selectedSection = sectionSelect.value;
        const config = PrepData.EXAM_CONFIG[selectedExam];

        if (topicSelect && config && config.topics[selectedSection]) {
          topicSelect.innerHTML = '<option value="">None</option>';
          config.topics[selectedSection].forEach(topic => {
            topicSelect.innerHTML += `<option value="${topic}">${topic}</option>`;
          });
        } else if (topicSelect) {
          topicSelect.innerHTML = '<option value="">None</option>';
        }

        // Auto-fill total questions if known
        updateDefaults();
      });
    }

    // Pre-select last used exam
    const settings = PrepData.getSettings();
    if (settings.targetExams.length > 0) {
      examSelect.value = settings.targetExams[0];
      examSelect.dispatchEvent(new Event('change'));
    }
  }

  function updateDefaults() {
    const config = PrepData.EXAM_CONFIG[selectedExam];
    if (!config) return;

    const sectionConfig = config.sections[selectedSection];
    const totalQHint = document.getElementById('total-q-hint');

    if (totalQHint && sectionConfig) {
      totalQHint.textContent = `Total: ${sectionConfig.totalQ} Qs, ${sectionConfig.maxMarks} marks, ${sectionConfig.time} min`;
    } else if (totalQHint && selectedSection === 'Full Mock') {
      totalQHint.textContent = `Total: ${config.totalQ} Qs, ${config.maxMarks} marks, ${config.totalTime} min`;
    } else if (totalQHint) {
      totalQHint.textContent = '';
    }
  }

  function setupAutoCalc() {
    // Live calculation on any input change
    const inputs = ['mock-score', 'mock-attempted', 'mock-correct', 'mock-time'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', calculateResults);
      }
    });
  }

  function calculateResults() {
    const score = parseFloat(document.getElementById('mock-score')?.value) || 0;
    const attempted = parseFloat(document.getElementById('mock-attempted')?.value) || 0;
    const correct = parseFloat(document.getElementById('mock-correct')?.value) || 0;
    const time = parseFloat(document.getElementById('mock-time')?.value) || 0;

    const config = PrepData.EXAM_CONFIG[selectedExam];
    const sectionConfig = config?.sections?.[selectedSection];
    const totalQ = selectedSection === 'Full Mock'
      ? (config?.totalQ || attempted)
      : (sectionConfig?.totalQ || attempted);
    const maxMarks = selectedSection === 'Full Mock'
      ? (config?.maxMarks || score)
      : (sectionConfig?.maxMarks || score);

    // Calculate
    const incorrect = Math.max(0, attempted - correct);
    const accuracy = attempted > 0 ? ((correct / attempted) * 100) : 0;
    const attemptRate = totalQ > 0 ? ((attempted / totalQ) * 100) : 0;
    const errorRate = attempted > 0 ? ((incorrect / attempted) * 100) : 0;
    const scorePercentage = maxMarks > 0 ? ((score / maxMarks) * 100) : 0;
    const avgTimePerQ = attempted > 0 ? (time / attempted) : 0;

    // Get previous data for comparison
    const prevMocks = PrepData.getMocks({ exam: selectedExam, section: selectedSection });
    const lastMock = prevMocks.length > 0 ? prevMocks[prevMocks.length - 1] : null;
    const last3 = prevMocks.slice(-3);
    const last5 = prevMocks.slice(-5);
    const last3Avg = last3.length > 0 ? (last3.reduce((s, m) => s + m.accuracy, 0) / last3.length) : null;
    const last5Avg = last5.length > 0 ? (last5.reduce((s, m) => s + m.accuracy, 0) / last5.length) : null;
    const vsPrevious = lastMock ? (accuracy - lastMock.accuracy) : null;

    // Update display
    const resultsContainer = document.getElementById('calc-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
      <div class="calc-result highlight">
        <span class="calc-result-label">Accuracy</span>
        <span class="calc-result-value ${accuracy >= 75 ? 'good' : accuracy >= 60 ? 'ok' : 'bad'}">${accuracy.toFixed(1)}%</span>
      </div>
      <div class="calc-result">
        <span class="calc-result-label">Incorrect</span>
        <span class="calc-result-value">${incorrect}</span>
      </div>
      <div class="calc-result">
        <span class="calc-result-label">Attempt Rate</span>
        <span class="calc-result-value">${attemptRate.toFixed(1)}%</span>
      </div>
      <div class="calc-result">
        <span class="calc-result-label">Error Rate</span>
        <span class="calc-result-value ${errorRate > 30 ? 'bad' : errorRate > 15 ? 'ok' : 'good'}">${errorRate.toFixed(1)}%</span>
      </div>
      <div class="calc-result">
        <span class="calc-result-label">Score %</span>
        <span class="calc-result-value">${scorePercentage.toFixed(1)}%</span>
      </div>
      <div class="calc-result">
        <span class="calc-result-label">Avg Time/Q</span>
        <span class="calc-result-value">${avgTimePerQ.toFixed(2)} min</span>
      </div>
      ${vsPrevious !== null ? `
        <div class="calc-result ${vsPrevious >= 0 ? '' : ''}">
          <span class="calc-result-label">vs Last Mock</span>
          <span class="calc-result-value ${vsPrevious >= 0 ? 'up' : 'down'}">${vsPrevious >= 0 ? '↑' : '↓'} ${Math.abs(vsPrevious).toFixed(1)}%</span>
        </div>
      ` : ''}
      ${last3Avg !== null ? `
        <div class="calc-result">
          <span class="calc-result-label">Last 3 Avg</span>
          <span class="calc-result-value">${last3Avg.toFixed(1)}%</span>
        </div>
      ` : ''}
      ${last5Avg !== null ? `
        <div class="calc-result">
          <span class="calc-result-label">Last 5 Avg</span>
          <span class="calc-result-value">${last5Avg.toFixed(1)}%</span>
        </div>
      ` : ''}
    `;

    resultsContainer.style.display = (attempted > 0 || score > 0) ? 'block' : 'none';
  }

  function setupFormSubmit() {
    const form = document.getElementById('mock-entry-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const exam = document.getElementById('mock-exam')?.value;
      const testType = document.getElementById('mock-type')?.value;
      const section = document.getElementById('mock-section')?.value;
      const score = parseFloat(document.getElementById('mock-score')?.value);
      const attempted = parseInt(document.getElementById('mock-attempted')?.value);
      const correct = parseInt(document.getElementById('mock-correct')?.value);
      const time = parseFloat(document.getElementById('mock-time')?.value);
      const weakTopic = document.getElementById('mock-weak-topic')?.value || null;
      const mistakeType = document.getElementById('mock-mistake')?.value || null;
      const errorNote = document.getElementById('mock-error-note')?.value.trim() || null;

      // Validation
      if (!exam || !section || !testType) {
        App.showToast('Missing Fields', 'Please select exam, section, and type', 'warning');
        return;
      }
      if (isNaN(score) || isNaN(attempted) || isNaN(correct) || isNaN(time)) {
        App.showToast('Missing Fields', 'Please fill score, attempted, correct, and time', 'warning');
        return;
      }
      if (correct > attempted) {
        App.showToast('Invalid Data', 'Correct cannot be more than attempted', 'error');
        return;
      }

      // Save
      const entry = PrepData.addMock({
        exam, testType, section, score, attempted, correct, time, weakTopic, mistakeType
      });
      Achievements.refreshCount();

      if (errorNote) {
        PrepData.addErrorLogEntry({ exam, section, topic: weakTopic || section, note: errorNote });
      }

      // Show success with key stats
      App.showToast(
        '✅ Mock Saved!',
        `${exam} ${section} — ${entry.accuracy}% accuracy`,
        'success',
        3000
      );

      // Show recommendation toast
      setTimeout(() => {
        App.showToast('💡 Recommended', entry.recommendedAction, 'info', 5000);
      }, 1500);

      // Reset form
      document.getElementById('mock-score').value = '';
      document.getElementById('mock-attempted').value = '';
      document.getElementById('mock-correct').value = '';
      document.getElementById('mock-time').value = '';
      document.getElementById('mock-weak-topic').value = '';
      document.getElementById('mock-mistake').value = '';
      document.getElementById('mock-error-note').value = '';
      document.getElementById('calc-results').innerHTML = '';
      document.getElementById('calc-results').style.display = 'none';

      // Show the saved entry summary
      showEntrySummary(entry);
    });
  }

  function showEntrySummary(entry) {
    const summary = document.getElementById('entry-summary');
    if (!summary) return;

    summary.style.display = 'block';
    summary.innerHTML = `
      <div class="card" style="border-left: 3px solid var(--success); margin-top: 16px;">
        <div class="card-header">
          <div class="card-title">✅ Entry Saved — ${entry.exam} ${entry.section}</div>
          <button class="btn btn-sm btn-ghost" onclick="document.getElementById('entry-summary').style.display='none'">✕</button>
        </div>
        <div class="card-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;">
            <div>
              <div style="font-size: 12px; color: var(--text-tertiary)">Accuracy</div>
              <div style="font-size: 20px; font-weight: 700; color: ${entry.accuracy >= 75 ? 'var(--success)' : entry.accuracy >= 60 ? 'var(--warning)' : 'var(--danger)'}">${entry.accuracy}%</div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--text-tertiary)">Score</div>
              <div style="font-size: 20px; font-weight: 700">${entry.score}/${entry.maxMarks}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--text-tertiary)">Incorrect</div>
              <div style="font-size: 20px; font-weight: 700; color: var(--danger)">${entry.incorrect}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--text-tertiary)">Avg Time/Q</div>
              <div style="font-size: 20px; font-weight: 700">${entry.avgTimePerQ} min</div>
            </div>
            ${entry.vsPrevious !== null ? `
              <div>
                <div style="font-size: 12px; color: var(--text-tertiary)">vs Previous</div>
                <div style="font-size: 20px; font-weight: 700; color: ${entry.vsPrevious >= 0 ? 'var(--success)' : 'var(--danger)'}">${entry.vsPrevious >= 0 ? '↑' : '↓'} ${Math.abs(entry.vsPrevious)}%</div>
              </div>
            ` : ''}
            <div>
              <div style="font-size: 12px; color: var(--text-tertiary)">Exam Readiness</div>
              <div style="font-size: 20px; font-weight: 700; color: var(--accent-primary)">${entry.examReadiness}%</div>
            </div>
          </div>
          <div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border-radius: 8px;">
            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px">💡 Recommended Action</div>
            <div style="font-size: 14px; color: var(--text-primary); font-weight: 500">${entry.recommendedAction}</div>
          </div>
          ${entry.revisionDates.length > 0 ? `
            <div style="margin-top: 12px; font-size: 12px; color: var(--text-tertiary)">
              🔁 Revisions scheduled: ${entry.revisionDates.slice(0, 3).map(d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })).join(', ')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  return { init };
})();
