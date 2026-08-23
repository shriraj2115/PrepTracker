/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — Celebration Module
   A short confetti burst for genuinely earned moments (new badge,
   finishing the whole day's plan) — purely visual, no dependencies.
   ═══════════════════════════════════════════════════════════════ */

const Celebration = (() => {
  const COLORS = ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

  function confetti(count = 60) {
    const container = document.createElement('div');
    container.className = 'confetti-container';

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      piece.style.animationDelay = (Math.random() * 0.35) + 's';
      piece.style.animationDuration = (2 + Math.random() * 1.2) + 's';
      piece.style.setProperty('--rot', `${Math.round(Math.random() * 360)}deg`);
      container.appendChild(piece);
    }

    document.body.appendChild(container);
    setTimeout(() => container.remove(), 3600);
  }

  return { confetti };
})();
