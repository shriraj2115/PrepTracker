/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — Data Layer
   localStorage CRUD, exam configurations, data models
   ═══════════════════════════════════════════════════════════════ */

const PrepData = (() => {
  const STORAGE_KEY = 'preptracker_v1';
  const SETTINGS_KEY = 'preptracker_settings_v1';

  // ─── Exam Configurations ───
  const EXAM_CONFIG = {
    CAT: {
      name: 'CAT',
      fullName: 'Common Admission Test',
      category: 'MBA',
      sections: {
        'VARC': { name: 'Verbal Ability & Reading Comprehension', totalQ: 24, maxMarks: 72, time: 40 },
        'DILR': { name: 'Data Interpretation & Logical Reasoning', totalQ: 20, maxMarks: 60, time: 40 },
        'QA':   { name: 'Quantitative Ability', totalQ: 22, maxMarks: 66, time: 40 }
      },
      totalQ: 66,
      maxMarks: 198,
      totalTime: 120,
      markingScheme: { correct: 3, incorrect: -1 },
      topics: {
        'VARC': ['Reading Comprehension', 'Para Jumbles', 'Para Summary', 'Odd One Out', 'Sentence Completion', 'Vocab Based'],
        'DILR': ['Data Interpretation', 'Arrangements', 'Puzzles', 'Caselets', 'Games & Tournaments', 'Networks', 'Distributions'],
        'QA': ['Number Systems', 'Algebra', 'Arithmetic', 'Geometry', 'Mensuration', 'Modern Math', 'Percentages', 'Profit & Loss', 'Time & Work', 'Time Speed Distance', 'Probability', 'Permutation & Combination', 'Logarithms', 'Inequalities', 'Functions']
      }
    },
    XAT: {
      name: 'XAT',
      fullName: 'Xavier Aptitude Test',
      category: 'MBA',
      sections: {
        'QADI': { name: 'Quantitative Ability & Data Interpretation', totalQ: 28, maxMarks: 28, time: 40 },
        'VALR': { name: 'Verbal Ability & Logical Reasoning', totalQ: 26, maxMarks: 26, time: 40 },
        'DM':   { name: 'Decision Making', totalQ: 21, maxMarks: 21, time: 35 },
        'GK':   { name: 'General Knowledge', totalQ: 25, maxMarks: 25, time: 15 }
      },
      totalQ: 100,
      maxMarks: 100,
      totalTime: 130,
      markingScheme: { correct: 1, incorrect: -0.25 },
      topics: {
        'QADI': ['Arithmetic', 'Algebra', 'Geometry', 'Number Systems', 'Data Interpretation', 'Data Sufficiency'],
        'VALR': ['Reading Comprehension', 'Critical Reasoning', 'Para Jumbles', 'Sentence Correction', 'Vocab', 'Logical Reasoning'],
        'DM': ['Situational', 'Ethical Dilemma', 'Analytical Reasoning', 'Data Based Decisions'],
        'GK': ['Current Affairs', 'Business & Economy', 'Politics', 'History', 'Science', 'Literature']
      }
    },
    'MAH CET': {
      name: 'MAH CET',
      fullName: 'MAH MBA/MMS CET',
      category: 'MBA',
      sections: {
        'LR': { name: 'Logical Reasoning', totalQ: 75, maxMarks: 75, time: 37 },
        'AR': { name: 'Abstract Reasoning', totalQ: 25, maxMarks: 25, time: 13 },
        'QA': { name: 'Quantitative Aptitude', totalQ: 50, maxMarks: 50, time: 38 },
        'VA': { name: 'Verbal Ability / Reading Comprehension', totalQ: 50, maxMarks: 50, time: 37 }
      },
      totalQ: 200,
      maxMarks: 200,
      totalTime: 150,
      markingScheme: { correct: 1, incorrect: 0 },
      topics: {
        'LR': ['Syllogisms', 'Blood Relations', 'Coding-Decoding', 'Arrangements', 'Puzzles', 'Directions', 'Inequalities'],
        'AR': ['Pattern Recognition', 'Series Completion', 'Analogies', 'Mirror Images'],
        'QA': ['Arithmetic', 'Algebra', 'Geometry', 'Number Systems', 'DI'],
        'VA': ['Reading Comprehension', 'Grammar', 'Vocabulary', 'Para Jumbles', 'Fill in Blanks']
      }
    },
    NMAT: {
      name: 'NMAT',
      fullName: 'NMAT by GMAC',
      category: 'MBA',
      sections: {
        'LS': { name: 'Language Skills', totalQ: 36, maxMarks: 36, time: 28 },
        'QS': { name: 'Quantitative Skills', totalQ: 36, maxMarks: 36, time: 52 },
        'LR': { name: 'Logical Reasoning', totalQ: 36, maxMarks: 36, time: 40 }
      },
      totalQ: 108,
      maxMarks: 108,
      totalTime: 120,
      markingScheme: { correct: 1, incorrect: 0 },
      topics: {
        'LS': ['Reading Comprehension', 'Vocabulary', 'Grammar', 'Para Jumbles'],
        'QS': ['Arithmetic', 'Algebra', 'Geometry', 'Number Systems', 'Data Interpretation', 'Modern Math'],
        'LR': ['Arrangements', 'Puzzles', 'Blood Relations', 'Coding-Decoding', 'Syllogisms', 'Series']
      }
    },
    'SBI PO': {
      name: 'SBI PO',
      fullName: 'State Bank of India Probationary Officer',
      category: 'Banking',
      sections: {
        'Quant': { name: 'Quantitative Aptitude', totalQ: 35, maxMarks: 35, time: 20 },
        'Reasoning': { name: 'Reasoning Ability', totalQ: 35, maxMarks: 35, time: 20 },
        'English': { name: 'English Language', totalQ: 30, maxMarks: 30, time: 20 }
      },
      totalQ: 100,
      maxMarks: 100,
      totalTime: 60,
      markingScheme: { correct: 1, incorrect: -0.25 },
      topics: {
        'Quant': ['Number Series', 'Simplification', 'Data Interpretation', 'Quadratic Equations', 'Arithmetic', 'Percentage', 'Ratio'],
        'Reasoning': ['Puzzles', 'Seating Arrangement', 'Syllogisms', 'Blood Relations', 'Coding-Decoding', 'Inequality', 'Direction'],
        'English': ['Reading Comprehension', 'Cloze Test', 'Error Detection', 'Sentence Rearrangement', 'Fill in Blanks']
      }
    },
    'IBPS PO': {
      name: 'IBPS PO',
      fullName: 'IBPS Probationary Officer',
      category: 'Banking',
      sections: {
        'Quant': { name: 'Quantitative Aptitude', totalQ: 35, maxMarks: 35, time: 20 },
        'Reasoning': { name: 'Reasoning Ability', totalQ: 35, maxMarks: 35, time: 20 },
        'English': { name: 'English Language', totalQ: 30, maxMarks: 30, time: 20 }
      },
      totalQ: 100,
      maxMarks: 100,
      totalTime: 60,
      markingScheme: { correct: 1, incorrect: -0.25 },
      topics: {
        'Quant': ['Number Series', 'Simplification', 'Data Interpretation', 'Quadratic Equations', 'Arithmetic', 'Percentage'],
        'Reasoning': ['Puzzles', 'Seating Arrangement', 'Syllogisms', 'Blood Relations', 'Coding-Decoding', 'Inequality'],
        'English': ['Reading Comprehension', 'Cloze Test', 'Error Detection', 'Sentence Rearrangement', 'Fill in Blanks']
      }
    },
    'RBI Grade B': {
      name: 'RBI Grade B',
      fullName: 'Reserve Bank of India Grade B Officer',
      category: 'Banking',
      sections: {
        'GA': { name: 'General Awareness', totalQ: 80, maxMarks: 80, time: 25 },
        'Quant': { name: 'Quantitative Aptitude', totalQ: 30, maxMarks: 30, time: 25 },
        'English': { name: 'English Language', totalQ: 30, maxMarks: 30, time: 25 },
        'Reasoning': { name: 'Reasoning', totalQ: 60, maxMarks: 60, time: 45 }
      },
      totalQ: 200,
      maxMarks: 200,
      totalTime: 120,
      markingScheme: { correct: 1, incorrect: -0.25 },
      topics: {
        'GA': ['Current Affairs', 'Banking Awareness', 'Economy', 'Finance'],
        'Quant': ['Number Series', 'DI', 'Arithmetic', 'Algebra'],
        'English': ['RC', 'Grammar', 'Vocabulary', 'Cloze Test'],
        'Reasoning': ['Puzzles', 'Seating', 'Syllogisms', 'Critical Reasoning']
      }
    },
    'SEBI Grade A': {
      name: 'SEBI Grade A',
      fullName: 'SEBI Grade A Officer',
      category: 'Banking',
      sections: {
        'GA': { name: 'General Awareness', totalQ: 40, maxMarks: 40, time: 20 },
        'Quant': { name: 'Quantitative Aptitude', totalQ: 30, maxMarks: 30, time: 20 },
        'English': { name: 'English Language', totalQ: 30, maxMarks: 30, time: 20 },
        'Reasoning': { name: 'Reasoning', totalQ: 30, maxMarks: 30, time: 20 },
        'Finance': { name: 'Commerce/Finance', totalQ: 40, maxMarks: 40, time: 20 }
      },
      totalQ: 170,
      maxMarks: 170,
      totalTime: 100,
      markingScheme: { correct: 1, incorrect: -0.25 },
      topics: {
        'GA': ['Current Affairs', 'Capital Markets', 'Securities Markets'],
        'Quant': ['Arithmetic', 'DI', 'Algebra'],
        'English': ['RC', 'Grammar', 'Vocabulary'],
        'Reasoning': ['Puzzles', 'Syllogisms', 'Analytical'],
        'Finance': ['Accounting', 'Finance', 'Economics', 'Securities']
      }
    },
    'SSC CGL': {
      name: 'SSC CGL',
      fullName: 'SSC Combined Graduate Level',
      category: 'Government',
      sections: {
        'Quant': { name: 'Quantitative Aptitude', totalQ: 25, maxMarks: 50, time: 15 },
        'Reasoning': { name: 'General Intelligence & Reasoning', totalQ: 25, maxMarks: 50, time: 15 },
        'English': { name: 'English Comprehension', totalQ: 25, maxMarks: 50, time: 15 },
        'GA': { name: 'General Awareness', totalQ: 25, maxMarks: 50, time: 15 }
      },
      totalQ: 100,
      maxMarks: 200,
      totalTime: 60,
      markingScheme: { correct: 2, incorrect: -0.5 },
      topics: {
        'Quant': ['Arithmetic', 'Algebra', 'Geometry', 'Trigonometry', 'Data Interpretation'],
        'Reasoning': ['Analogies', 'Classification', 'Series', 'Coding-Decoding', 'Matrix', 'Puzzles'],
        'English': ['Reading Comprehension', 'Cloze Test', 'Error Detection', 'Idioms', 'One Word Substitution'],
        'GA': ['History', 'Geography', 'Polity', 'Economy', 'Science', 'Current Affairs']
      }
    },
    'RRB NTPC': {
      name: 'RRB NTPC',
      fullName: 'Railway Recruitment Board NTPC',
      category: 'Government',
      sections: {
        'Math': { name: 'Mathematics', totalQ: 30, maxMarks: 30, time: 30 },
        'Reasoning': { name: 'General Intelligence & Reasoning', totalQ: 30, maxMarks: 30, time: 30 },
        'GA': { name: 'General Awareness', totalQ: 40, maxMarks: 40, time: 30 }
      },
      totalQ: 100,
      maxMarks: 100,
      totalTime: 90,
      markingScheme: { correct: 1, incorrect: -0.33 },
      topics: {
        'Math': ['Number System', 'BODMAS', 'Percentages', 'Ratio', 'Time & Work', 'Geometry', 'Mensuration'],
        'Reasoning': ['Analogies', 'Coding-Decoding', 'Puzzles', 'Series', 'Syllogisms', 'Classification'],
        'GA': ['Current Affairs', 'History', 'Geography', 'Polity', 'Economy', 'Science']
      }
    }
  };

  // ─── Test Types ───
  const TEST_TYPES = ['Full Mock', 'Sectional', 'Topic Test', 'PYQ', 'Mini Mock', 'Daily Practice'];

  // ─── Mistake Types ───
  const MISTAKE_TYPES = ['Silly Error', 'Concept Gap', 'Time Pressure', 'Misread Question', 'Wrong Approach', 'Guesswork', 'Left Unattempted', 'Calculation Error'];

  // ─── Default Settings ───
  const DEFAULT_SETTINGS = {
    studyStartTime: '11:00',
    dailyStudyHours: 4,
    targetExams: ['CAT'],
    examDates: {
      'CAT': '2026-11-24',
      'XAT': '2027-01-03',
      'MAH CET': '2027-03-15',
      'NMAT': '2026-12-15'
    },
    notificationsEnabled: true,
    pomodoroMinutes: 25,
    breakMinutes: 5,
    theme: 'light',
    userName: 'Student',
    morningBriefingShown: null, // date string of last shown
    weeklyReportDay: 0, // Sunday
    openRouterApiKey: null, // optional — enables the AI Assistant features, stored locally only
    openRouterModel: 'openai/gpt-4o-mini'
  };

  // ─── Default Roadmap Template ───
  const DEFAULT_ROADMAP_TEMPLATE = [
    { name: 'Quant Practice', section: 'QA', type: 'learn', duration: 50, category: 'quant' },
    { name: 'VARC Practice', section: 'VARC', type: 'practice', duration: 40, category: 'varc' },
    { name: 'DILR Practice', section: 'DILR', type: 'practice', duration: 45, category: 'dilr' },
    { name: 'Current Affairs', section: 'GK', type: 'read', duration: 20, category: 'gk' },
    { name: 'Mock / Sectional', section: null, type: 'test', duration: 35, category: 'mock' },
    { name: 'Revision', section: null, type: 'review', duration: 20, category: 'review' }
  ];

  // ─── Data Access ───
  function getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultData();
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading data:', e);
      return createDefaultData();
    }
  }

  function saveData(data) {
    try {
      data.lastModified = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving data:', e);
    }
  }

  function getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }

  function createDefaultData() {
    const data = {
      version: 1,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      mocks: [],           // All mock/sectional entries
      dailyLogs: {},       // { 'YYYY-MM-DD': { tasks: [...], studyMinutes: N } }
      weakTopics: [],      // Auto-maintained weakness list
      revisionSchedule: [], // Spaced repetition items
      achievements: [],     // Earned badges
      streakData: { current: 0, longest: 0, lastStudyDate: null },
      resourceAttempts: {}, // { resourceId: { date, score, accuracy } }
      currentAffairs: {},   // { 'YYYY-MM-DD': [{ title, read, starred }] }
      errorLog: []          // Optional weakness entries
    };
    saveData(data);
    return data;
  }

  // ─── Mock CRUD ───
  function addMock(mockEntry) {
    const data = getData();
    const id = 'mock_' + Date.now();

    // Auto-calculate fields
    const incorrect = mockEntry.attempted - mockEntry.correct;
    const accuracy = mockEntry.attempted > 0 ? ((mockEntry.correct / mockEntry.attempted) * 100) : 0;
    const examConfig = EXAM_CONFIG[mockEntry.exam];
    const sectionConfig = examConfig?.sections?.[mockEntry.section];
    const totalQ = sectionConfig?.totalQ || examConfig?.totalQ || mockEntry.attempted;
    const maxMarks = sectionConfig?.maxMarks || examConfig?.maxMarks || mockEntry.score;
    const attemptRate = totalQ > 0 ? ((mockEntry.attempted / totalQ) * 100) : 0;
    const errorRate = mockEntry.attempted > 0 ? ((incorrect / mockEntry.attempted) * 100) : 0;
    const scorePercentage = maxMarks > 0 ? ((mockEntry.score / maxMarks) * 100) : 0;
    const avgTimePerQ = mockEntry.attempted > 0 ? (mockEntry.time / mockEntry.attempted) : 0;

    // Get previous mocks for comparison
    const prevMocks = data.mocks.filter(m => m.exam === mockEntry.exam && m.section === mockEntry.section);
    const lastMock = prevMocks.length > 0 ? prevMocks[prevMocks.length - 1] : null;
    const last3 = prevMocks.slice(-3);
    const last5 = prevMocks.slice(-5);
    const last3Avg = last3.length > 0 ? (last3.reduce((s, m) => s + m.accuracy, 0) / last3.length) : null;
    const last5Avg = last5.length > 0 ? (last5.reduce((s, m) => s + m.accuracy, 0) / last5.length) : null;
    const vsPrevious = lastMock ? (accuracy - lastMock.accuracy) : null;

    // Detect weakest section for this exam
    const examMocks = data.mocks.filter(m => m.exam === mockEntry.exam);
    const sectionAccuracies = {};
    examMocks.forEach(m => {
      if (!sectionAccuracies[m.section]) sectionAccuracies[m.section] = [];
      sectionAccuracies[m.section].push(m.accuracy);
    });
    // Add current
    if (!sectionAccuracies[mockEntry.section]) sectionAccuracies[mockEntry.section] = [];
    sectionAccuracies[mockEntry.section].push(accuracy);

    let weakestSection = null;
    let weakestAvg = 100;
    Object.entries(sectionAccuracies).forEach(([sec, accs]) => {
      const avg = accs.reduce((a, b) => a + b, 0) / accs.length;
      if (avg < weakestAvg) { weakestAvg = avg; weakestSection = sec; }
    });

    // Calculate exam readiness (simple weighted formula)
    const allExamMocks = [...examMocks, { accuracy, scorePercentage }];
    const recentMocks = allExamMocks.slice(-10);
    const avgAccuracy = recentMocks.reduce((s, m) => s + (m.accuracy || 0), 0) / recentMocks.length;
    const examReadiness = Math.min(100, Math.round(avgAccuracy * 1.1));

    // Recommended action
    let recommendedAction = '';
    if (accuracy < 50) recommendedAction = `Focus on ${mockEntry.section} fundamentals. Do topic tests.`;
    else if (accuracy < 65) recommendedAction = `Practice more ${mockEntry.section} sectionals. Focus on: ${mockEntry.weakTopic || weakestSection || 'weak areas'}`;
    else if (accuracy < 80) recommendedAction = `Good progress! Try mixed ${mockEntry.section} sectionals at higher difficulty.`;
    else recommendedAction = `Excellent! Move to full mocks. Maintain accuracy above 80%.`;

    // Speed diagnostic — accuracy alone hides a slow-but-accurate problem, which is
    // costly on negative-marking exams where you also need to attempt enough questions.
    const benchmarkTimePerQ = sectionConfig
      ? sectionConfig.time / sectionConfig.totalQ
      : (examConfig ? examConfig.totalTime / examConfig.totalQ : null);
    if (benchmarkTimePerQ && avgTimePerQ > benchmarkTimePerQ * 1.3) {
      recommendedAction += ` You're also averaging ${avgTimePerQ.toFixed(1)} min/Q vs a ${benchmarkTimePerQ.toFixed(1)} min/Q budget — work on speed too.`;
    }

    // Revision dates (spaced repetition)
    const now = new Date();
    const revisionDates = [1, 3, 7, 14, 30].map(days => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    });

    const fullEntry = {
      id,
      date: new Date().toISOString(),
      dateStr: new Date().toISOString().split('T')[0],

      // User input
      exam: mockEntry.exam,
      testType: mockEntry.testType,
      section: mockEntry.section,
      testName: mockEntry.testName || (mockEntry.section === mockEntry.testType ? mockEntry.section : `${mockEntry.section} ${mockEntry.testType}`),
      score: mockEntry.score,
      attempted: mockEntry.attempted,
      correct: mockEntry.correct,
      time: mockEntry.time,
      weakTopic: mockEntry.weakTopic || null,
      mistakeType: mockEntry.mistakeType || null,

      // Auto-calculated
      incorrect,
      accuracy: Math.round(accuracy * 100) / 100,
      attemptRate: Math.round(attemptRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      scorePercentage: Math.round(scorePercentage * 100) / 100,
      avgTimePerQ: Math.round(avgTimePerQ * 100) / 100,
      vsPrevious: vsPrevious !== null ? Math.round(vsPrevious * 100) / 100 : null,
      last3Avg: last3Avg !== null ? Math.round(last3Avg * 100) / 100 : null,
      last5Avg: last5Avg !== null ? Math.round(last5Avg * 100) / 100 : null,
      weakestSection,
      examReadiness,
      recommendedAction,
      revisionDates,

      // Metadata
      totalQ,
      maxMarks
    };

    data.mocks.push(fullEntry);

    // Update weakness tracking
    if (mockEntry.weakTopic) {
      updateWeakTopics(data, mockEntry.exam, mockEntry.section, mockEntry.weakTopic, accuracy);
    }

    // Add revision schedule entries
    revisionDates.forEach((date, i) => {
      data.revisionSchedule.push({
        id: `rev_${id}_${i}`,
        mockId: id,
        date,
        topic: mockEntry.weakTopic || mockEntry.section,
        exam: mockEntry.exam,
        done: false,
        priority: i < 2 ? 'high' : 'medium'
      });
    });

    // Update streak
    updateStreak(data);

    // Check achievements
    checkAchievements(data);

    saveData(data);
    return fullEntry;
  }

  function getMocks(filters = {}) {
    const data = getData();
    let mocks = [...data.mocks];

    if (filters.exam) mocks = mocks.filter(m => m.exam === filters.exam);
    if (filters.section) mocks = mocks.filter(m => m.section === filters.section);
    if (filters.testType) mocks = mocks.filter(m => m.testType === filters.testType);
    if (filters.dateFrom) mocks = mocks.filter(m => m.dateStr >= filters.dateFrom);
    if (filters.dateTo) mocks = mocks.filter(m => m.dateStr <= filters.dateTo);

    return mocks;
  }

  // ─── Daily Log ───
  function getDailyLog(dateStr) {
    const data = getData();
    if (!dateStr) dateStr = new Date().toISOString().split('T')[0];
    return data.dailyLogs[dateStr] || null;
  }

  function saveDailyLog(dateStr, log) {
    const data = getData();
    data.dailyLogs[dateStr] = log;
    updateStreak(data);
    saveData(data);
  }

  function getTodayLog() {
    const today = new Date().toISOString().split('T')[0];
    return getDailyLog(today);
  }

  function saveTodayLog(log) {
    const today = new Date().toISOString().split('T')[0];
    saveDailyLog(today, log);
  }

  function createDailyLog(tasks) {
    return {
      tasks: tasks.map((t, i) => ({
        id: `task_${Date.now()}_${i}`,
        name: t.name,
        section: t.section,
        topic: t.topic || null,
        type: t.type,
        duration: t.duration,
        category: t.category,
        status: 'pending', // pending, done, skipped
        actualTime: null,
        resourceLink: t.resourceLink || null,
        resourceName: t.resourceName || null,
        resourceId: t.resourceId || null,
        resourceDuration: t.resourceDuration || null,
        exam: t.exam || null,
        testType: t.testType || null,
        isPdf: !!t.isPdf,
        solutionsUrl: t.solutionsUrl || null,
        cheatSheetUrl: t.cheatSheetUrl || null,
        cheatSheetName: t.cheatSheetName || null
      })),
      totalPlanned: tasks.reduce((s, t) => s + t.duration, 0),
      totalActual: 0,
      date: new Date().toISOString().split('T')[0]
    };
  }

  // ─── Syllabus Curriculum ───
  // Rotates through the full CAT syllabus (one QA + one VARC + one DILR topic per day)
  // so each day covers a different, specific topic instead of a generic section name.
  // Cycle lengths differ per section (15/6/7 topics), so the 3-topic combination keeps
  // varying for months before repeating exactly — full coverage, then natural revision.
  const CURRICULUM_START_DATE = '2026-08-23';

  function getCurriculumDayIndex(dateStr) {
    const start = new Date(CURRICULUM_START_DATE + 'T00:00:00');
    const d = new Date(dateStr + 'T00:00:00');
    const diff = Math.round((d - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  // 15 real past CAT papers (2021-2025), bundled with the app, split into a
  // Questions-only PDF (for attempting cold) and a separate Solutions PDF.
  const CAT_PYQ_PAPERS = [
    { id: 'cat-pyq-2021-s1', label: 'CAT 2021 Slot 1', slug: 'CAT-2021-Slot-1' },
    { id: 'cat-pyq-2021-s2', label: 'CAT 2021 Slot 2', slug: 'CAT-2021-Slot-2' },
    { id: 'cat-pyq-2021-s3', label: 'CAT 2021 Slot 3', slug: 'CAT-2021-Slot-3' },
    { id: 'cat-pyq-2022-s1', label: 'CAT 2022 Slot 1', slug: 'CAT-2022-Slot-1' },
    { id: 'cat-pyq-2022-s2', label: 'CAT 2022 Slot 2', slug: 'CAT-2022-Slot-2' },
    { id: 'cat-pyq-2022-s3', label: 'CAT 2022 Slot 3', slug: 'CAT-2022-Slot-3' },
    { id: 'cat-pyq-2023-s1', label: 'CAT 2023 Slot 1', slug: 'CAT-2023-Slot-1' },
    { id: 'cat-pyq-2023-s2', label: 'CAT 2023 Slot 2', slug: 'CAT-2023-Slot-2' },
    { id: 'cat-pyq-2023-s3', label: 'CAT 2023 Slot 3', slug: 'CAT-2023-Slot-3' },
    { id: 'cat-pyq-2024-s1', label: 'CAT 2024 Slot 1', slug: 'CAT-2024-Slot-1' },
    { id: 'cat-pyq-2024-s2', label: 'CAT 2024 Slot 2', slug: 'CAT-2024-Slot-2' },
    { id: 'cat-pyq-2024-s3', label: 'CAT 2024 Slot 3', slug: 'CAT-2024-Slot-3' },
    { id: 'cat-pyq-2025-s1', label: 'CAT 2025 Slot 1', slug: 'CAT-2025-Slot-1' },
    { id: 'cat-pyq-2025-s2', label: 'CAT 2025 Slot 2', slug: 'CAT-2025-Slot-2' },
    { id: 'cat-pyq-2025-s3', label: 'CAT 2025 Slot 3', slug: 'CAT-2025-Slot-3' }
  ];
  const PYQ_CYCLE_DAYS = 6; // one full past paper every 6th day — all 15 fit before the exam

  // Topic-wise formula/cheat-sheet PDFs, bundled with the app. Keyed by the exact
  // topic name used in EXAM_CONFIG.CAT.topics; a topic can point to more than one
  // file (all shown in Resources), but the daily task links to the first only.
  const CAT_CHEAT_SHEETS = {
    'Number Systems': [
      { file: 'QA-Number-Systems.pdf', label: 'Number Systems Formulas' },
      { file: 'QA-Remainder-Theorem.pdf', label: 'Remainder Theorem Formulas' }
    ],
    'Geometry': [{ file: 'QA-Geometry.pdf', label: 'Geometry Formulas' }],
    'Inequalities': [{ file: 'QA-Inequalities.pdf', label: 'Inequalities Formulas' }],
    'Logarithms': [{ file: 'QA-Logarithms.pdf', label: 'Logarithms, Surds & Indices Formulas' }],
    'Permutation & Combination': [{ file: 'QA-Permutation-Combination.pdf', label: 'Permutations & Combinations Formulas' }],
    'Profit & Loss': [{ file: 'QA-Profit-Loss.pdf', label: 'Profit, Loss & Discount Formulas' }],
    'Algebra': [{ file: 'QA-Quadratic-Equations.pdf', label: 'Quadratic Equations Formulas' }],
    'Arithmetic': [
      { file: 'QA-Ratio-Proportion.pdf', label: 'Ratio & Proportion Formulas' },
      { file: 'QA-Mixtures-Alligations-1.pdf', label: 'Mixtures & Alligations Formulas (1)' },
      { file: 'QA-Mixtures-Alligations-2.pdf', label: 'Mixtures & Alligations Formulas (2)' },
      { file: 'QA-Simple-Compound-Interest.pdf', label: 'Simple & Compound Interest Formulas' }
    ],
    'Modern Math': [{ file: 'QA-Set-Theory-Venn.pdf', label: 'Set Theory & Venn Diagrams Formulas' }],
    'Time Speed Distance': [{ file: 'QA-Time-Speed-Distance-Work.pdf', label: 'Time, Speed, Distance & Work Formulas' }],
    'Time & Work': [
      { file: 'QA-Time-Speed-Distance-Work.pdf', label: 'Time, Speed, Distance & Work Formulas' },
      { file: 'QA-Pipes-Cisterns-Practice.pdf', label: 'Pipes & Cisterns Practice (with answers)' }
    ],
    'Probability': [{ file: 'QA-Probability-Bayes.pdf', label: 'Probability — Bayes Theorem Formulas' }]
  };
  const VARC_CHEAT_SHEET = { file: 'VARC-Cheat-Sheet.pdf', label: 'CAT VARC Cheat Sheet (all topics)' };

  // Topic-wise DILR practice sets (real questions + solutions), bundled with the app.
  // A topic can have several sets — the daily task cycles through them each time that
  // topic comes up again, instead of repeating the same one every 7 days.
  const DILR_PRACTICE_SETS = {
    'Data Interpretation': [
      { slug: 'DILR-DI-Basics', label: 'Data Interpretation Basics (103 Qs)' },
      { slug: 'DILR-DI-General', label: 'Data Interpretation (12 Qs)' },
      { slug: 'DILR-Charts', label: 'Charts (163 Qs)' },
      { slug: 'DILR-DI-Connected-Datasets', label: 'DI with Connected Data Sets (35 Qs)' },
      { slug: 'DILR-DI-Misc', label: 'DI Miscellaneous (4 Qs)' },
      { slug: 'DILR-Venn-Diagrams', label: 'Venn Diagrams (48 Qs)' },
      { slug: 'DILR-Quant-Based-DI', label: 'Quant Based DI (54 Qs)' },
      { slug: 'DILR-Special-Charts', label: 'Special Charts (54 Qs)' },
      { slug: 'DILR-Data-Change-Over-Period', label: 'Data Change Over a Period (75 Qs)' },
      { slug: 'DILR-Table-Missing-Values', label: 'Table with Missing Values (75 Qs)' }
    ],
    'Arrangements': [
      { slug: 'DILR-Arrangements', label: 'Arrangement Questions (121 Qs)' },
      { slug: 'DILR-2D-3D-LR', label: '2D & 3D LR (54 Qs)' }
    ],
    'Puzzles': [
      { slug: 'DILR-Puzzles-General', label: 'Puzzles (80 Qs)' },
      { slug: 'DILR-Scheduling', label: 'Scheduling (34 Qs)' },
      { slug: 'DILR-Selection-With-Condition', label: 'Selection With Condition (41 Qs)' },
      { slug: 'DILR-Maxima-Minima', label: 'Maxima-Minima (24 Qs)' },
      { slug: 'DILR-Coins-Weights', label: 'Coins & Weights (8 Qs)' },
      { slug: 'DILR-Truth-Lie', label: 'Truth Lie Concept (3 Qs)' }
    ],
    'Games & Tournaments': [{ slug: 'DILR-Games-Tournaments', label: 'Games & Tournaments (61 Qs)' }],
    'Networks': [{ slug: 'DILR-Networks', label: 'Routes & Networks (13 Qs)' }]
  };

  function buildCatDailyTasks(dateStr) {
    const topics = EXAM_CONFIG.CAT.topics;
    const dayIdx = getCurriculumDayIndex(dateStr);
    const qaTopic = topics.QA[dayIdx % topics.QA.length];
    const varcTopic = topics.VARC[dayIdx % topics.VARC.length];
    const dilrTopic = topics.DILR[dayIdx % topics.DILR.length];

    const qaSheet = CAT_CHEAT_SHEETS[qaTopic] && CAT_CHEAT_SHEETS[qaTopic][0];

    const dilrSets = DILR_PRACTICE_SETS[dilrTopic];
    const dilrSet = dilrSets ? dilrSets[Math.floor(dayIdx / topics.DILR.length) % dilrSets.length] : null;

    const tasks = [
      {
        name: `Quant — ${qaTopic}`, section: 'QA', topic: qaTopic, type: 'learn', duration: 50, category: 'quant',
        cheatSheetUrl: qaSheet ? `./data/cheatsheets/${qaSheet.file}` : null,
        cheatSheetName: qaSheet ? qaSheet.label : null
      },
      {
        name: `VARC — ${varcTopic}`, section: 'VARC', topic: varcTopic, type: 'practice', duration: 40, category: 'varc',
        cheatSheetUrl: `./data/cheatsheets/${VARC_CHEAT_SHEET.file}`,
        cheatSheetName: VARC_CHEAT_SHEET.label
      },
      dilrSet
        ? {
            name: `DILR — ${dilrTopic}`, section: 'DILR', topic: dilrTopic, type: 'practice', duration: 45, category: 'dilr',
            resourceLink: `./data/lrdi/${dilrSet.slug}-Questions.pdf`,
            resourceName: dilrSet.label,
            solutionsUrl: `./data/lrdi/${dilrSet.slug}-Solutions.pdf`,
            isPdf: true
          }
        : { name: `DILR — ${dilrTopic}`, section: 'DILR', topic: dilrTopic, type: 'practice', duration: 45, category: 'dilr' },
      { name: 'Current Affairs', section: 'GK', type: 'read', duration: 20, category: 'gk' },
      { name: 'Mock / Sectional', section: null, type: 'test', duration: 35, category: 'mock' },
      { name: 'Revision', section: null, type: 'review', duration: 20, category: 'review' }
    ];

    if (dayIdx % PYQ_CYCLE_DAYS === PYQ_CYCLE_DAYS - 1) {
      const paper = CAT_PYQ_PAPERS[Math.floor(dayIdx / PYQ_CYCLE_DAYS) % CAT_PYQ_PAPERS.length];
      tasks[4] = {
        name: `CAT PYQ — ${paper.label}`,
        section: 'Full Mock',
        type: 'test',
        duration: 120,
        category: 'mock',
        resourceLink: `./data/pyqs/${paper.slug}-Questions.pdf`,
        resourceName: `${paper.label} — Full Paper`,
        resourceId: paper.id,
        resourceDuration: 120,
        exam: 'CAT',
        testType: 'PYQ',
        isPdf: true,
        solutionsUrl: `./data/pyqs/${paper.slug}-Solutions.pdf`
      };
    }

    return tasks;
  }

  // Builds today's task list: a real rotating syllabus for CAT, the generic template
  // for exams that don't have a curriculum defined yet.
  function buildDailyTasks(examKey, dateStr) {
    if (examKey === 'CAT') return buildCatDailyTasks(dateStr);
    return DEFAULT_ROADMAP_TEMPLATE;
  }

  // Single source of truth for "today's tasks" — creates them from the curriculum
  // exactly once per day if they don't exist yet, otherwise returns the existing log.
  function getOrCreateTodayLog() {
    let log = getTodayLog();
    if (log) return log;

    const today = new Date().toISOString().split('T')[0];
    const settings = getSettings();
    const primaryExam = settings.targetExams[0] || 'CAT';
    const tasks = buildDailyTasks(primaryExam, today);
    log = createDailyLog(tasks);
    saveTodayLog(log);
    return log;
  }

  // Tasks left un-done (not done, not skipped) from yesterday — surfaced as an alert
  // so missed work doesn't just silently disappear when a new day's plan appears.
  function getPendingFromYesterday() {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yStr = y.toISOString().split('T')[0];
    const log = getDailyLog(yStr);
    if (!log) return null;
    const pending = log.tasks.filter(t => t.status === 'pending');
    if (pending.length === 0) return null;
    return { date: yStr, tasks: pending };
  }

  // Credits free-form Timer (stopwatch/Pomodoro) study time to today's log,
  // so it counts toward streaks and the study-hours chart just like task time does.
  function addStudyMinutes(minutes) {
    if (!minutes || minutes <= 0) return;
    const today = new Date().toISOString().split('T')[0];
    const data = getData();
    let log = data.dailyLogs[today];
    if (!log) {
      const settings = getSettings();
      log = createDailyLog(buildDailyTasks(settings.targetExams[0] || 'CAT', today));
    }
    log.totalActual = (log.totalActual || 0) + minutes;
    data.dailyLogs[today] = log;
    updateStreak(data);
    checkAchievements(data);
    saveData(data);
  }

  function updateTaskStatus(taskId, status, actualTime = null) {
    const today = new Date().toISOString().split('T')[0];
    const data = getData();
    const log = data.dailyLogs[today];
    if (!log) return;

    const task = log.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      if (actualTime !== null) task.actualTime = actualTime;
      log.totalActual = log.tasks
        .filter(t => t.status === 'done')
        .reduce((s, t) => s + (t.actualTime || t.duration), 0);
    }

    updateStreak(data);
    checkAchievements(data);
    saveData(data);
    return log;
  }

  // ─── Weakness Tracking ───
  function updateWeakTopics(data, exam, section, topic, accuracy) {
    const existing = data.weakTopics.find(w => w.exam === exam && w.topic === topic);
    if (existing) {
      existing.occurrences++;
      existing.avgAccuracy = ((existing.avgAccuracy * (existing.occurrences - 1)) + accuracy) / existing.occurrences;
      existing.lastSeen = new Date().toISOString();
    } else {
      data.weakTopics.push({
        exam,
        section,
        topic,
        occurrences: 1,
        avgAccuracy: accuracy,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      });
    }
    // Sort by accuracy ascending (weakest first)
    data.weakTopics.sort((a, b) => a.avgAccuracy - b.avgAccuracy);
  }

  function getWeakTopics(exam = null) {
    const data = getData();
    if (exam) return data.weakTopics.filter(w => w.exam === exam);
    return data.weakTopics;
  }

  // ─── Streak ───
  function updateStreak(data) {
    const today = new Date().toISOString().split('T')[0];
    const todayLog = data.dailyLogs[today];
    const hasDoneTasks = todayLog?.tasks?.some(t => t.status === 'done');
    const hasMocks = data.mocks.some(m => m.dateStr === today);

    if (hasDoneTasks || hasMocks) {
      if (data.streakData.lastStudyDate === today) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (data.streakData.lastStudyDate === yesterdayStr) {
        data.streakData.current++;
      } else if (data.streakData.lastStudyDate !== today) {
        data.streakData.current = 1;
      }

      data.streakData.lastStudyDate = today;
      if (data.streakData.current > data.streakData.longest) {
        data.streakData.longest = data.streakData.current;
      }
    }
  }

  // ─── Achievements ───
  const ACHIEVEMENTS = [
    { id: 'first_mock', name: 'First Mock', desc: 'Completed your first mock test', icon: '🎯', check: d => d.mocks.length >= 1 },
    { id: 'streak_7', name: '7-Day Streak', desc: 'Studied 7 days in a row', icon: '🔥', check: d => d.streakData.current >= 7 },
    { id: 'streak_14', name: '14-Day Streak', desc: 'Studied 14 days in a row', icon: '💪', check: d => d.streakData.current >= 14 },
    { id: 'streak_30', name: '30-Day Streak', desc: '30 days of consistent study', icon: '🏆', check: d => d.streakData.current >= 30 },
    { id: 'accuracy_80', name: '80% Club', desc: 'Scored 80%+ accuracy in a mock', icon: '⭐', check: d => d.mocks.some(m => m.accuracy >= 80) },
    { id: 'accuracy_90', name: '90% Elite', desc: 'Scored 90%+ accuracy in a mock', icon: '💎', check: d => d.mocks.some(m => m.accuracy >= 90) },
    { id: 'ten_mocks', name: 'Dedicated', desc: 'Completed 10 mocks', icon: '📊', check: d => d.mocks.length >= 10 },
    { id: 'twenty_five_mocks', name: 'Mock Master', desc: 'Completed 25 mocks', icon: '🎓', check: d => d.mocks.length >= 25 },
    { id: 'fifty_mocks', name: 'Test Warrior', desc: 'Completed 50 mocks', icon: '⚔️', check: d => d.mocks.length >= 50 }
  ];

  function checkAchievements(data) {
    ACHIEVEMENTS.forEach(a => {
      if (!data.achievements.includes(a.id) && a.check(data)) {
        data.achievements.push(a.id);
      }
    });

    return ACHIEVEMENTS;
  }

  // ─── Revision Schedule ───
  function getRevisionsDue(dateStr = null) {
    if (!dateStr) dateStr = new Date().toISOString().split('T')[0];
    const data = getData();
    return data.revisionSchedule.filter(r => r.date <= dateStr && !r.done);
  }

  function markRevisionDone(revId) {
    const data = getData();
    const rev = data.revisionSchedule.find(r => r.id === revId);
    if (rev) rev.done = true;
    saveData(data);
  }

  // ─── Analytics Helpers ───
  function getExamStats(exam) {
    const mocks = getMocks({ exam });
    if (mocks.length === 0) return null;

    const avgAccuracy = mocks.reduce((s, m) => s + m.accuracy, 0) / mocks.length;
    const avgScore = mocks.reduce((s, m) => s + m.scorePercentage, 0) / mocks.length;
    const last5 = mocks.slice(-5);
    const last5Avg = last5.reduce((s, m) => s + m.accuracy, 0) / last5.length;
    const trend = mocks.length >= 2 ? mocks[mocks.length - 1].accuracy - mocks[mocks.length - 2].accuracy : 0;

    // Section-wise stats
    const sections = {};
    mocks.forEach(m => {
      if (!sections[m.section]) sections[m.section] = [];
      sections[m.section].push(m.accuracy);
    });

    const sectionStats = {};
    Object.entries(sections).forEach(([sec, accs]) => {
      sectionStats[sec] = {
        avg: Math.round((accs.reduce((a, b) => a + b, 0) / accs.length) * 100) / 100,
        count: accs.length,
        latest: accs[accs.length - 1],
        trend: accs.length >= 2 ? accs[accs.length - 1] - accs[accs.length - 2] : 0
      };
    });

    return {
      totalMocks: mocks.length,
      avgAccuracy: Math.round(avgAccuracy * 100) / 100,
      avgScore: Math.round(avgScore * 100) / 100,
      last5Avg: Math.round(last5Avg * 100) / 100,
      trend: Math.round(trend * 100) / 100,
      sectionStats,
      latestMock: mocks[mocks.length - 1],
      examReadiness: Math.min(100, Math.round(last5Avg * 1.1))
    };
  }

  // Aggregates the optional "main mistake type" field across mocks — points at
  // *why* marks are being lost (silly errors vs concept gaps vs time pressure),
  // not just which topic, using data already captured at entry time.
  function getMistakeTypeStats(exam) {
    const allMocks = getMocks({ exam });
    const logged = allMocks.filter(m => m.mistakeType);
    if (logged.length === 0) return null;

    const counts = {};
    logged.forEach(m => {
      counts[m.mistakeType] = (counts[m.mistakeType] || 0) + 1;
    });

    const breakdown = Object.entries(counts)
      .map(([type, count]) => ({ type, count, percentage: Math.round((count / logged.length) * 1000) / 10 }))
      .sort((a, b) => b.count - a.count);

    return {
      totalLogged: logged.length,
      totalMocks: allMocks.length,
      breakdown,
      topMistake: breakdown[0]
    };
  }

  function getStudyStats() {
    const data = getData();
    let totalMinutes = 0;
    let totalDays = 0;
    const weeklyMinutes = {};

    Object.entries(data.dailyLogs).forEach(([date, log]) => {
      const actual = log.totalActual || 0;
      if (actual > 0) {
        totalMinutes += actual;
        totalDays++;
      }

      // Weekly breakdown
      const d = new Date(date);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      const weekKey = getWeekKey(d);
      if (!weeklyMinutes[weekKey]) weeklyMinutes[weekKey] = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      weeklyMinutes[weekKey][dayName] += actual;
    });

    return {
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      totalDays,
      avgDaily: totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0,
      weeklyMinutes,
      streak: data.streakData
    };
  }

  function getWeekKey(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  }

  // ─── Resource Tracking ───
  function markResourceAttempted(resourceId, score, accuracy) {
    const data = getData();
    data.resourceAttempts[resourceId] = {
      date: new Date().toISOString().split('T')[0],
      score,
      accuracy
    };
    saveData(data);
  }

  function isResourceAttempted(resourceId) {
    const data = getData();
    return !!data.resourceAttempts[resourceId];
  }

  // ─── Error Log ───
  function addErrorLogEntry(entry) {
    const data = getData();
    data.errorLog.push({
      id: 'err_' + Date.now(),
      date: new Date().toISOString(),
      exam: entry.exam,
      section: entry.section,
      topic: entry.topic,
      note: entry.note,
      reminder: entry.reminder || `Revise ${entry.topic} tomorrow`,
      resolved: false
    });
    saveData(data);
  }

  function getErrorLog(exam = null) {
    const data = getData();
    let log = [...data.errorLog].reverse(); // most recent first
    if (exam) log = log.filter(e => e.exam === exam);
    return log;
  }

  function resolveErrorLogEntry(id) {
    const data = getData();
    const entry = data.errorLog.find(e => e.id === id);
    if (entry) entry.resolved = true;
    saveData(data);
  }

  // ─── Export / Import ───
  function exportJSON() {
    const data = getData();
    const settings = getSettings();
    const exportObj = { data, settings, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preptracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(jsonString) {
    try {
      const importObj = JSON.parse(jsonString);
      if (importObj.data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(importObj.data));
      }
      if (importObj.settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(importObj.settings));
      }
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  function exportCSV() {
    const mocks = getMocks();
    if (mocks.length === 0) return;

    const headers = ['Date', 'Exam', 'Type', 'Section', 'Score', 'Attempted', 'Correct', 'Incorrect', 'Accuracy%', 'AttemptRate%', 'ScorePercentage%', 'AvgTime/Q', 'WeakTopic', 'MistakeType', 'Readiness%'];
    const rows = mocks.map(m => [
      m.dateStr, m.exam, m.testType, m.section, m.score, m.attempted, m.correct,
      m.incorrect, m.accuracy, m.attemptRate, m.scorePercentage, m.avgTimePerQ,
      m.weakTopic || '', m.mistakeType || '', m.examReadiness
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(r => { csv += r.join(',') + '\n'; });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preptracker_mocks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Days Until Exam ───
  function getDaysUntilExam(examName) {
    const settings = getSettings();
    const dateStr = settings.examDates[examName];
    if (!dateStr) return null;

    const examDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  }

  // ─── Public API ───
  return {
    EXAM_CONFIG,
    TEST_TYPES,
    MISTAKE_TYPES,
    DEFAULT_ROADMAP_TEMPLATE,

    getData,
    saveData,
    getSettings,
    saveSettings,

    addMock,
    getMocks,
    getExamStats,
    getMistakeTypeStats,
    getStudyStats,

    getDailyLog,
    saveDailyLog,
    getTodayLog,
    saveTodayLog,
    createDailyLog,
    updateTaskStatus,
    addStudyMinutes,
    buildDailyTasks,
    getOrCreateTodayLog,
    getPendingFromYesterday,

    getWeakTopics,
    getRevisionsDue,
    markRevisionDone,

    markResourceAttempted,
    isResourceAttempted,

    addErrorLogEntry,
    getErrorLog,
    resolveErrorLogEntry,
    checkAchievements,
    ACHIEVEMENTS,

    exportJSON,
    importJSON,
    exportCSV,

    getDaysUntilExam
  };
})();
