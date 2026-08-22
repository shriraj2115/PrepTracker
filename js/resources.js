/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — Resources Module
   Free mock database browser with filters and START TEST buttons
   ═══════════════════════════════════════════════════════════════ */

const Resources = (() => {
  let allResources = [];
  let filteredResources = [];
  let currentFilters = { exam: 'all', type: 'all', section: 'all', search: '' };

  function init() {
    loadResources();
    setupFilters();
  }

  async function loadResources() {
    try {
      const resp = await fetch('./data/resources.json');
      const loaded = await resp.json();
      allResources = (Array.isArray(loaded) && loaded.length > 0) ? loaded : getDefaultResources();
    } catch (e) {
      console.warn('Resources JSON not loaded, using defaults');
      allResources = getDefaultResources();
    }
    filteredResources = [...allResources];

    // Auto-attach a real, un-attempted resource link to today's "Mock / Sectional" task
    attachResourceToTodayTask();
    if (typeof App !== 'undefined' && App.currentView === 'dashboard') {
      Dashboard.refresh();
    }
  }

  // Section → curated topic-wise study material hub, for learn/practice tasks
  const STUDY_HUB_BY_SECTION = {
    QA: 'cat-cracku-quant-study',
    VARC: 'cat-cracku-varc-study',
    DILR: 'cat-cracku-dilr-study'
  };

  // ─── Automatic Mock Selection (Daily Roadmap Integration) ───
  function attachResourceToTodayTask() {
    const todayLog = PrepData.getOrCreateTodayLog();
    let changed = false;

    const testTask = todayLog.tasks.find(t => t.type === 'test' && !t.resourceLink);
    if (testTask) {
      const settings = PrepData.getSettings();
      const primaryExam = settings.targetExams[0] || 'CAT';
      const weakTopics = PrepData.getWeakTopics(primaryExam);
      const weakestSection = weakTopics.length > 0 ? weakTopics[0].section : null;

      const rec = getRecommendedResource(primaryExam, weakestSection);
      if (rec) {
        testTask.resourceLink = rec.url;
        testTask.resourceName = rec.name;
        testTask.resourceId = rec.id;
        testTask.exam = rec.exam;
        testTask.section = rec.section;
        testTask.testType = rec.type;
        testTask.resourceDuration = getResourceDuration(rec);
        testTask.isPdf = !!rec.isPdf;
        testTask.solutionsUrl = rec.solutionsUrl || null;
        changed = true;
      }
    }

    // Learn/practice tasks (the day's specific syllabus topic) get a direct link to
    // that section's verified topic-wise study material — same hub each time, but the
    // task name always tells you exactly which topic within it to focus on today.
    todayLog.tasks.forEach(t => {
      if ((t.type === 'learn' || t.type === 'practice') && !t.resourceLink) {
        const hubId = STUDY_HUB_BY_SECTION[t.section];
        const hub = hubId && allResources.find(r => r.id === hubId);
        if (hub) {
          t.resourceLink = hub.url;
          t.resourceName = hub.name;
          changed = true;
        }
      }
    });

    if (changed) PrepData.saveTodayLog(todayLog);
  }

  // Pick the best un-attempted resource: prefer fully-verified & currently-live resources
  // (skip seasonal ones like the official CAT mock outside its release window), then the
  // weakest section, else any sectional for this exam, else a full mock. Never re-recommends
  // something already attempted.
  function getRecommendedResource(exam, weakSection) {
    const candidates = allResources.filter(r =>
      r.exam === exam && r.url && r.url !== '#' && !PrepData.isResourceAttempted(r.id)
    );
    if (candidates.length === 0) return null;

    const verified = candidates.filter(r => r.status === 'verified');
    const pool = verified.length > 0 ? verified : candidates;

    if (weakSection) {
      const sectionMatch = pool.filter(r => r.section === weakSection);
      if (sectionMatch.length > 0) return sectionMatch[0];
    }
    const sectionals = pool.filter(r => r.type === 'Sectional' || r.type === 'Topic Test');
    if (sectionals.length > 0) return sectionals[0];
    return pool[0];
  }

  // Duration (minutes) for a resource, derived from the exam's official section/full-mock timing
  function getResourceDuration(r) {
    const config = PrepData.EXAM_CONFIG[r.exam];
    if (!config) return 30;
    const sectionConfig = config.sections[r.section];
    if (sectionConfig) return sectionConfig.time;
    return config.totalTime || 30;
  }

  function startTest(resourceId) {
    const r = allResources.find(x => x.id === resourceId);
    if (!r) return;
    TestSession.start({
      exam: r.exam,
      section: r.section,
      testType: r.type,
      name: r.name,
      durationMinutes: getResourceDuration(r),
      resourceId: r.id,
      pdfUrl: r.isPdf ? r.url : null,
      solutionsUrl: r.solutionsUrl || null
    });
  }

  function refresh() {
    applyFilters();
    renderResources();
    renderResourceStats();
  }

  function setupFilters() {
    // Exam filter chips are rendered dynamically
  }

  function applyFilters() {
    filteredResources = allResources.filter(r => {
      if (currentFilters.exam !== 'all' && r.exam !== currentFilters.exam) return false;
      if (currentFilters.type !== 'all' && r.type !== currentFilters.type) return false;
      if (currentFilters.section !== 'all' && r.section !== currentFilters.section) return false;
      if (currentFilters.search) {
        const q = currentFilters.search.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.platform.toLowerCase().includes(q) || r.exam.toLowerCase().includes(q) || r.section.toLowerCase().includes(q);
      }
      return true;
    });
  }

  function setFilter(key, value) {
    currentFilters[key] = value;
    applyFilters();
    renderResources();
  }

  function renderResourceStats() {
    const container = document.getElementById('resource-stats');
    if (!container) return;

    const total = allResources.length;
    const verified = allResources.filter(r => r.status === 'verified').length;
    const attempted = allResources.filter(r => PrepData.isResourceAttempted(r.id)).length;
    const exams = [...new Set(allResources.map(r => r.exam))].length;

    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-card-label">📚 Total Resources</div>
        <div class="stat-card-value">${total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">🟢 Verified</div>
        <div class="stat-card-value">${verified}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">✅ Attempted</div>
        <div class="stat-card-value">${attempted}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">📋 Exams Covered</div>
        <div class="stat-card-value">${exams}</div>
      </div>
    `;
  }

  function renderResources() {
    const container = document.getElementById('resource-list');
    if (!container) return;

    // Get unique exams & types for filters
    const exams = ['all', ...new Set(allResources.map(r => r.exam))];
    const types = ['all', ...new Set(allResources.map(r => r.type))];

    const filterHtml = `
      <div class="filter-bar">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" class="form-input" placeholder="Search resources..." id="resource-search" value="${currentFilters.search}">
        </div>
      </div>
      <div class="filter-bar" style="margin-bottom: 16px">
        ${exams.map(e => `<button class="filter-chip ${currentFilters.exam === e ? 'active' : ''}" onclick="Resources.setFilter('exam','${e}')">${e === 'all' ? 'All Exams' : e}</button>`).join('')}
      </div>
      <div class="filter-bar" style="margin-bottom: 16px">
        ${types.map(t => `<button class="filter-chip ${currentFilters.type === t ? 'active' : ''}" onclick="Resources.setFilter('type','${t}')">${t === 'all' ? 'All Types' : t}</button>`).join('')}
      </div>
    `;

    if (filteredResources.length === 0) {
      container.innerHTML = filterHtml + `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <div class="empty-state-title">No resources found</div>
          <div class="empty-state-text">Try adjusting your filters</div>
        </div>
      `;
      setupSearchListener();
      return;
    }

    const tableRows = filteredResources.map(r => {
      const attempted = PrepData.isResourceAttempted(r.id);
      const statusIcon = r.status === 'verified' ? '🟢' : r.status === 'partial' ? '🟡' : r.status === 'broken' ? '🔴' : '⚪';
      const stars = '⭐'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      const freeLabel = r.loginRequired ? 'Free — Login' : r.free === 'Limited' ? 'Limited Free' : '✓ Free';

      return `
        <tr class="${attempted ? 'attempted' : ''}">
          <td><span class="badge badge-primary">${r.exam}</span></td>
          <td>${r.section}</td>
          <td><span class="badge badge-info">${r.type}</span></td>
          <td>
            <div style="font-weight:500">${r.name}</div>
            <div style="font-size:12px;color:var(--text-tertiary)">${r.platform}</div>
          </td>
          <td><span style="font-size:12px">${stars}</span></td>
          <td><span style="font-size:12px">${freeLabel}</span></td>
          <td>${statusIcon}</td>
          <td>
            ${r.isPdf
              ? `<button class="btn btn-start-test" onclick="Resources.startTest('${r.id}')">📄 OPEN →</button>`
              : r.url && r.url !== '#'
                ? `<a href="${r.url}" target="_blank" class="btn btn-start-test" onclick="Resources.startTest('${r.id}')">START →</a>`
                : '<span style="font-size:12px;color:var(--text-tertiary)">Coming soon</span>'}
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = filterHtml + `
      <div style="overflow-x:auto">
        <table class="resource-table">
          <thead>
            <tr>
              <th>Exam</th>
              <th>Section</th>
              <th>Type</th>
              <th>Resource</th>
              <th>Rating</th>
              <th>Free?</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      <div style="padding:12px 0;font-size:12px;color:var(--text-tertiary);text-align:center">
        Showing ${filteredResources.length} of ${allResources.length} resources
      </div>
    `;

    setupSearchListener();
  }

  function setupSearchListener() {
    const searchInput = document.getElementById('resource-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
        applyFilters();
        renderResources();
      });
    }
  }

  // ─── Default Resources (Built-in fallback — mirrors data/resources.json) ───
  // Only used if data/resources.json can't be fetched (e.g. opened via file:// instead of a server).
  function getDefaultResources() {
    return [
      { id: 'cat-official-mock', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'IIM (Official)', name: 'CAT Official Mock Test', url: 'https://iimcat.ac.in/', free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'partial', lastVerified: '2026-08-22' },
      { id: 'cat-cracku-mock', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'Cracku', name: 'CAT Free Mock Tests (3 full + 3 sectional)', url: 'https://cracku.in/cat-mock-test', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-cracku-pyq', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku', name: 'CAT Previous Year Papers', url: 'https://cracku.in/cat-previous-papers/', free: 'Yes', loginRequired: true, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-cracku-daily', exam: 'CAT', section: 'QA', topic: 'All', type: 'Daily Practice', platform: 'Cracku', name: 'CAT Daily Target — VARC, DILR & Quant', url: 'https://cracku.in/cat-daily-target', free: 'Yes', loginRequired: true, difficulty: 2, rating: 4, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-cracku-quant-study', exam: 'CAT', section: 'QA', topic: 'All', type: 'Topic Test', platform: 'Cracku', name: 'CAT Quant Study Material — Topic-wise Questions & PDFs', url: 'https://cracku.in/cat-quant-study-material-2025/', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-cracku-varc-study', exam: 'CAT', section: 'VARC', topic: 'All', type: 'Topic Test', platform: 'Cracku', name: 'CAT VARC Study Material — Topic-wise Questions & PDFs', url: 'https://cracku.in/cat-varc-study-material-2025/', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-cracku-dilr-study', exam: 'CAT', section: 'DILR', topic: 'All', type: 'Topic Test', platform: 'Cracku', name: 'CAT DILR Study Material — Topic-wise Questions & PDFs', url: 'https://cracku.in/cat-dilr-study-material-2025/', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },

      { id: 'xat-cracku-mock', exam: 'XAT', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'Cracku', name: 'XAT Free Mock Tests', url: 'https://cracku.in/xat-mock-test', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'xat-cracku-sectional', exam: 'XAT', section: 'VALR', topic: 'All', type: 'Sectional', platform: 'Cracku', name: 'XAT Sectional Tests — VARC, DILR & DM', url: 'https://cracku.in/xat/sectional-tests', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'xat-cracku-dm', exam: 'XAT', section: 'DM', topic: 'Decision Making', type: 'Sectional', platform: 'Cracku', name: 'XAT Decision Making Sectional Tests', url: 'https://cracku.in/xat-dm-sectional-tests', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },

      { id: 'cet-cracku-mock', exam: 'MAH CET', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'Cracku', name: 'MAH MBA CET Mock Test with Solutions', url: 'https://cracku.in/mah-mba-cet-mock-test', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },

      { id: 'nmat-official', exam: 'NMAT', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'GMAC (Official)', name: 'NMAT Official Practice Exam 1 (Free)', url: 'https://www.mba.com/exams/nmat/prep-for-the-exam/official-nmat-prep', free: 'Yes', loginRequired: true, difficulty: 3, rating: 5, status: 'partial', lastVerified: '2026-08-22' },

      { id: 'sbi-oliveboard-mock', exam: 'SBI PO', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'Oliveboard', name: 'SBI PO Mock Test — Prelims & Mains', url: 'https://www.oliveboard.in/sbi-po-mock-test/', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'sbi-adda-mock', exam: 'SBI PO', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'Adda247', name: 'SBI PO Mock Test Series', url: 'https://www.adda247.com/sbi-po/mock-test', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },

      { id: 'ibps-adda-mock', exam: 'IBPS PO', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'Adda247', name: 'IBPS PO Mock Test — Prelims, Mains & Descriptive (3 free)', url: 'https://www.adda247.com/ibps-po/mock-test', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },

      { id: 'rbi-oliveboard-live', exam: 'RBI Grade B', section: 'Full Mock', topic: 'All', type: 'Sectional', platform: 'Oliveboard', name: 'RBI Grade B Phase 1 Free Live Test (weekly)', url: 'https://www.oliveboard.in/rbi-grade-b-live-test/', free: 'Yes', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'rbi-ixambee-mock', exam: 'RBI Grade B', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'ixamBee', name: 'RBI Grade B Phase 1 Test Series', url: 'https://www.ixambee.com/free-mock-tests/rbi-grade-b', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },

      { id: 'sebi-adda-mock', exam: 'SEBI Grade A', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'Adda247', name: 'SEBI Grade A Mock Test (3 free, Phase 1 & 2)', url: 'https://www.adda247.com/sebi-grade-a/mock-test', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },

      { id: 'ssc-adda-mock', exam: 'SSC CGL', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'Adda247', name: 'SSC CGL Mock Test — Tier 1 & 2 (3 free)', url: 'https://www.adda247.com/ssc-cgl/mock-test', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'ssc-testbook-mock', exam: 'SSC CGL', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'Testbook', name: 'SSC CGL Test Series — Tier I & II', url: 'https://testbook.com/ssc-cgl/test-series', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },

      { id: 'rrb-adda-mock', exam: 'RRB NTPC', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'Adda247', name: 'RRB NTPC Mock Test — CBT 1 & 2', url: 'https://www.adda247.com/rrb-ntpc-undergraduate/mock-test', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'rrb-oliveboard-mock', exam: 'RRB NTPC', section: 'Full Mock', topic: 'All', type: 'Full Mock', platform: 'Oliveboard', name: 'RRB NTPC Mock Test (English & Hindi)', url: 'https://www.oliveboard.in/rrb-ntpc-mock-test/', free: 'Limited', loginRequired: true, difficulty: 3, rating: 4, status: 'verified', lastVerified: '2026-08-22' },

      // CAT PYQ full papers — bundled locally, opens inside the app
      { id: 'cat-pyq-2021-s1', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2021 Slot 1 — Full Paper', url: './data/pyqs/CAT-2021-Slot-1-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2021-Slot-1-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2021-s2', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2021 Slot 2 — Full Paper', url: './data/pyqs/CAT-2021-Slot-2-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2021-Slot-2-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2021-s3', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2021 Slot 3 — Full Paper', url: './data/pyqs/CAT-2021-Slot-3-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2021-Slot-3-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2022-s1', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2022 Slot 1 — Full Paper', url: './data/pyqs/CAT-2022-Slot-1-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2022-Slot-1-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2022-s2', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2022 Slot 2 — Full Paper', url: './data/pyqs/CAT-2022-Slot-2-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2022-Slot-2-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2022-s3', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2022 Slot 3 — Full Paper', url: './data/pyqs/CAT-2022-Slot-3-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2022-Slot-3-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2023-s1', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2023 Slot 1 — Full Paper', url: './data/pyqs/CAT-2023-Slot-1-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2023-Slot-1-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2023-s2', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2023 Slot 2 — Full Paper', url: './data/pyqs/CAT-2023-Slot-2-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2023-Slot-2-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2023-s3', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2023 Slot 3 — Full Paper', url: './data/pyqs/CAT-2023-Slot-3-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2023-Slot-3-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2024-s1', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2024 Slot 1 — Full Paper', url: './data/pyqs/CAT-2024-Slot-1-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2024-Slot-1-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2024-s2', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2024 Slot 2 — Full Paper', url: './data/pyqs/CAT-2024-Slot-2-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2024-Slot-2-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2024-s3', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2024 Slot 3 — Full Paper', url: './data/pyqs/CAT-2024-Slot-3-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2024-Slot-3-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2025-s1', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2025 Slot 1 — Full Paper', url: './data/pyqs/CAT-2025-Slot-1-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2025-Slot-1-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2025-s2', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2025 Slot 2 — Full Paper', url: './data/pyqs/CAT-2025-Slot-2-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2025-Slot-2-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' },
      { id: 'cat-pyq-2025-s3', exam: 'CAT', section: 'Full Mock', topic: 'All', type: 'PYQ', platform: 'Cracku (bundled with the app)', name: 'CAT 2025 Slot 3 — Full Paper', url: './data/pyqs/CAT-2025-Slot-3-Questions.pdf', solutionsUrl: './data/pyqs/CAT-2025-Slot-3-Solutions.pdf', isPdf: true, free: 'Yes', loginRequired: false, difficulty: 4, rating: 5, status: 'verified', lastVerified: '2026-08-22' }
    ];
  }

  return { init, refresh, setFilter, startTest, getRecommendedResource, getResourceDuration };
})();
