// Mirrors a small set of filter/selection values into the URL query string so a
// filtered view is shareable and survives back/reload. Never touches history depth:
// always replaceState, so filtering never fills up the back-button stack.

export function readParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

export function writeParams(entries: Record<string, string | null | undefined>): void {
  const params = readParams();
  for (const [key, value] of Object.entries(entries)) {
    if (value === null || value === undefined || value === "") params.delete(key);
    else params.set(key, value);
  }
  const query = params.toString();
  const url = query ? `${window.location.pathname}?${query}${window.location.hash}` : `${window.location.pathname}${window.location.hash}`;
  history.replaceState(null, "", url);
}
