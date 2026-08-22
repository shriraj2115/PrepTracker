/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — Achievements Module
   Badge tracking was already computed in the data layer but never
   shown anywhere; this surfaces it via a sidebar counter + modal.
   ═══════════════════════════════════════════════════════════════ */

const Achievements = (() => {
  function init() {
    const btn = document.getElementById('sidebar-achievements-btn');
    if (btn) btn.addEventListener('click', open);
    refreshCount();
  }

  // Computed live against current data, independent of the stored
  // (possibly stale) achievements array — always reflects reality.
  function getEarnedIds(data) {
    return new Set(PrepData.ACHIEVEMENTS.filter(a => a.check(data)).map(a => a.id));
  }

  function refreshCount() {
    const el = document.getElementById('achievements-count');
    if (!el) return;
    const data = PrepData.getData();
    const earned = getEarnedIds(data);
    el.textContent = `${earned.size}/${PrepData.ACHIEVEMENTS.length}`;
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
