/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — Achievements Module
   Badge tracking was already computed in the data layer but never
   shown anywhere; this surfaces it via a sidebar counter + modal.
   ═══════════════════════════════════════════════════════════════ */

const Achievements = (() => {
  let previousEarned = null;

  function init() {
    const btn = document.getElementById('sidebar-achievements-btn');
    if (btn) btn.addEventListener('click', open);
    // Seed with whatever's already earned so the first refresh doesn't
    // "celebrate" badges the user already had before this page load.
    previousEarned = getEarnedIds(PrepData.getData());
    updateCountDisplay(previousEarned);
  }

  // Computed live against current data, independent of the stored
  // (possibly stale) achievements array — always reflects reality.
  function getEarnedIds(data) {
    return new Set(PrepData.ACHIEVEMENTS.filter(a => a.check(data)).map(a => a.id));
  }

  function updateCountDisplay(earned) {
    const el = document.getElementById('achievements-count');
    if (el) el.textContent = `${earned.size}/${PrepData.ACHIEVEMENTS.length}`;
  }

  function refreshCount() {
    const data = PrepData.getData();
    const earned = getEarnedIds(data);

    if (previousEarned) {
      const newlyEarned = [...earned].filter(id => !previousEarned.has(id));
      newlyEarned.forEach(celebrateUnlock);
    }

    previousEarned = earned;
    updateCountDisplay(earned);
  }

  function celebrateUnlock(id) {
    const achievement = PrepData.ACHIEVEMENTS.find(a => a.id === id);
    if (!achievement) return;
    Celebration.confetti();
    App.showToast('🎉 Achievement Unlocked!', `${achievement.icon} ${achievement.name} — ${achievement.desc}`, 'success', 6000);
  }

  function open() {
    const modal = document.getElementById('achievements-modal');
    const grid = document.getElementById('badge-grid');
    if (!modal || !grid) return;

    const data = PrepData.getData();
    const earned = getEarnedIds(data);

    grid.innerHTML = PrepData.ACHIEVEMENTS.map(a => {
      const isEarned = earned.has(a.id);
      return `
        <div class="badge-tile ${isEarned ? 'earned' : 'locked'}">
          <div class="badge-tile-icon">${isEarned ? a.icon : '🔒'}</div>
          <div class="badge-tile-name">${a.name}</div>
          <div class="badge-tile-desc">${a.desc}</div>
        </div>
      `;
    }).join('');

    modal.classList.add('active');
  }

  function close() {
    const modal = document.getElementById('achievements-modal');
    if (modal) modal.classList.remove('active');
  }

  return { init, open, close, refreshCount };
})();
