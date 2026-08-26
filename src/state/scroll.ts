// Sections load above the viewport; hold the reading position steady.
export function keepScroll(fn: () => void): void {
  const el = document.scrollingElement || document.documentElement;
  const before = el.scrollHeight;
  const y = el.scrollTop;
  fn();
  requestAnimationFrame(() => {
    const delta = el.scrollHeight - before;
    if (delta) el.scrollTop = y + delta;
  });
}
