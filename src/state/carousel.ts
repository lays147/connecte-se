const CAROUSEL_SECONDS = 7;

export function startCarousel(getFeaturedCount: () => number, advance: () => void): () => void {
  const timer = window.setInterval(() => {
    if (getFeaturedCount() > 1) advance();
  }, CAROUSEL_SECONDS * 1000);
  return () => window.clearInterval(timer);
}
