const ACTIVE_LINK_CLASSES = ["bg-brand-100/70"];
const ACTIVE_LABEL_CLASSES = ["font-semibold", "text-brand-950"];
const ACTIVE_COUNT_CLASSES = ["text-brand-950"];
const INACTIVE_LABEL_CLASSES = ["font-medium", "text-brand-700"];
const INACTIVE_COUNT_CLASSES = ["text-brand-700"];

function setActiveLink(nav: HTMLElement, id: string | null): void {
  for (const link of nav.querySelectorAll<HTMLAnchorElement>("a[data-month-id]")) {
    const isActive = link.dataset.monthId === id;
    link.classList.toggle(ACTIVE_LINK_CLASSES[0], isActive);

    const label = link.querySelector<HTMLElement>("[data-role='label']");
    const count = link.querySelector<HTMLElement>("[data-role='count']");
    if (label) {
      label.classList.toggle(ACTIVE_LABEL_CLASSES[0], isActive);
      label.classList.toggle(ACTIVE_LABEL_CLASSES[1], isActive);
      label.classList.toggle(INACTIVE_LABEL_CLASSES[0], !isActive);
      label.classList.toggle(INACTIVE_LABEL_CLASSES[1], !isActive);
    }
    if (count) {
      count.classList.toggle(ACTIVE_COUNT_CLASSES[0], isActive);
      count.classList.toggle(INACTIVE_COUNT_CLASSES[0], !isActive);
    }
  }
}

// Tracks which month section is most visible in the viewport and highlights
// the matching nav link, without triggering a full re-render on scroll.
export function observeActiveMonth(sections: HTMLElement[], nav: HTMLElement): () => void {
  if (sections.length === 0) return () => {};

  const visible = new Map<string, number>();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).id;
        if (entry.isIntersecting) {
          visible.set(id, entry.intersectionRatio);
        } else {
          visible.delete(id);
        }
      }

      let bestId: string | null = null;
      let bestRatio = 0;
      for (const [id, ratio] of visible) {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      }
      if (bestId) setActiveLink(nav, bestId);
    },
    { rootMargin: "-15% 0px -70% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
  );

  for (const section of sections) observer.observe(section);

  return () => observer.disconnect();
}
