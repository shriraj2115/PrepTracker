/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — Analytics Module
   Charts, trends, insights, weakness detection
   ═══════════════════════════════════════════════════════════════ */

const Analytics = (() => {
  let charts = {};

  function init() {}

  function refresh() {
    renderOverviewStats();
    renderScoreTrendChart();
    renderSectionRadar();
    renderWeaknessBar();
    renderInsightsPanel();
    renderStudyTimeChart();
    renderExamReadiness();
    renderMistakeTypeChart();
    renderMistakeTypePanel();
    renderErrorLog();
  }

  function destroyChart(name) {
    if (charts[name]) {
      charts[name].destroy();
      delete charts[name];
    }
  }

  // ─── Overview Stat Cards ───
  function renderOverviewStats() {
    const container = document.getElementById('analytics-stats');
    if (!container) return;

    const data = PrepData.getData();
    const studyStats = PrepData.getStudyStats();
    const settings = PrepData.getSettings();
    const primaryExam = settings.targetExams[0] || 'CAT';
    const examStats = PrepData.getExamStats(primaryExam);

    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-card-label">📝 Total Mocks</div>
        <div class="stat-card-value">${data.mocks.length}</div>
        <div class="stat-card-footer"><span style="font-size:12px;color:var(--text-tertiary)">All exams combined</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">🎯 Avg Accuracy</div>
        <div class="stat-card-value">${examStats ? examStats.avgAccuracy.toFixed(1) : '—'}%</div>
        <div class="stat-card-footer">
          ${examStats ? `<span class="stat-card-trend ${examStats.trend >= 0 ? 'up' : 'down'}">${examStats.trend >= 0 ? '↑' : '↓'} ${Math.abs(examStats.trend).toFixed(1)}%</span>` : ''}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">📊 Readiness</div>
        <div class="stat-card-value">${examStats ? examStats.examReadiness : 0}%</div>
        <div class="stat-card-footer"><span style="font-size:12px;color:var(--text-tertiary)">${primaryExam}</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">⏱ Study Hours</div>
        <div class="stat-card-value">${studyStats.totalHours}h</div>
        <div class="stat-card-footer"><span style="font-size:12px;color:var(--text-tertiary)">${studyStats.totalDays} active days</span></div>
      </div>
    `;
  }

  // ─── Score Trend Line Chart ───
  function renderScoreTrendChart() {
    const canvas = document.getElementById('score-trend-chart');
    if (!canvas) return;

    destroyChart('scoreTrend');

    const settings = PrepData.getSettings();
    const primaryExam = settings.targetExams[0] || 'CAT';
    const config = PrepData.EXAM_CONFIG[primaryExam];
    if (!config) return;

    const sections = Object.keys(config.sections);
    const datasets = sections.map((sec, i) => {
      const mocks = PrepData.getMocks({ exam: primaryExam, section: sec });
      const colors = ['#ec4899', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];
      return {
        label: sec,
        data: mocks.map(m => m.accuracy),
        borderColor: colors[i % colors.length],
        backgroundColor: colors[i % colors.length] + '20',
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
      };
    });

    // Find max data points
    const maxLen = Math.max(...datasets.map(d => d.data.length), 1);
    const labels = Array.from({ length: maxLen }, (_, i) => `Mock ${i + 1}`);

    charts.scoreTrend = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { family: 'Inter', size: 12 } } },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { family: 'Inter' },
            bodyFont: { family: 'Inter' },
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 0,
            max: 100,
            grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim() },
            ticks: { callback: v => v + '%', font: { family: 'Inter', size: 11 }, color: getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() }
          }
        }
      }
    });
  }

  // ─── Section Radar Chart ───
  function renderSectionRadar() {
    const canvas = document.getElementById('section-radar-chart');
    if (!canvas) return;

    destroyChart('sectionRadar');

    const settings = PrepData.getSettings();
    const primaryExam = settings.targetExams[0] || 'CAT';
    const examStats = PrepData.getExamStats(primaryExam);
    if (!examStats) return;

    const labels = Object.keys(examStats.sectionStats);
    const data = labels.map(l => examStats.sectionStats[l].avg);

    charts.sectionRadar = new Chart(canvas, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: `${primaryExam} Section Strength`,
          data,
          backgroundColor: 'rgba(236, 72, 153, 0.2)',
          borderColor: '#ec4899',
          borderWidth: 2,
          pointBackgroundColor: '#ec4899',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed.r.toFixed(1)}%` }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20, font: { family: 'Inter', size: 10 }, backdropColor: 'transparent' },
            grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() },
            pointLabels: { font: { family: 'Inter', size: 13, weight: '600' }, color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() }
          }
        }
      }
    });
  }

  // ─── Weakness Bar Chart ───
  function renderWeaknessBar() {
    const canvas = document.getElementById('weakness-bar-chart');
    if (!canvas) return;

    destroyChart('weaknessBar');

    const settings = PrepData.getSettings();
    const primaryExam = settings.targetExams[0] || 'CAT';
    const weakTopics = PrepData.getWeakTopics(primaryExam).slice(0, 8);

    if (weakTopics.length === 0) return;

    const labels = weakTopics.map(w => w.topic);
    const data = weakTopics.map(w => Math.round(w.avgAccuracy));
    const colors = data.map(v => v < 50 ? '#ef4444' : v < 70 ? '#f59e0b' : '#22c55e');

    charts.weaknessBar = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Accuracy %',
          data,
          backgroundColor: colors,
          borderRadius: 6,
          barThickness: 24
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => `${ctx.parsed.x}% accuracy` } }
        },
        scales: {
          x: { beginAtZero: true, max: 100, grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim() }, ticks: { callback: v => v + '%', font: { family: 'Inter', size: 11 } } },
          y: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12, weight: '500' }, color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() } }
        }
      }
    });
  }

  // ─── Study Time Chart ───
  function renderStudyTimeChart() {
    const canvas = document.getElementById('study-time-chart');
    if (!canvas) return;

    destroyChart('studyTime');

    const data = PrepData.getData();
    const today = new Date();
    const days = [];
    const values = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
      days.push(dayName);
      const log = data.dailyLogs[dateStr];
      values.push(log ? Math.round((log.totalActual || 0) / 60 * 10) / 10 : 0);
    }

    charts.studyTime = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [{
          label: 'Study Hours',
          data: values,
          backgroundColor: values.map((v, i) => i === 6 ? '#8b5cf6' : '#ec489980'),
          borderRadius: 8,
          barThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => `${ctx.parsed.y}h studied` } }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim() }, ticks: { callback: v => v + 'h', font: { family: 'Inter', size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 } } }
        }
      }
    });
  }

  // ─── Insights Panel ───
  function renderInsightsPanel() {
    const container = document.getElementById('insights-panel');
    if (!container) return;

    const settings = PrepData.getSettings();
    const primaryExam = settings.targetExams[0] || 'CAT';
    const examStats = PrepData.getExamStats(primaryExam);
    const studyStats = PrepData.getStudyStats();
    const weakTopics = PrepData.getWeakTopics(primaryExam);
    const revisions = PrepData.getRevisionsDue();

    const insights = [];

    if (examStats) {
      // Accuracy trend
      if (examStats.trend > 0) {
        insights.push({ icon: '📈', text: `Your ${primaryExam} accuracy improved by ${examStats.trend.toFixed(1)}% recently`, type: 'good' });
      } else if (examStats.trend < -5) {
        insights.push({ icon: '📉', text: `Your ${primaryExam} accuracy dropped ${Math.abs(examStats.trend).toFixed(1)}%. Focus on weak areas.`, type: 'bad' });
      }

      // Section imbalance
      const sectionEntries = Object.entries(examStats.sectionStats);
      if (sectionEntries.length >= 2) {
        const sorted = [...sectionEntries].sort((a, b) => a[1].avg - b[1].avg);
        const gap = sorted[sorted.length - 1][1].avg - sorted[0][1].avg;
        if (gap > 20) {
          insights.push({ icon: '⚖️', text: `${gap.toFixed(0)}% gap between ${sorted[sorted.length - 1][0]} and ${sorted[0][0]}. Balance your prep.`, type: 'warn' });
        }
      }

      // Score prediction
      if (examStats.last5Avg >= 75) {
        insights.push({ icon: '🎯', text: `At current pace, projected ${primaryExam} performance: 90+ percentile range`, type: 'good' });
      } else if (examStats.last5Avg >= 60) {
        insights.push({ icon: '🎯', text: `At current pace, projected ${primaryExam} performance: 75-90 percentile range`, type: 'warn' });
      }
    }

    // Study consistency
    if (studyStats.streak.current >= 7) {
      insights.push({ icon: '🔥', text: `${studyStats.streak.current}-day study streak! Keep it going!`, type: 'good' });
    }

    // Revision reminders
    if (revisions.length > 0) {
      insights.push({ icon: '🔁', text: `${revisions.length} topics need revision today`, type: 'warn' });
    }

    // Weak topic alert
    if (weakTopics.length > 0 && weakTopics[0].avgAccuracy < 50) {
      insights.push({ icon: '🚨', text: `${weakTopics[0].topic} is critically weak (${Math.round(weakTopics[0].avgAccuracy)}%). Prioritize this topic.`, type: 'bad' });
    }

    if (insights.length === 0) {
      insights.push({ icon: '📝', text: 'Take more mocks to see personalized insights', type: 'info' });
    }

    container.innerHTML = `
      <div class="card-header">
        <div class="card-title">💡 Insights</div>
        <button class="btn btn-ghost btn-sm" id="ai-insight-btn" title="Uses your OpenRouter balance">✨ Get AI Insight</button>
      </div>
      <div class="card-body">
        <div id="ai-insight-box" style="display:none; margin-bottom: 12px;"></div>
        ${insights.map(i => `
          <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-light);">
            <span style="font-size:18px;flex-shrink:0">${i.icon}</span>
            <span style="font-size:13px;color:var(--text-primary);line-height:1.5">${i.text}</span>
          </div>
        `).join('')}
      </div>
    `;

    const aiBtn = document.getElementById('ai-insight-btn');
    if (aiBtn) {
      aiBtn.addEventListener('click', () => AIAssistant.generateInsight(aiBtn));
    }
  }

  // ─── Exam Readiness Gauges ───
  function renderExamReadiness() {
    const container = document.getElementById('exam-readiness');
    if (!container) return;

    const settings = PrepData.getSettings();
    const exams = settings.targetExams;

    container.innerHTML = exams.map(exam => {
      const stats = PrepData.getExamStats(exam);
      const readiness = stats ? stats.examReadiness : 0;
      const days = PrepData.getDaysUntilExam(exam);
      const circumference = 2 * Math.PI * 52;
      const offset = circumference - (readiness / 100) * circumference;
      const color = readiness >= 75 ? 'var(--success)' : readiness >= 50 ? 'var(--warning)' : 'var(--danger)';

      return `
        <div class="readiness-gauge">
          <div class="readiness-circle">
            <svg viewBox="0 0 120 120" width="120" height="120">
              <circle class="gauge-bg" cx="60" cy="60" r="52"/>
              <circle class="gauge-fill" cx="60" cy="60" r="52"
                stroke="${color}"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"/>
            </svg>
            <div class="readiness-value">
              <div class="readiness-value-number">${readiness}%</div>
              <div class="readiness-value-label">Ready</div>
            </div>
          </div>
          <div class="readiness-exam-name">${exam}</div>
          <div class="readiness-days">${days !== null ? `${days} days left` : 'Date not set'}</div>
        </div>
      `;
    }).join('');
  }

  // ─── Mistake Type Chart ───
  // Uses the optional "main mistake type" field mocks already capture — points at
  // *why* marks are lost (silly errors vs concept gaps vs time pressure), which is
  // more actionable than topic-level accuracy alone.
  function renderMistakeTypeChart() {
    const canvas = document.getElementById('mistake-type-chart');
    if (!canvas) return;

    destroyChart('mistakeType');

    const settings = PrepData.getSettings();
    const primaryExam = settings.targetExams[0] || 'CAT';
    const stats = PrepData.getMistakeTypeStats(primaryExam);
    if (!stats) return;

    const colors = ['#ef4444', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#22c55e', '#f97316', '#f472b6'];
    const labels = stats.breakdown.map(b => b.type);
    const data = stats.breakdown.map(b => b.count);

    charts.mistakeType = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Occurrences',
          data,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderRadius: 6,
          barThickness: 22
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const b = stats.breakdown[ctx.dataIndex];
                return `${b.count} mock(s) — ${b.percentage}% of logged mistakes`;
              }
            }
          }
        },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1, font: { family: 'Inter', size: 11 } }, grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim() } },
          y: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12, weight: '500' }, color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() } }
        }
      }
    });
  }

  // ─── Mistake Type Panel (top offender + actionable tip) ───
  const MISTAKE_TIPS = {
    'Silly Error': 'Slow down on the final read-through — a 10-second check before submitting catches most of these.',
    'Concept Gap': "Go back to fundamentals for this topic — more practice won't fix a concept you don't understand yet.",
    'Time Pressure': 'Practice with a visible timer and per-question time caps — build speed through drilling, not just more mocks.',
    'Misread Question': 'Underline key numbers and conditions before solving — most misreads come from skimming.',
    'Wrong Approach': "Review the standard method for this question type — you're solving it, just not the fastest way.",
    'Guesswork': 'Flag these to revisit — guessing usually means you ran out of time or skipped a step worth practicing.',
    'Left Unattempted': 'Check if this is a pacing issue (ran out of time) or a confidence issue (skipped on sight) — the fix is different for each.',
    'Calculation Error': 'Practice mental math and approximation — the method was right, the arithmetic wasn\'t.'
  };

  function renderMistakeTypePanel() {
    const container = document.getElementById('mistake-type-panel');
    if (!container) return;

    const settings = PrepData.getSettings();
    const primaryExam = settings.targetExams[0] || 'CAT';
    const stats = PrepData.getMistakeTypeStats(primaryExam);

    if (!stats) {
      container.innerHTML = `
        <div class="card-header">
          <div class="card-title">🧩 Top Mistake</div>
        </div>
        <div class="card-body">
          <div class="empty-state" style="padding: 20px 0">
            <div style="font-size: 32px; margin-bottom: 8px">🧩</div>
            <div style="font-size: 13px; color: var(--text-tertiary)">Log a "Main Mistake Type" when entering a score to see this</div>
          </div>
        </div>
      `;
      return;
    }

    const top = stats.topMistake;
    const tip = MISTAKE_TIPS[top.type] || '';

    container.innerHTML = `
      <div class="card-header">
        <div class="card-title">🧩 Top Mistake</div>
      </div>
      <div class="card-body">
        <div style="text-align:center; padding: 8px 0 16px;">
          <div style="font-size: 24px; font-weight: 800; color: var(--danger)">${top.type}</div>
          <div style="font-size: 13px; color: var(--text-tertiary); margin-top: 4px">${top.percentage}% of logged mistakes (${top.count}/${stats.totalLogged})</div>
        </div>
        <div style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px;">
          <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px">💡 What to do about it</div>
          <div style="font-size: 13px; color: var(--text-primary); font-weight: 500; line-height: 1.5">${tip}</div>
        </div>
        <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 12px; text-align: center;">
          Logged on ${stats.totalLogged} of ${stats.totalMocks} mocks
        </div>
      </div>
    `;
  }

  // ─── Error Log ───
  // Optional free-text notes on important/repeated mistakes — deliberately not
  // one entry per wrong question, just the handful worth remembering later.
  function renderErrorLog() {
    const container = document.getElementById('error-log-panel');
    if (!container) return;

    const settings = PrepData.getSettings();
    const primaryExam = settings.targetExams[0] || 'CAT';
    const entries = PrepData.getErrorLog(primaryExam);

    if (entries.length === 0) {
      container.innerHTML = `
        <div class="card-header">
          <div class="card-title">📓 Error Notes</div>
        </div>
        <div class="card-body">
          <div class="empty-state" style="padding: 16px 0">
            <div style="font-size: 13px; color: var(--text-tertiary)">Nothing logged yet — when entering a score, use the optional "Error Note" field for mistakes worth remembering</div>
          </div>
        </div>
      `;
      return;
    }

    const unresolved = entries.filter(e => !e.resolved);
    const shown = entries.slice(0, 10);

    container.innerHTML = `
      <div class="card-header">
        <div>
          <div class="card-title">📓 Error Notes</div>
          <div class="card-subtitle">Important/repeated mistakes, not every wrong answer</div>
        </div>
        <span class="badge badge-warning">${unresolved.length} active</span>
      </div>
      <div class="card-body-compact">
        <ul class="task-list">
          ${shown.map(e => `
            <li class="task-item ${e.resolved ? 'completed' : ''}" data-error-id="${e.id}" style="align-items:flex-start; flex-wrap:wrap;">
              <div class="task-checkbox ${e.resolved ? 'checked' : ''}" data-error-check="${e.id}" title="Mark reviewed">${e.resolved ? '✓' : ''}</div>
              <div class="task-info">
                <div class="task-name">${e.note}</div>
                <div class="task-meta">
                  <span class="task-category dilr">${e.topic || e.section}</span>
                  <span>${new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div class="ai-response" id="ai-response-${e.id}" style="display:none"></div>
              </div>
              <button class="btn btn-ghost btn-sm" data-ai-explain="${e.id}" title="Uses your OpenRouter balance">🤖 Explain</button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    entries.forEach(e => {
      const checkbox = document.querySelector(`[data-error-check="${e.id}"]`);
      if (checkbox) {
        checkbox.addEventListener('click', () => {
          PrepData.resolveErrorLogEntry(e.id);
          renderErrorLog();
        });
      }

      const explainBtn = document.querySelector(`[data-ai-explain="${e.id}"]`);
      if (explainBtn) {
        explainBtn.addEventListener('click', () => AIAssistant.explainMistake(e.id, explainBtn));
      }
    });
  }

  return { init, refresh };
})();
