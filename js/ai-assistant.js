/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — AI Assistant Module
   Optional, opt-in only — uses the user's own OpenRouter API key
   (Settings → AI Assistant). Every call costs real money from their
   OpenRouter balance, so nothing here fires automatically; it only
   runs when the user explicitly clicks a button.
   ═══════════════════════════════════════════════════════════════ */

const AIAssistant = (() => {
  async function callOpenRouter(systemPrompt, userPrompt) {
    const settings = PrepData.getSettings();
    const apiKey = settings.openRouterApiKey;

    if (!apiKey) {
      App.showToast('🤖 AI Not Configured', 'Add your OpenRouter API key in Settings first', 'warning');
      return null;
    }

    const model = settings.openRouterModel || 'openai/gpt-4o-mini';

    try {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-Title': 'PrepTracker'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 350
        })
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        console.error('OpenRouter error:', resp.status, errText);
        App.showToast('🤖 AI Request Failed', `Error ${resp.status} — check your API key and model in Settings`, 'error');
        return null;
      }

      const json = await resp.json();
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) {
        App.showToast('🤖 AI Request Failed', 'Empty response from the model', 'error');
        return null;
      }
      return text;
    } catch (e) {
      console.error('OpenRouter fetch failed:', e);
      App.showToast('🤖 AI Request Failed', 'Network error — check your connection', 'error');
      return null;
    }
  }

  // ─── Explain a logged mistake ───
  async function explainMistake(entryId, btnEl) {
    const data = PrepData.getData();
    const entry = data.errorLog.find(e => e.id === entryId);
    if (!entry) return;

    const responseEl = document.getElementById(`ai-response-${entryId}`);
    const original = btnEl.textContent;
    btnEl.textContent = '⏳';
    btnEl.disabled = true;

    const systemPrompt = 'You are a concise, encouraging exam prep tutor for competitive exams like CAT. Explain the likely root cause and one specific, actionable fix in under 100 words. No generic advice like "practice more" — be specific to the mistake described.';
    const userPrompt = `Exam: ${entry.exam}, Section: ${entry.section}, Topic: ${entry.topic}\nStudent's note about the mistake: "${entry.note}"\n\nWhy does this kind of mistake happen, and what specific fix should they practice?`;

    const result = await callOpenRouter(systemPrompt, userPrompt);

    btnEl.disabled = false;
    btnEl.textContent = original;

    if (result && responseEl) {
      responseEl.style.display = 'block';
      responseEl.innerHTML = `
        <div style="display:flex;align-items:flex-start;gap:8px;padding:10px;margin-top:6px;background:var(--accent-primary-light);border-radius:8px;border-left:3px solid var(--accent-primary);">
          <span style="font-size:14px;flex-shrink:0">🤖</span>
          <span style="font-size:12px;color:var(--text-primary);line-height:1.5">${result}</span>
        </div>
      `;
    }
  }

  // ─── Personalized insight from real performance data ───
  async function generateInsight(btnEl) {
    const settings = PrepData.getSettings();
    const primaryExam = settings.targetExams[0] || 'CAT';
    const examStats = PrepData.getExamStats(primaryExam);

    if (!examStats) {
      App.showToast('Not Enough Data', 'Log a few mocks first so there\'s something to analyze', 'warning');
      return;
    }

    const weakTopics = PrepData.getWeakTopics(primaryExam).slice(0, 5);
    const mistakeStats = PrepData.getMistakeTypeStats(primaryExam);
    const studyStats = PrepData.getStudyStats();

    const original = btnEl.textContent;
    btnEl.textContent = '⏳ Thinking...';
    btnEl.disabled = true;

    const systemPrompt = `You are a sharp, encouraging exam prep coach for ${primaryExam}. Given this student's real performance data (as JSON), write ONE specific, personalized, actionable insight in 2-3 sentences. Reference their actual numbers. No generic advice.`;
    const userPrompt = JSON.stringify({
      avgAccuracy: examStats.avgAccuracy,
      recentTrend: examStats.trend,
      last5MockAvg: examStats.last5Avg,
      sectionAccuracy: examStats.sectionStats,
      weakestTopics: weakTopics.map(w => ({ topic: w.topic, avgAccuracy: Math.round(w.avgAccuracy) })),
      topMistakeType: mistakeStats ? mistakeStats.topMistake : null,
      studyStreakDays: studyStats.streak.current,
      totalStudyHours: studyStats.totalHours
    });

    const result = await callOpenRouter(systemPrompt, userPrompt);

    btnEl.disabled = false;
    btnEl.textContent = original;

    if (result) {
      const box = document.getElementById('ai-insight-box');
      if (box) {
        box.style.display = 'block';
        box.innerHTML = `
          <div style="display:flex;align-items:flex-start;gap:10px;padding:12px;background:var(--accent-primary-light);border-radius:8px;border-left:3px solid var(--accent-primary);">
            <span style="font-size:18px;flex-shrink:0">🤖</span>
            <span style="font-size:13px;color:var(--text-primary);line-height:1.5">${result}</span>
          </div>
        `;
      }
    }
  }

  return { explainMistake, generateInsight };
})();
