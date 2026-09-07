const CAROUSEL_SECONDS = 7;

export interface CarouselController {
  /** Explicit pause, e.g. from a user-facing pause/play button. Persists until resume() is called. */
  pause: () => void;
  resume: () => void;
  /** Transient pause while the pointer or keyboard focus is on the carousel. */
  setHovering: (hovering: boolean) => void;
  isPaused: () => boolean;
  stop: () => void;
}

export function startCarousel(getFeaturedCount: () => number, advance: () => void): CarouselController {
  let timer: number | null = null;
  let userPaused = false;
  let hovering = false;

  function tick(): void {
    if (getFeaturedCount() > 1) advance();
  }

  function sync(): void {
    const shouldRun = !userPaused && !hovering && document.visibilityState === "visible";
    if (shouldRun && timer === null) {
      timer = window.setInterval(tick, CAROUSEL_SECONDS * 1000);
    } else if (!shouldRun && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  document.addEventListener("visibilitychange", sync);
  sync();

  return {
    pause: () => {
      userPaused = true;
      sync();
    },
    resume: () => {
      userPaused = false;
      sync();
    },
    setHovering: (value: boolean) => {
      hovering = value;
      sync();
    },
    isPaused: () => userPaused,
    stop: () => {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
      document.removeEventListener("visibilitychange", sync);
    },
  };
}
