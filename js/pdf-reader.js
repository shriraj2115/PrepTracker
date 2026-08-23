/* ═══════════════════════════════════════════════════════════════
   PREPTRACKER — PDF Reader Module
   Opens bundled PYQ papers (and their solutions) inside the app,
   in the same window — never kicks out to an external viewer/tab.
   ═══════════════════════════════════════════════════════════════ */

const PdfReader = (() => {
  function open(url, title) {
    const modal = document.getElementById('pdf-reader-modal');
    const frame = document.getElementById('pdf-reader-frame');
    const titleEl = document.getElementById('pdf-reader-title');
    if (!modal || !frame) return;

    frame.src = url;
    if (titleEl) titleEl.textContent = `📄 ${title || 'Document'}`;
    modal.classList.add('active');
    modal.querySelector('.pdf-reader-modal')?.classList.remove('fullscreen');
    const fsBtn = document.getElementById('pdf-reader-fullscreen-btn');
    if (fsBtn) { fsBtn.textContent = '⛶'; fsBtn.title = 'Fullscreen'; }
  }

  function close() {
    const modal = document.getElementById('pdf-reader-modal');
    const frame = document.getElementById('pdf-reader-frame');
    if (modal) modal.classList.remove('active');
    if (frame) frame.src = ''; // stop rendering once closed
  }

  function toggleFullscreen() {
    const dialog = document.querySelector('#pdf-reader-modal .pdf-reader-modal');
    const fsBtn = document.getElementById('pdf-reader-fullscreen-btn');
    if (!dialog) return;
    const isFullscreen = dialog.classList.toggle('fullscreen');
    if (fsBtn) {
      fsBtn.textContent = isFullscreen ? '⤢' : '⛶';
      fsBtn.title = isFullscreen ? 'Exit fullscreen' : 'Fullscreen';
    }
  }

  return { open, close, toggleFullscreen };
})();
