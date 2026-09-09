'use strict';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('#motion');
let paused = reducedMotion.matches;
function setMotion() {
  document.body.classList.toggle('paused', paused);
  document.body.classList.toggle('motion-enabled', !paused);
  if (motionButton) {
    motionButton.textContent = paused ? 'Enable motion' : 'Pause motion';
    motionButton.setAttribute('aria-pressed', String(paused));
  }
  updateScroll();
}
motionButton?.addEventListener('click', () => { paused = !paused; setMotion(); });
reducedMotion.addEventListener('change', event => { paused = event.matches; setMotion(); });
const words = [...document.querySelectorAll('.scroll-copy span')];
let ticking = false;
function updateScroll() {
  for (const word of words) {
    const rect = word.getBoundingClientRect();
    word.classList.toggle('lit', paused || rect.top < window.innerHeight * 0.74);
  }
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking && !paused) { ticking = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
window.addEventListener('resize', updateScroll);
setMotion();
const waveform = document.querySelector('.waveform');
for (let i = 0; waveform && i < 35; i++) {
  const bar = document.createElement('i');
  const height = 12 + Math.abs(Math.sin(i * 1.72)) * 65 * Math.sin((i + 1) / 36 * Math.PI);
  bar.style.setProperty('--h', `${height}px`);
  bar.style.setProperty('--delay', `${-i * 0.12}s`);
  waveform.append(bar);
}
document.querySelectorAll('.copy').forEach(button => {
  button.addEventListener('click', async () => {
    const container = button.closest('.prompt-card, .practice-option');
    const prompt = container.querySelector('.prompt-text, .mode-prompt');
    const status = container.matches('.practice-option') ? document.querySelector('#launcher-copy-status') : document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(prompt.textContent.trim());
      button.textContent = 'Copied ✓';
      status.textContent = 'Prompt copied. Open OrthoSG GPT and paste it into the message box.';
      setTimeout(() => { button.textContent = 'Copy ↗'; }, 2500);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(prompt);
      selection.removeAllRanges(); selection.addRange(range);
      status.textContent = 'Clipboard access is unavailable. The prompt is selected: use Copy from your device’s selection menu, or press Ctrl+C / Cmd+C.';
    }
  });
});
